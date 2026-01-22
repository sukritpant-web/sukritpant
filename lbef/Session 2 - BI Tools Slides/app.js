class SlidePresentation {
  constructor() {
    this.slides = document.querySelectorAll('.slide');
    this.navItems = document.querySelectorAll('.nav-item');
    this.progressFill = document.getElementById('progressFill');
    this.progressText = document.getElementById('progressText');
    this.navToggle = document.getElementById('navToggle');
    this.slideNav = document.getElementById('slideNav');
    this.currentSlide = 1;
    this.totalSlides = this.slides.length;
    this.isScrolling = false;
    this.scrollTimeout = null;
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.updateProgress();
    this.highlightCurrentSlide();

    // Handle initial hash navigation or default to first slide
    setTimeout(() => {
      if (window.location.hash) {
        this.navigateToSlide(window.location.hash);
      } else {
        this.updateCurrentSlideFromScroll();
      }
    }, 100);
  }

  setupEventListeners() {
    // Navigation item clicks
    this.navItems.forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const slideId = item.getAttribute('href');
        this.navigateToSlide(slideId);
        this.closeMobileMenu();
      });
    });

    // Mobile menu toggle
    this.navToggle.addEventListener('click', () => {
      this.toggleMobileMenu();
    });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        this.nextSlide();
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        this.previousSlide();
      } else if (e.key === 'Home') {
        e.preventDefault();
        this.navigateToSlide('#slide1');
      } else if (e.key === 'End') {
        e.preventDefault();
        this.navigateToSlide(`#slide${this.totalSlides}`);
      } else if (e.key === 'Escape') {
        this.closeMobileMenu();
      }
    });

    // Optimized scroll detection
    window.addEventListener('scroll', () => {
      if (!this.isScrolling) {
        if (this.scrollTimeout) {
          clearTimeout(this.scrollTimeout);
        }
        this.scrollTimeout = setTimeout(() => {
          this.updateCurrentSlideFromScroll();
        }, 150);
      }
    }, { passive: true });

    // Handle hash changes
    window.addEventListener('hashchange', () => {
      if (!this.isScrolling) {
        const hash = window.location.hash;
        if (hash && hash.startsWith('#slide')) {
          const slideNumber = parseInt(hash.replace('#slide', ''));
          if (slideNumber !== this.currentSlide) {
            this.navigateToSlide(hash);
          }
        }
      }
    });

    // Close mobile menu when clicking outside
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.nav-header') && this.slideNav.classList.contains('open')) {
        this.closeMobileMenu();
      }
    });

    // Handle window resize
    window.addEventListener('resize', () => {
      if (window.innerWidth > 768) {
        this.closeMobileMenu();
      }
    });
  }

  navigateToSlide(slideId) {
    const targetSlide = document.querySelector(slideId);
    if (!targetSlide) {
      console.warn(`Slide not found: ${slideId}`);
      return;
    }

    this.isScrolling = true;
    const slideNumber = parseInt(slideId.replace('#slide', ''));
    if (isNaN(slideNumber) || slideNumber < 1 || slideNumber > this.totalSlides) {
      console.warn(`Invalid slide number: ${slideNumber}`);
      this.isScrolling = false;
      return;
    }

    this.currentSlide = slideNumber;
    const headerHeight = document.querySelector('.nav-header').offsetHeight;
    const targetPosition = targetSlide.offsetTop - headerHeight;

    try {
      targetSlide.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
        inline: 'nearest'
      });
    } catch (error) {
      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      });
    }

    if (window.location.hash !== slideId) {
      history.pushState(null, null, slideId);
    }

    this.updateProgress();
    this.highlightCurrentSlide();

    setTimeout(() => {
      this.isScrolling = false;
      this.verifySlidePosition();
    }, 1200);
  }

  verifySlidePosition() {
    const actualSlide = this.getCurrentVisibleSlide();
    if (actualSlide !== this.currentSlide) {
      this.currentSlide = actualSlide;
      this.updateProgress();
      this.highlightCurrentSlide();
      history.replaceState(null, null, `#slide${this.currentSlide}`);
    }
  }

  getCurrentVisibleSlide() {
    const headerHeight = document.querySelector('.nav-header').offsetHeight;
    const scrollTop = window.pageYOffset + headerHeight + 100;
    let currentSlide = 1;

    this.slides.forEach((slide, index) => {
      const slideTop = slide.offsetTop;
      const slideBottom = slideTop + slide.offsetHeight;
      if (scrollTop >= slideTop && scrollTop < slideBottom) {
        currentSlide = index + 1;
      }
    });

    return currentSlide;
  }

  nextSlide() {
    if (this.currentSlide < this.totalSlides) {
      this.navigateToSlide(`#slide${this.currentSlide + 1}`);
    }
  }

  previousSlide() {
    if (this.currentSlide > 1) {
      this.navigateToSlide(`#slide${this.currentSlide - 1}`);
    }
  }

  updateCurrentSlideFromScroll() {
    const newSlide = this.getCurrentVisibleSlide();
    if (newSlide !== this.currentSlide) {
      this.currentSlide = newSlide;
      this.updateProgress();
      this.highlightCurrentSlide();

      const newHash = `#slide${this.currentSlide}`;
      if (window.location.hash !== newHash) {
        history.replaceState(null, null, newHash);
      }
    }
  }

  updateProgress() {
    const progress = (this.currentSlide / this.totalSlides) * 100;
    this.progressFill.style.width = `${progress}%`;
    this.progressText.textContent = `${this.currentSlide} / ${this.totalSlides}`;
  }

  highlightCurrentSlide() {
    this.navItems.forEach(item => {
      item.classList.remove('active');
    });

    const currentNavItem = document.querySelector(`.nav-item[data-slide="${this.currentSlide}"]`);
    if (currentNavItem) {
      currentNavItem.classList.add('active');
      if (window.innerWidth <= 768) {
        currentNavItem.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'center'
        });
      }
    }
  }

  toggleMobileMenu() {
    const isOpen = this.slideNav.classList.contains('open');
    if (isOpen) {
      this.closeMobileMenu();
    } else {
      this.slideNav.classList.add('open');
      this.navToggle.textContent = '✕';
      this.navToggle.setAttribute('aria-expanded', 'true');
    }
  }

  closeMobileMenu() {
    this.slideNav.classList.remove('open');
    this.navToggle.textContent = '☰';
    this.navToggle.setAttribute('aria-expanded', 'false');
  }
}

