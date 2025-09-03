import { dataStore } from "../utils/dataStore.js";

// 全メンバーの情報とスキルを取得
export const getAllMembers = (req, res) => {
  try {
    const users = dataStore.getUsers();

    const membersWithSkills = users.map((user) => {
      const { password, ...userInfo } = user;
      const userSkills = dataStore.getUserSkillsWithDetails(user.id);

      return {
        ...userInfo,
        skills: userSkills,
        skillCount: userSkills.length,
        averageLevel:
          userSkills.length > 0
            ? (
                userSkills.reduce((sum, skill) => sum + skill.level, 0) /
                userSkills.length
              ).toFixed(1)
            : 0,
        totalExperience: userSkills.reduce(
          (sum, skill) => sum + skill.yearsOfExperience,
          0
        ),
        mainSkills: userSkills
          .sort((a, b) => b.level - a.level)
          .slice(0, 5)
          .map((skill) => skill.skillName),
      };
    });

    res.json({
      members: membersWithSkills,
      totalMembers: membersWithSkills.length,
      message: "メンバー一覧を取得しました",
    });
  } catch (error) {
    console.error("メンバー一覧取得エラー:", error);
    res.status(500).json({ error: "メンバー一覧取得に失敗しました" });
  }
};

// スキル統計情報を取得
export const getSkillStatistics = (req, res) => {
  try {
    const allUserSkills = dataStore.getAllUserSkills();
    const allSkills = dataStore.getAllSkills();
    const allUsers = dataStore.getUsers();

    // スキル別統計
    const skillStats = {};
    allSkills.forEach((skill) => {
      const userSkillsForThisSkill = allUserSkills.filter(
        (us) => us.skillId === skill.id
      );
      skillStats[skill.id] = {
        skillName: skill.name,
        category: skill.category,
        userCount: userSkillsForThisSkill.length,
        penetrationRate: (
          (userSkillsForThisSkill.length / allUsers.length) *
          100
        ).toFixed(1),
        averageLevel:
          userSkillsForThisSkill.length > 0
            ? (
                userSkillsForThisSkill.reduce((sum, us) => sum + us.level, 0) /
                userSkillsForThisSkill.length
              ).toFixed(1)
            : 0,
        averageExperience:
          userSkillsForThisSkill.length > 0
            ? (
                userSkillsForThisSkill.reduce(
                  (sum, us) => sum + us.yearsOfExperience,
                  0
                ) / userSkillsForThisSkill.length
              ).toFixed(1)
            : 0,
        levelDistribution: {
          1: userSkillsForThisSkill.filter((us) => us.level === 1).length,
          2: userSkillsForThisSkill.filter((us) => us.level === 2).length,
          3: userSkillsForThisSkill.filter((us) => us.level === 3).length,
          4: userSkillsForThisSkill.filter((us) => us.level === 4).length,
          5: userSkillsForThisSkill.filter((us) => us.level === 5).length,
        },
      };
    });

    // カテゴリ別統計
    const categoryStats = {};
    allSkills.forEach((skill) => {
      if (!categoryStats[skill.category]) {
        categoryStats[skill.category] = {
          skillCount: 0,
          totalUserSkillCount: 0,
          averagePenetration: 0,
          skills: [],
        };
      }
      categoryStats[skill.category].skillCount++;
      categoryStats[skill.category].totalUserSkillCount +=
        skillStats[skill.id].userCount;
      categoryStats[skill.category].skills.push(skillStats[skill.id]);
    });

    // カテゴリの平均普及率を計算
    Object.keys(categoryStats).forEach((category) => {
      const categoryData = categoryStats[category];
      const totalPenetration = categoryData.skills.reduce(
        (sum, skill) => sum + parseFloat(skill.penetrationRate),
        0
      );
      categoryData.averagePenetration = (
        totalPenetration / categoryData.skills.length
      ).toFixed(1);
    });

    // 推奨スキル（普及率が高いが自分が持っていないスキル）
    const currentUserId = req.user.id;
    const mySkills = dataStore
      .getUserSkills(currentUserId)
      .map((us) => us.skillId);

    const recommendedSkills = Object.values(skillStats)
      .filter((skill) => {
        const skillId = Object.keys(skillStats).find(
          (id) => skillStats[id] === skill
        );
        return (
          !mySkills.includes(parseInt(skillId)) &&
          parseFloat(skill.penetrationRate) > 30
        );
      })
      .sort(
        (a, b) => parseFloat(b.penetrationRate) - parseFloat(a.penetrationRate)
      )
      .slice(0, 10);

    res.json({
      skillStatistics: skillStats,
      categoryStatistics: categoryStats,
      recommendedSkills,
      totalSkills: allSkills.length,
      totalUsers: allUsers.length,
      message: "スキル統計を取得しました",
    });
  } catch (error) {
    console.error("スキル統計取得エラー:", error);
    res.status(500).json({ error: "スキル統計取得に失敗しました" });
  }
};

