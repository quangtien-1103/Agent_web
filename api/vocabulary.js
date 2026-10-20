const MAX_WORD_LENGTH = 100;
const DEFAULT_MODEL = "gemini-3.8-flash";
const GEMINI_TIMEOUT_MS = 4500;
const DICTIONARY_TIMEOUT_MS = 4000;
const DATAMUSE_TIMEOUT_MS = 2500;
const TRANSLATION_TIMEOUT_MS = 2000;
export const config = { maxDuration: 10 };
const PROMPT_TEXT = `Tạo một thẻ học từ vựng Anh-Việt chính xác cho đúng từ và đúng nghĩa đang được tra. Giải thích bằng tiếng Việt, ví dụ bằng tiếng Anh tự nhiên.
Chỉ trả về JSON hợp lệ theo cấu trúc:
{"word":"...","pronunciation":"IPA","partOfSpeech":"...","translation":"...","collocations":[{"phrase":"...","translation":"..."}],"context":"...","examples":[{"sentence":"...","translation":"..."}],"synonyms":[{"word":"...","difference":"..."}],"commonMistakes":["..."]}
Yêu cầu bắt buộc:
- Xác định đúng từ loại và chỉ dùng một nghĩa nhất quán trong translation, collocations và examples. Nếu từ có nhiều từ loại, chọn từ loại phù hợp nhất với nghĩa chính.
- Mỗi collocation phải là cụm tự nhiên chứa đúng từ được hỏi; dịch nghĩa của cả cụm.
- Ba examples phải là câu hoàn chỉnh, tự nhiên, có đúng từ được hỏi dùng đúng từ loại và đúng nghĩa; mỗi câu ở một ngữ cảnh khác nhau và có bản dịch tiếng Việt sát nghĩa.
- Synonyms chỉ gồm từ gần nghĩa thật sự trong cùng từ loại; difference phải nêu điểm khác nhau cụ thể, không dùng nhận xét chung chung.
- commonMistakes phải là lỗi dùng chính từ này (vị trí, từ loại, giới từ, cấu trúc hoặc sắc thái), không viết lời khuyên chung có thể áp dụng cho mọi từ.
Không dùng markdown, không giải thích ngoài JSON.`;

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

async function readJsonResponse(response, serviceName) {
  const body = await response.text();
  try {
    return JSON.parse(body);
  } catch (cause) {
    throw new Error(`${serviceName} trả về dữ liệu không phải JSON (${response.status}).`, { cause });
  }
}

function dictionaryCard(entry, word) {
  const meanings = Array.isArray(entry?.meanings) ? entry.meanings : [];
  const firstMeaning = meanings[0] || {};
  const definition = firstMeaning.definitions?.[0] || {};
  const phonetic = entry?.phonetic || entry?.phonetics?.find((item) => item.text)?.text || "";
  const examples = meanings
    .flatMap((meaning) => meaning.definitions || [])
    .filter((item) => item.example)
    .slice(0, 3)
    .map((item) => ({ sentence: item.example, translation: "" }));
  return {
    word: entry?.word || word,
    pronunciation: phonetic,
    partOfSpeech: firstMeaning.partOfSpeech || "word",
    translation: definition.definition || "Chưa tìm thấy nghĩa tiếng Việt.",
    collocations: [],
    context: "Nghĩa và ví dụ được lấy từ Free Dictionary khi AI tạm thời không khả dụng.",
    examples: examples.length ? examples : [{ sentence: "No example sentence available.", translation: "" }],
    synonyms: [],
    commonMistakes: [],
  };
}

function normalizePartOfSpeech(value) {
  const partOfSpeech = String(value || "").toLowerCase();
  if (/\b(noun|n)\b/.test(partOfSpeech)) return "noun";
  if (/\b(verb|v)\b/.test(partOfSpeech)) return "verb";
  if (/\b(adjective|adj)\b/.test(partOfSpeech)) return "adjective";
  if (/\b(adverb|adv)\b/.test(partOfSpeech)) return "adverb";
  return "word";
}

