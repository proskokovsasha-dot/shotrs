// Данные приложения
let currentUser = { username: "Гость", email: "guest@example.com", isPremium: false }; // Добавлено isPremium
let currentVideoIndex = 0;
let videos = []; // Все видео
let filteredVideos = []; // Видео после применения фильтров и поиска
let comments = {};
let likedVideos = new Set();
let savedVideos = new Set();
let subscriptions = new Set(); // Подписки пользователя
let notifications = []; // Уведомления пользователя
let isTransitioning = false;
let menuVisible = true; // Состояние видимости меню

// Состояние фильтров
let currentSearchQuery = '';
let currentCategoryFilter = 'all';
let currentSortOrder = 'default';

// Элементы DOM
const mainPage = document.getElementById('mainPage');
const userMenu = document.getElementById('userMenu');
const userName = document.getElementById('userName');
const profileBtn = document.getElementById('profileBtn');
const videoCarousel = document.querySelector('.video-carousel');
const likeBtn = document.getElementById('likeBtn');
const commentBtn = document.getElementById('commentBtn');
const saveBtn = document.getElementById('saveBtn');
const shareBtn = document.getElementById('shareBtn');
const likeCount = document.getElementById('likeCount');
const commentCount = document.getElementById('commentCount');
const subscribeBtn = document.getElementById('subscribeBtn');
const header = document.querySelector('.header'); // Добавляем хедер
const videoControls = document.querySelector('.video-controls'); // Добавляем элементы управления видео

// Элементы поиска и фильтров
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const searchContainer = document.querySelector('.search-container'); // Добавляем searchContainer

// Модальные окна
const commentModal = document.getElementById('commentModal');
const profileModal = document.getElementById('profileModal');
const filterModal = document.getElementById('filterModal'); // Модальное окно фильтров
const premiumModal = document.getElementById('premiumModal'); // Модальное окно премиум-подписки
const closeCommentModal = document.getElementById('closeCommentModal');
const closeProfileModal = document.getElementById('closeProfileModal');
const closeFilterModal = document.getElementById('closeFilterModal'); // Кнопка закрытия фильтров
const closePremiumModal = document.getElementById('closePremiumModal'); // Кнопка закрытия премиум-модалки

// Комментарии
const commentsList = document.querySelector('.comments-list');
const commentText = document.getElementById('commentText');
const postComment = document.getElementById('postComment');

// Профиль
const profileUsername = document.getElementById('profileUsername');
const profileEmail = document.getElementById('profileEmail');
const profileAvatarLetter = document.getElementById('profileAvatarLetter');
const profileLikesCount = document.getElementById('profileLikesCount');
const profileCommentsCount = document.getElementById('profileCommentsCount');
const profileSubscriptionsCount = document.getElementById('profileSubscriptionsCount');
const savedVideosList = document.getElementById('savedVideosList');
const subscriptionsList = document.getElementById('subscriptionsList');
const notificationsList = document.getElementById('notificationsList');
const premiumStatus = document.getElementById('premiumStatus'); // Элемент для статуса премиум
const activatePremiumBtn = document.getElementById('activatePremiumBtn'); // Кнопка активации премиум

// Новые элементы для статистики профиля
const profileViewsCount = document.getElementById('profileViewsCount');
const profileAudienceDemographics = document.getElementById('profileAudienceDemographics');

// Фильтры
const categoryButtons = document.querySelectorAll('.filter-category-btn');
const sortButtons = document.querySelectorAll('.filter-sort-btn');
const applyFiltersBtn = document.getElementById('applyFiltersBtn');

// Рекламные видео
const adVideos = [
    {
        id: 'ad1',
        title: "Реклама: Новый продукт!",
        author: "Рекламодатель",
        videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4",
        isAd: true
    },
    {
        id: 'ad2',
        title: "Реклама: Успей купить!",
        author: "Рекламодатель",
        videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/WhatCarCanYouGetForAGrand.mp4",
        isAd: true
    }
];

// Инициализация приложения
document.addEventListener('DOMContentLoaded', function() {
    // Инициализация Telegram Web App
    if (window.Telegram && window.Telegram.WebApp) {
        Telegram.WebApp.ready();
        Telegram.WebApp.expand(); // Развернуть на весь экран
        // Устанавливаем цвет фона, если доступно
        if (Telegram.WebApp.setBackgroundColor) {
            Telegram.WebApp.setBackgroundColor('#121212'); // Соответствует var(--dark)
        }
        if (Telegram.WebApp.setHeaderColor) {
            Telegram.WebApp.setHeaderColor('secondary_bg_color'); // Используем цвет фона заголовка Telegram
        }
        // Отключаем pull-to-refresh, чтобы не мешать свайпам
        Telegram.WebApp.disableVerticalSwipes();
    }

    // Загружаем данные из localStorage
    const savedLikes = localStorage.getItem('likedVideos');
    if (savedLikes) {
        likedVideos = new Set(JSON.parse(savedLikes));
    }

    const userSavedVideos = localStorage.getItem(`savedVideos_${currentUser.username}`);
    if (userSavedVideos) {
        savedVideos = new Set(JSON.parse(userSavedVideos));
    }

    const savedSubscriptions = localStorage.getItem(`subscriptions_${currentUser.username}`);
    if (savedSubscriptions) {
        subscriptions = new Set(JSON.parse(savedSubscriptions));
    }

    const savedNotifications = localStorage.getItem(`notifications_${currentUser.username}`);
    if (savedNotifications) {
        notifications = JSON.parse(savedNotifications);
    }

    const savedPremiumStatus = localStorage.getItem(`isPremium_${currentUser.username}`);
    if (savedPremiumStatus) {
        currentUser.isPremium = JSON.parse(savedPremiumStatus);
    }
    
    // Инициализируем видео
    initVideos();
    
    // Настройка обработчиков событий
    setupEventListeners();
    
    // Применяем начальные фильтры и рендерим видео
    applyFiltersAndRenderVideos();

    // Обновляем имя пользователя в шапке и букву аватара
    userName.textContent = currentUser.username;
    profileAvatarLetter.textContent = currentUser.username.charAt(0).toUpperCase();
});

