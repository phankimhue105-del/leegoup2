/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { DialogueCharacter, CHARACTERS, Message, Unit, SPEAKING_QUESTIONS_DATA } from "../types";
import { speakBritish, stopAllSpeech } from "../lib/speech";
import { Mic, MicOff, Send, Volume2, Sparkles, AlertCircle, Award, Brain, User, CheckCircle2, RefreshCw, Trophy, ShieldAlert } from "lucide-react";

interface SpeakingTabProps {
  unit: Unit;
  onAwardStars: (count: number) => void;
  onSaveAssessment: (score: number) => void;
}

interface SpeakingEvaluation {
  score: number;
  pronunciation: string;
  vocabulary: string;
  grammar: string;
  advice: string;
}

const checkAnswerCorrectness = (userAns: string, hint: string): boolean => {
  if (!userAns) return false;
  const cleanUser = userAns.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, "").trim();
  const cleanHint = hint.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, "").trim();
  
  // Extract keywords (longer than 2 characters, filter out common short words)
  const hintWords = cleanHint.split(/\s+/).filter(w => w.length > 2 && w !== "and" && w !== "the" && w !== "for");
  if (hintWords.length === 0) return cleanUser.length > 0;
  
  return hintWords.some(hw => cleanUser.includes(hw));
};

const evaluateSpeakingLocally = (
  dialogue: { question: string; answer: string; hint: string }[]
) => {
  let matchCount = 0;
  dialogue.forEach((item) => {
    if (checkAnswerCorrectness(item.answer, item.hint)) {
      matchCount++;
    }
  });

  const score = Math.min(100, Math.max(50, Math.round((matchCount / dialogue.length) * 100)));
  
  let advice = "";
  if (score >= 90) {
    advice = "Tuyệt vời con ơi! Con nói tiếng Anh rất trôi chảy, phát âm tự tin và chuẩn xác. Thầy cô LeeGo rất tự hào về con!";
  } else if (score >= 70) {
    advice = "Con làm tốt lắm! Phản xạ nói của con rất nhanh, chỉ cần chú ý phát âm rõ các từ hơn một chút nữa là hoàn hảo nha!";
  } else {
    advice = "Con đã rất cố gắng rồi! Hãy tích cực luyện nói nhiều lần cùng các bạn AI Coach để nhớ từ vựng và tự tin hơn nhé!";
  }

  return {
    score,
    pronunciation: score >= 90 ? "Excellent" : score >= 70 ? "Good" : "Needs Practice",
    vocabulary: score >= 70 ? "Mastered" : "Review needed",
    grammar: score >= 70 ? "Correct" : "Fix: Hãy cố gắng trả lời đầy đủ câu nhé.",
    advice
  };
};

