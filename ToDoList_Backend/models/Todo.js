const mongoose = require("mongoose");

const todoSchema = new mongoose.Schema({
  name: String,
  dueDate: { type: Date, required: true },
  completed: { type: Boolean, default: false }, 
  completedAt: { type: Date },
  overdue: { type: Boolean, default: false },
  priority: {
    type: String,
    enum: ["Low", "Medium", "High"],
    default: "Medium",
  },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  userEmail: { type: String, required: false },
});

const Todo = mongoose.model("Todo", todoSchema);

module.exports = Todo;
