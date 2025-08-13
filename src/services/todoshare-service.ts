// src/services/todoSharedUserService.ts
import { prisma } from "../prisma/client";

// Share todo ke user lain
export async function shareTodoWithUser(
  todoId: number,
  sharedWithUserId: number,
  canEdit: boolean
) {
  return prisma.todoSharedUser.create({
    data: {
      todoId: Number(todoId), // pastikan integer
      sharedWithUserId: Number(sharedWithUserId), // pastikan integer
      canEdit,
    },
  });
}

// Ambil semua todo yang di-share ke user tertentu
export async function getTodosSharedWithUser(userId: number) {
  return prisma.todoSharedUser.findMany({
    where: {
      sharedWithUserId: userId,
    },
    include: {
      todo: true, // ikut sertakan detail todo
    },
  });
}

// Hapus share (unshare)
export async function unshareTodo(id: number) {
  return prisma.todoSharedUser.deleteMany({
    where: { id },
  });
}

export async function updateTodoSharePermission(
  todoId: number,
  sharedWithUserId: number,
  canEdit: boolean
) {
  const existing = await prisma.todoSharedUser.findUnique({
    where: {
      todoId_sharedWithUserId: {
        todoId,
        sharedWithUserId,
      },
    },
  });

  if (!existing) {
    throw new Error("Shared todo entry not found");
  }

  return prisma.todoSharedUser.update({
    where: {
      todoId_sharedWithUserId: {
        todoId,
        sharedWithUserId,
      },
    },
    data: {
      canEdit,
    },
  });
}
