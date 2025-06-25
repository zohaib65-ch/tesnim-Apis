import express from "express";
import { protect } from "../middleware/auth.middleware";
import { validate } from "../middleware/validator.middleware";
import { createTodo, getAllTodos, getTodoById, updateTodo, deleteTodo, getTodosByStatus, getTodosByPriority, getTodosByDueDate, getTodosByTag } from "../controllers/todo.controller";
import { createTodoSchema, updateTodoSchema, todoFiltersSchema, dueDateFiltersSchema } from "../validations/todo.validation";

const router = express.Router();

// Apply auth middleware to all routes
router.use(protect);

// CRUD
router.post("/", validate(createTodoSchema), createTodo);
router.get("/", validate(todoFiltersSchema), getAllTodos);
router.get("/:id", getTodoById);
router.put("/:id", validate(updateTodoSchema), updateTodo);
router.delete("/:id", deleteTodo);

// Filters
router.get("/status/:status", validate(todoFiltersSchema), getTodosByStatus);
router.get("/priority/:priority", validate(todoFiltersSchema), getTodosByPriority);
router.get("/due-date", validate(dueDateFiltersSchema), getTodosByDueDate);
router.get("/tag/:tag", validate(todoFiltersSchema), getTodosByTag);

export default router;
