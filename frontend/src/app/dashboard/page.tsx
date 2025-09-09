"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, Eye } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface UserSkill {
  userId: number;
  skillId: number;
  level: number;
  yearsOfExperience: number;
  description: string;
  skillName: string;
  skillCategory: string;
  createdAt: string;
  updatedAt: string;
}

interface Member {
  id: number;
  name: string;
  studentId: string;
  grade: number;
  faculty: string;
  department: string;
  skills: UserSkill[];
  skillCount: number;
  averageLevel: string;
  totalExperience: number;
  mainSkills: string[];
  bio: string;
  profileImg: string | null;
  github: string;
  sns: string;
  linkedinUrl: string;
  websiteUrl: string;
  portfolioUrl: string;
  interests: string[];
}

export default function DashboardPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [gradeFilter, setGradeFilter] = useState("all");
  const [skillFilter, setSkillFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token || token === "undefined") {
        alert("ログインが必要です");
        window.location.href = "/login";
        return;
      }

      const response = await fetch("http://localhost:3001/api/members", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setMembers(data.members);
        setError(null);
      } else if (response.status === 401) {
        alert("ログインの有効期限が切れました");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login";
      } else {
        const errorData = await response.json();
        setError(errorData.error || "メンバー情報の取得に失敗しました");
      }
    } catch (error) {
      console.error("メンバー取得エラー:", error);
      setError("ネットワークエラーが発生しました");
    } finally {
      setLoading(false);
    }
  };

  const filteredMembers = members.filter((member) => {
    const matchesSearch =
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.faculty.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.mainSkills.some((skill) =>
        skill.toLowerCase().includes(searchTerm.toLowerCase())
      ) ||
      (member.bio &&
        member.bio.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesGrade =
      gradeFilter === "all" || member.grade.toString() === gradeFilter;

    const matchesSkill =
      skillFilter === "all" ||
      member.mainSkills.some((skill) => skill === skillFilter);

    return matchesSearch && matchesGrade && matchesSkill;
  });

  // 全スキルの一覧を取得（フィルター用）
  const allSkills = Array.from(
    new Set(members.flatMap((member) => member.mainSkills))
  ).sort();

  // 学年の選択肢を動的に生成
  const availableGrades = Array.from(
    new Set(members.map((member) => member.grade))
  ).sort();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600">メンバー情報を読み込んでいます...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
            <span className="text-red-600 text-2xl">⚠️</span>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              エラーが発生しました
            </h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={fetchMembers} variant="outline">
              再試行
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">メンバー一覧</h1>
          <p className="text-gray-600 mt-1">
            サークルメンバーの情報とスキルを確認できます
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">
            総メンバー数: {members.length}人
          </p>
          <p className="text-xs text-gray-400">
            表示中: {filteredMembers.length}人
          </p>
        </div>
      </div>

      {/* 検索・フィルター */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="名前、学部、学籍番号、スキル、自己紹介で検索..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={gradeFilter} onValueChange={setGradeFilter}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="全学年" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全学年</SelectItem>
              {availableGrades.map((grade) => (
                <SelectItem key={grade} value={grade.toString()}>
                  {grade}年生
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={skillFilter} onValueChange={setSkillFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="全スキル" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全スキル</SelectItem>
              {allSkills.map((skill) => (
                <SelectItem key={skill} value={skill}>
                  {skill}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* 統計情報カード */}
      <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {members.length}
              </div>
              <p className="text-xs text-muted-foreground">総メンバー数</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {members.reduce((sum, member) => sum + member.skillCount, 0)}
              </div>
              <p className="text-xs text-muted-foreground">総スキル登録数</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* メンバー一覧 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMembers.map((member) => (
          <Card key={member.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-slate-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                  {member.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-lg text-gray-900 truncate">
                    {member.name}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {member.grade}年生・{member.studentId}
                  </p>
                  <p className="text-xs text-gray-400 truncate">
                    {member.faculty} {member.department}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                  {member.bio || "自己紹介がまだ設定されていません"}
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <p className="text-sm font-medium text-gray-700">
                    スキル数: {member.skillCount}個
                  </p>
                  <p className="text-xs text-gray-500">
                    平均レベル: {member.averageLevel}
                  </p>
                </div>

                {Array.isArray(member.mainSkills) &&
                  member.mainSkills.length > 0 && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1">主なスキル:</p>
                      <div className="flex flex-wrap gap-1">
                        {member.mainSkills
                          .filter(
                            (skill): skill is string =>
                              typeof skill === "string" && skill !== ""
                          )
                          .slice(0, 3)
                          .map((skill) => (
                            <Badge
                              key={skill}
                              variant="secondary"
                              className="text-xs"
                            >
                              {skill}
                            </Badge>
                          ))}
                        {member.mainSkills.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{member.mainSkills.length - 3}個
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                {member.totalExperience > 0 && (
                  <p className="text-xs text-gray-500">
                    総経験年数: {member.totalExperience.toFixed(1)}年
                  </p>
                )}
              </div>

              <Link href={`/dashboard/members/${member.id}`}>
                <Button variant="outline" size="sm" className="w-full">
                  <Eye className="h-4 w-4 mr-2" />
                  詳細を見る
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredMembers.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="h-8 w-8 text-gray-400" />
          </div>
          <p className="text-gray-500 mb-2">
            条件に一致するメンバーが見つかりません
          </p>
          <p className="text-sm text-gray-400">
            検索条件を変更してみてください
          </p>
        </div>
      )}
    </div>
  );
}
