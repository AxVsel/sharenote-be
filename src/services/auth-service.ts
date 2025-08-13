import { prisma } from "../prisma/client";
import bcrypt from "bcrypt";

export async function registerUser(
  username: string,
  fullname: string,
  email: string,
  password: string
) {
  // Cek apakah email sudah dipakai
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    throw new Error("Email already registered");
  }
  // Hash password
  const passwordHash = await bcrypt.hash(password, 10);
  // Simpan user baru
  const user = await prisma.user.create({
    data: { username, fullname, email, passwordHash },
  });

  return { user };
}

export async function loginUser(identifier: string, password: string) {
  try {
    // console.log("📥 Input:", identifier, password);
    const user = await prisma.user.findFirst({
      where: {
        OR: [{ email: identifier }, { username: identifier }],
      },
    });

    if (!user) {
      console.log("❌ User not found");
      return null;
    }
    console.log("✅ User found:", user);

    if (!user?.passwordHash) {
      console.log("❌ Password null");
      return null;
    }
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    console.log("🔐 Password valid?", isPasswordValid);
    if (!isPasswordValid) return null;

    return user;
  } catch (error) {
    console.error("❌ Error in loginUser:", error);
    throw error;
  }
}
