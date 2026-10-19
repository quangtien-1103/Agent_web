import { generateWordCard } from "../api.js";
import { mountFooter, mountNavbar } from "../components/navbar.js";
import { attachPronunciation, renderWordCard } from "../components/wordCard.js";
import { getLearningData, isWordSaved, markWordReviewed, recordLookup, removeSavedWord, saveWord } from "../storage.js";
import { escapeHtml, showError, showLoading, showToast } from "../ui.js";

mountNavbar();
mountFooter();
const result = document.querySelector("#word-result");
let currentCard = null;
let loading = false;

function renderSavedWords() {
  const { savedWords, dueWords } = getLearningData();
  document.querySelector("#saved-count").textContent = savedWords.length;
  document.querySelector("#review-caption").textContent = dueWords.length
    ? `Cần ôn hôm nay: ${dueWords.length}`
    : "Từ đã lưu sẽ được nhắc ôn sau.";
  const list = document.querySelector("#saved-words");
  list.innerHTML = savedWords.length ? savedWords.map((item) =>
    `<div class="saved-word"><button type="button" data-open-word="${escapeHtml(item.word)}">${escapeHtml(item.word)}<small>${escapeHtml(item.translation)}</small></button><button type="button" class="remove-word" data-remove-word="${escapeHtml(item.word)}" aria-label="Xóa ${escapeHtml(item.word)} khỏi sổ từ">×</button></div>`).join("")
    : '<p class="saved-empty">Từ bạn lưu sẽ được giữ ở đây trên thiết bị này.</p>';
  list.querySelectorAll("[data-open-word]").forEach((button) => button.addEventListener("click", () => lookup(button.dataset.openWord)));
  list.querySelectorAll("[data-remove-word]").forEach((button) => button.addEventListener("click", () => {
    removeSavedWord(button.dataset.removeWord);
    renderSavedWords();
    if (currentCard?.word.toLowerCase() === button.dataset.removeWord.toLowerCase()) renderCard(currentCard);
  }));
}

function renderCard(card) {
  currentCard = card;
  result.innerHTML = renderWordCard(card, { saved: isWordSaved(card.word) });
  attachPronunciation(result);
  result.querySelector(".save-word-button").addEventListener("click", () => {
    try {
      if (saveWord(currentCard)) showToast(`Đã lưu “${currentCard.word}” vào sổ từ.`);
      else showToast("Từ này đã có trong sổ từ.");
      renderSavedWords();
      renderCard(currentCard);
    } catch (error) {
      showToast(error.message);
    }
  });
}

async function lookup(word) {
  const normalized = word.trim();
  if (!normalized || loading) return;
  loading = true;
  const button = document.querySelector("#word-search button[type=submit]");
  if (button) button.disabled = true;
  showLoading(result, `Đang tìm hiểu “${normalized}”...`);
  try {
    const card = await generateWordCard(normalized);
    recordLookup(card);
    renderCard(card);
    renderSavedWords();
  } catch (error) {
    showError(result, error);
  } finally {
    loading = false;
    if (button) button.disabled = false;
  }
}

document.querySelector("#word-search").addEventListener("submit", (event) => {
  event.preventDefault();
  lookup(new FormData(event.currentTarget).get("word").toString());
});
document.querySelector("#review-button").addEventListener("click", () => {
  const { dueWords } = getLearningData();
  if (!dueWords.length) {
    showToast("Chưa có từ nào cần ôn. Hãy thêm từ mới vào sổ nhé!");
    return;
  }
  const word = dueWords[0];
  markWordReviewed(word.word);
  renderSavedWords();
  showToast(`Ôn xong “${word.word}” — lần ôn tiếp theo sau 3 ngày.`);
});
renderSavedWords();

const initialWord = new URLSearchParams(location.search).get("word");
if (initialWord) {
  document.querySelector("#word-input").value = initialWord;
  lookup(initialWord);
}
