// src/controllers/todoSharedUserController.ts
import { Request, Response } from "express";
import {
  shareTodoWithUser,
  getTodosSharedWithUser,
  unshareTodo,
  updateTodoSharePermission,
} from "../services/todoshare-service";

export async function handleShareTodo(req: Request, res: Response) {
  try {
    const ownerId = Number((req as any).user?.id);
    const { todoId, sharedWithUserId, canEdit } = req.body;

    if (!todoId || !sharedWithUserId) {
      return res
        .status(400)
        .json({ message: "todoId dan sharedWithUserId wajib diisi." });
    }

    const sharedTodo = await shareTodoWithUser(
      todoId,
      sharedWithUserId,
      canEdit ?? false
    );

    return res.status(201).json({
      code: 201,
      status: "success",
      message: "Todo berhasil di-share.",
      data: sharedTodo,
    });
  } catch (err: any) {
    console.error("❌ Error share todo:", err);
    return res.status(500).json({
      code: 500,
      status: "error",
      message: "Terjadi kesalahan pada server.",
    });
  }
}

export async function handleGetTodosSharedWithUser(
  req: Request,
  res: Response
) {
  try {
    const userId = Number((req as any).user?.id);
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const sharedTodos = await getTodosSharedWithUser(userId);

    if (sharedTodos.length === 0) {
      return res.status(200).json({
        code: 200,
        status: "success",
        message: "Belum ada todo yang di-share ke kamu.",
        todos: [],
      });
    }

    return res.status(200).json({
      code: 200,
      status: "success",
      message: "Berhasil mendapatkan todos yang di-share.",
      todos: sharedTodos,
    });
  } catch (err: any) {
    console.error("❌ Error get shared todos:", err);
    return res.status(500).json({
      code: 500,
      status: "error",
      message: "Terjadi kesalahan pada server.",
    });
  }
}

export async function handleUnshareTodo(req: Request, res: Response) {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        message: "todoId wajib diisi.",
      });
    }

    // Panggil service untuk unshare
    await unshareTodo(parseInt(id));

    return res.status(200).json({
      code: 200,
      status: "success",
      message: "Todo berhasil di-unshare.",
    });
  } catch (err: any) {
    console.error("❌ Error unshare todo:", err);
    return res.status(500).json({
      code: 500,
      status: "error",
      message: "Terjadi kesalahan pada server.",
    });
  }
}

export async function handleUpdateSharePermission(req: Request, res: Response) {
  try {
    const { todoId, sharedWithUserId, canEdit } = req.body;

    if (typeof canEdit !== "boolean") {
      return res.status(400).json({ message: "canEdit harus boolean" });
    }

    const updated = await updateTodoSharePermission(
      Number(todoId),
      Number(sharedWithUserId),
      canEdit
    );

    res.json({ message: "Permission updated successfully", data: updated });
  } catch (error: any) {
    console.error("Update share permission error:", error);
    res.status(500).json({ message: error.message || "Internal server error" });
  }
}
