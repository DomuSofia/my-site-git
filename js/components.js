const slider = document.querySelector('.slider');
const track = slider.querySelector('.slider__track');
const originalSlides = [...track.children];
const total = originalSlides.length;

// 1. Клонируем первый и последний слайды
const firstClone = originalSlides[0].cloneNode(true);
const lastClone  = originalSlides[total - 1].cloneNode(true);
firstClone.classList.add('clone');
lastClone.classList.add('clone');
track.appendChild(firstClone);        // клон первого — в конец
track.insertBefore(lastClone, originalSlides[0]); // клон последнего — в начало

// Теперь в ленте: [cloneLast, slide1, slide2, slide3, cloneFirst]
const allSlides = track.children;
let currentIndex = 1;                 // стартуем с первого настоящего слайда

function setTransform(animate = true) {
    track.style.transition = animate ? 'transform 0.4s ease' : 'none';
    track.style.transform = `translateX(-${currentIndex * 100}%)`;
}

setTransform(false); // начальная установка без анимации

function goTo(index) {
    if (index < 0 || index >= allSlides.length) return;
    currentIndex = index;
    setTransform(true);
}

// Обработка «перескока» после анимации
track.addEventListener('transitionend', () => {
    if (allSlides[currentIndex].classList.contains('clone')) {
        track.style.transition = 'none';
        if (currentIndex === 0) {
            currentIndex = total;           // с клона последнего → на настоящий последний
        } else if (currentIndex === allSlides.length - 1) {
            currentIndex = 1;               // с клона первого → на настоящий первый
        }
        setTransform(false);
    }
});

// Кнопки
prevBtn.addEventListener('click', () => goTo(currentIndex - 1));
nextBtn.addEventListener('click', () => goTo(currentIndex + 1));

// Точки (их количество = количество настоящих слайдов)
dotsBox.innerHTML = '';
originalSlides.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = 'slider__dot';
    dot.setAttribute('aria-label', `Перейти к слайду ${i + 1}`);
    dot.addEventListener('click', () => goTo(i + 1)); // +1 из-за клона в начале
    dotsBox.appendChild(dot);
});

let autoplayTimer = null;
const DELAY = 5000; // 5 секунд

function startAutoplay() {
    stopAutoplay();
    autoplayTimer = setInterval(() => {
        goTo(currentIndex + 1);
    }, DELAY);
}

function stopAutoplay() {
    if (autoplayTimer) {
        clearInterval(autoplayTimer);
        autoplayTimer = null;
    }
}

// Пауза при наведении и фокусе (для клавиатуры)
slider.addEventListener('mouseenter', stopAutoplay);
slider.addEventListener('mouseleave', startAutoplay);
slider.addEventListener('focusin', stopAutoplay);
slider.addEventListener('focusout', startAutoplay);

// Запуск после инициализации
startAutoplay();