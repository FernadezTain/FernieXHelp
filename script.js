// =====================
// ЭЛЕМЕНТЫ
// =====================
const card = document.getElementById('card');

const startBtn = document.getElementById('startBtn');
const backToMainBtn = document.getElementById('backToMainBtn');
const checkStatusBtn = document.getElementById('checkStatusBtn');
const createBtn = document.getElementById('createBtn');
const checkBackBtn = document.getElementById('checkBackBtn');
const checkBtn = document.getElementById('checkBtn');
const cancelBtn = document.getElementById('cancelBtn');
const resultBackBtn = document.getElementById('resultBackBtn');
const createBackBtn = document.getElementById('createBackBtn');
const createSubmitBtn = document.getElementById('createSubmitBtn');

const ticketInput = document.getElementById('ticketInput');
const nickInput = document.getElementById('nickInput');
const typeSelect = document.getElementById('typeSelect');

const errorBanner = document.getElementById('error-banner');
const errorMessage = document.getElementById('error-message');
const errorCloseBtn = document.querySelector('#error-banner .close-btn');

const notificationContainer = document.getElementById('notification-container');
const loadingContent = document.getElementById('loadingContent');
const resultContent = document.getElementById('resultContent');

const faces = document.querySelectorAll('.card-face');
const faceMain = document.querySelector('.card-main');
const faceMenu = document.querySelector('.card-menu');
const faceCheck = document.querySelector('.card-check');
const faceCreate = document.querySelector('.card-create');
const faceLoading = document.querySelector('.card-loading');

let currentFace = faceMain;
let searchTimeout = null;
let errorTimeout = null;
let activeNotification = null;
let notificationHideTimeout = null;

// =====================
// ПРОВЕРКА НА МОБИЛЬНОЕ УСТРОЙСТВО
// =====================
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

// =====================
// СЛАЙД НАВИГАЦИЯ (ГЛАВНОЕ)
// =====================
function slideTo(nextFace) {
    if (!nextFace || nextFace === currentFace) return;

    faces.forEach(f => {
        f.style.transition = 'transform 0.5s cubic-bezier(.4,0,.2,1), opacity 0.4s, filter 0.5s';
        f.style.pointerEvents = 'none';

        // все неактивные размазываем
        if (f !== nextFace) f.style.filter = 'blur(6px)';
    });

    // текущий уезжает влево
    currentFace.style.transform = 'translateX(-100%)';
    currentFace.style.opacity = '0';

    // новый стартует справа
    nextFace.style.transform = 'translateX(100%)';
    nextFace.style.opacity = '0';
    nextFace.style.filter = 'blur(6px)';

    requestAnimationFrame(() => {
        nextFace.style.transform = 'translateX(0)';
        nextFace.style.opacity = '1';
        nextFace.style.filter = 'blur(0)'; // чёткий активный экран
    });

    setTimeout(() => {
        currentFace = nextFace;
        currentFace.style.pointerEvents = 'auto';
    }, 500);
}

// =====================
// ОШИБКИ
// =====================
function showError(message) {
    errorMessage.innerText = message;
    errorBanner.classList.add('show');
    clearTimeout(errorTimeout);
    errorTimeout = setTimeout(() => {
        errorBanner.classList.remove('show');
    }, 3000);
}

errorCloseBtn.addEventListener('click', () => {
    errorBanner.classList.remove('show');
});

// =====================
// УВЕДОМЛЕНИЯ
// =====================
function showNotification(title, message) {
    if (activeNotification) {
        activeNotification.remove();
    }

    const notif = document.createElement('div');
    notif.className = 'notification';
    notif.innerHTML = `<div class="title">${title}</div><div class="message">${message}</div>`;
    notificationContainer.appendChild(notif);

    setTimeout(() => notif.classList.add('show'), 50);
    activeNotification = notif;

    notificationHideTimeout = setTimeout(() => {
        notif.classList.remove('show');
        setTimeout(() => notif.remove(), 400);
    }, 2500);
}

// =====================
// ЗАГРУЗКА ТИКЕТОВ ИЗ JSON
// =====================
let ticketsData = {};

// Загружаем tickets.json при старте
fetch('tickets.json')
    .then(response => {
        if (!response.ok) throw new Error('Не удалось загрузить tickets.json');
        return response.json();
    })
    .then(data => {
        ticketsData = data;
        console.log('База тикетов загружена', ticketsData);
    })
    .catch(err => {
        showError('Ошибка загрузки базы тикетов');
        console.error(err);
    });

