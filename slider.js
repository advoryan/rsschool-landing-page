const slider = document.querySelector('.slider');
const track = slider.querySelector('.slider__track');
const slides = [...slider.querySelectorAll('.slide')];
const indicators = [...slider.querySelectorAll('.slider__control')];
let currentSlide = 0;

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

showSlide(0);
