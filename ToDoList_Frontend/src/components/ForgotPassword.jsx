import React, { useState } from "react";
import { toast } from "react-toastify";
import api from "../api";
import Loader from "./Loader";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await api.post("/api/forgot-password", { email });
      toast.info(response.data.message);
    } catch (err) {
      console.error(err);
      const message = err.response?.data?.message || "Error sending reset link";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0A0F1F] text-white">
      {loading && <Loader fullPage={true} />}
      <div className="bg-white/10 backdrop-blur-lg border border-white/20 shadow-2xl rounded-3xl p-8 w-[400px] text-center">
        <h1 className="text-3xl font-bold mb-6">Forgot Password?</h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-white/20 text-white placeholder-white/70 rounded-full px-4 py-3 focus:outline-none"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-full py-3 mt-4 transition flex items-center justify-center gap-2"
          >
            {loading ? <Loader /> : "Send Reset Link"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
