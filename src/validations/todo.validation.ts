import Joi from "joi";
import { TodoPriority, TodoStatus } from "../models/todo.model";

export const createTodoSchema = Joi.object({
  title: Joi.string().max(100).required().trim(),
  description: Joi.string().max(500).trim().allow("", null),
  dueDate: Joi.date().iso().allow(null),
  priority: Joi.string()
    .valid(...Object.values(TodoPriority))
    .default(TodoPriority.MEDIUM),
  status: Joi.string()
    .valid(...Object.values(TodoStatus))
    .default(TodoStatus.PENDING),
  tags: Joi.array().items(Joi.string().trim()).allow(null),
});

export const updateTodoSchema = Joi.object({
  title: Joi.string().max(100).trim(),
  description: Joi.string().max(500).trim().allow("", null),
  dueDate: Joi.date().iso().allow(null),
  priority: Joi.string().valid(...Object.values(TodoPriority)),
  status: Joi.string().valid(...Object.values(TodoStatus)),
  tags: Joi.array().items(Joi.string().trim()),
}).min(1);

export const todoFiltersSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  sortBy: Joi.string()
    .valid("createdAt", "updatedAt", "dueDate", "priority")
    .default("createdAt"),
  sortOrder: Joi.string().valid("asc", "desc").default("desc"),
  search: Joi.string().trim(),
});

export const dueDateFiltersSchema = Joi.object({
  startDate: Joi.date().iso(),
  endDate: Joi.date().iso().greater(Joi.ref("startDate")),
  overdue: Joi.boolean(),
  upcoming: Joi.boolean(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  sortOrder: Joi.string().valid("asc", "desc").default("asc"),
}).min(1);
