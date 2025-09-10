"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  TrendingUp,
  Target,
  Award,
  Clock,
  BarChart3,
  Activity,
  Lightbulb,
  Star,
  ArrowUp,
  RefreshCw,
  Calendar,
  Zap,
} from "lucide-react";

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

interface CategoryAverage {
  totalLevel: number;
  totalExperience: number;
  count: number;
  averageLevel: string;
  averageExperience: string;
  skills: UserSkill[];
}

interface SkillHistory {
  id: number;
  userId: number;
  skillId: number;
  action: "add" | "update";
  previousLevel?: number;
  newLevel: number;
  previousExperience?: number;
  newExperience: number;
  timestamp: string;
}

interface BalanceType {
  type: string;
  description: string;
  score: string;
}

interface GrowthTrend {
  [category: string]: {
    updates: number;
    levelUps: number;
    lastUpdate: string;
  };
}

interface PotentialAnalysis {
  highExperienceLowLevel: UserSkill[];
  recentlyUntouched: UserSkill[];
  recommendations: Array<{
    type: "level_up" | "refresh";
    skill: string;
    message: string;
  }>;
}

interface SelfAnalysisData {
  userSkills: UserSkill[];
  categoryAverages: { [key: string]: CategoryAverage };
  skillHistory: SkillHistory[];
  recentUpdates: UserSkill[];
  balanceType: BalanceType;
  growthTrends: GrowthTrend;
  potentialAnalysis: PotentialAnalysis;
}

