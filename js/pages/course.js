import { generateCourseStep } from "../api.js";
import { mountFooter, mountNavbar } from "../components/navbar.js";
import { getCourseProgress, setCourseDayComplete } from "../storage.js";
import { escapeHtml, showToast } from "../ui.js";
import { speakEnglish } from "../audio.js";
import { getOfflineTopic } from "../offlineTopics.js";

mountNavbar();
mountFooter();

const weeks = [
  ["Everyday Conversations", "A1", "Chào hỏi, giới thiệu bản thân và nhờ giúp đỡ."],
  ["Family & Relationships", "A1-A2", "Nói về gia đình, bạn bè và những chuyện đã xảy ra."],
  ["Daily Routines", "A2", "Mô tả thói quen, lịch trình và thời gian trong ngày."],
  ["Food & Dining", "A2", "Gọi món, mô tả đồ ăn và thanh toán."],
  ["Travel & Transportation", "A2", "Đặt vé, hỏi đường và xử lý vấn đề khi đi du lịch."],
  ["Hobbies & Interests", "A2", "Nói về sở thích, lời mời và trải nghiệm."],
  ["Weather & Seasons", "A2-B1", "Nói về thời tiết, mùa và kế hoạch."],
  ["Education & Learning", "A2-B1", "Học tập, kỳ thi và chọn khóa học."],
  ["Health & Well-being", "B1", "Thói quen lành mạnh, cảm giác và lời khuyên."],
  ["Technology & Gadgets", "B1", "Thiết bị, ứng dụng và hỗ trợ kỹ thuật."],
  ["Environment & Nature", "B1", "Môi trường, thiên nhiên và hành động cộng đồng."],
  ["Review & Assessment", "A1-B1", "Ôn tập giãn cách và đánh giá toàn bộ khóa học."],
];

const dayLabels = [
  "Từ vựng phần 1",
  "Từ vựng phần 2 + ôn nhanh",
  "Ngữ pháp 1 + tạo câu",
  "Reading + câu hỏi",
  "Listening 1 + chép chính tả",
  "Ngữ pháp 2 + Listening 2",
  "Ôn tập + mini test + đầu ra",
];
const requestedWeek = Number(new URLSearchParams(location.search).get("week"));
let selectedWeek = requestedWeek >= 1 && requestedWeek <= 12 ? requestedWeek : null;
const generatedContent = {};
let offlineContent = null;

async function loadOfflineContent() {
  if (!selectedWeek) {
    offlineContent = null;
    renderDetail();
    return;
  }
  if (selectedWeek !== 1) {
    offlineContent = getOfflineTopic(selectedWeek);
    renderDetail();
    return;
  }
  try {
    const response = await fetch("offline.txt", { cache: "no-store" });
    if (!response.ok) throw new Error(`offline.txt (${response.status})`);
    offlineContent = await response.json();
    if (offlineContent.week !== 1) throw new Error("Nội dung offline không thuộc Tuần 1.");
    renderDetail();
  } catch (error) {
    console.warn("Không thể tải nội dung offline:", error);
  }
}

