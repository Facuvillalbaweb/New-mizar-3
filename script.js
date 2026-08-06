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

    // --- 6. STARFIELD (PARTÍCULAS DE FONDO) ---
    const canvas = document.getElementById('starfield');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let width, height, stars = [];
        const starCount = 100, connectionDistance = 100;

        function resize() { width = canvas.width = window.innerWidth; height = canvas.height = window.innerHeight; }
        
        class Star {
            constructor() {
                this.x = Math.random() * width; this.y = Math.random() * height;
                this.vx = (Math.random() - 0.5) * 0.5; this.vy = (Math.random() - 0.5) * 0.5;
                this.size = Math.random() * 2;
            }
            update() {
                this.x += this.vx; this.y += this.vy;
                if (this.x < 0 || this.x > width) this.vx *= -1;
                if (this.y < 0 || this.y > height) this.vy *= -1;
            }
            draw() {
                ctx.fillStyle = "rgba(255, 255, 255, 0.5)"; ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2); ctx.fill();
            }
        }

        function initStars() { stars = []; for (let i = 0; i < starCount; i++) stars.push(new Star()); }

        function animate() {
            ctx.clearRect(0, 0, width, height);
            stars.forEach(star => { star.update(); star.draw(); });
            for (let i = 0; i < stars.length; i++) {
                for (let j = i + 1; j < stars.length; j++) {
                    const dx = stars[i].x - stars[j].x, dy = stars[i].y - stars[j].y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < connectionDistance) {
                        ctx.strokeStyle = `rgba(100, 255, 218, ${1 - dist/connectionDistance})`;
                        ctx.lineWidth = 0.5; ctx.beginPath();
                        ctx.moveTo(stars[i].x, stars[i].y); ctx.lineTo(stars[j].x, stars[j].y); ctx.stroke();
                    }
                }
            }
            requestAnimationFrame(animate);
        }
        window.addEventListener('resize', resize); resize(); initStars(); animate();
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