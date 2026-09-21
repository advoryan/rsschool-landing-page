const root = document.documentElement;
let theme = "light";

try {
  theme = localStorage.getItem("coffee-theme") === "dark" ? "dark" : "light";
} catch {}

root.dataset.theme = theme;

document.addEventListener("DOMContentLoaded", () => {
  const button = document.querySelector(".theme-switch");
  button.setAttribute("aria-pressed", String(theme === "dark"));

  button.addEventListener("click", () => {
    theme = theme === "light" ? "dark" : "light";
    root.dataset.theme = theme;
    button.setAttribute("aria-pressed", String(theme === "dark"));

    try {
      localStorage.setItem("coffee-theme", theme);
    } catch {}
  });
});
