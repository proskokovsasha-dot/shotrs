// Данные приложения
let currentUser = { username: "Гость", email: "guest@example.com" }; // Пользователь по умолчанию
let currentVideoIndex = 0;
let videos = [];
let comments = {};
let likedVideos = new Set();
let savedVideos = new Set();
let isTransitioning = false;

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

// Инициализация приложения
document.addEventListener('DOMContentLoaded', function() {
    // Загружаем понравившиеся видео
    const savedLikes = localStorage.getItem('likedVideos');
    if (savedLikes) {
        likedVideos = new Set(JSON.parse(savedLikes));
    }

    // Загружаем сохраненные видео для текущего пользователя (Гостя)
    const userSavedVideos = localStorage.getItem(`savedVideos_${currentUser.username}`);
    if (userSavedVideos) {
        savedVideos = new Set(JSON.parse(userSavedVideos));
    }
    
    // Инициализируем видео
    initVideos();
    
    // Настройка обработчиков событий
    setupEventListeners();
    
    // Рендерим все видео и показываем первое
    renderVideos();
    updateVideoDisplay(currentVideoIndex);

    // Обновляем имя пользователя в шапке
    userName.textContent = currentUser.username;
});

// Инициализация видео
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

// Настройка обработчиков событий
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
    
    // Комментарии
    postComment.addEventListener('click', addComment);
    commentText.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            addComment();
        }
    });
    
    // Свайпы для мобильных устройств и прокрутка для десктопа
    setupVideoNavigation();
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
    
    videos.forEach((video, index) => {
        const videoItem = document.createElement('div');
        videoItem.className = `video-item ${index === currentVideoIndex ? 'active' : ''}`;
        videoItem.dataset.index = index;
        
        videoItem.innerHTML = `
            <video loop muted>
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
    });
}

// Обновление отображения видео
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
    
    // Воспроизводим новое видео после небольшой задержки
    setTimeout(() => {
        const newVideoElement = document.querySelector('.video-item.active video');
        if (newVideoElement) {
            newVideoElement.play().catch(e => console.log('Автовоспроизведение заблокировано:', e));
        }
        isTransitioning = false;
    }, 300);
    
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
    });
    
    document.addEventListener('touchmove', (e) => {
        if (!isScrolling) {
            const currentY = e.touches[0].clientY;
            const diffY = startY - currentY;
            
            if (Math.abs(diffY) > 50) {
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
    });
    
    // Обработка колесика мыши на десктопе
    document.addEventListener('wheel', (e) => {
        if (isTransitioning) return;
        
        if (e.deltaY > 50 && currentVideoIndex < videos.length - 1) {
            // Прокрутка вниз - следующее видео
            updateVideoDisplay(currentVideoIndex + 1);
        } else if (e.deltaY < -50 && currentVideoIndex > 0) {
            // Прокрутка вверх - предыдущее видео
            updateVideoDisplay(currentVideoIndex - 1);
        }
    });
    
    // Обработка клавиш стрелок на клавиатуре
    document.addEventListener('keydown', (e) => {
        if (isTransitioning) return;
        
        if (e.key === 'ArrowDown' && currentVideoIndex < videos.length - 1) {
            updateVideoDisplay(currentVideoIndex + 1);
        } else if (e.key === 'ArrowUp' && currentVideoIndex > 0) {
            updateVideoDisplay(currentVideoIndex - 1);
        }
    });
}

// Переключение лайка
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
    }
    
    // Сохраняем лайки в localStorage
    localStorage.setItem('likedVideos', JSON.stringify([...likedVideos]));
}

// Переключение сохранения видео
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

// Показать комментарии
function showComments() {
    const video = videos[currentVideoIndex];
    renderComments(video.id);
    commentModal.classList.add('active');
    commentText.focus();
}

// Скрыть комментарии
function hideComments() {
    commentModal.classList.remove('active');
    commentText.value = '';
}

// Рендеринг комментариев
function renderComments(videoId) {
    commentsList.innerHTML = '';
    
    if (!comments[videoId] || comments[videoId].length === 0) {
        commentsList.innerHTML = '<p style="text-align: center; color: var(--gray);">Пока нет комментариев. Будьте первым!</p>';
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
        alert('Пожалуйста, введите текст комментария');
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
}

// Поделиться видео
function shareVideo() {
    const video = videos[currentVideoIndex];
    
    if (navigator.share) {
        navigator.share({
            title: video.title,
            text: 'Посмотрите это видео: ' + video.title,
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
    
    renderSavedVideos();
    profileModal.classList.add('active');
}

// Скрыть модальное окно профиля
function hideProfileModal() {
    profileModal.classList.remove('active');
}

// Рендеринг сохраненных видео
function renderSavedVideos() {
    savedVideosList.innerHTML = '';
    
    if (savedVideos.size === 0) {
        savedVideosList.innerHTML = '<p style="text-align: center; color: var(--gray);">У вас нет сохраненных видео</p>';
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
