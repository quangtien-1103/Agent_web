const links = [
  ["English 1", "course.html"],
  ["Từ vựng", "vocabulary.html"],
  ["Ngữ pháp", "grammar.html"],
  ["Reading", "reading.html"],
  ["Speaking", "speaking.html"],
];

export function mountNavbar() {
  const target = document.querySelector("[data-navbar]");
  if (!target) return;
  const current = location.pathname.split("/").pop() || "index.html";
  const navLinks = links.map(([label, href]) =>
    `<a href="${href}"${current === href ? ' aria-current="page"' : ""}>${label}</a>`).join("");
  target.innerHTML = `<header class="site-header"><div class="container nav-inner">
    <a class="brand" href="index.html" aria-label="English Web, trang chủ"><span class="brand-mark">e.</span><span>english web</span></a>
    <nav class="nav-links" id="site-navigation" aria-label="Điều hướng chính">${navLinks}</nav>
    <div class="nav-actions"><button class="icon-button theme-button" type="button" aria-label="Bật chế độ tối">☾</button><button class="icon-button menu-button" type="button" aria-label="Mở điều hướng" aria-expanded="false" aria-controls="site-navigation">☰</button></div>
  </div></header>`;
  const themeButton = target.querySelector(".theme-button");
  const dark = localStorage.getItem("english-web:dark-mode") === "true";
  document.body.classList.toggle("dark-mode", dark);
  themeButton.textContent = dark ? "☀" : "☾";
  themeButton.setAttribute("aria-label", dark ? "Bật chế độ sáng" : "Bật chế độ tối");
  themeButton.addEventListener("click", () => {
    const enabled = document.body.classList.toggle("dark-mode");
    localStorage.setItem("english-web:dark-mode", String(enabled));
    themeButton.textContent = enabled ? "☀" : "☾";
    themeButton.setAttribute("aria-label", enabled ? "Bật chế độ sáng" : "Bật chế độ tối");
  });
  const menuButton = target.querySelector(".menu-button");
  menuButton.addEventListener("click", () => {
    const open = target.querySelector(".nav-links").classList.toggle("is-open");
    menuButton.setAttribute("aria-expanded", String(open));
    menuButton.setAttribute("aria-label", open ? "Đóng điều hướng" : "Mở điều hướng");
  });
}

export function mountFooter() {
  const target = document.querySelector("[data-footer]");
  if (!target) return;
  target.innerHTML = `<footer class="site-footer"><div class="container footer-inner"><p>© ${new Date().getFullYear()} English Web · Học một chút, mỗi ngày.</p><div class="footer-links"><a href="vocabulary.html">Sổ từ của tôi</a><a href="index.html">Trang chủ</a></div></div></footer>`;
}
