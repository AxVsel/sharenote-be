import { prisma } from "../prisma/client";

export async function createTodo(data: {
  ownerId: number;
  title: string;
  description?: string | null;
  dueDate?: Date | null;
  priority?: number;
}) {
  return prisma.todo.create({
    data: {
      ownerId: data.ownerId,
      title: data.title,
      description: data.description ?? null,
      dueDate: data.dueDate ?? null,
      priority: data.priority ?? 0,
    },
  });
}

export async function getTodoById(id: number) {
  return prisma.todo.findUnique({
    where: { id },
    include: {
      owner: true,
      sharedWith: true,
    },
  });
}

export async function getTodosByOwner(ownerId: number) {
  return prisma.todo.findMany({
    where: { ownerId },
    orderBy: { dueDate: "asc" },
  });
}

export async function updateTodo(
  id: number,
  data: {
    title?: string;
    description?: string;
    isCompleted?: boolean;
    dueDate?: Date;
    priority?: number;
  }
) {
  return prisma.todo.update({
    where: { id },
    data,
  });
}

export async function updateTodoContent(
  todoId: number,
  ownerId: number,
  title: string,
  description: string
) {
  // Cari todo
  const todo = await prisma.todo.findUnique({
    where: { id: todoId },
    select: { ownerId: true }, // userId = pemilik todo
  });

  if (!todo) throw new Error("Todo tidak ditemukan");

  // Kalau bukan pemilik
  if (todo.ownerId !== ownerId) {
    // Cek apakah user dibagikan dan bisa edit
    const shared = await prisma.todoSharedUser.findUnique({
      where: {
        todoId_sharedWithUserId: {
          todoId,
          sharedWithUserId: ownerId,
        },
      },
    });

    if (!shared || !shared.canEdit) {
      throw new Error("Anda tidak memiliki izin untuk mengedit todo ini");
    }
  }

  // Update todo
  return prisma.todo.update({
    where: { id: todoId },
    data: { title, description },
  });
}

export async function deleteTodo(id: number) {
  return prisma.todo.delete({
    where: { id },
  });
}
