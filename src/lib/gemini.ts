/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export const FALLBACK_MODELS = [
  "gemini-3-flash-preview",
  "gemini-3-pro-preview",
  "gemini-2.5-flash"
];

// Map UI model configurations to active Google AI Studio model names
function mapModelToApiName(model: string): string {
  switch (model) {
    case "gemini-3-flash-preview":
      return "gemini-1.5-flash"; // High-speed, highly available
    case "gemini-3-pro-preview":
      return "gemini-1.5-pro"; // Highly analytical, detailed
    case "gemini-2.5-flash":
      return "gemini-1.5-flash"; // Stable fallback
    default:
      return "gemini-1.5-flash";
  }
}

export async function evaluateSpeakingWithFallback(
  dialogue: { question: string; answer: string }[],
  characterName: string,
  unitTitle: string,
  apiKey: string,
  preferredModel: string
): Promise<any> {
  const dialogueText = dialogue
    .map((item, idx) => `Q${idx + 1}: ${item.question}\nA${idx + 1}: ${item.answer}`)
    .join("\n");

  const promptText = `
Evaluate this student's English speaking dialogue with character "${characterName}" for the unit "${unitTitle}".
The dialogue is a series of questions and the student's responses:
${dialogueText}

Provide evaluation feedback for this 6-11 year old kid. Make sure the advice is sweet, encouraging, and written in Vietnamese.
Respond ONLY with a JSON object. No extra text or markdown formatting.
JSON schema:
{
  "score": number (0-100),
  "pronunciation": "Excellent" | "Good" | "Needs Practice",
  "vocabulary": "Mastered" | "Review needed",
  "grammar": "Correct" | "Fix: [short correction]",
  "advice": "Encouraging 1-2 sentences in Vietnamese for the student, call them 'con' and yourself 'Thầy/Cô LeeGo'"
}
`;

  // Map model inputs to valid developer names
  const apiPreferredModel = mapModelToApiName(preferredModel);
  const apiFallbackModels = ["gemini-1.5-flash", "gemini-2.0-flash", "gemini-1.5-pro"];

  // Deduplicate and prioritize preferred model API mapping
  const modelsToTry = [
    apiPreferredModel,
    ...apiFallbackModels.filter((m) => m !== apiPreferredModel)
  ];
  
  let lastError = "";

  for (const model of modelsToTry) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            contents: [
              {
                role: "user",
                parts: [{ text: promptText }]
              }
            ],
            generationConfig: {
              responseMimeType: "application/json",
              temperature: 0.1,
              maxOutputTokens: 300,
              responseSchema: {
                type: "OBJECT",
                properties: {
                  score: { type: "INTEGER", description: "Score from 0 to 100" },
                  pronunciation: { type: "STRING", description: "Excellent, Good, or Needs Practice" },
                  vocabulary: { type: "STRING", description: "Mastered or Review needed" },
                  grammar: { type: "STRING", description: "Correct or Fix: explanation" },
                  advice: { type: "STRING", description: "Advice in Vietnamese" }
                },
                required: ["score", "pronunciation", "vocabulary", "grammar", "advice"]
              }
            }
          })
        }
      );

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error?.message || `HTTP ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) {
        throw new Error("Empty response from Google AI");
      }

      return JSON.parse(text);
    } catch (err: any) {
      console.warn(`Gemini Model failover: ${model} failed, trying next. Error:`, err);
      lastError = err.message || String(err);
    }
  }

  throw new Error(`Đã thử tất cả các model nhưng đều gặp lỗi. Chi tiết lỗi cuối cùng: ${lastError}`);
}

export interface GeminiErrorDetails {
  type: "INVALID_KEY" | "QUOTA_EXCEEDED" | "MODEL_DEPRECATED" | "NO_INTERNET" | "TIMEOUT" | "UNKNOWN";
  message: string;
  advice: string;
}

export function classifyGeminiError(error: any): GeminiErrorDetails {
  if (typeof window !== "undefined" && !window.navigator.onLine) {
    return {
      type: "NO_INTERNET",
      message: "Không có kết nối Internet (Offline).",
      advice: "Con hãy kiểm tra lại kết nối Wifi hoặc mạng dây của thiết bị và thử lại nhé!"
    };
  }

  const errMsg = error.message || String(error);
  const errMsgLower = errMsg.toLowerCase();

  if (errMsgLower.includes("timeout") || errMsgLower.includes("abort") || errMsgLower.includes("deadline exceeded")) {
    return {
      type: "TIMEOUT",
      message: "Yêu cầu quá hạn (Google API Timeout).",
      advice: "Đường truyền tới Google đang bị nghẽn. Con hãy thử bấm nút 'Thử lại chấm điểm' xem sao nhé!"
    };
  }

  if (
    errMsgLower.includes("api_key_invalid") || 
    errMsgLower.includes("invalid api key") || 
    errMsgLower.includes("api key not valid") ||
    errMsgLower.includes("key not found") ||
    (errMsgLower.includes("aiza") && errMsgLower.includes("not found"))
  ) {
    return {
      type: "INVALID_KEY",
      message: "API Key không hợp lệ hoặc đã nhập sai.",
      advice: "Con hãy nhấp vào nút '⚙️ Cài đặt AI Key' ở trên Header để kiểm tra và nhập lại API Key chuẩn nhé (thường bắt đầu bằng AIzaSy)."
    };
  }

  if (
    errMsgLower.includes("429") || 
    errMsgLower.includes("quota") || 
    errMsgLower.includes("limit") || 
    errMsgLower.includes("exhausted") ||
    errMsgLower.includes("too many requests")
  ) {
    return {
      type: "QUOTA_EXCEEDED",
      message: "API Key hết hạn mức sử dụng (Quota Exceeded / Rate Limit).",
      advice: "API Key miễn phí của con bị giới hạn số lần gọi trong phút. Con vui lòng chờ 1 phút rồi bấm 'Thử lại chấm điểm' nha!"
    };
  }

  if (
    errMsgLower.includes("gemini-2.5-flash") ||
    errMsgLower.includes("gemini-3-") ||
    (errMsgLower.includes("model") && (
      errMsgLower.includes("not found") || 
      errMsgLower.includes("not available") || 
      errMsgLower.includes("deprecated") || 
      errMsgLower.includes("no longer available") || 
      errMsgLower.includes("obsolete")
    ))
  ) {
    return {
      type: "MODEL_DEPRECATED",
      message: "Mô hình AI này không còn được Google hỗ trợ (Model Deprecated).",
      advice: "Mô hình này đã bị Google gỡ bỏ hoặc thay thế. Hệ thống đã tự động chuyển hướng sang các model dự phòng mới nhất. Con hãy bấm 'Thử lại chấm điểm' nhé!"
    };
  }

  if (errMsgLower.includes("failed to fetch") || errMsgLower.includes("network error")) {
    return {
      type: "NO_INTERNET",
      message: "Lỗi kết nối mạng (Failed to fetch).",
      advice: "Không thể kết nối đến máy chủ Google AI Studio. Vui lòng kiểm tra lại kết nối mạng Internet hoặc tắt VPN/tường lửa nếu có."
    };
  }

  return {
    type: "UNKNOWN",
    message: errMsg,
    advice: "Đã xảy ra lỗi không xác định từ Gemini API. Con hãy thử lại hoặc kiểm tra lại API Key nhé!"
  };
}
