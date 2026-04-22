import mongoose from "mongoose";

const projectSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Client"
  },
  title: String,
  description: String,
  status: {
    type: String,
    enum: ["lead", "proposal", "active", "completed"],
    default: "lead"
  }
}, { timestamps: true });

export default mongoose.model("Project", projectSchema);