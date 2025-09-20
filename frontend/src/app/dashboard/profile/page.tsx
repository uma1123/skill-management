"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Edit3, Save, X, User, Github, Globe, Plus } from "lucide-react";

interface UserProfile {
  id: number;
  name: string;
  studentId: string;
  faculty: string;
  department: string;
  grade: number;
  profileImg: string | null;
  bio: string;
  github: string;
  sns: string;
  linkedinUrl: string;
  websiteUrl: string;
  portfolioUrl: string;
  interests: string[];
  createdAt: string;
  updatedAt: string;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  // 編集用フォームデータ
  const [formData, setFormData] = useState({
    name: "",
    grade: "",
    faculty: "",
    department: "",
    bio: "",
    github: "",
    sns: "",
    linkedinUrl: "",
    websiteUrl: "",
    portfolioUrl: "",
    interests: [] as string[],
    studentId: "", // 追加
  });

  // 新しい興味分野の入力
  const [newInterest, setNewInterest] = useState("");

  // プロフィール取得
  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("ログインしてください");
        return;
      }

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/profile/me`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (res.ok) {
        const data = await res.json();
        setProfile(data.profile);
        // フォームデータを初期化
        setFormData({
          name: data.profile.name,
          grade: data.profile.grade.toString(),
          faculty: data.profile.faculty,
          department: data.profile.department,
          bio: data.profile.bio || "",
          github: data.profile.github || "",
          sns: data.profile.sns || "",
          linkedinUrl: data.profile.linkedinUrl || "",
          websiteUrl: data.profile.websiteUrl || "",
          portfolioUrl: data.profile.portfolioUrl || "",
          interests: data.profile.interests || [],
          studentId: data.profile.studentId, // 追加
        });
      } else {
        const errorData = await res.json();
        alert(errorData.error || "プロフィール取得に失敗しました");
      }
    } catch (error) {
      console.error("プロフィール取得エラー:", error);
      alert("プロフィール取得に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  // プロフィール更新
  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("ログインしてください");
        return;
      }

      const updateData = {
        ...formData,
        grade: parseInt(formData.grade),
        studentId: formData.studentId, // 追加
      };

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/profile/me`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updateData),
        }
      );

      const data = await res.json();

      if (res.ok) {
        setProfile(data.profile);
        setEditing(false);
        alert(data.message);
      } else {
        alert(data.error || "プロフィール更新に失敗しました");
      }
    } catch (error) {
      console.error("プロフィール更新エラー:", error);
      alert("プロフィール更新に失敗しました");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditing(false);
    // フォームデータをリセット
    if (profile) {
      setFormData({
        name: profile.name,
        grade: profile.grade.toString(),
        faculty: profile.faculty,
        department: profile.department,
        bio: profile.bio || "",
        github: profile.github || "",
        sns: profile.sns || "",
        linkedinUrl: profile.linkedinUrl || "",
        websiteUrl: profile.websiteUrl || "",
        portfolioUrl: profile.portfolioUrl || "",
        interests: profile.interests || [],
        studentId: profile.studentId, // 追加
      });
    }
  };

  // 興味分野を追加
  const addInterest = () => {
    if (
      newInterest.trim() &&
      !formData.interests.includes(newInterest.trim())
    ) {
      setFormData({
        ...formData,
        interests: [...formData.interests, newInterest.trim()],
      });
      setNewInterest("");
    }
  };

  // 興味分野を削除
  const removeInterest = (interest: string) => {
    setFormData({
      ...formData,
      interests: formData.interests.filter((item) => item !== interest),
    });
  };

  // フォームデータ更新
  const handleInputChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600">プロフィールを読み込んでいます...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="p-8 max-w-md">
          <CardContent className="text-center space-y-4">
            <User className="h-16 w-16 text-gray-400 mx-auto" />
            <div>
              <h3 className="text-lg font-medium text-gray-900">
                プロフィールが見つかりません
              </h3>
              <p className="text-gray-600 mt-1">
                データを再読み込みしてください
              </p>
            </div>
            <Button onClick={fetchProfile} className="w-full">
              再読み込み
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* ヘッダー */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-gray-900">プロフィール情報</h1>
          <p className="text-gray-600">あなたの基本情報を管理します</p>
        </div>
        <div className="flex space-x-3">
          {!editing ? (
            <Button onClick={() => setEditing(true)} size="lg">
              <Edit3 className="h-4 w-4 mr-2" />
              編集
            </Button>
          ) : (
            <>
              <Button onClick={handleCancel} variant="outline" size="lg">
                <X className="h-4 w-4 mr-2" />
                キャンセル
              </Button>
              <Button onClick={handleSave} disabled={saving} size="lg">
                <Save className="h-4 w-4 mr-2" />
                {saving ? "保存中..." : "保存"}
              </Button>
            </>
          )}
        </div>
      </div>

      {/* プロフィールカード */}
      <Card className="shadow-lg">
        <CardContent className="p-8">
          {/* ユーザーアバター部分 */}
          <div className="flex items-center space-x-6 mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg">
              {profile.name.charAt(0)}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {profile.name}
              </h2>
              <p className="text-gray-600">{profile.studentId}</p>
              <p className="text-sm text-gray-500 mt-1">
                {profile.faculty} / {profile.department} • {profile.grade}年生
              </p>
            </div>
          </div>

          <Separator className="mb-8" />

          {/* 基本情報グリッド */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* 左カラム */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  基本情報
                </h3>
                <div className="space-y-4">
                  {/* 名前 */}
                  <div>
                    <Label className="text-sm font-medium text-gray-700">
                      名前
                    </Label>
                    {editing ? (
                      <Input
                        value={formData.name}
                        onChange={(e) =>
                          handleInputChange("name", e.target.value)
                        }
                        className="mt-1"
                      />
                    ) : (
                      <p className="mt-1 text-gray-900 bg-gray-50 p-3 rounded-md">
                        {profile.name}
                      </p>
                    )}
                  </div>

                  {/* 学籍番号 */}
                  <div>
                    <Label className="text-sm font-medium text-gray-700">
                      学籍番号
                    </Label>
                    {editing ? (
                      <Input
                        value={formData.studentId}
                        onChange={(e) =>
                          handleInputChange("studentId", e.target.value)
                        }
                        className="mt-1"
                      />
                    ) : (
                      <p className="mt-1 text-gray-900 bg-gray-50 p-3 rounded-md">
                        {profile.studentId}
                      </p>
                    )}
                  </div>

                  {/* 学部・学科 */}
                  <div>
                    <Label className="text-sm font-medium text-gray-700">
                      学部・学科
                    </Label>
                    {editing ? (
                      <div className="mt-1 space-y-2">
                        <Input
                          placeholder="学部"
                          value={formData.faculty}
                          onChange={(e) =>
                            handleInputChange("faculty", e.target.value)
                          }
                        />
                        <Input
                          placeholder="学科"
                          value={formData.department}
                          onChange={(e) =>
                            handleInputChange("department", e.target.value)
                          }
                        />
                      </div>
                    ) : (
                      <p className="mt-1 text-gray-900 bg-gray-50 p-3 rounded-md">
                        {profile.faculty} / {profile.department}
                      </p>
                    )}
                  </div>

                  {/* 学年 */}
                  <div>
                    <Label className="text-sm font-medium text-gray-700">
                      学年
                    </Label>
                    {editing ? (
                      <Input
                        type="number"
                        min="1"
                        max="4"
                        value={formData.grade}
                        onChange={(e) =>
                          handleInputChange("grade", e.target.value)
                        }
                        className="mt-1"
                      />
                    ) : (
                      <p className="mt-1 text-gray-900 bg-gray-50 p-3 rounded-md">
                        {profile.grade}年生
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* 右カラム */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Globe className="h-5 w-5 mr-2" />
                  リンク・SNS
                </h3>
                <div className="space-y-4">
                  {/* GitHub */}
                  <div>
                    <Label className="text-sm font-medium text-gray-700">
                      GitHub
                    </Label>
                    {editing ? (
                      <Input
                        placeholder="GitHubユーザー名"
                        value={formData.github}
                        onChange={(e) =>
                          handleInputChange("github", e.target.value)
                        }
                        className="mt-1"
                      />
                    ) : profile.github ? (
                      <a
                        href={`https://github.com/${profile.github}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-1 text-blue-600 hover:text-blue-800 bg-blue-50 p-3 rounded-md block transition-colors"
                      >
                        <Github className="h-4 w-4 inline mr-2" />
                        github.com/{profile.github}
                      </a>
                    ) : (
                      <p className="mt-1 text-gray-500 bg-gray-50 p-3 rounded-md">
                        未設定
                      </p>
                    )}
                  </div>

                  {/* ポートフォリオURL */}
                  <div>
                    <Label className="text-sm font-medium text-gray-700">
                      ポートフォリオURL
                    </Label>
                    {editing ? (
                      <Input
                        placeholder="https://your-portfolio.com"
                        value={formData.portfolioUrl}
                        onChange={(e) =>
                          handleInputChange("portfolioUrl", e.target.value)
                        }
                        className="mt-1"
                      />
                    ) : profile.portfolioUrl ? (
                      <a
                        href={profile.portfolioUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-1 text-blue-600 hover:text-blue-800 bg-blue-50 p-3 rounded-md block transition-colors"
                      >
                        <Globe className="h-4 w-4 inline mr-2" />
                        {profile.portfolioUrl}
                      </a>
                    ) : (
                      <p className="mt-1 text-gray-500 bg-gray-50 p-3 rounded-md">
                        未設定
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Separator className="my-8" />

          {/* 自己紹介 */}
          <div className="space-y-4">
            <Label className="text-lg font-semibold text-gray-900">
              自己紹介
            </Label>
            {editing ? (
              <Textarea
                placeholder="あなたについて教えてください..."
                value={formData.bio}
                onChange={(e) => handleInputChange("bio", e.target.value)}
                maxLength={500}
                rows={4}
                className="resize-none"
              />
            ) : (
              <div className="bg-gray-50 p-4 rounded-md min-h-[100px]">
                <p className="text-gray-900 whitespace-pre-wrap">
                  {profile.bio || "自己紹介がまだ設定されていません"}
                </p>
              </div>
            )}
          </div>

          <Separator className="my-8" />

          {/* 興味分野 */}
          <div className="space-y-4">
            <Label className="text-lg font-semibold text-gray-900">
              興味のある分野・技術
            </Label>
            <div className="flex flex-wrap gap-2">
              {(editing ? formData.interests : profile.interests || []).map(
                (interest) => (
                  <Badge
                    key={interest}
                    variant="secondary"
                    className="px-3 py-1 text-sm"
                  >
                    {interest}
                    {editing && (
                      <button
                        onClick={() => removeInterest(interest)}
                        className="ml-2 text-red-500 hover:text-red-700"
                      >
                        ×
                      </button>
                    )}
                  </Badge>
                )
              )}
              {(editing ? formData.interests : profile.interests || [])
                .length === 0 && (
                <p className="text-gray-500 italic">
                  興味分野が設定されていません
                </p>
              )}
            </div>
            {editing && (
              <div className="flex space-x-2 mt-4">
                <Input
                  placeholder="新しい興味分野を追加"
                  value={newInterest}
                  onChange={(e) => setNewInterest(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && addInterest()}
                  className="flex-1"
                />
                <Button onClick={addInterest} variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  追加
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
