/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Unit } from "../types";
import { speakBritish } from "../lib/speech";
import { Sparkles, HelpCircle, Check, AlertCircle, RefreshCw, Volume2, Trophy, ArrowRight, Award } from "lucide-react";

interface GrammarTabProps {
  unit: Unit;
  onAwardStars: (count: number) => void;
  onSaveAssessment: (score: number) => void;
}

export const GrammarTab: React.FC<GrammarTabProps> = ({
  unit,
  onAwardStars,
  onSaveAssessment
}) => {
  const { grammarStructures } = unit;
  
  const [questionIndex, setQuestionIndex] = useState(0);
  const [shuffledTiles, setShuffledTiles] = useState<string[]>([]);
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  
  // Feedback states
  const [isChecked, setIsChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  // Scoring states
  const [firstTryCorrectCount, setFirstTryCorrectCount] = useState(0);
  const [hasFailedCurrent, setHasFailedCurrent] = useState(false);
  const [grammarCompleted, setGrammarCompleted] = useState(false);

  const currentQuestion = grammarStructures.scrambledQuestions[questionIndex];

  // Set up question when unit or questionIndex changes
  useEffect(() => {
    loadQuestion();
  }, [unit, questionIndex]);

  // Reset completion state on unit change
  useEffect(() => {
    setGrammarCompleted(false);
    setQuestionIndex(0);
    setFirstTryCorrectCount(0);
    setHasFailedCurrent(false);
  }, [unit]);

  const loadQuestion = () => {
    if (!grammarStructures.scrambledQuestions || grammarStructures.scrambledQuestions.length === 0) return;
    
    setIsChecked(false);
    setIsCorrect(false);
    setSelectedWords([]);
    setHasFailedCurrent(false);

    const question = grammarStructures.scrambledQuestions[questionIndex];
    if (question) {
      const tiles = [...question.words].sort(() => 0.5 - Math.random());
      setShuffledTiles(tiles);
    }
  };

  // Text-To-Speech Pronunciation
  const playSentenceAudio = (sentence: string) => {
    const cleanSentence = sentence.replace(/\s+\./g, ".").replace(/\s+\?/g, "?");
    speakBritish(cleanSentence, 0.82);
  };

  const handleTileClick = (word: string, tileIndex: number) => {
    if (isChecked) return;
    
    setSelectedWords([...selectedWords, word]);
    
    const newTiles = [...shuffledTiles];
    newTiles.splice(tileIndex, 1);
    setShuffledTiles(newTiles);
  };

  const handleSelectedWordClick = (word: string, wordIndex: number) => {
    if (isChecked) return;

    const newSelected = [...selectedWords];
    newSelected.splice(wordIndex, 1);
    setSelectedWords(newSelected);

    setShuffledTiles([...shuffledTiles, word]);
  };

  const handleReset = () => {
    loadQuestion();
  };

  const handleCheckAnswer = () => {
    if (selectedWords.length === 0 || isChecked) return;

    setIsChecked(true);
    const constructed = selectedWords.join(" ");
    const correctAns = currentQuestion.correct;

    const normConstructed = constructed.replace(/\s+/g, " ").trim();
    const normCorrect = correctAns.replace(/\s+/g, " ").trim();

    if (normConstructed === normCorrect) {
      setIsCorrect(true);
      onAwardStars(2); // Grammatically correct sentence yields +2 stars!
      playSentenceAudio(normCorrect);
      
      // If student got it right without failing this specific question
      if (!hasFailedCurrent) {
        setFirstTryCorrectCount((prev) => prev + 1);
      }
    } else {
      setIsCorrect(false);
      setHasFailedCurrent(true);
      speakBritish("Oh no, try again!", 0.95);
    }
  };

  const handleNextQuestion = () => {
    if (questionIndex < grammarStructures.scrambledQuestions.length - 1) {
      setQuestionIndex(questionIndex + 1);
    } else {
      // Finished all scrambled sentences in this unit
      setGrammarCompleted(true);
    }
  };

  const handleCompleteGrammar = () => {
    const totalQuestions = grammarStructures.scrambledQuestions.length;
    const score = Math.round((firstTryCorrectCount / totalQuestions) * 100);
    
    // Save assessment score
    onSaveAssessment(score);
    
    // Reset/Navigate
    setGrammarCompleted(false);
    setQuestionIndex(0);
    setFirstTryCorrectCount(0);
  };

  return (
    <div className="space-y-6" id="leego-grammar-tab">
      
      {/* EXPLANATION NOTE */}
      <div className="bg-gradient-to-br from-indigo-50 to-blue-50 border-2 border-indigo-100 rounded-3xl p-4 sm:p-6 shadow-sm w-full">
        <div className="flex items-center gap-2.5 mb-3">
          <div className="p-1.5 bg-indigo-500 text-white rounded-xl">
            <HelpCircle size={18} />
          </div>
          <div>
            <h4 className="font-black text-indigo-900 text-sm tracking-tight">
              Góc Ngữ Pháp: {grammarStructures.pattern}
            </h4>
            <p className="text-xs text-indigo-700/85">
              {grammarStructures.description}
            </p>
          </div>
        </div>

        <div className="bg-white/85 rounded-2xl p-4 border border-indigo-100/60 text-xs text-slate-700 font-medium leading-relaxed">
          <p className="text-indigo-800 font-black mb-1.5 flex items-center gap-1">
            <span>💡</span> Thầy cô LeeGo hướng dẫn:
          </p>
          <p>{grammarStructures.explanationVi}</p>
        </div>
      </div>

      {/* RENDER ACTIVE QUESTION OR EVALUATION SUMMARY CARD */}
      {!grammarCompleted ? (
        currentQuestion && (
          <div className="bg-white rounded-3xl border-2 border-slate-100 p-4 sm:p-6 shadow-sm text-center flex flex-col items-center w-full">
            
            <div className="mb-4">
              <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider block">
                Thử thách Ghép Câu (Sentence Builder)
              </span>
              <span className="text-xs font-bold text-indigo-600">
                Câu hỏi {questionIndex + 1} / {grammarStructures.scrambledQuestions.length}
              </span>
            </div>

            {/* Goal hint (Vietnamese) */}
            <div className="bg-slate-50 border border-slate-100 px-5 py-3 rounded-2xl text-slate-700 text-sm font-extrabold max-w-md w-full mb-6">
              🇻🇳 Hãy ghép câu mang nghĩa: <span className="text-indigo-600">"{currentQuestion.hintVi}"</span>
            </div>

            {/* Constructed Sentence Box */}
            <div className="w-full max-w-xl min-h-[70px] bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl p-3 flex flex-wrap items-center justify-center gap-2 mb-6">
              {selectedWords.length === 0 && (
                <span className="text-slate-300 text-xs font-bold italic select-none">
                  Nhấp chuột chọn các từ bên dưới xếp vào đây nhé...
                </span>
              )}
              {selectedWords.map((word, index) => (
                <button
                  key={index}
                  onClick={() => handleSelectedWordClick(word, index)}
                  disabled={isChecked}
                  className="px-3.5 py-1.5 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 text-sm font-extrabold hover:bg-rose-50 hover:border-rose-300 hover:text-rose-600 transition-all scale-100 hover:scale-103 shadow-sm cursor-pointer"
                >
                  {word}
                </button>
              ))}
            </div>

            {/* Available Word Tiles */}
            <div className="flex flex-wrap items-center justify-center gap-2 max-w-md mb-8">
              {shuffledTiles.map((word, idx) => (
                <button
                  key={idx}
                  onClick={() => handleTileClick(word, idx)}
                  disabled={isChecked}
                  className="px-4 py-2 rounded-xl bg-white border-2 border-slate-200 hover:border-indigo-400 text-slate-700 text-sm font-black hover:scale-105 active:scale-95 shadow-sm transition-all cursor-pointer"
                >
                  {word}
                </button>
              ))}
            </div>

            {/* Controls button row */}
            <div className="flex items-center gap-3 w-full max-w-md border-t border-slate-100 pt-6">
              <button
                onClick={handleReset}
                disabled={isChecked && isCorrect}
                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-600 font-extrabold rounded-2xl text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <RefreshCw size={14} />
                <span>Xóa sạch</span>
              </button>

              <button
                onClick={handleCheckAnswer}
                disabled={selectedWords.length === 0 || isChecked}
                className="flex-1 py-3 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white font-extrabold rounded-2xl text-xs transition-transform shadow-sm hover:scale-103 active:scale-97 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Kiểm tra câu 🚀</span>
              </button>
            </div>

            {/* RESPONSE FEEDBACK CONTAINER */}
            {isChecked && (
              <div className={`mt-6 w-full max-w-md p-4 rounded-2xl border-2 animate-fade-in flex items-center justify-between gap-3
                ${isCorrect 
                  ? "bg-emerald-50 border-emerald-200 text-emerald-800" 
                  : "bg-rose-50 border-rose-200 text-rose-800"
                }`}
              >
                <div className="flex items-center gap-2.5 text-left">
                  {isCorrect ? (
                    <>
                      <Trophy size={20} className="text-emerald-500" />
                      <div>
                        <p className="font-extrabold text-sm">Chính xác tuyệt vời! 🌟</p>
                        <p className="text-[10px] text-emerald-600">
                          Con nhận được <span className="font-black">+2 sao vàng</span> thành tựu!
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <AlertCircle size={20} className="text-rose-500" />
                      <div>
                        <p className="font-extrabold text-sm">Chưa đúng ngữ pháp rồi con ơi!</p>
                        <p className="text-[10px] text-rose-500/80">
                          Đáp án đúng: <span className="font-black text-xs font-mono">{currentQuestion.correct}</span>
                        </p>
                      </div>
                    </>
                  )}
                </div>

                <div className="flex gap-1.5 shrink-0">
                  {isCorrect && (
                    <button
                      onClick={() => playSentenceAudio(currentQuestion.correct)}
                      className="p-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 rounded-xl transition-colors cursor-pointer"
                      title="Phát âm thanh câu này"
                    >
                      <Volume2 size={14} />
                    </button>
                  )}

                  <button
                    onClick={isCorrect ? handleNextQuestion : handleReset}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-xl font-extrabold text-xs transition-transform shadow-sm hover:scale-105 active:scale-95 cursor-pointer
                      ${isCorrect 
                        ? "bg-emerald-500 text-white hover:bg-emerald-600" 
                        : "bg-rose-500 text-white hover:bg-rose-600"
                      }`}
                  >
                    <span>{isCorrect ? "Câu tiếp" : "Thử lại"}</span>
                    <ArrowRight size={12} />
                  </button>
                </div>
              </div>
            )}

          </div>
        )
      ) : (
        /* OFFICIAL GRAMMAR ASSESSMENT REPORT CARD */
        <div className="border-2 border-indigo-200 rounded-3xl overflow-hidden shadow-lg max-w-md mx-auto animate-scale-up bg-white">
          <div className="bg-indigo-600 px-4 py-2.5 text-center text-xs font-black text-white tracking-widest">
            🌟 BẢNG ĐÁNH GIÁ NGỮ PHÁP - ANH NGỮ LEEGO 🌟
          </div>
          
          <div className="p-5 space-y-4 text-center">
            <Award size={48} className="text-indigo-500 mx-auto fill-indigo-100" />
            <div>
              <h4 className="text-md font-black text-slate-800">Hoàn thành bài tập ghép câu!</h4>
              <p className="text-xs text-slate-400 mt-1">Kết quả ngữ pháp Everybody Up 2 - {unit.title}</p>
            </div>

            <div className="bg-indigo-50/50 border border-indigo-100 rounded-2xl p-4 grid grid-cols-2 gap-4">
              <div className="text-center">
                <span className="text-[10px] font-black text-indigo-800 block uppercase">Đúng lần đầu</span>
                <span className="text-2xl font-black text-slate-800 mt-1 block">
                  {firstTryCorrectCount} / {grammarStructures.scrambledQuestions.length}
                </span>
              </div>
              <div className="text-center border-l border-indigo-200/50">
                <span className="text-[10px] font-black text-indigo-800 block uppercase">Điểm ngữ pháp</span>
                <span className="text-2xl font-black text-indigo-600 mt-1 block">
                  {Math.round((firstTryCorrectCount / grammarStructures.scrambledQuestions.length) * 100)}%
                </span>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3 text-left">
              <p className="font-extrabold text-[11px] text-slate-700 mb-1 flex items-center gap-1">
                <span>👩‍🏫</span> Nhận xét từ Thầy Cô LeeGo:
              </p>
              <p className="text-xs text-slate-600 italic leading-relaxed">
                {firstTryCorrectCount === grammarStructures.scrambledQuestions.length 
                  ? "Tuyệt cú mèo! Con ghép đúng toàn bộ cấu trúc ngữ pháp ngay lần đầu tiên. Con thật xuất sắc!"
                  : firstTryCorrectCount >= Math.floor(grammarStructures.scrambledQuestions.length / 2)
                    ? "Con làm rất tốt! Có một vài câu con cần luyện lại cách sắp xếp trật tự từ, hãy đọc kỹ bài hướng dẫn nhé!"
                    : "Con đã cố gắng làm bài tập. Hãy xem lại phần Góc Ngữ Pháp ở trên để hiểu rõ hơn trật tự ghép câu và làm lại nha."
                }
              </p>
            </div>

            <button
              onClick={handleCompleteGrammar}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black rounded-xl shadow-md transition-all active:scale-95 cursor-pointer w-full"
            >
              Hoàn thành & Lưu kết quả 🌟
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
