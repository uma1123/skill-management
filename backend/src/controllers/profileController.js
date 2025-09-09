import { prismaDataStore } from "../utils/prismaDataStore.js";

// 自分のプロフィール情報を取得
export const getMyProfile = async (req, res) => {
  try {
    const user = await prismaDataStore.findUserById(req.user.id);

    if (!user) {
      return res.status(404).json({
        error: "ユーザーが見つかりません",
      });
    }

    const { password, ...userProfile } = user;
    res.json({
      profile: userProfile,
      message: "プロフィール情報を取得しました",
    });
  } catch (error) {
    console.error("プロフィール情報の取得中にエラーが発生しました:", error);
    res.status(500).json({
      error: "プロフィール情報の取得中にエラーが発生しました",
    });
  }
};

// 他のユーザーのプロフィール情報を取得
export const getUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await prismaDataStore.findUserById(parseInt(userId));

    if (!user) {
      return res.status(404).json({
        error: "ユーザーが見つかりません",
      });
    }

    const publicProfile = {
      id: user.id,
      name: user.name,
      studentId: user.studentId,
      faculty: user.faculty,
      department: user.department,
      grade: user.grade,
      profileImg: user.profileImg,
      bio: user.bio,
      github: user.github,
      sns: user.sns,
      linkedinUrl: user.linkedinUrl,
      websiteUrl: user.websiteUrl,
      portfolioUrl: user.portfolioUrl,
      interests: user.interests,
      createdAt: user.createdAt,
    };

    res.json({
      profile: publicProfile,
      message: "プロフィール情報を取得しました",
    });
  } catch (error) {
    console.error("プロフィール情報の取得中にエラーが発生しました:", error);
    res.status(500).json({
      error: "プロフィール情報の取得中にエラーが発生しました",
    });
  }
};

// 統合されたプロフィール更新関数
export const updateMyProfile = async (req, res) => {
  try {
    const {
      // 基本情報
      name,
      grade,
      faculty,
      department,
      // プロフィール情報
      profileImg,
      bio,
      github,
      sns,
      linkedinUrl,
      websiteUrl,
      portfolioUrl,
      interests,
    } = req.body;

    // バリデーション
    // 基本情報のバリデーション
    if (grade !== undefined && (grade < 1 || grade > 6)) {
      return res.status(400).json({
        error: "学年は1から6の範囲で入力してください",
        message: "更新に失敗しました",
      });
    }

    // 自己紹介文のバリデーション
    if (bio && bio.length > 500) {
      return res.status(400).json({
        error: "自己紹介文は500文字以内で入力してください",
        message: "更新に失敗しました",
      });
    }

    // 興味分野のバリデーション
    if (interests && !Array.isArray(interests)) {
      return res.status(400).json({
        error: "興味のある分野は配列形式で送信してください",
        message: "更新に失敗しました",
      });
    }

    // URL形式のバリデーション
    const urlFields = { linkedinUrl, websiteUrl, portfolioUrl };
    for (const [field, url] of Object.entries(urlFields)) {
      if (url && url.trim() !== "" && !isValidUrl(url)) {
        return res.status(400).json({
          error: `${getFieldDisplayName(field)}の形式が正しくありません`,
          message: "更新に失敗しました",
        });
      }
    }

    // 更新データを準備
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (grade !== undefined) updateData.grade = parseInt(grade);
    if (faculty !== undefined) updateData.faculty = faculty;
    if (department !== undefined) updateData.department = department;
    if (profileImg !== undefined) updateData.profileImg = profileImg;
    if (bio !== undefined) updateData.bio = bio;
    if (github !== undefined) updateData.github = github;
    if (sns !== undefined) updateData.sns = sns;
    if (linkedinUrl !== undefined) updateData.linkedinUrl = linkedinUrl;
    if (websiteUrl !== undefined) updateData.websiteUrl = websiteUrl;
    if (portfolioUrl !== undefined) updateData.portfolioUrl = portfolioUrl;
    if (interests !== undefined) updateData.interests = interests;

    // プロフィールを更新
    const updatedUser = await prismaDataStore.updateUser(
      req.user.id,
      updateData
    );

    if (!updatedUser) {
      return res.status(404).json({
        error: "ユーザーが見つかりません",
        message: "更新に失敗しました",
      });
    }

    const { password, ...userProfile } = updatedUser;
    res.json({
      profile: userProfile,
      message: "プロフィール情報を更新しました",
    });
  } catch (error) {
    console.error("プロフィール情報の更新中にエラーが発生しました:", error);
    res.status(500).json({
      error: "プロフィール情報の更新中にエラーが発生しました",
      message: "更新に失敗しました",
    });
  }
};

// ヘルパー関数
const isValidUrl = (string) => {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
};

const getFieldDisplayName = (field) => {
  const fieldNames = {
    linkedinUrl: "LinkedIn URL",
    websiteUrl: "Webサイト URL",
    portfolioUrl: "ポートフォリオ URL",
  };
  return fieldNames[field] || field;
};