function renderOfflineContent(content) {
  const words = content.vocabulary?.core_words || [];
  const chunks = content.vocabulary?.chunks || [];
  const grammar = content.grammar?.points || [];
  const reading = content.reading?.main;
  const listening = content.listening?.scripts || [];
  const quiz = content.quiz?.mini_test || [];
  const goals = content.goals_vi || [];
  const grammarSource = content.grammar_source || "";
  const listeningSources = content.listening_sources || "";
  const outputTask = content.output_task || content.quiz?.output_task?.prompt_vi || "Hoàn thành bài nói hoặc bài viết theo chủ đề.";
  const dailyOfflinePlan = [
    "Học và nghe phát âm 10 từ đầu tiên.",
    "Ôn 10 từ còn lại và luyện các cụm từ.",
    "Học ngữ pháp, viết 5 câu áp dụng.",
    "Đọc bài Reading, gạch chân từ khóa và trả lời câu hỏi.",
    "Nghe bài Listening lần 1 để nắm ý chính.",
    "Nghe lại, chép chính tả và shadowing.",
    "Làm mini test và hoàn thành nhiệm vụ đầu ra.",
  ];
  const wordMarkup = words.map((item) => `<article class="offline-word">
    <div><strong>${escapeHtml(item.word)}</strong><span>${escapeHtml(item.ipa || "")} · ${escapeHtml(item.pos || "")}</span></div>
    <button class="audio-button" type="button" data-offline-speak="${escapeHtml(item.word)}" aria-label="Nghe ${escapeHtml(item.word)}">🔊</button>
    <p>${escapeHtml(item.meaning_vi)}</p>
    <small>${escapeHtml(item.examples?.[0]?.en || "")}</small>
  </article>`).join("");
  const chunkMarkup = chunks.map((item) => `<li><strong>${escapeHtml(item.phrase)}</strong> — ${escapeHtml(item.meaning_vi)}</li>`).join("");
  const formatFormula = (formula) => formula
    .replace(/:\s*/g, ":\n")
    .replace(/\.\s+(?=[A-Z])/g, ".\n")
    .replace(/\?\s+(?=[A-Z])/g, "?\n");
  const formatParagraph = (text) => text
    .replace(/:\s*/g, ":\n")
    .replace(/\.\s+(?=[A-ZÀ-Ỵ])/g, ".\n");
  const grammarMarkup = grammar.map((item) => `<article class="offline-grammar">
    <h4>${escapeHtml(item.name)}</h4>
    ${item.formula ? `<div class="offline-formula"><strong>Công thức</strong><div>${escapeHtml(formatFormula(item.formula)).replace(/\n/g, "<br>")}</div></div>` : ""}
    ${item.function_vi ? `<div class="offline-explanation"><strong>Giải thích</strong><p>${escapeHtml(formatParagraph(item.function_vi)).replace(/\n/g, "<br>")}</p></div>` : ""}
    ${Array.isArray(item.examples) && item.examples.length ? `<div class="offline-examples"><strong>Ví dụ</strong>${item.examples.map((example) => `<div><span>${escapeHtml(example.en || "")}</span><small>${escapeHtml(example.vi || "")}</small></div>`).join("")}</div>` : ""}
    ${Array.isArray(item.vn_mistakes) && item.vn_mistakes.length ? `<div class="offline-mistakes"><strong>Lỗi thường gặp</strong>${item.vn_mistakes.map((mistake) => `<div><del>${escapeHtml(mistake.wrong)}</del><b>${escapeHtml(mistake.right)}</b><small>${escapeHtml(mistake.why_vi)}</small></div>`).join("")}</div>` : ""}
  </article>`).join("");
  const readingMarkup = reading ? `<article class="offline-reading"><h4>${escapeHtml(reading.title)}</h4>${(reading.paragraphs || []).map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join("")}</article>` : "";
  const listeningMarkup = listening.map((script) => `<article class="offline-listening"><h4>${escapeHtml(script.title)}</h4><p>${escapeHtml(script.situation)}</p><div class="offline-lines">${(script.lines || []).map((line) => `<button type="button" class="offline-line" data-offline-speak="${escapeHtml(line.text)}"><span>${escapeHtml(line.speaker)}</span>${escapeHtml(line.text)} 🔊</button>`).join("")}</div></article>`).join("");
  const quizMarkup = quiz.map((item, index) => `<div class="offline-quiz-question"><p><strong>${index + 1}.</strong> ${escapeHtml(item.question)}</p>${(item.options || []).map((option, optionIndex) => `<label><input type="radio" name="offline-q-${index}" value="${optionIndex}"> ${escapeHtml(option)}</label>`).join("")}</div>`).join("");
  return `<section class="offline-content"><div class="offline-heading"><div><span class="eyebrow">OFFLINE CONTENT · TUẦN ${String(content.week).padStart(2, "0")}</span><h3>Học không cần gọi API</h3></div><span class="offline-badge">Đã tải trên máy</span></div>
    <p class="offline-intro">Nội dung cố định theo lộ trình: mục tiêu, từ khóa, ngữ pháp, reading, listening, mini test và đầu ra. Các nút 🔊 dùng giọng đọc tiếng Anh của trình duyệt.</p>
    <div class="offline-section"><h4>Mục tiêu đầu ra</h4><ul class="offline-goals">${goals.map((goal) => `<li>${escapeHtml(goal)}</li>`).join("")}</ul></div>
    <div class="offline-section"><h4>Từ vựng cốt lõi</h4><div class="offline-word-grid">${wordMarkup}</div></div>
    <div class="offline-section"><h4>Cụm từ giao tiếp</h4><ul class="offline-chunks">${chunkMarkup}</ul></div>
    <div class="offline-section"><h4>Ngữ pháp</h4><p class="offline-focus"><strong>Trọng tâm:</strong> ${escapeHtml(content.grammar_focus || "")}</p>${grammarMarkup}<p class="offline-source"><strong>Nguồn học:</strong> ${escapeHtml(grammarSource)}</p></div>
    <div class="offline-section"><h4>Reading</h4>${readingMarkup}</div>
    <div class="offline-section"><h4>Listening</h4>${listeningMarkup}<p class="offline-source"><strong>Nguồn luyện nghe:</strong> ${escapeHtml(listeningSources)}</p></div>
    <div class="offline-section"><h4>Lịch học 7 ngày</h4><ol class="offline-daily-plan">${dailyOfflinePlan.map((day) => `<li>${escapeHtml(day)}</li>`).join("")}</ol></div>
    <div class="offline-section"><h4>Nhiệm vụ đầu ra</h4><div class="offline-output">${escapeHtml(outputTask)}</div></div>
    <div class="offline-section"><h4>Mini test</h4><form class="offline-quiz" id="offline-quiz">${quizMarkup}<button class="button button-secondary" type="submit">Chấm bài offline</button><p class="offline-quiz-result" hidden></p></form></div>
  </section>`;
}

