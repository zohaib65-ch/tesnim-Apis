import { ITodo, TodoPriority, TodoStatus } from "../models/todo.model";

export interface CreateTodoInput {
  title: string;
  description?: string;
  dueDate?: Date;
  priority?: TodoPriority;
  status?: TodoStatus;
  tags?: string[];
}

export interface UpdateTodoInput {
  title?: string;
  description?: string;
  dueDate?: Date;
  priority?: TodoPriority;
  status?: TodoStatus;
  tags?: string[];
}

export interface TodoFilters {
  status?: TodoStatus;
  priority?: TodoPriority;
  dueDateStart?: Date;
  dueDateEnd?: Date;
  tags?: string[];
  search?: string;
}

export interface PaginationOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortDirection?: "asc" | "desc";
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

// Types for todo operations
export interface CreateTodoInput {
  title: string;
  description?: string;
  dueDate?: Date;
  priority?: TodoPriority;
  status?: TodoStatus;
  tags?: string[];
}

export interface UpdateTodoInput {
  title?: string;
  description?: string;
  dueDate?: Date;
  priority?: TodoPriority;
  status?: TodoStatus;
  tags?: string[];
}

export interface TodoFilters {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  search?: string;
}

export interface DueDateFilters extends TodoFilters {
  startDate?: Date;
  endDate?: Date;
  overdue?: boolean;
  upcoming?: boolean;
}

export interface PaginationResult {
  page: number;
  limit: number;
  totalPages: number;
  totalItems: number;
}

export interface TodosWithPagination {
  todos: ITodo[];
  pagination: PaginationResult;
}