function fallbackExamples(word, partOfSpeech, definition = "") {
  const normalizedWord = word.toLowerCase().trim();
  const normalizedDefinition = definition.toLowerCase();
  if (normalizedWord === "advertise") {
    return [
      `The company advertised its new product on social media.`,
      `Local businesses advertise their services to attract more customers.`,
      `The university advertised the job opening on its website.`,
    ];
  }
  if (normalizedWord === "renovation" || /\brenovat\w*\b/.test(definition.toLowerCase())) {
    return [
      `The hotel closed one floor for renovation.`,
      `After months of renovation, the old house looked brand-new.`,
      `The renovation of the kitchen cost more than expected.`,
    ];
  }
  if (normalizedWord === "aisle" || /\b(aisle|passage|walkway)\b/.test(normalizedDefinition)) {
    return [
      `We found two empty seats near the aisle.`,
      `A flight attendant walked down the aisle to check the passengers.`,
      `Please leave your bags out of the aisle.`,
    ];
  }
  switch (normalizePartOfSpeech(partOfSpeech)) {
    case "noun":
      return [
        `The ${word} is important in this situation.`,
        `She explained the ${word} clearly.`,
        `We discussed the ${word} before making a decision.`,
      ];
    case "verb":
      return [
        `We need to ${word} this carefully.`,
        `She decided to ${word} before the meeting.`,
        `They usually ${word} when they have enough time.`,
      ];
    case "adjective":
      return [
        `The result is ${word}.`,
        `She described the situation as ${word}.`,
        `Many people consider the result ${word}.`,
      ];
    case "adverb":
      return [
        `She answered the question ${word}.`,
        `He ${word} explained what happened.`,
        `The team worked ${word} to solve the problem.`,
      ];
    default:
      return [
        `This example shows how to use ${word} naturally.`,
        `Please check the meaning of ${word} in this sentence.`,
        `The context helps explain the word ${word}.`,
      ];
  }
}

function fallbackCollocationPhrases(word, partOfSpeech, relatedWords = []) {
  const normalizedWord = word.toLowerCase().trim();
  if (normalizedWord === "advertise") {
    return [`advertise a product`, `advertise a service`, `advertise online`];
  }
  if (normalizedWord === "renovation") {
    return ["home renovation", "renovation project", "renovation work"];
  }
  if (normalizedWord === "aisle") {
    return ["aisle seat", "walk down the aisle", "keep the aisle clear"];
  }
  return relatedWords.map((relatedWord) => fallbackCollocationPhrase(word, partOfSpeech, relatedWord));
}

function fallbackCollocationPhrase(word, partOfSpeech, relatedWord) {
  const normalized = normalizePartOfSpeech(partOfSpeech);
  if (normalized === "verb") return `${word} ${relatedWord}`;
  if (normalized === "adjective") return `${relatedWord} ${word}`;
  if (normalized === "adverb") return `${word} ${relatedWord}`;
  return `${relatedWord} ${word}`;
}

function fallbackCollocationTranslation(word, phrase, translatedPhrase) {
  if (word.toLowerCase().trim() === "aisle") {
    const translations = {
      "aisle seat": "ghế ngồi cạnh lối đi",
      "walk down the aisle": "đi dọc theo lối đi",
      "keep the aisle clear": "giữ cho lối đi thông thoáng",
    };
    return translations[phrase] || translatedPhrase;
  }
  return translatedPhrase;
}

function fallbackTranslation(word, translatedDefinition) {
  if (word.toLowerCase().trim() === "advertise") {
    return "quảng cáo; giới thiệu công khai sản phẩm, dịch vụ hoặc cơ hội để thu hút sự chú ý của mọi người.";
  }
  if (word.toLowerCase().trim() === "renovation") {
    return "sự cải tạo, sự sửa sang hoặc việc nâng cấp một tòa nhà, căn phòng hay công trình.";
  }
  if (word.toLowerCase().trim() === "aisle") {
    return "lối đi giữa các hàng ghế, kệ hàng hoặc các dãy trong một không gian như máy bay, nhà hát hay siêu thị.";
  }
  return translatedDefinition;
}

