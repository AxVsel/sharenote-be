import { prisma } from "../prisma/client";

export interface GetTodosOptions {
  ownerId: number;
  page?: number;
  limit?: number;
  isCompleted?: boolean;
  sortBy?: "newest" | "oldest";
  priority?: number;
}

export async function getTodosByOwner({
  ownerId,
  page = 1,
  limit = 10,
  isCompleted,
  sortBy = "newest",
  priority,
}: GetTodosOptions) {
  const where: any = { ownerId };

  if (typeof isCompleted === "boolean") {
    where.isCompleted = isCompleted;
  }
  if (priority !== undefined) {
    where.priority = priority;
  }

  // hitung total data
  const total = await prisma.todo.count({ where });
  const totalPages = Math.ceil(total / limit);

  // kalau page > totalPages, kunci ke totalPages (atau 1 kalau total=0)
  const safePage = page > totalPages ? totalPages || 1 : page;
  const skip = (safePage - 1) * limit;

  const orderBy =
    sortBy === "oldest"
      ? { createdAt: "asc" as const }
      : { createdAt: "desc" as const };

  const todos = await prisma.todo.findMany({
    where,
    skip,
    take: limit,
    orderBy,
  });

  return {
    data: todos,
    pagination: {
      total,
      page: safePage,
      limit,
      totalPages,
    },
  };
}

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

export async function isTodoShared(todoId: number): Promise<boolean> {
  const result = await prisma.todoSharedUser.findFirst({
    where: { todoId },
  });
  return !!result;
}
