import React, { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { Flame, User, LogOut, BookOpen, Layers, CheckCircle2, Menu, X } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../../api/client';

export default function Header() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const [showDropdown, setShowDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  // Fetch dashboard stats for live streak if logged in
  const { data: dashboardData } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: async () => {
      const res = await apiClient.get('/progress/dashboard');
      return res.data.data;
    },
    enabled: isAuthenticated,
  });

  const streak = dashboardData?.studyStreak ?? 5; // Default 5 matching screenshot demo

  const handleLogout = async () => {
    await logout();
    setShowDropdown(false);
    navigate('/login');
  };

  const navLinks = [
    { to: '/', label: 'Trang chủ' },
    { to: '/roadmap', label: 'Lộ trình' },
    { to: '/learn/1', label: 'Bài học' },
    { to: '/flashcards', label: 'Ôn tập' },
    { to: '/progress', label: 'Tiến độ' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-sakura-border transition-all shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* Brand Logo matching screenshot */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-11 h-11 rounded-2xl bg-primary-100 flex items-center justify-center p-2 group-hover:scale-105 transition-transform">
            <img src="/assets/torii-icon.svg" alt="Torii" className="w-8 h-8 object-contain" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xl font-bold font-sans text-navy-dark tracking-tight">
                Nihongo <span className="text-primary-600">N5</span>
              </span>
            </div>
            <p className="text-xs text-navy-light font-medium -mt-0.5 hidden sm:block">
              Học tiếng Nhật cho người mới bắt đầu
            </p>
          </div>
        </Link>

        {/* Center Nav Pills matching screenshot */}
        <nav className="hidden md:flex items-center gap-1.5 bg-sakura-bg/80 p-1.5 rounded-full border border-pink-100 shadow-inner">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              className={({ isActive }) =>
                `px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-primary-500 text-white shadow-sm'
                    : 'text-navy-muted hover:text-primary-600 hover:bg-white/80'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        {/* Right Section: Streak Badge & User Profile */}
        <div className="flex items-center gap-3">
          {/* Streak Badge matching screenshot */}
          <div className="flex items-center gap-1.5 bg-orange-50 border border-orange-200/80 px-3.5 py-1.5 rounded-full shadow-xs">
            <span className="text-base animate-pulse">🔥</span>
            <span className="text-sm font-bold text-orange-600">
              {streak} ngày
            </span>
          </div>

          {/* User Profile or Login */}
          {isAuthenticated ? (
            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="w-10 h-10 rounded-full border-2 border-primary-200 p-0.5 overflow-hidden hover:ring-2 hover:ring-primary-400 transition-all focus:outline-none"
              >
                <img
                  src={user?.avatar_url || 'https://api.dicebear.com/7.x/bottts/svg?seed=Nihongo'}
                  alt={user?.full_name || 'User'}
                  className="w-full h-full rounded-full object-cover bg-primary-50"
                />
              </button>

              {/* Dropdown Menu */}
              {showDropdown && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-sakura-lg border border-pink-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-4 py-2.5 border-b border-pink-50">
                    <p className="text-sm font-bold text-navy-dark truncate">{user?.full_name}</p>
                    <p className="text-xs text-navy-light truncate">{user?.email}</p>
                  </div>
                  <Link
                    to="/progress"
                    onClick={() => setShowDropdown(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-sm text-navy-dark hover:bg-primary-50 hover:text-primary-600 transition-colors"
                  >
                    <CheckCircle2 className="w-4 h-4 text-primary-500" />
                    Tiến độ học tập
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Đăng xuất
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="px-4 py-2 rounded-full text-sm font-semibold text-primary-600 hover:bg-primary-50 transition-colors"
              >
                Đăng nhập
              </Link>
              <Link
                to="/register"
                className="hidden sm:inline-flex px-4 py-2 rounded-full text-sm font-semibold bg-primary-500 text-white hover:bg-primary-600 shadow-sm transition-all"
              >
                Bắt đầu ngay
              </Link>
            </div>
          )}

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-navy-muted hover:text-primary-600 rounded-lg"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-pink-100 bg-white px-4 pt-3 pb-6 space-y-2">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) =>
                `block px-4 py-2.5 rounded-xl text-base font-semibold transition-colors ${
                  isActive ? 'bg-primary-500 text-white' : 'text-navy-muted hover:bg-pink-50'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </div>
      )}
    </header>
  );
}