// Инициализация видео
function initVideos() {
    videos = [
        {
            id: 1,
            title: "Удивительные места мира #путешествия #природа",
            author: "Путешественник",
            videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
            likes: 1245,
            comments: 89,
            tags: ["путешествия", "природа", "красота", "мир"],
            category: "travel",
            views: 15000,
            audience: { male: '40%', female: '60%', age: '25-34' }
        },
        {
            id: 2,
            title: "Смешные животные #юмор #животные",
            author: "ЗооБлог",
            videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
            likes: 3567,
            comments: 243,
            tags: ["животные", "юмор", "смех", "кошки", "собаки"],
            category: "humor",
            views: 45000,
            audience: { male: '55%', female: '45%', age: '18-24' }
        },
        {
            id: 3,
            title: "Кулинарный мастер-класс: Итальянская паста #еда #кулинария",
            author: "ШефПовар",
            videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
            likes: 892,
            comments: 56,
            tags: ["еда", "кулинария", "рецепты", "паста", "италия"],
            category: "food",
            views: 8000,
            audience: { male: '30%', female: '70%', age: '35-44' }
        },
        {
            id: 4,
            title: "Экстремальный спорт: Прыжки с парашютом #спорт #экстрим",
            author: "Адреналин",
            videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
            likes: 2109,
            comments: 167,
            tags: ["спорт", "экстрим", "приключения", "парашют", "высота"],
            category: "sport",
            views: 22000,
            audience: { male: '70%', female: '30%', age: '18-34' }
        },
        {
            id: 5,
            title: "Музыкальный клип: Новая волна #музыка #клип",
            author: "Артист",
            videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4",
            likes: 3102,
            comments: 421,
            tags: ["музыка", "клип", "поп", "новинка", "хит"],
            category: "music",
            views: 38000,
            audience: { male: '45%', female: '55%', age: '18-24' }
        },
        {
            id: 6,
            title: "Путешествие по Норвегии #путешествия #норвегия",
            author: "Путешественник",
            videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
            likes: 1500,
            comments: 100,
            tags: ["путешествия", "природа", "горы", "норвегия", "фьорды"],
            category: "travel",
            views: 18000,
            audience: { male: '40%', female: '60%', age: '25-34' }
        },
        {
            id: 7,
            title: "Забавные котики #животные #котики",
            author: "ЗооБлог",
            videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
            likes: 4000,
            comments: 300,
            tags: ["животные", "котики", "юмор", "милота", "смех"],
            category: "humor",
            views: 50000,
            audience: { male: '50%', female: '50%', age: '13-24' }
        },
        {
            id: 8,
            title: "Быстрые рецепты для завтрака #еда #завтрак",
            author: "ШефПовар",
            videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
            likes: 950,
            comments: 70,
            tags: ["еда", "завтрак", "рецепты", "быстро", "вкусно"],
            category: "food",
            views: 9000,
            audience: { male: '30%', female: '70%', age: '25-44' }
        },
        {
            id: 9,
            title: "Топ-10 мест для дайвинга #путешествия #дайвинг",
            author: "Подводный Мир",
            videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4", // Используем существующее видео
            likes: 1800,
            comments: 120,
            tags: ["путешествия", "дайвинг", "океан", "приключения", "подводный мир"],
            category: "travel",
            views: 20000,
            audience: { male: '60%', female: '40%', age: '25-34' }
        },
        {
            id: 10,
            title: "Лучшие приколы 2023 #юмор #приколы",
            author: "Смеха ради",
            videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4", // Используем существующее видео
            likes: 5200,
            comments: 450,
            tags: ["юмор", "приколы", "смех", "комедия", "лучшее"],
            category: "humor",
            views: 60000,
            audience: { male: '65%', female: '35%', age: '18-24' }
        },
        {
            id: 11,
            title: "Как приготовить идеальный стейк #еда #кулинария",
            author: "Мясной Эксперт",
            videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4", // Используем существующее видео
            likes: 2300,
            comments: 180,
            tags: ["еда", "кулинария", "рецепты", "стейк", "мясо"],
            category: "food",
            views: 25000,
            audience: { male: '70%', female: '30%', age: '25-44' }
        },
        {
            id: 12,
            title: "Тренировка для всего тела дома #спорт #фитнес",
            author: "Фитнес Гуру",
            videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4", // Используем существующее видео
            likes: 2900,
            comments: 210,
            tags: ["спорт", "фитнес", "тренировка", "дом", "здоровье"],
            category: "sport",
            views: 32000,
            audience: { male: '50%', female: '50%', age: '18-34' }
        },
        {
            id: 13,
            title: "Инди-музыка: Открытие новых талантов #музыка #инди",
            author: "Музыкальный Критик",
            videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4", // Используем существующее видео
            likes: 1100,
            comments: 90,
            tags: ["музыка", "инди", "таланты", "новинки", "обзор"],
            category: "music",
            views: 12000,
            audience: { male: '40%', female: '60%', age: '18-24' }
        },
        {
            id: 14,
            title: "Загадки древних цивилизаций #наука #история",
            author: "Историк",
            videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4", // Используем существующее видео
            likes: 1700,
            comments: 110,
            tags: ["история", "загадки", "цивилизации", "древний мир", "наука"],
            category: "science", // Новая категория
            views: 19000,
            audience: { male: '55%', female: '45%', age: '35-54' }
        },
        {
            id: 15,
            title: "Обзор новых технологий 2024 #технологии #гаджеты",
            author: "ТехноБлогер",
            videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4", // Используем существующее видео
            likes: 3800,
            comments: 320,
            tags: ["технологии", "обзор", "гаджеты", "будущее", "инновации"],
            category: "tech", // Новая категория
            views: 40000,
            audience: { male: '80%', female: '20%', age: '18-34' }
        },
        {
            id: 16,
            title: "Уроки рисования для начинающих #искусство #рисование",
            author: "Художник",
            videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4", // Используем существующее видео
            likes: 900,
            comments: 60,
            tags: ["искусство", "рисование", "уроки", "творчество", "хобби"],
            category: "art", // Новая категория
            views: 10000,
            audience: { male: '30%', female: '70%', age: '13-24' }
        },
        {
            id: 17,
            title: "Секреты продуктивности #образование #лайфхаки",
            author: "Лайфхакер",
            videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4", // Используем существующее видео
            likes: 1400,
            comments: 80,
            tags: ["саморазвитие", "продуктивность", "советы", "лайфхаки", "мотивация"],
            category: "education", // Новая категория
            views: 16000,
            audience: { male: '45%', female: '55%', age: '25-34' }
        },
        {
            id: 18,
            title: "Космические тайны: Черные дыры #наука #космос",
            author: "Астрофизик",
            videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4", // Используем существующее видео
            likes: 2500,
            comments: 190,
            tags: ["космос", "наука", "астрономия", "черные дыры", "вселенная"],
            category: "science",
            views: 28000,
            audience: { male: '60%', female: '40%', age: '35-54' }
        },
        {
            id: 19,
            title: "Лучшие моменты из игр #игры #гейминг",
            author: "Геймер",
            videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4", // Используем существующее видео
            likes: 4100,
            comments: 350,
            tags: ["игры", "гейминг", "моменты", "развлечения", "киберспорт"],
            category: "gaming", // Новая категория
            views: 48000,
            audience: { male: '90%', female: '10%', age: '13-24' }
        },
        {
            id: 20,
            title: "Уютный дом: Идеи для интерьера #лайфстайл #дизайн",
            author: "Дизайнер",
            videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4", // Используем существующее видео
            likes: 1000,
            comments: 75,
            tags: ["дом", "интерьер", "дизайн", "уют", "идеи"],
            category: "lifestyle", // Новая категория
            views: 11000,
            audience: { male: '20%', female: '80%', age: '25-44' }
        }
    ];
    
    // Инициализируем комментарии для каждого видео
    videos.forEach(video => {
        comments[video.id] = [
            { user: "Алексей", text: "Отличное видео! Спасибо за контент!" },
            { user: "Мария", text: "Обожаю такие ролики! Жду продолжения!" },
            { user: "Дмитрий", text: "Интересно, где это снято?" }
        ];
    });

    // Инициализируем filteredVideos всеми видео
    filteredVideos = [...videos];
}

