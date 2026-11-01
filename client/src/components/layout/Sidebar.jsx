import React from 'react';
import { NavLink, Link, useParams } from 'react-router-dom';
import {
  Home,
  BookOpen,
  Map,
  Repeat,
  BookA,
  Target,
  BarChart2,
  Settings,
} from 'lucide-react';

export default function Sidebar() {
  const { day } = useParams();
  const currentDay = day || 1;

  const navItems = [
    { to: '/', label: 'Trang chủ', icon: Home, end: true },
    { to: `/learn/${currentDay}`, label: 'Bài học', icon: BookOpen, activeMatch: '/learn' },
    { to: '/roadmap', label: 'Lộ trình', icon: Map },
    { to: '/flashcards', label: 'Ôn tập', icon: Repeat },
    { to: `/learn/${currentDay}?tab=vocab`, label: 'Từ vựng', icon: BookA },
    { to: `/quiz/${currentDay}`, label: 'Kiểm tra', icon: Target, activeMatch: '/quiz' },
    { to: '/progress', label: 'Tiến độ', icon: BarChart2 },
  ];

  return (
    <aside className="w-64 bg-white border-r border-sakura-border min-h-[calc(100vh-5rem)] p-4 flex flex-col justify-between hidden lg:flex">
      <div>
        {/* Sidebar Brand */}
        <div className="flex items-center gap-2.5 px-3 py-3 mb-6">
          <div className="w-8 h-8 rounded-xl bg-primary-100 flex items-center justify-center p-1.5">
            <img src="/assets/torii-icon.svg" alt="Torii" className="w-full h-full object-contain" />
          </div>
          <span className="text-lg font-bold text-navy-dark tracking-tight">Nihongo N5</span>
        </div>

        {/* Navigation Links matching screenshot */}
        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) => {
                  const isCurrentActive =
                    isActive || (item.activeMatch && window.location.pathname.startsWith(item.activeMatch));
                  return `flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-semibold transition-all duration-150 ${
                    isCurrentActive
                      ? 'bg-primary-100/90 text-primary-600 shadow-xs font-bold'
                      : 'text-navy-muted hover:bg-pink-50/70 hover:text-primary-600'
                  }`;
                }}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Settings at bottom */}
      <div className="pt-4 border-t border-pink-100">
        <Link
          to="/progress"
          className="flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-semibold text-navy-muted hover:bg-pink-50 hover:text-primary-600 transition-colors"
        >
          <Settings className="w-5 h-5" />
          <span>Cài đặt</span>
        </Link>
      </div>
    </aside>
  );
}
