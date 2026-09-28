const slider = document.querySelector('.slider');
const track = slider.querySelector('.slider__track');
const viewport = slider.querySelector('.slider__viewport');
const slides = [...slider.querySelectorAll('.slide')];
const indicators = [...slider.querySelectorAll('.slider__control')];
let currentSlide = 0;
let touchStart = null;

function showSlide(index) {
  currentSlide = (index + slides.length) % slides.length;
  track.style.transform = `translateX(-${currentSlide * 100}%)`;

  slides.forEach((slide, slideIndex) => {
    const active = slideIndex === currentSlide;
    slide.setAttribute('aria-hidden', String(!active));
    slide.inert = !active;
  });

  indicators.forEach((indicator, slideIndex) => {
    const active = slideIndex === currentSlide;
    indicator.classList.toggle('slider__control--active', active);
    if (active) {
      indicator.setAttribute('aria-current', 'true');
    } else {
      indicator.removeAttribute('aria-current');
    }
  });
}

slider.querySelectorAll('.slider__arrow').forEach((arrow) => {
  arrow.addEventListener('click', () => {
    showSlide(currentSlide + Number(arrow.dataset.direction));
  });
});

indicators.forEach((indicator, index) => {
  indicator.addEventListener('click', () => showSlide(index));
});

viewport.addEventListener('touchstart', (event) => {
  touchStart = event.touches.length === 1 ? event.touches[0] : null;
}, { passive: true });

viewport.addEventListener('touchend', (event) => {
  if (!touchStart) return;

  const deltaX = event.changedTouches[0].clientX - touchStart.clientX;
  const deltaY = event.changedTouches[0].clientY - touchStart.clientY;
  touchStart = null;

  if (Math.abs(deltaX) >= 50 && Math.abs(deltaX) > Math.abs(deltaY)) {
    showSlide(currentSlide + (deltaX < 0 ? 1 : -1));
  }
}, { passive: true });

viewport.addEventListener('touchcancel', () => {
  touchStart = null;
}, { passive: true });

showSlide(0);
