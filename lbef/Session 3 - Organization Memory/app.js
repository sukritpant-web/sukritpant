// Slide Navigation System
const slides = document.querySelectorAll('.slide');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const currentSlideDisplay = document.getElementById('currentSlide');
const totalSlidesDisplay = document.getElementById('totalSlides');

let currentSlide = 1;
const totalSlides = slides.length;

// Initialize
function init() {
  totalSlidesDisplay.textContent = totalSlides;
  updateSlide();
  updateButtons();
}

// Update current slide
function updateSlide() {
  slides.forEach((slide, index) => {
    slide.classList.remove('active');
    if (index === currentSlide - 1) {
      slide.classList.add('active');
    }
  });
  currentSlideDisplay.textContent = currentSlide;
}

// Update button states
function updateButtons() {
  prevBtn.disabled = currentSlide === 1;
  nextBtn.disabled = currentSlide === totalSlides;
}

// Navigate to next slide
function nextSlide() {
  if (currentSlide < totalSlides) {
    currentSlide++;
    updateSlide();
    updateButtons();
  }
}

// Navigate to previous slide
function prevSlide() {
  if (currentSlide > 1) {
    currentSlide--;
    updateSlide();
    updateButtons();
  }
}

// Event listeners
prevBtn.addEventListener('click', prevSlide);
nextBtn.addEventListener('click', nextSlide);

// Keyboard navigation
document.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowRight' || e.key === ' ') {
    e.preventDefault();
    nextSlide();
  } else if (e.key === 'ArrowLeft') {
    e.preventDefault();
    prevSlide();
  } else if (e.key === 'Home') {
    e.preventDefault();
    currentSlide = 1;
    updateSlide();
    updateButtons();
  } else if (e.key === 'End') {
    e.preventDefault();
    currentSlide = totalSlides;
    updateSlide();
    updateButtons();
  }
});

// Initialize presentation
init();