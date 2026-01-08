const Todo = require("../models/Todo");

exports.createTodo = async (req, res) => {
  try {
    const { name, dueDate, priority, userEmail } = req.body;

    if (!name || !dueDate) {
      return res.status(400).json({ message: "Task name and due date are required" });
    }

    const due = new Date(dueDate);
    if (isNaN(due.getTime())) {
      return res.status(400).json({ message: "Invalid due date format" });
    }

    const todo = new Todo({
      name,
      dueDate: due,
      priority: priority || "Medium",
      userId: req.user.id,
      userEmail: userEmail || "",
    });

    const saved = await todo.save();
    res.status(201).json(saved);
  } catch (err) {
    console.error("Error saving todo:", err);
    res.status(500).json({ message: "Failed to add todo", error: err.message });
  }
};

exports.getTodos = async (req, res) => {
  try {
    const userId = req.user.id;
    const now = new Date();

    const todos = await Todo.find({ userId });

    for (const todo of todos) {
      if (!todo.priority) {
        todo.priority = "Medium";
        await todo.save();
      }
    }

    const updatedTodos = todos.map((todo) => ({
      ...todo.toObject(),
      overdue: !todo.completed && new Date(todo.dueDate) < now,
      priority: todo.priority,
    }));

    res.json(updatedTodos);
  } catch (err) {
    console.error("Error fetching todos:", err);
    res.status(500).json({
      message: "Failed to fetch todos",
      error: err.message,
    });
  }
};

exports.updateTodo = async (req, res) => {
  try {
    const { name, completed, dueDate, priority } = req.body;

    const todo = await Todo.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });
    if (!todo) return res.status(404).json({ message: "Todo not found" });

    if (name !== undefined) todo.name = name;
    if (dueDate !== undefined) todo.dueDate = new Date(dueDate);
    if (priority !== undefined) todo.priority = priority;
    if (completed !== undefined) {
      todo.completed = completed;

      if (completed && !todo.completedAt) {
        todo.completedAt = new Date();
      } else if (!completed) {
        todo.completedAt = null;
      }
    }

    await todo.save();

    res.status(200).json(todo);
  } catch (err) {
    console.error("Error updating todo:", err);
    res.status(500).json({ message: "Failed to update todo", error: err.message });
  }
};

exports.deleteTodo = async (req, res) => {
  try {
    await Todo.findByIdAndDelete(req.params.id);
    res.json({ message: "Todo deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete todo", error: err });
  }
};
