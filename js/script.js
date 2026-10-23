// ====================================================
// 1. ГОД В ПОДВАЛЕ
// ====================================================
const yearEl = document.querySelector('#year');
yearEl.textContent = new Date().getFullYear();


// ====================================================
// 2. ТЁМНАЯ ТЕМА
// ====================================================
const themeBtn = document.querySelector('#theme-toggle');

function applyTheme(isDark) {
    document.documentElement.classList.toggle('dark', isDark);
    themeBtn.textContent = isDark ? '☀️' : '🌙';
    themeBtn.setAttribute('aria-label', isDark ? 'Светлая тема' : 'Тёмная тема');
}

themeBtn.addEventListener('click', () => {
    const isDark = !document.documentElement.classList.contains('dark');
    applyTheme(isDark);
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
});

if (localStorage.getItem('theme') === 'dark') applyTheme(true);

// ====================================================
// 3. ОТПРАВКА ФОРМЫ (POST-запрос по шаблону из конспекта)
// ====================================================
const form = document.querySelector('form');
const statusMsg = document.querySelector('#form-status');

if (form && statusMsg) {
    form.addEventListener('submit', async (event) => {
        event.preventDefault(); 

        // 1. Собираем данные из формы в объект
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries()); // Превращаем в обычный объект {name: "...", email: "..."}

        statusMsg.classList.remove('visible');
        statusMsg.textContent = 'Отправка...';
        statusMsg.classList.add('visible');

        try {
            // 2. Делаем POST-запрос с заголовком Content-Type, как в конспекте
            const response = await fetch(form.action, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json', // Важно!
                    'Accept': 'application/json'
                },
                body: JSON.stringify(data) // Превращаем объект в JSON-строку
            });

            if (!response.ok) {
                throw new Error(`Ошибка сервера: ${response.status}`);
            }

            // Если всё ок
            statusMsg.textContent = `Спасибо, ${data.name}! Сообщение отправлено.`;
            form.reset();
            
        } catch (error) {
            console.error('Ошибка при отправке:', error);
            statusMsg.textContent = 'Ошибка сети или сервера. Попробуйте позже.';
        }
    });
}

// ====================================================
// 4. КНОПКА «НАВЕРХ»
// ====================================================
const upBtn = document.querySelector('#to-top');

window.addEventListener('scroll', () => {
    upBtn.classList.toggle('visible', window.scrollY > 400);
});

upBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});


// ====================================================
// 5. ПАНЕЛЬ ДОСТУПНОСТИ
// ====================================================
const a11yPanel  = document.querySelector('#a11y-panel');
const a11yOpen   = document.querySelector('#a11y-open');
const a11yClose  = document.querySelector('#a11y-close');

function openPanel() {
    a11yPanel.classList.add('open');
    a11yPanel.setAttribute('aria-hidden', 'false');
    a11yClose.focus();
}
function closePanel() {
    a11yPanel.classList.remove('open');
    a11yPanel.setAttribute('aria-hidden', 'true');
    a11yOpen.focus();
}

a11yOpen.addEventListener('click', openPanel);
a11yClose.addEventListener('click', closePanel);
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && a11yPanel.classList.contains('open')) closePanel();
});


// ====================================================
// 6. РАЗМЕР ШРИФТА
// ====================================================
let fontScale = parseFloat(localStorage.getItem('fontScale') || '1');

function applyFont() {
    document.documentElement.style.setProperty('--base-font', (20 * fontScale) + 'px');
    localStorage.setItem('fontScale', fontScale);
}

document.querySelector('#font-up').addEventListener('click', () => {
    fontScale = Math.min(fontScale + 0.1, 1.6);
    applyFont();
});
document.querySelector('#font-down').addEventListener('click', () => {
    fontScale = Math.max(fontScale - 0.1, 0.8);
    applyFont();
});
document.querySelector('#font-reset').addEventListener('click', () => {
    fontScale = 1;
    applyFont();
});
if (fontScale !== 1) applyFont();