// =====================
// ТАЙМЛАЙН
// =====================
function renderTimeline(history) {
    const timeline = document.getElementById('timeline');
    timeline.innerHTML = '';

    history.forEach(item => {
        const div = document.createElement('div');
        div.className = 'timeline-item';
        div.innerHTML = `
            <div class="timeline-dot"></div>
            <div class="timeline-content">
                <div class="timeline-status">${item.status}</div>
                <div class="timeline-date">${item.date}</div>
            </div>
        `;
        timeline.appendChild(div);
    });
}

// =====================
// НАВИГАЦИЯ
// =====================
startBtn.addEventListener('click', () => slideTo(faceMenu));
backToMainBtn.addEventListener('click', () => slideTo(faceMain));
checkStatusBtn.addEventListener('click', () => {
    slideTo(faceCheck);
    ticketInput.value = '';
    setTimeout(() => ticketInput.focus(), 300);
});
createBtn.addEventListener('click', () => slideTo(faceCreate));
checkBackBtn.addEventListener('click', () => slideTo(faceMenu));
createBackBtn.addEventListener('click', () => slideTo(faceMenu));
resultBackBtn.addEventListener('click', () => slideTo(faceCheck));


// =====================
// ПРОВЕРКА ОБРАЩЕНИЯ
// =====================
checkBtn.addEventListener('click', () => {
    const ticketNum = ticketInput.value.trim();
    if (!ticketNum) return showError('Введите номер обращения!');
    if (!ticketsData[ticketNum]) return showError('Обращение не найдено!');

    slideTo(faceLoading);
    loadingContent.style.display = 'flex';
    resultContent.style.display = 'none';

    setTimeout(() => {
        const ticket = ticketsData[ticketNum];

        document.getElementById('ticketNumber').textContent = `Обращение №${ticketNum}`;
        document.getElementById('resultUser').textContent = ticket.user;
        document.getElementById('resultAdmin').textContent = ticket.admin;
        document.getElementById('resultDate').textContent = ticket.created;
        document.getElementById('resultStatus').textContent = ticket.status;

        renderTimeline(ticket.history);

        loadingContent.style.display = 'none';
        resultContent.style.display = 'block';

        showNotification('Успешно', 'Обращение найдено');
    }, 1200);
});


// =====================
// СОЗДАНИЕ ОБРАЩЕНИЯ
// =====================
createSubmitBtn.addEventListener('click', () => {
    const nick = nickInput.value.trim();
    const type = typeSelect.value;

    if (!nick) return showError('Введите Nick!');
    if (!type) return showError('Выберите тип!');

    slideTo(faceLoading);

    setTimeout(() => {
        const botUrl = `https://t.me/FernieXBot?start=name=${encodeURIComponent(nick)};type=${type}`;
        window.open(botUrl, '_blank');
        showNotification('Telegram', 'Бот открыт');

        slideTo(faceMenu);
    }, 1000);
});

// =====================
// ENTER
// =====================
ticketInput.addEventListener('keypress', e => {
    if (e.key === 'Enter') checkBtn.click();
});

nickInput.addEventListener('keypress', e => {
    if (e.key === 'Enter') createSubmitBtn.click();
});

// =====================
// 3D TILT ЭФФЕКТ (только для десктопов)
// =====================
if (!isMobile && window.innerWidth > 768) {
    let rotateX = 0;
    let rotateY = 0;
    let targetX = 0;
    let targetY = 0;
    const speed = 0.1;

    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        targetX = ((y - centerY) / centerY) * 8;
        targetY = ((x - centerX) / centerX) * 8;
    });

    function animateTilt() {
        rotateX += (targetX - rotateX) * speed;
        rotateY += (targetY - rotateY) * speed;

        card.style.transform = `perspective(1000px) rotateX(${-rotateX}deg) rotateY(${rotateY}deg)`;

        requestAnimationFrame(animateTilt);
    }
    animateTilt();

    card.addEventListener('mouseleave', () => {
        targetX = 0;
        targetY = 0;
    });
}

// =====================
// ПЕРЕОРИЕНТАЦИЯ ЭКРАНА
// =====================
window.addEventListener('resize', () => {
    if (window.innerWidth <= 480) {
        document.body.style.paddingTop = '60px';
    } else {
        document.body.style.paddingTop = '20px';
    }
});

// =====================
// ИНИЦИАЛИЗАЦИЯ ПРИ ЗАГРУЗКЕ
// =====================
document.addEventListener('DOMContentLoaded', () => {
    if (window.innerWidth <= 480) {
        document.body.style.paddingTop = '60px';
    }
    
    // Фокус на главной кнопке для лучшей доступности
    startBtn.focus();
});
