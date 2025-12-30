import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { toast } from "react-toastify";
import api from "../api";
import Loader from "../components/Loader";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }
    setLoading(true);
    try {
      const response = await api.post("/api/register", { name, email, password, confirmPassword });

      const data = response.data;
      console.log("response", data);

      toast.success("Registration successful!");
      navigate("/");
    } catch (error) {
      console.error("Registration error:", error);
      const message = error.response?.data?.message || "Error during registration!";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0A0F1F] text-white">
      {loading && <Loader fullPage={true} />}
      <div className="bg-white/10 backdrop-blur-lg border border-white/20 shadow-2xl rounded-3xl p-8 w-full max-w-sm mx-4 text-center">
        <h1 className="text-3xl font-bold mb-6">Create Account ✨</h1>
        <p className="text-white/60 mb-6">
          Register to start managing your tasks
        </p>

        <form onSubmit={handleRegister} className="space-y-4">
          <input
            type="text"
            placeholder="Full Name"
            className="w-full bg-white/5 border border-white/10 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
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
          <input
            type="password"
            placeholder="Confirm Password"
            className="w-full bg-white/5 border border-white/10 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 p-3 rounded-xl font-bold transition flex items-center justify-center gap-2"
          >
            {loading ? <Loader /> : "Register"}
          </button>
        </form>

        <p className="text-white/70 mt-6">
          Already have an account?{" "}
          <Link
            to="/"
            className="text-blue-400 hover:text-blue-300 font-semibold"
          >
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