// ====================================================
// 7. ВЫСОКАЯ КОНТРАСТНОСТЬ
// ====================================================
const contrastBtn = document.querySelector('#contrast-toggle');

function applyContrast(on) {
    document.documentElement.classList.toggle('high-contrast', on);
    contrastBtn.setAttribute('aria-pressed', on ? 'true' : 'false');
    localStorage.setItem('highContrast', on ? '1' : '0');
}

contrastBtn.addEventListener('click', () => {
    const on = !document.documentElement.classList.contains('high-contrast');
    applyContrast(on);
});

if (localStorage.getItem('highContrast') === '1') applyContrast(true);


// ====================================================
// 8. ВСТРОЕННЫЙ СКРИНРИДЕР (Web Speech API)
// ====================================================
const synth = window.speechSynthesis;
const playBtn  = document.querySelector('#sr-play');
const pauseBtn = document.querySelector('#sr-pause');
const stopBtn  = document.querySelector('#sr-stop');
const prevBtn  = document.querySelector('#sr-prev');
const nextBtn  = document.querySelector('#sr-next');
const voiceSel = document.querySelector('#sr-voice');
const rateInp  = document.querySelector('#sr-rate');
const rateVal  = document.querySelector('#sr-rate-value');

let blocks = [];        // массив «читаемых» элементов
let currentIdx = -1;
let currentUtterance = null;
let isPaused = false;

// Какие элементы читаем
function collectBlocks() {
    const root = document.querySelector('main');
    const nodes = root.querySelectorAll('h1, h2, h3, p, li, a, label, button');
    blocks = [...nodes].filter(el => {
        // пропускаем пустые
        return el.textContent.trim().length > 0;
    });
}

