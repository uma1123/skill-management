// components/dashboard/Header.tsx
"use client";

interface User {
  id: number;
  name: string;
  studentId: string;
  faculty: string;
  department: string;
  grade: number;
}

interface HeaderProps {
  user: User;
}

export default function Header({ user }: HeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold text-gray-900">
            サークルスキル管理
          </h1>
        </div>
        <div className="flex items-center space-x-3">
          <span className="text-sm text-gray-600">{user.name}さん</span>
          <div className="w-8 h-8 bg-slate-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
            {user.name.charAt(0)}
          </div>
        </div>
      </div>
    </header>
  );
}
