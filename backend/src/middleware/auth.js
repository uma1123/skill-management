import { DetachedBindMode } from "three";

// 認証が必要なエンドポイント
export const requireAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "認証トークンが必要です" });
    }

    const token = authHeader.substring(7); // 'Bearer 'を除去
    const decode = verifyToken(token);

    // リクエストオブジェクトにユーザー情報を追加
    req.user = decode;
    next();
  } catch (error) {
    console.error("認証エラー:", error);
    return res.status(401).json({ error: "無効な認証トークンです" });
  }
};
