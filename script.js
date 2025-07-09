// Portfolio Interactive Skills Section
class SkillsPortfolio {
    constructor() {
        this.stickyNotes = [];
        this.currentFilter = 'all';
        this.isDragging = false;
        this.dragElement = null;
        this.initialPositions = new Map();
        
        this.init();
    }

    init() {
        this.setupStickyNotes();
        this.setupEventListeners();
        this.setupAnimations();
        this.saveInitialPositions();
    }

    setupStickyNotes() {
        const notes = document.querySelectorAll('.sticky-note');
        notes.forEach((note, index) => {
            // Set animation delay and rotation for staggered entrance
            note.style.setProperty('--index', index);
            note.style.setProperty('--rotation', this.getRandomRotation());
            
            this.stickyNotes.push(note);
            
            // Add click handler for expansion
            note.addEventListener('click', (e) => this.handleNoteClick(e, note));
            
            // Add keyboard support
            note.addEventListener('keydown', (e) => this.handleNoteKeydown(e, note));
            note.setAttribute('tabindex', '0');
            note.setAttribute('role', 'button');
            note.setAttribute('aria-label', `Skill: ${note.querySelector('h3').textContent}. Click to expand.`);
        });
    }

    setupEventListeners() {
        // Filter buttons
        const filterButtons = document.querySelectorAll('.filter-btn');
        filterButtons.forEach(btn => {
            btn.addEventListener('click', (e) => this.handleFilter(e));
        });

        // Reset layout button
        const resetBtn = document.getElementById('resetLayout');
        resetBtn.addEventListener('click', () => this.resetLayout());

        // Drag and drop functionality
        this.setupDragAndDrop();

        // Keyboard navigation
        document.addEventListener('keydown', (e) => this.handleGlobalKeydown(e));

        // Touch events for mobile
        this.setupTouchEvents();
    }

    setupDragAndDrop() {
        this.stickyNotes.forEach(note => {
            note.addEventListener('mousedown', (e) => this.startDrag(e, note));
            note.addEventListener('touchstart', (e) => this.startDrag(e, note), { passive: false });
        });

        document.addEventListener('mousemove', (e) => this.drag(e));
        document.addEventListener('touchmove', (e) => this.drag(e), { passive: false });
        document.addEventListener('mouseup', () => this.endDrag());
        document.addEventListener('touchend', () => this.endDrag());
    }

    setupTouchEvents() {
        this.stickyNotes.forEach(note => {
            note.addEventListener('touchstart', (e) => {
                // Prevent default to avoid scrolling while dragging
                e.preventDefault();
            }, { passive: false });
        });
    }

    startDrag(e, note) {
        if (e.target.closest('.sticky-header') || e.target.closest('.sticky-content')) {
            return; // Don't start drag if clicking on content
        }

        this.isDragging = true;
        this.dragElement = note;
        
        // Add dragging class
        note.classList.add('dragging');
        
        // Get initial position
        const rect = note.getBoundingClientRect();
        this.dragOffset = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };

