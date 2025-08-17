// src/controllers/todoSharedUserController.ts
import { Request, Response } from "express";
import {
  shareTodoWithUser,
  getTodosSharedWithUser,
  unshareTodo,
  updateTodoSharePermission,
  getTodosSharedByOwner,
} from "../services/todoshare-service";
import { prisma } from "../prisma/client";

export async function handleShareTodo(req: Request, res: Response) {
  try {
    const ownerId = Number((req as any).user?.id);
    const { todoId, sharedWithEmail, canEdit } = req.body;

    if (!todoId || !sharedWithEmail) {
      return res
        .status(400)
        .json({ message: "todoId dan sharedWithEmail wajib diisi." });
    }

    // Cek todo milik user
    const todo = await prisma.todo.findUnique({
      where: { id: Number(todoId) },
    });

    if (!todo) {
      return res.status(404).json({ message: "Todo tidak ditemukan." });
    }
    if (todo.ownerId !== ownerId) {
      return res
        .status(403)
        .json({ message: "Anda tidak berhak membagikan todo ini." });
    }

    // Cek apakah email penerima ada
    const sharedUser = await prisma.user.findUnique({
      where: { email: sharedWithEmail },
    });

    if (!sharedUser) {
      return res
        .status(404)
        .json({ message: "User dengan email tersebut tidak ditemukan." });
    }

    // Cek apakah sudah pernah dibagikan ke user ini
    const existingShare = await prisma.todoSharedUser.findUnique({
      where: {
        todoId_sharedWithUserId: {
          todoId: Number(todoId),
          sharedWithUserId: sharedUser.id,
        },
      },
    });

    if (existingShare) {
      return res.status(409).json({
        code: 409,
        status: "error",
        message: "Todo sudah dibagikan ke user ini sebelumnya.",
      });
    }

    // Share todo
    const sharedTodo = await shareTodoWithUser(
      Number(todoId),
      sharedUser.id,
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
    const userId = Number((req as any).user?.id); // user yang login
    const { id } = req.params; // ini id dari tabel TodoSharedUser

    if (!id) {
      return res.status(400).json({
        message: "id share wajib diisi.",
      });
    }
    // Cari record share + todo-nya
    const sharedRecord = await prisma.todoSharedUser.findUnique({
      where: { id: Number(id) },
      include: { todo: true },
    });

    if (!sharedRecord) {
      return res.status(404).json({ message: "Data share tidak ditemukan." });
    }
    // Cek apakah user yang login boleh menghapus:
    // - owner dari todo, atau
    // - user yang di-share
    if (
      sharedRecord.todo.ownerId !== userId &&
      sharedRecord.sharedWithUserId !== userId
    ) {
      return res.status(403).json({
        message: "Anda tidak memiliki izin untuk unshare todo ini.",
      });
    }

    // Hapus share
    await prisma.todoSharedUser.delete({
      where: { id: Number(id) },
    });

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
    const ownerId = Number((req as any).user?.id); // user login
    const { todoId, sharedWithUserId, canEdit } = req.body;

    if (!todoId || !sharedWithUserId) {
      return res
        .status(400)
        .json({ message: "todoId dan sharedWithUserId wajib diisi" });
    }

    if (typeof canEdit !== "boolean") {
      return res.status(400).json({ message: "canEdit harus boolean" });
    }
    // Pastikan todo ini memang milik user yang login
    const todo = await prisma.todo.findUnique({
      where: { id: Number(todoId) },
      select: { ownerId: true },
    });

    if (!todo) {
      return res.status(404).json({ message: "Todo tidak ditemukan" });
    }

    if (todo.ownerId !== ownerId) {
      return res.status(403).json({
        message:
          "Anda tidak memiliki izin untuk mengubah permission share todo ini",
      });
    }
    // Lakukan update permission
    const updated = await updateTodoSharePermission(
      Number(todoId),
      Number(sharedWithUserId),
      canEdit
    );

    return res.json({
      message: "Permission updated successfully",
      data: updated,
    });
  } catch (error: any) {
    console.error("Update share permission error:", error);
    return res
      .status(500)
      .json({ message: error.message || "Internal server error" });
  }
}

export async function HandleYourShare(req: Request, res: Response) {
  try {
    const ownerId = Number((req as any).user?.id); // Ambil dari JWT
    const todos = await getTodosSharedByOwner(ownerId);

    const formattedTodos = todos.map((todo: any) => ({
      ...todo,
      sharedToName: todo.sharedWith?.[0]?.sharedWithUser?.username || null,
    }));

    return res.status(200).json({
      code: 200,
      status: "success",
      data: formattedTodos,
    });
  } catch (err: any) {
    console.error("❌ Error get shared todos by owner:", err);
    return res.status(500).json({
      code: 500,
      status: "error",
      message: "Terjadi kesalahan pada server.",
    });
  }
}
