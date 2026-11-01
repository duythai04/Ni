import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';

export default function AppLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-sakura-bg text-navy-dark">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Sakura Footer */}
      <footer className="bg-white border-t border-sakura-border py-8 mt-16 text-center">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img src="/assets/torii-icon.svg" alt="Torii" className="w-5 h-5 object-contain" />
            <span className="text-sm font-bold text-navy-dark">Nihongo N5</span>
            <span className="text-xs text-navy-light">— Học tiếng Nhật cho người mới bắt đầu</span>
          </div>
          <p className="text-xs text-navy-light">
            Thiết kế theo phong cách Japanese Sakura Dashboard • Dữ liệu chuẩn JLPT N5
          </p>
        </div>
      </footer>
    </div>
  );
}