function attachOfflineInteractions() {
  document.querySelectorAll("[data-offline-speak]").forEach((button) => button.addEventListener("click", () => {
    if (!speakEnglish(button.dataset.offlineSpeak)) showToast("Trình duyệt này chưa hỗ trợ phát âm.");
  }));
  const quizForm = document.querySelector("#offline-quiz");
  if (!quizForm) return;
  quizForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const questions = offlineContent?.quiz?.mini_test || [];
    const correct = questions.reduce((total, question, index) => total + (Number(quizForm.querySelector(`input[name="offline-q-${index}"]:checked`)?.value) === question.answer_index ? 1 : 0), 0);
    const result = quizForm.querySelector(".offline-quiz-result");
    result.hidden = false;
    result.textContent = `Bạn đúng ${correct}/${questions.length} câu. ${correct === questions.length ? "Tuyệt vời!" : "Hãy xem lại phần giải thích và thử lại nhé."}`;
  });
}

function progress() {
  const data = getCourseProgress("english-1");
  const completed = Object.keys(data.completedDays).filter((key) => data.completedDays[key]);
  const completedWeeks = weeks.filter((_, index) => [1, 2, 3, 4, 5, 6, 7].every((day) => data.completedDays[`${index + 1}-${day}`])).length;
  document.querySelector("#course-progress-label").textContent = `${completedWeeks} / 12 tuần`;
  document.querySelector("#course-progress-bar").style.width = `${(completedWeeks / 12) * 100}%`;
  document.querySelector("#course-progress-caption").textContent = completed.length
    ? `Bạn đã hoàn thành ${completed.length} ngày học. Cứ giữ nhịp đều đặn nhé!`
    : "Bắt đầu từ Tuần 1 và học theo nhịp của bạn.";
}

function renderWeekList() {
  const data = getCourseProgress("english-1");
  document.querySelector("#week-list").innerHTML = weeks.map(([topic, level, description], index) => {
    const week = index + 1;
    const done = [1, 2, 3, 4, 5, 6, 7].every((day) => data.completedDays[`${week}-${day}`]);
    return `<button class="week-card ${week === selectedWeek ? "is-active" : ""}" type="button" data-week="${week}">
      <span class="week-number">${String(week).padStart(2, "0")}</span>
      <span><h3>${escapeHtml(topic)}</h3><p>${escapeHtml(description)}</p></span>
      <span class="week-card-meta"><strong>${escapeHtml(level)}</strong><span class="week-check">${done ? "✓" : "→"}</span></span>
    </button>`;
  }).join("");
  document.querySelectorAll("[data-week]").forEach((button) => button.addEventListener("click", () => {
    selectedWeek = Number(button.dataset.week);
    history.replaceState(null, "", `course.html?week=${selectedWeek}`);
    renderWeekList();
    document.querySelector("#week-detail").hidden = false;
    loadOfflineContent();
  }));
}

