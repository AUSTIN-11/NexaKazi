import { apiRequest } from "../../../services/api";
import {
  createTempId,
  enqueueSyncAction,
  getCachedCustomerDetail,
  getCachedCustomers,
  getCachedDashboard,
  getCachedProducts,
  getCachedTransactions,
  getSyncQueue,
  removeSyncAction,
  replaceCollectionItem,
  replaceQueueReferences,
  setCachedCustomerDetail,
  setCachedCustomers,
  setCachedDashboard,
  setCachedProducts,
  setCachedTransactions,
  upsertCollectionItem,
} from "./crmStorage";

function isNetworkError(error) {
  return !error?.status;
}

function nowIso() {
  return new Date().toISOString();
}

function sumBy(items, predicate) {
  return items.reduce((total, item) => total + predicate(item), 0);
}

function normalizeRecentTransaction(transaction) {
  return {
    ...transaction,
    customerId:
      typeof transaction.customerId === "string"
        ? { _id: transaction.customerId, name: transaction.customerName || "Customer" }
        : transaction.customerId,
  };
}

function refreshDashboardCacheFromLocalState() {
  const customers = getCachedCustomers();
  const transactions = getCachedTransactions();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const dashboard = {
    totalSales: sumBy(transactions, (transaction) =>
      transaction.type === "sale" ? Number(transaction.amount) : 0
    ),
    totalDebt: sumBy(customers, (customer) =>
      customer.balance > 0 ? Number(customer.balance) : 0
    ),
    todaysSales: sumBy(transactions, (transaction) => {
      const createdAt = new Date(transaction.createdAt);
      return transaction.type === "sale" && createdAt >= today
        ? Number(transaction.amount)
        : 0;
    }),
    customerCount: customers.length,
    productCount: getCachedProducts().length,
    recentTransactions: transactions.slice(0, 5).map(normalizeRecentTransaction),
  };

  setCachedDashboard(dashboard);
  return dashboard;
}

function cacheCustomerDetail(customer, transactions) {
  setCachedCustomerDetail(customer._id, { customer, transactions });
}

function syncCustomerIdAcrossCaches(tempId, persistedCustomer) {
  const customers = replaceCollectionItem(getCachedCustomers(), tempId, persistedCustomer);
  setCachedCustomers(customers);

  const detail = getCachedCustomerDetail(tempId);
  if (detail) {
    const persistedDetail = {
      customer: persistedCustomer,
      transactions: detail.transactions.map((transaction) => ({
        ...transaction,
        customerId:
          transaction.customerId === tempId ? persistedCustomer._id : transaction.customerId,
      })),
    };
    setCachedCustomerDetail(persistedCustomer._id, persistedDetail);
    setCachedCustomerDetail(tempId, persistedDetail);
  }

  const transactions = getCachedTransactions().map((transaction) => ({
    ...transaction,
    customerId: transaction.customerId === tempId ? persistedCustomer._id : transaction.customerId,
    customerName:
      transaction.customerId === tempId
        ? persistedCustomer.name
        : transaction.customerName,
  }));

  setCachedTransactions(transactions);
  replaceQueueReferences(tempId, persistedCustomer._id);
  refreshDashboardCacheFromLocalState();
}

async function queueOrThrow(action, fallbackFactory) {
  if (!navigator.onLine) {
    return fallbackFactory();
  }

  try {
    return await action();
  } catch (error) {
    if (isNetworkError(error)) {
      return fallbackFactory();
    }

    throw error;
  }
}

export async function syncCrmQueue() {
  if (!navigator.onLine) {
    return { synced: 0, pending: getSyncQueue().length };
  }

  const queue = [...getSyncQueue()];
  let synced = 0;

  for (const item of queue) {
    try {
      const response = await apiRequest(item.path, {
        method: item.method,
        body: JSON.stringify(item.body),
      });

      if (item.kind === "customer.create") {
        syncCustomerIdAcrossCaches(item.localId, response);
      }

      if (item.kind === "transaction.create") {
        mergeTransactionCaches(response.transaction, response.customer);
      }

      if (item.kind === "product.create") {
        mergeProductCache(response);
      }

      removeSyncAction(item.id);
      synced += 1;
    } catch (error) {
      if (isNetworkError(error)) {
        break;
      }

      removeSyncAction(item.id);
    }
  }

  refreshDashboardCacheFromLocalState();

  return { synced, pending: getSyncQueue().length };
}

export async function getDashboard() {
  const cached = getCachedDashboard();

  try {
    const dashboard = await apiRequest("/crm/dashboard");
    setCachedDashboard(dashboard);
    return dashboard;
  } catch (error) {
    if (cached) {
      return cached;
    }

    throw error;
  }
}

export async function getCustomers(search = "") {
  const cached = getCachedCustomers();
  const query = search ? `?q=${encodeURIComponent(search)}` : "";

  try {
    const customers = await apiRequest(`/crm/customers${query}`);
    setCachedCustomers(customers);
    return customers;
  } catch (error) {
    if (cached.length) {
      const normalizedSearch = search.trim().toLowerCase();
      if (!normalizedSearch) {
        return cached;
      }

      return cached.filter((customer) =>
        [customer.name, customer.phone]
          .filter(Boolean)
          .some((value) => value.toLowerCase().includes(normalizedSearch))
      );
    }

    throw error;
  }
}

