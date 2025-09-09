import { prismaDataStore } from "../utils/prismaDataStore.js";

// 自己分析用データ取得
export const getSelfAnalysis = async (req, res) => {
  try {
    const userId = req.user.id;
    const userSkillsRaw = await prismaDataStore.getUserSkillsWithDetails(
      userId
    );

    // skillName, skillCategoryを必ず展開
    const userSkills = userSkillsRaw.map((us) => ({
      ...us,
      skillName: us.skill?.name || "",
      skillCategory: us.skill?.category || "未分類",
    }));

    const skillHistory = await prismaDataStore.getSkillHistory(userId);
    const recentUpdatesRaw = await prismaDataStore.getRecentSkillUpdates(
      userId,
      30
    );
    const recentUpdates = recentUpdatesRaw.map((us) => ({
      ...us,
      skillName: us.skill?.name || "",
      skillCategory: us.skill?.category || "未分類",
    }));

    // カテゴリ別平均レベル
    const categoryAverages = {};
    userSkills.forEach((skill) => {
      const category = skill.skillCategory || "未分類";
      if (!categoryAverages[category]) {
        categoryAverages[category] = {
          totalLevel: 0,
          totalExperience: 0,
          count: 0,
          skills: [],
        };
      }
      categoryAverages[category].totalLevel += skill.level;
      categoryAverages[category].totalExperience += skill.yearsOfExperience;
      categoryAverages[category].count++;
      categoryAverages[category].skills.push(skill);
    });

    // 平均値計算
    Object.keys(categoryAverages).forEach((category) => {
      const data = categoryAverages[category];
      categoryAverages[category].averageLevel = (
        data.totalLevel / data.count
      ).toFixed(1);
      categoryAverages[category].averageExperience = (
        data.totalExperience / data.count
      ).toFixed(1);
    });

    // バランスタイプ判定
    const balanceType = analyzeBalanceType(categoryAverages);

    // 成長傾向分析
    const growthTrends = analyzeGrowthTrends(skillHistory, userSkills);

    // 伸びしろ分析
    const potentialAnalysis = analyzePotential(userSkills);

    const responseData = {
      userSkills,
      categoryAverages,
      skillHistory,
      recentUpdates,
      balanceType,
      growthTrends,
      potentialAnalysis,
      message: "自己分析データを取得しました",
    };

    res.json(responseData);
  } catch (error) {
    console.error("自己分析データ取得エラー:", error);
    res.status(500).json({ error: "自己分析データ取得に失敗しました" });
  }
};

export const getMemberDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await prismaDataStore.findUserById(id);
    if (!user) {
      return res.status(404).json({ error: "ユーザーが見つかりません" });
    }
    const skills = await prismaDataStore.getUserSkillsWithDetails(id);

    res.json({
      id: user.id,
      name: user.name,
      studentId: user.studentId,
      grade: user.grade,
      faculty: user.faculty,
      department: user.department,
      bio: user.bio || "",
      profileImg: user.profileImg || null,
      github: user.github || "",
      sns: user.sns || "",
      linkedinUrl: user.linkedinUrl || "",
      websiteUrl: user.websiteUrl || "",
      portfolioUrl: user.portfolioUrl || "",
      interests: user.interests || [],
      skills: skills.map((us) => ({
        id: us.skillId,
        name: us.skill?.name || "",
        category: us.skill?.category || "",
        level: us.level,
        yearsOfExperience: us.yearsOfExperience,
        description: us.description,
      })),
    });
  } catch (error) {
    console.error("メンバー詳細取得エラー:", error);
    res.status(500).json({ error: "メンバー詳細の取得に失敗しました" });
  }
};

export const getAllMembers = async (req, res) => {
  try {
    const users = await prismaDataStore.getUsers();

    const members = await Promise.all(
      users.map(async (user) => {
        const userSkillsList = await prismaDataStore.getUserSkillsWithDetails(
          user.id
        );

        // スキル名が空やnullでないものだけをmainSkillsに
        const mainSkills = userSkillsList
          .filter(
            (skill) => skill.level >= 3 && skill.skill && skill.skill.name
          )
          .map((skill) => skill.skill.name)
          .slice(0, 5);

        return {
          id: user.id,
          name: user.name,
          studentId: user.studentId,
          grade: user.grade,
          faculty: user.faculty,
          department: user.department,
          skills: userSkillsList,
          skillCount: userSkillsList.length,
          averageLevel:
            userSkillsList.length > 0
              ? (
                  userSkillsList.reduce((sum, s) => sum + s.level, 0) /
                  userSkillsList.length
                ).toFixed(1)
              : "0.0",
          totalExperience: userSkillsList.reduce(
            (sum, s) => sum + (s.yearsOfExperience || 0),
            0
          ),
          mainSkills, // ←ここ
          bio: user.bio || "",
          profileImg: user.profileImg || null,
          github: user.github || "",
          sns: user.sns || "",
          linkedinUrl: user.linkedinUrl || "",
          websiteUrl: user.websiteUrl || "",
          portfolioUrl: user.portfolioUrl || "",
          interests: user.interests || [],
        };
      })
    );

    res.json({ members });
  } catch (error) {
    console.error("メンバー一覧取得エラー:", error);
    res.status(500).json({ error: "メンバー一覧の取得に失敗しました" });
  }
};

