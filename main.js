/**
 * SCOBYSUN Landing — Main JS
 * 
 * Features:
 * - Dynamic bottle image loading with graceful fallback
 * - Scroll-triggered reveal animations (IntersectionObserver)
 * - Mouse parallax effect on bottles & organic shapes
 * - Scroll-based parallax on parallax-element nodes
 * - Scroll progress indicator
 * - Smooth anchor navigation
 */

document.addEventListener('DOMContentLoaded', () => {
    const snapContainer = document.querySelector('.snap-container');
    const sections = document.querySelectorAll('.fullscreen-section');
    const bottleContainers = document.querySelectorAll('.bottle-container, .hero-bottle');
    const scrollDots = document.querySelectorAll('.scroll-dot');
    const parallaxElements = document.querySelectorAll('.parallax-element');

    // =========================================
    // 1. BOTTLE IMAGE LOADING
    // =========================================
    bottleContainers.forEach(container => {
        const flavor = container.getAttribute('data-flavor');
        if (!flavor) return;

        const img = document.createElement('img');
        img.alt = `SCOBYSUN ${flavor} kombucha bottle`;
        img.style.opacity = '0';
        img.style.transform = 'translateY(30px) scale(0.95)';
        img.style.transition = 'opacity 1.2s cubic-bezier(0.16, 1, 0.3, 1), transform 1.2s cubic-bezier(0.16, 1, 0.3, 1)';
        
        // Insert into DOM immediately so browser can start loading
        container.appendChild(img);
        
        img.onload = () => {
            requestAnimationFrame(() => {
                img.style.opacity = '1';
                img.style.transform = 'translateY(0) scale(1)';
            });
        };

        img.onerror = () => {
            container.classList.add('image-missing');
        };

        // Set src AFTER appending to DOM
        img.src = `/img/${flavor}.png`;
    });

    // =========================================
    // 2. SCROLL REVEAL ANIMATIONS
    // =========================================
    const revealElements = document.querySelectorAll('.reveal-up, .reveal-scale, .reveal-left, .reveal-right');

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, {
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px'
    });

    revealElements.forEach(el => revealObserver.observe(el));

    // =========================================
    // 3. SCROLL PROGRESS INDICATOR
    // =========================================
    const updateScrollProgress = () => {
        const scrollTop = snapContainer.scrollTop;
        const viewportHeight = window.innerHeight;

        sections.forEach((section, index) => {
            const sectionTop = section.offsetTop;
            const sectionMid = sectionTop + viewportHeight / 2;
            
            if (scrollTop >= sectionTop - viewportHeight / 2 && scrollTop < sectionTop + viewportHeight / 2) {
                scrollDots.forEach(d => d.classList.remove('active'));
                if (scrollDots[index]) scrollDots[index].classList.add('active');
            }
        });
    };

    snapContainer.addEventListener('scroll', updateScrollProgress, { passive: true });

    // Dot click navigation
    scrollDots.forEach(dot => {
        dot.addEventListener('click', () => {
            const targetId = dot.getAttribute('data-target');
            const targetSection = document.getElementById(targetId);
            if (targetSection) {
                targetSection.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    // =========================================
    // 4. PARALLAX ON SCROLL
    // =========================================
    const handleScrollParallax = () => {
        const scrollTop = snapContainer.scrollTop;

        parallaxElements.forEach(el => {
            const speed = parseFloat(el.getAttribute('data-speed')) || 0;
            const rect = el.closest('.fullscreen-section')?.getBoundingClientRect();
            if (!rect) return;

            const sectionCenter = rect.top + rect.height / 2;
            const viewportCenter = window.innerHeight / 2;
            const offset = (sectionCenter - viewportCenter) * speed;

            el.style.transform = `translateY(${offset}px)`;
        });
    };

    snapContainer.addEventListener('scroll', handleScrollParallax, { passive: true });

    // =========================================
    // 5. MOUSE PARALLAX (Desktop only)
    // =========================================
    let mouseX = 0;
    let mouseY = 0;
    let currentX = 0;
    let currentY = 0;

    const handleMouseParallax = () => {
        // Smooth lerp
        currentX += (mouseX - currentX) * 0.06;
        currentY += (mouseY - currentY) * 0.06;

        const bottles = document.querySelectorAll('.bottle-container:not(.image-missing) img');
        bottles.forEach(bottle => {
            const parent = bottle.closest('.fullscreen-section');
            if (!parent) return;
            const rect = parent.getBoundingClientRect();
            
            // Only apply to visible sections
            if (rect.top > -100 && rect.top < window.innerHeight) {
                bottle.style.transform = `translate(${currentX * 15}px, ${currentY * 15}px)`;
            }
        });

        // Move blobs
        const blobs = document.querySelectorAll('.organic-blob, .flavor-blob');
        blobs.forEach(blob => {
            const parent = blob.closest('.fullscreen-section');
            if (!parent) return;
            const rect = parent.getBoundingClientRect();
            
            if (rect.top > -200 && rect.top < window.innerHeight) {
                const speed = parseFloat(blob.getAttribute('data-speed')) || 0.02;
                blob.style.transform = `translate(${currentX * 40 * speed * 10}px, ${currentY * 40 * speed * 10}px)`;
            }
        });

        requestAnimationFrame(handleMouseParallax);
    };

    if (window.matchMedia('(min-width: 1024px)').matches) {
        document.addEventListener('mousemove', (e) => {
            mouseX = (e.clientX / window.innerWidth) - 0.5;
            mouseY = (e.clientY / window.innerHeight) - 0.5;
        });

        requestAnimationFrame(handleMouseParallax);
    }

    // =========================================
    // 6. SMOOTH ANCHOR SCROLL
    // =========================================
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                targetSection.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    // =========================================
    // 7. INITIAL ANIMATIONS
    // =========================================
    // Trigger hero animations after a small delay
    setTimeout(() => {
        document.querySelectorAll('#hero .reveal-up, #hero .reveal-scale').forEach(el => {
            el.classList.add('visible');
        });
    }, 300);
});