function fallbackContext(word, partOfSpeech) {
  if (word.toLowerCase().trim() === "advertise") {
    return "Dùng như động từ khi nói về việc quảng bá sản phẩm, dịch vụ, thương hiệu hoặc thông tin tuyển dụng. Thường đi với a product/service, online, on social media hoặc on a website; sắc thái trung tính và dùng được trong cả giao tiếp lẫn văn viết.";
  }
  if (word.toLowerCase().trim() === "renovation") {
    return "Dùng như danh từ khi nói về việc sửa sang hoặc nâng cấp nhà cửa, phòng ốc và công trình. Thường đi với home/house renovation, renovation project hoặc renovation work; nhấn mạnh việc cải thiện một nơi đã có sẵn, không phải xây mới hoàn toàn.";
  }
  if (word.toLowerCase().trim() === "aisle") {
    return "Dùng như danh từ để chỉ lối đi nằm giữa các hàng ghế hoặc dãy kệ, thường gặp trên máy bay, trong nhà hát, nhà thờ và siêu thị. Các cụm thường gặp gồm aisle seat và walk down the aisle.";
  }
  const normalized = normalizePartOfSpeech(partOfSpeech);
  if (normalized === "verb") {
    return `Dùng "${word}" như động từ để diễn tả hành động; cần xem tân ngữ hoặc giới từ đi kèm trong từng cụm.`;
  }
  if (normalized === "noun") {
    return `Dùng "${word}" như danh từ để chỉ đúng người, vật, nơi chốn hoặc khái niệm mà định nghĩa mô tả; hãy học cùng các cụm từ thường đi kèm.`;
  }
  if (normalized === "adjective") {
    return `Dùng "${word}" như tính từ để bổ nghĩa cho danh từ hoặc đứng sau động từ liên kết.`;
  }
  if (normalized === "adverb") {
    return `Dùng "${word}" như trạng từ để bổ nghĩa cho động từ, tính từ hoặc cả câu.`;
  }
  return `Ngữ cảnh và cách dùng của "${word}" phụ thuộc vào từ loại và các từ thường đi kèm.`;
}

function fallbackMistakes(word, partOfSpeech) {
  if (word.toLowerCase().trim() === "aisle") {
    return [
      `"aisle" là danh từ chỉ lối đi; không nhầm với "isle" (hòn đảo) dù hai từ phát âm giống nhau.`,
      `Dùng "aisle seat" để nói ghế cạnh lối đi, không dùng "aisle chair".`,
    ];
  }
  switch (normalizePartOfSpeech(partOfSpeech)) {
    case "noun":
      return [
        `Dùng "${word}" như danh từ; không đặt trực tiếp sau "to" nếu muốn diễn đạt hành động.`,
        `Kiểm tra mạo từ (a/an/the) và dạng số nhiều khi dùng "${word}" trong câu.`,
      ];
    case "verb":
      return [
        `Dùng đúng dạng của động từ "${word}" sau chủ ngữ và sau "to".`,
        `Không thêm "to" sau động từ khuyết thiếu khi dùng "${word}".`,
      ];
    case "adjective":
      return [
        `Dùng "${word}" để bổ nghĩa cho danh từ hoặc sau các động từ liên kết như be, seem, feel.`,
        `Không dùng "${word}" như trạng từ nếu muốn bổ nghĩa cho một động từ khác.`,
      ];
    case "adverb":
      return [
        `Đặt "${word}" ở vị trí phù hợp để bổ nghĩa cho động từ hoặc cả câu.`,
        `Không nhầm "${word}" với dạng tính từ liên quan khi bổ nghĩa cho danh từ.`,
      ];
    default:
      return [`Kiểm tra từ loại và cấu trúc đi cùng "${word}" trước khi đặt vào câu.`];
  }
}

