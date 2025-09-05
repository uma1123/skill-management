import { dataStore } from "../utils/dataStore.js";

// 自己分析用データ取得
export const getSelfAnalysis = (req, res) => {
  try {
    const userId = req.user.id;
    console.log("自己分析データ取得 - ユーザーID:", userId);

    const userSkills = dataStore.getUserSkillsWithDetails(userId);
    console.log("取得したユーザースキル:", userSkills);

    const skillHistory = dataStore.getSkillHistory(userId);

    // getRecentSkillUpdatesは既に詳細情報が含まれている
    const recentUpdates = dataStore.getRecentSkillUpdates(userId, 30);
    console.log("最近の更新スキル（詳細付き）:", recentUpdates);

    // カテゴリ別平均レベル
    const categoryAverages = {};

    userSkills.forEach((skill) => {
      if (!categoryAverages[skill.skillCategory]) {
        categoryAverages[skill.skillCategory] = {
          totalLevel: 0,
          totalExperience: 0,
          count: 0,
          skills: [],
        };
      }
      categoryAverages[skill.skillCategory].totalLevel += skill.level;
      categoryAverages[skill.skillCategory].totalExperience +=
        skill.yearsOfExperience;
      categoryAverages[skill.skillCategory].count++;
      categoryAverages[skill.skillCategory].skills.push(skill);
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
      recentUpdates, // 既に詳細情報が含まれている
      balanceType,
      growthTrends,
      potentialAnalysis,
      message: "自己分析データを取得しました",
    };

    console.log("レスポンスデータ:", responseData);
    console.log("レスポンスのrecentUpdates:", responseData.recentUpdates);

    res.json(responseData);
  } catch (error) {
    console.error("自己分析データ取得エラー:", error);
    res.status(500).json({ error: "自己分析データ取得に失敗しました" });
  }
};

// 他のコントローラー関数も追加
export const getAllMembers = (req, res) => {
  try {
    const users = dataStore.getUsers();
    const allUserSkills = dataStore.getAllUserSkills();

    const membersWithSkills = users.map((user) => {
      const userSkillsList = dataStore.getUserSkillsWithDetails(user.id);

      // 統計計算
      const skillCount = userSkillsList.length;
      const averageLevel =
        skillCount > 0
          ? (
              userSkillsList.reduce((sum, skill) => sum + skill.level, 0) /
              skillCount
            ).toFixed(1)
          : "0.0";
      const totalExperience = userSkillsList.reduce(
        (sum, skill) => sum + skill.yearsOfExperience,
        0
      );
      const mainSkills = userSkillsList
        .filter((skill) => skill.level >= 3)
        .map((skill) => skill.skillName)
        .slice(0, 5);

      return {
        id: user.id,
        name: user.name,
        studentId: user.studentId,
        grade: user.grade,
        faculty: user.faculty,
        department: user.department,
        skills: userSkillsList,
        skillCount,
        averageLevel,
        totalExperience,
        mainSkills,
        bio: user.bio || "",
        profileImg: user.profileImg,
        github: user.github || "",
        sns: user.sns || "",
        linkedinUrl: user.linkedinUrl || "",
        websiteUrl: user.websiteUrl || "",
        portfolioUrl: user.portfolioUrl || "",
        interests: user.interests || [],
      };
    });

    res.json({
      members: membersWithSkills,
      message: "メンバー一覧を取得しました",
    });
  } catch (error) {
    console.error("メンバー取得エラー:", error);
    res.status(500).json({ error: "メンバー情報の取得に失敗しました" });
  }
};

export const getSkillStatistics = (req, res) => {
  try {
    const allSkills = dataStore.getAllSkills();
    const allUserSkills = dataStore.getAllUserSkills();

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

export const getSkillComparison = (req, res) => {
  try {
    const { targetUserId } = req.params;
    const currentUserId = req.user.id;

    const currentUserSkills = dataStore.getUserSkillsWithDetails(currentUserId);
    const targetUserSkills = dataStore.getUserSkillsWithDetails(
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
