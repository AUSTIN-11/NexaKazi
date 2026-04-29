const STORAGE_PREFIX = "mzigoflow_crm";

const storageKeys = {
  customers: `${STORAGE_PREFIX}_customers`,
  products: `${STORAGE_PREFIX}_products`,
  dashboard: `${STORAGE_PREFIX}_dashboard`,
  transactions: `${STORAGE_PREFIX}_transactions`,
  queue: `${STORAGE_PREFIX}_queue`,
};

function readJson(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function getCachedCustomers() {
  return readJson(storageKeys.customers, []);
}

export function setCachedCustomers(customers) {
  writeJson(storageKeys.customers, customers);
}

export function getCachedCustomerDetail(id) {
  return readJson(`${STORAGE_PREFIX}_customer_${id}`, null);
}

export function setCachedCustomerDetail(id, detail) {
  writeJson(`${STORAGE_PREFIX}_customer_${id}`, detail);
}

export function removeCachedCustomerDetail(id) {
  localStorage.removeItem(`${STORAGE_PREFIX}_customer_${id}`);
}

export function getCachedProducts() {
  return readJson(storageKeys.products, []);
}

export function setCachedProducts(products) {
  writeJson(storageKeys.products, products);
}

export function getCachedDashboard() {
  return readJson(storageKeys.dashboard, null);
}

export function setCachedDashboard(dashboard) {
  writeJson(storageKeys.dashboard, dashboard);
}

export function getCachedTransactions() {
  return readJson(storageKeys.transactions, []);
}

export function setCachedTransactions(transactions) {
  writeJson(storageKeys.transactions, transactions);
}

export function getSyncQueue() {
  return readJson(storageKeys.queue, []);
}

export function setSyncQueue(queue) {
  writeJson(storageKeys.queue, queue);
}

export function enqueueSyncAction(action) {
  const queue = getSyncQueue();
  queue.push(action);
  setSyncQueue(queue);
  return action;
}

export function removeSyncAction(id) {
  const queue = getSyncQueue().filter((item) => item.id !== id);
  setSyncQueue(queue);
}

export function replaceQueueReferences(tempId, nextId) {
  const queue = getSyncQueue().map((item) => {
    if (item.body?.customerId === tempId) {
      return {
        ...item,
        body: {
          ...item.body,
          customerId: nextId,
        },
      };
    }

    return item;
  });

  setSyncQueue(queue);
}

export function upsertCollectionItem(items, nextItem) {
  const filtered = items.filter((item) => item._id !== nextItem._id);
  return [nextItem, ...filtered];
}

export function replaceCollectionItem(items, currentId, nextItem) {
  return items.map((item) => (item._id === currentId ? nextItem : item));
}

export function createTempId(prefix) {
  return `temp-${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
