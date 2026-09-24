const root = document.documentElement;
let theme = "light";

try {
  theme = localStorage.getItem("coffee-theme") === "dark" ? "dark" : "light";
} catch {}

root.dataset.theme = theme;

document.addEventListener("DOMContentLoaded", () => {
  const burger = document.querySelector(".burger");
  const navigation = document.querySelector(".nav");
  const mobile = window.matchMedia("(max-width: 768px)");

  function setMenuOpen(open) {
    const isOpen = open && mobile.matches;
    navigation.classList.toggle("nav--open", isOpen);
    root.classList.toggle("menu-open", isOpen);
    burger.setAttribute("aria-expanded", String(isOpen));
    burger.setAttribute("aria-label", isOpen ? "Close navigation" : "Open navigation");
  }

  burger.addEventListener("click", () => {
    setMenuOpen(burger.getAttribute("aria-expanded") !== "true");
  });

  navigation.addEventListener("click", (event) => {
    if (event.target.closest("a")) setMenuOpen(false);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") setMenuOpen(false);
  });

  mobile.addEventListener("change", () => setMenuOpen(false));

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
