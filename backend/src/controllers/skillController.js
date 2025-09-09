import { prismaDataStore } from "../utils/prismaDataStore.js";

// 全スキル一覧取得
export const getSkills = async (req, res) => {
  try {
    const skills = await prismaDataStore.getAllSkills();
    const skillsByCategory = await prismaDataStore.getSkillsByCategory();

    res.json({
      skills,
      skillsByCategory,
      message: "スキル一覧を取得しました",
    });
  } catch (error) {
    console.error("スキル取得エラー:", error);
    res.status(500).json({ error: "スキル取得に失敗しました" });
  }
};

export const getMySkills = async (req, res) => {
  try {
    const userId = req.user.id;
    const userSkills = await prismaDataStore.getUserSkillsWithDetails(userId);

    const userSkillsWithNames = userSkills.map((us) => ({
      ...us,
      skillName: us.skill?.name || "",
      skillCategory: us.skill?.category || "",
    }));
    res.json({
      skills: userSkillsWithNames,
      message: "スキル一覧を取得しました",
    });
  } catch (error) {
    console.error("スキル取得エラー:", error);
    res.status(500).json({ error: "スキル取得に失敗しました" });
  }
};

export const addOrUpdateSkill = async (req, res) => {
  try {
    const userId = req.user.id;
    const { skillId, level, yearsOfExperience, description } = req.body; // 変数名を修正

    if (!skillId || !level) {
      return res.status(400).json({ error: "スキルIDとレベルは必須です" });
    }

    if (level < 1 || level > 5) {
      return res
        .status(400)
        .json({ error: "レベルは1から5の範囲で指定してください" });
    }

    const skill = await prismaDataStore.getSkillById(skillId);
    if (!skill) {
      return res.status(404).json({ error: "指定されたスキルが存在しません" });
    }

    const userSkill = await prismaDataStore.addOrUpdateUserSkill(userId, {
      // 変数名を修正
      skillId,
      level,
      yearsOfExperience: yearsOfExperience || 0, // 変数名を修正
      description: description || "",
    });

    res.json({
      message: "スキルを登録しました",
      skill: {
        ...userSkill, // 変数名を修正
        skillName: skill.name,
        skillCategory: skill.category,
      },
    });
  } catch (error) {
    console.error("スキル登録エラー:", error);
    res.status(500).json({ error: "スキル登録に失敗しました" });
  }
};

export const removeSkill = async (req, res) => {
  try {
    const userId = req.user.id;
    const { skillId } = req.params;

    const removedSkill = await prismaDataStore.removeUserSkill(userId, skillId); // 変数名と引数を修正

    if (!removedSkill) {
      // 変数名を修正
      return res.status(404).json({ error: "指定されたスキルが存在しません" });
    }

    res.json({
      message: "スキルを削除しました",
      removedSkill, // 変数名を修正
    });
  } catch (error) {
    console.error("スキル削除エラー:", error);
    res.status(500).json({ error: "スキル削除に失敗しました" });
  }
};

export const updateMultipleSkills = async (req, res) => {
  try {
    const userId = req.user.id;
    const { skills } = req.body;

    if (!Array.isArray(skills)) {
      return res.status(400).json({
        error: "スキルは配列形式で送信してください",
      });
    }

    const updatedSkills = [];
    const errors = [];

    for (let index = 0; index < skills.length; index++) {
      const skillData = skills[index];
      try {
        const { skillId, level, yearsOfExperience, description } = skillData;

        // バリデーション
        if (!skillId || !level) {
          errors.push(`スキル${index + 1}: スキルIDとレベルは必須です`);
          continue;
        }

        if (level < 1 || level > 5) {
          errors.push(
            `スキル${index + 1}: レベルは1〜5の範囲で入力してください`
          );
          continue;
        }

        const skill = await prismaDataStore.getSkillById(skillId);
        if (!skill) {
          errors.push(`スキル${index + 1}: 指定されたスキルが見つかりません`);
          continue;
        }

        const userSkill = await prismaDataStore.addOrUpdateUserSkill(userId, {
          skillId,
          level,
          yearsOfExperience: yearsOfExperience || 0,
          description: description || "",
        });

        updatedSkills.push({
          ...userSkill,
          skillName: skill.name,
          skillCategory: skill.category,
        });
      } catch (err) {
        errors.push(`スキル${index + 1}: ${err.message}`);
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({
        error: "一部のスキル更新に失敗しました",
        errors,
        updatedSkills,
      });
    }

    res.json({
      message: `${updatedSkills.length}件のスキルを更新しました`,
      skills: updatedSkills,
    });
  } catch (error) {
    console.error("スキル一括更新エラー:", error);
    res.status(500).json({ error: "スキル更新に失敗しました" });
  }
};
