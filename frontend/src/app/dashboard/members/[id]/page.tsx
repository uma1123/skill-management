"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";

interface Skill {
  id: number;
  name: string;
  category: string;
  level: number;
  yearsOfExperience: number;
  description: string;
}

interface Member {
  id: number;
  name: string;
  studentId: string;
  grade: number;
  faculty: string;
  department: string;
  bio: string;
  profileImg: string | null;
  github: string;
  sns: string;
  linkedinUrl: string;
  websiteUrl: string;
  portfolioUrl: string;
  interests: string[];
  skills: Skill[];
}

export default function MemberDetailPage() {
  const params = useParams();
  const [member, setMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMemberDetail = async () => {
      try {
        const token = localStorage.getItem("token");
        console.log("Fetching member with ID:", params.id);
        console.log("Token exists:", !!token);

        // 直接バックエンドAPIを呼び出し
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/members/${params.id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        console.log("Response status:", response.status);

        if (!response.ok) {
          const errorText = await response.text();
          console.log("Error response:", errorText);
          throw new Error(
            `メンバー情報の取得に失敗しました (${response.status})`
          );
        }

        const data = await response.json();
        console.log("Received data:", data);
        setMember(data);
      } catch (err) {
        console.error("Fetch error:", err);
        setError(err instanceof Error ? err.message : "エラーが発生しました");
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchMemberDetail();
    }
  }, [params.id]);

  if (loading) return <div className="p-6">読み込み中...</div>;
  if (error) return <div className="p-6 text-red-500">エラー: {error}</div>;
  if (!member) return <div className="p-6">メンバーが見つかりません</div>;

  const skillsByCategory = member.skills.reduce((acc, skill) => {
    const category = skill.category || "未分類";
    if (!acc[category]) acc[category] = [];
    acc[category].push(skill);
    return acc;
  }, {} as Record<string, Skill[]>);

  const getSkillLevelText = (level: number) => {
    const levels = ["未経験", "初心者", "基礎", "中級", "上級", "エキスパート"];
    return levels[level] || "不明";
  };

  const getSkillLevelColor = (level: number) => {
    const colors = [
      "bg-gray-200",
      "bg-red-200",
      "bg-orange-200",
      "bg-yellow-200",
      "bg-green-200",
      "bg-blue-200",
    ];
    return colors[level] || "bg-gray-200";
  };

  return (
    <div className="container mx-auto px-4 py-6">
      {/* プロフィールセクション */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-start space-x-6">
          <div className="flex-shrink-0">
            <div className="w-24 h-24 rounded-full bg-gray-300 flex items-center justify-center">
              <span className="text-gray-600 text-xl font-semibold">
                {member.name.charAt(0)}
              </span>
            </div>
          </div>

          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {member.name}
            </h1>
            <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-4">
              <div>学籍番号: {member.studentId}</div>
              <div>学年: {member.grade}年</div>
              <div>学部: {member.faculty}</div>
              <div>学科: {member.department}</div>
            </div>

            {member.bio && <p className="text-gray-700 mb-4">{member.bio}</p>}

            {/* 興味・関心 */}
            {member.interests.length > 0 && (
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">
                  興味・関心
                </h3>
                <div className="flex flex-wrap gap-2">
                  {member.interests.map((interest, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* リンク */}
            <div className="flex space-x-4">
              {member.github && (
                <a
                  href={member.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  GitHub
                </a>
              )}
              {member.linkedinUrl && (
                <a
                  href={member.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  LinkedIn
                </a>
              )}
              {member.websiteUrl && (
                <a
                  href={member.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  Website
                </a>
              )}
              {member.portfolioUrl && (
                <a
                  href={member.portfolioUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  Portfolio
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* スキルセクション */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          スキル ({member.skills.length})
        </h2>

        {Object.keys(skillsByCategory).length === 0 ? (
          <p className="text-gray-500">登録されているスキルがありません</p>
        ) : (
          <div className="space-y-6">
            {Object.entries(skillsByCategory).map(([category, skills]) => (
              <div key={category}>
                <h3 className="text-lg font-semibold text-gray-800 mb-3 border-b pb-2">
                  {category}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {skills.map((skill) => (
                    <div
                      key={skill.id}
                      className={`p-4 rounded-lg border ${getSkillLevelColor(
                        skill.level
                      )}`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium text-gray-900">
                          {skill.name}
                        </h4>
                        <span className="text-sm text-gray-600">
                          {getSkillLevelText(skill.level)} (Lv.{skill.level})
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 mb-2">
                        経験年数: {skill.yearsOfExperience}年
                      </div>
                      {skill.description && (
                        <p className="text-sm text-gray-700">
                          {skill.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
