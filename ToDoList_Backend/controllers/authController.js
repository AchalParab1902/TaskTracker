const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const { genAccessToken, genRefreshToken, REFRESH_SECRET, ACCESS_SECRET } = require("../utils/jwtHelpers");

exports.register = async (req, res) => {
  try {
    const { name, email, password, confirmPassword } = req.body;
    if (!name || !email || !password || !confirmPassword) {
      return res.status(400).json({ message: "All fields are required !" });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({ message: "password do not match !" });
    }

    if (password.length <= 6) {
      return res.status(400).json({ message: "password must be atleast 6 character " });
    }
    const specialCharPattern = /[!@#$%^&*(),.?":{}|<>]/;

    if (!specialCharPattern.test(password)) {
      return res.status(400).json({ message: "password must be used special character" });
    }
    if (await User.findOne({ email }))
      return res.status(400).json({ message: "Email already registered!" });

    const hashed = await bcrypt.hash(password, 10);
    await new User({ name, email, password: hashed }).save();
    res.status(200).json({ message: "Registration successful!" });
  } catch (err) {
    res.status(500).json({ message: "Error registering", err });
  }
};

exports.login = async (req, res) => {
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
};

exports.forgotPassword = async (req, res) => {
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

    const frontendUrl = process.env.FRONTEND_URL || "https://tasktracker-frontend-2c9q.onrender.com";
    const resetLink = `${frontendUrl}/reset-password/${resetToken}`;

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
};

exports.resetPassword = async (req, res) => {
  try {
    const { token, password, confirmPassword } = req.body;
    if (password !== confirmPassword)
      return res.status(400).json({ message: "Passwords do not match" });

    if (password.length < 6)
      return res.status(400).json({ message: "Password must be at least 6 characters" });

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
};

exports.refresh = async (req, res) => {
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
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({ accessToken });
  } catch {
    res.status(403).json({ message: "Invalid or expired refresh token" });
  }
};

exports.logout = async (req, res) => {
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
};

exports.verifyToken = (req, res) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.json({ valid: false });

  jwt.verify(token, ACCESS_SECRET, (err, user) => {
    if (err) return res.json({ valid: false });
    res.json({ valid: true, user });
  });
};