export default function AnalyticsPage() {
  const [analysisData, setAnalysisData] = useState<SelfAnalysisData | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [reflectionMemo, setReflectionMemo] = useState("");

  useEffect(() => {
    fetchAnalysisData();
  }, []);

  const fetchAnalysisData = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token || token === "undefined") {
        alert("ログインが必要です");
        window.location.href = "/login";
        return;
      }

      console.log("分析データを取得中...");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/members/self-analysis`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setAnalysisData(data);
      } else {
        console.error("API応答エラー:", response.status);
        const errorText = await response.text();
        console.error("エラー詳細:", errorText);
      }
    } catch (error) {
      console.error("分析データ取得エラー:", error);
    } finally {
      setLoading(false);
    }
  };

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

  const getRecentUpdateIcon = (updatedAt: string) => {
    const updateDate = new Date(updatedAt);
    const now = new Date();
    const daysDiff =
      (now.getTime() - updateDate.getTime()) / (1000 * 3600 * 24);

    if (daysDiff <= 7) {
      return (
        <span title="最近更新">
          <Zap className="h-4 w-4 text-yellow-500" />
        </span>
      );
    } else if (daysDiff <= 30) {
      return (
        <span title="1ヶ月以内に更新">
          <Clock className="h-4 w-4 text-blue-500" />
        </span>
      );
    }
    return null;
  };

  const getLevelChangeIcon = (history: SkillHistory) => {
    if (history.action === "add") {
      return (
        <Badge variant="secondary" className="text-xs">
          NEW
        </Badge>
      );
    }
    if (history.previousLevel && history.newLevel > history.previousLevel) {
      return (
        <div className="flex items-center space-x-1">
          <ArrowUp className="h-3 w-3 text-green-500" />
          <span className="text-xs text-green-600">
            Lv{history.previousLevel} → Lv{history.newLevel}
          </span>
        </div>
      );
    }
    return null;
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

  if (!analysisData) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">分析データを取得できませんでした</p>
        <Button onClick={fetchAnalysisData} className="mt-4">
          <RefreshCw className="h-4 w-4 mr-2" />
          再試行
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-gray-900">スキル自己分析</h1>
          <p className="text-gray-600">
            あなたのスキルを多角的に分析し、成長をサポートします
          </p>
        </div>
        <Button onClick={fetchAnalysisData} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          更新
        </Button>
      </div>

      <Tabs defaultValue="strengths" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="strengths">強み・弱み</TabsTrigger>
          <TabsTrigger value="growth">成長可視化</TabsTrigger>
          <TabsTrigger value="experience">経験分析</TabsTrigger>
          <TabsTrigger value="insights">自己分析</TabsTrigger>
        </TabsList>

        {/* 強み・弱み分析 */}
        <TabsContent value="strengths" className="space-y-6">
          {/* カテゴリ別平均レベル */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5" />
                <span>カテゴリ別平均レベル</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(analysisData.categoryAverages).map(
                  ([category, data]) => (
                    <div key={category} className="p-4 border rounded-lg">
                      <h3 className="font-medium text-sm mb-2">{category}</h3>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-2xl font-bold">
                          {data.averageLevel}
                        </span>
                        <div className="text-xs text-gray-500">
                          {data.count}スキル
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{
                            width: `${
                              (parseFloat(data.averageLevel) / 5) * 100
                            }%`,
                          }}
                        ></div>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        経験年数: {data.averageExperience}年
                      </div>
                    </div>
                  )
                )}
              </div>
            </CardContent>
          </Card>

          {/* スキルヒートマップ */}
          <Card>
            <CardHeader>
              <CardTitle>スキルヒートマップ</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(analysisData.categoryAverages).map(
                  ([category, data]) => (
                    <div key={category} className="space-y-2">
                      <h3 className="font-medium text-sm">{category}</h3>
                      <div className="flex flex-wrap gap-2">
                        {data.skills.map((skill) => (
                          <div
                            key={skill.skillId}
                            className={`px-3 py-2 rounded text-xs font-medium flex items-center space-x-2 ${
                              skill.level >= 4
                                ? "bg-green-100 text-green-800"
                                : skill.level >= 3
                                ? "bg-yellow-100 text-yellow-800"
                                : skill.level >= 2
                                ? "bg-orange-100 text-orange-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            <span>{skill.skillName}</span>
                            <span className="font-bold">Lv.{skill.level}</span>
                            {getRecentUpdateIcon(skill.updatedAt)}
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 成長可視化 */}
        <TabsContent value="growth" className="space-y-6">
          {/* 直近更新スキル */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="h-5 w-5" />
                <span>最近の更新スキル（1ヶ月以内）</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* デバッグ情報を表示 */}
              {analysisData.recentUpdates.length > 0 ? (
                <div className="space-y-3">
                  {analysisData.recentUpdates
                    .slice(0, 5)
                    .map((skill, index) => (
                      <div
                        key={skill.skillId || index}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center space-x-2">
                            {getRecentUpdateIcon(skill.updatedAt)}
                            <span className="font-medium">
                              {skill.skillName ||
                                `[スキル名なし] ID: ${skill.skillId}`}
                            </span>
                          </div>
                          <Badge variant="outline">
                            {skill.skillCategory || "[カテゴリなし]"}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-3">
                          {renderStars(skill.level)}
                          <span className="text-sm text-gray-500">
                            {new Date(skill.updatedAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">
                  最近更新されたスキルはありません
                </p>
              )}
            </CardContent>
          </Card>

          {/* レベルアップ履歴 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5" />
                <span>最近のレベルアップ</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {analysisData.skillHistory.length > 0 ? (
                <div className="space-y-3">
                  {analysisData.skillHistory
                    .filter(
                      (h) =>
                        h.action === "update" &&
                        h.previousLevel &&
                        h.newLevel > h.previousLevel
                    )
                    .slice(0, 5)
                    .map((history) => {
                      const skill = analysisData.userSkills.find(
                        (s) => s.skillId === history.skillId
                      );
                      return (
                        <div
                          key={history.id}
                          className="flex items-center justify-between p-3 border rounded-lg bg-green-50"
                        >
                          <div className="flex items-center space-x-3">
                            <ArrowUp className="h-5 w-5 text-green-600" />
                            <div>
                              <span className="font-medium">
                                {skill?.skillName}
                              </span>
                              <p className="text-sm text-gray-600">
                                {skill?.skillCategory}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            {getLevelChangeIcon(history)}
                            <span className="text-sm text-gray-500">
                              {new Date(history.timestamp).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">
                  レベルアップ履歴はありません
                </p>
              )}
            </CardContent>
          </Card>

          {/* 成長傾向カード */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg text-green-600">
                  最近伸びている分野
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(analysisData.growthTrends)
                    .sort(([, a], [, b]) => b.updates - a.updates)
                    .slice(0, 3)
                    .map(([category, trend]) => (
                      <div
                        key={category}
                        className="flex justify-between items-center"
                      >
                        <span className="text-sm">{category}</span>
                        <div className="flex items-center space-x-2">
                          <Badge variant="secondary">
                            {trend.updates}回更新
                          </Badge>
                          {trend.levelUps > 0 && (
                            <Badge variant="default">
                              {trend.levelUps}回レベルアップ
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg text-orange-600">
                  あまり手をつけていない分野
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(analysisData.categoryAverages)
                    .filter(
                      ([category]) => !analysisData.growthTrends[category]
                    )
                    .slice(0, 3)
                    .map(([category, data]) => (
                      <div
                        key={category}
                        className="flex justify-between items-center"
                      >
                        <span className="text-sm">{category}</span>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline">{data.count}スキル</Badge>
                          <span className="text-xs text-gray-500">
                            更新なし
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* 経験分析 */}
        <TabsContent value="experience" className="space-y-6">
          {/* 経験年数 vs レベル散布図風 */}
          <Card>
            <CardHeader>
              <CardTitle>経験年数とレベルの関係</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium mb-3 text-green-600">
                    効率よく成長しているスキル
                  </h3>
                  <div className="space-y-2">
                    {analysisData.userSkills
                      .filter(
                        (skill) =>
                          skill.level >= 3 && skill.yearsOfExperience <= 2
                      )
                      .slice(0, 5)
                      .map((skill) => (
                        <div
                          key={skill.skillId}
                          className="flex justify-between items-center p-2 bg-green-50 rounded"
                        >
                          <span className="text-sm">{skill.skillName}</span>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs">Lv{skill.level}</span>
                            <span className="text-xs text-gray-500">
                              {skill.yearsOfExperience}年
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
                <div>
                  <h3 className="font-medium mb-3 text-orange-600">
                    伸びしろがあるスキル
                  </h3>
                  <div className="space-y-2">
                    {analysisData.potentialAnalysis.highExperienceLowLevel
                      .slice(0, 5)
                      .map((skill) => (
                        <div
                          key={skill.skillId}
                          className="flex justify-between items-center p-2 bg-orange-50 rounded"
                        >
                          <span className="text-sm">{skill.skillName}</span>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs">Lv{skill.level}</span>
                            <span className="text-xs text-gray-500">
                              {skill.yearsOfExperience}年
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* カテゴリ別経験年数合計 */}
          <Card>
            <CardHeader>
              <CardTitle>カテゴリ別総経験年数</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {Object.entries(analysisData.categoryAverages).map(
                  ([category, data]) => (
                    <div
                      key={category}
                      className="text-center p-4 border rounded-lg"
                    >
                      <h3 className="font-medium text-sm mb-2">{category}</h3>
                      <div className="text-2xl font-bold text-blue-600">
                        {data.totalExperience.toFixed(1)}年
                      </div>
                      <div className="text-xs text-gray-500">
                        {data.count}スキル
                      </div>
                    </div>
                  )
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 自己分析サポート */}
        <TabsContent value="insights" className="space-y-6">
          {/* バランスタイプ判定 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Award className="h-5 w-5" />
                <span>あなたのスキルタイプ</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {analysisData.balanceType.type}
                </div>
                <p className="text-gray-600 mb-4">
                  {analysisData.balanceType.description}
                </p>
                <div className="text-sm text-gray-500">
                  分散度: {analysisData.balanceType.score}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 伸びしろ分析 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Lightbulb className="h-5 w-5" />
                <span>成長提案</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analysisData.potentialAnalysis.recommendations.map(
                  (rec, index) => (
                    <div
                      key={index}
                      className={`p-4 rounded-lg border-l-4 ${
                        rec.type === "level_up"
                          ? "bg-green-50 border-green-500"
                          : "bg-blue-50 border-blue-500"
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        {rec.type === "level_up" ? (
                          <Target className="h-5 w-5 text-green-600 mt-0.5" />
                        ) : (
                          <RefreshCw className="h-5 w-5 text-blue-600 mt-0.5" />
                        )}
                        <div>
                          <p className="text-sm font-medium">{rec.skill}</p>
                          <p className="text-sm text-gray-600">{rec.message}</p>
                        </div>
                      </div>
                    </div>
                  )
                )}
              </div>
            </CardContent>
          </Card>

          {/* 振り返りメモ */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5" />
                <span>振り返りメモ</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="スキルの振り返りや今後の学習計画をメモしてください&#10;例：来月はReactのレベルを4に上げたい&#10;例：Pythonを久々に触ってみる"
                value={reflectionMemo}
                onChange={(e) => setReflectionMemo(e.target.value)}
                rows={6}
                className="resize-none"
              />
              <div className="flex justify-end mt-4">
                <Button>メモを保存</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