function renderDetail() {
  const courseLayout = document.querySelector(".course-layout");
  if (!selectedWeek) {
    courseLayout.classList.remove("is-detail");
    document.querySelector("#week-detail").hidden = true;
    document.querySelector("#week-detail").innerHTML = "";
    return;
  }
  const [topic, level, description] = weeks[selectedWeek - 1];
  const data = getCourseProgress("english-1");
  const checks = dayLabels.map((label, index) => {
    const day = index + 1;
    const checked = Boolean(data.completedDays[`${selectedWeek}-${day}`]);
    return `<label class="day-row ${checked ? "is-done" : ""}"><input type="checkbox" data-day="${day}" ${checked ? "checked" : ""}><strong>Ngày ${day}</strong><span>${escapeHtml(label)}</span></label>`;
  }).join("");
  const generated = generatedContent[selectedWeek] || {};
  const isOfflineWeek = Boolean(offlineContent);
  const stepButtons = ["A", "B", "C", "D", "E"].map((step, index) => {
    const previousReady = index === 0 || Boolean(generated[["A", "B", "C", "D"][index - 1]]);
    return `<button class="step-button ${generated[step] ? "is-done" : ""}" type="button" data-step="${step}" ${previousReady ? "" : "disabled"}>${step}${generated[step] ? " ✓" : ""}</button>`;
  }).join("");
  const nextStep = ["A", "B", "C", "D", "E"].find((step) => !generated[step]) || "E";
  document.querySelector("#week-detail").hidden = false;
  document.querySelector(".course-page").classList.toggle("study-view", Boolean(selectedWeek));
  courseLayout.classList.toggle("is-detail", isOfflineWeek);
  document.querySelector("#week-detail").innerHTML = `${isOfflineWeek ? '<button class="back-to-roadmap" type="button" id="back-to-roadmap">← Quay lại 12 chủ đề</button>' : ""}<span class="eyebrow">WEEK ${String(selectedWeek).padStart(2, "0")} · ${escapeHtml(level)}</span>
    <h2>${escapeHtml(topic)}</h2><p>${escapeHtml(description)}</p>
    <div class="detail-block"><h3>Khung học tuần này</h3><p>Từ vựng cốt lõi, 2 điểm ngữ pháp, bài đọc, 2 bài nghe, mini test và nhiệm vụ đầu ra.</p></div>
    <div class="detail-block"><h3>Lịch học 7 ngày</h3><div class="daily-plan">${checks}</div></div>
    <div class="detail-actions">${isOfflineWeek ? `<span class="offline-mode-note">✓ Tuần này đang dùng nội dung offline, không tiêu tốn API.</span>` : `<div class="step-buttons" aria-label="Các lượt tạo nội dung"><span>Lượt</span>${stepButtons}</div><button class="button button-primary" id="generate-week" type="button">Tạo lượt ${nextStep} <span aria-hidden="true">→</span></button>`}<a class="button button-secondary" href="vocabulary.html">Ôn từ trong sổ từ</a></div>
    <p class="ai-status" id="ai-status">${isOfflineWeek ? "Nội dung offline đã sẵn sàng trên thiết bị này." : "AI sẽ tạo từng lượt A-E theo prompt pack, bắt đầu từ từ vựng để bạn duyệt trước."}</p>
    ${isOfflineWeek ? renderOfflineContent(offlineContent) : ""}
    ${Object.keys(generated).length ? `<div class="generated-preview"><strong>Đã tạo: ${Object.keys(generated).join(", ")}</strong>${escapeHtml(generated[Object.keys(generated).at(-1)].summary)}</div>` : ""}`;
  document.querySelectorAll("[data-day]").forEach((checkbox) => checkbox.addEventListener("change", () => {
    setCourseDayComplete("english-1", selectedWeek, Number(checkbox.dataset.day), checkbox.checked);
    checkbox.closest(".day-row").classList.toggle("is-done", checkbox.checked);
    renderWeekList();
    progress();
  }));
  document.querySelectorAll("[data-step]").forEach((button) => button.addEventListener("click", () => generateStep(button.dataset.step)));
  document.querySelector("#generate-week")?.addEventListener("click", () => generateStep(nextStep));
  if (isOfflineWeek) attachOfflineInteractions();
  document.querySelector("#back-to-roadmap")?.addEventListener("click", () => {
    courseLayout.classList.remove("is-detail");
    history.replaceState(null, "", "course.html");
    selectedWeek = null;
    offlineContent = null;
    document.querySelector(".course-page").classList.remove("study-view");
    renderWeekList();
    renderDetail();
  });
}

async function generateStep(step) {
  const button = document.querySelector("#generate-week");
  const status = document.querySelector("#ai-status");
  button.disabled = true;
  status.textContent = `Đang tạo lượt ${step} theo prompt pack...`;
  try {
    const weekOutputs = generatedContent[selectedWeek] || {};
    const result = await generateCourseStep(selectedWeek, step, weekOutputs);
    const count = Array.isArray(result.core_words) ? result.core_words.length : 0;
    const summary = step === "A" && count
      ? `Đã tạo ${count} từ cốt lõi. Hãy kiểm tra nghĩa, collocation và ví dụ trước khi tạo lượt tiếp theo.`
      : `Đã tạo lượt ${step}. Hãy kiểm tra nội dung trước khi đánh dấu ngày học.`;
    generatedContent[selectedWeek] = { ...weekOutputs, [step]: { ...result, summary } };
    renderDetail();
    showToast(`Đã tạo lượt ${step} của tuần ${selectedWeek}.`);
  } catch (error) {
    status.textContent = error.message;
    showToast(error.message);
  } finally {
    if (document.querySelector("#generate-week")) document.querySelector("#generate-week").disabled = false;
  }
}

renderWeekList();
renderDetail();
progress();
loadOfflineContent();