export const SpeakingTab: React.FC<SpeakingTabProps> = ({
  unit,
  onAwardStars,
  onSaveAssessment
}) => {
  // Retrieve unit questions from metadata
  const questions = SPEAKING_QUESTIONS_DATA[unit.id] || [];

  // Active Character
  const [activeChar, setActiveChar] = useState<DialogueCharacter>(CHARACTERS[0]);
  
  // Conversation Index & State
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [messages, setMessages] = useState<Message[]>([]);
  const [dialogueCompleted, setDialogueCompleted] = useState(false);
  
  // UI States
  const [inputText, setInputText] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [recognition, setRecognition] = useState<any | null>(null);
  const [micError, setMicError] = useState<string | null>(null);

  // Final Assessment Report
  const [evaluation, setEvaluation] = useState<SpeakingEvaluation | null>(null);
  const [evaluationError, setEvaluationError] = useState<string | null>(null);
  const [evaluationErrorType, setEvaluationErrorType] = useState<string | null>(null);
  const [evaluationErrorAdvice, setEvaluationErrorAdvice] = useState<string | null>(null);

  // References
  const messageEndRef = useRef<HTMLDivElement>(null);

  // Setup/Reset conversation when character or unit changes
  useEffect(() => {
    resetConversation();
  }, [activeChar, unit]);

  const resetConversation = () => {
    setDialogueCompleted(false);
    setCurrentQuestionIndex(0);
    setEvaluation(null);
    setIsLoading(false);
    setIsEvaluating(false);
    setEvaluationError(null);
    setEvaluationErrorType(null);
    setEvaluationErrorAdvice(null);
    
    // Clear and set first question
    if (questions.length > 0) {
      const firstQ = questions[0];
      setMessages([
        {
          id: "q-0",
          sender: "ai",
          text: `${firstQ.question}`,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        }
      ]);
      // Speak the first question aloud
      setTimeout(() => {
        handleReadAloud(firstQ.question);
      }, 500);
    } else {
      setMessages([]);
    }
  };

  // Setup Web Speech Recognition with cleanup
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    let rec: any = null;
    if (SpeechRecognition) {
      rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = "en-GB";

      rec.onstart = () => {
        setIsRecording(true);
        setMicError(null);
      };

      rec.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInputText(transcript);
        }
      };

      rec.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
        if (event.error === "not-allowed") {
          setMicError("Con hãy bật quyền cho phép trình duyệt sử dụng Micro nhé!");
        } else {
          setMicError("Micro hơi nhiễu một chút. Con hãy nói to và rõ hơn nha!");
        }
        setIsRecording(false);
      };

      rec.onend = () => {
        setIsRecording(false);
      };

      setRecognition(rec);
    }

    return () => {
      if (rec) {
        try {
          rec.abort();
        } catch (e) {
          console.warn("Failed to abort speech recognition on unmount", e);
        }
      }
      stopAllSpeech();
    };
  }, []);

  // Scroll to bottom on new messages
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading, isEvaluating]);

  // Read message aloud using speech synthesis
  const handleReadAloud = (text: string) => {
    speakBritish(text, 0.82);
  };

  // Toggle voice recording
  const handleToggleMic = () => {
    if (!recognition) {
      setMicError("Microphone API không được hỗ trợ trên trình duyệt này. Con hãy dùng bàn phím để gõ nhé!");
      return;
    }

    if (isRecording) {
      recognition.stop();
    } else {
      setInputText("");
      setMicError(null);
      try {
        recognition.start();
      } catch (err) {
        console.error("Failed to start speech recognition:", err);
      }
    }
  };

  // Send message & transition to next question with 1 second delay
  const handleSendMessage = async () => {
    const text = inputText.trim();
    if (!text || isLoading || isEvaluating || dialogueCompleted) return;

    setInputText("");
    setMicError(null);

    // 1. Add student's response to chat list
    const userMsg: Message = {
      id: `ans-${currentQuestionIndex}-${Date.now()}`,
      sender: "user",
      text: text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    const nextIndex = currentQuestionIndex + 1;

    // Evaluate current response to give friendly random feedback
    const currentQ = questions[currentQuestionIndex];
    const isCorrect = checkAnswerCorrectness(text, currentQ.hint);
    const correctFeedbacks = ["Excellent!", "Great job!", "Wonderful!", "Well done!"];
    const incorrectFeedbacks = ["Good try!", "Nice try!", "Keep going!"];
    const feedbackList = isCorrect ? correctFeedbacks : incorrectFeedbacks;
    const randomFeedback = feedbackList[Math.floor(Math.random() * feedbackList.length)];

    // 2. Wait exactly 1 second, then show next question or evaluate locally
    if (nextIndex < questions.length) {
      setTimeout(() => {
        const nextQ = questions[nextIndex];
        const aiMsg: Message = {
          id: `q-${nextIndex}-${Date.now()}`,
          sender: "ai",
          text: `${randomFeedback} ${nextQ.question}`,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        };
        
        setMessages((prev) => [...prev, aiMsg]);
        setCurrentQuestionIndex(nextIndex);
        setIsLoading(false);
        
        // Speak next question with feedback prepended
        handleReadAloud(`${randomFeedback} ${nextQ.question}`);
      }, 1000);
    } else {
      // All questions completed! Perform grading locally
      setIsLoading(false);
      setIsEvaluating(true);

      // Simulate a small analysis delay for child engagement
      setTimeout(() => {
        const dialoguePayload = questions.map((q, idx) => {
          const userMsgText = idx === questions.length - 1 ? text : (messages[idx * 2 + 1]?.text || "");
          return {
            question: q.question,
            answer: userMsgText,
            hint: q.hint
          };
        });

        const data = evaluateSpeakingLocally(dialoguePayload);
        setEvaluation(data);

        // Award stars based on score
        const starReward = data.score >= 90 ? 3 : data.score >= 70 ? 2 : 1;
        onAwardStars(starReward);

        // Save assessment score
        onSaveAssessment(data.score || 85);
        setDialogueCompleted(true);
        setIsEvaluating(false);
      }, 1200);
    }
  };

  return (
    <div className="grid lg:grid-cols-3 gap-6" id="leego-speaking-tab">
      
      {/* 1. CHARACTER PROFILE SELECTOR COLUMN */}
      <div className="lg:col-span-1 space-y-4">
        <div className="bg-white rounded-3xl border-2 border-slate-100 p-4 shadow-sm">
          <h4 className="font-black text-slate-800 text-sm mb-3 pb-1.5 border-b border-slate-100 flex items-center gap-1.5 select-none">
            <User size={16} className="text-orange-500" />
            Chọn bạn luyện nói
          </h4>

          <div className="grid grid-cols-2 lg:grid-cols-1 gap-2">
            {CHARACTERS.map((char) => {
              const isSelected = char.id === activeChar.id;
              return (
                <button
                  key={char.id}
                  onClick={() => setActiveChar(char)}
                  disabled={currentQuestionIndex > 0 && !dialogueCompleted}
                  className={`flex items-center gap-3 p-3 rounded-2xl text-left border-2 transition-all select-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed
                    ${isSelected
                      ? "bg-orange-50/50 border-orange-400 shadow-sm"
                      : "bg-white hover:bg-slate-50 border-slate-50 hover:border-slate-100"
                    }`}
                >
                  <span className="text-3xl">{char.avatar}</span>
                  <div className="min-w-0">
                    <p className={`font-black text-xs leading-tight ${isSelected ? "text-orange-900" : "text-slate-700"}`}>
                      {char.name}
                    </p>
                    <p className="text-[9px] text-slate-400 font-medium truncate mt-0.5">
                      {char.roleDescriptionVi}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
          {currentQuestionIndex > 0 && !dialogueCompleted && (
            <p className="text-[9px] text-slate-400 font-semibold mt-2.5 leading-relaxed bg-slate-50 border border-slate-100 rounded-xl p-2 select-none">
              ⚠️ Con đang trong cuộc hội thoại, hãy trả lời hết các câu hỏi hoặc bấm <b>Làm mới 🔄</b> để đổi nhân vật nhé.
            </p>
          )}
        </div>
      </div>

      {/* 2. MAIN CONVERSATION CHAT COLUMN */}
      <div className="lg:col-span-2 space-y-4">
        <div className="bg-white rounded-3xl border-2 border-slate-100 shadow-sm overflow-hidden flex flex-col h-[520px]">
          
          {/* Active Partner Top bar */}
          <div className="bg-slate-50 border-b border-slate-100 px-4 py-3 flex items-center justify-between select-none">
            <div className="flex items-center gap-2.5">
              <span className="text-3xl">{activeChar.avatar}</span>
              <div>
                <h5 className="font-black text-slate-800 text-sm leading-tight">
                  {activeChar.name}
                </h5>
                <p className="text-[10px] text-emerald-600 font-extrabold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                  Đang online • LeeGo Smart Coach
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black text-indigo-700 bg-indigo-50 border border-indigo-100 rounded-full px-2.5 py-0.5">
                Câu {Math.min(currentQuestionIndex + 1, questions.length)} / {questions.length}
              </span>
              
              <button
                onClick={resetConversation}
                className="p-1.5 hover:bg-slate-200 text-slate-500 rounded-lg transition-colors cursor-pointer"
                title="Làm mới cuộc trò chuyện"
              >
                <RefreshCw size={15} />
              </button>
            </div>
          </div>

          {/* CHAT BUBBLE CONVERSATION CONTAINER */}
          <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-slate-50/50">
            {messages.map((msg, index) => {
              const isAi = msg.sender === "ai";
              // AI questions correspond to indices 0, 2, 4, 6... in messages
              const qIndex = isAi ? Math.floor(index / 2) : -1;
              const matchingQuestion = qIndex !== -1 ? questions[qIndex] : null;

              return (
                <div key={msg.id} className="space-y-2 animate-fade-in">
                  
                  {/* Chat bubble */}
                  <div className={`flex items-start gap-2.5 ${isAi ? "justify-start" : "justify-end"}`}>
                    {isAi && (
                      <span className="text-2xl mt-0.5 select-none">{activeChar.avatar}</span>
                    )}

                    <div className="flex flex-col gap-2 max-w-[85%]">
                      
                      {/* EMOJI ILLUSTRATION FOR AI QUESTION */}
                      {isAi && matchingQuestion && matchingQuestion.emoji && (
                        <div className="flex items-center justify-center p-2.5 bg-white border-2 border-orange-100 rounded-2xl w-14 h-14 shadow-sm select-none animate-scale-up">
                          <span className="text-3xl shrink-0 animate-bounce">{matchingQuestion.emoji}</span>
                        </div>
                      )}

                      <div className={`rounded-2xl px-4 py-3 shadow-sm relative group
                        ${isAi 
                          ? "bg-white text-slate-800 border border-slate-100 rounded-tl-none" 
                          : "bg-orange-500 text-white rounded-tr-none"
                        }`}
                      >
                        {/* Repeat sound button for AI question */}
                        {isAi && (
                          <button
                            onClick={() => handleReadAloud(msg.text)}
                            className="absolute -right-8 top-1/2 -translate-y-1/2 p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                            title="Nghe lại câu hỏi"
                          >
                            <Volume2 size={12} />
                          </button>
                        )}

                        <p className="text-xs font-bold leading-relaxed">{msg.text}</p>
                        
                        {/* Vietnamese subtitle translation for AI question helper */}
                        {isAi && matchingQuestion && (
                          <p className="text-[10px] text-slate-400 font-semibold mt-1 border-t border-slate-100 pt-1">
                            ({matchingQuestion.translation})
                          </p>
                        )}
                        
                        <span className={`text-[8px] block mt-1.5 font-medium
                          ${isAi ? "text-slate-400" : "text-orange-100"}`}
                        >
                          {msg.timestamp}
                        </span>
                      </div>
                    </div>
                  </div>

                </div>
              );
            })}

            {/* AI is thinking/typing indicator between questions */}
            {isLoading && (
              <div className="flex items-start gap-2.5 animate-pulse pl-2">
                <span className="text-2xl mt-0.5 select-none">{activeChar.avatar}</span>
                <div className="bg-white border border-slate-100 rounded-2xl rounded-tl-none px-4 py-3 shadow-sm flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-ping"></span>
                  <span className="text-xs font-bold text-slate-400">Bạn học đang chuẩn bị câu tiếp theo...</span>
                </div>
              </div>
            )}

            {/* AI is evaluating conversation loader */}
            {isEvaluating && (
              <div className="flex items-start gap-2.5 animate-pulse pl-2">
                <span className="text-2xl mt-0.5 select-none">🤖</span>
                <div className="bg-white border border-indigo-100 rounded-2xl rounded-tl-none px-4 py-3 shadow-md flex items-center gap-2">
                  <Brain size={15} className="text-indigo-600 animate-spin" />
                  <span className="text-xs font-black text-indigo-700">
                    Cô thầy LeeGo đang phân tích toàn bộ bài nói của con... 🎙️🧠
                  </span>
                </div>
              </div>
            )}

            {/* API ERROR REPORT CARD - Displayed if AI evaluation failed */}
            {evaluationError && (
              <div className="max-w-xl animate-scale-up mx-auto pt-4 select-none">
                <div className="bg-white border-2 border-red-200 rounded-3xl overflow-hidden shadow-lg">
                  <div className="bg-red-500 px-4 py-2.5 text-center text-xs font-black text-white tracking-widest">
                    🚨 ĐÃ DỪNG DO LỖI HỆ THỐNG 🚨
                  </div>
                  <div className="p-5 space-y-4 text-center">
                    <ShieldAlert size={48} className="text-red-500 mx-auto animate-pulse" />
                    <div>
                      <h4 className="text-sm font-black text-slate-800">Không thể hoàn thành chấm điểm tự động</h4>
                      <p className="text-[10px] text-red-500 font-extrabold mt-1.5 font-mono uppercase bg-red-50 border border-red-100 rounded-xl p-3 text-left overflow-x-auto leading-relaxed">
                        LỖI: {evaluationErrorType || "UNKNOWN_ERROR"}
                        <br />
                        CHI TIẾT: {evaluationError}
                      </p>
                    </div>
                    <div className="bg-slate-50 rounded-2xl p-3 text-slate-500 text-[10px] font-semibold text-left space-y-1">
                      <p className="font-extrabold text-[11px] text-slate-700">💡 Hướng xử lý đề xuất:</p>
                      <p className="text-orange-600 font-black text-xs leading-relaxed">
                        {evaluationErrorAdvice || "Hãy kiểm tra/thay đổi API Key ở nút Cài đặt trên Header rồi bấm 'Thử lại chấm điểm' bên dưới nhé."}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setIsEvaluating(true);
                          setEvaluationError(null);
                          setEvaluationErrorType(null);
                          setEvaluationErrorAdvice(null);
                          
                          setTimeout(() => {
                            const dialoguePayload = questions.map((q, idx) => {
                              const userMsgText = messages[idx * 2 + 1]?.text || "";
                              return {
                                question: q.question,
                                answer: userMsgText,
                                hint: q.hint
                              };
                            });

                            const data = evaluateSpeakingLocally(dialoguePayload);
                            setEvaluation(data);
                            const starReward = data.score >= 90 ? 3 : data.score >= 70 ? 2 : 1;
                            onAwardStars(starReward);
                            onSaveAssessment(data.score || 85);
                            setDialogueCompleted(true);
                            setIsEvaluating(false);
                          }, 1000);
                        }}
                        className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white font-black text-xs rounded-xl shadow-md cursor-pointer transition-transform hover:scale-103 active:scale-97"
                      >
                        🔄 Thử lại chấm điểm
                      </button>
                      <button
                        onClick={resetConversation}
                        className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-xs rounded-xl cursor-pointer"
                      >
                        Hủy & Luyện nói lại
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* OFFICIAL ASSESSMENT REPORT CARD - Displayed at the end of the dialogue */}
            {dialogueCompleted && evaluation && (
              <div className="max-w-xl animate-scale-up mx-auto pt-4 select-none">
                <div className="bg-white border-2 border-indigo-200 rounded-3xl overflow-hidden shadow-lg">
                  
                  {/* Official Header */}
                  <div className="bg-indigo-600 px-4 py-2.5 text-center text-xs font-black text-white tracking-widest">
                    🌟 KẾT QUẢ AI LUYỆN NÓI - ANH NGỮ LEEGO 🌟
                  </div>

                  {/* Body Summary */}
                  <div className="p-4 space-y-4 text-xs text-slate-700">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <span className="font-black text-indigo-900 text-[11px] uppercase">
                        📖 Bài học: {unit.title}
                      </span>
                      <span className="text-[9px] bg-indigo-50 text-indigo-700 border border-indigo-100 px-2 py-0.5 rounded-full font-black">
                        Luyện nói cùng {activeChar.name}
                      </span>
                    </div>

                    {/* Score and Metrics */}
                    <div className="grid grid-cols-2 gap-2.5">
                      
                      {/* Score Display */}
                      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 flex flex-col items-center justify-center">
                        <span className="text-[10px] font-black text-amber-800 uppercase">Điểm Nói</span>
                        <span className="text-2xl font-black text-amber-600 flex items-center gap-0.5 mt-0.5">
                          {evaluation.score} <span className="text-xs font-bold">/100</span>
                        </span>
                        <span className="text-[10px] text-amber-500 mt-1">
                          {Array(Math.ceil((evaluation.score || 80) / 20)).fill("⭐").join("")}
                        </span>
                      </div>

                      {/* Pronunciation evaluation */}
                      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3 flex flex-col items-center justify-center text-center">
                        <span className="text-[10px] font-black text-emerald-800 uppercase">Phát âm</span>
                        <span className="text-sm font-black text-emerald-700 mt-1">
                          {evaluation.pronunciation}
                        </span>
                      </div>

                      {/* Vocabulary evaluation */}
                      <div className="bg-sky-50 border border-sky-100 rounded-2xl p-3 flex flex-col items-center justify-center text-center">
                        <span className="text-[10px] font-black text-sky-800 uppercase">Từ vựng</span>
                        <span className="text-sm font-black text-sky-700 mt-1">
                          {evaluation.vocabulary}
                        </span>
                      </div>

                      {/* Grammar evaluation */}
                      <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3 flex flex-col items-center justify-center text-center">
                        <span className="text-[10px] font-black text-slate-800 uppercase">Cú pháp câu</span>
                        <span className="text-xs font-black text-slate-700 mt-1 truncate max-w-full" title={evaluation.grammar}>
                          {evaluation.grammar}
                        </span>
                      </div>
                    </div>

                    {/* Teacher Advice */}
                    <div className="bg-indigo-50/50 border border-indigo-100 rounded-2xl p-3 text-[11px] leading-relaxed text-indigo-950 font-medium">
                      <p className="font-black text-indigo-900 mb-1 flex items-center gap-1">
                        <span>👩‍🏫</span> Nhận xét từ Thầy Cô:
                      </p>
                      <p className="italic leading-normal font-semibold">"{evaluation.advice}"</p>
                    </div>

                    <button
                      onClick={resetConversation}
                      className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl text-center shadow-md transition-all active:scale-95 cursor-pointer mt-2"
                    >
                      🔄 Luyện nói lại vòng mới
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div ref={messageEndRef} />
          </div>

          {/* INPUT FORM & RECORDING BUTTON CONTROLLER */}
          <div className="p-3 bg-slate-50 border-t border-slate-100 flex flex-col gap-2 relative">
            
            {/* Error alerts */}
            {micError && (
              <div className="absolute left-3 right-3 bottom-16 bg-rose-50 border border-rose-200 text-rose-700 text-[10px] font-black p-2 rounded-xl flex items-center gap-1.5 z-10 animate-fade-in select-none">
                <AlertCircle size={12} className="text-rose-500 shrink-0" />
                <span>{micError}</span>
              </div>
            )}

            <div className="flex items-center gap-2">
              
              {/* Voice record microphone trigger */}
              <button
                type="button"
                onClick={handleToggleMic}
                disabled={isLoading || isEvaluating || dialogueCompleted}
                className={`p-3.5 rounded-full flex items-center justify-center transition-all shadow-sm shrink-0 relative cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed
                  ${isRecording 
                    ? "bg-red-500 text-white animate-pulse hover:bg-red-600 scale-105" 
                    : "bg-white hover:bg-slate-100 text-orange-500 border-2 border-orange-200"
                  }`}
                title={isRecording ? "Stop Recording" : "Speak with Mic (English)"}
              >
                {isRecording ? <MicOff size={20} /> : <Mic size={20} />}
                {isRecording && (
                  <span className="absolute inset-0 rounded-full bg-red-500 opacity-20 animate-ping -z-10"></span>
                )}
              </button>

              {/* Text Input fall-back field */}
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSendMessage();
                }}
                disabled={isRecording || isLoading || isEvaluating || dialogueCompleted}
                placeholder={
                  dialogueCompleted 
                    ? "Hội thoại đã kết thúc. Hãy bấm Luyện nói lại ở trên."
                    : isRecording 
                      ? "Con hãy nói tiếng Anh thật to rõ nhé...🎙️" 
                      : "Gõ câu trả lời tiếng Anh của con..."
                }
                className="flex-1 bg-white border border-slate-200 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 rounded-full px-4 py-2.5 text-xs font-bold text-slate-700 disabled:bg-slate-100 disabled:cursor-not-allowed"
              />

              {/* Submit triggers */}
              <button
                onClick={handleSendMessage}
                disabled={isRecording || isLoading || isEvaluating || !inputText.trim() || dialogueCompleted}
                className="p-2.5 bg-orange-500 text-white rounded-full hover:bg-orange-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0 shadow-sm cursor-pointer"
              >
                <Send size={14} />
              </button>

            </div>

            {/* Instruction footnote */}
            <p className="text-[9px] text-center text-slate-400 font-medium select-none">
              💡 {isRecording ? "Bấm nút Đỏ để dừng ghi âm và gửi câu trả lời." : "Hãy bấm nút Micro để thu âm giọng nói tiếng Anh của con."}
            </p>

          </div>

        </div>
      </div>

    </div>
  );
};
