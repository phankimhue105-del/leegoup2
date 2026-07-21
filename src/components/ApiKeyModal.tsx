/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { X, Sparkles, Key, AlertCircle, ShieldAlert } from "lucide-react";

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  isMandatory?: boolean;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({
  isOpen,
  onClose,
  isMandatory = false
}) => {
  const [apiKey, setApiKey] = useState("");
  const [model, setModel] = useState("gemini-3-flash-preview");
  const [showError, setShowError] = useState(false);

  useEffect(() => {
    const savedKey = localStorage.getItem("leego_gemini_api_key") || "";
    const savedModel = localStorage.getItem("leego_gemini_model") || "gemini-3-flash-preview";
    setApiKey(savedKey);
    setModel(savedModel);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (!apiKey.trim()) {
      setShowError(true);
      return;
    }
    localStorage.setItem("leego_gemini_api_key", apiKey.trim());
    localStorage.setItem("leego_gemini_model", model);
    setShowError(false);
    onClose();
    // Refresh page or trigger callback to update state
    window.location.reload();
  };

  const modelOptions = [
    {
      id: "gemini-3-flash-preview",
      name: "Gemini 3 Flash (Default)",
      desc: "Phản hồi siêu tốc, tiết kiệm hạn ngạch. Phù hợp cho việc luyện nói hàng ngày.",
      badge: "Cực Nhanh"
    },
    {
      id: "gemini-3-pro-preview",
      name: "Gemini 3 Pro",
      desc: "Mô hình cao cấp, chấm điểm ngữ pháp và nhận xét thông minh, sâu sắc.",
      badge: "Thông Minh"
    },
    {
      id: "gemini-2.5-flash",
      name: "Gemini 2.5 Flash",
      desc: "Model tiêu chuẩn của Google, chạy ổn định và độ chính xác cao.",
      badge: "Ổn Định"
    }
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-slate-100 flex flex-col overflow-hidden animate-scale-up">
        
        {/* Title bar */}
        <div className="bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-4 text-white flex items-center justify-between select-none shrink-0">
          <div className="flex items-center gap-2">
            <Key size={20} className="text-amber-300" />
            <h3 className="font-black text-sm tracking-tight">CÀI ĐẶT AI MENTOR API KEY</h3>
          </div>
          {!isMandatory && (
            <button
              onClick={onClose}
              className="p-1 hover:bg-white/20 rounded-lg text-white cursor-pointer"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 w-full">
          
          {/* Warning Banner if mandatory */}
          {isMandatory && (
            <div className="bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl p-4 flex items-start gap-3 animate-pulse">
              <ShieldAlert size={20} className="text-rose-500 shrink-0 mt-0.5" />
              <div className="text-xs font-bold leading-relaxed">
                <p className="font-black">Thiếu API Key để kích hoạt AI Luyện Nói!</p>
                <p className="text-[10px] text-rose-600 mt-0.5">
                  Ứng dụng học tập Anh ngữ LeeGo cần API key để kết nối trực tiếp với trí tuệ nhân tạo Gemini của Google.
                </p>
              </div>
            </div>
          )}

          {/* Key Input */}
          <div className="space-y-2">
            <label className="block text-xs font-black text-slate-700 uppercase tracking-wider">
              1. Nhập Google Gemini API Key:
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => {
                setApiKey(e.target.value);
                setShowError(false);
              }}
              placeholder="Nhập API Key của con (AIzaSy...)"
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-semibold focus:outline-none focus:border-orange-500 focus:bg-white transition-colors"
            />
            {showError && (
              <p className="text-[10px] text-rose-500 font-extrabold flex items-center gap-1">
                <AlertCircle size={12} /> Vui lòng nhập API key để có thể học tập!
              </p>
            )}
            
            <p className="text-[10px] font-semibold text-slate-400 leading-normal">
              💡 Hướng dẫn: Con hãy truy cập trang web 
              <a
                href="https://aistudio.google.com/api-keys"
                target="_blank"
                rel="noreferrer"
                className="text-orange-500 font-black underline ml-1 hover:text-orange-600"
              >
                Google AI Studio (aistudio.google.com)
              </a> 
               để tạo một API key hoàn toàn MIỄN PHÍ nhé.
            </p>
          </div>

          {/* Model Selector Cards */}
          <div className="space-y-2">
            <label className="block text-xs font-black text-slate-700 uppercase tracking-wider">
              2. Chọn mô hình trí tuệ nhân tạo (AI Model):
            </label>
            
            <div className="space-y-2">
              {modelOptions.map((opt) => {
                const isSelected = model === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => setModel(opt.id)}
                    className={`w-full text-left p-3.5 rounded-2xl border-2 transition-all flex justify-between items-start gap-4 cursor-pointer select-none
                      ${isSelected
                        ? "bg-orange-50/50 border-orange-400 shadow-sm"
                        : "bg-white border-slate-100 hover:border-slate-200"
                      }`}
                  >
                    <div className="space-y-1">
                      <span className={`text-xs font-black block ${isSelected ? "text-orange-900" : "text-slate-800"}`}>
                        {opt.name}
                      </span>
                      <span className="text-[10px] text-slate-400 font-bold block leading-relaxed">
                        {opt.desc}
                      </span>
                    </div>

                    <span className={`px-2 py-0.5 rounded-md text-[9px] font-black shrink-0
                      ${isSelected
                        ? "bg-orange-500 text-white"
                        : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {opt.badge}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

        </div>

        {/* Footer controls */}
        <div className="bg-slate-50 border-t border-slate-100 p-3 sm:p-4 flex gap-3 shrink-0 w-full">
          {!isMandatory && (
            <button
              onClick={onClose}
              className="flex-1 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-black text-xs rounded-xl transition-colors cursor-pointer"
            >
              Hủy bỏ
            </button>
          )}
          <button
            onClick={handleSave}
            className="flex-1 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-black text-xs rounded-xl shadow-md transition-all active:scale-95 cursor-pointer"
          >
            Lưu cài đặt 💾
          </button>
        </div>

      </div>
    </div>
  );
};
