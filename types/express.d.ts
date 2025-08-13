import { User } from "@prisma/client"; // opsional

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        username?: string;
        email?: string;
      };
    }
  }
}
