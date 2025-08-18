import express from "express";
import { register, login, getMe } from "../controllers/authController.js";

const router = express.Router();

// POST /api/auth/register - 新規登録
router.post("/register", register);

// POST /api/auth/login - ログイン
router.post("/login", login);

// GET /api/auth/me - 現在のユーザー情報を取得
router.get("/me", getMe);

export default router;
