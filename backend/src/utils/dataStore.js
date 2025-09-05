import allSkills from "../data/skill.js";

// 仮のデータベース
let users = [];
let nextId = 1;

// ユーザースキル
let userSkills = [];

// スキル更新記録
let skillHistory = [];

export const dataStore = {
  // ユーザー情報
  getUsers: () => users,
  addUser: (user) => {
    const newUser = {
      ...user,
      id: nextId++,
      // プロフィール情報
      profileImg: null,
      bio: "",
      github: "",
      sns: "",
      linkedinUrl: "",
      websiteUrl: "",
      portfolioUrl: "",
      interests: [],
      updatedAt: new Date().toISOString(),
    };
    users.push(newUser);
    return newUser;
  },
  findUserById: (id) => users.find((user) => user.id === id),
  findUserByStudentId: (studentId) =>
    users.find((user) => user.studentId === studentId),
  updateUser: (id, updateData) => {
    const userIndex = users.findIndex((user) => user.id === id);
    if (userIndex === -1) return null;

    users[userIndex] = {
      ...users[userIndex],
      ...updateData,
      updatedAt: new Date().toISOString(),
    };
    return users[userIndex];
  },

  // プロフィール専用メソッド
  updateUserProfile: (id, profileData) => {
    const userIndex = users.findIndex((u) => u.id === id);
    if (userIndex === -1) return null;

    // プロフィール関連フィールドのみ更新
    const editedFields = [
      "profileImg",
      "bio",
      "github",
      "sns",
      "linkedinUrl",
      "websiteUrl",
      "portfolioUrl",
      "interests",
    ];

    // 指定されたフィールドのみを更新
    const filteredData = {};
    editedFields.forEach((field) => {
      if (profileData.hasOwnProperty(field)) {
        filteredData[field] = profileData[field];
      }
    });

    // 更新日時を設定
    users[userIndex] = {
      ...users[userIndex],
      ...filteredData,
      updatedAt: new Date().toISOString(),
    };
    return users[userIndex];
  },

  // スキル関連メソッド
  // 全スキル取得
  getAllSkills: () => allSkills,

  // カテゴリ別スキル取得
  getSkillsByCategory: () => {
    const categories = {};
    allSkills.forEach((skill) => {
      if (!categories[skill.category]) {
        categories[skill.category] = [];
      }
      categories[skill.category].push(skill);
    });
    return categories;
  },

  // スキルID検索
  getSkillById: (skillId) => {
    return allSkills.find((skill) => skill.id === parseInt(skillId));
  },

  // ユーザースキル詳細取得
  getUserSkillsWithDetails: (userId) => {
    const userSkillsList = userSkills.filter(
      (us) => us.userId === parseInt(userId)
    );
    return userSkillsList.map((us) => {
      const skill = allSkills.find((s) => s.id === us.skillId);
      return {
        ...us,
        skillName: skill?.name || "不明",
        skillCategory: skill?.category || "不明",
      };
    });
  },

  // ユーザースキル追加・更新
  addOrUpdateUserSkill: (userId, skillData) => {
    const existingIndex = userSkills.findIndex(
      (us) =>
        us.userId === parseInt(userId) &&
        us.skillId === parseInt(skillData.skillId)
    );

    const previousSkill =
      existingIndex !== -1 ? userSkills[existingIndex] : null;

    const newUserSkill = {
      userId: parseInt(userId),
      skillId: parseInt(skillData.skillId),
      level: parseInt(skillData.level),
      yearsOfExperience: parseFloat(skillData.yearsOfExperience || 0),
      description: skillData.description || "",
      createdAt:
        existingIndex === -1
          ? new Date().toISOString()
          : userSkills[existingIndex].createdAt,
      updatedAt: new Date().toISOString(),
    };

    // 履歴を記録
    if (previousSkill) {
      skillHistory.push({
        id: skillHistory.length + 1,
        userId: parseInt(userId),
        skillId: parseInt(skillData.skillId),
        action: "update",
        previousLevel: previousSkill.level,
        newLevel: newUserSkill.level,
        previousExperience: previousSkill.yearsOfExperience,
        newExperience: parseFloat(skillData.yearsOfExperience || 0),
        timestamp: new Date().toISOString(),
      });
    } else {
      skillHistory.push({
        id: skillHistory.length + 1,
        userId: parseInt(userId),
        skillId: parseInt(skillData.skillId),
        action: "add",
        newLevel: newUserSkill.level,
        newExperience: parseFloat(skillData.yearsOfExperience || 0),
        timestamp: new Date().toISOString(),
      });
    }

    if (existingIndex !== -1) {
      // 更新
      userSkills[existingIndex] = newUserSkill;
    } else {
      // 新規追加
      userSkills.push(newUserSkill);
    }

    return newUserSkill;
  },

  // スキル履歴取得
  getSkillHistory: (userId) => {
    return skillHistory
      .filter((h) => h.userId === parseInt(userId))
      .sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
  },

  // 最近の更新スキル取得
  getRecentSkillUpdates: (userId, days = 30) => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    return userSkills
      .filter(
        (us) =>
          us.userId === parseInt(userId) && new Date(us.updatedAt) > cutoffDate
      )
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  },

  // 最近の更新スキル取得（詳細情報付き）
  getRecentSkillUpdates: (userId, days = 30) => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    console.log("最近の更新スキル取得:", { userId, days, cutoffDate });

    const recentSkills = userSkills
      .filter((us) => {
        const isCorrectUser = us.userId === parseInt(userId);
        const isRecent = new Date(us.updatedAt) > cutoffDate;
        console.log("スキルチェック:", {
          skillId: us.skillId,
          userId: us.userId,
          updatedAt: us.updatedAt,
          isCorrectUser,
          isRecent,
        });
        return isCorrectUser && isRecent;
      })
      .sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );

    console.log("フィルタ後の最近のスキル:", recentSkills);

    // スキル詳細情報を追加
    const recentSkillsWithDetails = recentSkills.map((userSkill) => {
      const skillDetails = allSkills.find((s) => s.id === userSkill.skillId);
      console.log(`スキルID ${userSkill.skillId} の詳細:`, skillDetails);

      return {
        ...userSkill,
        skillName: skillDetails?.name || "不明なスキル",
        skillCategory: skillDetails?.category || "その他",
      };
    });

    console.log("詳細付き最近のスキル:", recentSkillsWithDetails);
    return recentSkillsWithDetails;
  },

  // ユーザースキル削除
  removeUserSkill: (userId, skillId) => {
    const index = userSkills.findIndex(
      (us) => us.userId === parseInt(userId) && us.skillId === parseInt(skillId)
    );

    if (index !== -1) {
      const removed = userSkills.splice(index, 1)[0];
      return removed;
    }
    return null;
  },

  // 全ユーザースキルを取得
  getAllUserSkills: () => userSkills,

  // ユーザーIDでユーザーを取得
  getUserById: (userId) => users.find((user) => user.id === userId),

  getNextId: () => nextId,
  setNextId: (id) => {
    nextId = id;
  },
};
