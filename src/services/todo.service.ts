import {
  CreateTodoInput,
  DueDateFilters,
  TodoFilters,
  TodosWithPagination,
  UpdateTodoInput,
} from "@/types/todo.types";
import mongoose from "mongoose";
import { Todo, ITodo, TodoStatus, TodoPriority } from "../models/todo.model";
import { AppError } from "../utils/appError";

class TodoService {
  /**
   * Create a new todo for a user
   */
  async createTodo(userId: string, todoData: CreateTodoInput): Promise<ITodo> {
    const todo = await Todo.create({
      ...todoData,
      user: userId,
    });

    return todo;
  }

  /**
   * Get all todos for a user with pagination and filtering
   */
  async getAllTodos(
    userId: string,
    filters: TodoFilters
  ): Promise<TodosWithPagination> {
    const {
      page = 1,
      limit = 10,
      sortBy = "createdAt",
      sortOrder = "desc",
      search = "",
    } = filters;

    const skip = (page - 1) * limit;

    // Base query
    const query: any = { user: userId };

    // Add search if provided
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { tags: { $in: [new RegExp(search, "i")] } },
      ];
    }

    // Count total documents for pagination
    const totalItems = await Todo.countDocuments(query);

    // Get todos with pagination and sorting
    const todos = await Todo.find(query)
      .sort({ [sortBy]: sortOrder === "asc" ? 1 : -1 })
      .skip(skip)
      .limit(limit);

    return {
      todos,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(totalItems / limit),
        totalItems,
      },
    };
  }

  /**
   * Get a specific todo by ID
   */
  async getTodoById(userId: string, todoId: string): Promise<ITodo> {
    if (!mongoose.Types.ObjectId.isValid(todoId)) {
      throw new AppError("Invalid todo ID", 400);
    }

    const todo = await Todo.findOne({ _id: todoId, user: userId });

    if (!todo) {
      throw new AppError("Todo not found", 404);
    }

    return todo;
  }

  /**
   * Update a todo
   */
  async updateTodo(
    userId: string,
    todoId: string,
    updateData: UpdateTodoInput
  ): Promise<ITodo> {
    if (!mongoose.Types.ObjectId.isValid(todoId)) {
      throw new AppError("Invalid todo ID", 400);
    }

    const todo = await Todo.findOneAndUpdate(
      { _id: todoId, user: userId },
      updateData,
      { new: true, runValidators: true }
    );

    if (!todo) {
      throw new AppError("Todo not found", 404);
    }

    return todo;
  }

  /**
   * Delete a todo
   */
  async deleteTodo(userId: string, todoId: string): Promise<void> {
    if (!mongoose.Types.ObjectId.isValid(todoId)) {
      throw new AppError("Invalid todo ID", 400);
    }

    const todo = await Todo.findOneAndDelete({ _id: todoId, user: userId });

    if (!todo) {
      throw new AppError("Todo not found", 404);
    }
  }

  /**
   * Get todos by status
   */
  async getTodosByStatus(
    userId: string,
    status: TodoStatus,
    filters: TodoFilters
  ): Promise<TodosWithPagination> {
    const {
      page = 1,
      limit = 10,
      sortBy = "createdAt",
      sortOrder = "desc",
      search = "",
    } = filters;

    const skip = (page - 1) * limit;

    // Base query
    const query: any = { user: userId, status };

    // Add search if provided
    if (search) {
      query.$and = [
        { status },
        {
          $or: [
            { title: { $regex: search, $options: "i" } },
            { description: { $regex: search, $options: "i" } },
            { tags: { $in: [new RegExp(search, "i")] } },
          ],
        },
      ];
    }

    // Count total documents for pagination
    const totalItems = await Todo.countDocuments(query);

    // Get todos with pagination and sorting
    const todos = await Todo.find(query)
      .sort({ [sortBy]: sortOrder === "asc" ? 1 : -1 })
      .skip(skip)
      .limit(limit);

    return {
      todos,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(totalItems / limit),
        totalItems,
      },
    };
  }

  /**
   * Get todos by priority
   */
  async getTodosByPriority(
    userId: string,
    priority: TodoPriority,
    filters: TodoFilters
  ): Promise<TodosWithPagination> {
    const {
      page = 1,
      limit = 10,
      sortBy = "createdAt",
      sortOrder = "desc",
      search = "",
    } = filters;

    const skip = (page - 1) * limit;

    // Base query
    const query: any = { user: userId, priority };

    // Add search if provided
    if (search) {
      query.$and = [
        { priority },
        {
          $or: [
            { title: { $regex: search, $options: "i" } },
            { description: { $regex: search, $options: "i" } },
            { tags: { $in: [new RegExp(search, "i")] } },
          ],
        },
      ];
    }

    // Count total documents for pagination
    const totalItems = await Todo.countDocuments(query);

    // Get todos with pagination and sorting
    const todos = await Todo.find(query)
      .sort({ [sortBy]: sortOrder === "asc" ? 1 : -1 })
      .skip(skip)
      .limit(limit);

    return {
      todos,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(totalItems / limit),
        totalItems,
      },
    };
  }

  /**
   * Get todos by due date with various filters
   */
  async getTodosByDueDate(
    userId: string,
    filters: DueDateFilters
  ): Promise<TodosWithPagination> {
    const {
      startDate,
      endDate,
      overdue,
      upcoming,
      page = 1,
      limit = 10,
      sortOrder = "asc",
    } = filters;

    const skip = (page - 1) * limit;

    // Base query
    const query: any = { user: userId, dueDate: { $ne: null } };

    // Apply date range filter if provided
    if (startDate && endDate) {
      query.dueDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    } else if (startDate) {
      query.dueDate = { $gte: new Date(startDate) };
    } else if (endDate) {
      query.dueDate = { $lte: new Date(endDate) };
    }

    // Apply overdue filter (tasks with due date before today)
    if (overdue) {
      query.dueDate = { $lt: new Date(), $ne: null };
    }

    // Apply upcoming filter (tasks with due date in the next 7 days)
    if (upcoming) {
      const today = new Date();
      const nextWeek = new Date();
      nextWeek.setDate(today.getDate() + 7);

      query.dueDate = {
        $gte: today,
        $lte: nextWeek,
      };
    }

    // Count total documents for pagination
    const totalItems = await Todo.countDocuments(query);

    // Get todos with pagination and sorting by due date
    const todos = await Todo.find(query)
      .sort({ dueDate: sortOrder === "asc" ? 1 : -1 })
      .skip(skip)
      .limit(limit);

    return {
      todos,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(totalItems / limit),
        totalItems,
      },
    };
  }

  /**
   * Get todos by tag
   */
  async getTodosByTag(
    userId: string,
    tag: string,
    filters: TodoFilters
  ): Promise<TodosWithPagination> {
    const {
      page = 1,
      limit = 10,
      sortBy = "createdAt",
      sortOrder = "desc",
      search = "",
    } = filters;

    const skip = (page - 1) * limit;

    // Base query for tag (case insensitive)
    const query: any = {
      user: userId,
      tags: { $in: [new RegExp(tag, "i")] },
    };

    // Add additional search if provided
    if (search) {
      query.$and = [
        { tags: { $in: [new RegExp(tag, "i")] } },
        {
          $or: [
            { title: { $regex: search, $options: "i" } },
            { description: { $regex: search, $options: "i" } },
          ],
        },
      ];
    }

    // Count total documents for pagination
    const totalItems = await Todo.countDocuments(query);

    // Get todos with pagination and sorting
    const todos = await Todo.find(query)
      .sort({ [sortBy]: sortOrder === "asc" ? 1 : -1 })
      .skip(skip)
      .limit(limit);

    return {
      todos,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(totalItems / limit),
        totalItems,
      },
    };
  }
}

export const todoService = new TodoService();
