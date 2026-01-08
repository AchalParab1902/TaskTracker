const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB Atlas connected");
  } catch (err) {
    console.log("MongoDB connection error:", err);
    process.exit(1);
  }
};

module.exports = connectDB;
