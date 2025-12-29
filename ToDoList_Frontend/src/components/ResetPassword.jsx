import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const ResetPassword = () => {
  const { token } = useParams();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();

  const handleReset = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password, confirmPassword }),
      });
      const data = await response.json();
      toast.info(data.message);
      if (response.ok) navigate("/");
    } catch (err) {
      console.error(err);
      toast.error("Error resetting password");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0A0F1F] text-white">
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
            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-full py-3 mt-4 transition"
          >
            Reset Password
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