export const getSkillStatistics = async (req, res) => {
  try {
    const allSkills = await prismaDataStore.getAllSkills();
    const allUserSkills = await prismaDataStore.getAllUserSkills();

    res.json({
      totalSkills: allSkills.length,
      totalUserSkills: allUserSkills.length,
      message: "統計情報を取得しました",
    });
  } catch (error) {
    console.error("統計情報取得エラー:", error);
    res.status(500).json({ error: "統計情報の取得に失敗しました" });
  }
};

export const getSkillComparison = async (req, res) => {
  try {
    const { targetUserId } = req.params;
    const currentUserId = req.user.id;

    const currentUserSkills = await prismaDataStore.getUserSkillsWithDetails(
      currentUserId
    );
    const targetUserSkills = await prismaDataStore.getUserSkillsWithDetails(
      parseInt(targetUserId)
    );

    res.json({
      currentUserSkills,
      targetUserSkills,
      message: "スキル比較データを取得しました",
    });
  } catch (error) {
    console.error("スキル比較エラー:", error);
    res.status(500).json({ error: "スキル比較データの取得に失敗しました" });
  }
};

function analyzeBalanceType(categoryAverages) {
  const categories = Object.keys(categoryAverages);
  if (categories.length === 0)
    return {
      type: "未分類",
      description: "スキルが登録されていません",
      score: "0.0",
    };

  const levels = categories.map((cat) =>
    parseFloat(categoryAverages[cat].averageLevel)
  );
  const maxLevel = Math.max(...levels);
  const minLevel = Math.min(...levels);
  const variance = maxLevel - minLevel;

  if (variance <= 1) {
    return {
      type: "バランス型",
      description: "様々な分野で均等にスキルを持っています",
      score: variance.toFixed(1),
    };
  } else if (variance <= 2) {
    return {
      type: "やや専門特化型",
      description: "いくつかの分野で特に強みがあります",
      score: variance.toFixed(1),
    };
  } else {
    return {
      type: "専門特化型",
      description: "特定の分野に強みが集中しています",
      score: variance.toFixed(1),
    };
  }
}

function analyzeGrowthTrends(skillHistory, userSkills) {
  const recentHistory = skillHistory.filter((h) => {
    const historyDate = new Date(h.timestamp);
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 90); // 過去3カ月
    return historyDate > cutoff;
  });

  const categoryGrowth = {};

  recentHistory.forEach((history) => {
    const skill = userSkills.find((s) => s.skillId === history.skillId);
    if (skill) {
      if (!categoryGrowth[skill.skillCategory]) {
        categoryGrowth[skill.skillCategory] = {
          updates: 0,
          levelUps: 0,
          lastUpdate: history.timestamp,
        };
      }
      categoryGrowth[skill.skillCategory].updates++;
      if (
        history.action === "update" &&
        history.previousLevel &&
        history.newLevel > history.previousLevel
      ) {
        categoryGrowth[skill.skillCategory].levelUps++;
      }
    }
  });

  return categoryGrowth;
}

// 伸びしろ分析
function analyzePotential(userSkills) {
  const highExperienceLowLevel = userSkills.filter(
    (skill) => skill.yearsOfExperience >= 2 && skill.level <= 3
  );

  const recentlyUntouched = userSkills.filter((skill) => {
    const updateDate = new Date(skill.updatedAt);
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 180); // 過去6カ月
    return updateDate < cutoff;
  });

  return {
    highExperienceLowLevel,
    recentlyUntouched,
    recommendations: [
      ...highExperienceLowLevel.map((skill) => ({
        type: "level_up",
        skill: skill.skillName,
        message: `${skill.skillName}は${skill.yearsOfExperience}年の経験があります。レベルアップしましょう！`,
      })),
      ...recentlyUntouched.slice(0, 3).map((skill) => ({
        type: "refresh",
        skill: skill.skillName,
        message: `${skill.skillName}は最近更新されていません。スキルを見直しましょう！`,
      })),
    ],
  };
}
