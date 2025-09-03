"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import {
  BarChart3,
  Users,
  TrendingUp,
  Star,
  Award,
  Target,
  PieChart,
  ArrowUp,
  ArrowDown,
  Minus,
} from "lucide-react";

interface Member {
  id: number;
  name: string;
  email: string;
  skills: UserSkill[];
  skillCount: number;
  averageLevel: string;
  totalExperience: number;
  mainSkills: string[];
}

interface UserSkill {
  userId: number;
  skillId: number;
  level: number;
  yearsOfExperience: number;
  description: string;
  skillName: string;
  skillCategory: string;
}

interface SkillStatistic {
  skillName: string;
  category: string;
  userCount: number;
  penetrationRate: string;
  averageLevel: string;
  averageExperience: string;
  levelDistribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}

interface CategoryStatistic {
  skillCount: number;
  totalUserSkillCount: number;
  averagePenetration: string;
  skills: SkillStatistic[];
}

interface ComparisonData {
  currentUser: {
    id: number;
    name: string;
    skillCount: number;
    averageLevel: string;
  };
  targetUser: {
    id: number;
    name: string;
    skillCount: number;
    averageLevel: string;
  };
  comparison: {
    commonSkills: {
      skillName: string;
      category: string;
      myLevel: number;
      myExperience: number;
      theirLevel: number;
      theirExperience: number;
      levelDifference: number;
    }[];
    myUniqueSkills: UserSkill[];
    theirUniqueSkills: UserSkill[];
    commonSkillCount: number;
  };
}

