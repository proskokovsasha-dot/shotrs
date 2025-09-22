// Данные приложения
let currentUser = { username: "Гость", email: "guest@example.com" }; // Пользователь по умолчанию
let currentVideoIndex = 0;
let videos = [];
let comments = {};
let likedVideos = new Set();
let savedVideos = new Set();
let subscriptions = new Set(); // Подписки пользователя
let notifications = []; // Уведомления пользователя
let isTransitioning = false;
let menuVisible = true; // Состояние видимости меню

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

// Модальные окна
const commentModal = document.getElementById('commentModal');
const profileModal = document.getElementById('profileModal');
const closeCommentModal = document.getElementById('closeCommentModal');
const closeProfileModal = document.getElementById('closeProfileModal');

// Комментарии
const commentsList = document.querySelector('.comments-list');
const commentText = document.getElementById('commentText');
const postComment = document.getElementById('postComment');

// Профиль
const profileUsername = document.getElementById('profileUsername');
const profileEmail = document.getElementById('profileEmail');
const savedVideosList = document.getElementById('savedVideosList');
const subscriptionsList = document.getElementById('subscriptionsList');
const notificationsList = document.getElementById('notificationsList');
const profileAvatarLetter = document.getElementById('profileAvatarLetter'); // Добавляем элемент для буквы аватара

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
    
    // Инициализируем видео
    initVideos();
    
    // Настройка обработчиков событий
    setupEventListeners();
    
    // Рендерим все видео и показываем первое
    renderVideos();
    updateVideoDisplay(currentVideoIndex);

    // Обновляем имя пользователя в шапке и букву аватара
    userName.textContent = currentUser.username;
    profileAvatarLetter.textContent = currentUser.username.charAt(0).toUpperCase();
});

