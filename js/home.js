/****************************************************
 * home.js — homepage only
 * - Hero slider carousel
 * - Rotating headline word synced to slides
 ****************************************************/

document.addEventListener("DOMContentLoaded", () => {
  const slides = document.querySelectorAll(".hero-slider .slide");
  const dots = document.querySelectorAll(".slider-dots .dot");
  const hero = document.querySelector(".hero-slider");
  const rotatingWord = document.querySelector(".rotating-word");

  if (!slides.length) return;

  const words = ["Leadership", "Growth", "Community", "Action"];
  let currentIndex = 0;
  let carouselInterval = null;

  function showSlide(index) {
    slides.forEach((s) => s.classList.remove("active"));
    slides[index].classList.add("active");

    dots.forEach((d) => d.classList.remove("active"));
    if (dots[index]) dots[index].classList.add("active");

    if (rotatingWord) {
      rotatingWord.classList.add("is-fading");
      rotatingWord.textContent = words[index] || words[0];
      requestAnimationFrame(() => rotatingWord.classList.remove("is-fading"));
    }
  }

  function nextSlide() {
    currentIndex = (currentIndex + 1) % slides.length;
    showSlide(currentIndex);
  }

  function start() {
    stop();
    carouselInterval = setInterval(nextSlide, 4000);
  }

  function stop() {
    if (carouselInterval) clearInterval(carouselInterval);
    carouselInterval = null;
  }

  showSlide(currentIndex);
  start();

  if (hero) {
    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
  }

  dots.forEach((dot, i) => {
    dot.addEventListener("click", () => {
      currentIndex = i;
      showSlide(currentIndex);
      start();
    });
  });
});