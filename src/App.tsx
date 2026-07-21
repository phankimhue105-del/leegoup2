/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from "react";
import { SYLLABUS_DATA, UserProgress } from "./types";
import { Header } from "./components/Header";
import { UnitSelector } from "./components/UnitSelector";
import { VocabularyTab } from "./components/VocabularyTab";
import { GrammarTab } from "./components/GrammarTab";
import { SpeakingTab } from "./components/SpeakingTab";
import { StudyDashboard } from "./components/StudyDashboard";
import { ApiKeyModal } from "./components/ApiKeyModal";
import { LoginPage } from "./components/LoginPage";
import { fetchStudentProgress, updateStudentProgress } from "./services/progressService";
import { BookOpen, Award, MessageCircle, Star, Sparkles, AlertCircle } from "lucide-react";

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  // Baseline refs for tracking online synced progress to prevent overwriting with older local data
  const syncedStarsRef = useRef<number | null>(null);
  const syncedUnitCountRef = useRef<number | null>(null);
  const isBaselineLoadedRef = useRef<boolean>(false);

  // Load progress from localStorage on initialization
  const [progress, setProgress] = useState<UserProgress>(() => {
    try {
      const saved = localStorage.getItem("leego_progress");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (!parsed.unitAssessments) parsed.unitAssessments = {};
        return parsed;
      }
    } catch (e) {
      console.error("Failed to parse progress from localStorage", e);
    }
    return {
      stars: 10, // Start with 10 free motivation stars!
      completedUnits: [],
      quizScores: {},
      unitAssessments: {}
    };
  });

  // Active Unit & Tab states
  const [activeUnitId, setActiveUnitId] = useState<string>("classroom_verbs");
  const [activeTab, setActiveTab] = useState<"vocabulary" | "grammar" | "speaking">("vocabulary");
  const [isDashboardOpen, setIsDashboardOpen] = useState<boolean>(false);
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState<boolean>(false);
  const [isApiKeyMandatory, setIsApiKeyMandatory] = useState<boolean>(false);

  // Check if API key is missing on mount
  useEffect(() => {
    const key = localStorage.getItem("leego_gemini_api_key");
    if (!key) {
      setIsApiKeyMandatory(true);
      setIsApiKeyModalOpen(true);
    }
  }, []);

  // Fetch student progress from Google Apps Script after successful login
  useEffect(() => {
    if (isLoggedIn) {
      const username = localStorage.getItem("username") || "";
      if (username) {
        fetchStudentProgress(username).then((data) => {
          if (data) {
            const unitCountMatch = data.completedUnit ? data.completedUnit.match(/\d+/) : null;
            const unitCount = unitCountMatch ? parseInt(unitCountMatch[0], 10) : 0;

            // Establish initial synced baseline from Google Apps Script
            syncedStarsRef.current = data.goldStars;
            syncedUnitCountRef.current = unitCount;
            isBaselineLoadedRef.current = true;

            setProgress((prev) => {
              const completedUnitsArr: string[] = [];
              for (let i = 1; i <= unitCount; i++) {
                completedUnitsArr.push(`unit${i}`);
              }

              const mergedCompletedUnits = Array.from(
                new Set([...prev.completedUnits, ...completedUnitsArr])
              );

              return {
                ...prev,
                stars: Math.max(prev.stars, data.goldStars),
                completedUnits: mergedCompletedUnits,
              };
            });
          }
        });
      }
    }
  }, [isLoggedIn]);

  // Save progress to localStorage and sync to Google Sheet when progress increases in current session
  useEffect(() => {
    localStorage.setItem("leego_progress", JSON.stringify(progress));

    if (
      isLoggedIn &&
      isBaselineLoadedRef.current &&
      syncedStarsRef.current !== null &&
      syncedUnitCountRef.current !== null
    ) {
      const currentStars = progress.stars;
      const currentUnitCount = progress.completedUnits.length;

      // Anti-overwrite check: ONLY update if user has made ACTUAL progress in this session
      if (currentStars > syncedStarsRef.current || currentUnitCount > syncedUnitCountRef.current) {
        syncedStarsRef.current = currentStars;
        syncedUnitCountRef.current = currentUnitCount;

        const username = localStorage.getItem("username") || "";
        const studentName = localStorage.getItem("studentName") || username;
        const currentLevel = `Level ${Math.max(1, Math.floor(currentStars / 25) + 1)}`;
        const currentCompletedUnit = `Unit ${currentUnitCount}`;

        // Fire background update to Google Apps Script (tiendo sheet)
        updateStudentProgress(username, studentName, currentStars, currentLevel, currentCompletedUnit);
      }
    }
  }, [progress, isLoggedIn]);

  // Find active unit object
  const activeUnit = SYLLABUS_DATA.find(u => u.id === activeUnitId) || SYLLABUS_DATA[0];

  // Progress helpers
  const handleAwardStars = (count: number) => {
    setProgress((prev) => {
      const updatedStars = prev.stars + count;
      return {
        ...prev,
        stars: updatedStars
      };
    });
  };

  // Section completion and scoring helper
  const handleSaveSectionAssessment = (
    unitId: string,
    section: "vocabulary" | "grammar" | "speaking",
    score: number
  ) => {
    setProgress((prev) => {
      const assessments = prev.unitAssessments || {};
      const currentUnitAssessment = assessments[unitId] || {};
      
      const isAlreadyCompleted = currentUnitAssessment[section]?.completed;
      const updatedSection = { score, completed: true };
      
      const updatedUnitAssessment = {
        ...currentUnitAssessment,
        [section]: updatedSection
      };

      // Calculate unit stars (1 to 5 stars) based on completed sections
      const vocabScore = updatedUnitAssessment.vocabulary?.score || 0;
      const grammarScore = updatedUnitAssessment.grammar?.score || 0;
      const speakingScore = updatedUnitAssessment.speaking?.score || 0;
      
      const vocabCompleted = updatedUnitAssessment.vocabulary?.completed ? 1 : 0;
      const grammarCompleted = updatedUnitAssessment.grammar?.completed ? 1 : 0;
      const speakingCompleted = updatedUnitAssessment.speaking?.completed ? 1 : 0;
      
      const totalCompleted = vocabCompleted + grammarCompleted + speakingCompleted;
      
      let starsRating = 0;
      if (totalCompleted > 0) {
        const avgScore = (vocabScore * vocabCompleted + grammarScore * grammarCompleted + speakingScore * speakingCompleted) / totalCompleted;
        if (avgScore >= 90) starsRating = 5;
        else if (avgScore >= 75) starsRating = 4;
        else if (avgScore >= 60) starsRating = 3;
        else if (avgScore >= 40) starsRating = 2;
        else starsRating = 1;
      }
      
      updatedUnitAssessment.starsRating = starsRating;
      
      const updatedAssessments = {
        ...assessments,
        [unitId]: updatedUnitAssessment
      };

      // Award +5 stars for completing a new section
      const starReward = isAlreadyCompleted ? 0 : 5;

      // Mark unit as completed if all 3 sections are done
      const isUnitCompleted = 
        updatedUnitAssessment.vocabulary?.completed &&
        updatedUnitAssessment.grammar?.completed &&
        updatedUnitAssessment.speaking?.completed;
      
      const updatedCompleted = isUnitCompleted && !prev.completedUnits.includes(unitId)
        ? [...prev.completedUnits, unitId]
        : prev.completedUnits;

      return {
        ...prev,
        stars: prev.stars + starReward,
        completedUnits: updatedCompleted,
        unitAssessments: updatedAssessments
      };
    });
  };

  const handleSelectUnit = (unitId: string) => {
    setActiveUnitId(unitId);
    // Switch back to vocabulary default view on unit change
    setActiveTab("vocabulary");
  };

  const handleSelectUnitAndTab = (unitId: string, tab: "vocabulary" | "grammar" | "speaking") => {
    setActiveUnitId(unitId);
    setActiveTab(tab);
  };

  const handleResetProgress = () => {
    setProgress({
      stars: 10,
      completedUnits: [],
      quizScores: {},
      unitAssessments: {}
    });
    setActiveUnitId("classroom_verbs");
    setActiveTab("vocabulary");
  };

  if (!isLoggedIn) {
    return <LoginPage onLoginSuccess={() => setIsLoggedIn(true)} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans" id="leego-app-root">
      
      {/* 1. Header with branding & student stats */}
      <Header
        stars={progress.stars}
        completedCount={progress.completedUnits.length}
        totalUnits={SYLLABUS_DATA.length}
        onReset={handleResetProgress}
        onOpenDashboard={() => setIsDashboardOpen(true)}
        onOpenApiKeySettings={() => {
          setIsApiKeyMandatory(false);
          setIsApiKeyModalOpen(true);
        }}
      />

      {/* 2. Main content panel */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6 sm:px-6 lg:px-8">
        
        {/* Welcome motivational banner */}
        <div className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-3xl p-4 sm:p-6 text-white mb-6 shadow-md shadow-orange-100 flex flex-col md:flex-row items-center justify-between gap-4 relative overflow-hidden select-none">
          {/* Sparkly decorative circles */}
          <div className="absolute -right-10 -bottom-10 w-40 h-40 rounded-full bg-white/10" />
          <div className="absolute left-1/3 -top-10 w-24 h-24 rounded-full bg-white/5" />

          <div className="flex items-center gap-4 relative z-10">
            <span className="text-5xl animate-bounce">👋</span>
            <div>
              <h2 className="text-xl md:text-2xl font-black tracking-tight leading-tight">
                Chào mừng con đến với Lớp Học Thông Minh LeeGo!
              </h2>
              <p className="text-xs md:text-sm text-orange-50 font-bold mt-1">
                Hôm nay chúng mình cùng học giáo trình <span className="font-black underline">Everybody Up 2</span> thật vui nhé!
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 relative z-10">
            <button
              onClick={() => setIsDashboardOpen(true)}
              className="bg-white hover:bg-orange-50 text-orange-600 font-black text-xs px-4 py-2.5 rounded-2xl shadow-md transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer"
            >
              <span>Xem Báo Cáo Học Tập 📊</span>
            </button>
            <div className="bg-white/15 backdrop-blur-sm border border-white/20 rounded-2xl px-4 py-2 flex items-center gap-2">
              <Sparkles size={16} className="text-amber-300 fill-amber-300 animate-pulse" />
              <span className="text-xs md:text-sm font-black">
                Học vui vẻ • Giao tiếp tự tin 🚀
              </span>
            </div>
          </div>
        </div>

        {/* Primary application grid */}
        <div className="grid md:grid-cols-4 gap-6 items-start w-full min-w-0 overflow-hidden">
          
          {/* LEFT PANEL: Unit Selector */}
          <div className="md:col-span-1 w-full min-w-0 overflow-hidden">
            <UnitSelector
              units={SYLLABUS_DATA}
              activeUnitId={activeUnitId}
              completedUnits={progress.completedUnits}
              onSelectUnit={handleSelectUnit}
            />

            {/* Helpline contact badge on sidebar */}
            <div className="mt-4 bg-white rounded-2xl p-4 border border-slate-100 text-center text-xs text-slate-400 font-semibold space-y-1">
              <p>📍 Anh ngữ LeeGo - Hải Phòng</p>
              <p className="text-slate-500 font-bold">Hotline: 0988.526.585</p>
            </div>
          </div>

          {/* RIGHT PANEL: Active Practice Tabs */}
          <div className="md:col-span-3 w-full min-w-0 overflow-hidden space-y-6">
            
            {/* Active unit introduction card */}
            <div className="bg-white rounded-3xl p-4 sm:p-6 border-2 border-slate-100 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <span className="text-[10px] uppercase font-black tracking-widest text-orange-500">
                  Đang học bài:
                </span>
                <h2 className="text-2xl font-black text-slate-800 tracking-tight mt-0.5">
                  {activeUnit.title}
                </h2>
                <p className="text-sm font-bold text-slate-400 mt-0.5">
                  Chủ đề: {activeUnit.subtitle}
                </p>
              </div>

              {/* Status Indicator */}
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 border border-orange-100 text-orange-700 font-extrabold text-xs rounded-full shadow-sm w-fit">
                <Star size={14} className="fill-orange-400 text-orange-400" />
                <span>Hoàn thành bài tập để đạt sao vàng!</span>
              </div>
            </div>

            {/* Custom Tab Selector */}
            <div className="grid grid-cols-3 gap-1 sm:gap-2 bg-slate-100 p-1.5 rounded-3xl" id="leego-tab-nav">
              
              {/* Tab 1: Vocabulary */}
              <button
                onClick={() => setActiveTab("vocabulary")}
                className={`py-3 sm:py-3.5 px-2 sm:px-4 rounded-2xl text-[10px] sm:text-xs font-black flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 transition-all select-none cursor-pointer
                  ${activeTab === "vocabulary"
                    ? "bg-white text-orange-600 shadow-md shadow-orange-100 border-b-2 border-orange-500"
                    : "text-slate-500 hover:text-slate-800"
                  }`}
              >
                <BookOpen size={16} className="w-4 h-4 sm:w-[16px] sm:h-[16px]" />
                <span className="hidden sm:inline">1. Ôn Tập Từ Vựng</span>
                <span className="sm:hidden">Từ vựng</span>
              </button>

              {/* Tab 2: Grammar Sentence builder */}
              <button
                onClick={() => setActiveTab("grammar")}
                className={`py-3 sm:py-3.5 px-2 sm:px-4 rounded-2xl text-[10px] sm:text-xs font-black flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 transition-all select-none cursor-pointer
                  ${activeTab === "grammar"
                    ? "bg-white text-indigo-600 shadow-md shadow-indigo-100 border-b-2 border-indigo-500"
                    : "text-slate-500 hover:text-slate-800"
                  }`}
              >
                <Award size={16} className="w-4 h-4 sm:w-[16px] sm:h-[16px]" />
                <span className="hidden sm:inline">2. Ghép Câu Ngữ Pháp</span>
                <span className="sm:hidden">Ngữ pháp</span>
              </button>

              {/* Tab 3: AI Speaking Coach */}
              <button
                onClick={() => setActiveTab("speaking")}
                className={`py-3 sm:py-3.5 px-2 sm:px-4 rounded-2xl text-[10px] sm:text-xs font-black flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 transition-all select-none cursor-pointer
                  ${activeTab === "speaking"
                    ? "bg-white text-rose-600 shadow-md shadow-rose-100 border-b-2 border-rose-500"
                    : "text-slate-500 hover:text-slate-800"
                  }`}
              >
                <MessageCircle size={16} className="w-4 h-4 sm:w-[16px] sm:h-[16px]" />
                <span className="hidden sm:inline">3. AI Luyện Nói</span>
                <span className="sm:hidden">Luyện nói</span>
              </button>

            </div>

            {/* TAB PANELS RENDERING */}
            <div className="bg-white rounded-3xl p-1 shadow-sm border border-slate-50 animate-fade-in min-h-[400px]">
              {activeTab === "vocabulary" && (
                <VocabularyTab
                  vocabulary={activeUnit.vocabulary}
                  unitId={activeUnit.id}
                  onAwardStars={handleAwardStars}
                  onSaveAssessment={(score) => handleSaveSectionAssessment(activeUnit.id, "vocabulary", score)}
                />
              )}

              {activeTab === "grammar" && (
                <GrammarTab
                  unit={activeUnit}
                  onAwardStars={handleAwardStars}
                  onSaveAssessment={(score) => handleSaveSectionAssessment(activeUnit.id, "grammar", score)}
                />
              )}

              {activeTab === "speaking" && (
                <SpeakingTab
                  unit={activeUnit}
                  onAwardStars={handleAwardStars}
                  onSaveAssessment={(score) => handleSaveSectionAssessment(activeUnit.id, "speaking", score)}
                />
              )}
            </div>

          </div>

        </div>

      </main>

      {/* 3. Global Footer */}
      <footer className="bg-white border-t border-slate-100 mt-12 py-6 text-center text-xs text-slate-400 font-semibold" id="leego-app-footer">
        <div className="max-w-7xl mx-auto px-4 space-y-2">
          <p className="text-slate-500">
            📘 Giáo trình học tập bám sát: <span className="font-bold text-slate-700">EVERYBODY UP 2 (Oxford University Press)</span>
          </p>
          <p>© 2026 Anh ngữ LeeGo. Hotline hỗ trợ kỹ thuật: 0988.526.585. Chúc các con học giỏi!</p>
        </div>
      </footer>

      {/* Study Report Dashboard Overlay */}
      <StudyDashboard
        isOpen={isDashboardOpen}
        onClose={() => setIsDashboardOpen(false)}
        units={SYLLABUS_DATA}
        progress={progress}
        onSelectUnitAndTab={handleSelectUnitAndTab}
      />

      {/* API Key Modal Overlay */}
      <ApiKeyModal
        isOpen={isApiKeyModalOpen}
        isMandatory={isApiKeyMandatory}
        onClose={() => setIsApiKeyModalOpen(false)}
      />

    </div>
  );
}