// Enhanced slide animations and accessibility
class SlideEnhancements {
  constructor() {
    this.setupAnimations();
    this.setupAccessibility();
    this.setupPerformanceOptimizations();
  }

  setupAnimations() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    const observerOptions = {
      threshold: 0.25,
      rootMargin: '0px 0px -10% 0px'
    };

    const slideObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('slide-visible');
          this.animateSlideContent(entry.target);
        }
      });
    }, observerOptions);

    this.slides = document.querySelectorAll('.slide');
    this.slides.forEach(slide => {
      slideObserver.observe(slide);
    });
  }

  animateSlideContent(slide) {
    const animatableElements = slide.querySelectorAll(
      '.objective-card, .functionality-card, .type-card, .question-card, ' +
      '.trend-card, .tool-card, .comparison-card, .challenge-card, ' +
      '.benefit-card, .takeaway-item, .family-item'
    );

    animatableElements.forEach((element, index) => {
      setTimeout(() => {
        element.style.opacity = '1';
        element.style.transform = 'translateY(0)';
      }, index * 100);
    });
  }

  setupAccessibility() {
    const presentation = document.querySelector('.presentation');
    if (presentation) {
      presentation.setAttribute('role', 'main');
      presentation.setAttribute('aria-label', 'Business Intelligence Slide Presentation');
    }

    const slides = document.querySelectorAll('.slide');
    slides.forEach((slide, index) => {
      slide.setAttribute('aria-label', `Slide ${index + 1} of ${slides.length}`);
      slide.setAttribute('tabindex', '0');
    });

    const nav = document.querySelector('.slide-nav');
    if (nav) {
      nav.setAttribute('role', 'navigation');
      nav.setAttribute('aria-label', 'Slide navigation');
    }

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        document.body.classList.add('keyboard-navigation');
      }
    });

    document.addEventListener('mousedown', () => {
      document.body.classList.remove('keyboard-navigation');
    });
  }

  setupPerformanceOptimizations() {
    const slides = document.querySelectorAll('.slide');
    
    const preloadSlide = (slideElement) => {
      if (slideElement) {
        const images = slideElement.querySelectorAll('img');
        images.forEach(img => {
          if (img.dataset.src) {
            img.src = img.dataset.src;
          }
        });
      }
    };

    const preloadObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          preloadSlide(entry.target);
          preloadObserver.unobserve(entry.target);
        }
      });
    }, { rootMargin: '100px' });

    slides.forEach(slide => {
      preloadObserver.observe(slide);
    });
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  try {
    window.slidePresentation = new SlidePresentation();
    window.slideEnhancements = new SlideEnhancements();
    console.log('✅ BI Slide presentation initialized successfully');
  } catch (error) {
    console.error('❌ Error initializing slide presentation:', error);
  }
});

// Export for potential external use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { SlidePresentation, SlideEnhancements };
}