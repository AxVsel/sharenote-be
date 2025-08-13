import { Request, Response } from "express";
import {
  createTodo,
  getTodoById,
  getTodosByOwner,
  updateTodo,
  deleteTodo,
  updateTodoContent,
} from "../services/todo-service";

export async function createTodoHandler(req: Request, res: Response) {
  try {
    const ownerId = Number((req as any).user?.id);
    if (!ownerId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { title, description, dueDate, priority } = req.body;

    if (!title) {
      return res.status(400).json({ message: "Title is required" });
    }

    // Buat objek data secara dinamis agar tidak menyertakan properti dueDate jika undefined
    const todoData: {
      ownerId: number;
      title: string;
      description?: string | null;
      dueDate?: Date | null;
      priority?: number;
    } = {
      ownerId,
      title,
      description,
      priority,
    };

    if (dueDate) {
      todoData.dueDate = new Date(dueDate);
    }

    const newTodo = await createTodo(todoData);

    return res.status(200).json({
      code: 200,
      status: "success",
      message: "Create todo successful.",
      newTodo,
    });
  } catch (err: any) {
    console.error("❌ Error Login:", err);
    return res.status(500).json({
      code: 500,
      status: "error",
      message: "Terjadi kesalahan pada server.",
    });
  }
}

export async function getTodosId(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    const todo = await getTodoById(id); // pake yang diimport langsung
    if (!todo) {
      return res.status(404).json({ message: "Todo not found" });
    }

    return res.status(200).json({
      code: 200,
      status: "success",
      message: "find todo by id successful.",
      todo,
    });
  } catch (err: any) {
    console.error("❌ Error Login:", err);
    return res.status(500).json({
      code: 500,
      status: "error",
      message: "Terjadi kesalahan pada server.",
    });
  }
}

export async function getTodosUser(req: Request, res: Response) {
  try {
    const ownerId = Number((req as any).user?.id);
    if (!ownerId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const todos = await getTodosByOwner(ownerId);

    if (!todos || todos.length === 0) {
      return res.status(200).json({
        code: 200,
        status: "success",
        message: "Kamu belum create todo.",
        todos: [],
      });
    }

    return res.status(200).json({
      code: 200,
      status: "success",
      message: "find user todo successful.",
      todos,
    });
  } catch (err: any) {
    console.error("❌ Error Login:", err);
    return res.status(500).json({
      code: 500,
      status: "error",
      message: "Terjadi kesalahan pada server.",
    });
  }
}

export async function updateTodoHandler(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    const data = req.body;
    const updated = await updateTodo(id, data);
    return res.status(200).json({
      code: 200,
      status: "success",
      message: "Create todo successful.",
      updated,
    });
  } catch (err: any) {
    console.error("❌ Error Login:", err);
    return res.status(500).json({
      code: 500,
      status: "error",
      message: "Terjadi kesalahan pada server.",
    });
  }
}

export async function updateTodoShareUser(req: Request, res: Response) {
  try {
    const todoId = Number(req.params.id);
    const ownerId = (req as any).user.id; // dari middleware requireAuth
    const { title, description } = req.body;

    const updatedTodo = await updateTodoContent(
      todoId,
      ownerId,
      title,
      description
    );

    res.json(updatedTodo);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
}

export async function deleteTodoHandler(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    await deleteTodo(id);
    return res.status(200).json({
      code: 200,
      status: "success",
      message: "Create todo successful.",
      id,
    });
  } catch (err: any) {
    console.error("❌ Error Login:", err);
    return res.status(500).json({
      code: 500,
      status: "error",
      message: "Terjadi kesalahan pada server.",
    });
  }
}
