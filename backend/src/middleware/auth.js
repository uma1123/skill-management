import { verifyToken } from "../utils/jwt.js";

// 認証が必要なエンドポイント
export const requireAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        error: "アクセストークンが必要です",
        message: "ログインしてください",
      });
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);

    // リクエストオブジェクトにユーザー情報を追加
    req.user = decoded;
    next();
  } catch (error) {
    console.error("認証エラー:", error);
    return res.status(401).json({
      error: "無効な認証トークンです",
      message: "ログインし直してください",
    });
  }
};

// オプショナル認証（ログインしていなくてもアクセス可能）
export const optionalAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7);
      const decoded = verifyToken(token);
      req.user = decoded;
    }

    next();
  } catch (error) {
    // トークンが無効でもエラーにしない
    next();
  }
};
