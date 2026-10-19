const MAX_WORD_LENGTH = 100;
const DEFAULT_MODEL = "gemini-2.5-flash";
const PROMPT_TEXT = `Bạn là gia sư tiếng Anh cho người Việt. Tạo thẻ học từ vựng rõ ràng, chính xác, phù hợp với từ được hỏi. Nội dung giải thích bằng tiếng Việt; ví dụ dùng tiếng Anh tự nhiên.
Trả về đúng cấu trúc JSON:
{"word":"từ tiếng Anh","pronunciation":"IPA","partOfSpeech":"từ loại","translation":"nghĩa tiếng Việt","collocations":[{"phrase":"cụm từ tiếng Anh","translation":"nghĩa tiếng Việt của cả cụm từ"}],"context":"mô tả ngữ cảnh và mức độ trang trọng","examples":[{"sentence":"English example.","translation":"Bản dịch."}],"synonyms":[{"word":"từ gần nghĩa","difference":"khác biệt ngắn"}],"commonMistakes":["lỗi thường gặp"]}
Tạo 2-3 cụm từ và luôn dịch nghĩa tiếng Việt cho từng cụm từ, 3 ví dụ có bản dịch, 2 từ gần nghĩa. Không bịa từ không tồn tại. Chỉ trả về JSON hợp lệ, không dùng markdown.`;

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
        generationConfig: { responseMimeType: "application/json", temperature: 0.6 },
      }),
      signal: AbortSignal.timeout(45000),
    });
    const aiData = await aiResponse.json();
    if (!aiResponse.ok) {
      throw new Error(aiData.error?.message || `Gemini trả về lỗi ${aiResponse.status}.`);
    }
    const text = aiData.candidates?.[0]?.content?.parts?.map((part) => part.text || "").join("");
    return sendJson(response, 200, parseModelJson(text));
  } catch (error) {
    const status = Number.isInteger(error?.status) ? error.status : 500;
    return sendJson(response, status, {
      error: error.message || "Không thể tạo thẻ từ lúc này.",
    });
  }
}
