import { mountFooter, mountNavbar } from "../components/navbar.js";
import { getLearningData } from "../storage.js";
import { escapeHtml } from "../ui.js";

mountNavbar();
mountFooter();

const data = getLearningData();
document.querySelector("#looked-up-count").textContent = data.todayCount;
document.querySelector("#review-count").textContent = data.dueWords.length;
document.querySelector("#streak-count").innerHTML = `${data.streak} <i>🔥</i>`;
document.querySelector("#progress-bar").style.width = `${Math.min(data.todayCount * 12.5, 100)}%`;
document.querySelector("#progress-caption").textContent = data.todayCount
  ? `Bạn đã tra ${data.todayCount} từ hôm nay. Tiếp tục giữ nhịp nhé!`
  : "Mỗi lần học là một bước tiến.";

const recent = document.querySelector("#recent-words");
if (data.recentWords.length) {
  recent.innerHTML = data.recentWords.slice(0, 8).map((item) =>
    `<a class="recent-word" href="vocabulary.html?word=${encodeURIComponent(item.word)}"><strong>${escapeHtml(item.word)}</strong><span>${escapeHtml(item.translation)}</span></a>`).join("");
}

document.querySelector("#quick-search").addEventListener("submit", (event) => {
  event.preventDefault();
  const word = new FormData(event.currentTarget).get("word").toString().trim();
  if (word) location.href = `vocabulary.html?word=${encodeURIComponent(word)}`;
});
