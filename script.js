// =====================
// ЭЛЕМЕНТЫ И ПЕРЕМЕННЫЕ
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

let errorTimeout = null;
let activeNotification = null;
let notificationHideTimeout = null;
let searchTimeout = null;

// Имитация базы данных обращений
const ticketsData = {
    "001": {
        user: "FernieX",
        admin: "Support Team",
        created: "23.01.2025 14:30",
        status: "Решено",
        type: "bug",
        description: "Ошибка при входе на сайт",
        history: [
            { status: "Решено", date: "23.01.2025 18:45" },
            { status: "В разработке", date: "23.01.2025 16:20" },
            { status: "Принято к рассмотрению", date: "23.01.2025 15:10" },
            { status: "Обращение создано", date: "23.01.2025 14:30" }
        ]
    },
    "002": {
        user: "UserName",
        admin: "Support Admin",
        created: "22.01.2025 10:15",
        status: "На рассмотрении",
        type: "suggest",
        description: "Предложение по улучшению дизайна",
        history: [
            { status: "На рассмотрении", date: "23.01.2025 09:00" },
            { status: "Принято к рассмотрению", date: "22.01.2025 11:30" },
            { status: "Обращение создано", date: "22.01.2025 10:15" }
        ]
    },
    "003": {
        user: "TestUser",
        admin: "Manager",
        created: "21.01.2025 08:45",
        status: "Ответ отправлен",
        type: "question",
        description: "Как сбросить пароль?",
        history: [
            { status: "Ответ отправлен", date: "23.01.2025 12:00" },
            { status: "В разработке", date: "22.01.2025 14:00" },
            { status: "Принято к рассмотрению", date: "21.01.2025 10:00" },
            { status: "Обращение создано", date: "21.01.2025 08:45" }
        ]
    },
    "004": {
        user: "AdminUser",
        admin: "Senior Support",
        created: "20.01.2025 16:00",
        status: "Решено",
        type: "complaint",
        description: "Жалоба на работу сервиса",
        history: [
            { status: "Решено", date: "23.01.2025 14:30" },
            { status: "Ответ отправлен", date: "22.01.2025 10:00" },
            { status: "В разработке", date: "21.01.2025 15:00" },
            { status: "Принято к рассмотрению", date: "20.01.2025 17:00" },
            { status: "Обращение создано", date: "20.01.2025 16:00" }
        ]
    },
    "005": {
        user: "ProUser",
        admin: "Support Team",
        created: "19.01.2025 12:30",
        status: "На рассмотрении",
        type: "other",
        description: "Консультация по тарифам",
        history: [
            { status: "На рассмотрении", date: "23.01.2025 11:00" },
            { status: "Принято к рассмотрению", date: "19.01.2025 13:45" },
            { status: "Обращение создано", date: "19.01.2025 12:30" }
        ]
    }
};

// =====================
// ФУНКЦИИ
// =====================

/**
 * Показать ошибку в баннере
 */
function showError(message) {
    if (errorBanner.classList.contains('show')) {
        errorBanner.classList.remove('show');
        clearTimeout(errorTimeout);
        setTimeout(() => {
            errorMessage.innerText = message;
            errorBanner.classList.add('show');
            errorTimeout = setTimeout(hideError, 3000);
        }, 50);
    } else {
        errorMessage.innerText = message;
        errorBanner.classList.add('show');
        errorTimeout = setTimeout(hideError, 3000);
    }
}

/**
 * Скрыть ошибку
 */
function hideError() {
    errorBanner.classList.remove('show');
    clearTimeout(errorTimeout);
}

/**
 * Показать уведомление
 */
function showNotification(title, message) {
    if (activeNotification) {
        clearTimeout(notificationHideTimeout);
        activeNotification.classList.remove('show');
        setTimeout(() => activeNotification.remove(), 200);
    }

    const notif = document.createElement('div');
    notif.className = 'notification';
    notif.innerHTML = `<div class="title">${title}</div><div class="message">${message}</div>`;
    notificationContainer.appendChild(notif);

    setTimeout(() => notif.classList.add('show'), 50);
    activeNotification = notif;

    notificationHideTimeout = setTimeout(() => {
        notif.classList.remove('show');
        setTimeout(() => {
            notif.remove();
            activeNotification = null;
        }, 400);
    }, 2500);
}

/**
 * Получить случайное время загрузки
 */
function getRandomLoadingTime() {
    return Math.random() > 0.7 ? 100 : 2000;
}

/**
 * Отрендерить временную шкалу
 */
function renderTimeline(history) {
    const timeline = document.getElementById('timeline');
    timeline.innerHTML = '';

    history.forEach((item, index) => {
        const timelineItem = document.createElement('div');
        timelineItem.className = 'timeline-item';
        
        if (index < history.length - 1) {
            const line = document.createElement('div');
            line.className = 'timeline-line';
            timelineItem.appendChild(line);
        }

        const dot = document.createElement('div');
        dot.className = 'timeline-dot';
        timelineItem.appendChild(dot);

        const content = document.createElement('div');
        content.className = 'timeline-content';
        content.innerHTML = `
            <div class="timeline-status">• ${item.status}</div>
            <div class="timeline-date">${item.date}</div>
        `;
        timelineItem.appendChild(content);

        timeline.appendChild(timelineItem);
    });
}

