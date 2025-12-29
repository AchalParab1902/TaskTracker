const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");

dotenv.config();
const app = express();

const jwt = require("jsonwebtoken");

const cookieParser = require("cookie-parser");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
// app.use(express.json());


app.use(express.json());
app.use(cookieParser());


const corsOptions = {
  origin: ["http://localhost:3000", "https://tasktracker-frontend-2c9q.onrender.com", "http://localhost:5173"],
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions)); 



const ACCESS_SECRET = process.env.ACCESS_SECRET || "Access_secret_key";
const REFRESH_SECRET = process.env.REFRESH_SECRET || "Refresh_secret_key";

const genAccessToken = (user) =>
  jwt.sign({ id: user.id }, ACCESS_SECRET, { expiresIn: "15m" });
const genRefreshToken = (user) =>
  jwt.sign({ id: user.id }, REFRESH_SECRET, { expiresIn: "7d" });

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Atlas connected"))
  .catch((err) => console.log("MongoDB connection error:", err));

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

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  refreshToken: String,
  resetPasswordToken: String,
  resetPasswordExpires: Date,
});

const User = mongoose.model("User", userSchema);

function verifyAccessToken(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];
  if (!token)
    return res
      .status(401)
      .json({ message: "No or invalid authorization token" });

  try {
    req.user = jwt.verify(token, ACCESS_SECRET);
    next();
  } catch {
    res.status(401).json({ message: "Invalid or expired access token" });
  }
}

app.post("/api/todos", verifyAccessToken, async (req, res) => {
  try {
    const { name, dueDate, priority, userEmail } = req.body;

    if (!name || !dueDate) {
      return res
        .status(400)
        .json({ message: "Task name and due date are required" });
    }

    const due = new Date(dueDate);
    if (isNaN(due.getTime())) {
      return res.status(400).json({ message: "Invalid due date format" });
    }

    const todo = new Todo({
      name,
      dueDate: due,
      priority: priority || "Medium",
      userId: req.user.id,
      userEmail: userEmail || "",
    });

    const saved = await todo.save();
    res.status(201).json(saved);
  } catch (err) {
    console.error("Error saving todo:", err);
    res.status(500).json({ message: "Failed to add todo", error: err.message });
  }
});

app.get("/api/todos", verifyAccessToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const now = new Date();

    const todos = await Todo.find({ userId });

    for (const todo of todos) {
      if (!todo.priority) {
        todo.priority = "Medium";
        await todo.save();
      }
    }

    const updatedTodos = todos.map((todo) => ({
      ...todo.toObject(),
      overdue: !todo.completed && new Date(todo.dueDate) < now,
      priority: todo.priority,
    }));

    res.json(updatedTodos);
  } catch (err) {
    console.error("Error fetching todos:", err);
    res.status(500).json({
      message: "Failed to fetch todos",
      error: err.message,
    });
  }
});

app.put("/api/todos-update/:id", verifyAccessToken, async (req, res) => {
  try {
    const { name, completed, dueDate, priority } = req.body;

    const todo = await Todo.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });
    if (!todo) return res.status(404).json({ message: "Todo not found" });

    if (name !== undefined) todo.name = name;
    if (dueDate !== undefined) todo.dueDate = new Date(dueDate);
    if (priority !== undefined) todo.priority = priority;
    if (completed !== undefined) {
      todo.completed = completed;

      if (completed && !todo.completedAt) {
        todo.completedAt = new Date();
      } else if (!completed) {
        todo.completedAt = null;
      }
    }

    await todo.save();

    res.status(200).json(todo);
  } catch (err) {
    console.error("Error updating todo:", err);
    res
      .status(500)
      .json({ message: "Failed to update todo", error: err.message });
  }
});

app.delete("/api/todos/:id", verifyAccessToken, async (req, res) => {
  try {
    await Todo.findByIdAndDelete(req.params.id);
    res.json({ message: "Todo deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete todo", error: err });
  }
});

const bcrypt = require("bcryptjs");

app.post("/api/register", async (req, res) => {
  try {
    const { name, email, password, confirmPassword } = req.body;
    if (!name || !email || !password || !confirmPassword) {
      return res.status(400).json({ message: "All fields are required !" });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({ message: "password do not match !" });
    }

    if (password.length <= 6) {
      return res
        .status(400)
        .json({ message: "password must be atleast 6 character " });
    }
    const specialCharPattern = /[!@#$%^&*(),.?":{}|<>]/;

    if (!specialCharPattern.test(password)) {
      return res
        .status(400)
        .json({ message: "password must be used special character" });
    }
    if (await User.findOne({ email }))
      return res.status(400).json({ message: "Email already registered!" });

    const hashed = await bcrypt.hash(password, 10);
    await new User({ name, email, password: hashed }).save();
    res.status(200).json({ message: "Registration successful!" });
  } catch (err) {
    res.status(500).json({ message: "Error registering", err });
  }
});

app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found!" });
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ message: "Invalid password!" });

    const accessToken = genAccessToken(user);
    const refreshToken = genRefreshToken(user);

    user.refreshToken = refreshToken;
    await user.save();

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      message: "Login successful",
      user: { name: user.name, email: user.email },
      accessToken,
      refreshToken,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Login error", error: err.message });
  }
});

app.post("/api/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = Date.now() + 3600000;

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetTokenExpiry;
    await user.save();

    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const resetLink = `http://localhost:3000/reset-password/${resetToken}`;

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: "Password Reset",
      html: `<p>Click this link to reset your password:</p>
             <a href="${resetLink}">${resetLink}</a>`,
    });

    res.json({ message: "Password reset link sent to your email" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error sending reset email" });
  }
});

app.post("/api/reset-password", async (req, res) => {
  try {
    const { token, password, confirmPassword } = req.body;
    if (password !== confirmPassword)
      return res.status(400).json({ message: "Passwords do not match" });

    if (password.length < 6)
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user)
      return res.status(400).json({ message: "Invalid or expired token" });

    const hashed = await bcrypt.hash(password, 10);
    user.password = hashed;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: "Password reset successful!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error resetting password" });
  }
});

app.post("/api/refresh", async (req, res) => {
  try {
    const oldToken = req.cookies.refreshToken;
    if (!oldToken) return res.status(401).json({ message: "No refresh token" });

    const { id } = jwt.verify(oldToken, REFRESH_SECRET);
    const user = await User.findById(id);
    if (!user || user.refreshToken !== oldToken)
      return res.status(403).json({ message: "Invalid refresh token" });

    const accessToken = genAccessToken(user);
    const refreshToken = genRefreshToken(user);

    user.refreshToken = refreshToken;
    await user.save();

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({ accessToken });
  } catch {
    res.status(403).json({ message: "Invalid or expired refresh token" });
  }
});

app.post("/api/logout", async (req, res) => {
  try {
    const token = req.cookies.refreshToken;
    if (token) {
      const decoded = jwt.verify(token, REFRESH_SECRET);
      const user = await User.findById(decoded.id);
      if (user) {
        user.refreshToken = null;
        await user.save();
      }
    }
    res.clearCookie("refreshToken");
    res.json({ message: "Logged out successfully" });
  } catch {
    res.clearCookie("refreshToken");
    res.json({ message: "Logged out" });
  }
});

app.get("/api/verify-token", (req, res) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.json({ valid: false });

  jwt.verify(token, ACCESS_SECRET, (err, user) => {
    if (err) return res.json({ valid: false });
    res.json({ valid: true, user });
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
