import express from "express";
import {
  handleLogin,
  handleRegister,
  handleLogout,
} from "../controllers/auth-controller";
const router = express.Router();

router.post("/register", handleRegister);
router.post("/login", handleLogin);
router.post("/logout", handleLogout);

export default router;
