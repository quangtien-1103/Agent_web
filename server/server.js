import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { getEnglishOneWeek } from "./courseData.js";

const SERVER_DIR = fileURLToPath(new URL(".", import.meta.url));
const ROOT_DIR = resolve(SERVER_DIR, "..");
const PORT = Number(process.env.PORT || 3000);
const HOST = process.env.HOST || "127.0.0.1";
const MAX_BODY_SIZE = 64 * 1024;

async function loadEnvironment() {
  try {
    const contents = await readFile(resolve(SERVER_DIR, ".env"), "utf8");
    for (const line of contents.split(/\r?\n/)) {
      const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/);
      if (match && process.env[match[1]] === undefined) {
        process.env[match[1]] = match[2].replace(/^(['"])(.*)\1$/, "$2");
      }
    }
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
}

function sendJson(response, status, value) {
  response.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
  });
  response.end(JSON.stringify(value));
}

async function readJson(request) {
  let body = "";
  for await (const chunk of request) {
    body += chunk;
    if (Buffer.byteLength(body) > MAX_BODY_SIZE) {
      const error = new Error("Yêu cầu vượt quá dung lượng cho phép.");
      error.status = 413;
      throw error;
    }
  }
  try {
    return JSON.parse(body);
  } catch (cause) {
    const error = new Error("Nội dung yêu cầu không phải JSON hợp lệ.", { cause });
    error.status = 400;
    throw error;
  }
}

function requiredText(value, name, maxLength = 200) {
  if (typeof value !== "string" || !value.trim()) {
    const error = new Error(`Vui lòng nhập ${name}.`);
    error.status = 400;
    throw error;
  }
  const normalized = value.trim();
  if (normalized.length > maxLength) {
    const error = new Error(`${name} không được dài quá ${maxLength} ký tự.`);
    error.status = 400;
    throw error;
  }
  return normalized;
}

function parseModelJson(text) {
  if (typeof text !== "string" || !text.trim()) throw new Error("Nhà cung cấp AI trả về nội dung rỗng.");
  const cleaned = text.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start < 0 || end <= start) throw new Error("Nhà cung cấp AI không trả về JSON hợp lệ.");
  try {
    const value = JSON.parse(cleaned.slice(start, end + 1));
    if (!value || Array.isArray(value) || typeof value !== "object") throw new Error();
    return value;
  } catch (cause) {
    throw new Error("Không thể đọc dữ liệu JSON do AI tạo.", { cause });
  }
}

async function getPrompt(filename) {
  return readFile(resolve(SERVER_DIR, "prompts", filename), "utf8");
}

async function generateJson(promptName, input) {
  const providerName = process.env.AI_PROVIDER || "gemini";
  const supportedProviders = new Set(["gemini", "groq", "claude"]);
  if (!supportedProviders.has(providerName)) throw new Error(`Nhà cung cấp AI không được hỗ trợ: ${providerName}`);
  const provider = await import(`./providers/${providerName}.js`);
  const prompt = await getPrompt(promptName);
  const text = await provider.generate(`${prompt}\n\nDỮ LIỆU NGƯỜI HỌC:\n${JSON.stringify(input)}\n\nChỉ trả về một đối tượng JSON hợp lệ, không dùng markdown.`);
  return parseModelJson(text);
}

async function generateCourseStep(weekNumber, step, approvedJson = {}) {
  const week = getEnglishOneWeek(weekNumber);
  const normalizedStep = String(step || "").toUpperCase();
  if (!week || !["A", "B", "C", "D", "E"].includes(normalizedStep)) {
    const error = new Error("Tuần hoặc lượt tạo nội dung không hợp lệ.");
    error.status = 400;
    throw error;
  }
  const master = await getPrompt("course/master.txt");
  const instruction = await getPrompt(`course/steps/${normalizedStep}.txt`);
  const schema = await getPrompt(`course/schemas/${normalizedStep}.txt`);
  const weekPrompt = week.week === 12 ? await getPrompt("course/week12.txt") : "";
  const template = master
    .replaceAll("{{level}}", week.level)
    .replaceAll("{{week}}", String(week.week))
    .replaceAll("{{topic}}", week.topic)
    .replaceAll("{{situations}}", week.situations)
    .replaceAll("{{grammar_points}}", week.grammarPoints)
    .replaceAll("{{reading_type}}", week.reading)
    .replaceAll("{{listening_type}}", week.listening)
    .replaceAll("{{output_task}}", week.outputTask)
    .replace("{{step_instruction}}", `${weekPrompt}\n${instruction}`)
    .replace("{{approved_json}}", JSON.stringify(approvedJson))
    .replace("{{json_schema}}", schema);
  const providerName = process.env.AI_PROVIDER || "gemini";
  if (!["gemini", "groq", "claude"].includes(providerName)) throw new Error(`Nhà cung cấp AI không được hỗ trợ: ${providerName}`);
  const provider = await import(`./providers/${providerName}.js`);
  return parseModelJson(await provider.generate(template));
}

