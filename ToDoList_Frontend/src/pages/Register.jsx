import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { toast } from "react-toastify";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.warning("Password does not match");
      return;
    }

    if (password.length <= 6) {
      toast.warning("password must be atleast 6 character");
      return;
    }

    const specialCharPattern = /[!@#$%^&*(),.?":{}|<>]/;
    if (!specialCharPattern.test(password)) {
      toast.warning("password must be special character");
      return;
    }
    try {
      // const response = await fetch("http://localhost:5000/api/register", {
      const response = await fetch("https://tasktracker-backend-l131.onrender.com/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, confirmPassword }),
        credentials: "include",
      });

      const data = await response.json();

      if (response.ok) {
        console.log("response", data);

        toast.success("Registration successful!");
        navigate("/");
      } else {
        toast.error(data.message || "Registration failed!");
      }
    } catch (error) {
      toast.error("Error during registration!");
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0A0F1F] text-white">
      <div className="bg-white/10 backdrop-blur-lg border border-white/20 shadow-2xl rounded-3xl p-8 w-[400px] text-center">
        <h1 className="text-3xl font-bold mb-6">Create Account ✨</h1>
        <p className="text-white/60 mb-6">
          Register to start managing your tasks
        </p>

        <form onSubmit={handleRegister} className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Full Name"
            className="bg-white/20 text-white placeholder-white/70 rounded-full px-4 py-3 focus:outline-none"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
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
              className="w-full bg-white/20 text-white placeholder-white/70 rounded-full px-4 py-3 pr-12 focus:outline-none"
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
          <div className="relative w-full">
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm Password"
              className="w-full bg-white/20 text-white placeholder-white/70 rounded-full px-4 pr-12 py-3 focus:outline-none"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />

            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                setShowConfirmPassword(!showConfirmPassword);
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:text-blue-400 transition"
            >
              {showConfirmPassword ? (
                <FaEyeSlash size={18}></FaEyeSlash>
              ) : (
                <FaEye size={18}></FaEye>
              )}
            </button>
          </div>

          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-full py-3 mt-4 transition"
          >
            {" "}
            Register{" "}
          </button>
        </form>

        <p className="text-white/70 mt-6">
          {" "}
          Already have an account?{" "}
          <Link
            to="/"
            className="text-blue-400 hover:text-blue-300 font-semibold"
          >
            {" "}
            Login{" "}
          </Link>{" "}
        </p>
      </div>
    </div>
  );
};

export default Register;
