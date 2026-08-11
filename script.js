document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. PRELOADER LÓGICA (CORREGIDA) ---
    const preloader = document.getElementById('preloader');
    const loaderText = document.querySelector('.loader-text');
    
    // Verificamos si el usuario ya vio el preloader en esta sesión
    const yaVioPreloader = sessionStorage.getItem('preloaderVisto');

    if(loaderText) {
        const finalVal = loaderText.getAttribute('data-final') || "CARGANDO";
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()';
        let iterations = 0;
        
        // Animación de las letras estilo "Matrix"
        const interval = setInterval(() => {
            loaderText.innerText = finalVal.split('')
                .map((letter, index) => {
                    if(index < iterations) return finalVal[index];
                    return characters[Math.floor(Math.random() * characters.length)];
                }).join('');
            if(iterations >= finalVal.length) clearInterval(interval);
            iterations += 1/3; 
        }, 50);
    }

    // Lógica de tiempo de carga inteligente
    let tiempoDeEspera = 1500; // Por defecto 1.5s para la primera visita

    if (yaVioPreloader) {
        // Si ya lo vio antes en esta sesión, reducimos el tiempo drásticamente a 200ms
        tiempoDeEspera = 200; 
    }

    setTimeout(() => {
        if (document.readyState === 'complete') {
            finishLoading();
        } else {
            window.addEventListener('load', finishLoading);
        }
    }, tiempoDeEspera);

    function finishLoading() {
        if(preloader) {
            preloader.classList.add('loaded');
            // Guardamos en la memoria que ya vio el preloader
            sessionStorage.setItem('preloaderVisto', 'true');
            
            setTimeout(() => preloader.style.display = 'none', 800);
        }
    }
    // --- 2. MENÚ MÓVIL ---
    const menuToggle = document.querySelector('.menu-toggle');
    const mobileMenu = document.querySelector('.mobile-menu-overlay');

    function toggleMobileMenu() {
        if(mobileMenu && menuToggle) {
            mobileMenu.classList.toggle('active');
            menuToggle.classList.toggle('open'); 
        }
    }
    if(menuToggle) menuToggle.addEventListener('click', toggleMobileMenu);

    // --- 3. LÓGICA SUB-MENÚ "NOSOTROS" ---
    const aboutNavBtns = document.querySelectorAll('.sub-nav-btn');
    const aboutTabs = document.querySelectorAll('.about-tab-content');

    aboutNavBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            aboutNavBtns.forEach(b => b.classList.remove('active'));
            aboutTabs.forEach(t => t.classList.remove('active'));
            btn.classList.add('active');
            const targetId = `tab-${btn.dataset.sub}`;
            const targetTab = document.getElementById(targetId);
            if(targetTab) targetTab.classList.add('active');
        });
    });

    // --- 4. FILTRADO Y SCROLL DE PORTFOLIO ---
    const filterBtns = document.querySelectorAll('.filter-btn');
    const projectCards = document.querySelectorAll('.project-card');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const filterValue = btn.dataset.filter;
            projectCards.forEach(card => {
                if (filterValue === 'all' || card.dataset.category === filterValue) {
                    card.classList.remove('hidden');
                    card.style.opacity = '0';
                    setTimeout(() => card.style.opacity = '1', 50);
                } else {
                    card.classList.add('hidden');
                }
            });
        });
    });
    
    const scrollContainer = document.querySelector('.horizontal-scroll-container');
    if (scrollContainer) {
        scrollContainer.addEventListener('wheel', (evt) => {
            if(scrollContainer.scrollWidth > scrollContainer.clientWidth) {
                evt.preventDefault();
                scrollContainer.scrollLeft += evt.deltaY;
            }
        });
    }

    // --- 5. CARRUSEL DE RESEÑAS ---
    const track = document.querySelector('.carousel-track');
    if (track) {
        const slides = Array.from(track.children);
        const nextButton = document.querySelector('.carousel-btn.next');
        const prevButton = document.querySelector('.carousel-btn.prev');
        let currentSlideIndex = 0;

        function updateCarousel() {
            slides.forEach(slide => slide.classList.remove('current-slide'));
            if(slides[currentSlideIndex]) slides[currentSlideIndex].classList.add('current-slide');
        }

        if (nextButton) nextButton.addEventListener('click', () => { currentSlideIndex = (currentSlideIndex + 1) % slides.length; updateCarousel(); });
        if (prevButton) prevButton.addEventListener('click', () => { currentSlideIndex = (currentSlideIndex - 1 + slides.length) % slides.length; updateCarousel(); });
    }

    // --- 6. AURORA BACKGROUND (ONDAS DE GRADIENTE SUAVES) ---
    const canvas = document.getElementById('starfield');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let width, height, blobs = [], stars = [];
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        // Paleta oficial de la marca (ver style.css :root)
        const palette = [
            { r: 100, g: 255, b: 218 }, // --accent-cyan
            { r: 0,   g: 180, b: 216 }, // --accent-blue
            { r: 123, g: 44,  b: 191 }  // --accent-purple
        ];

        function resize() { width = canvas.width = window.innerWidth; height = canvas.height = window.innerHeight; }

        // Cada "blob" es una gran mancha de gradiente radial que deriva
        // lentamente en un recorrido orgánico (senos/cosenos desfasados),
        // simulando una aurora boreal suave sobre el fondo oscuro.
        class AuroraBlob {
            constructor(colorIndex) {
                this.color = palette[colorIndex % palette.length];
                this.baseX = Math.random();
                this.baseY = Math.random();
                this.radiusRatio = 0.38 + Math.random() * 0.22;
                this.speed = 0.00012 + Math.random() * 0.00010;
                this.angle = Math.random() * Math.PI * 2;
                this.driftX = 0.16 + Math.random() * 0.12;
                this.driftY = 0.12 + Math.random() * 0.10;
                this.alpha = 0.14 + Math.random() * 0.07;
            }
            update(t) {
                this.x = (this.baseX + Math.sin(t * this.speed + this.angle) * this.driftX) * width;
                this.y = (this.baseY + Math.cos(t * this.speed * 0.8 + this.angle) * this.driftY) * height;
            }
            draw() {
                const r = Math.max(width, height) * this.radiusRatio;
                const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, r);
                gradient.addColorStop(0, `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${this.alpha})`);
                gradient.addColorStop(1, `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, 0)`);
                ctx.fillStyle = gradient;
                ctx.fillRect(0, 0, width, height);
            }
        }

        // Un puñado de estrellas muy tenues y sin conexiones, como guiño
        // a la identidad "Mizar" sin volver al look anterior de puntos.
        class Star {
            constructor() {
                this.x = Math.random() * width; this.y = Math.random() * height;
                this.size = Math.random() * 1.1 + 0.3;
                this.baseAlpha = Math.random() * 0.3 + 0.1;
                this.twinkleSpeed = 0.0006 + Math.random() * 0.0008;
                this.phase = Math.random() * Math.PI * 2;
            }
            draw(t) {
                const alpha = this.baseAlpha * (0.5 + 0.5 * Math.sin(t * this.twinkleSpeed + this.phase));
                ctx.fillStyle = `rgba(230, 241, 255, ${alpha})`;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2); ctx.fill();
            }
        }

        function init() {
            blobs = [0, 1, 2, 0, 1].map(i => new AuroraBlob(i));
            stars = Array.from({ length: 45 }, () => new Star());
        }

        function renderFrame(t) {
            ctx.clearRect(0, 0, width, height);
            ctx.globalCompositeOperation = 'lighter';
            blobs.forEach(blob => { blob.update(t); blob.draw(); });
            ctx.globalCompositeOperation = 'source-over';
            stars.forEach(star => star.draw(t));
        }

        function animate(t) {
            renderFrame(t);
            requestAnimationFrame(animate);
        }

        window.addEventListener('resize', resize);
        resize();
        init();

        // Respetamos la preferencia de movimiento reducido del usuario
        if (prefersReducedMotion) {
            renderFrame(0);
        } else {
            requestAnimationFrame(animate);
        }
    }
    // --- 7. SMART HEADER (Oculta el menú al bajar, lo muestra al subir) ---
    const header = document.querySelector('.main-header');
    const scrollableSections = document.querySelectorAll('.section');
    let ultimoScroll = 0;

    scrollableSections.forEach(section => {
        section.addEventListener('scroll', () => {
            let scrollActual = section.scrollTop;
            
            // Si bajamos y ya pasamos los primeros 60px, ocultamos el header
            if (scrollActual > ultimoScroll && scrollActual > 60) {
                // Usamos translate(-50%, -150%) para mantenerlo centrado pero moverlo hacia arriba fuera de la vista
                header.style.transform = 'translate(-50%, -150%)';
            } 
            // Si subimos, lo traemos de vuelta a su posición original
            else {
                header.style.transform = 'translate(-50%, 0)';
            }
            
            ultimoScroll = scrollActual;
        });
    });
});