class SlidePresentation {
    constructor() {
        this.currentSlide = 1;
        this.totalSlides = 24;
        this.slides = document.querySelectorAll('.slide');
        this.dots = document.querySelectorAll('.dot');
        this.prevBtn = document.getElementById('prev-btn');
        this.nextBtn = document.getElementById('next-btn');
        this.currentSlideSpan = document.getElementById('current-slide');
        this.totalSlidesSpan = document.getElementById('total-slides');
        
        this.init();
    }
    
    init() {
        // Set total slides
        this.totalSlidesSpan.textContent = this.totalSlides;
        
        // Add event listeners
        this.prevBtn.addEventListener('click', () => this.previousSlide());
        this.nextBtn.addEventListener('click', () => this.nextSlide());
        
        // Add dot navigation
        this.dots.forEach((dot, index) => {
            dot.addEventListener('click', () => this.goToSlide(index + 1));
        });
        
        // Add keyboard navigation
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));
        
        // Initialize the presentation
        this.updatePresentation();
        
        // Add slide change animation
        this.addSlideChangeListener();
    }
    
    previousSlide() {
        if (this.currentSlide > 1) {
            this.currentSlide--;
            this.updatePresentation();
            this.announceSlideChange();
        }
    }
    
    nextSlide() {
        if (this.currentSlide < this.totalSlides) {
            this.currentSlide++;
            this.updatePresentation();
            this.announceSlideChange();
        }
    }
    
    goToSlide(slideNumber) {
        if (slideNumber >= 1 && slideNumber <= this.totalSlides && slideNumber !== this.currentSlide) {
            this.currentSlide = slideNumber;
            this.updatePresentation();
            this.announceSlideChange();
        }
    }
    
    handleKeyboard(e) {
        // Prevent keyboard navigation if user is typing in an input
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
            return;
        }
        
        switch(e.key) {
            case 'ArrowLeft':
            case 'ArrowUp':
                e.preventDefault();
                this.previousSlide();
                break;
            case 'ArrowRight':
            case 'ArrowDown':
            case ' ': // Spacebar
                e.preventDefault();
                this.nextSlide();
                break;
            case 'Home':
                e.preventDefault();
                this.goToSlide(1);
                break;
            case 'End':
                e.preventDefault();
                this.goToSlide(this.totalSlides);
                break;
            case 'Escape':
                e.preventDefault();
                this.exitFullscreen();
                break;
        }
    }
    
    updatePresentation() {
        // Update slide visibility
        this.slides.forEach((slide, index) => {
            const slideNumber = index + 1;
            if (slideNumber === this.currentSlide) {
                slide.classList.add('active');
                // Add entrance animation
                slide.classList.add('slide-enter');
                setTimeout(() => {
                    slide.classList.remove('slide-enter');
                }, 300);
            } else {
                slide.classList.remove('active');
            }
        });
        
        // Update dots
        this.dots.forEach((dot, index) => {
            const slideNumber = index + 1;
            if (slideNumber === this.currentSlide) {
                dot.classList.add('active');
                dot.setAttribute('aria-current', 'true');
            } else {
                dot.classList.remove('active');
                dot.removeAttribute('aria-current');
            }
        });
        
        // Update slide counter
        this.currentSlideSpan.textContent = this.currentSlide;
        
        // Update navigation buttons
        this.prevBtn.disabled = this.currentSlide === 1;
        this.nextBtn.disabled = this.currentSlide === this.totalSlides;
        
        // Update button text for better UX
        if (this.currentSlide === 1) {
            this.prevBtn.innerHTML = '<span>← Start</span>';
        } else {
            this.prevBtn.innerHTML = '<span>← Previous</span>';
        }
        
        if (this.currentSlide === this.totalSlides) {
            this.nextBtn.innerHTML = '<span>End →</span>';
        } else {
            this.nextBtn.innerHTML = '<span>Next →</span>';
        }
        
        // Update progress for potential progress bar
        this.updateProgress();
        
        // Smooth scroll to top of slide content
        this.scrollToTop();
    }
    
    updateProgress() {
        const progress = (this.currentSlide / this.totalSlides) * 100;
        document.documentElement.style.setProperty('--slide-progress', `${progress}%`);
    }
    
    scrollToTop() {
        const currentSlideElement = document.querySelector(`[data-slide="${this.currentSlide}"]`);
        if (currentSlideElement) {
            const slideContent = currentSlideElement.querySelector('.slide-content');
            if (slideContent) {
                slideContent.scrollTop = 0;
            }
        }
    }
    
    announceSlideChange() {
        // Accessibility: Announce slide change to screen readers
        const currentSlideElement = document.querySelector(`[data-slide="${this.currentSlide}"]`);
        const slideTitle = currentSlideElement?.querySelector('.slide-title')?.textContent;
        
        if (slideTitle) {
            this.announceToScreenReader(`Slide ${this.currentSlide} of ${this.totalSlides}: ${slideTitle}`);
        }
    }
    
    announceToScreenReader(message) {
        const announcement = document.createElement('div');
        announcement.setAttribute('aria-live', 'polite');
        announcement.setAttribute('aria-atomic', 'true');
        announcement.className = 'sr-only';
        announcement.textContent = message;
        
        document.body.appendChild(announcement);
        
        setTimeout(() => {
            document.body.removeChild(announcement);
        }, 1000);
    }
    
    addSlideChangeListener() {
        // Listen for slide transitions
        this.slides.forEach(slide => {
            slide.addEventListener('transitionend', (e) => {
                if (e.propertyName === 'opacity' && slide.classList.contains('active')) {
                    // Slide transition completed
                    this.onSlideTransitionComplete();
                }
            });
        });
    }
    
    onSlideTransitionComplete() {
        // Ensure any auto-playing content is handled
        const currentSlideElement = document.querySelector(`[data-slide="${this.currentSlide}"]`);
        
        // Focus management for accessibility
        if (document.body.classList.contains('using-keyboard')) {
            const firstFocusable = currentSlideElement.querySelector('button, a, input, select, textarea, [tabindex]:not([tabindex="-1"])');
            if (firstFocusable) {
                firstFocusable.focus();
            }
        }
    }
    
    // Method to get current slide info (useful for debugging and analytics)
    getCurrentSlideInfo() {
        const currentSlideElement = document.querySelector(`[data-slide="${this.currentSlide}"]`);
        const title = currentSlideElement?.querySelector('.slide-title')?.textContent || '';
        
        return {
            current: this.currentSlide,
            total: this.totalSlides,
            title: title,
            progress: Math.round((this.currentSlide / this.totalSlides) * 100),
            isFirst: this.currentSlide === 1,
            isLast: this.currentSlide === this.totalSlides
        };
    }
    
    // Method to reset presentation to first slide
    reset() {
        this.goToSlide(1);
    }
    
    // Method to jump to specific slide by title (fuzzy matching)
    findSlideByTitle(searchTitle) {
        const slides = Array.from(this.slides);
        const foundSlide = slides.find(slide => {
            const title = slide.querySelector('.slide-title')?.textContent || '';
            return title.toLowerCase().includes(searchTitle.toLowerCase());
        });
        
        if (foundSlide) {
            const slideNumber = parseInt(foundSlide.dataset.slide);
            this.goToSlide(slideNumber);
            return slideNumber;
        }
        return null;
    }
    
    // Method to get all slide titles
    getAllSlideTitles() {
        return Array.from(this.slides).map((slide, index) => {
            const title = slide.querySelector('.slide-title')?.textContent || '';
            return {
                number: index + 1,
                title: title
            };
        });
    }
    
    // Fullscreen methods
    enterFullscreen() {
        const element = document.documentElement;
        if (element.requestFullscreen) {
            element.requestFullscreen();
        } else if (element.mozRequestFullScreen) {
            element.mozRequestFullScreen();
        } else if (element.webkitRequestFullscreen) {
            element.webkitRequestFullscreen();
        } else if (element.msRequestFullscreen) {
            element.msRequestFullscreen();
        }
    }
    
    exitFullscreen() {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        }
    }
    
    toggleFullscreen() {
        if (!document.fullscreenElement) {
            this.enterFullscreen();
        } else {
            this.exitFullscreen();
        }
    }
    
    // Auto-advance functionality (optional)
    startAutoAdvance(intervalMs = 30000) {
        if (this.autoAdvanceTimer) {
            clearInterval(this.autoAdvanceTimer);
        }
        
        this.autoAdvanceTimer = setInterval(() => {
            if (this.currentSlide < this.totalSlides) {
                this.nextSlide();
            } else {
                this.stopAutoAdvance();
            }
        }, intervalMs);
    }
    
    stopAutoAdvance() {
        if (this.autoAdvanceTimer) {
            clearInterval(this.autoAdvanceTimer);
            this.autoAdvanceTimer = null;
        }
    }
    
    // Export slide data (useful for sharing or saving progress)
    exportSlideData() {
        return {
            currentSlide: this.currentSlide,
            totalSlides: this.totalSlides,
            timestamp: new Date().toISOString(),
            slides: this.getAllSlideTitles()
        };
    }
    
    // Import slide data (restore state)
    importSlideData(data) {
        if (data && data.currentSlide && data.currentSlide <= this.totalSlides) {
            this.goToSlide(data.currentSlide);
        }
    }
}

