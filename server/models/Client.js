import mongoose from "mongoose";

const clientSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  name: String,
  email: String,
  phone: String,
  notes: String
}, { timestamps: true });

export default mongoose.model("Client", clientSchema);

// user: ObjectId