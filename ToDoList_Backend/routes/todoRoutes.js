const express = require("express");
const router = express.Router();
const todoController = require("../controllers/todoController");
const verifyAccessToken = require("../middlewares/authMiddleware");

router.post("/todos", verifyAccessToken, todoController.createTodo);
router.get("/todos", verifyAccessToken, todoController.getTodos);
router.put("/todos-update/:id", verifyAccessToken, todoController.updateTodo);
router.delete("/todos/:id", verifyAccessToken, todoController.deleteTodo);

module.exports = router;
