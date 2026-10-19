import { checkSentence, generateGrammar } from "../api.js";
import { mountFooter, mountNavbar } from "../components/navbar.js";
import { attachQuiz, escapeHtml, renderQuiz, showError, showLoading } from "../ui.js";

mountNavbar();
mountFooter();
const lookupPanel = document.querySelector("#lookup-panel");
const checkPanel = document.querySelector("#check-panel");

for (const [button, panel, otherButton, otherPanel] of [
  [document.querySelector("#lookup-tab"), lookupPanel, document.querySelector("#check-tab"), checkPanel],
  [document.querySelector("#check-tab"), checkPanel, document.querySelector("#lookup-tab"), lookupPanel],
]) {
  button.addEventListener("click", () => {
    button.classList.add("is-active");
    otherButton.classList.remove("is-active");
    button.setAttribute("aria-selected", "true");
    otherButton.setAttribute("aria-selected", "false");
    panel.hidden = false;
    otherPanel.hidden = true;
  });
}

document.querySelector("#grammar-search").addEventListener("submit", async (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const input = document.querySelector("#grammar-input");
  const result = document.querySelector("#grammar-result");
  const button = form.querySelector("button");
  button.disabled = true;
  showLoading(result, "Đang giải thích cấu trúc...");
  try {
    const data = await generateGrammar(input.value.trim());
    result.innerHTML = `<article class="result-card grammar-result">
      <span class="eyebrow">GRAMMAR NOTE</span><h2>${escapeHtml(data.title || input.value)}</h2>
      <div class="result-section"><h3>Công thức</h3><div class="formula-box">${escapeHtml(data.formula)}</div></div>
      <div class="result-section"><h3>Khi nào dùng</h3>${Array.isArray(data.uses) ? `<ul>${data.uses.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>` : `<p>${escapeHtml(data.uses)}</p>`}</div>
      <div class="result-section"><h3>Cách nói tự nhiên</h3><p>${escapeHtml(data.naturalUsage)}</p></div>
      <div class="result-section"><h3>So sánh dễ nhầm</h3><p>${escapeHtml(data.comparison)}</p></div>
      <div class="result-section"><h3>Lỗi thường gặp</h3>${Array.isArray(data.commonMistakes) ? `<ul>${data.commonMistakes.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>` : `<p>${escapeHtml(data.commonMistakes)}</p>`}</div>
      <div class="result-section"><h3>Mini quiz</h3><div id="grammar-quiz"></div></div>
    </article>`;
    const quiz = document.querySelector("#grammar-quiz");
    quiz.innerHTML = renderQuiz(data.questions, "grammar");
    attachQuiz(quiz);
  } catch (error) {
    showError(result, error);
  } finally {
    button.disabled = false;
  }
});

document.querySelector("#sentence-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const input = document.querySelector("#sentence-input");
  const result = document.querySelector("#sentence-result");
  const button = form.querySelector("button");
  button.disabled = true;
  showLoading(result, "Đang xem lại câu của bạn...");
  try {
    const data = await checkSentence(input.value.trim());
    result.innerHTML = `<article class="answer-card"><span class="eyebrow">A FRIENDLY REVIEW</span><h2>Câu gợi ý</h2><p class="feedback-original">${escapeHtml(data.original)}</p><p class="answer-correct">${escapeHtml(data.corrected)}</p><div class="result-section"><h3>Giải thích</h3><p>${escapeHtml(data.explanation)}</p></div><div class="result-section"><h3>Cách nói tự nhiên hơn</h3><p>${escapeHtml(data.naturalVersion)}</p></div></article>`;
  } catch (error) {
    showError(result, error);
  } finally {
    button.disabled = false;
  }
});
