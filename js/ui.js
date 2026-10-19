export function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[character]);
}

export function showLoading(container, message = "Đang chuẩn bị nội dung cho bạn...") {
  container.innerHTML = `<div class="loading-card"><span class="spinner" aria-hidden="true"></span><span>${escapeHtml(message)}</span></div>`;
}

export function showError(container, error) {
  container.innerHTML = `<div class="error-card" role="alert">${escapeHtml(error instanceof Error ? error.message : String(error))}</div>`;
}

export function showToast(message) {
  let region = document.querySelector(".toast-region");
  if (!region) {
    region = document.createElement("div");
    region.className = "toast-region";
    region.setAttribute("aria-live", "polite");
    document.body.append(region);
  }
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = message;
  region.append(toast);
  window.setTimeout(() => toast.remove(), 3200);
}

export function renderList(items) {
  if (!Array.isArray(items) || items.length === 0) return "<p>Chưa có nội dung.</p>";
  return `<ul>${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`;
}

export function renderQuiz(questions, prefix = "quiz") {
  if (!Array.isArray(questions) || questions.length === 0) return "";
  const content = questions.map((question, index) => {
    const options = Array.isArray(question.options) ? question.options : [];
    return `<div class="quiz-question" data-answer="${escapeHtml(question.answer)}">
      <p><strong>${index + 1}.</strong> ${escapeHtml(question.question)}</p>
      <div class="quiz-options">${options.map((option, optionIndex) => `<label><input type="radio" name="${prefix}-${index}" value="${optionIndex}"> ${escapeHtml(option)}</label>`).join("")}</div>
    </div>`;
  }).join("");
  return `<div class="quiz-block">${content}<button class="button button-secondary quiz-submit" type="button">Kiểm tra đáp án</button><div class="quiz-feedback" hidden></div></div>`;
}

export function attachQuiz(container) {
  const submit = container.querySelector(".quiz-submit");
  if (!submit) return;
  submit.addEventListener("click", () => {
    const questions = [...container.querySelectorAll(".quiz-question")];
    let correct = 0;
    let unanswered = 0;
    for (const question of questions) {
      const selected = question.querySelector("input:checked");
      if (!selected) {
        unanswered += 1;
        continue;
      }
      if (Number(selected.value) === Number(question.dataset.answer)) correct += 1;
    }
    const feedback = container.querySelector(".quiz-feedback");
    feedback.hidden = false;
    feedback.textContent = unanswered
      ? `Bạn đã trả lời ${correct}/${questions.length} câu. Hãy chọn đáp án cho các câu còn lại nhé.`
      : `Bạn trả lời đúng ${correct}/${questions.length} câu. ${correct === questions.length ? "Tuyệt vời!" : "Cứ luyện tập thêm nhé!"}`;
  });
}
