const root = document.documentElement;
let theme = 'light';

try {
  theme = localStorage.getItem('coffee-theme') === 'dark' ? 'dark' : 'light';
} catch {}

root.dataset.theme = theme;

document.addEventListener('DOMContentLoaded', () => {
  const header = document.querySelector('.header');
  const burger = document.querySelector('.burger');
  const navigation = document.querySelector('.nav');
  const mobile = window.matchMedia('(max-width: 768px)');
  const background = document.querySelectorAll('.skip-link, main, footer');

  function setMenuOpen(open) {
    const isOpen = open && mobile.matches;
    const wasOpen = burger.getAttribute('aria-expanded') === 'true';
    navigation.classList.toggle('nav--open', isOpen);
    root.classList.toggle('menu-open', isOpen);
    burger.setAttribute('aria-expanded', String(isOpen));
    burger.setAttribute('aria-label', isOpen ? 'Close navigation' : 'Open navigation');
    navigation.inert = mobile.matches && !isOpen;
    background.forEach((element) => {
      element.inert = isOpen;
    });

    if (isOpen) {
      navigation.querySelector('a').focus({ preventScroll: true });
    } else if (wasOpen) {
      const target = mobile.matches ? burger : navigation.querySelector('a');
      target.focus({ preventScroll: true });
    }
  }

  setMenuOpen(false);

  burger.addEventListener('click', () => {
    setMenuOpen(burger.getAttribute('aria-expanded') !== 'true');
  });

  header.addEventListener('click', (event) => {
    if (event.target.closest('a')) setMenuOpen(false);
  });

  document.addEventListener('keydown', (event) => {
    if (burger.getAttribute('aria-expanded') !== 'true') return;

    if (event.key === 'Escape') {
      event.preventDefault();
      setMenuOpen(false);
    }

    if (event.key === 'Tab') {
      const links = [...header.querySelectorAll('a, button')].filter(
        (element) => element.getClientRects().length > 0
      );
      const first = links[0];
      const last = links[links.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  });

  mobile.addEventListener('change', () => setMenuOpen(false));

  const button = document.querySelector('.theme-switch');
  button.setAttribute('aria-pressed', String(theme === 'dark'));

  button.addEventListener('click', () => {
    theme = theme === 'light' ? 'dark' : 'light';
    root.dataset.theme = theme;
    button.setAttribute('aria-pressed', String(theme === 'dark'));

    try {
      localStorage.setItem('coffee-theme', theme);
    } catch {}
  });
});
