import { escapeHtml } from "../ui.js";
import { speakEnglish } from "../audio.js";

export function renderWordCard(card, { saved = false } = {}) {
  const collocations = Array.isArray(card.collocations) ? card.collocations : [];
  const examples = Array.isArray(card.examples) ? card.examples : [];
  const synonyms = Array.isArray(card.synonyms) ? card.synonyms : [];
  return `<article class="result-card word-card">
    <div class="word-title-row"><div><h2>${escapeHtml(card.word)}</h2><p class="word-pronunciation">${escapeHtml(card.pronunciation || "")}</p></div><button class="audio-button" type="button" data-pronounce="${escapeHtml(card.word)}" aria-label="Nghe phát âm từ ${escapeHtml(card.word)}">🔊</button></div>
    <span class="word-type">${escapeHtml(card.partOfSpeech || "Từ vựng")}</span>
    <div class="result-section"><h3>Nghĩa</h3><p class="definition">${escapeHtml(card.translation)}</p></div>
    <div class="result-section"><h3>Cụm từ đi kèm</h3><div class="chip-list">${collocations.length ? collocations.map((item) => {
      const phrase = typeof item === "string" ? item : item.phrase;
      const translation = typeof item === "string" ? "" : item.translation;
      return `<span class="chip collocation-chip"><strong>${escapeHtml(phrase)}</strong><span>${escapeHtml(translation || "Chưa có nghĩa dịch.")}</span></span>`;
    }).join("") : "<span>Chưa có cụm từ.</span>"}</div></div>
    <div class="result-section"><h3>Ngữ cảnh sử dụng</h3><p>${escapeHtml(card.context || "Chưa có ghi chú ngữ cảnh.")}</p></div>
    <div class="result-section"><h3>Ví dụ</h3>${examples.length ? `<ul>${examples.map((item) => `<li><strong>${escapeHtml(item.sentence || item)}</strong>${item.translation ? `<br><span>${escapeHtml(item.translation)}</span>` : ""}</li>`).join("")}</ul>` : "<p>Chưa có ví dụ.</p>"}</div>
    <div class="result-section"><h3>Từ đồng nghĩa</h3>${synonyms.length ? `<div class="chip-list">${synonyms.map((item) => `<span class="chip">${escapeHtml(item.word || item)}${item.difference ? ` · ${escapeHtml(item.difference)}` : ""}</span>`).join("")}</div>` : "<p>Chưa có từ đồng nghĩa.</p>"}</div>
    <div class="result-section"><h3>Lỗi hay gặp</h3>${Array.isArray(card.commonMistakes) ? `<ul>${card.commonMistakes.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>` : `<p>${escapeHtml(card.commonMistakes || "Chưa có ghi chú.")}</p>`}</div>
    <div class="word-actions"><button class="button button-primary save-word-button" type="button" ${saved ? "disabled" : ""}>${saved ? "✓ Đã lưu vào sổ từ" : "☆ Lưu vào sổ từ"}</button></div>
  </article>`;
}

export function attachPronunciation(container) {
  container.querySelectorAll("[data-pronounce]").forEach((button) => {
    button.addEventListener("click", () => {
      speakEnglish(button.dataset.pronounce);
    });
  });
}