// Инициализация видео (без изменений)
function initVideos() {
    videos = [
        {
            id: 1,
            title: "Удивительные места мира",
            author: "Путешественник",
            videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
            likes: 1245,
            comments: 89
        },
        {
            id: 2,
            title: "Смешные животные",
            author: "ЗооБлог",
            videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
            likes: 3567,
            comments: 243
        },
        {
            id: 3,
            title: "Кулинарный мастер-класс",
            author: "ШефПовар",
            videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
            likes: 892,
            comments: 56
        },
        {
            id: 4,
            title: "Экстремальный спорт",
            author: "Адреналин",
            videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
            likes: 2109,
            comments: 167
        },
        {
            id: 5,
            title: "Музыкальный клип",
            author: "Артист",
            videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4",
            likes: 3102,
            comments: 421
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
}

// Настройка обработчиков событий (без изменений)
function setupEventListeners() {
    // Профиль
    profileBtn.addEventListener('click', showProfileModal);
    
    // Модальные окна
    closeCommentModal.addEventListener('click', hideComments);
    closeProfileModal.addEventListener('click', hideProfileModal);
    
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
}

// Показать уведомление (без изменений)
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

// Рендеринг видео (без изменений)
function renderVideos() {
    videoCarousel.innerHTML = '';
    
    videos.forEach((video, index) => {
        const videoItem = document.createElement('div');
        videoItem.className = `video-item ${index === currentVideoIndex ? 'active' : ''}`;
        videoItem.dataset.index = index;
        
        videoItem.innerHTML = `
            <div class="video-loader"></div> <!-- Лоадер -->
            <video loop muted playsinline preload="auto">
                <source src="${video.videoUrl}" type="video/mp4">
                Ваш браузер не поддерживает видео.
            </video>
            <div class="video-info">
                <h3 class="video-title">${video.title}</h3>
                <div class="video-author">
                    <div class="author-avatar">${video.author.charAt(0)}</div>
                    <span>${video.author}</span>
                </div>
            </div>
        `;
        
        videoCarousel.appendChild(videoItem);

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
                if (index === currentVideoIndex) { // Лайкаем только активное видео
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
            if (index === currentVideoIndex) { // Лайкаем только активное видео
                toggleLike();
                showDoubleTapLikeAnimation(event.clientX, event.clientY);
            }
        });
    });
}

// Показать анимацию лайка при двойном тапе/клике (без изменений)
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

// Обновление отображения видео (без изменений)
function updateVideoDisplay(index) {
    if (isTransitioning || index < 0 || index >= videos.length) return;
    
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
    
    // Обновляем счетчики лайков и комментариев
    const video = videos[index];
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

// Обновление состояния кнопки сохранения (без изменений)
function updateSaveButtonState(videoId) {
    if (savedVideos.has(videoId)) {
        saveBtn.classList.add('active');
        saveBtn.innerHTML = '<i class="fas fa-bookmark"></i>';
    } else {
        saveBtn.classList.remove('active');
        saveBtn.innerHTML = '<i class="far fa-bookmark"></i>';
    }
}

// Обновление состояния кнопки подписки (без изменений)
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

// Форматирование счетчиков (без изменений)
function formatCount(count) {
    if (count >= 1000000) {
        return (count / 1000000).toFixed(1) + 'M';
    } else if (count >= 1000) {
        return (count / 1000).toFixed(1) + 'K';
    }
    return count.toString();
}

// Настройка навигации по видео (без изменений)
function setupVideoNavigation() {
    let startY = 0;
    let isScrolling = false;
    
    // Обработка свайпов на мобильных устройствах
    document.addEventListener('touchstart', (e) => {
        startY = e.touches[0].clientY;
        isScrolling = false;
    }, { passive: false }); // passive: false для предотвращения прокрутки страницы

    document.addEventListener('touchmove', (e) => {
        // Если открыто модальное окно, не обрабатываем свайпы для видео
        if (commentModal.classList.contains('active') || profileModal.classList.contains('active')) {
            return;
        }

        const currentY = e.touches[0].clientY;
        const diffY = startY - currentY;
        
        // Предотвращаем прокрутку страницы, если это свайп для видео
        if (Math.abs(diffY) > 10) { // Небольшой порог для начала свайпа
            e.preventDefault(); 
            if (!isScrolling) {
                isScrolling = true;
                
                if (diffY > 0 && currentVideoIndex < videos.length - 1) {
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
        if (commentModal.classList.contains('active') || profileModal.classList.contains('active')) {
            return;
        }

        e.preventDefault(); // Предотвращаем прокрутку страницы
        
        if (e.deltaY > 50 && currentVideoIndex < videos.length - 1) { // Прокрутка вниз - следующее видео
            updateVideoDisplay(currentVideoIndex + 1);
        } else if (e.deltaY < -50 && currentVideoIndex > 0) { // Покрутка вверх - предыдущее видео
            updateVideoDisplay(currentVideoIndex - 1);
        }
    }, { passive: false }); // passive: false для предотвращения прокрутки страницы
    
    // Обработка клавиш стрелок на клавиатуре
    document.addEventListener('keydown', (e) => {
        if (isTransitioning) return;
        
        // Если открыто модальное окно, не обрабатываем клавиши для видео
        if (commentModal.classList.contains('active') || profileModal.classList.contains('active')) {
            return;
        }

        if (e.key === 'ArrowDown' && currentVideoIndex < videos.length - 1) {
            e.preventDefault(); // Предотвращаем прокрутку страницы
            updateVideoDisplay(currentVideoIndex + 1);
        } else if (e.key === 'ArrowUp' && currentVideoIndex > 0) {
            e.preventDefault(); // Предотвращаем прокрутку страницы
            updateVideoDisplay(currentVideoIndex - 1);
        }
    });
}

// Настройка скрытия/показа меню по свайпу (без изменений)
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
        if (commentModal.classList.contains('active') || profileModal.classList.contains('active')) {
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

// Переключение видимости меню (без изменений)
function toggleMenuVisibility(show) {
    menuVisible = show;
    if (menuVisible) {
        header.classList.remove('hidden');
        videoControls.classList.remove('hidden');
    } else {
        header.classList.add('hidden');
        videoControls.classList.add('hidden');
    }
}

// Переключение лайка (без изменений)
function toggleLike() {
    const video = videos[currentVideoIndex];
    
    if (likedVideos.has(video.id)) {
        likedVideos.delete(video.id);
        likeBtn.classList.remove('active');
        likeBtn.innerHTML = '<i class="far fa-heart"></i><span class="control-count" id="likeCount">' + formatCount(video.likes) + '</span>';
    } else {
        likedVideos.add(video.id);
        likeBtn.classList.add('active');
        likeBtn.innerHTML = '<i class="fas fa-heart"></i><span class="control-count" id="likeCount">' + formatCount(video.likes + 1) + '</span>';
        addNotification(`Вам понравился ролик "${video.title}"`);
    }
    
    // Сохраняем лайки в localStorage
    localStorage.setItem('likedVideos', JSON.stringify([...likedVideos]));
}

// Переключение сохранения видео (без изменений)
function toggleSaveVideo() {
    const video = videos[currentVideoIndex];
    
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

// Переключение подписки на автора (без изменений)
function toggleSubscribe() {
    const video = videos[currentVideoIndex];
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
    const video = videos[currentVideoIndex];
    renderComments(video.id);
    commentModal.classList.add('active');
    commentText.focus();
    // Отключаем свайпы в Telegram Web App, пока модальное окно открыто
    if (window.Telegram && window.Telegram.WebApp) {
        Telegram.WebApp.disableVerticalSwipes(); // Отключаем свайпы
    }
}

// Скрыть комментарии
function hideComments() {
    commentModal.classList.remove('active');
    commentText.value = '';
    // Включаем свайпы в Telegram Web App, когда модальное окно закрыто
    if (window.Telegram && window.Telegram.WebApp) {
        Telegram.WebApp.enableVerticalSwipes(); // Включаем свайпы обратно
    }
}

// Рендеринг комментариев (без изменений)
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

// Добавление комментария (без изменений)
function addComment() {
    const text = commentText.value.trim();
    
    if (!text) {
        showNotification('Пожалуйста, введите текст комментария', 'error');
        return;
    }
    
    const video = videos[currentVideoIndex];
    
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

    addNotification(`Вы оставили комментарий к ролику "${video.title}"`);
}

// Поделиться видео (без изменений)
function shareVideo() {
    const video = videos[currentVideoIndex];
    
    if (navigator.share) {
        navigator.share({
            title: video.title,
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
    
    renderSavedVideos();
    renderSubscriptions();
    renderNotifications();
    profileModal.classList.add('active');
    // Отключаем свайпы в Telegram Web App, пока модальное окно открыто
    if (window.Telegram && window.Telegram.WebApp) {
        Telegram.WebApp.disableVerticalSwipes(); // Отключаем свайпы
    }
}

// Скрыть модальное окно профиля
function hideProfileModal() {
    profileModal.classList.remove('active');
    // Включаем свайпы в Telegram Web App, когда модальное окно закрыто
    if (window.Telegram && window.Telegram.WebApp) {
        Telegram.WebApp.enableVerticalSwipes(); // Включаем свайпы обратно
    }
}

// Рендеринг сохраненных видео (без изменений)
function renderSavedVideos() {
    savedVideosList.innerHTML = '';
    
    if (savedVideos.size === 0) {
        savedVideosList.innerHTML = '<p class="empty-state">У вас нет сохраненных видео</p>';
        return;
    }
    
    savedVideos.forEach(videoId => {
        const video = videos.find(v => v.id === videoId);
        if (video) {
            const videoItem = document.createElement('div');
            videoItem.className = 'saved-video-item';
            videoItem.innerHTML = `
                <video muted>
                    <source src="${video.videoUrl}" type="video/mp4">
                </video>
                <div class="video-title-overlay">${video.title}</div>
            `;
            
            videoItem.addEventListener('click', () => {
                // Находим индекс видео и переключаемся на него
                const index = videos.findIndex(v => v.id === videoId);
                if (index !== -1) {
                    updateVideoDisplay(index);
                    hideProfileModal();
                }
            });
            
            savedVideosList.appendChild(videoItem);
        }
    });
}

// Рендеринг подписок (без изменений)
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
            if (videos[currentVideoIndex].author === authorToUnsubscribe) {
                updateSubscribeButtonState(authorToUnsubscribe);
            }
        });
    });
}

// Добавление уведомления (без изменений)
function addNotification(message) {
    const timestamp = new Date().toLocaleTimeString();
    notifications.unshift({ message, timestamp }); // Добавляем в начало
    if (notifications.length > 10) { // Ограничиваем количество уведомлений
        notifications.pop();
    }
    localStorage.setItem(`notifications_${currentUser.username}`, JSON.stringify(notifications));
}

// Рендеринг уведомлений (без изменений)
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
