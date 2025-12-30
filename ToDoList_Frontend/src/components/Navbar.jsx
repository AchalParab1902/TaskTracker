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

  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  return (
    <nav className="w-full px-6 py-4 bg-white/10 backdrop-blur-lg border-b border-white/20 relative z-50">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-blue-500 rounded-sm"></div>
          <h2 className="text-lg font-semibold">To-Do App</h2>
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-8 text-white/70 text-sm">
          <a href="/todo" className="hover:text-white transition">
            My Tasks
          </a>
          <a href="/dashboard" className="hover:text-white transition">
            Dashboard
          </a>
        </div>

        <div className="hidden md:flex items-center gap-4">
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

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-white text-2xl"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? "✕" : "☰"}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-[#161b22] border-b border-white/10 flex flex-col gap-4 p-6 shadow-xl">
          <a
            href="/todo"
            className="text-white/70 hover:text-white transition"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            My Tasks
          </a>
          <a
            href="/dashboard"
            className="text-white/70 hover:text-white transition"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Dashboard
          </a>
          <button
            onClick={() => {
              onAddTaskClick();
              setIsMobileMenuOpen(false);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg text-sm font-medium transition w-full"
          >
            Add New Task
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg text-sm font-medium transition w-full"
          >
            <FiLogOut size={16} />
            Logout
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
