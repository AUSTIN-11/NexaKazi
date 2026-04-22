import express from "express";
import {
  createClient,
  getClients,
  updateClient,
  deleteClient
} from "../controllers/clientController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, createClient);
router.get("/", protect, getClients);
router.put("/:id", protect, updateClient);
router.delete("/:id", protect, deleteClient);

export default router;