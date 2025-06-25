import { Request, Response } from "express";
import { TodoStatus, TodoPriority } from "../models/todo.model";
import { todoService } from "../services/todo.service";
import { asyncHandler } from "../utils/asyncHandler";

export const createTodo = asyncHandler(async (req: Request, res: Response) => {
  const result = await todoService.createTodo(req.user.id, req.body);
  res
    .status(201)
    .json({ success: true, message: "Todo created", data: result });
});

export const getAllTodos = asyncHandler(async (req: Request, res: Response) => {
  const { todos, pagination } = await todoService.getAllTodos(
    req.user.id,
    req.query
  );
  res.status(200).json({ success: true, data: todos, pagination });
});

export const getTodoById = asyncHandler(async (req: Request, res: Response) => {
  const todo = await todoService.getTodoById(req.user.id, req.params.id);
  res.status(200).json({ success: true, data: todo });
});

export const updateTodo = asyncHandler(async (req: Request, res: Response) => {
  const updatedTodo = await todoService.updateTodo(
    req.user.id,
    req.params.id,
    req.body
  );
  res
    .status(200)
    .json({ success: true, message: "Todo updated", data: updatedTodo });
});

export const deleteTodo = asyncHandler(async (req: Request, res: Response) => {
  await todoService.deleteTodo(req.user.id, req.params.id);
  res.status(200).json({ success: true, message: "Todo deleted" });
});

export const getTodosByStatus = asyncHandler(
  async (req: Request, res: Response) => {
    const { status } = req.params;
    if (!Object.values(TodoStatus).includes(status as TodoStatus)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Valid values: ${Object.values(
          TodoStatus
        ).join(", ")}`,
      });
    }
    const { todos, pagination } = await todoService.getTodosByStatus(
      req.user.id,
      status as TodoStatus,
      req.query
    );
    res.status(200).json({ success: true, data: todos, pagination });
  }
);

export const getTodosByPriority = asyncHandler(
  async (req: Request, res: Response) => {
    const { priority } = req.params;
    if (!Object.values(TodoPriority).includes(priority as TodoPriority)) {
      return res.status(400).json({
        success: false,
        message: `Invalid priority. Valid values: ${Object.values(
          TodoPriority
        ).join(", ")}`,
      });
    }
    const { todos, pagination } = await todoService.getTodosByPriority(
      req.user.id,
      priority as TodoPriority,
      req.query
    );
    res.status(200).json({ success: true, data: todos, pagination });
  }
);

export const getTodosByDueDate = asyncHandler(
  async (req: Request, res: Response) => {
    const { todos, pagination } = await todoService.getTodosByDueDate(
      req.user.id,
      req.query
    );
    res.status(200).json({ success: true, data: todos, pagination });
  }
);

export const getTodosByTag = asyncHandler(
  async (req: Request, res: Response) => {
    const { tag } = req.params;
    const { todos, pagination } = await todoService.getTodosByTag(
      req.user.id,
      tag,
      req.query
    );
    res.status(200).json({ success: true, data: todos, pagination });
  }
);
