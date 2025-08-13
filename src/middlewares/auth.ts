import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt"; // pastikan ini mengembalikan payload token yang sudah didecode

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      code: 401,
      status: "unauthorized",
      message: "Token tidak ditemukan. Silakan login terlebih dahulu.",
    });
  }

  try {
    const decoded = verifyToken(token);
    (req as any).user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({
      code: 401,
      status: "unauthorized",
      message: "Token tidak valid atau telah kedaluwarsa.",
    });
  }
}
