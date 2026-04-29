import mongoose from "mongoose";
import Customer from "../models/Customer.js";
import Product from "../models/Product.js";
import Transaction from "../models/Transaction.js";

function normalizeAmount(value) {
  const amount = Number(value);
  return Number.isFinite(amount) ? amount : NaN;
}

function getStatusForTransaction(type, status) {
  if (status === "paid" || status === "unpaid") {
    return status;
  }
  return type === "payment" ? "paid" : "unpaid";
}

function dayRange() {
  const start = new Date();
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(end.getDate() + 1);

  return { start, end };
}

export async function createCustomer(req, res) {
  try {
    const name = req.body.name?.trim();
    const phone = req.body.phone?.trim() || "";

    if (!name) {
      return res.status(400).json({ 
        message: "Customer name is required",
        code: "MISSING_NAME"
      });
    }

    const customer = await Customer.create({
      userId: req.user.id,
      name,
      phone,
      balance: 0,
    });

    return res.status(201).json({
      message: "Customer created successfully",
      data: customer
    });
  } catch (error) {
    console.error("Create customer error:", error.message);
    return res.status(500).json({ 
      message: "Failed to create customer",
      code: "CREATE_CUSTOMER_ERROR"
    });
  }
}

export async function getCustomers(req, res) {
  try {
    const query = req.query.q?.trim();
    const filter = { userId: req.user.id };

    if (query) {
      filter.$or = [
        { name: { $regex: query, $options: "i" } },
        { phone: { $regex: query, $options: "i" } },
      ];
    }

    const customers = await Customer.find(filter).sort({
      updatedAt: -1,
      createdAt: -1,
    });

    return res.json({
      message: "Customers retrieved successfully",
      data: customers,
      count: customers.length
    });
  } catch (error) {
    console.error("Get customers error:", error.message);
    return res.status(500).json({ 
      message: "Failed to fetch customers",
      code: "FETCH_CUSTOMERS_ERROR"
    });
  }
}

export async function getCustomerDetail(req, res) {
  try {
    const customer = await Customer.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!customer) {
      return res.status(404).json({ 
        message: "Customer not found",
        code: "CUSTOMER_NOT_FOUND"
      });
    }

    const transactions = await Transaction.find({
      userId: req.user.id,
      customerId: customer._id,
    }).sort({ createdAt: -1 });

    return res.json({
      message: "Customer detail retrieved successfully",
      data: { customer, transactions }
    });
  } catch (error) {
    console.error("Get customer detail error:", error.message);
    return res.status(500).json({ 
      message: "Failed to fetch customer detail",
      code: "FETCH_CUSTOMER_ERROR"
    });
  }
}

export async function createTransaction(req, res) {
  try {
    const { customerId, paymentMethod } = req.body;
    const type = req.body.type?.trim();
    const amount = normalizeAmount(req.body.amount);

    if (!customerId || !["sale", "payment"].includes(type) || !amount || amount < 0) {
      return res.status(400).json({ 
        message: "Invalid transaction payload",
        code: "INVALID_TRANSACTION"
      });
    }

    const customer = await Customer.findOne({
      _id: customerId,
      userId: req.user.id,
    });

    if (!customer) {
      return res.status(404).json({ 
        message: "Customer not found",
        code: "CUSTOMER_NOT_FOUND"
      });
    }

    const transaction = await Transaction.create({
      userId: req.user.id,
      customerId: customer._id,
      type,
      amount,
      status: getStatusForTransaction(type, req.body.status),
      paymentMethod: paymentMethod?.trim() || "cash",
    });

    const balanceChange = type === "sale" ? amount : -amount;
    customer.balance += balanceChange;
    await customer.save();

    return res.status(201).json({
      message: "Transaction created successfully",
      data: { transaction, customer }
    });
  } catch (error) {
    console.error("Create transaction error:", error.message);
    return res.status(500).json({ 
      message: "Failed to create transaction",
      code: "CREATE_TRANSACTION_ERROR"
    });
  }
}

export async function getTransactions(req, res) {
  try {
    const transactions = await Transaction.find({ userId: req.user.id })
      .populate("customerId", "name phone balance")
      .sort({ createdAt: -1 });

    return res.json({
      message: "Transactions retrieved successfully",
      data: transactions,
      count: transactions.length
    });
  } catch (error) {
    console.error("Get transactions error:", error.message);
    return res.status(500).json({ 
      message: "Failed to fetch transactions",
      code: "FETCH_TRANSACTIONS_ERROR"
    });
  }
}

export async function getDashboard(req, res) {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);
    const { start, end } = dayRange();

    const [salesSummary, debtSummary, todaySalesSummary, customerCount, productCount] =
      await Promise.all([
        Transaction.aggregate([
          { $match: { userId, type: "sale" } },
          { $group: { _id: null, total: { $sum: "$amount" } } },
        ]),
        Customer.aggregate([
          { $match: { userId } },
          {
            $group: {
              _id: null,
              total: {
                $sum: {
                  $cond: [{ $gt: ["$balance", 0] }, "$balance", 0],
                },
              },
            },
          },
        ]),
        Transaction.aggregate([
          {
            $match: {
              userId,
              type: "sale",
              createdAt: { $gte: start, $lt: end },
            },
          },
          { $group: { _id: null, total: { $sum: "$amount" } } },
        ]),
        Customer.countDocuments({ userId }),
        Product.countDocuments({ userId }),
      ]);

    const recentTransactions = await Transaction.find({ userId })
      .populate("customerId", "name")
      .sort({ createdAt: -1 })
      .limit(5);

    return res.json({
      message: "Dashboard data retrieved successfully",
      data: {
        totalSales: salesSummary[0]?.total || 0,
        totalDebt: debtSummary[0]?.total || 0,
        todaysSales: todaySalesSummary[0]?.total || 0,
        customerCount,
        productCount,
        recentTransactions,
      }
    });
  } catch (error) {
    console.error("Get dashboard error:", error.message);
    return res.status(500).json({ 
      message: "Failed to fetch dashboard data",
      code: "FETCH_DASHBOARD_ERROR"
    });
  }
}

export async function createProduct(req, res) {
  try {
    const name = req.body.name?.trim();
    const price = normalizeAmount(req.body.price);
    const stock = normalizeAmount(req.body.stock);

    if (!name || Number.isNaN(price) || Number.isNaN(stock) || price < 0 || stock < 0) {
      return res.status(400).json({ 
        message: "Invalid product payload",
        code: "INVALID_PRODUCT"
      });
    }

    const product = await Product.create({
      userId: req.user.id,
      name,
      price,
      stock,
    });

    return res.status(201).json({
      message: "Product created successfully",
      data: product
    });
  } catch (error) {
    console.error("Create product error:", error.message);
    return res.status(500).json({ 
      message: "Failed to create product",
      code: "CREATE_PRODUCT_ERROR"
    });
  }
}

export async function getProducts(req, res) {
  try {
    const products = await Product.find({ userId: req.user.id }).sort({
      createdAt: -1,
    });

    return res.json({
      message: "Products retrieved successfully",
      data: products,
      count: products.length
    });
  } catch (error) {
    console.error("Get products error:", error.message);
    return res.status(500).json({ 
      message: "Failed to fetch products",
      code: "FETCH_PRODUCTS_ERROR"
    });
  }
}
