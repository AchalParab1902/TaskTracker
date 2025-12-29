import React from "react";
import { FiBell, FiLogOut } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

const Navbar = ({ onAddTaskClick }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("userEmail");
    navigate("/");
  };

  return (
    <nav className="w-full px-6 py-4 bg-white/10 backdrop-blur-lg border-b border-white/20 flex items-center justify-between">
    
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 bg-blue-500 rounded-sm"></div>
        <h2 className="text-lg font-semibold">To-Do App</h2>
      </div>

    
      <div className="flex items-center gap-8 text-white/70 text-sm">
        <a href="/" className="hover:text-white transition">
          Home
        </a>
        <a href="/todo" className="hover:text-white transition">
          My Tasks
        </a>
        <a href="/dashboard" className="hover:text-white transition">
          Dashboard
        </a>
      </div>

      
      <div className="flex items-center gap-4">
        <button
          onClick={onAddTaskClick}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
        >
          Add New Task
        </button>

        
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
        >
          <FiLogOut size={16} />
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