async function handleApi(path, request, response) {
  const body = await readJson(request);
  let result;
  switch (path) {
    case "/api/vocabulary":
      result = await generateJson("vocabulary.txt", { word: requiredText(body.word, "từ cần tra", 100) });
      break;
    case "/api/grammar":
      result = await generateJson("grammar.txt", { task: "explain", structure: requiredText(body.structure, "cấu trúc ngữ pháp", 160) });
      break;
    case "/api/grammar/check":
      result = await generateJson("grammar.txt", { task: "check_sentence", sentence: requiredText(body.sentence, "câu cần kiểm tra", 1200) });
      break;
    case "/api/reading":
      result = await generateJson("reading.txt", {
        level: requiredText(body.level, "trình độ", 3),
        topic: requiredText(body.topic, "chủ đề", 100),
      });
      break;
    case "/api/speaking": {
      const history = Array.isArray(body.history) ? body.history.slice(-10).map((entry) => ({
        role: entry?.role === "assistant" ? "assistant" : "user",
        content: requiredText(entry?.content, "lịch sử hội thoại", 1000),
      })) : [];
      result = await generateJson("speaking.txt", {
        scenario: requiredText(body.scenario, "tình huống", 160),
        level: requiredText(body.level, "trình độ", 3),
        history,
        message: requiredText(body.message, "tin nhắn", 1000),
      });
      break;
    }
    case "/api/course/week":
      result = await generateCourseStep(
        body.week,
        requiredText(body.step, "lượt tạo nội dung", 1),
        body.approvedJson || {},
      );
      break;
    default:
      sendJson(response, 404, { error: "Không tìm thấy API này." });
      return;
  }
  sendJson(response, 200, result);
}

const contentTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8",
  ".webp": "image/webp",
};

async function serveStatic(path, response) {
  const pathname = decodeURIComponent(path === "/" ? "/index.html" : path);
  const pathParts = pathname.split(/[\\/]/);
  if (pathParts.some((part) => part.startsWith(".") || ["node_modules", ".venv"].includes(part))) {
    sendJson(response, 403, { error: "Không được phép truy cập tệp này." });
    return;
  }
  const filePath = resolve(ROOT_DIR, `.${pathname}`);
  if (filePath !== ROOT_DIR && !filePath.startsWith(`${ROOT_DIR}${sep}`)) {
    sendJson(response, 403, { error: "Không được phép truy cập tệp này." });
    return;
  }
  if (filePath.startsWith(`${resolve(ROOT_DIR, "server")}${sep}`)) {
    sendJson(response, 403, { error: "Không được phép truy cập tệp máy chủ." });
    return;
  }
  try {
    if (!(await stat(filePath)).isFile()) throw Object.assign(new Error("Not a file"), { code: "ENOENT" });
    const contents = await readFile(filePath);
    response.writeHead(200, {
      "Content-Type": contentTypes[extname(filePath)] || "application/octet-stream",
      "X-Content-Type-Options": "nosniff",
      "Referrer-Policy": "strict-origin-when-cross-origin",
    });
    response.end(contents);
  } catch (error) {
    if (error.code === "ENOENT" || error.code === "ENOTDIR") {
      response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      response.end("Không tìm thấy trang.");
      return;
    }
    throw error;
  }
}

await loadEnvironment();
const server = createServer(async (request, response) => {
  try {
    const url = new URL(request.url, `http://${request.headers.host || `${HOST}:${PORT}`}`);
    if (url.pathname.startsWith("/api/")) {
      if (request.method !== "POST") {
        sendJson(response, 405, { error: "API chỉ hỗ trợ phương thức POST." });
        return;
      }
      await handleApi(url.pathname, request, response);
      return;
    }
    if (request.method !== "GET" && request.method !== "HEAD") {
      sendJson(response, 405, { error: "Phương thức này không được hỗ trợ." });
      return;
    }
    if (request.method === "HEAD") {
      const headResponse = {
        writeHead: (status, headers) => response.writeHead(status, headers),
        end: () => response.end(),
      };
      await serveStatic(url.pathname, headResponse);
      return;
    }
    await serveStatic(url.pathname, response);
  } catch (error) {
    console.error("Request failed:", error);
    sendJson(response, error.status || (error.name === "AbortError" ? 504 : 502), {
      error: error.status ? error.message : `Không thể hoàn tất yêu cầu AI: ${error.message}`,
    });
  }
});

server.listen(PORT, HOST, () => {
  console.log(`English Web is ready at http://${HOST}:${PORT}`);
  console.log(`AI provider: ${process.env.AI_PROVIDER || "gemini"}`);
});