        // Prevent text selection
        e.preventDefault();
    }

    drag(e) {
        if (!this.isDragging || !this.dragElement) return;

        const clientX = e.clientX || (e.touches && e.touches[0].clientX);
        const clientY = e.clientY || (e.touches && e.touches[0].clientY);

        if (!clientX || !clientY) return;

        const canvas = document.getElementById('skillsCanvas');
        const canvasRect = canvas.getBoundingClientRect();
        
        // Calculate new position
        let newX = clientX - canvasRect.left - this.dragOffset.x;
        let newY = clientY - canvasRect.top - this.dragOffset.y;
        
        // Constrain to canvas bounds
        const noteWidth = this.dragElement.offsetWidth;
        const noteHeight = this.dragElement.offsetHeight;
        
        newX = Math.max(0, Math.min(newX, canvasRect.width - noteWidth));
        newY = Math.max(0, Math.min(newY, canvasRect.height - noteHeight));
        
        // Apply new position
        this.dragElement.style.left = newX + 'px';
        this.dragElement.style.top = newY + 'px';
        this.dragElement.style.transform = 'rotate(0deg)'; // Straighten while dragging
        
        e.preventDefault();
    }

    endDrag() {
        if (this.dragElement) {
            this.dragElement.classList.remove('dragging');
            this.dragElement = null;
        }
        this.isDragging = false;
    }

    handleNoteClick(e, note) {
        if (this.isDragging) return; // Don't expand if we were dragging
        
        // Toggle expansion
        const isExpanded = note.classList.contains('expanded');
        
        // Collapse all other notes first
        this.stickyNotes.forEach(n => n.classList.remove('expanded'));
        
        if (!isExpanded) {
            note.classList.add('expanded');
            note.setAttribute('aria-expanded', 'true');
            
            // Add subtle animation
            note.style.animation = 'none';
            note.offsetHeight; // Trigger reflow
            note.style.animation = 'expandNote 0.3s ease-out';
        } else {
            note.setAttribute('aria-expanded', 'false');
        }
    }

    handleNoteKeydown(e, note) {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            this.handleNoteClick(e, note);
        }
    }

    handleGlobalKeydown(e) {
        if (e.key === 'Escape') {
            // Collapse all expanded notes
            this.stickyNotes.forEach(note => {
                note.classList.remove('expanded');
                note.setAttribute('aria-expanded', 'false');
            });
        }
    }

    handleFilter(e) {
        const category = e.currentTarget.dataset.category;
        
        // Update active button
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        e.currentTarget.classList.add('active');
        
        this.currentFilter = category;
        this.filterNotes(category);
    }

    filterNotes(category) {
        this.stickyNotes.forEach(note => {
            const noteCategory = note.dataset.category;
            const shouldShow = category === 'all' || noteCategory === category;
            
            if (shouldShow) {
                note.classList.remove('hidden');
                note.style.animation = 'fadeInUp 0.4s ease-out';
            } else {
                note.classList.add('hidden');
            }
        });
    }

    saveInitialPositions() {
        this.stickyNotes.forEach(note => {
            const rect = note.getBoundingClientRect();
            const canvas = document.getElementById('skillsCanvas');
            const canvasRect = canvas.getBoundingClientRect();
            
            this.initialPositions.set(note, {
                left: rect.left - canvasRect.left,
                top: rect.top - canvasRect.top,
                transform: note.style.transform
            });
        });
    }

    resetLayout() {
        // Collapse all expanded notes
        this.stickyNotes.forEach(note => {
            note.classList.remove('expanded');
            note.setAttribute('aria-expanded', 'false');
        });

        // Reset to initial positions with animation
        this.stickyNotes.forEach((note, index) => {
            const initialPos = this.initialPositions.get(note);
            if (initialPos) {
                note.style.transition = 'all 0.6s ease-out';
                note.style.left = initialPos.left + 'px';
                note.style.top = initialPos.top + 'px';
                note.style.transform = initialPos.transform;
                
                // Reset transition after animation
                setTimeout(() => {
                    note.style.transition = '';
                }, 600);
            }
        });

        // Reset filter
        this.currentFilter = 'all';
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector('[data-category="all"]').classList.add('active');
        this.filterNotes('all');
    }

    setupAnimations() {
        // Add CSS animation for note expansion
        const style = document.createElement('style');
        style.textContent = `
            @keyframes expandNote {
                0% { transform: scale(1) rotate(var(--rotation)); }
                50% { transform: scale(1.1) rotate(0deg); }
                100% { transform: scale(1.05) rotate(0deg); }
            }
            
            .sticky-note.dragging {
                z-index: 1000 !important;
                box-shadow: 0 12px 24px rgba(0,0,0,0.2) !important;
            }
        `;
        document.head.appendChild(style);
    }

    getRandomRotation() {
        return Math.random() * 8 - 4; // Random rotation between -4 and 4 degrees
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new SkillsPortfolio();
    
    // Add some playful interactions
    const canvas = document.getElementById('skillsCanvas');
    
    // Add subtle parallax effect on mouse move
    canvas.addEventListener('mousemove', (e) => {
        if (window.innerWidth > 768) { // Only on desktop
            const rect = canvas.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width;
            const y = (e.clientY - rect.top) / rect.height;
            
            document.querySelectorAll('.sticky-note:not(.dragging):not(.expanded)').forEach(note => {
                const speed = 0.02;
                const moveX = (x - 0.5) * speed * 20;
                const moveY = (y - 0.5) * speed * 20;
                
                note.style.transform = `translate(${moveX}px, ${moveY}px) rotate(var(--rotation))`;
            });
        }
    });
    
    // Reset parallax when mouse leaves
    canvas.addEventListener('mouseleave', () => {
        document.querySelectorAll('.sticky-note:not(.dragging):not(.expanded)').forEach(note => {
            note.style.transform = `rotate(var(--rotation))`;
        });
    });
});

// Add smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Add intersection observer for animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe sections for scroll animations
document.querySelectorAll('.section').forEach(section => {
    section.style.opacity = '0';
    section.style.transform = 'translateY(30px)';
    section.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
    observer.observe(section);
}); 