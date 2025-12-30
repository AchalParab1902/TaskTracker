import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { FiCheckCircle, FiClock, FiAlertTriangle, FiBarChart2, } from "react-icons/fi";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, Legend, ResponsiveContainer, } from "recharts";
import { toast } from "react-toastify";
import api from "../api";
import Loader from "../components/Loader";

const Dashboard = () => {
  const [todos, setTodos] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDueDate, setTaskDueDate] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const token = localStorage.getItem("accessToken");
  const userEmail = localStorage.getItem("userEmail");
  const userName = localStorage.getItem("userName");

  useEffect(() => {
    const fetchTodos = async () => {
      setLoading(true);
      try {
        const res = await api.get("/api/todos", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = res.data;

        const todosWithDefaults = data.map((todo) => {
          const dueDate = new Date(todo.dueDate);
          const today = new Date();
          const isOverdue = !todo.completed && dueDate < today;

          return {
            ...todo,
            completed: todo.completed ?? false,
            overdue: isOverdue,
          };
        });

        setTodos(todosWithDefaults);
      } catch (err) {
        console.error("Error fetching todos:", err);
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchTodos();
  }, [token]);


  const handleSaveTask = async () => {
    if (!taskTitle.trim() || !taskDueDate) {
      toast.warning("Please enter both task title and due date.");
      return;
    }

    if (!userEmail) {
      toast.warning("User email not found. Please log in again.");
      return;
    }

    setActionLoading(true);
    try {
      const res = await api.post("/api/todos",
        { name: taskTitle, dueDate: taskDueDate, userEmail, priority },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const data = res.data;
      if (!data) {
        toast.error("Failed to save task");
        return;
      }

      setTodos((prev) => [...prev, data]);
      setTaskTitle("");
      setTaskDueDate("");
      setPriority("Medium");
      setShowModal(false);
      toast.success("Task added successfully!");
    } catch (error) {
      console.error("Error saving task:", error);
      toast.error("Error saving task");
    } finally {
      setActionLoading(false);
    }
  };


  const completed = todos.filter((t) => t.completed).length;
  const pending = todos.filter((t) => !t.completed && !t.overdue).length;
  const overdue = todos.filter((t) => t.overdue).length;
  const total = todos.length;
  const completionRate = total === 0 ? 0 : Math.round((completed / total) * 100);


  const weeklyData = [
    { day: "Mon", completed: 0 },
    { day: "Tue", completed: 0 },
    { day: "Wed", completed: 0 },
    { day: "Thu", completed: 0 },
    { day: "Fri", completed: 0 },
    { day: "Sat", completed: 0 },
    { day: "Sun", completed: 0 },
  ];

  todos.forEach(todo => {
    if (todo.completed && todo.completedAt) {
      const dayIndex = new Date(todo.completedAt).getDay();
      weeklyData[dayIndex === 0 ? 6 : dayIndex - 1].completed++;
    }
  });

  const pieData = [
    { name: "Completed", value: completed },
    { name: "Pending", value: pending },
    { name: "Overdue", value: overdue },
  ];
  const COLORS = ["#22c55e", "#facc15", "#ef4444"];

  return (
    <div className="min-h-screen bg-[#0a0f1f] text-white">
      {(loading || actionLoading) && <Loader fullPage={true} />}
      <Navbar onAddTaskClick={() => setShowModal(true)} />

      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-[#161b22] p-8 rounded-2xl w-full max-w-md mx-4 shadow-lg text-white relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-3 right-4 text-gray-400 hover:text-white text-xl"
            >
              ✕
            </button>

            <h2 className="text-xl font-semibold mb-4">Add New Task</h2>

            <label className="block mb-2 text-sm text-gray-400">Task Title</label>
            <input
              type="text"
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              placeholder="e.g., Learn React JS"
              className="w-full p-2 mb-4 rounded-lg bg-[#0f172a] border border-gray-600 text-white focus:outline-none focus:border-blue-500"
            />

            <label className="block mb-2 text-sm text-gray-400">Priority</label>
            <div className="flex gap-3 mb-4">
              {["Low", "Medium", "High"].map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPriority(p)}
                  className={`px-4 py-2 rounded-lg border ${priority === p ? "bg-blue-600 text-white border-blue-600" : "bg-[#0f172a] text-white border-gray-600"
                    }`}
                >
                  {p}
                </button>
              ))}
            </div>

            <label className="block mb-2 text-sm text-gray-400">Due Date</label>
            <input
              type="date"
              value={taskDueDate}
              onChange={(e) => setTaskDueDate(e.target.value)}
              className="w-full p-2 mb-6 rounded-lg bg-[#0f172a] border border-gray-600 text-white focus:outline-none focus:border-blue-500"
            />

            <button
              onClick={handleSaveTask}
              disabled={actionLoading}
              className="w-full py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold flex items-center justify-center gap-2"
            >
              {actionLoading ? <Loader /> : "Save Task"}
            </button>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold">Dashboard</h1>
            <p className="text-white/70 mt-1 text-lg">
              Welcome back, {userName || userEmail?.split("@")[0]}
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-10">
              <StatCard
                title="Total Completed"
                value={completed}
                icon={<FiCheckCircle size={28} className="text-green-400" />}
                change="+5.2%"
              />
              <StatCard
                title="Tasks Pending"
                value={pending}
                icon={<FiClock size={28} className="text-yellow-400" />}
                change="-1.0%"
              />
              <StatCard
                title="Tasks Overdue"
                value={overdue}
                icon={<FiAlertTriangle size={28} className="text-red-400" />}
                change="+2.5%"
              />
              <StatCard
                title="Completion Rate"
                value={`${completionRate}%`}
                icon={<FiBarChart2 size={28} className="text-blue-400" />}
                change="+1.2%"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-12">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <h3 className="text-xl font-semibold mb-4">Tasks Completed This Week</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" />
                    <XAxis dataKey="day" stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" />
                    <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #475569" }} />
                    <Bar dataKey="completed" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <h3 className="text-xl font-semibold mb-4">Task Breakdown</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: "white", border: "1px solid #475569" }} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
                <p className="text-center text-lg mt-4">
                  <span className="text-blue-400 font-semibold">{total}</span> Total Tasks
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-12">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 col-span-1 lg:col-span-2">
                <h3 className="text-xl font-semibold mb-4">Due Soon</h3>
                {todos.filter((t) => !t.completed && !t.overdue).length === 0 ? (
                  <p className="text-gray-400 text-sm">No upcoming tasks.</p>
                ) : (
                  todos
                    .filter((t) => !t.completed && !t.overdue)
                    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
                    .slice(0, 5)
                    .map((todo) => {
                      const dueDate = new Date(todo.dueDate);
                      const today = new Date();
                      const diffDays = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
                      let label = diffDays === 0 ? "Today" : diffDays === 1 ? "Tomorrow" : dueDate.toLocaleDateString();
                      return (
                        <div key={todo._id} className="flex items-center justify-between py-3 border-b border-white/10 last:border-none">
                          <span className="text-white/90">{todo.name}</span>
                          <span className="text-white/60 text-sm">{label}</span>
                        </div>
                      );
                    })
                )}
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <h3 className="text-xl font-semibold mb-4 text-red-400">Overdue</h3>
                {todos.filter((t) => t.overdue).length === 0 ? (
                  <p className="text-gray-400 text-sm">No overdue tasks.</p>
                ) : (
                  todos.filter((t) => t.overdue).slice(0, 5).map((todo) => (
                    <div key={todo._id} className="flex items-center justify-between py-3 border-b border-white/10 last:border-none">
                      <span className="text-red-400">{todo.name}</span>
                      <span className="text-white/60 text-sm">{new Date(todo.dueDate).toLocaleDateString()}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon, change }) => (
  <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
    <div className="flex items-center justify-between">
      <p className="text-white/60 text-lg">{title}</p>
      {icon}
    </div>
    <h2 className="text-4xl font-bold mt-4">{value}</h2>
  </div>
);

export default Dashboard;
