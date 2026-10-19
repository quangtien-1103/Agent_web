const MAX_WORD_LENGTH = 100;
const DEFAULT_MODEL = "gemini-3.8-flash";
export const config = { maxDuration: 60 };
const PROMPT_TEXT = `Tạo nhanh một thẻ học từ vựng Anh-Việt chính xác cho từ được hỏi. Giải thích bằng tiếng Việt, ví dụ bằng tiếng Anh tự nhiên.
Chỉ trả về JSON hợp lệ theo cấu trúc:
{"word":"...","pronunciation":"IPA","partOfSpeech":"...","translation":"...","collocations":[{"phrase":"...","translation":"..."}],"context":"...","examples":[{"sentence":"...","translation":"..."}],"synonyms":[{"word":"...","difference":"..."}],"commonMistakes":["..."]}
Yêu cầu: 2-3 collocations có bản dịch cả cụm, 3 examples có bản dịch, 2 synonyms. Không dùng markdown, không giải thích ngoài JSON.`;

function requiredWord(value) {
  if (typeof value !== "string" || !value.trim()) {
    const error = new Error("Vui lòng nhập từ cần tra.");
    error.status = 400;
    throw error;
  }
  const word = value.trim();
  if (word.length > MAX_WORD_LENGTH) {
    const error = new Error(`Từ cần tra không được dài quá ${MAX_WORD_LENGTH} ký tự.`);
    error.status = 400;
    throw error;
  }
  return word;
}

function parseModelJson(text) {
  if (typeof text !== "string" || !text.trim()) {
    throw new Error("Gemini không trả về nội dung.");
  }
  const cleaned = text.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start < 0 || end <= start) {
    throw new Error("Gemini không trả về JSON hợp lệ.");
  }
  try {
    const result = JSON.parse(cleaned.slice(start, end + 1));
    if (!result || Array.isArray(result) || typeof result !== "object") throw new Error();
    return result;
  } catch (cause) {
    throw new Error("Không thể đọc dữ liệu JSON do Gemini tạo.", { cause });
  }
}

function sendJson(response, status, value) {
  return response.status(status).json(value);
}

export default async function handler(request, response) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return sendJson(response, 405, { error: "Method not allowed." });
  }

  try {
    const word = requiredWord(request.body?.word);
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      const error = new Error("Chưa cấu hình GEMINI_API_KEY trên Vercel.");
      error.status = 500;
      throw error;
    }

    const model = process.env.AI_MODEL || DEFAULT_MODEL;
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;
    const aiResponse = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: `${PROMPT_TEXT}\n\nTỪ CẦN TRA:\n${JSON.stringify({ word })}` }] }],
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.2,
          maxOutputTokens: 900,
        },
      }),
      signal: AbortSignal.timeout(50000),
    });
    const aiData = await aiResponse.json();
    if (!aiResponse.ok) {
      const error = new Error(aiData.error?.message || `Gemini trả về lỗi ${aiResponse.status}.`);
      error.status = aiResponse.status;
      const retryAfter = aiData.error?.details?.find((detail) => detail.retryDelay)?.retryDelay;
      if (aiResponse.status === 429) {
        error.message = retryAfter
          ? `Gemini đã hết quota miễn phí. Hãy thử lại sau khoảng ${retryAfter}.`
          : "Gemini đã hết quota miễn phí. Hãy thử lại sau hoặc kiểm tra gói và billing.";
        if (retryAfter) response.setHeader("Retry-After", retryAfter.replace("s", ""));
      }
      throw error;
    }
    const text = aiData.candidates?.[0]?.content?.parts?.map((part) => part.text || "").join("");
    response.setHeader("Cache-Control", "private, max-age=300");
    return sendJson(response, 200, parseModelJson(text));
  } catch (error) {
    if (error?.name === "TimeoutError" || error?.name === "AbortError") {
      error = new Error("Gemini phản hồi quá lâu. Hãy thử lại sau vài giây hoặc kiểm tra model/API key trên Vercel.");
    }
    const status = Number.isInteger(error?.status) ? error.status : 500;
    return sendJson(response, status, {
      error: error.message || "Không thể tạo thẻ từ lúc này.",
    });
  }
}
