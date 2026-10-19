import { generateReading, generateWordCard } from "../api.js";
import { mountFooter, mountNavbar } from "../components/navbar.js";
import { getLearningData, recordLookup, saveWord } from "../storage.js";
import { attachQuiz, escapeHtml, renderQuiz, showError, showLoading, showToast } from "../ui.js";

mountNavbar();
mountFooter();
const result = document.querySelector("#reading-result");
const popover = document.querySelector("#word-popover");
let activeWord = "";

function markWords(paragraph) {
  return paragraph.split(/(\b[\p{L}][\p{L}'-]*\b)/gu).map((part) =>
    /^\p{L}[\p{L}'-]*$/u.test(part)
      ? `<button class="reading-word" type="button" data-word="${escapeHtml(part)}">${escapeHtml(part)}</button>`
      : escapeHtml(part)).join("");
}

function showWord(card) {
  activeWord = card.word;
  popover.innerHTML = `<h3>${escapeHtml(card.word)}</h3><p>${escapeHtml(card.translation)}</p><button class="button button-secondary" id="save-reading-word" type="button">☆ Lưu từ</button>`;
  popover.hidden = false;
  popover.querySelector("button").addEventListener("click", () => {
    try {
      if (saveWord(card)) {
        showToast(`Đã lưu “${activeWord}” vào sổ từ.`);
        popover.hidden = true;
      } else {
        showToast("Từ này đã có trong sổ từ.");
      }
    } catch (error) {
      showToast(error.message);
    }
  });
}

document.querySelector("#reading-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const button = event.currentTarget.querySelector("button");
  button.disabled = true;
  showLoading(result, "Đang viết một bài đọc phù hợp với bạn...");
  popover.hidden = true;
  try {
    const article = await generateReading(form.get("level").toString(), form.get("topic").toString());
    const paragraphs = Array.isArray(article.paragraphs) ? article.paragraphs : [];
    result.innerHTML = `<article class="reading-article"><header><span class="eyebrow">${escapeHtml(article.level)} · ${escapeHtml(article.topic)}</span><h2>${escapeHtml(article.title)}</h2><p>${escapeHtml(article.subtitle || "Chạm vào từ được gạch dưới để tìm hiểu thêm.")}</p></header><div class="reading-copy">${paragraphs.map((paragraph) => `<p>${markWords(paragraph)}</p>`).join("")}</div><section class="reading-quiz"><h3>Kiểm tra mức độ hiểu bài</h3><div id="reading-quiz-content">${renderQuiz(article.questions, "reading")}</div></section></article>`;
    attachQuiz(result);
    result.querySelectorAll("[data-word]").forEach((wordButton) => wordButton.addEventListener("click", async () => {
      wordButton.disabled = true;
      try {
        const card = await generateWordCard(wordButton.dataset.word);
        recordLookup(card);
        showWord(card);
      } catch (error) {
        showToast(error.message);
      } finally {
        wordButton.disabled = false;
      }
    }));
  } catch (error) {
    showError(result, error);
  } finally {
    button.disabled = false;
  }
});

document.addEventListener("click", (event) => {
  if (!popover.contains(event.target) && !event.target.closest(".reading-word")) popover.hidden = true;
});
