import express from "express";
import {
  getAllMembers,
  getSkillComparison,
  getSkillStatistics,
  getSelfAnalysis,
  getMemberDetail,
} from "../controllers/memberController.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

// 全メンバー取得
router.get("/", requireAuth, getAllMembers);

// スキル統計取得
router.get("/statistics", requireAuth, getSkillStatistics);

// スキル比較取得
router.get("/compare/:targetUserId", requireAuth, getSkillComparison);

// 自己分析データ取得
router.get("/self-analysis", requireAuth, getSelfAnalysis);

// 特定メンバー詳細取得
router.get("/:id", requireAuth, getMemberDetail);

export default router;
