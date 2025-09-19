import { cn } from "@/lib/utils";
import { BarChart3, LogOut, Settings, User, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface User {
  id: number;
  name: string;
  studentId: string;
  faculty: string;
  department: string;
  grade: number;
}

interface SidebarProps {
  user: User;
  onLogout: () => void;
}

const menuItems = [
  {
    id: "members",
    label: "メンバーリスト",
    icon: Users,
    href: "/dashboard",
  },
  {
    id: "skills",
    label: "スキル登録",
    icon: Settings,
    href: "/dashboard/skills",
  },
  {
    id: "analysis",
    label: "分析・レポート",
    icon: BarChart3,
    href: "/dashboard/analysis",
  },
  {
    id: "profile",
    label: "プロフィール編集",
    icon: User,
    href: "/dashboard/profile",
  },
];

export default function Sidebar({ user, onLogout }: SidebarProps) {
  const pathname = usePathname();

  // 正しいメニューアイテムを取得
  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === "/dashboard";
    }
    return pathname.startsWith(href);
  };

  return (
    <div className="w-64 bg-slate-800 text-white flex flex-col">
      {/*ヘッダー*/}
      <div className="p-6 border-b border-slate-700">
        <div className="flex items-center space-x-3">
          <h1 className="text-lg font-semibold text-cyan-400">スキル管理</h1>
        </div>
      </div>

      {/*ユーザー情報*/}
      <div className="p-6 border-b border-slate-700">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-slate-600 rounded-full flex items-center justify-center text-white font-semibold">
            {user.name.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">
              {user.name}
            </p>
            <p className="text-xs text-slate-400 truncate">{user.studentId}</p>
          </div>
        </div>
      </div>

      {/*ナビゲーション*/}

      <nav className="flex-1 px-4 py-6">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.id}>
              <Link
                href={item.href}
                className={cn(
                  "flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium trasition-colors",
                  isActive(item.href)
                    ? "bg-blue-600 text-white"
                    : "text-slate-300 hover:bg-slate-700 hover:text-white"
                )}
              >
                <item.icon className="w-4 h-4" />
                <span>{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/*ログアウトボタン*/}
      <div className="p-4 border-t border-slate-700">
        <button
          onClick={onLogout}
          className="flex items-center space-x-3 w-full px-3 py-2 text-sm font-medium text-slate-300 rounded-lg hover:bg-slate-700 hover:text-white transition-colors"
        >
          <LogOut className="h-5 w-5" />
          <span>ログアウト</span>
        </button>
      </div>
    </div>
  );
}
