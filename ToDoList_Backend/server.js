const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const todoRoutes = require("./routes/todoRoutes");

dotenv.config();

const app = express();

// Connect to Database
connectDB();

// Middleware
app.use(express.json());
app.use(cookieParser());

// Request Logging Middleware
app.use((req, res, next) => {
  console.log(`[REQUEST] ${req.method} ${req.url}`);
  console.log(`[ORIGIN] ${req.headers.origin}`);
  next();
});

const corsOptions = {
  origin: [
    "http://localhost:3000", 
    "http://localhost:5173",
    "https://tasktracker-frontend-2c9q.onrender.com",
    process.env.FRONTEND_URL
  ].filter(Boolean),
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions)); 

// Routes
app.get("/", (req, res) => {
  res.send("API is running...");
});

app.use("/api", authRoutes);
app.use("/api", todoRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
