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
      todoId: Number(todoId),
      sharedWithUserId: Number(sharedWithUserId),
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
      todo: {
        include: {
          owner: {
            select: {
              username: true,
            },
          },
        },
      },
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

export async function getTodosSharedByOwner(ownerId: number) {
  return prisma.todo.findMany({
    where: {
      ownerId, // hanya todo yang dimiliki user ini
      sharedWith: {
        some: {}, // hanya yang sudah di-share
      },
    },
    include: {
      sharedWith: {
        include: {
          sharedWithUser: {
            select: {
              id: true,
              email: true,
              username: true,
              fullname: true,
            },
          },
        },
      },
    },
  });
}
