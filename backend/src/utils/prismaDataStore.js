import { PrismaClient } from "../generated/prisma/index.js";

const prisma = new PrismaClient();

export const prismaDataStore = {
  // ユーザー関連
  async getUsers() {
    return await prisma.user.findMany();
  },

  async addUser(userData) {
    return await prisma.user.create({
      data: {
        ...userData,
        interests: userData.interests || [],
      },
    });
  },

  async findUserById(id) {
    return await prisma.user.findUnique({
      where: { id: parseInt(id) },
    });
  },

  async findUserByStudentId(studentId) {
    return await prisma.user.findUnique({
      where: { studentId },
    });
  },

  async findUserByEmail(email) {
    return await prisma.user.findUnique({
      where: { email },
    });
  },

  async findUserByUsername(username) {
    return await prisma.user.findUnique({
      where: { username },
    });
  },

  async updateUser(id, updateData) {
    try {
      return await prisma.user.update({
        where: { id: parseInt(id) },
        data: updateData,
      });
    } catch (error) {
      if (error.code === "P2025") return null; // Record not found
      throw error;
    }
  },

  async updateUserProfile(id, profileData) {
    const editedFields = [
      "name",
      "bio",
      "profileImg",
      "github",
      "sns",
      "linkedinUrl",
      "websiteUrl",
      "portfolioUrl",
      "interests",
      "faculty",
      "department",
      "grade",
    ];

    const filteredData = {};
    editedFields.forEach((field) => {
      if (profileData.hasOwnProperty(field)) {
        filteredData[field] = profileData[field];
      }
    });

    try {
      return await prisma.user.update({
        where: { id: parseInt(id) },
        data: filteredData,
      });
    } catch (error) {
      if (error.code === "P2025") return null;
      throw error;
    }
  },

  // スキル関連
  async getAllSkills() {
    return await prisma.skill.findMany({
      orderBy: [{ category: "asc" }, { name: "asc" }],
    });
  },

  async getSkillsByCategory() {
    const skills = await prisma.skill.findMany({
      orderBy: [{ category: "asc" }, { name: "asc" }],
    });

    const categories = {};
    skills.forEach((skill) => {
      if (!categories[skill.category]) {
        categories[skill.category] = [];
      }
      categories[skill.category].push(skill);
    });

    return categories;
  },

  async getSkillById(skillId) {
    return await prisma.skill.findUnique({
      where: { id: parseInt(skillId) },
    });
  },

  async createSkill(skillData) {
    return await prisma.skill.create({
      data: skillData,
    });
  },

  // ユーザースキル関連
  async getUserSkillsWithDetails(userId) {
    return await prisma.userSkill.findMany({
      where: { userId: parseInt(userId) },
      include: {
        skill: true,
      },
      orderBy: { updatedAt: "desc" },
    });
  },

  async addOrUpdateUserSkill(userId, skillData) {
    const userIdInt = parseInt(userId);
    const skillIdInt = parseInt(skillData.skillId);

    // 既存のスキルを取得
    const existingSkill = await prisma.userSkill.findUnique({
      where: {
        userId_skillId: {
          userId: userIdInt,
          skillId: skillIdInt,
        },
      },
    });

    const skillDataForDb = {
      level: parseInt(skillData.level),
      yearsOfExperience: parseFloat(skillData.yearsOfExperience || 0),
      description: skillData.description || "",
    };

    let result;

    if (existingSkill) {
      // 更新の場合
      result = await prisma.userSkill.update({
        where: {
          userId_skillId: {
            userId: userIdInt,
            skillId: skillIdInt,
          },
        },
        data: skillDataForDb,
        include: {
          skill: true,
        },
      });

      // 履歴を記録
      await prisma.skillHistory.create({
        data: {
          userId: userIdInt,
          skillId: skillIdInt,
          action: "update",
          previousLevel: existingSkill.level,
          newLevel: result.level,
          previousExperience: existingSkill.yearsOfExperience,
          newExperience: result.yearsOfExperience,
        },
      });
    } else {
      // 新規作成の場合
      result = await prisma.userSkill.create({
        data: {
          userId: userIdInt,
          skillId: skillIdInt,
          ...skillDataForDb,
        },
        include: {
          skill: true,
        },
      });

      // 履歴を記録
      await prisma.skillHistory.create({
        data: {
          userId: userIdInt,
          skillId: skillIdInt,
          action: "add",
          newLevel: result.level,
          newExperience: result.yearsOfExperience,
        },
      });
    }

    return result;
  },

  async removeUserSkill(userId, skillId) {
    try {
      const deleted = await prisma.userSkill.delete({
        where: {
          userId_skillId: {
            userId: parseInt(userId),
            skillId: parseInt(skillId),
          },
        },
        include: {
          skill: true,
        },
      });

      // 削除履歴を記録
      await prisma.skillHistory.create({
        data: {
          userId: parseInt(userId),
          skillId: parseInt(skillId),
          action: "delete",
          newLevel: 0,
          newExperience: 0,
        },
      });

      return deleted;
    } catch (error) {
      if (error.code === "P2025") return null;
      throw error;
    }
  },

  // スキル履歴関連
  async getSkillHistory(userId) {
    return await prisma.skillHistory.findMany({
      where: { userId: parseInt(userId) },
      include: {
        skill: true,
      },
      orderBy: { timestamp: "desc" },
    });
  },

  async getRecentSkillUpdates(userId, days = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    return await prisma.userSkill.findMany({
      where: {
        userId: parseInt(userId),
        updatedAt: {
          gte: cutoffDate,
        },
      },
      include: {
        skill: true,
      },
      orderBy: { updatedAt: "desc" },
    });
  },

  async getAllUserSkills() {
    return await prisma.userSkill.findMany({
      include: {
        skill: true,
        user: true,
      },
    });
  },

  // 振り返りメモ関連
  async getReflectionMemos(userId) {
    return await prisma.reflectionMemo.findMany({
      where: { userId: parseInt(userId) },
      orderBy: { createdAt: "desc" },
    });
  },

  async createReflectionMemo(userId, content) {
    return await prisma.reflectionMemo.create({
      data: {
        userId: parseInt(userId),
        content,
      },
    });
  },

  async updateReflectionMemo(id, content) {
    try {
      return await prisma.reflectionMemo.update({
        where: { id: parseInt(id) },
        data: { content },
      });
    } catch (error) {
      if (error.code === "P2025") return null;
      throw error;
    }
  },

  // dataStoreとの互換性のためのメソッド
  async getUserById(userId) {
    return await this.findUserById(userId);
  },

  // 将来的に削除予定（dataStoreとの互換性のため）
  getNextId: () => null, // PostgreSQLは自動インクリメント
  setNextId: () => null, // PostgreSQLは自動インクリメント
};

// Prismaクライアントのクリーンアップ
process.on("beforeExit", async () => {
  await prisma.$disconnect();
});

export default prismaDataStore;
