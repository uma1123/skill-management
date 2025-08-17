import dotenv from "dotenv";
dotenv.config();

// 環境変数の確認を追加
console.log("JWT_SECRET:", process.env.JWT_SECRET ? "Set" : "Not set");
console.log("PORT:", process.env.PORT);

import bodyParser from "body-parser";
import express from "express";
import cors from "cors";
import { comparePassword, hashPassword } from "./utils/password.js";
import { generateToken } from "./utils/jwt.js";

// Expressアプリケーションを作成
const app = express();
// ポート番号を設定
const PORT = process.env.PORT || 3001;

//ミドルウェア
app.use(cors());
app.use(bodyParser.json());

// ユーザー情報を格納する配列
let users = [];
let nextId = 1;

// 新規登録API
app.post("/api/users", async (req, res) => {
  try {
    const { name, grade, studentId, faculty, department, password } = req.body;

    // バリデーションチェック
    if (!name || !grade || !studentId || !faculty || !department || !password) {
      return res.status(400).json({
        error: "すべての項目を入力してください",
        message: "登録に失敗しました",
      });
    }

    // 学籍番号の重複チェック
    if (users.find((u) => u.studentId === studentId)) {
      return res.status(400).json({
        error: "この学籍番号はすでに登録されています",
        message: "登録に失敗しました",
      });
    }

    // パスワードをハッシュ化
    const hashedPassword = await hashPassword(password);

    //ユーザー作成
    const user = {
      id: nextId++,
      name,
      grade: parseInt(grade),
      studentId,
      faculty,
      department,
      createdAt: new Date().toISOString(),
    };

    // ハッシュ化されたパスワードとユーザー情報を保存
    users.push({ ...user, password: hashedPassword });

    // JWTトークンを生成
    const token = generateToken({
      id: user.id,
      studentId: user.studentId,
    });
    res.status(201).json({ user, token, message: "登録が完了しました" });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      error: "登録中にエラーが発生しました",
      message: "登録に失敗しました",
    });
  }
});

// ログインAPI
app.post("/api/login", async (req, res) => {
  try {
    const { studentId, password } = req.body;

    // バリデーションチェック
    if (!studentId || !password) {
      return res.status(400).json({
        error: "学籍番号とパスワードを入力してください",
        message: "ログインに失敗しました",
      });
    }

    // ユーザー検索（バグ修正: user → users）
    const user = users.find((u) => u.studentId === studentId);

    if (!user) {
      return res.status(401).json({
        error: "学籍番号またはパスワードが間違っています",
        message: "ログインに失敗しました",
      });
    }

    // パスワード検証
    const isPasswordValid = await comparePassword(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        error: "学籍番号またはパスワードが間違っています",
        message: "ログインに失敗しました",
      });
    }

    // JWTトークンを生成
    const token = generateToken({
      id: user.id,
      studentId: user.studentId,
    });

    // ログイン成功時のレスポンス
    const { password: _, ...userInfo } = user; // パスワードを除外
    res.json({
      user: userInfo,
      token,
      message: "ログインに成功しました",
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      error: "ログイン中にエラーが発生しました",
      message: "ログインに失敗しました",
    });
  }
});

// 指定したポートでサーバーを起動
app.listen(PORT, () => {
  console.log(`Backend server is running at http://localhost:${PORT} `);
});
