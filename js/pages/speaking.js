import { continueSpeaking } from "../api.js";
import { mountFooter, mountNavbar } from "../components/navbar.js";
import { escapeHtml, showToast } from "../ui.js";
import { speakEnglish } from "../audio.js";

mountNavbar();
mountFooter();
const scenarios = [
  { title: "Đặt phòng khách sạn", description: "Bạn muốn đặt một phòng cho kỳ nghỉ sắp tới.", opening: "Good evening! Welcome to the hotel. How can I help you today?" },
  { title: "Gọi món ở quán cà phê", description: "Bạn đang chọn đồ uống và món ăn nhẹ tại quán.", opening: "Hi there! Welcome in. What can I get started for you?" },
  { title: "Hỏi đường trong thành phố", description: "Bạn muốn tìm đường đến một địa điểm gần đây.", opening: "Hello! You look a little lost. Can I help you find somewhere?" },
  { title: "Trò chuyện về sở thích", description: "Bạn vừa gặp một người bạn mới và muốn bắt chuyện.", opening: "Hey! It's nice to meet you. What do you enjoy doing in your free time?" },
];
let scenario = scenarios[0];
let history = [{ role: "assistant", content: scenario.opening }];
const log = document.querySelector("#conversation-log");
const feedback = document.querySelector("#speaking-feedback");

function addBubble(role, text) {
  const bubble = document.createElement("div");
  bubble.className = `chat-bubble ${role === "user" ? "user-bubble" : "assistant-bubble"}`;
  bubble.innerHTML = `<span class="bubble-avatar">${role === "user" ? "you" : "e."}</span><div><small>${role === "user" ? "YOU" : "ENGLISH WEB"}</small><p>${escapeHtml(text)}</p></div>`;
  log.append(bubble);
  log.scrollTop = log.scrollHeight;
}

function resetConversation(next) {
  scenario = next;
  history = [{ role: "assistant", content: scenario.opening }];
  document.querySelector("#scenario-title").textContent = scenario.title;
  document.querySelector("#scenario-description").textContent = scenario.description;
  log.replaceChildren();
  addBubble("assistant", scenario.opening);
  feedback.hidden = true;
}

document.querySelector("#change-scenario").addEventListener("click", () => {
  const choices = scenarios.filter((item) => item !== scenario);
  resetConversation(choices[Math.floor(Math.random() * choices.length)]);
});

document.querySelector("#message-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const input = document.querySelector("#message-input");
  const message = input.value.trim();
  const button = form.querySelector('button[type="submit"]');
  if (!message || button.disabled) return;
  addBubble("user", message);
  history.push({ role: "user", content: message });
  input.value = "";
  button.disabled = true;
  try {
    const reply = await continueSpeaking(scenario.title, document.querySelector("#speaking-level").value, history.slice(0, -1).slice(-10), message);
    history.push({ role: "assistant", content: reply.reply });
    addBubble("assistant", reply.reply);
    feedback.innerHTML = `<h3>✳ Gợi ý nhỏ</h3><p class="feedback-original">Câu của bạn: “${escapeHtml(message)}”</p>${reply.correction ? `<p class="feedback-suggestion">${escapeHtml(reply.correction)}</p><p>${escapeHtml(reply.explanation)}</p>` : "<p>Bạn diễn đạt rất rõ ràng — hãy tiếp tục cuộc trò chuyện nhé!</p>"}`;
    feedback.hidden = false;
  } catch (error) {
    history.pop();
    addBubble("assistant", "Mình chưa kết nối được để trả lời lúc này. Bạn thử gửi lại nhé.");
    showToast(error.message);
  } finally {
    button.disabled = false;
    input.focus();
  }
});

document.querySelector("#speak-last").addEventListener("click", () => {
  const last = [...history].reverse().find((item) => item.role === "assistant");
  if (!last || !speakEnglish(last.content)) {
    showToast("Trình duyệt này chưa hỗ trợ đọc văn bản.");
  }
});

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const voiceButton = document.querySelector("#voice-input");
const permissionButton = document.querySelector("#microphone-permission");
const voiceHint = document.querySelector("#voice-hint");
let microphoneReady = false;

async function requestMicrophonePermission() {
  if (!navigator.mediaDevices?.getUserMedia) {
    throw new Error("Trình duyệt này không cho phép truy cập microphone.");
  }
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  stream.getTracks().forEach((track) => track.stop());
  microphoneReady = true;
  permissionButton.textContent = "✓ Đã bật microphone";
  permissionButton.disabled = true;
  voiceHint.textContent = SpeechRecognition
    ? "Microphone đã sẵn sàng. Nhấn 🎙 để nói tiếng Anh."
    : "Microphone đã sẵn sàng, nhưng trình duyệt chưa hỗ trợ nhận diện giọng nói.";
}

permissionButton.addEventListener("click", async () => {
  permissionButton.disabled = true;
  try {
    await requestMicrophonePermission();
  } catch (error) {
    permissionButton.disabled = false;
    showToast(error.name === "NotAllowedError"
      ? "Bạn chưa cấp quyền microphone. Hãy cho phép microphone trong cài đặt trình duyệt."
      : error.message);
  }
});

if (SpeechRecognition) {
  voiceButton.addEventListener("click", async () => {
    if (!microphoneReady) {
      try {
        await requestMicrophonePermission();
      } catch (error) {
        showToast(error.name === "NotAllowedError"
          ? "Hãy cấp quyền microphone trước khi nói tiếng Anh."
          : error.message);
        return;
      }
    }
    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.continuous = false;
    voiceButton.disabled = true;
    voiceButton.classList.add("is-recording");
    voiceHint.textContent = "Đang nghe tiếng Anh...";
    recognition.onresult = (event) => {
      document.querySelector("#message-input").value = event.results[0][0].transcript;
      document.querySelector("#message-input").focus();
    };
    recognition.onerror = (event) => {
      showToast(event.error === "not-allowed"
        ? "Trình duyệt đã từ chối quyền microphone."
        : "Không nhận diện được giọng nói. Bạn có thể gõ câu trả lời.");
    };
    recognition.onend = () => {
      voiceButton.disabled = false;
      voiceButton.classList.remove("is-recording");
      voiceHint.textContent = "Microphone đã sẵn sàng. Nhấn 🎙 để nói tiếng Anh.";
    };
    recognition.start();
  });
} else {
  voiceButton.disabled = true;
  voiceButton.title = "Nhận diện giọng nói không được hỗ trợ trong trình duyệt này.";
  voiceHint.textContent = "Nhận diện giọng nói chưa được hỗ trợ trong trình duyệt này — bạn có thể gõ câu trả lời.";
}
