document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. PRELOADER LÓGICA (CORREGIDA) ---
    const preloader = document.getElementById('preloader');
    const loaderText = document.querySelector('.loader-text');
    
    // Verificamos si el usuario ya vio el preloader en esta sesión
    const yaVioPreloader = sessionStorage.getItem('preloaderVisto');

    if(loaderText) {
        const finalVal = loaderText.getAttribute('data-final') || "CARGANDO";
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        let iterations = 0;

        // Revelado progresivo de las letras, más pausado y prolijo
        const interval = setInterval(() => {
            loaderText.innerText = finalVal.split('')
                .map((letter, index) => {
                    if(index < iterations) return finalVal[index];
                    return characters[Math.floor(Math.random() * characters.length)];
                }).join('');
            if(iterations >= finalVal.length) clearInterval(interval);
            iterations += 1/4;
        }, 60);
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

    // --- 8. POPOVER DE RESEÑAS (Inicio) ---
    const reviewsTriggerBtn = document.getElementById('reviewsTriggerBtn');
    const reviewsPopover = document.getElementById('reviewsPopover');
    const reviewsBackdrop = document.getElementById('reviewsBackdrop');

    function closeReviewsPopover() {
        if (reviewsPopover) reviewsPopover.classList.remove('active');
        if (reviewsBackdrop) reviewsBackdrop.classList.remove('active');
    }

    if (reviewsTriggerBtn && reviewsPopover) {
        reviewsTriggerBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const isActive = reviewsPopover.classList.toggle('active');
            if (reviewsBackdrop) reviewsBackdrop.classList.toggle('active', isActive);
        });

        document.addEventListener('click', (e) => {
            if (reviewsPopover.classList.contains('active') && !e.target.closest('.reviews-popover')) {
                closeReviewsPopover();
            }
        });
    }

    // --- 9. PORTFOLIO: ARRASTRAR PARA DESPLAZAR (2 filas, scroll horizontal) ---
    const portfolioScroll = document.querySelector('.portfolio-scroll-container');
    if (portfolioScroll) {
        let isDown = false;
        let dragMoved = false;
        let startX = 0;
        let scrollStart = 0;

        const dragStart = (x) => {
            isDown = true;
            dragMoved = false;
            startX = x;
            scrollStart = portfolioScroll.scrollLeft;
            portfolioScroll.classList.add('dragging');
        };
        const dragMove = (x) => {
            if (!isDown) return;
            const delta = x - startX;
            if (Math.abs(delta) > 5) dragMoved = true;
            portfolioScroll.scrollLeft = scrollStart - delta;
        };
        const dragEnd = () => {
            isDown = false;
            portfolioScroll.classList.remove('dragging');
        };

        portfolioScroll.addEventListener('dragstart', (e) => e.preventDefault());
        portfolioScroll.addEventListener('mousedown', (e) => dragStart(e.pageX));
        window.addEventListener('mousemove', (e) => { if (isDown) { e.preventDefault(); dragMove(e.pageX); } });
        window.addEventListener('mouseup', dragEnd);

        portfolioScroll.addEventListener('touchstart', (e) => dragStart(e.touches[0].pageX), { passive: true });
        portfolioScroll.addEventListener('touchmove', (e) => dragMove(e.touches[0].pageX), { passive: true });
        portfolioScroll.addEventListener('touchend', dragEnd);

        portfolioScroll.addEventListener('click', (e) => {
            if (dragMoved) { e.preventDefault(); e.stopPropagation(); }
        }, true);
    }

    // --- 10. SWIPE ENTRE PÁGINAS (arrastrar el dedo hacia los costados) ---
    const pageOrder = ['index.html', 'servicios.html', 'proyectos.html', 'contacto.html'];

    function currentPageIndex() {
        let path = location.pathname.split('/').pop();
        if (path === '') path = 'index.html';
        const idx = pageOrder.indexOf(path);
        return idx === -1 ? 0 : idx;
    }

    function goToAdjacentPage(delta) {
        const nextIdx = currentPageIndex() + delta;
        if (nextIdx >= 0 && nextIdx < pageOrder.length) {
            window.location.href = pageOrder[nextIdx];
        }
    }

    (function initPageSwipeNavigation() {
        const SWIPE_THRESHOLD = 80;
        let tracking = false;
        let startX = 0;
        let startY = 0;

        document.addEventListener('touchstart', (e) => {
            const target = e.target;
            if (target.closest('[data-no-swipe]') || target.closest('.mobile-menu-overlay') || target.closest('.reviews-popover')) {
                tracking = false;
                return;
            }
            tracking = true;
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
        }, { passive: true });

        document.addEventListener('touchend', (e) => {
            if (!tracking) return;
            tracking = false;
            const touch = e.changedTouches[0];
            const dx = touch.clientX - startX;
            const dy = touch.clientY - startY;
            if (Math.abs(dx) > SWIPE_THRESHOLD && Math.abs(dx) > Math.abs(dy) * 1.5) {
                goToAdjacentPage(dx < 0 ? 1 : -1);
            }
        });
    })();

    // --- 11. MENÚ MÓVIL: ARRASTRAR HACIA LA DERECHA PARA CERRAR ---
    if (mobileMenu) {
        const CLOSE_THRESHOLD = 90;
        let menuDragging = false;
        let menuStartX = 0;
        let menuCurrentX = 0;

        mobileMenu.addEventListener('touchstart', (e) => {
            if (!mobileMenu.classList.contains('active')) return;
            menuDragging = true;
            menuStartX = e.touches[0].clientX;
            menuCurrentX = menuStartX;
            mobileMenu.style.transition = 'none';
        }, { passive: true });

        mobileMenu.addEventListener('touchmove', (e) => {
            if (!menuDragging) return;
            menuCurrentX = e.touches[0].clientX;
            const delta = Math.max(0, menuCurrentX - menuStartX);
            mobileMenu.style.transform = `translateX(${delta}px)`;
        }, { passive: true });

        mobileMenu.addEventListener('touchend', () => {
            if (!menuDragging) return;
            menuDragging = false;
            mobileMenu.style.transition = '';
            const delta = menuCurrentX - menuStartX;
            mobileMenu.style.transform = '';
            if (delta > CLOSE_THRESHOLD) toggleMobileMenu();
        });
    }
});

