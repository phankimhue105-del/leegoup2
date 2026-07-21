/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Sparkles, Trophy, Award, Phone, RefreshCw, LogOut } from "lucide-react";

interface HeaderProps {
  stars: number;
  completedCount: number;
  totalUnits: number;
  onReset: () => void;
  onOpenDashboard: () => void;
  onOpenApiKeySettings: () => void;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  stars,
  completedCount,
  totalUnits,
  onReset,
  onOpenDashboard,
  onOpenApiKeySettings,
  onLogout
}) => {
  // Determine kid's level badge based on stars
  const getLevelBadge = (starCount: number) => {
    if (starCount >= 80) return { name: "UP Champion 🏆", color: "bg-red-500 text-white" };
    if (starCount >= 50) return { name: "UP Hero 🌟", color: "bg-amber-500 text-white" };
    if (starCount >= 25) return { name: "UP Explorer 🚀", color: "bg-emerald-500 text-white" };
    return { name: "UP Beginner 🌱", color: "bg-sky-500 text-white" };
  };

  const badge = getLevelBadge(stars);

  return (
    <header className="bg-white border-b-2 border-slate-100 sticky top-0 z-50 shadow-sm" id="leego-app-header">
      <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        
        {/* Brand Logo & Slogan */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-orange-500 flex items-center justify-center text-white text-2xl font-bold shadow-md shadow-orange-200">
            LG
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight text-orange-600 flex items-center gap-1.5">
              ANH NGỮ LEEGO
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 animate-pulse">
                Smart Mentor
              </span>
            </h1>
            <p className="text-xs text-slate-500 flex items-center gap-1">
              <Phone size={11} className="text-orange-500" />
              Hotline: <span className="font-bold text-slate-700">0988.526.585</span>
            </p>
          </div>
        </div>

        {/* Dynamic Achievements & Stats */}
        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 sm:gap-6">
          {/* Level Badge */}
          <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black shadow-sm ${badge.color}`}>
            <Award size={14} />
            <span>{badge.name}</span>
          </div>

          {/* Stars Tracker */}
          <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200 rounded-full text-amber-700 font-bold text-sm shadow-sm">
            <Sparkles size={16} className="text-amber-500 fill-amber-400" />
            <span>{stars} Stars</span>
          </div>

          {/* Progress Tracker */}
          <div className="flex items-center gap-1.5 px-3 py-1 bg-indigo-50 border border-indigo-100 rounded-full text-indigo-700 font-bold text-sm shadow-sm">
            <Trophy size={16} className="text-indigo-500" />
            <span>{completedCount}/{totalUnits} Units</span>
          </div>

          {/* Study Report Card Button */}
          <button
            onClick={onOpenDashboard}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-rose-500 hover:bg-rose-600 text-white font-black text-xs rounded-full shadow-md shadow-rose-200 hover:scale-105 active:scale-95 transition-all cursor-pointer"
          >
            <span>Báo cáo học tập 📊</span>
          </button>

          {/* API Key Settings Button with red link below */}
          <div className="flex flex-col items-center gap-0.5 select-none">
            <button
              onClick={onOpenApiKeySettings}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-700 hover:bg-slate-800 text-white font-black text-[10px] rounded-full shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              <span>⚙️ Cài đặt AI Key</span>
            </button>
            <a 
              href="https://aistudio.google.com/api-keys" 
              target="_blank" 
              rel="noreferrer"
              className="text-[9px] text-red-500 font-black hover:underline block leading-none cursor-pointer"
            >
              Lấy API key để sử dụng app
            </a>
          </div>

          {/* Reset Button */}
          <button
            onClick={() => {
              if (window.confirm("Con muốn làm mới lại tất cả điểm sao và tiến trình học tập không?")) {
                onReset();
              }
            }}
            className="p-1.5 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
            title="Reset Progress"
          >
            <RefreshCw size={15} />
          </button>

          {/* Logout Button */}
          {onLogout && (
            <button
              onClick={() => {
                if (window.confirm("Con có chắc chắn muốn đăng xuất không?")) {
                  onLogout();
                }
              }}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white font-black text-xs rounded-full shadow-md shadow-red-200 hover:scale-105 active:scale-95 transition-all cursor-pointer"
              title="Đăng xuất"
            >
              <LogOut size={14} />
              <span>Đăng xuất</span>
            </button>
          )}
        </div>

      </div>
    </header>
  );
};