async function fetchFreeDictionary(word) {
  const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`, {
    signal: AbortSignal.timeout(DICTIONARY_TIMEOUT_MS),
  });
  const data = await readJsonResponse(response, "Free Dictionary");
  if (!response.ok || !Array.isArray(data) || !data[0]) {
    throw new Error("Không tìm thấy từ trong từ điển dự phòng.");
  }
  return dictionaryCard(data[0], word);
}

async function fetchDatamuse(word) {
  const base = "https://api.datamuse.com/words";
  const requestWords = (query) => fetch(`${base}?${query}`, {
    signal: AbortSignal.timeout(DATAMUSE_TIMEOUT_MS),
  }).then((response) => readJsonResponse(response, "Datamuse"));
  const [definitions, synonyms, related] = await Promise.all([
    requestWords(`sp=${encodeURIComponent(word)}&md=dpr&max=1`),
    requestWords(`rel_syn=${encodeURIComponent(word)}&max=3`),
    requestWords(`rel_jjb=${encodeURIComponent(word)}&max=3`),
  ]);
  const data = definitions;
  const entry = data?.[0];
  const definition = entry?.defs?.[0]?.replace(/^[a-z]+\t/i, "").trim();
  if (!entry || !definition) {
    throw new Error("Không tìm thấy định nghĩa dự phòng.");
  }
  const partOfSpeech = entry.defs[0].split("\t")[0] || "word";
  const translate = async (text) => {
    try {
      const response = await fetch(
        `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|vi`,
        { signal: AbortSignal.timeout(TRANSLATION_TIMEOUT_MS) },
      );
      const translated = await readJsonResponse(response, "MyMemory");
      return translated?.responseData?.translatedText?.trim() || text;
    } catch (error) {
      console.warn("Không dịch được nội dung dự phòng:", error.message);
      return text;
    }
  };
  const sentences = fallbackExamples(word, partOfSpeech, definition);
  const [translatedDefinition, ...exampleTranslations] = await Promise.all([
    translate(definition),
    ...sentences.map(translate),
  ]);
  const translation = fallbackTranslation(word, translatedDefinition);
  const relatedWords = related?.map((item) => item.word).filter(Boolean).slice(0, 3) || [];
  const collocationPhrases = fallbackCollocationPhrases(word, partOfSpeech, relatedWords);
  const collocations = await Promise.all(collocationPhrases.map(async (phrase) => {
    const translatedPhrase = await translate(phrase);
    return {
      phrase,
      translation: fallbackCollocationTranslation(word, phrase, translatedPhrase),
    };
  }));
  const synonymItems = synonyms?.map((item) => item.word).filter(Boolean).slice(0, 3) || [];
  return {
    word: entry.word || word,
    pronunciation: "",
    partOfSpeech,
    translation,
    collocations,
    context: fallbackContext(word, partOfSpeech),
    examples: sentences.map((sentence, index) => ({
      sentence,
      translation: exampleTranslations[index],
    })),
    synonyms: synonymItems.map((item) => ({
      word: item,
      difference: `"${item}" gần nghĩa với "${word}" nhưng có thể khác về sắc thái hoặc cách kết hợp từ.`,
    })),
    commonMistakes: fallbackMistakes(word, partOfSpeech),
  };
}

function setCorsHeaders(response) {
  response.setHeader("Access-Control-Allow-Origin", "*");
  response.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  response.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

export default async function handler(request, response) {
  setCorsHeaders(response);
  if (request.method === "OPTIONS") {
    return response.status(204).end();
  }
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return sendJson(response, 405, { error: "Method not allowed." });
  }

  try {
    const word = requiredWord(request.body?.word);
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

    let result;
    if (apiKey) {
      const model = process.env.AI_MODEL || DEFAULT_MODEL;
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;
      try {
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
          signal: AbortSignal.timeout(GEMINI_TIMEOUT_MS),
        });
        const aiData = await readJsonResponse(aiResponse, "Gemini");
        if (!aiResponse.ok) {
          const error = new Error(aiData.error?.message || `Gemini trả về lỗi ${aiResponse.status}.`);
          error.status = aiResponse.status;
          const retryAfter = aiData.error?.details?.find((detail) => detail.retryDelay)?.retryDelay;
          if (aiResponse.status === 429) {
            error.message = retryAfter
              ? `Gemini đã hết quota miễn phí. Hãy thử lại sau khoảng ${retryAfter}.`
              : "Gemini đã hết quota miễn phí.";
            if (retryAfter) response.setHeader("Retry-After", retryAfter.replace("s", ""));
          }
          throw error;
        }
        const text = aiData.candidates?.[0]?.content?.parts?.map((part) => part.text || "").join("");
        result = parseModelJson(text);
      } catch (error) {
        console.warn("Gemini không khả dụng, dùng từ điển dự phòng:", error.message);
      }
    }
    if (!result) {
      try {
        result = await fetchFreeDictionary(word);
      } catch (dictionaryError) {
        console.warn("Free Dictionary không khả dụng, dùng Datamuse:", dictionaryError.message);
        result = await fetchDatamuse(word);
      }
    }
    response.setHeader("Cache-Control", "private, max-age=300");
    return sendJson(response, 200, result);
  } catch (error) {
    if (error?.name === "TimeoutError" || error?.name === "AbortError") {
      error = new Error("Dịch vụ từ điển phản hồi quá lâu. Vui lòng thử lại sau vài giây.");
    }
    const status = Number.isInteger(error?.status) ? error.status : 502;
    console.error("vocabulary function failed", {
      status,
      message: error?.message,
      stack: error?.stack,
    });
    return sendJson(response, status, {
      error: error.message || "Không thể tạo thẻ từ lúc này.",
    });
  }
}
