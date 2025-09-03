import express from "express";
import {
  getAllMembers,
  getSkillComparison,
  getSkillStatistics,
} from "../controllers/memberController.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

// 全メンバー取得
router.get("/", requireAuth, getAllMembers);

// スキル統計取得
router.get("/statistics", requireAuth, getSkillStatistics);

// スキル比較取得
router.get("/compare/:targetUserId", requireAuth, getSkillComparison);

export default router;
