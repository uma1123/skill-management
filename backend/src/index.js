import dotenv from "dotenv";
dotenv.config();

// 環境変数の確認
console.log("JWT_SECRET:", process.env.JWT_SECRET ? "Set" : "Not set");
console.log("PORT:", process.env.PORT);

import express from "express";
import cors from "cors";
import bodyParser from "body-parser";

// ルートをインポート
import authRoutes from "./routes/authRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";

// Expressアプリケーションを作成
const app = express();
const PORT = process.env.PORT || 3001;

// ミドルウェア
app.use(cors());
app.use(bodyParser.json());

// ルートを設定
app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);

// 404エラーハンドリング
app.use((req, res) => {
  res.status(404).json({
    error: "エンドポイントが見つかりません",
    requestedPath: req.originalUrl,
    method: req.method,
  });
});

// エラーハンドリングミドルウェア
app.use((err, req, res, next) => {
  console.error("Server error:", err);
  res.status(500).json({
    error: "サーバー内部エラーが発生しました",
    message: "しばらく時間をおいて再度お試しください",
  });
});

// 指定したポートでサーバーを起動
app.listen(PORT, () => {
  console.log(`Backend server is running at http://localhost:${PORT}`);
});