// Utility functions for better user experience
function addLoadingAnimation() {
    document.body.classList.add('loading');
}

function removeLoadingAnimation() {
    document.body.classList.remove('loading');
}

function addFullscreenToggle() {
    // Add fullscreen functionality
    document.addEventListener('keydown', (e) => {
        if (e.key === 'F11' || (e.key === 'f' && (e.ctrlKey || e.metaKey))) {
            e.preventDefault();
            if (window.presentation) {
                window.presentation.toggleFullscreen();
            }
        }
    });
    
    // Handle fullscreen change events
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);
}

function handleFullscreenChange() {
    const isFullscreen = !!(document.fullscreenElement || document.webkitFullscreenElement || 
                          document.mozFullScreenElement || document.msFullscreenElement);
    
    document.body.classList.toggle('fullscreen-mode', isFullscreen);
    
    if (isFullscreen) {
        console.log('🖥️ Entered fullscreen mode');
    } else {
        console.log('🖥️ Exited fullscreen mode');
    }
}

// Theme switching functionality
function initThemeToggle() {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
    
    // Listen for system theme changes
    prefersDark.addEventListener('change', (e) => {
        updateTheme(e.matches ? 'dark' : 'light');
    });
    
    // Set initial theme
    updateTheme(prefersDark.matches ? 'dark' : 'light');
    
    // Add manual theme toggle (Ctrl+T or Cmd+T)
    document.addEventListener('keydown', (e) => {
        if (e.key === 't' && (e.ctrlKey || e.metaKey)) {
            e.preventDefault();
            toggleTheme();
        }
    });
}

