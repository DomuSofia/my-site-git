// ====== БУРГЕР ======
const menuToggle = document.querySelector('.menu-toggle');
const siteNav = document.querySelector('.site-nav');
if (menuToggle && siteNav) {
    menuToggle.addEventListener('click', () => {
        const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
        menuToggle.setAttribute('aria-expanded', String(!isOpen));
        siteNav.classList.toggle('is-open', !isOpen);
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && siteNav.classList.contains('is-open')) {
            menuToggle.setAttribute('aria-expanded', 'false');
            siteNav.classList.remove('is-open');
            menuToggle.focus();
        }
    });
}

// ====== СЛАЙДЕР ======
const slider = document.querySelector('.slider');
if (slider) {
    const track   = slider.querySelector('.slider__track');
    const prevBtn = slider.querySelector('.slider__btn--prev');
    const nextBtn = slider.querySelector('.slider__btn--next');
    const dotsBox = slider.querySelector('.slider__dots');

    const originalSlides = [...track.children];
    const total = originalSlides.length;

    // Клоны
    const firstClone = originalSlides[0].cloneNode(true);
    const lastClone  = originalSlides[total - 1].cloneNode(true);
    firstClone.classList.add('clone');
    lastClone.classList.add('clone');
    firstClone.setAttribute('aria-hidden', 'true');
    lastClone.setAttribute('aria-hidden', 'true');
    track.appendChild(firstClone);
    track.insertBefore(lastClone, originalSlides[0]);

    const allSlides = track.children;
    let currentIndex = 1;

    // Внутри клонов — недоступные для Tab ссылки/кнопки
    [allSlides[0], allSlides[allSlides.length - 1]].forEach(clone => {
        clone.querySelectorAll('a, button, input, [tabindex]').forEach(el => el.tabIndex = -1);
    });

    const dots = []; // заполним ниже

    function setTransform(animate = true) {
        track.style.transition = animate ? 'transform 0.4s ease' : 'none';
        track.style.transform  = `translateX(-${currentIndex * 100}%)`;
    }
    setTransform(false);

    function updateDots() {
        let active = currentIndex - 1;
        if (active < 0) active = total - 1;
        if (active >= total) active = 0;
        dots.forEach((d, i) => {
            const on = i === active;
            d.classList.toggle('is-active', on);
            d.setAttribute('aria-current', on ? 'true' : 'false');
        });
    }

    function goTo(index) {
        if (index < 0 || index >= allSlides.length) return;
        currentIndex = index;
        setTransform(true);
        updateDots();
    }

    track.addEventListener('transitionend', () => {
        if (allSlides[currentIndex].classList.contains('clone')) {
            track.style.transition = 'none';
            if (currentIndex === 0) currentIndex = total;
            else if (currentIndex === allSlides.length - 1) currentIndex = 1;
            setTransform(false);
            updateDots();
        }
    });

    prevBtn.addEventListener('click', () => goTo(currentIndex - 1));
    nextBtn.addEventListener('click', () => goTo(currentIndex + 1));

    // Точки
    dotsBox.innerHTML = '';
    originalSlides.forEach((_, i) => {
        const dot = document.createElement('button');
        dot.type = 'button';
        dot.className = 'slider__dot';
        dot.setAttribute('aria-label', `Перейти к слайду ${i + 1}`);
        dot.addEventListener('click', () => goTo(i + 1));
        dotsBox.appendChild(dot);
        dots.push(dot);
    });
    updateDots();

    // Автопрокрутка
    let autoplayTimer = null;
    const DELAY = 5000;

    function startAutoplay() {
        stopAutoplay();
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        autoplayTimer = setInterval(() => goTo(currentIndex + 1), DELAY);
    }
    function stopAutoplay() {
        if (autoplayTimer) { clearInterval(autoplayTimer); autoplayTimer = null; }
    }
    slider.addEventListener('mouseenter', stopAutoplay);
    slider.addEventListener('mouseleave', startAutoplay);
    slider.addEventListener('focusin',    stopAutoplay);
    slider.addEventListener('focusout', (e) => {
        if (!slider.contains(e.relatedTarget)) startAutoplay();
    });
    startAutoplay();
}

// ====== ТАБЫ ======
const tabs   = document.querySelectorAll('.tabs__tab');
const panels = document.querySelectorAll('.tabs__panel');
tabs.forEach(tab => {
    tab.addEventListener('click', () => {
        tabs.forEach(t => {
            t.classList.remove('is-active');
            t.setAttribute('aria-selected', 'false');
        });
        panels.forEach(p => p.hidden = true);

        tab.classList.add('is-active');
        tab.setAttribute('aria-selected', 'true');
        const panel = document.getElementById(tab.getAttribute('aria-controls'));
        if (panel) panel.hidden = false;
    });
});