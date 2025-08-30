import express from "express";
import {
  getSkills,
  getMySkills,
  addOrUpdateSkill,
  removeSkill,
  updateMultipleSkills,
} from "../controllers/skillController.js";
import { requireAuth } from "../middleware/auth.js"; // requireではなくimportを使用

const router = express.Router();

router.get("/", getSkills);
router.get("/me", requireAuth, getMySkills);
router.post("/me", requireAuth, addOrUpdateSkill);
router.delete("/me/:skillId", requireAuth, removeSkill); // パスを修正
router.put("/me", requireAuth, updateMultipleSkills); // パスを修正

export default router;
