import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { toast } from "react-toastify";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      // const response = await fetch("http://localhost:5000/api/login", {
      const response = await fetch("https://tasktracker-backend-l131.onrender.com/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // needed for cookies
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (response.ok) {
        localStorage.setItem("accessToken", data.accessToken);
        localStorage.setItem("userEmail", data.user.email);
        localStorage.setItem("userName", data.user.name);

        toast.success(`Welcome back, ${data.user.name}!`);

        navigate("/Dashboard");
      } else {
        toast.error(data.message || "Invalid email or password!");
      }
    } catch (err) {
      console.error("Login error:", err);
      toast.error("Error during login!");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0A0F1F] text-white">
      <div className="bg-white/10 backdrop-blur-lg border border-white/20 shadow-2xl rounded-3xl p-8 w-[400px] text-center">
        <h1 className="text-3xl font-bold mb-6">Welcome Back 👋</h1>
        <p className="text-white/60 mb-6">Login to access your To-Do list</p>

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="Email"
            className="bg-white/20 text-white placeholder-white/70 rounded-full px-4 py-3 focus:outline-none"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <div className="relative w-full">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              className="w-full bg-white/20 text-white placeholder-white/70 rounded-full px-4 py-3 focus:outline-none"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:text-blue-400 transition"
            >
              {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
            </button>
          </div>
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-2 pl-2">
              <input
                type="checkbox"
                id="rememberMe"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 pl-4"
              />
              <label htmlFor="rememberMe" className="text-white cursor-pointer">
                Remember Me
              </label>
            </div>

            <a
              href="/forgot-password"
              className="text-white hover:text-blue-400 pr-2"
            >
              Forgot password?
            </a>
          </div>

          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-full py-3 mt-4 transition"
          >
            {" "}
            Login{" "}
          </button>
        </form>

        <p className="text-white/70 mt-6">
          {" "}
          Don’t have an account?{" "}
          <Link
            to="/register"
            className="text-blue-400 hover:text-blue-300 font-semibold"
          >
            {" "}
            Register{" "}
          </Link>{" "}
        </p>
      </div>
    </div>
  );
};

export default Login;