// =====================
// СОБЫТИЯ - НАВИГАЦИЯ
// =====================

startBtn.addEventListener('click', () => {
    card.classList.remove('active-main');
    card.classList.add('active-menu');
});

backToMainBtn.addEventListener('click', () => {
    card.classList.remove('active-menu', 'active-check', 'active-loading', 'active-create');
    card.classList.add('active-main');
});

checkStatusBtn.addEventListener('click', () => {
    card.classList.remove('active-menu');
    card.classList.add('active-check');
    ticketInput.value = '';
    setTimeout(() => ticketInput.focus(), 100);
});

createBtn.addEventListener('click', () => {
    card.classList.remove('active-menu');
    card.classList.add('active-create');
    nickInput.value = '';
    typeSelect.value = '';
    setTimeout(() => nickInput.focus(), 100);
});

checkBackBtn.addEventListener('click', () => {
    card.classList.remove('active-check');
    card.classList.add('active-menu');
});

createBackBtn.addEventListener('click', () => {
    card.classList.remove('active-create');
    card.classList.add('active-menu');
});

resultBackBtn.addEventListener('click', () => {
    card.classList.remove('active-result');
    card.classList.add('active-check');
    ticketInput.value = '';
    loadingContent.style.display = 'block';
    resultContent.style.display = 'none';
    ticketInput.focus();
});

errorCloseBtn.addEventListener('click', hideError);

// =====================
// СОБЫТИЯ - ПРОВЕРКА ОБРАЩЕНИЯ
// =====================

checkBtn.addEventListener('click', () => {
    const ticketNum = ticketInput.value.trim();

    if (!ticketNum) {
        showError('Введите номер обращения!');
        return;
    }

    if (!ticketsData[ticketNum]) {
        showError('Обращение не найдено!');
        return;
    }

    card.classList.remove('active-check');
    card.classList.add('active-loading');

    const loadingTime = getRandomLoadingTime();
    const loadingText = document.getElementById('loadingText');
    loadingText.textContent = loadingTime === 100 ? '(0.10 сек)' : '(2 сек)';

    searchTimeout = setTimeout(() => {
        const ticket = ticketsData[ticketNum];
        
        document.getElementById('ticketNumber').textContent = `Обращение №${ticketNum}`;
        document.getElementById('resultUser').textContent = ticket.user;
        document.getElementById('resultAdmin').textContent = ticket.admin;
        document.getElementById('resultDate').textContent = ticket.created;
        document.getElementById('resultStatus').textContent = ticket.status;
        
        renderTimeline(ticket.history);

        loadingContent.style.display = 'none';
        resultContent.style.display = 'block';

        showNotification('Успешно!', `Обращение №${ticketNum} найдено`);
    }, loadingTime);
});

cancelBtn.addEventListener('click', () => {
    clearTimeout(searchTimeout);
    card.classList.remove('active-loading');
    card.classList.add('active-check');
    loadingContent.style.display = 'block';
    resultContent.style.display = 'none';
});

// =====================
// СОБЫТИЯ - СОЗДАНИЕ ОБРАЩЕНИЯ
// =====================

createSubmitBtn.addEventListener('click', () => {
    const nick = nickInput.value.trim();
    const type = typeSelect.value;

    if (!nick) {
        showError('Введите ваш Nick!');
        return;
    }

    if (!type) {
        showError('Выберите тип обращения!');
        return;
    }

    card.classList.remove('active-create');
    card.classList.add('active-loading');
    loadingContent.innerHTML = `
        <h2>Создание обращения...</h2>
        <div class="loading-spinner"></div>
        <div class="loading-text">Перенаправление в Telegram...</div>
    `;

    setTimeout(() => {
        const botUrl = `https://t.me/FernieXBot?start=name=${encodeURIComponent(nick)};type=${type}`;
        window.open(botUrl, '_blank');
        
        showNotification('Переход в Telegram', 'Бот FernieX будет загружен');
        
        setTimeout(() => {
            card.classList.remove('active-loading', 'active-create');
            card.classList.add('active-menu');
            loadingContent.innerHTML = `
                <h2>Поиск обращения...</h2>
                <div class="loading-spinner"></div>
                <div class="loading-text" id="loadingText"></div>
                <div class="buttons" style="margin-top: 20px;">
                    <button class="btn danger" id="cancelBtn">Отменить поиск</button>
                </div>
            `;
            nickInput.value = '';
            typeSelect.value = '';
        }, 1500);
    }, 1000);
});

// =====================
// ОБРАБОТКА ENTER
// =====================

ticketInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') checkBtn.click();
});

nickInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && typeSelect.value) createSubmitBtn.click();
});
