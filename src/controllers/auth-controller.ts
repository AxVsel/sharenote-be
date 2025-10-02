import { Request, Response } from "express";
import { registerUser, loginUser } from "../services/auth-service";
import { signToken } from "../utils/jwt";

export async function handleRegister(req: Request, res: Response) {
  try {
    const { username, fullname, email, passwordHash } = req.body;

    if (!username || !fullname || !email || !passwordHash) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const { user } = await registerUser(
      username,
      fullname,
      email,
      passwordHash
    );
    const token = signToken({ id: user.id });
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000,
      sameSite: "lax",
    });
    res.status(201).json({
      code: 200,
      status: "success",
      message: "Register successful.",
      user: {
        id: user.id,
        username: user.username,
        fullname: user.fullname,
        email: user.email,
        token,
      },
    });
  } catch (err: any) {
    console.error("❌ Error Register:", err.message);
    return res.status(500).json({
      code: 500,
      status: "error",
      message: err.message || "Terjadi kesalahan pada server",
    });
  }
}

export async function handleLogin(req: Request, res: Response) {
  try {
    const { identifier, passwordHash } = req.body;
    const user = await loginUser(identifier, passwordHash);

    if (!user) {
      return res.status(401).json({
        code: 401,
        status: "error",
        message: "Username/email atau password salah.",
      });
    }
    const token = signToken({ id: user.id });
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000,
      sameSite: "lax",
    });

    return res.status(200).json({
      code: 200,
      status: "success",
      message: "Login successful.",
      user: {
        id: user.id,
        username: user.username,
        fullname: user.fullname,
        email: user.email,
        token,
      },
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

export async function handleLogout(req: Request, res: Response) {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/", // agar cookie benar-benar terhapus
    });
    return res.status(200).json({
      code: 200,
      status: "success",
      message: "Logout berhasil.",
    });
  } catch (err) {
    console.error("❌ Error Logout:", err);
    return res.status(500).json({
      code: 500,
      status: "error",
      message: "Terjadi kesalahan saat logout.",
    });
  }
}
