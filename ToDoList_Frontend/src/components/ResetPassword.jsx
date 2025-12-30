import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../api";
import Loader from "./Loader";

const ResetPassword = () => {
  const { token } = useParams();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleReset = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const response = await api.post("/api/reset-password", {
        token,
        password,
        confirmPassword
      });
      toast.info(response.data.message);
      navigate("/");
    } catch (err) {
      console.error(err);
      const message = err.response?.data?.message || "Error resetting password";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0A0F1F] text-white">
      {loading && <Loader fullPage={true} />}
      <div className="bg-white/10 backdrop-blur-lg border border-white/20 shadow-2xl rounded-3xl p-8 w-[400px] text-center">
        <h1 className="text-3xl font-bold mb-6">Reset Password</h1>
        <form onSubmit={handleReset} className="flex flex-col gap-4">
          <input
            type="password"
            placeholder="New Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="bg-white/20 text-white placeholder-white/70 rounded-full px-4 py-3 focus:outline-none"
            required
          />
          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="bg-white/20 text-white placeholder-white/70 rounded-full px-4 py-3 focus:outline-none"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-full py-3 mt-4 transition flex items-center justify-center gap-2"
          >
            {loading ? <Loader /> : "Reset Password"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
