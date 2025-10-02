import dotenv from "dotenv";
dotenv.config();

import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET as string;

export interface UserPayLoad {
  id: number;
  role?: string;
}

export function signToken(payload: UserPayLoad) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "1d" });
}

export function verifyToken(token: string) {
  return jwt.verify(token, JWT_SECRET) as UserPayLoad;
}

export function signResetToken(email: string) {
  return jwt.sign({ email }, JWT_SECRET, { expiresIn: "15m" });
}

export function verifyResetToken(token: string): { email: string } {
  return jwt.verify(token, JWT_SECRET) as { email: string };
}
