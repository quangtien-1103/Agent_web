async function request(endpoint, payload) {
  let response;
  try {
    response = await fetch(`/api/${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch (error) {
    throw new Error("Không thể kết nối máy chủ. Hãy kiểm tra kết nối và thử lại.", { cause: error });
  }

  const contentType = response.headers.get("content-type") || "";
  let data;
  try {
    const body = await response.text();
    data = JSON.parse(body);
  } catch (error) {
    if (contentType.includes("text/html")) {
      throw new Error(`Endpoint /api/${endpoint} chưa được Vercel triển khai hoặc đang trả về trang HTML (${response.status}).`, { cause: error });
    }
    throw new Error(`Máy chủ trả về dữ liệu không hợp lệ (${response.status}).`, { cause: error });
  }
  if (!response.ok) throw new Error(data.error || `Yêu cầu thất bại (${response.status}).`);
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
