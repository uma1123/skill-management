"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Plus,
  Star,
  Trash2,
  Edit,
  Save,
  X,
  Check,
  ChevronsUpDown,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Skill {
  id: number;
  name: string;
  category: string;
}

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

interface SkillsByCategory {
  [category: string]: Skill[];
}

export default function SkillsPage() {
  const [allSkills, setAllSkills] = useState<Skill[]>([]);
  const [skillsByCategory, setSkillsByCategory] = useState<SkillsByCategory>(
    {}
  );
  const [userSkills, setUserSkills] = useState<UserSkill[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // 新規スキル追加用
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedSkillId, setSelectedSkillId] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("");
  const [selectedYears, setSelectedYears] = useState("");
  const [selectedDescription, setSelectedDescription] = useState("");

  // スキル検索用
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [filteredSkills, setFilteredSkills] = useState<Skill[]>([]);

  // 編集用
  const [editingSkillId, setEditingSkillId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({
    level: "",
    yearsOfExperience: "",
    description: "",
  });

  useEffect(() => {
    fetchSkills();
    fetchMySkills();
  }, []);

  // スキルフィルタリング
  useEffect(() => {
    const userSkillIds = userSkills.map((us) => us.skillId);
    const availableSkills = allSkills.filter(
      (skill) => !userSkillIds.includes(skill.id)
    );

    if (searchValue.trim() === "") {
      setFilteredSkills(availableSkills);
    } else {
      const filtered = availableSkills.filter(
        (skill) =>
          skill.name.toLowerCase().includes(searchValue.toLowerCase()) ||
          skill.category.toLowerCase().includes(searchValue.toLowerCase())
      );
      setFilteredSkills(filtered);
    }
  }, [allSkills, userSkills, searchValue]);

  // 全スキル取得
  const fetchSkills = async () => {
    try {
      const response = await fetch("http://localhost:3001/api/skills");
      if (response.ok) {
        const data = await response.json();
        setAllSkills(data.skills);
        setSkillsByCategory(data.skillsByCategory);
      }
    } catch (error) {
      console.error("スキル取得エラー:", error);
    }
  };

  // 自分のスキル取得
  const fetchMySkills = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token || token === "undefined") {
        alert("ログインが必要です");
        window.location.href = "/login";
        return;
      }

      const response = await fetch("http://localhost:3001/api/skills/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUserSkills(data.skills);
      } else if (response.status === 401) {
        alert("ログインの有効期限が切れました");
        localStorage.removeItem("token");
        window.location.href = "/login";
      }
    } catch (error) {
      console.error("ユーザースキル取得エラー:", error);
    } finally {
      setLoading(false);
    }
  };

  // スキル追加
  const handleAddSkill = async () => {
    if (!selectedSkillId || !selectedLevel) {
      alert("スキルとレベルを選択してください");
      return;
    }

    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      if (!token || token === "undefined") {
        alert("ログインが必要です");
        window.location.href = "/login";
        return;
      }

      const response = await fetch("http://localhost:3001/api/skills/me", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          skillId: parseInt(selectedSkillId),
          level: parseInt(selectedLevel),
          yearsOfExperience: parseFloat(selectedYears) || 0,
          description: selectedDescription,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert(data.message);
        await fetchMySkills();
        // フォームリセット
        setSelectedSkillId("");
        setSelectedLevel("");
        setSelectedYears("");
        setSelectedDescription("");
        setSearchValue("");
        setIsAddDialogOpen(false);
      } else {
        if (response.status === 401) {
          alert("ログインの有効期限が切れました。再度ログインしてください。");
          localStorage.removeItem("token");
          window.location.href = "/login";
        } else {
          alert(data.error || "スキル追加に失敗しました");
        }
      }
    } catch (error) {
      console.error("スキル追加エラー:", error);
      alert("スキル追加に失敗しました");
    } finally {
      setSaving(false);
    }
  };

  // スキル編集開始
  const startEdit = (userSkill: UserSkill) => {
    setEditingSkillId(userSkill.skillId);
    setEditForm({
      level: userSkill.level.toString(),
      yearsOfExperience: userSkill.yearsOfExperience.toString(),
      description: userSkill.description,
    });
  };

  // スキル編集保存
  const saveEdit = async () => {
    if (!editingSkillId) return;

    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:3001/api/skills/me", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          skillId: editingSkillId,
          level: parseInt(editForm.level),
          yearsOfExperience: parseFloat(editForm.yearsOfExperience) || 0,
          description: editForm.description,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert(data.message);
        await fetchMySkills();
        setEditingSkillId(null);
      } else {
        alert(data.error || "スキル更新に失敗しました");
      }
    } catch (error) {
      console.error("スキル更新エラー:", error);
      alert("スキル更新に失敗しました");
    } finally {
      setSaving(false);
    }
  };

  // スキル削除
  const handleDeleteSkill = async (skillId: number) => {
    if (!confirm("このスキルを削除しますか？")) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:3001/api/skills/me/${skillId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (response.ok) {
        alert(data.message);
        await fetchMySkills();
      } else {
        alert(data.error || "スキル削除に失敗しました");
      }
    } catch (error) {
      console.error("スキル削除エラー:", error);
      alert("スキル削除に失敗しました");
    }
  };

  // レベル表示用関数
  const renderStars = (level: number) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= level
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300"
            }`}
          />
        ))}
        <span className="ml-2 text-sm text-gray-600">レベル {level}</span>
      </div>
    );
  };

  // 選択されたスキルの情報を取得
  const getSelectedSkillInfo = () => {
    if (!selectedSkillId) return null;
    return allSkills.find((skill) => skill.id === parseInt(selectedSkillId));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600">スキル情報を読み込んでいます...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* ヘッダー */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-gray-900">スキル管理</h1>
          <p className="text-gray-600">あなたのスキルを登録・管理しましょう</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button size="lg">
              <Plus className="h-4 w-4 mr-2" />
              スキルを追加
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>新しいスキルを追加</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {/* スキル選択 - 検索可能なコンボボックス */}
              <div>
                <Label htmlFor="skill" className="mb-3">
                  スキル（{filteredSkills.length}件が選択可能）
                </Label>
                <Popover open={open} onOpenChange={setOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={open}
                      className="w-full justify-between"
                    >
                      {selectedSkillId
                        ? getSelectedSkillInfo()?.name
                        : "スキルを選択してください..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0 max-h-[400px]">
                    <Command className="h-full">
                      <CommandInput
                        placeholder="スキルを検索..."
                        value={searchValue}
                        onValueChange={setSearchValue}
                      />
                      <CommandEmpty>
                        該当するスキルが見つかりません。
                      </CommandEmpty>
                      <div
                        className="max-h-[300px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
                        style={{
                          overflowY: "auto",
                          height: "auto",
                          maxHeight: "300px",
                        }}
                        onWheel={(e) => {
                          e.stopPropagation();
                        }}
                      >
                        {Object.entries(skillsByCategory).map(
                          ([category, skills]) => {
                            const availableSkillsInCategory = skills.filter(
                              (skill) =>
                                !userSkills.some(
                                  (us) => us.skillId === skill.id
                                ) &&
                                (searchValue === "" ||
                                  skill.name
                                    .toLowerCase()
                                    .includes(searchValue.toLowerCase()) ||
                                  skill.category
                                    .toLowerCase()
                                    .includes(searchValue.toLowerCase()))
                            );

                            if (availableSkillsInCategory.length === 0)
                              return null;

                            return (
                              <CommandGroup key={category} heading={category}>
                                {availableSkillsInCategory.map((skill) => (
                                  <CommandItem
                                    key={skill.id}
                                    value={skill.name}
                                    onSelect={() => {
                                      setSelectedSkillId(skill.id.toString());
                                      setOpen(false);
                                      setSearchValue("");
                                    }}
                                  >
                                    <Check
                                      className={cn(
                                        "mr-2 h-4 w-4",
                                        selectedSkillId === skill.id.toString()
                                          ? "opacity-100"
                                          : "opacity-0"
                                      )}
                                    />
                                    <div className="flex flex-col">
                                      <span>{skill.name}</span>
                                      <span className="text-xs text-gray-500">
                                        {skill.category}
                                      </span>
                                    </div>
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            );
                          }
                        )}
                      </div>
                    </Command>
                  </PopoverContent>
                </Popover>
                {selectedSkillId && getSelectedSkillInfo() && (
                  <div className="mt-2">
                    <Badge variant="outline">
                      {getSelectedSkillInfo()?.category}
                    </Badge>
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="level" className="mb-3">
                  レベル
                </Label>
                <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                  <SelectTrigger>
                    <SelectValue placeholder="レベルを選択" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">
                      ⭐ レベル 1 - 初心者（基礎知識がある）
                    </SelectItem>
                    <SelectItem value="2">
                      ⭐⭐ レベル 2 - 初級者（簡単な作業ができる）
                    </SelectItem>
                    <SelectItem value="3">
                      ⭐⭐⭐ レベル 3 - 中級者（実務で使える）
                    </SelectItem>
                    <SelectItem value="4">
                      ⭐⭐⭐⭐ レベル 4 - 上級者（他者に教えられる）
                    </SelectItem>
                    <SelectItem value="5">
                      ⭐⭐⭐⭐⭐ レベル 5 - エキスパート（業界レベル）
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="years" className="mb-3">
                  経験年数
                </Label>
                <Input
                  id="years"
                  type="number"
                  step="0.5"
                  min="0"
                  max="20"
                  placeholder="0.5"
                  value={selectedYears}
                  onChange={(e) => setSelectedYears(e.target.value)}
                />
                <p className="text-xs text-gray-500 mt-1">
                  0.5刻みで入力してください（例：1.5年）
                </p>
              </div>

              <div>
                <Label htmlFor="description" className="mb-3">
                  説明・詳細
                </Label>
                <Textarea
                  id="description"
                  placeholder="このスキルについての経験や実績を記載してください（例：業務で3年使用、個人プロジェクトで使用等）"
                  value={selectedDescription}
                  onChange={(e) => setSelectedDescription(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="flex space-x-2 pt-4">
                <Button
                  onClick={() => {
                    setIsAddDialogOpen(false);
                    setSelectedSkillId("");
                    setSelectedLevel("");
                    setSelectedYears("");
                    setSelectedDescription("");
                    setSearchValue("");
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  キャンセル
                </Button>
                <Button
                  onClick={handleAddSkill}
                  disabled={saving || !selectedSkillId || !selectedLevel}
                  className="flex-1"
                >
                  {saving ? "追加中..." : "追加"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* 統計情報 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{userSkills.length}</div>
            <p className="text-xs text-muted-foreground">登録スキル数</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {new Set(userSkills.map((us) => us.skillCategory)).size}
            </div>
            <p className="text-xs text-muted-foreground">カテゴリ数</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {userSkills.filter((us) => us.level >= 4).length}
            </div>
            <p className="text-xs text-muted-foreground">上級スキル数</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {userSkills
                .reduce((sum, us) => sum + us.yearsOfExperience, 0)
                .toFixed(1)}
            </div>
            <p className="text-xs text-muted-foreground">総経験年数</p>
          </CardContent>
        </Card>
      </div>

      {/* スキル一覧 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {userSkills.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">🚀</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              まだスキルが登録されていません
            </h3>
            <p className="text-gray-600">
              最初のスキルを追加して、あなたの技術スタックを紹介しましょう！
            </p>
          </div>
        ) : (
          userSkills.map((userSkill) => (
            <Card
              key={userSkill.skillId}
              className="hover:shadow-md transition-shadow"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">
                      {userSkill.skillName}
                    </CardTitle>
                    <Badge variant="outline" className="mt-1">
                      {userSkill.skillCategory}
                    </Badge>
                  </div>
                  <div className="flex space-x-2">
                    {editingSkillId === userSkill.skillId ? (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingSkillId(null)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                        <Button size="sm" onClick={saveEdit} disabled={saving}>
                          <Save className="h-4 w-4" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => startEdit(userSkill)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteSkill(userSkill.skillId)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* レベル */}
                <div>
                  <Label className="text-sm font-medium text-gray-700">
                    レベル
                  </Label>
                  {editingSkillId === userSkill.skillId ? (
                    <Select
                      value={editForm.level}
                      onValueChange={(value) =>
                        setEditForm({ ...editForm, level: value })
                      }
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">⭐ レベル 1 - 初心者</SelectItem>
                        <SelectItem value="2">
                          ⭐⭐ レベル 2 - 初級者
                        </SelectItem>
                        <SelectItem value="3">
                          ⭐⭐⭐ レベル 3 - 中級者
                        </SelectItem>
                        <SelectItem value="4">
                          ⭐⭐⭐⭐ レベル 4 - 上級者
                        </SelectItem>
                        <SelectItem value="5">
                          ⭐⭐⭐⭐⭐ レベル 5 - エキスパート
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="mt-1">{renderStars(userSkill.level)}</div>
                  )}
                </div>

                {/* 経験年数 */}
                <div>
                  <Label className="text-sm font-medium text-gray-700">
                    経験年数
                  </Label>
                  {editingSkillId === userSkill.skillId ? (
                    <Input
                      type="number"
                      step="0.5"
                      min="0"
                      max="20"
                      value={editForm.yearsOfExperience}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          yearsOfExperience: e.target.value,
                        })
                      }
                      className="mt-1"
                    />
                  ) : (
                    <p className="mt-1 text-gray-900">
                      {userSkill.yearsOfExperience}年
                    </p>
                  )}
                </div>

                {/* 説明 */}
                <div>
                  <Label className="text-sm font-medium text-gray-700">
                    説明
                  </Label>
                  {editingSkillId === userSkill.skillId ? (
                    <Textarea
                      value={editForm.description}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          description: e.target.value,
                        })
                      }
                      className="mt-1"
                      rows={3}
                    />
                  ) : (
                    <p className="mt-1 text-gray-900 text-sm">
                      {userSkill.description || "説明がありません"}
                    </p>
                  )}
                </div>

                {/* 更新日時 */}
                <div className="text-xs text-gray-500">
                  最終更新: {new Date(userSkill.updatedAt).toLocaleDateString()}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
