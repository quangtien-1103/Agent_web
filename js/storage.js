const STORAGE_KEY = "english-web:v1";

function readState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { savedWords: [], recentWords: [], lookupDates: [], courses: {} };
    const value = JSON.parse(raw);
    return {
      savedWords: Array.isArray(value.savedWords) ? value.savedWords : [],
      recentWords: Array.isArray(value.recentWords) ? value.recentWords : [],
      lookupDates: Array.isArray(value.lookupDates) ? value.lookupDates : [],
      courses: value.courses && typeof value.courses === "object" ? value.courses : {},
    };
  } catch (error) {
    console.error("Could not read learning data from local storage.", error);
    return { savedWords: [], recentWords: [], lookupDates: [], courses: {} };
  }
}

function writeState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    throw new Error("Không thể lưu dữ liệu học tập trên thiết bị này.", { cause: error });
  }
}

export function getCourseProgress(courseId = "english-1") {
  const state = readState();
  const course = state.courses?.[courseId] || { completedDays: {} };
  return { completedDays: course.completedDays || {} };
}

export function setCourseDayComplete(courseId, week, day, complete) {
  const state = readState();
  state.courses = state.courses || {};
  state.courses[courseId] = state.courses[courseId] || { completedDays: {} };
  const key = `${week}-${day}`;
  if (complete) state.courses[courseId].completedDays[key] = true;
  else delete state.courses[courseId].completedDays[key];
  writeState(state);
}

function todayKey() {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function dueDate(days = 1) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString();
}

export function getLearningData() {
  const state = readState();
  const today = todayKey();
  const dates = new Set(state.lookupDates);
  const dueWords = state.savedWords.filter((word) => !word.dueAt || new Date(word.dueAt) <= new Date());
  let streak = 0;
  const cursor = new Date();
  while (dates.has(`${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, "0")}-${String(cursor.getDate()).padStart(2, "0")}`)) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return {
    todayCount: state.recentWords.filter((word) => word.lookedUpOn === today).length,
    recentWords: state.recentWords.slice(0, 12),
    savedWords: state.savedWords,
    dueWords,
    streak,
  };
}

export function recordLookup(card) {
  const state = readState();
  const today = todayKey();
  const recent = {
    word: String(card.word || "").trim(),
    translation: String(card.translation || ""),
    lookedUpOn: today,
    lookedUpAt: new Date().toISOString(),
  };
  state.recentWords = [recent, ...state.recentWords.filter((item) => item.word.toLowerCase() !== recent.word.toLowerCase())].slice(0, 40);
  state.lookupDates = [...new Set([today, ...state.lookupDates])].slice(0, 120);
  writeState(state);
}

export function isWordSaved(word) {
  return readState().savedWords.some((item) => item.word.toLowerCase() === word.toLowerCase());
}

export function saveWord(card) {
  const state = readState();
  const word = String(card.word || "").trim();
  const existingIndex = state.savedWords.findIndex((item) => item.word.toLowerCase() === word.toLowerCase());
  if (existingIndex !== -1) return false;
  state.savedWords.unshift({
    ...card,
    word,
    savedAt: new Date().toISOString(),
    dueAt: dueDate(1),
  });
  writeState(state);
  return true;
}

export function removeSavedWord(word) {
  const state = readState();
  state.savedWords = state.savedWords.filter((item) => item.word.toLowerCase() !== word.toLowerCase());
  writeState(state);
}

export function markWordReviewed(word) {
  const state = readState();
  const item = state.savedWords.find((entry) => entry.word.toLowerCase() === word.toLowerCase());
  if (!item) return;
  item.dueAt = dueDate(3);
  item.lastReviewedAt = new Date().toISOString();
  writeState(state);
}
