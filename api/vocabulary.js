import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { generate as generateWithGemini } from "../server/providers/gemini.js";

const API_DIR = fileURLToPath(new URL(".", import.meta.url));
const PROMPT_PATH = resolve(API_DIR, "..", "server", "prompts", "vocabulary.txt");
const MAX_WORD_LENGTH = 100;

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
    throw new Error("Nhà cung cấp AI trả về nội dung rỗng.");
  }
  const cleaned = text.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start < 0 || end <= start) {
    throw new Error("Nhà cung cấp AI không trả về JSON hợp lệ.");
  }
  try {
    const result = JSON.parse(cleaned.slice(start, end + 1));
    if (!result || Array.isArray(result) || typeof result !== "object") throw new Error();
    return result;
  } catch (cause) {
    throw new Error("Không thể đọc dữ liệu JSON do AI tạo.", { cause });
  }
}

function sendJson(response, status, value) {
  response.status(status).json(value);
}

export default async function handler(request, response) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return sendJson(response, 405, { error: "Method not allowed." });
  }

  try {
    const word = requiredWord(request.body?.word);
    const prompt = await readFile(PROMPT_PATH, "utf8");
    const input = `${prompt}\n\nDỮ LIỆU NGƯỜI HỌC:\n${JSON.stringify({ word })}\n\nChỉ trả về một đối tượng JSON hợp lệ, không dùng markdown.`;
    const text = await generateWithGemini(input);
    return sendJson(response, 200, parseModelJson(text));
  } catch (error) {
    const status = Number.isInteger(error?.status) ? error.status : 500;
    return sendJson(response, status, {
      error: status === 500 ? "Không thể tạo thẻ từ lúc này." : error.message,
    });
  }
}
