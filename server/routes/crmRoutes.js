import express from "express";
import {
  createCustomer,
  createProduct,
  createTransaction,
  getCustomerDetail,
  getCustomers,
  getDashboard,
  getProducts,
  getTransactions,
} from "../controllers/crmController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.get("/dashboard", getDashboard);

router.post("/customers", createCustomer);
router.get("/customers", getCustomers);
router.get("/customers/:id", getCustomerDetail);

router.post("/transactions", createTransaction);
router.get("/transactions", getTransactions);

router.post("/products", createProduct);
router.get("/products", getProducts);

export default router;