// 自分と他のメンバーとのスキル比較
export const getSkillComparison = (req, res) => {
  try {
    const currentUserId = req.user.id;
    const { targetUserId } = req.params;

    if (!targetUserId) {
      return res.status(400).json({ error: "比較対象のユーザーIDが必要です" });
    }

    const currentUser = dataStore.getUserById(currentUserId);
    const targetUser = dataStore.getUserById(parseInt(targetUserId));

    if (!targetUser) {
      return res
        .status(404)
        .json({ error: "比較対象のユーザーが見つかりません" });
    }

    const currentUserSkills = dataStore.getUserSkillsWithDetails(currentUserId);
    const targetUserSkills = dataStore.getUserSkillsWithDetails(
      parseInt(targetUserId)
    );

    // 共通スキル
    const commonSkills = currentUserSkills
      .filter((mySkill) =>
        targetUserSkills.some(
          (theirSkill) => theirSkill.skillId === mySkill.skillId
        )
      )
      .map((mySkill) => {
        const theirSkill = targetUserSkills.find(
          (ts) => ts.skillId === mySkill.skillId
        );
        return {
          skillName: mySkill.skillName,
          category: mySkill.skillCategory,
          myLevel: mySkill.level,
          theirLevel: theirSkill.level,
          myExperience: mySkill.yearsOfExperience,
          theirExperience: theirSkill.yearsOfExperience,
          levelDifference: mySkill.level - theirSkill.level,
        };
      });

    // 私だけが持つスキル
    const myUniqueSkills = currentUserSkills.filter(
      (mySkill) =>
        !targetUserSkills.some(
          (theirSkill) => theirSkill.skillId === mySkill.skillId
        )
    );

    // 相手だけが持つスキル
    const theirUniqueSkills = targetUserSkills.filter(
      (theirSkill) =>
        !currentUserSkills.some(
          (mySkill) => mySkill.skillId === theirSkill.skillId
        )
    );

    res.json({
      currentUser: {
        id: currentUser.id,
        name: currentUser.name,
        skillCount: currentUserSkills.length,
        averageLevel:
          currentUserSkills.length > 0
            ? (
                currentUserSkills.reduce((sum, skill) => sum + skill.level, 0) /
                currentUserSkills.length
              ).toFixed(1)
            : 0,
      },
      targetUser: {
        id: targetUser.id,
        name: targetUser.name,
        skillCount: targetUserSkills.length,
        averageLevel:
          targetUserSkills.length > 0
            ? (
                targetUserSkills.reduce((sum, skill) => sum + skill.level, 0) /
                targetUserSkills.length
              ).toFixed(1)
            : 0,
      },
      comparison: {
        commonSkills,
        myUniqueSkills,
        theirUniqueSkills,
        commonSkillCount: commonSkills.length,
      },
      message: "スキル比較を取得しました",
    });
  } catch (error) {
    console.error("スキル比較取得エラー:", error);
    res.status(500).json({ error: "スキル比較取得に失敗しました" });
  }
};