function updateTheme(theme) {
    document.documentElement.setAttribute('data-color-scheme', theme);
    localStorage.setItem('preferred-theme', theme);
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-color-scheme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    updateTheme(newTheme);
}

// Performance monitoring
function initPerformanceMonitoring() {
    // Monitor slide transition performance
    let transitionStart = 0;
    
    document.addEventListener('slideChangeStart', () => {
        transitionStart = performance.now();
    });
    
    document.addEventListener('slideChangeEnd', () => {
        if (transitionStart > 0) {
            const duration = performance.now() - transitionStart;
            if (duration > 100) {
                console.warn(`⚠️ Slow slide transition: ${duration.toFixed(2)}ms`);
            }
        }
    });
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Show loading state
    addLoadingAnimation();
    
    // Initialize the slide presentation
    const presentation = new SlidePresentation();
    
    // Initialize additional features
    addFullscreenToggle();
    initThemeToggle();
    initPerformanceMonitoring();
    
    // Make presentation globally available for debugging
    window.presentation = presentation;
    
    // Remove loading state
    setTimeout(() => {
        removeLoadingAnimation();
    }, 100);
    
    // Add smooth scrolling behavior for better UX
    document.body.style.scrollBehavior = 'smooth';
    
    // Prevent right-click context menu for a cleaner presentation experience
    document.addEventListener('contextmenu', (e) => {
        if (!e.target.closest('input, textarea')) {
            e.preventDefault();
        }
    });
    
    // Prevent text selection for a cleaner look (except in inputs)
    document.addEventListener('selectstart', (e) => {
        if (!['INPUT', 'TEXTAREA'].includes(e.target.tagName)) {
            e.preventDefault();
        }
    });
    
    // Add touch swipe support for mobile devices
    let touchStartX = 0;
    let touchEndX = 0;
    let touchStartY = 0;
    let touchEndY = 0;
    
    document.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
        touchStartY = e.changedTouches[0].screenY;
    }, { passive: true });
    
    document.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        touchEndY = e.changedTouches[0].screenY;
        handleSwipe();
    }, { passive: true });
    
    function handleSwipe() {
        const swipeThreshold = 50; // Minimum distance for a swipe
        const swipeDistanceX = touchEndX - touchStartX;
        const swipeDistanceY = touchEndY - touchStartY;
        
        // Only handle horizontal swipes (ignore vertical scrolling)
        if (Math.abs(swipeDistanceX) > Math.abs(swipeDistanceY) && Math.abs(swipeDistanceX) > swipeThreshold) {
            if (swipeDistanceX > 0) {
                // Swiped right - go to previous slide
                presentation.previousSlide();
            } else {
                // Swiped left - go to next slide
                presentation.nextSlide();
            }
        }
    }
    
    // Add focus management for better accessibility
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
            document.body.classList.add('using-keyboard');
        }
    });
    
    document.addEventListener('mousedown', () => {
        document.body.classList.remove('using-keyboard');
    });
    
    // Add presentation shortcuts help
    document.addEventListener('keydown', (e) => {
        if (e.key === '?' || (e.key === '/' && e.shiftKey)) {
            e.preventDefault();
            showKeyboardShortcuts();
        }
    });
    
    function showKeyboardShortcuts() {
        const shortcuts = [
            '← / ↑ : Previous slide',
            '→ / ↓ / Space : Next slide',
            'Home : First slide',
            'End : Last slide',
            'F11 / Ctrl+F : Fullscreen',
            'Ctrl+T : Toggle theme',
            'Esc : Exit fullscreen',
            '? : Show shortcuts'
        ];
        
        console.log('⌨️ Keyboard Shortcuts:\n' + shortcuts.join('\n'));
    }
    
    // Add slide preloading for better performance
    function preloadSlides() {
        const slideImages = document.querySelectorAll('.slide img');
        slideImages.forEach(img => {
            if (img.dataset.src) {
                img.src = img.dataset.src;
            }
        });
    }
    
    preloadSlides();
    
    // Console welcome message with enhanced info
    console.log('🎯 Business Intelligence System Presentation');
    console.log('📊 Navigation: Use arrow keys, spacebar, or buttons');
    console.log('🔍 Debug: Access presentation object via window.presentation');
    console.log('📱 Mobile: Swipe left/right to navigate');
    console.log('⌨️  Shortcuts: Press ? for help, F11 for fullscreen');
    console.log('🎨 Theme: Ctrl+T to toggle light/dark mode');
    console.log(`📈 Total slides: ${presentation.totalSlides}`);
    
    // Analytics tracking (optional)
    function trackSlideView(slideNumber) {
        // This could be connected to analytics service
        if (typeof gtag !== 'undefined') {
            gtag('event', 'slide_view', {
                slide_number: slideNumber,
                slide_title: presentation.getCurrentSlideInfo().title
            });
        }
    }
    
    // Track initial slide view
    trackSlideView(1);
    
    // Track subsequent slide changes
    document.addEventListener('slidechange', (e) => {
        trackSlideView(e.detail.slideNumber);
    });
});