/* ============================================================
   MIZAR MOTION LAYER — capa de movimiento
   Añade animaciones de entrada, fondo generativo, hovers
   avanzados, efectos ambientales automáticos y transiciones
   de página. No modifica la estructura del sitio.
   ============================================================ */
(function () {
    'use strict';

    var REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var FINE_POINTER = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

    document.documentElement.classList.add('anim-ready');

    function ready(fn) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', fn);
        } else {
            fn();
        }
    }

    function rand(min, max) { return min + Math.random() * (max - min); }
    function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

    /* --------------------------------------------------------
       1. DIVISOR DE TEXTO (letras / palabras)
       Recorre los nodos de texto sin alterar la estructura de
       etiquetas internas (<strong>, <small>, etc.).
       -------------------------------------------------------- */
    function splitText(el, mode) {
        if (el.dataset.split) return 0;
        var idx = 0;

        function walk(node) {
            var kids = Array.prototype.slice.call(node.childNodes);
            kids.forEach(function (child) {
                if (child.nodeType === 3) {
                    var text = child.textContent;
                    if (!text.replace(/\s/g, '').length) return;

                    var frag = document.createDocumentFragment();
                    text.split(/(\s+)/).forEach(function (part) {
                        if (part === '') return;
                        if (/^\s+$/.test(part)) {
                            frag.appendChild(document.createTextNode(part));
                            return;
                        }
                        var word = document.createElement('span');
                        word.className = 'an-word';
                        word.style.setProperty('--wi', idx);

                        if (mode === 'chars') {
                            Array.prototype.forEach.call(part, function (ch) {
                                var c = document.createElement('span');
                                c.className = 'an-char';
                                c.textContent = ch;
                                c.style.setProperty('--ci', idx);
                                c.style.setProperty('--rnd', rand(-1, 1).toFixed(2));
                                c.style.setProperty('--rnd2', rand(-1, 1).toFixed(2));
                                idx++;
                                word.appendChild(c);
                            });
                        } else {
                            word.textContent = part;
                            idx++;
                        }
                        frag.appendChild(word);
                    });
                    node.replaceChild(frag, child);
                } else if (child.nodeType === 1 && !child.classList.contains('an-word')) {
                    walk(child);
                }
            });
        }

        var label = el.textContent.trim();
        walk(el);
        el.dataset.split = mode;
        if (label && !el.getAttribute('aria-label')) el.setAttribute('aria-label', label);
        return idx;
    }

    /* --------------------------------------------------------
       2. PLAN DE ENTRADA
       Cada grupo usa un set de animaciones distintas que rotan
       por índice, para que ningún elemento entre igual que otro.
       -------------------------------------------------------- */
    var PLAN = [
        /* --- Header --- */
        { sel: '.logo-container', anims: ['spiralIn'], d: 0.10, dur: 1.15 },
        { sel: '.nav-btn', anims: ['dropBounce', 'flipX', 'popElastic', 'liquidRise'], d: 0.30, step: 0.085, dur: 0.9 },
        { sel: '.menu-toggle', anims: ['popElastic'], d: 0.34, dur: 0.85 },

        /* --- Home: hero --- */
        { sel: '.subtitle', split: 'chars', canim: 'charWave', d: 0.52, cstep: 0.026 },
        { sel: '.glitch-title', split: 'chars', canim: 'charScatter', d: 0.72, cstep: 0.021, cdur: 1.0 },
        { sel: '.hero-actions .btn-primary', anims: ['clipWipeUp'], d: 1.28, dur: 0.9 },
        { sel: '.hero-actions .btn-secondary', anims: ['rippleReveal'], d: 1.40, dur: 0.95 },
        { sel: '.reviews-trigger-btn', anims: ['flipY'], d: 1.50, dur: 1.0 },

        /* --- Home: sobre nosotros --- */
        { sel: '.title-about-hero', split: 'chars', canim: 'charFlip', d: 1.55, step: 0.28, cstep: 0.032 },
        { sel: '.about-description', split: 'words', wanim: 'wordBlur', d: 1.72, wstep: 0.032 },
        { sel: '.founder-card', anims: ['unfold3d', 'tiltDrop'], d: 1.95, step: 0.20, dur: 1.2 },

        /* --- Títulos genéricos --- */
        { sel: '.section-title:not(.title-about-hero)', split: 'chars', canim: 'charRise', d: 0.52, cstep: 0.031 },
        { sel: '.portfolio-subtitle', split: 'words', wanim: 'wordUnroll', d: 0.80, wstep: 0.05 },

        /* --- Servicios --- */
        { sel: '.sub-nav-btn', anims: ['swingIn', 'curtainSplit', 'stretchIn'], d: 0.85, step: 0.10, dur: 0.95 },
        { sel: '.service-card', anims: ['depthPush', 'foldPaper', 'flipY', 'liquidRise', 'orbitIn', 'irisOpen'], d: 1.02, step: 0.10, dur: 1.1 },
        { sel: '.skill-item', anims: ['irisOpen', 'tiltDrop', 'blurRise', 'foldPaper'], d: 0.98, step: 0.12, dur: 1.05 },
        { sel: '.tool-item', anims: ['stretchIn', 'popElastic', 'spiralIn', 'clipWipeLeft', 'dropBounce', 'neonFlicker'], d: 0.98, step: 0.085, dur: 0.95 },

        /* --- Proyectos --- */
        { sel: '.filter-btn', anims: ['curtainSplit', 'dropBounce', 'clipWipeUp', 'popElastic', 'stretchIn', 'swingIn'], d: 0.82, step: 0.075, dur: 0.85 },
        { sel: '.project-card', anims: ['shutter', 'tiltDrop', 'irisOpen', 'foldPaper', 'curtainSplit', 'depthPush', 'rippleReveal'], d: 1.06, step: 0.065, dur: 1.0 },

        /* --- Contacto --- */
        { sel: '.contact-info-col p', split: 'words', wanim: 'wordBlur', d: 0.78, wstep: 0.03 },
        { sel: '.method', anims: ['skewSlide', 'clipWipeLeft', 'rippleReveal'], d: 0.98, step: 0.14, dur: 1.05 },
        { sel: '.glass-form', anims: ['glassSlideUp'], d: 0.82, dur: 1.25 },
        { sel: '.form-group', anims: ['slideRightBlur', 'clipWipeUp', 'blurRise', 'skewSlide'], d: 1.12, step: 0.11, dur: 0.9 },
        { sel: '.glass-form .btn-primary', anims: ['popElastic'], d: 1.62, dur: 0.95 }
    ];

    var revealReady = false;
    var revealQueue = [];
    var readyStamp = 0;

    function reveal(el) {
        if (el.classList.contains('an-in')) return;
        if (!revealReady) {
            if (revealQueue.indexOf(el) === -1) revealQueue.push(el);
            return;
        }
        /* Fuera de la secuencia inicial usamos retardos compactos
           para que el scroll se sienta inmediato pero escalonado. */
        if (performance.now() - readyStamp > 2600) {
            var gi = parseInt(el.dataset.gi || '0', 10);
            el.style.setProperty('--d', (gi % 8) * 0.07 + 's');
        }
        el.classList.add('an-in');

        /* Al terminar, sellamos el elemento para que los efectos
           ambientales no vuelvan a disparar la animación de entrada. */
        var endMs = parseInt(el.dataset.mzEnd || '2600', 10);
        setTimeout(function () { el.classList.add('an-done'); }, endMs + 260);
    }

    function flushReveals() {
        revealReady = true;
        readyStamp = performance.now();
        document.body.classList.add('mz-ready');
        var pending = revealQueue.slice();
        revealQueue.length = 0;
        pending.forEach(reveal);
    }

    function buildEntrances() {
        var observer = null;
        if ('IntersectionObserver' in window) {
            observer = new IntersectionObserver(function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        reveal(entry.target);
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.06, rootMargin: '260px 300px -5% 300px' });
        }

        PLAN.forEach(function (rule) {
            var nodes = document.querySelectorAll(rule.sel);
            Array.prototype.forEach.call(nodes, function (el, i) {
                if (el.dataset.anim || el.dataset.split || el.dataset.mzDone) return;
                el.dataset.mzDone = '1';
                el.dataset.gi = i;

                var delay = (rule.d || 0) + i * (rule.step || 0);
                el.style.setProperty('--d', delay.toFixed(3) + 's');

                var endMs;
                if (rule.split) {
                    var pieces = splitText(el, rule.split) || 1;
                    endMs = (delay
                        + pieces * (rule.split === 'chars' ? (rule.cstep || 0.032) : (rule.wstep || 0.045))
                        + (rule.split === 'chars' ? (rule.cdur || 0.78) : (rule.wdur || 0.85))) * 1000;
                } else {
                    endMs = (delay + (rule.dur || 1)) * 1000;
                }
                el.dataset.mzEnd = Math.round(endMs);

                if (rule.split) {
                    if (rule.split === 'chars') {
                        el.setAttribute('data-canim', rule.canim || 'charRise');
                        el.style.setProperty('--cstep', (rule.cstep || 0.032) + 's');
                        if (rule.cdur) el.style.setProperty('--cdur', rule.cdur + 's');
                    } else {
                        el.setAttribute('data-wanim', rule.wanim || 'wordBlur');
                        el.style.setProperty('--wstep', (rule.wstep || 0.045) + 's');
                        if (rule.wdur) el.style.setProperty('--wdur', rule.wdur + 's');
                    }
                } else {
                    var name = rule.anims[i % rule.anims.length];
                    el.setAttribute('data-anim', name);
                    if (rule.dur) el.style.setProperty('--dur', rule.dur + 's');
                }

                if (observer) observer.observe(el); else reveal(el);
            });
        });
    }

    /* Reveal forzado para contenedores que pasan de display:none
       a visible (pestañas, menú, popover). */
    function forceReveal(root, stagger) {
        var items = root.querySelectorAll('[data-anim], [data-split]');
        Array.prototype.forEach.call(items, function (el, i) {
            el.classList.remove('an-in', 'an-done');
            el.style.setProperty('--d', (i * (stagger || 0.06)).toFixed(3) + 's');
            void el.offsetWidth;
            el.classList.add('an-in');
            var end = parseInt(el.dataset.mzEnd || '2000', 10);
            setTimeout(function () { el.classList.add('an-done'); }, end + 260);
        });
    }

    /* --------------------------------------------------------
       3. FONDO AMBIENTAL GENERATIVO
       Formas minimalistas, cintas ondulantes, polvo, ondas
       expansivas y meteoros ocasionales.
       -------------------------------------------------------- */
    function initAmbientBackground() {
        if (REDUCED) return;

        var canvas = document.createElement('canvas');
        canvas.id = 'ambient-layer';
        canvas.setAttribute('aria-hidden', 'true');
        document.body.appendChild(canvas);

        var ctx = canvas.getContext('2d');
        var W = 0, H = 0, DPR = 1;
        var polys = [], ribbons = [], dust = [], ripples = [], meteors = [], orbits = [];
        var mx = 0, my = 0, tmx = 0, tmy = 0;
        var lastRipple = 0, lastMeteor = 0;

        var CYAN = '100, 255, 218';
        var BLUE = '0, 180, 216';
        var PURP = '150, 90, 220';
        var TONES = [CYAN, BLUE, PURP];

        function resize() {
            DPR = Math.min(window.devicePixelRatio || 1, 2);
            W = window.innerWidth;
            H = window.innerHeight;
            canvas.width = W * DPR;
            canvas.height = H * DPR;
            canvas.style.width = W + 'px';
            canvas.style.height = H + 'px';
            ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
        }

        /* --- Polígonos wireframe que orbitan y respiran --- */
        function Poly() {
            this.sides = Math.floor(rand(3, 7));
            this.r = rand(38, 118);
            this.x = rand(0.05, 0.95);
            this.y = rand(0.05, 0.95);
            this.rot = rand(0, Math.PI * 2);
            this.spin = rand(-0.00016, 0.00016);
            this.driftA = rand(0, Math.PI * 2);
            this.driftS = rand(0.00006, 0.00016);
            this.driftR = rand(0.03, 0.10);
            this.breath = rand(0.00035, 0.00075);
            this.depth = rand(0.25, 1);
            this.tone = pick(TONES);
            this.alpha = rand(0.10, 0.26);
            this.dashed = Math.random() > 0.62;
        }
        Poly.prototype.draw = function (t) {
            var cx = (this.x + Math.cos(t * this.driftS + this.driftA) * this.driftR) * W + mx * 46 * this.depth;
            var cy = (this.y + Math.sin(t * this.driftS * 0.83 + this.driftA) * this.driftR * 0.7) * H + my * 34 * this.depth;
            var scale = 1 + Math.sin(t * this.breath + this.driftA) * 0.16;
            var rr = this.r * scale * this.depth;
            var ang = this.rot + t * this.spin;

            ctx.save();
            ctx.translate(cx, cy);
            ctx.rotate(ang);
            ctx.beginPath();
            for (var i = 0; i <= this.sides; i++) {
                var a = (i / this.sides) * Math.PI * 2;
                var px = Math.cos(a) * rr;
                var py = Math.sin(a) * rr;
                if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
            }
            ctx.closePath();
            if (this.dashed) ctx.setLineDash([5, 9]); else ctx.setLineDash([]);
            ctx.lineWidth = 1;
            ctx.strokeStyle = 'rgba(' + this.tone + ', ' + (this.alpha * (0.65 + 0.35 * Math.sin(t * 0.0004 + this.driftA))).toFixed(3) + ')';
            ctx.stroke();

            /* Vértice luminoso que recorre el polígono */
            var vi = (t * 0.00022 + this.driftA) % 1;
            var va = vi * Math.PI * 2;
            ctx.beginPath();
            ctx.arc(Math.cos(va) * rr, Math.sin(va) * rr, 1.8, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(' + this.tone + ', 0.75)';
            ctx.fill();
            ctx.restore();
        };

        /* --- Cintas sinusoidales (seda flotante) --- */
        function Ribbon(i) {
            this.base = 0.18 + i * 0.24;
            this.amp = rand(24, 70);
            this.freq = rand(0.0016, 0.0034);
            this.speed = rand(0.00016, 0.00032);
            this.phase = rand(0, Math.PI * 2);
            this.tone = TONES[i % TONES.length];
            this.alpha = rand(0.10, 0.19);
            this.depth = rand(0.3, 1);
            this.width = rand(0.9, 1.8);
        }
        Ribbon.prototype.draw = function (t) {
            var y0 = this.base * H + my * 30 * this.depth;
            ctx.beginPath();
            for (var x = -40; x <= W + 40; x += 14) {
                var y = y0
                    + Math.sin(x * this.freq + t * this.speed + this.phase) * this.amp
                    + Math.sin(x * this.freq * 0.47 - t * this.speed * 1.7) * this.amp * 0.42;
                if (x === -40) ctx.moveTo(x, y); else ctx.lineTo(x, y);
            }
            var grad = ctx.createLinearGradient(0, 0, W, 0);
            grad.addColorStop(0, 'rgba(' + this.tone + ', 0)');
            grad.addColorStop(0.5, 'rgba(' + this.tone + ', ' + this.alpha + ')');
            grad.addColorStop(1, 'rgba(' + this.tone + ', 0)');
            ctx.strokeStyle = grad;
            ctx.lineWidth = this.width;
            ctx.setLineDash([]);
            ctx.stroke();
        };

        /* --- Polvo estelar a la deriva --- */
        function Dust() { this.reset(true); }
        Dust.prototype.reset = function (initial) {
            this.x = rand(0, 1);
            this.y = initial ? rand(0, 1) : rand(0.98, 1.12);
            this.size = rand(0.5, 1.9);
            this.vy = rand(0.000018, 0.000062);
            this.sway = rand(0.00018, 0.00055);
            this.swayAmp = rand(0.004, 0.022);
            this.phase = rand(0, Math.PI * 2);
            this.alpha = rand(0.12, 0.5);
            this.depth = rand(0.2, 1);
            this.tone = Math.random() > 0.72 ? pick(TONES) : '230, 241, 255';
        };
        Dust.prototype.draw = function (t, dt) {
            this.y -= this.vy * dt;
            if (this.y < -0.06) this.reset(false);
            var px = (this.x + Math.sin(t * this.sway + this.phase) * this.swayAmp) * W + mx * 24 * this.depth;
            var py = this.y * H + my * 18 * this.depth;
            var a = this.alpha * (0.45 + 0.55 * Math.sin(t * 0.0009 + this.phase));
            ctx.beginPath();
            ctx.arc(px, py, this.size * this.depth, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(' + this.tone + ', ' + a.toFixed(3) + ')';
            ctx.fill();
        };

        /* --- Ondas expansivas ocasionales --- */
        function Ripple() {
            this.x = rand(0.1, 0.9) * W;
            this.y = rand(0.1, 0.9) * H;
            this.r = 0;
            this.max = rand(140, 340);
            this.speed = rand(0.34, 0.68);
            this.tone = pick(TONES);
            this.rings = Math.floor(rand(2, 4));
        }
        Ripple.prototype.draw = function (dt) {
            this.r += this.speed * dt * 0.06;
            var done = this.r > this.max;
            for (var i = 0; i < this.rings; i++) {
                var rr = this.r - i * 26;
                if (rr <= 0) continue;
                var fade = 1 - rr / this.max;
                if (fade <= 0) continue;
                ctx.beginPath();
                ctx.arc(this.x, this.y, rr, 0, Math.PI * 2);
                ctx.strokeStyle = 'rgba(' + this.tone + ', ' + (fade * 0.22 * (1 - i * 0.3)).toFixed(3) + ')';
                ctx.lineWidth = 1;
                ctx.setLineDash([]);
                ctx.stroke();
            }
            return done;
        };

        /* --- Meteoros muy espaciados --- */
        function Meteor() {
            var fromLeft = Math.random() > 0.5;
            this.x = fromLeft ? rand(-0.1, 0.35) * W : rand(0.65, 1.1) * W;
            this.y = rand(-0.1, 0.4) * H;
            this.len = rand(120, 300);
            this.speed = rand(0.16, 0.34);
            this.dir = fromLeft ? 1 : -1;
            this.slope = rand(0.35, 0.75);
            this.life = 0;
            this.maxLife = rand(1500, 2600);
            this.tone = Math.random() > 0.5 ? CYAN : BLUE;
        }
        Meteor.prototype.draw = function (dt) {
            this.life += dt;
            this.x += this.speed * this.dir * dt * 0.35;
            this.y += this.speed * this.slope * dt * 0.35;
            var p = this.life / this.maxLife;
            var fade = Math.sin(Math.min(p, 1) * Math.PI);
            var tx = this.x - this.len * this.dir;
            var ty = this.y - this.len * this.slope;
            var g = ctx.createLinearGradient(this.x, this.y, tx, ty);
            g.addColorStop(0, 'rgba(' + this.tone + ', ' + (0.55 * fade).toFixed(3) + ')');
            g.addColorStop(1, 'rgba(' + this.tone + ', 0)');
            ctx.beginPath();
            ctx.moveTo(this.x, this.y);
            ctx.lineTo(tx, ty);
            ctx.strokeStyle = g;
            ctx.lineWidth = 1.5;
            ctx.setLineDash([]);
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(this.x, this.y, 1.8 * fade + 0.4, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255,255,255,' + (0.6 * fade).toFixed(3) + ')';
            ctx.fill();
            return p >= 1;
        };

        /* --- Sistemas binarios (guiño a Mizar) --- */
        function Orbit() {
            this.x = rand(0.12, 0.88);
            this.y = rand(0.12, 0.88);
            this.r = rand(16, 34);
            this.speed = rand(0.00035, 0.0007);
            this.phase = rand(0, Math.PI * 2);
            this.driftA = rand(0, Math.PI * 2);
            this.driftS = rand(0.00005, 0.00011);
            this.depth = rand(0.4, 1);
        }
        Orbit.prototype.draw = function (t) {
            var cx = (this.x + Math.cos(t * this.driftS + this.driftA) * 0.05) * W + mx * 30 * this.depth;
            var cy = (this.y + Math.sin(t * this.driftS + this.driftA) * 0.04) * H + my * 22 * this.depth;
            var a = t * this.speed + this.phase;

            ctx.beginPath();
            ctx.arc(cx, cy, this.r, 0, Math.PI * 2);
            ctx.strokeStyle = 'rgba(' + CYAN + ', 0.07)';
            ctx.lineWidth = 1;
            ctx.setLineDash([2, 6]);
            ctx.stroke();
            ctx.setLineDash([]);

            var p1x = cx + Math.cos(a) * this.r, p1y = cy + Math.sin(a) * this.r;
            var p2x = cx + Math.cos(a + Math.PI) * this.r * 0.72, p2y = cy + Math.sin(a + Math.PI) * this.r * 0.72;

            ctx.beginPath();
            ctx.arc(p1x, p1y, 2.1, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(' + CYAN + ', 0.55)';
            ctx.fill();

            ctx.beginPath();
            ctx.arc(p2x, p2y, 1.5, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(' + BLUE + ', 0.45)';
            ctx.fill();
        };

        function build() {
            var area = W * H;
            var polyCount = area > 900000 ? 9 : 6;
            var dustCount = area > 900000 ? 78 : 42;
            polys = []; ribbons = []; dust = []; orbits = [];
            for (var i = 0; i < polyCount; i++) polys.push(new Poly());
            for (var r = 0; r < 3; r++) ribbons.push(new Ribbon(r));
            for (var d = 0; d < dustCount; d++) dust.push(new Dust());
            for (var o = 0; o < 2; o++) orbits.push(new Orbit());
        }

        var prev = 0;
        function frame(t) {
            var dt = Math.min(t - prev, 48);
            prev = t;

            if (document.hidden) { requestAnimationFrame(frame); return; }

            mx += (tmx - mx) * 0.045;
            my += (tmy - my) * 0.045;

            ctx.clearRect(0, 0, W, H);
            ctx.globalCompositeOperation = 'lighter';

            ribbons.forEach(function (r) { r.draw(t); });
            polys.forEach(function (p) { p.draw(t); });
            orbits.forEach(function (o) { o.draw(t); });
            dust.forEach(function (d) { d.draw(t, dt); });

            if (t - lastRipple > rand(5200, 9600)) {
                ripples.push(new Ripple());
                lastRipple = t;
            }
            ripples = ripples.filter(function (r) { return !r.draw(dt); });

            if (t - lastMeteor > rand(11000, 20000)) {
                meteors.push(new Meteor());
                lastMeteor = t;
            }
            meteors = meteors.filter(function (m) { return !m.draw(dt); });

            ctx.globalCompositeOperation = 'source-over';
            requestAnimationFrame(frame);
        }

        window.addEventListener('resize', function () { resize(); build(); });
        if (FINE_POINTER) {
            window.addEventListener('pointermove', function (e) {
                tmx = (e.clientX / window.innerWidth - 0.5) * 2;
                tmy = (e.clientY / window.innerHeight - 0.5) * 2;
            }, { passive: true });
        }

        resize();
        build();
        requestAnimationFrame(frame);
    }

    /* --------------------------------------------------------
       4. HOVER AVANZADO — tilt 3D, magnetismo, spotlight
       -------------------------------------------------------- */
    function attachPointerFx(el, opts) {
        var raf = null, rect = null;

        function update(e) {
            if (!rect) rect = el.getBoundingClientRect();
            var px = (e.clientX - rect.left) / rect.width;
            var py = (e.clientY - rect.top) / rect.height;
            px = Math.max(0, Math.min(1, px));
            py = Math.max(0, Math.min(1, py));

            if (raf) return;
            raf = requestAnimationFrame(function () {
                raf = null;
                el.style.setProperty('--mx', (px * 100).toFixed(1) + '%');
                el.style.setProperty('--my', (py * 100).toFixed(1) + '%');

                if (opts.tilt) {
                    el.style.setProperty('--ry', ((px - 0.5) * 2 * opts.tilt).toFixed(2) + 'deg');
                    el.style.setProperty('--rx', (-(py - 0.5) * 2 * opts.tilt).toFixed(2) + 'deg');
                    el.style.setProperty('--px', (px - 0.5).toFixed(3));
                    el.style.setProperty('--py', (py - 0.5).toFixed(3));
                }
                if (opts.magnet) {
                    el.style.setProperty('--tx', ((px - 0.5) * 2 * opts.magnet).toFixed(2) + 'px');
                    el.style.setProperty('--ty', ((py - 0.5) * 2 * opts.magnet).toFixed(2) + 'px');
                }
            });
        }

        el.addEventListener('pointerenter', function () { rect = el.getBoundingClientRect(); });
        el.addEventListener('pointermove', update);
        el.addEventListener('pointerleave', function () {
            rect = null;
            el.style.setProperty('--rx', '0deg');
            el.style.setProperty('--ry', '0deg');
            el.style.setProperty('--tx', '0px');
            el.style.setProperty('--ty', '0px');
            el.style.setProperty('--px', '0');
            el.style.setProperty('--py', '0');
        });
    }

    function initHoverFx() {
        if (!FINE_POINTER) return;

        var tilts = [
            ['.project-card', 9],
            ['.founder-card', 7],
            ['.skill-item', 10],
            ['.tool-item', 12],
            ['.method', 6]
        ];
        tilts.forEach(function (pair) {
            Array.prototype.forEach.call(document.querySelectorAll(pair[0]), function (el) {
                attachPointerFx(el, { tilt: pair[1] });
            });
        });

        var magnets = ['.btn-primary', '.btn-secondary', '.reviews-trigger-btn', '.nav-btn', '.filter-btn', '.sub-nav-btn'];
        magnets.forEach(function (sel) {
            Array.prototype.forEach.call(document.querySelectorAll(sel), function (el) {
                attachPointerFx(el, { magnet: 7 });
            });
        });

        /* Estados del cursor sobre elementos interactivos */
        var hotSel = 'a, button, input, textarea, select, .project-card, .founder-card, .service-card, .skill-item, .tool-item';
        var wasHot = false;
        document.addEventListener('pointermove', function (e) {
            var hot = !!(e.target.closest && e.target.closest(hotSel));
            if (hot !== wasHot) {
                wasHot = hot;
                document.body.classList.toggle('mz-hot', hot);
            }
        }, { passive: true });
    }

    /* --- Aura de cursor con retardo --- */
    function initCursorAura() {
        if (!FINE_POINTER || REDUCED) return;

        var aura = document.createElement('div');
        aura.className = 'mz-aura';
        var dot = document.createElement('div');
        dot.className = 'mz-dot';
        aura.setAttribute('aria-hidden', 'true');
        dot.setAttribute('aria-hidden', 'true');
        document.body.appendChild(aura);
        document.body.appendChild(dot);

        var tx = window.innerWidth / 2, ty = window.innerHeight / 2;
        var ax = tx, ay = ty, dx = tx, dy = ty;

        window.addEventListener('pointermove', function (e) {
            tx = e.clientX; ty = e.clientY;
            document.body.classList.add('mz-pointer-active');
        }, { passive: true });

        window.addEventListener('pointerleave', function () {
            document.body.classList.remove('mz-pointer-active');
        });

        (function loop() {
            ax += (tx - ax) * 0.085;
            ay += (ty - ay) * 0.085;
            dx += (tx - dx) * 0.24;
            dy += (ty - dy) * 0.24;
            aura.style.transform = 'translate3d(' + ax.toFixed(1) + 'px,' + ay.toFixed(1) + 'px,0)';
            dot.style.transform = 'translate3d(' + dx.toFixed(1) + 'px,' + dy.toFixed(1) + 'px,0)';
            requestAnimationFrame(loop);
        })();
    }

    /* --- Descifrado de texto al pasar el cursor --- */
    function initScramble() {
        if (!FINE_POINTER || REDUCED) return;
        var GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&/';
        var targets = document.querySelectorAll('.nav-btn, .sub-nav-btn, .filter-btn, .mob-nav-btn');

        Array.prototype.forEach.call(targets, function (el) {
            var original = el.textContent;
            var timer = null;

            el.addEventListener('pointerenter', function () {
                var frame = 0;
                clearInterval(timer);
                timer = setInterval(function () {
                    el.textContent = original.split('').map(function (ch, i) {
                        if (ch === ' ') return ' ';
                        if (i < frame / 1.7) return original[i];
                        return GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
                    }).join('');
                    frame++;
                    if (frame / 1.7 >= original.length) {
                        clearInterval(timer);
                        el.textContent = original;
                    }
                }, 28);
            });

            el.addEventListener('pointerleave', function () {
                clearInterval(timer);
                el.textContent = original;
            });
        });
    }

    /* --------------------------------------------------------
       5. DIRECTOR AMBIENTAL
       Dispara efectos puntuales cada cierto tiempo sobre
       elementos aleatorios visibles.
       -------------------------------------------------------- */
    function addTemp(el, cls, ms) {
        if (el.classList.contains(cls)) return;
        el.classList.add(cls);
        setTimeout(function () { el.classList.remove(cls); }, ms);
    }

    function isVisible(el) {
        if (!el.offsetParent && el.style.position !== 'fixed') return false;
        var r = el.getBoundingClientRect();
        return r.bottom > 0 && r.top < window.innerHeight && r.width > 0;
    }

    function initAmbientConductor() {
        if (REDUCED) return;

        var SCHEDULE = [
            { sel: '.project-card', cls: 'amb-glint', ms: 1500, every: 2400, burst: 1 },
            { sel: '.founder-card', cls: 'amb-trace', ms: 2600, every: 6500 },
            { sel: '.founder-card', cls: 'amb-pop', ms: 1700, every: 9000 },
            { sel: '.skill-item', cls: 'amb-trace', ms: 2600, every: 5200 },
            { sel: '.skill-item', cls: 'amb-pop', ms: 2200, every: 7000 },
            { sel: '.tool-item', cls: 'amb-spin-icon', ms: 1600, every: 3600 },
            { sel: '.tool-item', cls: 'amb-trace', ms: 2600, every: 6200 },
            { sel: '.service-card', cls: 'amb-tilt-nudge', ms: 1800, every: 5000 },
            { sel: '.method', cls: 'amb-slide-hint', ms: 1500, every: 5600 },
            { sel: '.filter-btn:not(.active)', cls: 'amb-sheen', ms: 1300, every: 4200 },
            { sel: '.nav-btn:not(.active)', cls: 'amb-sheen', ms: 1300, every: 7000 },
            { sel: '.sub-nav-btn:not(.active)', cls: 'amb-sheen', ms: 1300, every: 5400 },
            { sel: '.btn-primary, .btn-secondary, .reviews-trigger-btn', cls: 'amb-pulse', ms: 2000, every: 6800 },
            { sel: '.form-group', cls: 'amb-line', ms: 1800, every: 5000 },
            { sel: '.section-title', cls: 'amb-title-sweep', ms: 1800, every: 12000 },
            { sel: '.menu-toggle', cls: 'amb-pulse', ms: 1200, every: 9500 }
        ];

        SCHEDULE.forEach(function (task) {
            var kick = function () {
                if (!document.hidden) {
                    var nodes = Array.prototype.filter.call(
                        document.querySelectorAll(task.sel), isVisible
                    );
                    if (nodes.length) {
                        var n = task.burst || 1;
                        for (var i = 0; i < n; i++) addTemp(pick(nodes), task.cls, task.ms);
                    }
                }
                setTimeout(kick, task.every * rand(0.75, 1.45));
            };
            setTimeout(kick, rand(2500, task.every));
        });
    }

    /* --------------------------------------------------------
       6. TRANSICIÓN ENTRE PÁGINAS
       -------------------------------------------------------- */
    function initPageTransition() {
        var wipe = document.createElement('div');
        wipe.className = 'mz-wipe';
        wipe.setAttribute('aria-hidden', 'true');
        for (var i = 0; i < 5; i++) {
            var bar = document.createElement('span');
            bar.style.setProperty('--i', i);
            wipe.appendChild(bar);
        }
        document.body.appendChild(wipe);

        if (REDUCED) return;

        document.addEventListener('click', function (e) {
            var link = e.target.closest ? e.target.closest('a[href]') : null;
            if (!link) return;
            var href = link.getAttribute('href');
            if (!href || href.charAt(0) === '#' || link.target === '_blank') return;
            if (!/\.html($|\?|#)/.test(href)) return;
            if (link.origin && link.origin !== location.origin) return;

            var current = location.pathname.split('/').pop() || 'index.html';
            if (href.split('?')[0].split('#')[0] === current) return;

            e.preventDefault();
            document.body.classList.add('mz-leaving');
            var header = document.querySelector('.main-header');
            if (header) header.style.transform = 'translate(-50%, -160%)';
            setTimeout(function () { window.location.href = href; }, 620);
        });
    }

    /* --------------------------------------------------------
       7. ENGANCHES A LA UI EXISTENTE
       -------------------------------------------------------- */
    function initHooks() {
        /* Índices para escalonar animaciones CSS */
        function indexAll(sel) {
            Array.prototype.forEach.call(document.querySelectorAll(sel), function (el, i) {
                el.style.setProperty('--i', i);
            });
        }
        indexAll('.mob-nav-btn');
        indexAll('.mobile-social-row a');
        indexAll('.service-icon');
        indexAll('.skill-item i');
        indexAll('.tool-item i');
        indexAll('.method i');

        Array.prototype.forEach.call(document.querySelectorAll('.card-hover-content ul'), function (ul) {
            Array.prototype.forEach.call(ul.children, function (li, i) {
                li.style.setProperty('--li', i);
            });
        });

        /* Pestañas de servicios: relanzar entradas al cambiar */
        Array.prototype.forEach.call(document.querySelectorAll('.sub-nav-btn'), function (btn) {
            btn.addEventListener('click', function () {
                setTimeout(function () {
                    var active = document.querySelector('.about-tab-content.active');
                    if (active) forceReveal(active, 0.07);
                }, 30);
            });
        });

        /* Filtros de portfolio: entrada escalonada de las tarjetas */
        Array.prototype.forEach.call(document.querySelectorAll('.filter-btn'), function (btn) {
            btn.addEventListener('click', function () {
                setTimeout(function () {
                    var visible = document.querySelectorAll('.project-card:not(.hidden)');
                    Array.prototype.forEach.call(visible, function (card, i) {
                        card.classList.remove('filtered-in');
                        card.style.setProperty('--fi', i);
                        void card.offsetWidth;
                        card.classList.add('filtered-in');
                    });
                }, 20);
            });
        });

        /* Popover de reseñas: reanimar el slide al abrir */
        var trigger = document.getElementById('reviewsTriggerBtn');
        if (trigger) {
            trigger.addEventListener('click', function () {
                setTimeout(function () {
                    var slide = document.querySelector('.carousel-slide.current-slide');
                    if (slide) {
                        slide.style.animation = 'none';
                        void slide.offsetWidth;
                        slide.style.animation = '';
                    }
                }, 40);
            });
        }

        /* Ondas al hacer clic sobre botones (efecto material sutil) */
        if (!REDUCED) {
            document.addEventListener('pointerdown', function (e) {
                var t = e.target.closest ? e.target.closest('.btn-primary, .btn-secondary, .reviews-trigger-btn, .filter-btn, .sub-nav-btn, .carousel-btn') : null;
                if (!t) return;
                var r = t.getBoundingClientRect();
                var ink = document.createElement('span');
                ink.style.cssText = 'position:absolute;border-radius:50%;pointer-events:none;' +
                    'left:' + (e.clientX - r.left) + 'px;top:' + (e.clientY - r.top) + 'px;' +
                    'width:8px;height:8px;margin:-4px 0 0 -4px;' +
                    'background:radial-gradient(circle,rgba(100,255,218,.55),rgba(100,255,218,0) 70%);' +
                    'transform:scale(0);opacity:1;z-index:-1;' +
                    'transition:transform .65s cubic-bezier(.16,1,.3,1),opacity .65s ease;';
                t.appendChild(ink);
                requestAnimationFrame(function () {
                    ink.style.transform = 'scale(' + (Math.max(r.width, r.height) / 8 * 2.6) + ')';
                    ink.style.opacity = '0';
                });
                setTimeout(function () { ink.remove(); }, 700);
            });
        }
    }

    /* --------------------------------------------------------
       8. ARRANQUE — sincronizado con el preloader
       -------------------------------------------------------- */
    function waitForPreloader(done) {
        var pre = document.getElementById('preloader');
        if (!pre) { done(); return; }

        var fired = false;
        function go() {
            if (fired) return;
            fired = true;
            done();
        }

        if (pre.classList.contains('loaded')) { go(); return; }

        if ('MutationObserver' in window) {
            var mo = new MutationObserver(function () {
                if (pre.classList.contains('loaded')) {
                    mo.disconnect();
                    setTimeout(go, 120);
                }
            });
            mo.observe(pre, { attributes: true, attributeFilter: ['class'] });
        }
        /* Red de seguridad: nunca dejamos el contenido oculto */
        setTimeout(go, 2600);
    }

    ready(function () {
        buildEntrances();
        initHooks();
        initAmbientBackground();
        initHoverFx();
        initCursorAura();
        initScramble();
        initPageTransition();
        initAmbientConductor();
        waitForPreloader(flushReveals);
    });
})();
