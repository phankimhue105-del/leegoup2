const GOOGLE_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbzZY8aTVJoK9skLqOcJbQSuTGzCeSPCCj_DW1sdSVI-UkISa3TDVuHTTPvrpYAwIMetYw/exec";

export interface LoginResult {
  success: boolean;
  message?: string;
  studentName?: string;
}

export async function loginWithGoogleScript(username: string, password: string): Promise<LoginResult> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch(GOOGLE_SCRIPT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain;charset=utf-8",
      },
      body: JSON.stringify({
        action: "login",
        username: username.trim(),
        password: password,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      return {
        success: false,
        message: `Lỗi kết nối máy chủ (${response.status}). Vui lòng thử lại sau.`,
      };
    }

    let data: any;
    try {
      data = await response.json();
    } catch (parseErr) {
      return {
        success: false,
        message: "Dữ liệu phản hồi từ máy chủ không hợp lệ. Vui lòng thử lại.",
      };
    }

    if (data && data.success) {
      const studentName = data.studentName || data.student_name || data.name || username;
      localStorage.setItem("username", username.trim());
      localStorage.setItem("studentName", studentName);

      return {
        success: true,
        studentName: studentName,
      };
    } else {
      return {
        success: false,
        message: data?.message || "Tên đăng nhập hoặc mật khẩu không đúng.",
      };
    }
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error.name === "AbortError") {
      return {
        success: false,
        message: "Kết nối quá thời gian quy định (Timeout). Vui lòng thử lại.",
      };
    }
    return {
      success: false,
      message: "Lỗi kết nối mạng. Vui lòng kiểm tra đường truyền và thử lại.",
    };
  }
}