// Вспомогательная функция debounce для задержки выполнения
function debounce(func, delay) {
    let timeout;
    return function(...args) {
        const context = this;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), delay);
    };
}

// Настройка обработчиков событий
function setupEventListeners() {
    // Профиль
    profileBtn.addEventListener('click', showProfileModal);
    
    // Модальные окна
    closeCommentModal.addEventListener('click', hideComments);
    closeProfileModal.addEventListener('click', hideProfileModal);
    closeFilterModal.addEventListener('click', hideFilterModal);
    closePremiumModal.addEventListener('click', hidePremiumModal); // Закрытие премиум-модалки
    
    // Управление видео
    likeBtn.addEventListener('click', toggleLike);
    commentBtn.addEventListener('click', showComments);
    saveBtn.addEventListener('click', toggleSaveVideo);
    shareBtn.addEventListener('click', shareVideo);
    subscribeBtn.addEventListener('click', toggleSubscribe);
    
    // Комментарии
    postComment.addEventListener('click', addComment);
    commentText.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            addComment();
        }
    });
    
    // Свайпы для мобильных устройств и прокрутка для десктопа
    setupVideoNavigation();
    setupMenuToggleOnSwipe(); // Добавляем обработчик для свайпа меню

    // Поиск и фильтры
    // Используем debounce для searchInput, чтобы избежать мерцания
    searchInput.addEventListener('input', debounce((e) => {
        currentSearchQuery = e.target.value.toLowerCase();
        applyFiltersAndRenderVideos();
    }, 300)); // Задержка 300 мс

    // Обработчик для кнопки поиска
    searchBtn.addEventListener('click', () => {
        if (window.innerWidth <= 768) { // Для мобильных устройств
            // Переключаем активное состояние хедера для раскрытия поиска
            header.classList.toggle('search-active');
            if (header.classList.contains('search-active')) {
                searchInput.focus(); // Фокусируемся на поле ввода
                // Отключаем свайпы видео, когда поиск активен
                disableVideoSwipes();
            } else {
                searchInput.blur(); // Убираем фокус
                // Включаем свайпы видео, когда поиск неактивен
                enableVideoSwipes();
            }
        } else { // Для десктопных устройств
            showFilterModal(); // Открываем модальное окно фильтров
        }
    });

    // Обработчики фокуса для searchInput для мобильных устройств
    searchInput.addEventListener('focus', () => {
        if (window.innerWidth <= 768) { // Применяем только для мобильных
            header.classList.add('search-active');
            userMenu.classList.add('hidden');
            // Отключаем свайпы видео, когда поиск активен
            disableVideoSwipes();
        }
    });

    searchInput.addEventListener('blur', () => {
        if (window.innerWidth <= 768) { // Применяем только для мобильных
            // Если поле ввода пустое, скрываем его
            if (searchInput.value === '') {
                header.classList.remove('search-active');
                userMenu.classList.remove('hidden');
                // Включаем свайпы видео, когда поиск неактивен
                enableVideoSwipes();
            }
        }
    });

    categoryButtons.forEach(button => {
        button.addEventListener('click', () => {
            categoryButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            currentCategoryFilter = button.dataset.category;
        });
    });

    sortButtons.forEach(button => {
        button.addEventListener('click', () => {
            sortButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            currentSortOrder = button.dataset.sort;
        });
    });

    applyFiltersBtn.addEventListener('click', () => {
        applyFiltersAndRenderVideos();
        hideFilterModal();
    });

    // Обработчик для кнопки активации премиум
    activatePremiumBtn.addEventListener('click', activatePremiumSubscription);
}

// Глобальные переменные для управления свайпами видео
let videoSwipeEnabled = true;

// Функции для включения/отключения свайпов видео
function disableVideoSwipes() {
    videoSwipeEnabled = false;
}

function enableVideoSwipes() {
    videoSwipeEnabled = true;
}