// Handle window resize for responsive behavior
window.addEventListener('resize', debounce(() => {
    // Ensure slides maintain proper sizing
    const slides = document.querySelectorAll('.slide');
    slides.forEach(slide => {
        slide.style.height = '100%';
    });
    
    // Recalculate dot layout if needed
    const dotsContainer = document.querySelector('.slide-dots');
    if (dotsContainer) {
        // Force reflow for proper positioning
        dotsContainer.style.display = 'none';
        dotsContainer.offsetHeight; // Trigger reflow
        dotsContainer.style.display = 'flex';
    }
}, 250));

// Debounce utility function
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Handle visibility change (pause/resume when tab becomes inactive/active)
document.addEventListener('visibilitychange', () => {
    if (window.presentation) {
        if (document.hidden) {
            window.presentation.stopAutoAdvance();
        } else {
            // Resume functionality if needed
            const currentInfo = window.presentation.getCurrentSlideInfo();
            console.log(`👁️ Tab active - Currently on slide ${currentInfo.current}: ${currentInfo.title}`);
        }
    }
});

// Export for potential module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SlidePresentation;
}

// Service worker registration for offline functionality (optional)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then((registration) => {
                console.log('📡 ServiceWorker registered successfully');
            })
            .catch((error) => {
                console.log('📡 ServiceWorker registration failed');
            });
    });
}