export async function getCustomerDetail(customerId) {
  const cached = getCachedCustomerDetail(customerId);

  try {
    const detail = await apiRequest(`/crm/customers/${customerId}`);
    cacheCustomerDetail(detail.customer, detail.transactions);
    return detail;
  } catch (error) {
    if (cached) {
      return cached;
    }

    throw error;
  }
}

export async function getProducts() {
  const cached = getCachedProducts();

  try {
    const products = await apiRequest("/crm/products");
    setCachedProducts(products);
    refreshDashboardCacheFromLocalState();
    return products;
  } catch (error) {
    if (cached.length) {
      return cached;
    }

    throw error;
  }
}

function mergeCustomerCache(customer) {
  const nextCustomers = upsertCollectionItem(getCachedCustomers(), customer);
  setCachedCustomers(nextCustomers);
  cacheCustomerDetail(customer, getCachedCustomerDetail(customer._id)?.transactions || []);
  refreshDashboardCacheFromLocalState();
}

function mergeProductCache(product) {
  setCachedProducts(upsertCollectionItem(getCachedProducts(), product));
  refreshDashboardCacheFromLocalState();
}

function mergeTransactionCaches(transaction, customer) {
  const normalizedTransaction = {
    ...transaction,
    customerId: transaction.customerId || customer?._id,
    customerName: customer?.name,
  };

  setCachedTransactions(upsertCollectionItem(getCachedTransactions(), normalizedTransaction));

  if (customer) {
    const customers = getCachedCustomers().map((item) =>
      item._id === customer._id ? customer : item
    );
    setCachedCustomers(customers);

    const detail = getCachedCustomerDetail(customer._id) || {
      customer,
      transactions: [],
    };

    setCachedCustomerDetail(customer._id, {
      customer,
      transactions: upsertCollectionItem(detail.transactions, normalizedTransaction),
    });
  }

  refreshDashboardCacheFromLocalState();
}

export async function createCustomer(payload) {
  return queueOrThrow(
    async () => {
      const customer = await apiRequest("/crm/customers", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      mergeCustomerCache(customer);
      return { customer, queued: false };
    },
    () => {
      const customer = {
        _id: createTempId("customer"),
        name: payload.name.trim(),
        phone: payload.phone?.trim() || "",
        balance: 0,
        createdAt: nowIso(),
        updatedAt: nowIso(),
        isPendingSync: true,
      };

      mergeCustomerCache(customer);

      enqueueSyncAction({
        id: createTempId("queue"),
        kind: "customer.create",
        localId: customer._id,
        method: "POST",
        path: "/crm/customers",
        body: payload,
      });

      return { customer, queued: true };
    }
  );
}

export async function createTransaction(payload) {
  return queueOrThrow(
    async () => {
      const result = await apiRequest("/crm/transactions", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      mergeTransactionCaches(result.transaction, result.customer);
      return { ...result, queued: false };
    },
    () => {
      const customer = getCachedCustomers().find((item) => item._id === payload.customerId);
      const balanceDelta =
        payload.type === "sale" ? Number(payload.amount) : -Number(payload.amount);
      const updatedCustomer = customer
        ? {
            ...customer,
            balance: Number(customer.balance || 0) + balanceDelta,
            isPendingSync: customer.isPendingSync || true,
          }
        : null;

      if (updatedCustomer) {
        mergeCustomerCache(updatedCustomer);
      }

      const transaction = {
        _id: createTempId("transaction"),
        customerId: payload.customerId,
        customerName: customer?.name || "Customer",
        type: payload.type,
        amount: Number(payload.amount),
        status: payload.status || (payload.type === "payment" ? "paid" : "unpaid"),
        paymentMethod: payload.paymentMethod || "cash",
        createdAt: nowIso(),
        isPendingSync: true,
      };

      mergeTransactionCaches(transaction, updatedCustomer);

      enqueueSyncAction({
        id: createTempId("queue"),
        kind: "transaction.create",
        method: "POST",
        path: "/crm/transactions",
        body: payload,
      });

      return { transaction, customer: updatedCustomer, queued: true };
    }
  );
}

export async function createProduct(payload) {
  return queueOrThrow(
    async () => {
      const product = await apiRequest("/crm/products", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      mergeProductCache(product);
      return { product, queued: false };
    },
    () => {
      const product = {
        _id: createTempId("product"),
        ...payload,
        price: Number(payload.price),
        stock: Number(payload.stock),
        createdAt: nowIso(),
        isPendingSync: true,
      };

      mergeProductCache(product);

      enqueueSyncAction({
        id: createTempId("queue"),
        kind: "product.create",
        method: "POST",
        path: "/crm/products",
        body: payload,
      });

      return { product, queued: true };
    }
  );
}