// Показать уведомление
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    notification.style.position = 'fixed';
    notification.style.top = '20px';
    notification.style.right = '20px';
    notification.style.padding = '15px 20px';
    notification.style.borderRadius = '5px';
    notification.style.color = 'white';
    notification.style.zIndex = '10000';
    notification.style.fontWeight = '600';
    notification.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
    notification.style.transform = 'translateX(150%)';
    notification.style.transition = 'transform 0.3s ease';
    
    if (type === 'success') {
        notification.style.background = 'linear-gradient(to right, var(--success), #66BB6A)';
    } else if (type === 'error') {
        notification.style.background = 'linear-gradient(to right, var(--error), #EF5350)';
    } else {
        notification.style.background = 'linear-gradient(to right, var(--primary), var(--secondary))';
    }
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    setTimeout(() => {
        notification.style.transform = 'translateX(150%)';
        setTimeout(() => {
            if (notification.parentNode) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Рендеринг видео
function renderVideos() {
    videoCarousel.innerHTML = '';
    
    if (filteredVideos.length === 0) {
        videoCarousel.innerHTML = '<p class="empty-state" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);">Видео не найдено по вашему запросу.</p>';
        // Скрываем элементы управления, если нет видео
        videoControls.classList.add('hidden');
        return;
    } else {
        videoControls.classList.remove('hidden');
    }

    filteredVideos.forEach((video, index) => {
        const videoItem = document.createElement('div');
        videoItem.className = `video-item ${index === currentVideoIndex ? 'active' : ''}`;
        videoItem.dataset.index = index;

        // Извлекаем хештеги из заголовка для отображения
        const titleWithoutHashtags = video.title.replace(/#(\w+)/g, '').trim();
        const hashtagsInTitle = (video.title.match(/#(\w+)/g) || []).map(tag => `<span class="hashtag-link">${tag}</span>`).join(' ');
        
        videoItem.innerHTML = `
            <div class="video-loader"></div> <!-- Лоадер -->
            <video loop muted playsinline preload="auto">
                <source src="${video.videoUrl}" type="video/mp4">
                Ваш браузер не поддерживает видео.
            </video>
            <div class="video-info">
                <h3 class="video-title">${titleWithoutHashtags}</h3>
                <div class="video-hashtags">${hashtagsInTitle}</div>
                <div class="video-author">
                    <div class="author-avatar">${video.author.charAt(0)}</div>
                    <span>${video.author}</span>
                </div>
            </div>
            ${video.isAd ? '<div class="ad-label">Реклама</div>' : ''}
        `;
        
        videoCarousel.appendChild(videoItem);

        // Добавляем обработчики кликов для хештегов
        videoItem.querySelectorAll('.hashtag-link').forEach(hashtagSpan => {
            hashtagSpan.addEventListener('click', (e) => {
                e.stopPropagation(); // Предотвращаем всплытие события, чтобы не сработал двойной тап/клик на видео
                const hashtag = hashtagSpan.textContent.substring(1); // Убираем '#'
                searchInput.value = hashtag; // Устанавливаем хештег в поле поиска
                currentSearchQuery = hashtag.toLowerCase();
                applyFiltersAndRenderVideos();
                showNotification(`Поиск по хештегу: #${hashtag}`, 'info');
            });
        });

        // Скрываем лоадер, когда видео готово к воспроизведению
        const videoElement = videoItem.querySelector('video');
        const loaderElement = videoItem.querySelector('.video-loader');
        videoElement.addEventListener('canplaythrough', () => {
            loaderElement.style.display = 'none';
        });
        videoElement.addEventListener('waiting', () => {
            loaderElement.style.display = 'block';
        });

        // Обработчик двойного тапа для лайка
        let lastTap = 0;
        videoElement.addEventListener('touchend', function(event) {
            // Предотвращаем стандартное поведение (зум) при двойном тапе
            event.preventDefault(); 
            const currentTime = new Date().getTime();
            const tapLength = currentTime - lastTap;
            if (tapLength < 300 && tapLength > 0) { // Двойной тап
                if (index === currentVideoIndex && !video.isAd) { // Лайкаем только активное видео, если это не реклама
                    toggleLike();
                    showDoubleTapLikeAnimation(event.changedTouches[0].clientX, event.changedTouches[0].clientY);
                }
            }
            lastTap = currentTime;
        });

        // Обработчик двойного клика для лайка на десктопе
        videoElement.addEventListener('dblclick', function(event) {
            // Предотвращаем стандартное поведение (зум) при двойном клике
            event.preventDefault();
            if (index === currentVideoIndex && !video.isAd) { // Лайкаем только активное видео, если это не реклама
                toggleLike();
                showDoubleTapLikeAnimation(event.clientX, event.clientY);
            }
        });
    });
}

// Показать анимацию лайка при двойном тапе/клике
function showDoubleTapLikeAnimation(x, y) {
    const likeAnimation = document.createElement('div');
    likeAnimation.className = 'double-tap-like-animation';
    likeAnimation.innerHTML = '<i class="fas fa-heart"></i>';
    likeAnimation.style.left = `${x}px`;
    likeAnimation.style.top = `${y}px`;
    document.body.appendChild(likeAnimation);

    likeAnimation.addEventListener('animationend', () => {
        likeAnimation.remove();
    });
}

// Обновление отображения видео
function updateVideoDisplay(index) {
    if (isTransitioning || index < 0 || index >= filteredVideos.length) return;
    
    isTransitioning = true;
    
    // Останавливаем текущее видео
    const currentVideoElement = document.querySelector('.video-item.active video');
    if (currentVideoElement) {
        currentVideoElement.pause();
    }
    
    // Обновляем классы для анимации
    document.querySelectorAll('.video-item').forEach((item, i) => {
        item.classList.remove('active', 'prev', 'next');
        
        if (i === index) {
            item.classList.add('active');
        } else if (i < index) {
            item.classList.add('prev');
        } else {
            item.classList.add('next');
        }
    });
    
    const video = filteredVideos[index];

    // Скрываем/показываем элементы управления для рекламных видео
    if (video.isAd) {
        videoControls.classList.add('hidden');
    } else {
        videoControls.classList.remove('hidden');
        // Обновляем счетчики лайков и комментариев
        likeCount.textContent = formatCount(video.likes + (likedVideos.has(video.id) ? 1 : 0));
        commentCount.textContent = formatCount(video.comments + (comments[video.id] ? comments[video.id].length : 0));
        
        // Обновляем состояние кнопки лайка
        if (likedVideos.has(video.id)) {
            likeBtn.classList.add('active');
            likeBtn.innerHTML = '<i class="fas fa-heart"></i><span class="control-count" id="likeCount">' + formatCount(video.likes + 1) + '</span>';
        } else {
            likeBtn.classList.remove('active');
            likeBtn.innerHTML = '<i class="far fa-heart"></i><span class="control-count" id="likeCount">' + formatCount(video.likes) + '</span>';
        }
        
        // Обновляем состояние кнопки сохранения
        updateSaveButtonState(video.id);

        // Обновляем состояние кнопки подписки
        updateSubscribeButtonState(video.author);
    }

    // Обновляем цвет текста в поисковой строке
    updateSearchInputColor();
    
    // Воспроизводим новое видео после небольшой задержки
    setTimeout(() => {
        const newVideoItem = document.querySelector('.video-item.active');
        const newVideoElement = newVideoItem.querySelector('video');
        const newLoaderElement = newVideoItem.querySelector('.video-loader');

        // Показываем лоадер перед попыткой воспроизведения
        if (newLoaderElement) newLoaderElement.style.display = 'block';

        newVideoElement.play().then(() => {
            // Скрываем лоадер, если воспроизведение началось
            if (newLoaderElement) newLoaderElement.style.display = 'none';
        }).catch(e => {
            console.log('Автовоспроизведение заблокировано или ошибка:', e);
            // Скрываем лоадер даже при ошибке, чтобы не висел бесконечно
            if (newLoaderElement) newLoaderElement.style.display = 'none';
        });
        isTransitioning = false;
    }, 300); // Задержка соответствует CSS transition duration
    
    currentVideoIndex = index;
}

// Обновление состояния кнопки сохранения
function updateSaveButtonState(videoId) {
    if (savedVideos.has(videoId)) {
        saveBtn.classList.add('active');
        saveBtn.innerHTML = '<i class="fas fa-bookmark"></i>';
    } else {
        saveBtn.classList.remove('active');
        saveBtn.innerHTML = '<i class="far fa-bookmark"></i>';
    }
}

// Обновление состояния кнопки подписки
function updateSubscribeButtonState(authorName) {
    if (subscriptions.has(authorName)) {
        subscribeBtn.classList.add('active');
        subscribeBtn.innerHTML = '<i class="fas fa-user-check"></i>';
        subscribeBtn.title = 'Вы подписаны';
    } else {
        subscribeBtn.classList.remove('active');
        subscribeBtn.innerHTML = '<i class="fas fa-user-plus"></i>';
        subscribeBtn.title = 'Подписаться';
    }
}

// Форматирование счетчиков
function formatCount(count) {
    if (count >= 1000000) {
        return (count / 1000000).toFixed(1) + 'M';
    } else if (count >= 1000) {
        return (count / 1000).toFixed(1) + 'K';
    }
    return count.toString();
}

// Настройка навигации по видео
function setupVideoNavigation() {
    let startY = 0;
    let isScrolling = false;
    
    // Обработка свайпов на мобильных устройствах
    document.addEventListener('touchstart', (e) => {
        startY = e.touches[0].clientY;
        isScrolling = false;
    }, { passive: false }); // passive: false для предотвращения прокрутки страницы

    document.addEventListener('touchmove', (e) => {
        // Если свайпы видео отключены, или открыто модальное окно, не обрабатываем свайпы для видео
        if (!videoSwipeEnabled || commentModal.classList.contains('active') || profileModal.classList.contains('active') || filterModal.classList.contains('active') || premiumModal.classList.contains('active')) {
            return;
        }

        const currentY = e.touches[0].clientY;
        const diffY = startY - currentY;
        
        // Предотвращаем прокрутку страницы, если это свайп для видео
        if (Math.abs(diffY) > 10) { // Небольшой порог для начала свайпа
            e.preventDefault(); 
            if (!isScrolling) {
                isScrolling = true;
                
                if (diffY > 0 && currentVideoIndex < filteredVideos.length - 1) {
                    // Свайп вверх - следующее видео
                    updateVideoDisplay(currentVideoIndex + 1);
                } else if (diffY < 0 && currentVideoIndex > 0) {
                    // Свайп вниз - предыдущее видео
                    updateVideoDisplay(currentVideoIndex - 1);
                }
            }
        }
    }, { passive: false }); // passive: false для предотвращения прокрутки страницы
    
    // Обработка колесика мыши на десктопе
    document.addEventListener('wheel', (e) => {
        if (isTransitioning) return;
        
        // Если открыто модальное окно, не обрабатываем прокрутку для видео
        if (commentModal.classList.contains('active') || profileModal.classList.contains('active') || filterModal.classList.contains('active') || premiumModal.classList.contains('active')) {
            return;
        }

        e.preventDefault(); // Предотвращаем прокрутку страницы
        
        if (e.deltaY > 50 && currentVideoIndex < filteredVideos.length - 1) { // Прокрутка вниз - следующее видео
            updateVideoDisplay(currentVideoIndex + 1);
        } else if (e.deltaY < -50 && currentVideoIndex > 0) { // Покрутка вверх - предыдущее видео
            updateVideoDisplay(currentVideoIndex - 1);
        }
    }, { passive: false }); // passive: false для предотвращения прокрутки страницы
    
    // Обработка клавиш стрелок на клавиатуре
    document.addEventListener('keydown', (e) => {
        if (isTransitioning) return;
        
        // Если открыто модальное окно, не обрабатываем клавиши для видео
        if (commentModal.classList.contains('active') || profileModal.classList.contains('active') || filterModal.classList.contains('active') || premiumModal.classList.contains('active')) {
            return;
        }

        if (e.key === 'ArrowDown' && currentVideoIndex < filteredVideos.length - 1) {
            e.preventDefault(); // Предотвращаем прокрутку страницы
            updateVideoDisplay(currentVideoIndex + 1);
        } else if (e.key === 'ArrowUp' && currentVideoIndex > 0) {
            e.preventDefault(); // Предотвращаем прокрутку страницы
            updateVideoDisplay(currentVideoIndex - 1);
        }
    });
}

// Настройка скрытия/показа меню по свайпу
function setupMenuToggleOnSwipe() {
    let startX = 0;
    let startY = 0;
    let isSwiping = false;

    document.addEventListener('touchstart', (e) => {
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
        isSwiping = false;
    }, { passive: false });

    document.addEventListener('touchmove', (e) => {
        // Если открыто модальное окно, не обрабатываем свайпы для меню
        if (commentModal.classList.contains('active') || profileModal.classList.contains('active') || filterModal.classList.contains('active') || premiumModal.classList.contains('active')) {
            return;
        }
        // Если поиск активен, не обрабатываем свайпы для меню
        if (header.classList.contains('search-active')) {
            return;
        }

        if (isSwiping) return; 
        
        const currentX = e.touches[0].clientX;
        const currentY = e.touches[0].clientY;
        const diffX = currentX - startX;
        const diffY = currentY - startY;

        // Определяем, является ли движение горизонтальным свайпом и достаточно ли оно значимо
        if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) { 
            e.preventDefault(); // Предотвращаем прокрутку страницы
            isSwiping = true;
            if (diffX > 0 && !menuVisible) { // Свайп вправо - показать меню
                toggleMenuVisibility(true);
            } else if (diffX < 0 && menuVisible) { // Свайп влево - скрыть меню
                toggleMenuVisibility(false);
            }
        }
    }, { passive: false });

    document.addEventListener('touchend', () => {
        isSwiping = false;
    });
}

// Переключение видимости меню
function toggleMenuVisibility(show) {
    menuVisible = show;
    if (menuVisible) {
        header.classList.remove('hidden');
        // videoControls.classList.remove('hidden'); // Элементы управления могут быть скрыты для рекламы
        enableVideoSwipes(); // Включаем свайпы видео, если меню видно
    } else {
        header.classList.add('hidden');
        // videoControls.classList.add('hidden'); // Элементы управления могут быть скрыты для рекламы
    }
    // Обновляем видимость videoControls в зависимости от текущего видео
    if (filteredVideos.length > 0 && filteredVideos[currentVideoIndex].isAd) {
        videoControls.classList.add('hidden');
    } else if (menuVisible) { // Только если меню видно, показываем controls
        videoControls.classList.remove('hidden');
    }
}

// Переключение лайка
function toggleLike() {
    const video = filteredVideos[currentVideoIndex];
    if (video.isAd) return; // Нельзя лайкать рекламу
    
    if (likedVideos.has(video.id)) {
        likedVideos.delete(video.id);
        likeBtn.classList.remove('active');
        likeBtn.innerHTML = '<i class="far fa-heart"></i><span class="control-count" id="likeCount">' + formatCount(video.likes) + '</span>';
    } else {
        likedVideos.add(video.id);
        likeBtn.classList.add('active');
        likeBtn.innerHTML = '<i class="fas fa-heart"></i><span class="control-count" id="likeCount">' + formatCount(video.likes + 1) + '</span>';
        addNotification(`Вам понравился ролик "${video.title.replace(/#(\w+)/g, '').trim()}"`);
    }
    
    // Сохраняем лайки в localStorage
    localStorage.setItem('likedVideos', JSON.stringify([...likedVideos]));
}

// Переключение сохранения видео
function toggleSaveVideo() {
    const video = filteredVideos[currentVideoIndex];
    if (video.isAd) return; // Нельзя сохранять рекламу

    if (savedVideos.has(video.id)) {
        savedVideos.delete(video.id);
        saveBtn.classList.remove('active');
        saveBtn.innerHTML = '<i class="far fa-bookmark"></i>';
        showNotification('Видео удалено из сохраненных', 'info');
    } else {
        savedVideos.add(video.id);
        saveBtn.classList.add('active');
        saveBtn.innerHTML = '<i class="fas fa-bookmark"></i>';
        showNotification('Видео добавлено в сохраненные', 'success');
    }
    
    // Сохраняем сохраненные видео для текущего пользователя
    localStorage.setItem(`savedVideos_${currentUser.username}`, JSON.stringify([...savedVideos]));
}

// Переключение подписки на автора
function toggleSubscribe() {
    const video = filteredVideos[currentVideoIndex];
    if (video.isAd) return; // Нельзя подписываться на рекламодателя через рекламный ролик

    const authorName = video.author;

    if (subscriptions.has(authorName)) {
        subscriptions.delete(authorName);
        showNotification(`Вы отписались от ${authorName}`, 'info');
    } else {
        subscriptions.add(authorName);
        showNotification(`Вы подписались на ${authorName}`, 'success');
        addNotification(`Вы подписались на автора "${authorName}"`);
    }
    localStorage.setItem(`subscriptions_${currentUser.username}`, JSON.stringify([...subscriptions]));
    updateSubscribeButtonState(authorName);
}

// Показать комментарии
function showComments() {
    const video = filteredVideos[currentVideoIndex];
    if (video.isAd) return; // Нельзя комментировать рекламу

    renderComments(video.id);
    commentModal.classList.add('active');
    // Не фокусируемся на поле ввода сразу, чтобы не открывать клавиатуру
    // commentText.focus(); 
    // Отключаем свайпы видео, пока модальное окно открыто
    disableVideoSwipes();
}

// Скрыть комментарии
function hideComments() {
    commentModal.classList.remove('active');
    commentText.value = '';
    // Включаем свайпы видео, когда модальное окно закрыто
    enableVideoSwipes();
}

// Рендеринг комментариев
function renderComments(videoId) {
    commentsList.innerHTML = '';
    
    if (!comments[videoId] || comments[videoId].length === 0) {
        commentsList.innerHTML = '<p class="empty-state">Пока нет комментариев. Будьте первым!</p>';
        return;
    }
    
    comments[videoId].forEach(comment => {
        const commentItem = document.createElement('div');
        commentItem.className = 'comment-item';
        
        commentItem.innerHTML = `
            <div class="comment-avatar">${comment.user.charAt(0)}</div>
            <div class="comment-content">
                <div class="comment-author">${comment.user}</div>
                <div class="comment-text">${comment.text}</div>
            </div>
        `;
        
        commentsList.appendChild(commentItem);
    });
}

// Добавление комментария
function addComment() {
    const text = commentText.value.trim();
    
    if (!text) {
        showNotification('Пожалуйста, введите текст комментария', 'error');
        return;
    }
    
    const video = filteredVideos[currentVideoIndex];
    if (video.isAd) return; // Нельзя комментировать рекламу

    if (!comments[video.id]) {
        comments[video.id] = [];
    }
    
    comments[video.id].push({
        user: currentUser.username,
        text: text
    });
    
    // Обновляем счетчик комментариев
    commentCount.textContent = formatCount(video.comments + comments[video.id].length);
    
    // Очищаем поле ввода
    commentText.value = '';
    
    // Перерисовываем комментарии
    renderComments(video.id);
    
    // Прокручиваем к новому комментарию
    commentsList.scrollTop = commentsList.scrollHeight;

    addNotification(`Вы оставили комментарий к ролику "${video.title.replace(/#(\w+)/g, '').trim()}"`);
}

// Поделиться видео
function shareVideo() {
    const video = filteredVideos[currentVideoIndex];
    if (video.isAd) return; // Нельзя делиться рекламой

    if (navigator.share) {
        navigator.share({
            title: video.title.replace(/#(\w+)/g, '').trim(),
            text: 'Посмотрите это видео: ' + window.location.href,
            url: window.location.href
        })
        .catch(err => console.log('Ошибка при попытке поделиться:', err));
    } else {
        // Fallback для браузеров, которые не поддерживают Web Share API
        navigator.clipboard.writeText(window.location.href)
            .then(() => {
                showNotification('Ссылка скопирована в буфер обмена!', 'success');
            })
            .catch(err => {
                console.log('Ошибка при копировании ссылки:', err);
                showNotification('Не удалось скопировать ссылку', 'error');
            });
    }
}

// Показать модальное окно профиля
function showProfileModal() {
    profileUsername.textContent = currentUser.username;
    profileEmail.textContent = currentUser.email;
    profileAvatarLetter.textContent = currentUser.username.charAt(0).toUpperCase(); // Обновляем букву аватара
    
    // Обновляем статус премиум
    premiumStatus.textContent = currentUser.isPremium ? 'Активна' : 'Неактивна';
    activatePremiumBtn.style.display = currentUser.isPremium ? 'none' : 'block';
    activatePremiumBtn.onclick = showPremiumModal; // Привязываем к показу модалки премиум

    // Обновляем статистику профиля
    updateProfileStats();

    renderSavedVideos();
    renderSubscriptions();
    renderNotifications();
    profileModal.classList.add('active');
    // Отключаем свайпы видео, пока модальное окно открыто
    disableVideoSwipes();
}

// Скрыть модальное окно профиля
function hideProfileModal() {
    profileModal.classList.remove('active');
    // Включаем свайпы видео, когда модальное окно закрыто
    enableVideoSwipes();
}

// Обновление статистики профиля
function updateProfileStats() {
    let totalLikes = 0;
    let totalComments = 0;
    let totalViews = 0; // Новая переменная для общего количества просмотров
    let audienceDemographics = { male: 0, female: 0, '13-17': 0, '18-24': 0, '25-34': 0, '35-44': 0, '45-54': 0, '55+': 0 };
    let videoCount = 0;

    // Суммируем лайки, комментарии, просмотры и демографию по всем видео
    videos.forEach(video => {
        if (!video.isAd) { // Исключаем рекламные видео из статистики пользователя
            totalLikes += video.likes + (likedVideos.has(video.id) ? 1 : 0);
            totalComments += video.comments + (comments[video.id] ? comments[video.id].length : 0);
            totalViews += video.views || 0; // Добавляем просмотры
            
            // Агрегируем демографию (для простоты, усредняем или берем первое попавшееся)
            if (video.audience) {
                // Для демонстрации, просто суммируем проценты и потом усредним
                audienceDemographics.male += parseFloat(video.audience.male);
                audienceDemographics.female += parseFloat(video.audience.female);
                // Для возраста можно было бы сделать более сложную логику, но для примера просто берем первый попавшийся
                // Или можно было бы сделать гистограмму
                videoCount++;
            }
        }
    });

    profileLikesCount.textContent = formatCount(totalLikes);
    profileCommentsCount.textContent = formatCount(totalComments);
    profileSubscriptionsCount.textContent = subscriptions.size.toString();
    profileViewsCount.textContent = formatCount(totalViews); // Обновляем счетчик просмотров

    // Обновляем демографию аудитории
    if (videoCount > 0) {
        const avgMale = (audienceDemographics.male / videoCount).toFixed(0);
        const avgFemale = (audienceDemographics.female / videoCount).toFixed(0);
        profileAudienceDemographics.innerHTML = `
            <p>Мужчины: ${avgMale}%</p>
            <p>Женщины: ${avgFemale}%</p>
            <p>Возраст: 18-34 (пример)</p>
        `;
    } else {
        profileAudienceDemographics.innerHTML = '<p>Данные по аудитории недоступны.</p>';
    }
}

// Рендеринг сохраненных видео
function renderSavedVideos() {
    savedVideosList.innerHTML = '';
    
    if (savedVideos.size === 0) {
        savedVideosList.innerHTML = '<p class="empty-state">У вас нет сохраненных видео</p>';
        return;
    }
    
    savedVideos.forEach(videoId => {
        const video = videos.find(v => v.id === videoId);
        if (video && !video.isAd) { // Не показываем рекламные видео в сохраненных
            const videoItem = document.createElement('div');
            videoItem.className = 'saved-video-item';
            videoItem.innerHTML = `
                <video muted>
                    <source src="${video.videoUrl}" type="video/mp4">
                </video>
                <div class="video-title-overlay">${video.title.replace(/#(\w+)/g, '').trim()}</div>
            `;
            
            videoItem.addEventListener('click', () => {
                // Находим индекс видео в отфильтрованном списке и переключаемся на него
                const index = filteredVideos.findIndex(v => v.id === videoId);
                if (index !== -1) {
                    updateVideoDisplay(index);
                    hideProfileModal();
                } else {
                    // Если видео не в текущем отфильтрованном списке, сбрасываем фильтры и показываем его
                    currentSearchQuery = '';
                    currentCategoryFilter = 'all';
                    currentSortOrder = 'default';
                    applyFiltersAndRenderVideos();
                    const newIndex = filteredVideos.findIndex(v => v.id === videoId);
                    if (newIndex !== -1) {
                        updateVideoDisplay(newIndex);
                        hideProfileModal();
                    }
                }
            });
            
            savedVideosList.appendChild(videoItem);
        }
    });
}

// Рендеринг подписок
function renderSubscriptions() {
    subscriptionsList.innerHTML = '';
    if (subscriptions.size === 0) {
        subscriptionsList.innerHTML = '<p class="empty-state">Вы ни на кого не подписаны</p>';
        return;
    }

    subscriptions.forEach(authorName => {
        const subscriptionItem = document.createElement('div');
        subscriptionItem.className = 'subscription-item';
        subscriptionItem.innerHTML = `
            <div class="author-avatar">${authorName.charAt(0)}</div>
            <span>${authorName}</span>
            <button class="unsubscribe-btn" data-author="${authorName}"><i class="fas fa-user-minus"></i></button>
        `;
        subscriptionsList.appendChild(subscriptionItem);
    });

    document.querySelectorAll('.unsubscribe-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const authorToUnsubscribe = e.currentTarget.dataset.author;
            subscriptions.delete(authorToUnsubscribe);
            localStorage.setItem(`subscriptions_${currentUser.username}`, JSON.stringify([...subscriptions]));
            renderSubscriptions();
            showNotification(`Вы отписались от ${authorToUnsubscribe}`, 'info');
            // Если текущее видео от этого автора, обновить кнопку подписки
            if (filteredVideos[currentVideoIndex] && filteredVideos[currentVideoIndex].author === authorToUnsubscribe) {
                updateSubscribeButtonState(authorToUnsubscribe);
            }
            updateProfileStats(); // Обновить статистику подписок
        });
    });
}

// Добавление уведомления
function addNotification(message) {
    const timestamp = new Date().toLocaleTimeString();
    notifications.unshift({ message, timestamp }); // Добавляем в начало
    if (notifications.length > 10) { // Ограничиваем количество уведомлений
        notifications.pop();
    }
    localStorage.setItem(`notifications_${currentUser.username}`, JSON.stringify(notifications));
}

// Рендеринг уведомлений
function renderNotifications() {
    notificationsList.innerHTML = '';
    if (notifications.length === 0) {
        notificationsList.innerHTML = '<p class="empty-state">У вас нет новых уведомлений</p>';
        return;
    }

    notifications.forEach(notification => {
        const notificationItem = document.createElement('div');
        notificationItem.className = 'notification-item';
        notificationItem.innerHTML = `
            <span class="notification-message">${notification.message}</span>
            <span class="notification-timestamp">${notification.timestamp}</span>
        `;
        notificationsList.appendChild(notificationItem);
    });
}

// Показать модальное окно фильтров
function showFilterModal() {
    filterModal.classList.add('active');
    // Отключаем свайпы видео, пока модальное окно открыто
    disableVideoSwipes();
}

// Скрыть модальное окно фильтров
function hideFilterModal() {
    filterModal.classList.remove('active');
    // Включаем свайпы видео, когда модальное окно закрыто
    enableVideoSwipes();
}

// Показать модальное окно премиум-подписки
function showPremiumModal() {
    premiumModal.classList.add('active');
    disableVideoSwipes();
}

// Скрыть модальное окно премиум-подписки
function hidePremiumModal() {
    premiumModal.classList.remove('active');
    enableVideoSwipes();
}

// Активация премиум-подписки (имитация)
function activatePremiumSubscription() {
    // Здесь могла бы быть логика оплаты
    showNotification('Имитация оплаты... Подписка активирована!', 'success');
    currentUser.isPremium = true;
    localStorage.setItem(`isPremium_${currentUser.username}`, JSON.stringify(true));
    
    // Обновляем UI профиля
    premiumStatus.textContent = 'Активна';
    activatePremiumBtn.style.display = 'none';
    
    hidePremiumModal();
    hideProfileModal(); // Закрываем профиль, чтобы пользователь увидел изменения
    
    // Перерендериваем видео, чтобы убрать рекламу
    applyFiltersAndRenderVideos();
}

// Применение фильтров и рендеринг видео
function applyFiltersAndRenderVideos() {
    let tempVideos = [...videos];

    // Если у пользователя есть премиум-подписка, удаляем рекламные видео
    if (currentUser.isPremium) {
        tempVideos = tempVideos.filter(video => !video.isAd);
    }

    // 1. Поиск по названию, автору, тегам и хештегам
    if (currentSearchQuery) {
        const searchQueryLower = currentSearchQuery.toLowerCase();
        tempVideos = tempVideos.filter(video => 
            video.title.toLowerCase().includes(searchQueryLower) ||
            video.author.toLowerCase().includes(searchQueryLower) ||
            (video.tags && video.tags.some(tag => tag.toLowerCase().includes(searchQueryLower))) ||
            // Поиск по хештегам в заголовке
            (video.title.match(/#(\w+)/g) || []).some(hashtag => hashtag.toLowerCase().includes(searchQueryLower))
        );
    }

    // 2. Фильтр по категории
    if (currentCategoryFilter !== 'all') {
        tempVideos = tempVideos.filter(video => video.category === currentCategoryFilter);
    }

    // 3. Сортировка
    if (currentSortOrder === 'likes') {
        tempVideos.sort((a, b) => (b.likes + (likedVideos.has(b.id) ? 1 : 0)) - (a.likes + (likedVideos.has(a.id) ? 1 : 0)));
    } else if (currentSortOrder === 'comments') {
        tempVideos.sort((a, b) => (b.comments + (comments[b.id] ? comments[b.id].length : 0)) - (a.comments + (comments[a.id] ? comments[a.id].length : 0)));
    }
    // 'default' не требует сортировки, так как массив уже в исходном порядке

    // Вставляем рекламные видео, если нет премиум-подписки
    if (!currentUser.isPremium && tempVideos.length > 0) {
        let videoCounter = 0;
        const videosWithAds = [];
        for (let i = 0; i < tempVideos.length; i++) {
            videosWithAds.push(tempVideos[i]);
            videoCounter++;
            if (videoCounter % 3 === 0 && adVideos.length > 0) { // Вставляем рекламу после каждых 3 видео
                const adIndex = Math.floor(Math.random() * adVideos.length);
                videosWithAds.push(adVideos[adIndex]);
            }
        }
        filteredVideos = videosWithAds;
    } else {
        filteredVideos = tempVideos;
    }

    currentVideoIndex = 0; // Сбрасываем индекс на первое видео в новом списке
    renderVideos();
    if (filteredVideos.length > 0) {
        updateVideoDisplay(currentVideoIndex);
    } else {
        // Если нет видео, очищаем счетчики и кнопки
        likeCount.textContent = '0';
        commentCount.textContent = '0';
        likeBtn.classList.remove('active');
        likeBtn.innerHTML = '<i class="far fa-heart"></i><span class="control-count" id="likeCount">0</span>';
        saveBtn.classList.remove('active');
        saveBtn.innerHTML = '<i class="far fa-bookmark"></i>';
        subscribeBtn.classList.remove('active');
        subscribeBtn.innerHTML = '<i class="fas fa-user-plus"></i>';
        videoControls.classList.add('hidden'); // Скрываем controls, если нет видео
    }
    updateSearchInputColor(); // Обновляем цвет текста в поисковой строке после применения фильтров
}

// Функция для обновления цвета текста в поисковой строке в зависимости от видео
function updateSearchInputColor() {
    // В реальном приложении здесь могла бы быть логика анализа текущего видео
    // Например, определение преобладающего цвета или яркости видео.
    // Для демонстрации, предположим, что все наши видео достаточно темные,
    // и белый текст будет хорошо виден.
    // Если бы были светлые видео, можно было бы менять на 'black' или 'var(--dark)'.

    // Пока просто устанавливаем светлый текст для всех видео
    document.documentElement.style.setProperty('--search-text-color', 'var(--light)');
    document.documentElement.style.setProperty('--search-placeholder-color', 'var(--gray)');
}
