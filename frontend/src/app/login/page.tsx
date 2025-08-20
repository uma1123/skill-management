"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function Login() {
  const [name, setName] = useState(""); // 氏名
  const [grade, setGrade] = useState(""); // 学年
  const [studentId, setStudentId] = useState(""); // 学生ID
  const [faculty, setFaculty] = useState(""); // 学部
  const [department, setDepartment] = useState(""); // 学科
  const [password, setPassword] = useState(""); // パスワード

  const [loginStudentId, setLoginStudentId] = useState(""); // ログイン用学籍番号
  const [loginPassword, setLoginPassword] = useState(""); // ログイン用パスワード
  const router = useRouter();

  // フォームのクリア
  const clearRegisterForm = () => {
    setName("");
    setGrade("");
    setStudentId("");
    setFaculty("");
    setDepartment("");
    setPassword("");
  };

  const clearLoginForm = () => {
    setLoginStudentId("");
    setLoginPassword("");
  };

  // 新規登録のフォーム送信ハンドラー
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // 新しいエンドポイントに変更
      const res = await fetch("http://localhost:3001/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          grade,
          studentId,
          faculty,
          department,
          password,
        }),
      });

      const data = await res.json();
      console.log("Response:", data);
      alert(data.message);

      if (res.ok) {
        // トークンも保存
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        clearRegisterForm();

        // TODO: ダッシュボードページにリダイレクト
        router.push("/dashboard");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("登録に失敗しました");
    }
  };

  // ログインのフォーム送信ハンドラー
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // 新しいエンドポイントに変更
      const res = await fetch("http://localhost:3001/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          studentId: loginStudentId,
          password: loginPassword,
        }),
      });

      const data = await res.json();
      console.log("Login Response:", data);
      alert(data.message);

      if (res.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        clearLoginForm();

        // TODO: ダッシュボードページにリダイレクト
      }
    } catch (error) {
      console.error("Error:", error);
      alert("ログインに失敗しました");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-lg">
        <Card className="w-full shadow-lg">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-3xl font-bold text-gray-800">
              スキル管理
            </CardTitle>
          </CardHeader>
          <CardContent className="px-8 py-6">
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login" className="text-base">
                  ログイン
                </TabsTrigger>
                <TabsTrigger value="register" className="text-base">
                  新規登録
                </TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="space-y-5">
                <form onSubmit={handleLoginSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <Label
                      htmlFor="loginStudentId"
                      className="text-sm font-medium"
                    >
                      学籍番号
                    </Label>
                    <Input
                      id="loginStudentId"
                      type="text"
                      placeholder="学籍番号を入力"
                      value={loginStudentId}
                      onChange={(e) => setLoginStudentId(e.target.value)}
                      className="h-11"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="loginPassword"
                      className="text-sm font-medium"
                    >
                      パスワード
                    </Label>
                    <Input
                      id="loginPassword"
                      type="password"
                      placeholder="パスワードを入力"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="h-11"
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full h-11 text-base font-medium"
                  >
                    ログイン
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="register" className="space-y-4">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-medium">
                      氏名
                    </Label>
                    <Input
                      id="name"
                      placeholder="氏名を入力"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="h-11"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="studentId" className="text-sm font-medium">
                      学籍番号
                    </Label>
                    <Input
                      id="studentId"
                      placeholder="学籍番号を入力"
                      value={studentId}
                      onChange={(e) => setStudentId(e.target.value)}
                      className="h-11"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="faculty" className="text-sm font-medium">
                        学部
                      </Label>
                      <Input
                        id="faculty"
                        placeholder="学部を入力"
                        value={faculty}
                        onChange={(e) => setFaculty(e.target.value)}
                        className="h-11"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor="department"
                        className="text-sm font-medium"
                      >
                        学科
                      </Label>
                      <Input
                        id="department"
                        placeholder="学科を入力"
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                        className="h-11"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="grade" className="text-sm font-medium">
                      学年
                    </Label>
                    <Input
                      id="grade"
                      type="number"
                      placeholder="学年を入力"
                      min="1"
                      max="4"
                      value={grade}
                      onChange={(e) => setGrade(e.target.value)}
                      className="h-11"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="registerPassword"
                      className="text-sm font-medium"
                    >
                      パスワード
                    </Label>
                    <Input
                      id="registerPassword"
                      type="password"
                      placeholder="パスワードを入力"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-11"
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full h-11 text-base font-medium mt-6"
                  >
                    新規登録
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
