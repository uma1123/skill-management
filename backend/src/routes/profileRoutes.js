import express from "express";
import { requireAuth } from "../middleware/auth.js"; // .js拡張子を追加
import {
  getMyProfile,
  getUserProfile,
  updateMyProfile,
} from "../controllers/profileController.js"; // .js拡張子を追加とupdateMyProfileを追加

const router = express.Router();

// GET /api/profile/me - 自分のプロフィールを取得（認証必須）
router.get("/me", requireAuth, getMyProfile);

// GET /api/profile/:userId - 他のユーザーのプロフィールを取得
router.get("/:userId", getUserProfile);

// PUT /api/profile/me - 自分のプロフィールを更新（認証必須）
router.put("/me", requireAuth, updateMyProfile);

export default router;
