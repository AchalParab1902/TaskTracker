import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { toast } from "react-toastify";
import api from "../api";
import Loader from "../components/Loader";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await api.post("/api/login", { email, password });

      const data = response.data;
      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("userEmail", data.user.email);
      localStorage.setItem("userName", data.user.name);

      toast.success(`Welcome back, ${data.user.name}!`);
      navigate("/Dashboard");
    } catch (err) {
      console.error("Login error:", err);
      const message = err.response?.data?.message || "Error during login!";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0A0F1F] text-white">
      {loading && <Loader fullPage={true} />}
      <div className="bg-white/10 backdrop-blur-lg border border-white/20 shadow-2xl rounded-3xl p-8 w-full max-w-sm mx-4 text-center">
        <h1 className="text-3xl font-bold mb-6">Welcome Back 👋</h1>
        <p className="text-white/60 mb-6">Login to access your To-Do list</p>

        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            className="w-full bg-white/5 border border-white/10 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              className="w-full bg-white/5 border border-white/10 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              className="absolute right-3 top-3.5 text-white/50"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          <div className="flex items-center justify-between text-sm py-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="rounded bg-white/10" />
              <span className="text-white/60">Remember Me</span>
            </label>
            <Link to="/forgot-password" size={18} className="text-blue-400 hover:underline">Forgot Password?</Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 p-3 rounded-xl font-bold transition flex items-center justify-center gap-2"
          >
            {loading ? <Loader /> : "Login"}
          </button>
        </form>

        <p className="text-white/70 mt-6">
          Don’t have an account?{" "}
          <Link
            to="/register"
            className="text-blue-400 hover:text-blue-300 font-semibold"
          >
            Register
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
