/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Unit, UserProgress, SPEAKING_QUESTIONS_DATA } from "../types";
import { X, Star, Trophy, Award, BookOpen, MessageCircle, Play, CheckCircle2, Circle, Eye, Sparkles } from "lucide-react";

interface StudyDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  units: Unit[];
  progress: UserProgress;
  onSelectUnitAndTab: (unitId: string, tab: "vocabulary" | "grammar" | "speaking") => void;
  studentName?: string;
}

export const StudyDashboard: React.FC<StudyDashboardProps> = ({
  isOpen,
  onClose,
  units,
  progress,
  onSelectUnitAndTab,
  studentName = "Bạn nhỏ LeeGo"
}) => {
  if (!isOpen) return null;

  const assessments = progress.unitAssessments || {};

  // Calculate stats
  let totalVocabScore = 0;
  let vocabCount = 0;
  let totalGrammarScore = 0;
  let grammarCount = 0;
  let totalSpeakingScore = 0;
  let speakingCount = 0;
  let totalStars = progress.stars;

  Object.values(assessments).forEach((assess) => {
    if (assess.vocabulary?.completed) {
      totalVocabScore += assess.vocabulary.score;
      vocabCount++;
    }
    if (assess.grammar?.completed) {
      totalGrammarScore += assess.grammar.score;
      grammarCount++;
    }
    if (assess.speaking?.completed) {
      totalSpeakingScore += assess.speaking.score;
      speakingCount++;
    }
  });

  const avgVocab = vocabCount > 0 ? Math.round(totalVocabScore / vocabCount) : 0;
  const avgGrammar = grammarCount > 0 ? Math.round(totalGrammarScore / grammarCount) : 0;
  const avgSpeaking = speakingCount > 0 ? Math.round(totalSpeakingScore / speakingCount) : 0;

  // Determine Level Badge
  const getLevelBadge = (starCount: number) => {
    if (starCount >= 80) return { name: "UP Champion 🏆", color: "from-rose-500 to-red-600 text-white" };
    if (starCount >= 50) return { name: "UP Hero 🌟", color: "from-amber-400 to-orange-500 text-white" };
    if (starCount >= 25) return { name: "UP Explorer 🚀", color: "from-emerald-400 to-teal-500 text-white" };
    return { name: "UP Beginner 🌱", color: "from-sky-400 to-blue-500 text-white" };
  };

  const badge = getLevelBadge(totalStars);

  // Print Worksheet Helper
  const handlePrintWorksheet = (unit: Unit) => {
    const questions = SPEAKING_QUESTIONS_DATA[unit.id] || [];
    
    // Create print window content
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const vocabListHtml = unit.vocabulary
      .map(
        (v) => `
      <div style="display:flex; justify-content:space-between; padding:8px 0; border-bottom:1px solid #eee;">
        <span style="font-weight:bold; font-size:16px;">${v.emoji} ${v.word} (${v.phonetic})</span>
        <span style="color:#666;">...........................................</span>
        <span style="font-weight:500; font-size:14px; color:#333;">${v.meaning}</span>
      </div>`
      )
      .join("");

    const grammarListHtml = unit.grammarStructures.scrambledQuestions
      .map(
        (q, idx) => `
      <div style="margin-bottom:15px;">
        <p style="margin:0 0 5px 0; font-weight:bold; font-size:14px;">Câu ${idx + 1}: ${q.hintVi}</p>
        <p style="margin:0 0 8px 0; font-size:13px; color:#888; font-style:italic;">Các từ gợi ý: [ ${q.words.join("  /  ")} ]</p>
        <div style="border-bottom: 2px dashed #ccc; height:30px; width:100%;"></div>
      </div>`
      )
      .join("");

    const speakingListHtml = questions
      .slice(3) // skip name, age, feelings for academic sheet
      .map(
        (q, idx) => `
      <div style="margin-bottom:15px; display:flex; gap:10px; align-items:flex-start;">
        <span style="font-size:24px;">${q.emoji || "💬"}</span>
        <div style="flex-1;">
          <p style="margin:0 0 4px 0; font-weight:bold; font-size:14px;">Q${idx + 1}: ${q.question}</p>
          <p style="margin:0 0 8px 0; font-size:12px; color:#777; font-style:italic;">(${q.translation})</p>
          <p style="margin:0; font-size:13px; color:#999;">Trả lời của con: ............................................................................................</p>
        </div>
      </div>`
      )
      .join("");

    printWindow.document.write(`
      <html>
        <head>
          <title>Phiếu học tập: ${unit.title}</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #333; line-height: 1.6; }
            .header { text-align: center; border-bottom: 3px double #e65c00; padding-bottom: 20px; margin-bottom: 30px; }
            .logo { font-size: 28px; font-weight: 900; color: #e65c00; letter-spacing: 1px; }
            .title { font-size: 22px; font-weight: 800; margin: 10px 0 5px 0; }
            .student-info { display: flex; justify-content: space-between; margin: 20px 0; font-weight: bold; }
            .section { margin-bottom: 35px; }
            .section-title { font-size: 16px; font-weight: 900; background: #fff5eb; border-left: 5px solid #e65c00; padding: 6px 12px; margin-bottom: 15px; color: #e65c00; text-transform: uppercase; }
            @media print {
              .no-print { display: none; }
              body { padding: 20px; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">ANH NGỮ LEEGO - HẢI PHÒNG</div>
            <div class="title">PHIẾU BÀI TẬP VỀ NHÀ (HOMEWORK WORKSHEET)</div>
            <div style="font-weight:bold; color:#e65c00;">Giáo trình: Everybody Up 2 - ${unit.title}</div>
            <div class="student-info">
              <span>Họ và tên: ..........................................................................</span>
              <span>Lớp: .....................</span>
              <span>Ngày học: ...../...../2026</span>
            </div>
          </div>

          <div class="section">
            <div class="section-title">1. Vocabulary Practice (Luyện tập từ vựng)</div>
            <p style="font-size:13px; font-style:italic; margin-top:-5px; margin-bottom:15px; color:#666;">Con hãy tập đọc to các từ vựng này và viết lại nghĩa tiếng Việt vào chỗ chấm bên dưới nhé:</p>
            ${vocabListHtml}
          </div>

          <div class="section" style="page-break-before: always;">
            <div class="section-title">2. Grammar Structure (Ghép câu ngữ pháp)</div>
            <p style="font-size:13px; font-style:italic; margin-top:-5px; margin-bottom:15px; color:#666;">Hãy sắp xếp các từ xáo trộn thành câu hoàn chỉnh và viết xuống dòng kẻ nhé:</p>
            ${grammarListHtml}
          </div>

          <div class="section">
            <div class="section-title">3. Speaking & Reflection (AI Luyện nói phản xạ)</div>
            <p style="font-size:13px; font-style:italic; margin-top:-5px; margin-bottom:15px; color:#666;">Con hãy tự trả lời các câu hỏi luyện nói phản xạ của thầy cô LeeGo dưới đây nhé:</p>
            ${speakingListHtml}
          </div>

          <div style="margin-top: 50px; text-align:center; border-top:1px solid #ccc; padding-top:15px; font-size:12px; color:#999; font-weight:bold;">
            📍 ANH NGỮ LEEGO - HẢI PHÒNG | HOTLINE: 0988.526.585
          </div>
          <script>
            window.onload = function() {
              window.print();
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-md animate-fade-in">
      <div className="bg-white rounded-3xl w-full max-w-4xl shadow-2xl border border-slate-100 flex flex-col max-h-[90vh] overflow-hidden animate-scale-up">
        
        {/* Header Dashboard */}
        <div className="bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 px-4 py-4 sm:px-6 sm:py-5 text-white flex items-center justify-between shadow-md shrink-0 relative overflow-hidden select-none">
          <div className="absolute right-0 top-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10" />
          
          <div className="flex items-center gap-3 relative z-10">
            <div className="p-2 bg-white/20 backdrop-blur-sm rounded-2xl">
              <Trophy size={28} className="text-amber-300 animate-pulse fill-amber-300" />
            </div>
            <div>
              <h2 className="text-xl font-black tracking-tight leading-tight">
                BẢNG VÀNG THÀNH TÍCH LEEGO
              </h2>
              <p className="text-xs text-orange-50 font-bold mt-0.5">
                Báo cáo kết quả và sao vàng học tập theo từng Unit
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 hover:bg-white/25 rounded-2xl transition-colors cursor-pointer text-white relative z-10"
            title="Đóng bảng vàng"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Dashboard Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-slate-50/50">
          
          {/* STATS & RADAR PROFILE GRID */}
          <div className="grid md:grid-cols-3 gap-6">
            
            {/* Student Achievements Info card */}
            <div className="bg-white rounded-2xl p-4 sm:p-5 border-2 border-slate-100 shadow-sm flex flex-col justify-between relative overflow-hidden">
              <div className="absolute -right-8 -bottom-8 w-24 h-24 bg-orange-50 rounded-full -z-10" />
              <div>
                <span className="text-[9px] uppercase font-black tracking-widest text-orange-500">Học Viên LeeGo:</span>
                <h3 className="text-lg font-black text-slate-800 tracking-tight mt-1 flex items-center gap-1.5">
                  {studentName}
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping shrink-0" />
                </h3>
                <p className="text-xs text-slate-400 font-bold mt-0.5">Chương trình: Everybody Up 2</p>
              </div>

              <div className="my-4 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                  <span>Tổng số sao vàng:</span>
                  <span className="text-amber-500 flex items-center gap-1 font-black">
                    <Star size={14} className="fill-amber-400" />
                    {totalStars} Sao
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                  <span>Cấp độ đạt được:</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-black bg-gradient-to-r ${badge.color}`}>
                    {badge.name}
                  </span>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-3 text-[10px] text-slate-400 font-medium leading-relaxed italic">
                ⭐ Hoàn thành các phần bài học giúp con đạt 5 sao tuyệt đối cho từng Unit.
              </div>
            </div>

            {/* Visual Learning Profile Strengths Card */}
            <div className="md:col-span-2 bg-white rounded-2xl p-4 sm:p-5 border-2 border-slate-100 shadow-sm space-y-4">
              <h4 className="font-black text-slate-800 text-xs tracking-wider uppercase flex items-center gap-1.5">
                <Sparkles size={14} className="text-orange-500" />
                Biểu đồ đánh giá kỹ năng học viên
              </h4>

              <div className="space-y-3.5">
                {/* 1. Vocabulary Strength */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-black text-slate-700">
                    <span className="flex items-center gap-1">📚 Ôn tập Từ vựng (Vocabulary)</span>
                    <span className="text-emerald-600">{vocabCount > 0 ? `${avgVocab}%` : "Chưa học"}</span>
                  </div>
                  <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                      style={{ width: `${vocabCount > 0 ? avgVocab : 0}%` }}
                    />
                  </div>
                </div>

                {/* 2. Grammar Strength */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-black text-slate-700">
                    <span className="flex items-center gap-1">✍️ Ghép câu Ngữ pháp (Grammar)</span>
                    <span className="text-indigo-600">{grammarCount > 0 ? `${avgGrammar}%` : "Chưa học"}</span>
                  </div>
                  <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                      style={{ width: `${grammarCount > 0 ? avgGrammar : 0}%` }}
                    />
                  </div>
                </div>

                {/* 3. Speaking Strength */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-black text-slate-700">
                    <span className="flex items-center gap-1">🗣️ Phản xạ Luyện nói (AI Speaking)</span>
                    <span className="text-rose-600">{speakingCount > 0 ? `${avgSpeaking}%` : "Chưa học"}</span>
                  </div>
                  <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-rose-500 rounded-full transition-all duration-500"
                      style={{ width: `${speakingCount > 0 ? avgSpeaking : 0}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* DETAILED UNIT ASSESSMENT LIST */}
          <div className="bg-white rounded-2xl border-2 border-slate-100 shadow-sm overflow-hidden">
            <div className="bg-slate-50 border-b border-slate-100 px-5 py-3 flex items-center justify-between">
              <h4 className="font-black text-slate-800 text-xs uppercase tracking-wider">
                Kết quả học tập theo bài (Unit Breakdown)
              </h4>
              <span className="text-[10px] text-slate-400 font-extrabold">
                Tổng cộng: {units.length} Units
              </span>
            </div>

            <div className="divide-y divide-slate-100 max-h-[380px] overflow-y-auto">
              {units.map((unit, index) => {
                const uAssess = assessments[unit.id] || {};
                const starsRating = uAssess.starsRating || 0;
                
                // Completed status
                const isVocabDone = uAssess.vocabulary?.completed;
                const isGrammarDone = uAssess.grammar?.completed;
                const isSpeakingDone = uAssess.speaking?.completed;

                return (
                  <div key={unit.id} className="p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors w-full">
                    
                    {/* Left: Title & Subtitle */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-md bg-orange-100 text-orange-600 text-[10px] font-black flex items-center justify-center shrink-0">
                          {index === 0 ? "★" : index}
                        </span>
                        <h5 className="font-black text-slate-800 text-xs truncate">
                          {unit.title}
                        </h5>
                      </div>
                      <p className="text-[10px] text-slate-400 font-medium ml-7 mt-0.5 truncate">
                        Chủ đề: {unit.subtitle}
                      </p>
                    </div>

                    {/* Middle: Stars Rating (1-5 stars) */}
                    <div className="flex items-center gap-0.5 select-none shrink-0 sm:justify-center">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          size={16}
                          className={
                            i < starsRating
                              ? "text-amber-400 fill-amber-400"
                              : "text-slate-200 fill-slate-100"
                          }
                        />
                      ))}
                      {starsRating > 0 && (
                        <span className="text-[10px] font-black text-amber-600 ml-1.5">
                          {starsRating} / 5
                        </span>
                      )}
                    </div>

                    {/* Right: Section score badges */}
                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      
                      {/* Vocabulary Badge */}
                      <button
                        onClick={() => {
                          onSelectUnitAndTab(unit.id, "vocabulary");
                          onClose();
                        }}
                        className={`px-2 py-1 rounded-xl text-[10px] font-black flex items-center gap-1 cursor-pointer transition-colors border
                          ${isVocabDone
                            ? "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100"
                            : "bg-slate-50 border-slate-200 text-slate-400 hover:bg-slate-100"
                          }`}
                      >
                        <BookOpen size={11} />
                        <span>Từ vựng: {isVocabDone ? `${uAssess.vocabulary?.score}%` : "Chưa làm"}</span>
                      </button>

                      {/* Grammar Badge */}
                      <button
                        onClick={() => {
                          onSelectUnitAndTab(unit.id, "grammar");
                          onClose();
                        }}
                        className={`px-2 py-1 rounded-xl text-[10px] font-black flex items-center gap-1 cursor-pointer transition-colors border
                          ${isGrammarDone
                            ? "bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100"
                            : "bg-slate-50 border-slate-200 text-slate-400 hover:bg-slate-100"
                          }`}
                      >
                        <Award size={11} />
                        <span>Ngữ pháp: {isGrammarDone ? `${uAssess.grammar?.score}%` : "Chưa làm"}</span>
                      </button>

                      {/* Speaking Badge */}
                      <button
                        onClick={() => {
                          onSelectUnitAndTab(unit.id, "speaking");
                          onClose();
                        }}
                        className={`px-2 py-1 rounded-xl text-[10px] font-black flex items-center gap-1 cursor-pointer transition-colors border
                          ${isSpeakingDone
                            ? "bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100"
                            : "bg-slate-50 border-slate-200 text-slate-400 hover:bg-slate-100"
                          }`}
                      >
                        <MessageCircle size={11} />
                        <span>Luyện nói: {isSpeakingDone ? `${uAssess.speaking?.score}%` : "Chưa làm"}</span>
                      </button>

                      {/* Print Worksheet shortcut */}
                      <button
                        onClick={() => handlePrintWorksheet(unit)}
                        className="p-1 text-slate-400 hover:text-orange-500 bg-slate-100 hover:bg-orange-50 rounded-lg transition-colors cursor-pointer"
                        title="Tải phiếu bài tập in ấn cho bài học này"
                      >
                        🖨️
                      </button>

                    </div>

                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Footer Dashboard */}
        <div className="bg-slate-50 border-t border-slate-100 px-6 py-4 flex items-center justify-between shrink-0 text-slate-400 font-semibold text-[10px]">
          <span>📍 Anh ngữ LeeGo - Luyện nói & Ôn tập Everybody Up 2</span>
          <span>Hotline hỗ trợ: 0988.526.585</span>
        </div>

      </div>
    </div>
  );
};
