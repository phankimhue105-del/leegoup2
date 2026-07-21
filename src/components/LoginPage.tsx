import React, { useState } from "react";
import { Eye, EyeOff, Lock, User, AlertCircle, Sparkles, LogIn, Loader2 } from "lucide-react";
import { loginWithGoogleScript } from "../services/authService";

interface LoginPageProps {
  onLoginSuccess: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!username.trim() || !password) {
      setErrorMessage("Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu.");
      return;
    }

    setIsLoading(true);
    try {
      const result = await loginWithGoogleScript(username, password);
      if (result.success) {
        onLoginSuccess();
      } else {
        setErrorMessage(result.message || "Tên đăng nhập hoặc mật khẩu không đúng.");
      }
    } catch (err) {
      setErrorMessage("Lỗi hệ thống. Vui lòng thử lại sau.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-between items-center p-4 font-sans select-none relative overflow-hidden">
      {/* Decorative Background Effects */}
      <div className="absolute -top-20 -left-20 w-72 h-72 bg-red-200/50 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-red-300/40 rounded-full blur-3xl pointer-events-none" />

      {/* Top spacing */}
      <div className="w-full flex-1 flex flex-col items-center justify-center max-w-md my-8 relative z-10">
        
        {/* Header Branding Card */}
        <div className="text-center mb-6 space-y-3">
          {/* Logo Badge */}
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-gradient-to-tr from-red-600 to-red-500 text-white font-black text-4xl shadow-xl shadow-red-200 border-4 border-white transform hover:scale-105 transition-all">
            LG
          </div>

          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-100 text-red-700 font-extrabold text-xs rounded-full">
              <Sparkles size={14} className="text-red-600 animate-pulse" />
              <span>HỆ THỐNG HỌC TRỰC TUYẾN</span>
            </div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight">
              ANH NGỮ LEEGO
            </h1>
          </div>
        </div>

        {/* Login Form Container */}
        <div className="w-full bg-white rounded-3xl p-6 sm:p-8 shadow-xl border-2 border-red-100 relative">
          
          {/* Error Banner */}
          {errorMessage && (
            <div className="mb-5 bg-red-50 border-2 border-red-200 text-red-700 text-sm font-bold p-3.5 rounded-2xl flex items-center gap-3 animate-shake">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} autoComplete="off" className="space-y-5">
            {/* Username Input */}
            <div>
              <label htmlFor="leego_user_input" className="block text-xs font-black uppercase text-slate-600 mb-1.5">
                Tên đăng nhập
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User size={18} />
                </div>
                <input
                  id="leego_user_input"
                  name="leego_username_field"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Nhập tên đăng nhập"
                  disabled={isLoading}
                  autoComplete="off"
                  spellCheck={false}
                  autoCorrect="off"
                  autoCapitalize="none"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-2xl text-slate-800 font-bold placeholder-slate-400 focus:outline-none focus:border-red-500 focus:bg-white transition-all text-sm disabled:opacity-60"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label htmlFor="leego_pass_input" className="block text-xs font-black uppercase text-slate-600 mb-1.5">
                Mật khẩu
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock size={18} />
                </div>
                <input
                  id="leego_pass_input"
                  name="leego_password_field"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Nhập mật khẩu"
                  disabled={isLoading}
                  autoComplete="off"
                  spellCheck={false}
                  autoCorrect="off"
                  autoCapitalize="none"
                  className="w-full pl-10 pr-12 py-3 bg-slate-50 border-2 border-slate-200 rounded-2xl text-slate-800 font-bold placeholder-slate-400 focus:outline-none focus:border-red-500 focus:bg-white transition-all text-sm disabled:opacity-60"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label="Hiện / ẩn mật khẩu"
                  disabled={isLoading}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-red-500 transition-colors cursor-pointer disabled:opacity-60"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3.5 px-6 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white font-black rounded-2xl shadow-lg shadow-red-200 hover:shadow-red-300 transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer text-base disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  <span>ĐANG ĐĂNG NHẬP...</span>
                </>
              ) : (
                <>
                  <LogIn size={20} />
                  <span>ĐĂNG NHẬP</span>
                </>
              )}
            </button>
          </form>

        </div>

      </div>

      {/* Footer */}
      <footer className="w-full text-center text-xs text-slate-500 font-semibold py-4 space-y-1 relative z-10 border-t border-slate-200/60 mt-auto">
        <p className="font-bold text-slate-700">📍 Trung tâm Anh ngữ LeeGo - Hải Phòng</p>
        <p>Hotline: 0988 526 585</p>
        <p className="text-slate-400">© 2026 Anh ngữ LeeGo</p>
      </footer>
    </div>
  );
};
