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

interface Member {
  id: number;
  name: string;
  studentId: string;
  grade: number;
  faculty: string;
  department: string;
  skillCount: number;
  mainSkills: string[];
  bio: string;
}

export default function DashboardPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [gradeFilter, setGradeFilter] = useState("all");
  const [skillFilter, setSkillFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      // TODO: 実際のAPIに置き換え
      const dummyMembers: Member[] = [
        {
          id: 1,
          name: "田中太郎",
          studentId: "B21001",
          grade: 1,
          faculty: "情報学部",
          department: "情報システム学科",
          skillCount: 3,
          mainSkills: ["JavaScript", "React", "Node.js"],
          bio: "フロントエンド開発に興味があります",
        },
        {
          id: 2,
          name: "佐藤花子",
          studentId: "B21002",
          grade: 2,
          faculty: "情報学部",
          department: "情報システム学科",
          skillCount: 5,
          mainSkills: ["Python", "Django", "PostgreSQL", "Docker"],
          bio: "バックエンド開発とDevOpsが得意です",
        },
        {
          id: 3,
          name: "鈴木次郎",
          studentId: "B20003",
          grade: 3,
          faculty: "情報学部",
          department: "情報システム学科",
          skillCount: 4,
          mainSkills: ["Java", "Spring Boot", "MySQL", "AWS"],
          bio: "エンタープライズ開発に興味があります",
        },
      ];

      setTimeout(() => {
        setMembers(dummyMembers);
        setLoading(false);
      }, 500);
    } catch (error) {
      console.error("メンバー取得エラー:", error);
      setLoading(false);
    }
  };

  const filteredMembers = members.filter((member) => {
    const matchesSearch =
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.faculty.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.mainSkills.some((skill) =>
        skill.toLowerCase().includes(searchTerm.toLowerCase())
      );

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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
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
        </div>
      </div>

      {/* 検索・フィルター */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="名前、学部、学籍番号、スキルで検索..."
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
              <SelectItem value="1">1年生</SelectItem>
              <SelectItem value="2">2年生</SelectItem>
              <SelectItem value="3">3年生</SelectItem>
              <SelectItem value="4">4年生</SelectItem>
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
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                  {member.bio || "自己紹介がまだ設定されていません"}
                </p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">
                  スキル数: {member.skillCount}個
                </p>
                <div className="space-y-2">
                  <p className="text-xs text-gray-500">主なスキル:</p>
                  <div className="flex flex-wrap gap-1">
                    {member.mainSkills.slice(0, 3).map((skill) => (
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

      {filteredMembers.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">
            条件に一致するメンバーが見つかりません
          </p>
        </div>
      )}
    </div>
  );
}
