import bodyParser from "body-parser";
import express from "express";
import cors from "cors";

// Expressアプリケーションを作成
const app = express();
// ポート番号を設定
const PORT = 3001;

//ミドルウェア
app.use(cors());
app.use(bodyParser.json());

// ユーザー情報を格納する配列
let users = [];
let nextId = 1;

app.post("/api/users", (req, res) => {
  const { name, grade, studentId, faculty, department, password } = req.body;

  // バリデーションチェック
  if (!name || !grade || !studentId || !faculty || !department || !password) {
    return res.status(400).json({ error: "すべての項目を入力してください" });
  }

  // 学籍番号の重複チェック
  if (users.find((u) => u.studentId === studentId)) {
    return res
      .status(400)
      .json({ error: "この学籍番号はすでに登録されています" });
  }

  //ユーザー作成
  const user = {
    id: nextId++,
    name,
    grade,
    studentId,
    faculty,
    department,
  };
  users.push({ ...user, password });

  res.status(201).json(user);
});

// 指定したポートでサーバーを起動
app.listen(PORT, () => {
  console.log(`Backend server is running at http://localhost:${PORT} `);
});
