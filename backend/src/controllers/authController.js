import { hashPassword, comparePassword } from "../utils/password.js";
import { generateToken } from "../utils/jwt.js";
import { prismaDataStore } from "../utils/prismaDataStore.js";

// 新規登録
export const register = async (req, res) => {
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
    const existingUser = await prismaDataStore.findUserByStudentId(studentId);
    if (existingUser) {
      return res.status(400).json({
        error: "この学籍番号はすでに登録されています",
        message: "登録に失敗しました",
      });
    }

    // パスワードをハッシュ化
    const hashedPassword = await hashPassword(password);

    // ユーザー作成
    const userData = {
      name,
      grade: parseInt(grade),
      studentId,
      faculty,
      department,
      password: hashedPassword,
      createdAt: new Date().toISOString(),
      username: name,
    };

    // prismaDataStoreを使用してユーザーを追加
    const user = await prismaDataStore.addUser(userData);

    // JWTトークンを生成
    const token = generateToken({
      id: user.id,
      studentId: user.studentId,
    });

    // パスワードを除外してレスポンス
    const { password: _, ...safeUser } = user;
    res.status(201).json({
      user: safeUser,
      token,
      message: "登録が完了しました",
    });
  } catch (error) {
    console.error("Registration error:", error);

    if (error.code === "P2002" && error.meta.target.includes("studentId")) {
      console.error("重複エラー: ", req.body.studentId);
      return res
        .status(400)
        .json({ error: "この学生IDは既に登録されています。" });
    }

    res.status(500).json({
      error: "登録中にエラーが発生しました",
      message: "登録に失敗しました",
    });
  }
};

// ログイン
export const login = async (req, res) => {
  try {
    const { studentId, password } = req.body;

    // バリデーションチェック
    if (!studentId || !password) {
      return res.status(400).json({
        error: "学籍番号とパスワードを入力してください",
        message: "ログインに失敗しました",
      });
    }

    // ユーザー検索
    const user = await prismaDataStore.findUserByStudentId(studentId);

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

    // ログイン成功時のレスポンス（パスワードを除外）
    const { password: _, ...userInfo } = user;
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
};

// 現在のユーザー情報取得
export const getMe = async (req, res) => {
  try {
    const user = await prismaDataStore.findUserById(req.user?.id);

    if (!user) {
      return res.status(404).json({
        error: "ユーザーが見つかりません",
      });
    }

    const { password, ...userInfo } = user;
    res.json(userInfo);
  } catch (error) {
    console.error("Get me error:", error);
    res.status(500).json({
      error: "サーバーエラーが発生しました",
    });
  }
};
