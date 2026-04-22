import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js";
import { protect } from "./middleware/authMiddleware.js";
import clientRoutes from "./routes/clientRoutes.js";
import projectRoutes from "./routes/projectRoutes.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());


mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("DB connected"))
  .catch(err => console.log(err));

app.get("/", (req, res) => {
  res.send("NexaKazi API running");
});

app.listen(5000, () => console.log("Server running on port 5000"));

app.use("/api/auth", authRoutes);

app.use("/api/clients", clientRoutes);

app.use("/api/projects", projectRoutes);

app.get("/api/protected", protect, (req, res) => {
  res.json({ message: "Access granted", user: req.user });
});



