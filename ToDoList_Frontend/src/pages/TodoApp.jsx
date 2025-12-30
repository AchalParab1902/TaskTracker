import React, { useState, useEffect } from "react";
import { FiEdit2, FiTrash2 } from "react-icons/fi";
import Navbar from "../components/Navbar";
import { toast } from "react-toastify";
import api from "../api";
import Loader from "../components/Loader";

const TodoApp = () => {
  const [todolist, setTodolist] = useState([]);
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const [theme, setTheme] = useState(localStorage.getItem("theme") || "dark");
  const token = localStorage.getItem("accessToken");
  const [priority, setPriority] = useState("Medium");
  const [showModal, setShowModal] = useState(false);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDueDate, setTaskDueDate] = useState("");


  useEffect(() => {
    const fetchTodos = async () => {
      if (!token) return;
      setLoading(true);
      const userEmail = localStorage.getItem("userEmail");
      try {
        const res = await api.get(`/api/todos?userEmail=${encodeURIComponent(userEmail)}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = res.data;
        const todosWithEditing = data.map((todo) => ({
          ...todo,
          isEditing: false,
          editText: "",
        }));

        setTodolist(todosWithEditing);
      } catch (err) {
        console.error(err);
        setTodolist([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTodos();
  }, [token]);

  const toggleComplete = async (id) => {
    const todo = todolist.find((t) => t._id === id);
    if (!todo) return;

    const completed = !todo.completed;
    const completedAt = completed ? new Date().toISOString() : null;

    const updatedTodo = { ...todo, completed, completedAt };

    setTodolist(prev =>
      prev.map(t => (t._id === id ? updatedTodo : t))
    );

    try {
      await api.put(`/api/todos-update/${id}`,
        { completed, completedAt },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {
      console.error(err);
    }
  };


  const handleSaveTask = async () => {
    if (!taskTitle.trim() || !taskDueDate) {
      toast.info("Please enter both task title and due date.");
      return;
    }

    const userEmail = localStorage.getItem("userEmail");
    setActionLoading(true);
    try {
      const res = await api.post("/api/todos",
        { name: taskTitle, dueDate: taskDueDate, userEmail, priority },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const data = res.data;
      setTodolist((prev) => [...prev, { ...data, priority: data.priority || priority }]);
      setTaskTitle("");
      setTaskDueDate("");
      setShowModal(false);
      toast.success("Task added successfully!");
    } catch (error) {
      console.error("Error saving task:", error);
      toast.error("Error saving task");
    } finally {
      setActionLoading(false);
    }
  };

  const updateTask = async (id, newName) => {
    setActionLoading(true);
    try {
      const res = await api.put(`/api/todos-update/${id}`,
        { name: newName },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const data = res.data;
      setTodolist((prev) => prev.map((t) => t._id === id ? { ...data, isEditing: false, editText: "" } : t));
      toast.success("Task updated!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update task");
    } finally {
      setActionLoading(false);
    }
  };

  const deleteTask = async (id) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;
    setActionLoading(true);
    try {
      await api.delete(`/api/todos/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTodolist(todolist.filter((t) => t._id !== id));
      toast.success("Task deleted!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete task");
    } finally {
      setActionLoading(false);
    }
  };

  const filteredTasks = Array.isArray(todolist) ? filter === "All" ? todolist : filter === "Active" ? todolist.filter((t) => !t.completed) : todolist.filter((t) => t.completed) : [];

  return (
    <div className={"min-h-screen bg-[#0f172a] text-white"} >
      {(loading || actionLoading) && <Loader fullPage={true} />}
      <Navbar onAddTaskClick={() => setShowModal(true)} />

      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-[#161b22] p-8 rounded-2xl w-full max-w-md mx-4 shadow-lg text-white relative">
            <button onClick={() => setShowModal(false)} className="absolute top-3 right-4 text-gray-400 hover:text-white text-xl">
              ✕
            </button>

            <h2 className="text-xl font-semibold mb-4">Add New Task</h2>

            <label className="block mb-2 text-sm text-gray-400">
              Task Title
            </label>
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
                  className={`px-4 py-2 rounded-lg border ${priority === p
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-[#0f172a] text-white border-gray-600"
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

      <div className="flex-1 flex flex-col items-center justify-start pt-28 p-6">
        <div className="w-full max-w-lg">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold">My Tasks</h2>
          </div>

          <div className={`rounded-2xl p-4 shadow-lg bg-[#1e293b]`}>
            {loading ? (
              <div className="flex justify-center py-10">
                <Loader />
              </div>
            ) : filteredTasks.length === 0 ? (
              <p className="text-center text-gray-400">No tasks yet</p>
            ) : (
              filteredTasks.map((todo) => (
                <div
                  key={todo._id}
                  className="flex items-center justify-between border-b last:border-none py-3 px-2 rounded-xl bg-[#1e2539] border-[#334155]"
                >
                  <div className="flex items-center space-x-3 w-full">
                    <input
                      type="checkbox"
                      checked={todo.completed}
                      onChange={() => toggleComplete(todo._id)}
                      className="accent-blue-500 w-5 h-5"
                    />

                    {todo.isEditing ? (
                      <input
                        type="text"
                        value={todo.editText}
                        autoFocus
                        onKeyPress={(e) => e.key === "Enter" && updateTask(todo._id, todo.editText)}
                        onChange={(e) => {
                          const updated = todolist.map((t) =>
                            t._id === todo._id
                              ? { ...t, editText: e.target.value }
                              : t
                          );
                          setTodolist(updated);
                        }}
                        className="flex-1 bg-transparent outline-none border-b pb-1 text-gray-200 border-gray-600"
                      />
                    ) : (
                      <div className="flex flex-col">
                        <span className={`text-base ${todo.completed ? "line-through text-gray-500" : "text-gray-200"}`}>
                          {todo.name}
                        </span>
                        <span className={`text-xs font-semibold mt-1 px-2 py-0.5 rounded-full w-fit
                          ${todo.priority === "High" ? "bg-red-700/30 text-red-400 border border-red-600" :
                            todo.priority === "Medium" ? "bg-yellow-600/30 text-yellow-400 border border-yellow-600" :
                              "bg-green-700/30 text-green-400 border border-green-600"}`}
                        >
                          {todo.priority}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-4 ml-4">
                    <button
                      onClick={() => {
                        if (!todo.isEditing) {
                          const updated = todolist.map((t) =>
                            t._id === todo._id
                              ? { ...t, isEditing: true, editText: t.name }
                              : t
                          );
                          setTodolist(updated);
                        } else {
                          updateTask(todo._id, todo.editText);
                        }
                      }}
                    >
                      <FiEdit2 className="text-lg text-gray-300 hover:text-white" />
                    </button>

                    <button disabled={actionLoading} onClick={() => deleteTask(todo._id)}>
                      <FiTrash2 className="text-lg text-red-400 hover:text-red-300" />
                    </button>
                  </div>
                </div>
              ))
            )}

            <div className="flex justify-between items-center mt-4 text-sm text-gray-400">
              <p>{todolist.filter((t) => !t.completed).length} tasks remaining</p>
              <div className="space-x-4">
                {["All", "Active", "Completed"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setFilter(tab)}
                    className={`${filter === tab ? "text-blue-400 font-semibold" : "text-gray-400 hover:text-gray-300"}`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TodoApp;
