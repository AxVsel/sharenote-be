import express from "express";
import {
  createTodoHandler,
  getTodosUser,
  getTodosId,
  updateTodoHandler,
  deleteTodoHandler,
  updateTodoShareUser,
} from "../controllers/todo-controller";
import { requireAuth } from "../middlewares/auth";
import { checkTodoEditPermission } from "../middlewares/sharecheck";

const router = express.Router();

router.post("/todos", requireAuth, createTodoHandler);
router.get("/todos", requireAuth, getTodosUser);
router.get("/todos/:id", requireAuth, getTodosId);
router.put("/todos/:id", requireAuth, updateTodoHandler);
router.put(
  "/todos-share/:id",
  requireAuth,
  checkTodoEditPermission,
  updateTodoShareUser
);
router.delete("/todos/:id", requireAuth, deleteTodoHandler);

export default router;