// Подсветка активного блока
function highlight(el) {
    document.querySelectorAll('.sr-reading').forEach(n => n.classList.remove('sr-reading'));
    if (el) {
        el.classList.add('sr-reading');
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

// Прочитать один блок
function speakBlock(index) {
    if (index < 0 || index >= blocks.length) {
        stopReading();
        return;
    }
    currentIdx = index;
    const el = blocks[index];
    highlight(el);

    const utter = new SpeechSynthesisUtterance(el.textContent.trim());
    utter.lang = 'ru-RU';
    utter.rate = parseFloat(rateInp.value);
    const voice = voiceSel.value ? synth.getVoices().find(v => v.name === voiceSel.value) : null;
    if (voice) utter.voice = voice;

    utter.onend = () => {
        if (synth.canceled || isPaused) return;
        // Переходим к следующему блоку
        if (currentIdx + 1 < blocks.length) speakBlock(currentIdx + 1);
        else stopReading();
    };

    currentUtterance = utter;
    synth.speak(utter);
}

// Заполняем список голосов
function loadVoices() {
    const voices = synth.getVoices();
    const ruVoices = voices.filter(v => v.lang.startsWith('ru'));
    const list = ruVoices.length ? ruVoices : voices;

    voiceSel.innerHTML = '';
    list.forEach(v => {
        const opt = document.createElement('option');
        opt.value = v.name;
        opt.textContent = `${v.name} (${v.lang})`;
        voiceSel.appendChild(opt);
    });
}

if ('speechSynthesis' in window) {
    loadVoices();
    if (synth.onvoiceschanged !== undefined) synth.onvoiceschanged = loadVoices;
} else {
    playBtn.disabled = pauseBtn.disabled = stopBtn.disabled = true;
    voiceSel.disabled = true;
    voiceSel.innerHTML = '<option>Синтез речи не поддерживается</option>';
}

// Кнопки
playBtn.addEventListener('click', () => {
    if (isPaused) {
        synth.resume();
        isPaused = false;
        return;
    }
    if (synth.speaking) return;

    collectBlocks();
    speakBlock(0);
});

pauseBtn.addEventListener('click', () => {
    if (synth.speaking && !synth.paused) {
        synth.pause();
        isPaused = true;
    } else if (synth.paused) {
        synth.resume();
        isPaused = false;
    }
});

stopBtn.addEventListener('click', stopReading);

function stopReading() {
    synth.cancel();
    isPaused = false;
    highlight(null);
    currentIdx = -1;
}

prevBtn.addEventListener('click', () => {
    if (!blocks.length) collectBlocks();
    if (currentIdx > 0) {
        synth.cancel();
        setTimeout(() => speakBlock(currentIdx - 1), 100);
    }
});

nextBtn.addEventListener('click', () => {
    if (!blocks.length) collectBlocks();
    if (currentIdx + 1 < blocks.length) {
        synth.cancel();
        setTimeout(() => speakBlock(currentIdx + 1), 100);
    }
});

// Скорость
rateInp.addEventListener('input', () => {
    rateVal.textContent = parseFloat(rateInp.value).toFixed(1) + '×';
});
rateVal.textContent = parseFloat(rateInp.value).toFixed(1) + '×';

// Стоп при закрытии страницы
window.addEventListener('beforeunload', () => synth.cancel());

// ====================================================
// 9. ВИДЖЕТ: СЛУЧАЙНЫЙ ФАКТ
// ====================================================
const factBtn = document.querySelector('#fact-btn');
const factText = document.querySelector('#fact-text');

async function loadFact() {
    if(!factBtn || !factText) return; // Защита, если элементов нет

    factBtn.disabled = true;
    factText.textContent = 'Загружаю...';

    try {
        const response = await fetch('https://catfact.ninja/fact');
        if (!response.ok) throw new Error(`Ошибка сервера: ${response.status}`);
        
        const data = await response.json();
        factText.textContent = data.fact;
    } catch (error) {
        factText.textContent = 'Не удалось загрузить факт. Попробуйте ещё раз.';
        console.error(error);
    } finally {
        factBtn.disabled = false;
    }
}

if (factBtn) {
    factBtn.addEventListener('click', loadFact);
    loadFact(); // Первый факт сразу
}

// ====================================================
// 10. ВИДЖЕТ: ПРОФИЛЬ GITHUB (Шаблон из конспекта)
// ====================================================
const GITHUB_USERNAME = 'domusofia';

// Шаг 1: Функция только загружает данные (как в конспекте)
async function loadUser(login) {
    try {
        const response = await fetch(`https://api.github.com/users/${login}`);
        
        // Проверка на 404 и 500 (Ловушка 1 и 2)
        if (!response.ok) {
            throw new Error(`Ошибка сервера: ${response.status}`);
        }
        
        return await response.json(); // Данные — наружу
    } catch (error) {
        console.error('Не удалось загрузить профиль:', error);
        return null; // Сигнал неудачи
    }
}

// Шаг 2: Функция отрисовывает интерфейс
async function loadGitHub() {
    const box = document.querySelector('#github-box');
    if (!box) return;

    // Ждем данные из первой функции
    const user = await loadUser(GITHUB_USERNAME);

    if (user) {
        // Если данные пришли — рисуем (Защита от XSS)
        box.innerHTML = ''; // Очищаем "Загружаю..."

        const img = document.createElement('img');
        img.src = user.avatar_url;
        img.alt = `Аватар пользователя ${user.login}`;

        const info = document.createElement('p');
        info.textContent = `${user.name ?? user.login} · репозиториев: ${user.public_repos}`;
        info.style.margin = '0';

        const link = document.createElement('a');
        link.href = user.html_url;
        link.target = '_blank';
        link.rel = 'noopener';
        link.textContent = 'Открыть профиль →';
        link.style.color = 'var(--color-main)';
        link.style.fontWeight = 'bold';

        box.append(img, info, link);
    } else {
        // Если вернулся null (ошибка)
        box.textContent = 'Профиль не найден. Проверьте логин.';
    }
}

loadGitHub();