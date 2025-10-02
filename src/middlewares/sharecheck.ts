// middlewares/checkTodoEditPermission.ts
import { Request, Response, NextFunction } from "express";
import { prisma } from "../prisma/client";

export async function checkTodoEditPermission(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = (req as any).user.id;
    const todoId = Number(req.params.id || req.body.todoId);

    if (!todoId) {
      return res.status(400).json({ message: "todoId is required" });
    }

    // Cek apakah user adalah owner
    const todo = await prisma.todo.findFirst({
      where: {
        id: todoId,
        ownerId: userId,
      },
    });

    if (todo) {
      return next(); // Owner selalu bisa edit
    }

    // Cek apakah user punya share dengan izin edit
    const shared = await prisma.todoSharedUser.findFirst({
      where: {
        todoId,
        sharedWithUserId: userId,
        canEdit: true,
      },
    });

    if (!shared) {
      return res
        .status(403)
        .json({ message: "You don't have permission to edit this todo" });
    }

    next();
  } catch (error) {
    console.error("checkTodoEditPermission error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
