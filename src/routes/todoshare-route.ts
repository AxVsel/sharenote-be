// src/routes/todoSharedUserRoutes.ts
import express from "express";
import {
  handleShareTodo,
  handleGetTodosSharedWithUser,
  handleUnshareTodo,
  handleUpdateSharePermission,
} from "../controllers/todoshare-controller";
import { requireAuth } from "../middlewares/auth";

const router = express.Router();

router.post("/share", requireAuth, handleShareTodo);
router.put("/share/permission", requireAuth, handleUpdateSharePermission);
router.get("/shared-to-me", requireAuth, handleGetTodosSharedWithUser);
router.delete("/unshare/:id", requireAuth, handleUnshareTodo);

export default router;
