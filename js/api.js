const VOCABULARY_API_ORIGIN = "https://agentweb-chi.vercel.app";

async function request(endpoint, payload) {
  let response;
  try {
    const path = `/api/${endpoint}`;
    const url = endpoint === "vocabulary" ? `${VOCABULARY_API_ORIGIN}${path}` : path;
    response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch (error) {
    throw new Error("Không thể kết nối máy chủ. Hãy kiểm tra kết nối và thử lại.", { cause: error });
  }

  const contentType = response.headers.get("content-type") || "";
  const body = await response.text();
  let data;
  try {
    data = JSON.parse(body);
  } catch (error) {
    if (contentType.includes("text/html")) {
      const preview = body.replace(/\s+/g, " ").slice(0, 180);
      throw new Error(`API /api/${endpoint} trả về HTML thay vì JSON (${response.status}). ${preview}`, { cause: error });
    }
    throw new Error(`Máy chủ trả về dữ liệu không hợp lệ (${response.status}). ${body.slice(0, 180)}`, { cause: error });
  }
  if (!response.ok) throw new Error(data?.error || `Yêu cầu thất bại (${response.status}).`);
  return data;
}

export const generateWordCard = (word) => request("vocabulary", { word });
export const generateGrammar = (structure) => request("grammar", { structure });
export const checkSentence = (sentence) => request("grammar/check", { sentence });
export const generateReading = (level, topic) => request("reading", { level, topic });
export const continueSpeaking = (scenario, level, history, message) =>
  request("speaking", { scenario, level, history, message });
export const generateCourseStep = (week, step, approvedJson = {}) =>
  request("course/week", { week, step, approvedJson });