export default function AnalyticsPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [skillStatistics, setSkillStatistics] = useState<{
    [key: string]: SkillStatistic;
  }>({});
  const [categoryStatistics, setCategoryStatistics] = useState<{
    [key: string]: CategoryStatistic;
  }>({});
  const [recommendedSkills, setRecommendedSkills] = useState<SkillStatistic[]>(
    []
  );
  const [comparisonData, setComparisonData] = useState<ComparisonData | null>(
    null
  );
  const [selectedMember, setSelectedMember] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<Member | null>(null);

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token || token === "undefined") {
        alert("ログインが必要です");
        window.location.href = "/login";
        return;
      }

      // 全メンバー取得
      const membersResponse = await fetch("http://localhost:3001/api/members", {
        headers: { Authorization: `Bearer ${token}` },
      });

      // スキル統計取得
      const statisticsResponse = await fetch(
        "http://localhost:3001/api/members/statistics",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (membersResponse.ok && statisticsResponse.ok) {
        const membersData = await membersResponse.json();
        const statisticsData = await statisticsResponse.json();

        setMembers(membersData.members);
        setSkillStatistics(statisticsData.skillStatistics);
        setCategoryStatistics(statisticsData.categoryStatistics);
        setRecommendedSkills(statisticsData.recommendedSkills || []);

        // 現在のユーザーを特定
        const userInfo = JSON.parse(localStorage.getItem("user") || "{}");
        const current = membersData.members.find(
          (m: Member) => m.id === userInfo.id
        );
        setCurrentUser(current || null);
      }
    } catch (error) {
      console.error("分析データ取得エラー:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchComparison = async (targetUserId: string) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:3001/api/members/compare/${targetUserId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setComparisonData(data);
      }
    } catch (error) {
      console.error("比較データ取得エラー:", error);
    }
  };

  useEffect(() => {
    if (selectedMember) {
      fetchComparison(selectedMember);
    }
  }, [selectedMember]);

  const renderStars = (level: number) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-3 w-3 ${
              star <= level
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300"
            }`}
          />
        ))}
      </div>
    );
  };

  const getComparisonIcon = (difference: number) => {
    if (difference > 0) return <ArrowUp className="h-4 w-4 text-green-500" />;
    if (difference < 0) return <ArrowDown className="h-4 w-4 text-red-500" />;
    return <Minus className="h-4 w-4 text-gray-500" />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600">分析データを読み込んでいます...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* ヘッダー */}
      <div className="space-y-1">
        <h1 className="text-3xl font-bold text-gray-900">
          スキル分析・レポート
        </h1>
        <p className="text-gray-600">
          スキルの分析結果と他のメンバーとの比較を確認できます
        </p>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">概要</TabsTrigger>
          <TabsTrigger value="skills">スキル統計</TabsTrigger>
          <TabsTrigger value="comparison">メンバー比較</TabsTrigger>
          <TabsTrigger value="recommendations">推奨スキル</TabsTrigger>
        </TabsList>

        {/* 概要タブ */}
        <TabsContent value="overview" className="space-y-6">
          {/* 全体統計 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-blue-500" />
                  <div className="text-2xl font-bold">{members.length}</div>
                </div>
                <p className="text-xs text-muted-foreground">総メンバー数</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center space-x-2">
                  <Award className="h-4 w-4 text-green-500" />
                  <div className="text-2xl font-bold">
                    {Object.keys(skillStatistics).length}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">総スキル数</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center space-x-2">
                  <PieChart className="h-4 w-4 text-purple-500" />
                  <div className="text-2xl font-bold">
                    {Object.keys(categoryStatistics).length}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">カテゴリ数</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-4 w-4 text-orange-500" />
                  <div className="text-2xl font-bold">
                    {currentUser ? currentUser.skillCount : 0}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  あなたのスキル数
                </p>
              </CardContent>
            </Card>
          </div>

          {/* トップスキル */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5" />
                <span>人気スキルトップ10</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(skillStatistics)
                  .sort(([, a], [, b]) => b.userCount - a.userCount)
                  .slice(0, 10)
                  .map(([skillId, skill], index) => (
                    <div
                      key={skillId}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-sm font-medium text-blue-600">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium">{skill.skillName}</p>
                          <p className="text-sm text-gray-500">
                            {skill.category}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{skill.userCount}人</p>
                        <p className="text-sm text-gray-500">
                          {skill.penetrationRate}%
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* スキル統計タブ */}
        <TabsContent value="skills" className="space-y-6">
          {/* カテゴリ別統計 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(categoryStatistics).map(([category, stats]) => (
              <Card key={category}>
                <CardHeader>
                  <CardTitle className="text-lg">{category}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">スキル数</p>
                      <p className="font-medium">{stats.skillCount}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">平均普及率</p>
                      <p className="font-medium">{stats.averagePenetration}%</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-2">トップスキル</p>
                    <div className="space-y-1">
                      {stats.skills
                        .sort((a, b) => b.userCount - a.userCount)
                        .slice(0, 3)
                        .map((skill) => (
                          <div
                            key={skill.skillName}
                            className="flex justify-between items-center"
                          >
                            <span className="text-sm">{skill.skillName}</span>
                            <Badge variant="secondary" className="text-xs">
                              {skill.userCount}人
                            </Badge>
                          </div>
                        ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* メンバー比較タブ */}
        <TabsContent value="comparison" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>メンバーとのスキル比較</CardTitle>
              <div className="flex items-center space-x-4">
                <Select
                  value={selectedMember}
                  onValueChange={setSelectedMember}
                >
                  <SelectTrigger className="w-64">
                    <SelectValue placeholder="比較するメンバーを選択" />
                  </SelectTrigger>
                  <SelectContent>
                    {members
                      .filter((member) => member.id !== currentUser?.id)
                      .map((member) => (
                        <SelectItem
                          key={member.id}
                          value={member.id.toString()}
                        >
                          {member.name} ({member.skillCount}スキル)
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              {comparisonData ? (
                <div className="space-y-6">
                  {/* 基本情報比較 */}
                  <div className="grid grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">
                          {comparisonData.currentUser.name} (あなた)
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-500">スキル数:</span>
                          <span className="font-medium">
                            {comparisonData.currentUser.skillCount}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">平均レベル:</span>
                          <span className="font-medium">
                            {comparisonData.currentUser.averageLevel}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">
                          {comparisonData.targetUser.name}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-500">スキル数:</span>
                          <span className="font-medium">
                            {comparisonData.targetUser.skillCount}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">平均レベル:</span>
                          <span className="font-medium">
                            {comparisonData.targetUser.averageLevel}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* 共通スキル */}
                  {comparisonData.comparison.commonSkills.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle>
                          共通スキル (
                          {comparisonData.comparison.commonSkillCount})
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {comparisonData.comparison.commonSkills.map(
                            (skill, index) => (
                              <div
                                key={index}
                                className="flex items-center justify-between p-3 border rounded-lg"
                              >
                                <div>
                                  <p className="font-medium">
                                    {skill.skillName}
                                  </p>
                                  <p className="text-sm text-gray-500">
                                    {skill.category}
                                  </p>
                                </div>
                                <div className="flex items-center space-x-6">
                                  <div className="text-center">
                                    <p className="text-sm text-gray-500">
                                      あなた
                                    </p>
                                    {renderStars(skill.myLevel)}
                                    <p className="text-xs text-gray-500">
                                      {skill.myExperience}年
                                    </p>
                                  </div>
                                  <div className="flex items-center">
                                    {getComparisonIcon(skill.levelDifference)}
                                  </div>
                                  <div className="text-center">
                                    <p className="text-sm text-gray-500">
                                      相手
                                    </p>
                                    {renderStars(skill.theirLevel)}
                                    <p className="text-xs text-gray-500">
                                      {skill.theirExperience}年
                                    </p>
                                  </div>
                                </div>
                              </div>
                            )
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* あなただけのスキル */}
                  {comparisonData.comparison.myUniqueSkills.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle>
                          あなただけが持つスキル (
                          {comparisonData.comparison.myUniqueSkills.length})
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {comparisonData.comparison.myUniqueSkills.map(
                            (skill, index) => (
                              <div
                                key={index}
                                className="p-3 border rounded-lg"
                              >
                                <p className="font-medium">{skill.skillName}</p>
                                <div className="flex items-center justify-between mt-1">
                                  {renderStars(skill.level)}
                                  <span className="text-sm text-gray-500">
                                    {skill.yearsOfExperience}年
                                  </span>
                                </div>
                              </div>
                            )
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* 相手だけのスキル */}
                  {comparisonData.comparison.theirUniqueSkills.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle>
                          相手だけが持つスキル (
                          {comparisonData.comparison.theirUniqueSkills.length})
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {comparisonData.comparison.theirUniqueSkills.map(
                            (skill, index) => (
                              <div
                                key={index}
                                className="p-3 border rounded-lg bg-orange-50"
                              >
                                <p className="font-medium">{skill.skillName}</p>
                                <div className="flex items-center justify-between mt-1">
                                  {renderStars(skill.level)}
                                  <span className="text-sm text-gray-500">
                                    {skill.yearsOfExperience}年
                                  </span>
                                </div>
                              </div>
                            )
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">
                  比較するメンバーを選択してください
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 推奨スキルタブ */}
        <TabsContent value="recommendations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="h-5 w-5" />
                <span>取得推奨スキル</span>
              </CardTitle>
              <p className="text-sm text-gray-600">
                普及率が高く、あなたがまだ習得していないスキルです
              </p>
            </CardHeader>
            <CardContent>
              {recommendedSkills.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {recommendedSkills.map((skill, index) => (
                    <Card key={index} className="border-l-4 border-l-blue-500">
                      <CardContent className="pt-4">
                        <div className="space-y-3">
                          <div>
                            <h3 className="font-medium">{skill.skillName}</h3>
                            <p className="text-sm text-gray-500">
                              {skill.category}
                            </p>
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-gray-500">普及率</p>
                              <div className="flex items-center space-x-2">
                                <Progress
                                  value={parseFloat(skill.penetrationRate)}
                                  className="flex-1"
                                />
                                <span className="font-medium">
                                  {skill.penetrationRate}%
                                </span>
                              </div>
                            </div>
                            <div>
                              <p className="text-gray-500">習得者数</p>
                              <p className="font-medium">{skill.userCount}人</p>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-gray-500">平均レベル</p>
                              <div className="flex items-center space-x-2">
                                {renderStars(
                                  Math.round(parseFloat(skill.averageLevel))
                                )}
                                <span className="text-sm">
                                  {skill.averageLevel}
                                </span>
                              </div>
                            </div>
                            <div>
                              <p className="text-gray-500">平均経験年数</p>
                              <p className="font-medium">
                                {skill.averageExperience}年
                              </p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">現在推奨スキルはありません</p>
                  <p className="text-sm text-gray-500">
                    すべての人気スキルを習得済みです！
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
