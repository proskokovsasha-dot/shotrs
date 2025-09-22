// Данные приложения
let currentUser = null;
let currentVideoIndex = 0;
let videos = [];
let comments = {};
let likedVideos = new Set();
let savedVideos = new Set(); // Для сохраненных видео текущего пользователя
let isTransitioning = false; // Флаг для предотвращения множественных свайпов во время анимации

// Элементы DOM
const mainPage = document.getElementById('mainPage');
const authButtons = document.getElementById('authButtons');
const userMenu = document.getElementById('userMenu');
const loginBtn = document.getElementById('loginBtn');
const registerBtn = document.getElementById('registerBtn');
const userName = document.getElementById('userName');
const profileBtn = document.getElementById('profileBtn');
const logoutBtn = document.getElementById('logoutBtn');
const videoCarousel = document.querySelector('.video-carousel');
const likeBtn = document.getElementById('likeBtn');
const commentBtn = document.getElementById('commentBtn');
const saveBtn = document.getElementById('saveBtn');
const shareBtn = document.getElementById('shareBtn');
const likeCount = document.getElementById('likeCount');
const commentCount = document.getElementById('commentCount');

// Модальные окна
const authModal = document.getElementById('authModal');
const authModalTitle = document.getElementById('authModalTitle');
const commentModal = document.getElementById('commentModal');
const profileModal = document.getElementById('profileModal');
const closeAuthModal = document.getElementById('closeAuthModal');
const closeCommentModal = document.getElementById('closeCommentModal');
const closeProfileModal = document.getElementById('closeProfileModal');

// Формы авторизации
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const showRegister = document.getElementById('showRegister');
const showLogin = document.getElementById('showLogin');
const submitLogin = document.getElementById('submitLogin');
const submitRegister = document.getElementById('submitRegister');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const regUsernameInput = document.getElementById('regUsername');
const regEmailInput = document.getElementById('regEmail');
const regPasswordInput = document.getElementById('regPassword');

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
    // Проверяем, есть ли сохраненный пользователь
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        updateUserInterface();
    }
    
    // Загружаем понравившиеся видео (глобально, или можно привязать к пользователю)
    const savedLikes = localStorage.getItem('likedVideos');
    if (savedLikes) {
        likedVideos = new Set(JSON.parse(savedLikes));
    }

    // Загружаем сохраненные видео для текущего пользователя (если он есть)
    if (currentUser) {
        const userSavedVideos = localStorage.getItem(`savedVideos_${currentUser.username}`);
        if (userSavedVideos) {
            savedVideos = new Set(JSON.parse(userSavedVideos));
        }
    }
    
    // Инициализируем видео
    initVideos();
    
    // Настройка обработчиков событий
    setupEventListeners();
    
    // Рендерим все видео и показываем первое
    renderVideos();
    updateVideoDisplay(currentVideoIndex);
});

// Инициализация видео (имитация данных с сервера)
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
    // Авторизация
    loginBtn.addEventListener('click', () => showAuthModal('login'));
    registerBtn.addEventListener('click', () => showAuthModal('register'));
    logoutBtn.addEventListener('click', handleLogout);
    profileBtn.addEventListener('click', showProfileModal);
    
    // Модальные окна
    closeAuthModal.addEventListener('click', hideAuthModal);
    closeCommentModal.addEventListener('click', hideComments);
    closeProfileModal.addEventListener('click', hideProfileModal);
    
    // Формы авторизации
    showRegister.addEventListener('click', () => switchAuthForm('register'));
    showLogin.addEventListener('click', () => switchAuthForm('login'));
    submitLogin.addEventListener('click', handleLogin);
    submitRegister.addEventListener('click', handleRegister);
    
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

// Обновление интерфейса пользователя (кнопки авторизации/меню пользователя)
function updateUserInterface() {
    if (currentUser) {
        authButtons.classList.add('hidden');
        userMenu.classList.remove('hidden');
        userName.textContent = currentUser.username;
        // Загружаем сохраненные видео для текущего пользователя
        const userSavedVideos = localStorage.getItem(`savedVideos_${currentUser.username}`);
        if (userSavedVideos) {
            savedVideos = new Set(JSON.parse(userSavedVideos));
        } else {
            savedVideos = new Set(); // Если нет сохраненных, инициализируем пустой Set
        }
    } else {
        authButtons.classList.remove('hidden');
        userMenu.classList.add('hidden');
        savedVideos = new Set(); // Очищаем сохраненные видео при выходе
    }
    // Обновляем состояние кнопки сохранения для текущего видео
    if (videos.length > 0) { // Проверяем, что видео загружены
        updateSaveButtonState(videos[currentVideoIndex].id);
    }
}

// Показать модальное окно авторизации
function showAuthModal(formType) {
    authModal.classList.add('active');
    switchAuthForm(formType);
    authModalTitle.textContent = formType === 'login' ? 'Войдите в аккаунт' : 'Создайте аккаунт';
}

// Скрыть модальное окно авторизации
function hideAuthModal() {
    authModal.classList.remove('active');
    // Очищаем поля форм
    usernameInput.value = '';
    passwordInput.value = '';
    regUsernameInput.value = '';
    regEmailInput.value = '';
    regPasswordInput.value = '';
}

// Переключение между формами входа и регистрации
function switchAuthForm(formType) {
    if (formType === 'login') {
        loginForm.classList.add('active');
        loginForm.classList.remove('hidden');
        registerForm.classList.add('hidden');
        registerForm.classList.remove('active');
        authModalTitle.textContent = 'Войдите в аккаунт';
    } else {
        registerForm.classList.add('active');
        registerForm.classList.remove('hidden');
        loginForm.classList.add('hidden');
        loginForm.classList.remove('active');
        authModalTitle.textContent = 'Создайте аккаунт';
    }
}

// Обработка входа
function handleLogin() {
    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();
    
    if (!username || !password) {
        alert('Пожалуйста, заполните все поля');
        return;
    }
    
    // Имитация проверки на сервере (используем localStorage)
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find(u => u.username === username && u.password === password);
    
    if (user) {
        currentUser = user;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        updateUserInterface();
        hideAuthModal();
        alert(`Добро пожаловать, ${username}!`);
    } else {
        alert('Неверное имя пользователя или пароль');
    }
}

// Обработка регистрации
function handleRegister() {
    const username = regUsernameInput.value.trim();
    const email = regEmailInput.value.trim();
    const password = regPasswordInput.value.trim();
    
    if (!username || !email || !password) {
        alert('Пожалуйста, заполните все поля');
        return;
    }
    
    if (password.length < 6) {
        alert('Пароль должен содержать не менее 6 символов');
        return;
    }
    
    // Имитация регистрации на сервере (используем localStorage)
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    if (users.find(u => u.username === username)) {
        alert('Пользователь с таким именем уже существует');
        return;
    }
    
    if (users.find(u => u.email === email)) {
        alert('Пользователь с таким email уже существует');
        return;
    }
    
    const newUser = { username, email, password }; // savedVideos будут загружены при логине
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    
    currentUser = newUser;
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    
    updateUserInterface();
    hideAuthModal();
    alert('Регистрация прошла успешно!');
}

// Выход из аккаунта
function handleLogout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    updateUserInterface();
    alert('Вы вышли из аккаунта');
}

// Рендеринг всех видео в карусель
function renderVideos() {
    videoCarousel.innerHTML = ''; // Очищаем контейнер
    videos.forEach((video, index) => {
        const videoElement = document.createElement('div');
        videoElement.className = 'video-item';
        videoElement.dataset.index = index; // Добавляем data-атрибут для индекса
        videoElement.innerHTML = `
            <video src="${video.videoUrl}" autoplay muted loop playsinline></video>
            <div class="video-info">
                <div class="video-title">${video.title}</div>
                <div class="video-author">
                    <div class="author-avatar">${video.author.charAt(0)}</div>
                    <span>${video.author}</span>
                </div>
            </div>
        `;
        videoCarousel.appendChild(videoElement);
    });
}

// Обновление отображения видео (активное, предыдущее, следующее)
function updateVideoDisplay(newIndex) {
    // Проверяем границы индекса
    if (newIndex < 0) {
        newIndex = videos.length - 1; // Переход с первого на последнее
    } else if (newIndex >= videos.length) {
        newIndex = 0; // Переход с последнего на первое
    }

    if (isTransitioning || newIndex === currentVideoIndex) return;

    isTransitioning = true;

    const currentVideoElement = videoCarousel.querySelector(`.video-item.active`);
    const newVideoElement = videoCarousel.querySelector(`.video-item[data-index="${newIndex}"]`);

    if (!newVideoElement) {
        isTransitioning = false;
        return;
    }

    // Определяем направление свайпа для классов анимации
    const direction = (newIndex > currentVideoIndex || (currentVideoIndex === videos.length - 1 && newIndex === 0)) && !(currentVideoIndex === 0 && newIndex === videos.length - 1) ? 'next' : 'prev';

    if (currentVideoElement) {
        currentVideoElement.classList.remove('active');
        currentVideoElement.classList.add(direction === 'next' ? 'prev' : 'next'); // Старое видео уходит в противоположную сторону
        
        // Останавливаем старое видео
        const oldVideoPlayer = currentVideoElement.querySelector('video');
        if (oldVideoPlayer) {
            oldVideoPlayer.pause();
            oldVideoPlayer.currentTime = 0;
        }
    }

    newVideoElement.classList.remove('prev', 'next'); // Убираем классы, если они были
    newVideoElement.classList.add('active');

    // Запускаем новое видео
    const newVideoPlayer = newVideoElement.querySelector('video');
    if (newVideoPlayer) {
        newVideoPlayer.play().catch(error => console.log("Autoplay prevented:", error));
    }

    currentVideoIndex = newIndex;

    // Обновляем счетчики и состояние кнопок для нового видео
    const video = videos[currentVideoIndex];
    likeCount.textContent = formatCount(video.likes);
    commentCount.textContent = formatCount(video.comments);
    updateLikeButtonState(video.id);
    updateSaveButtonState(video.id);

    // После завершения анимации сбрасываем флаг
    newVideoElement.addEventListener('transitionend', () => {
        isTransitioning = false;
        // Удаляем классы prev/next со всех неактивных видео, чтобы они были готовы к следующей анимации
        videoCarousel.querySelectorAll('.video-item:not(.active)').forEach(item => {
            item.classList.remove('prev', 'next');
        });
    }, { once: true });
}

// Переключение лайка
function toggleLike() {
    const video = videos[currentVideoIndex];
    
    if (likedVideos.has(video.id)) {
        // Убираем лайк
        video.likes--;
        likedVideos.delete(video.id);
    } else {
        // Ставим лайк
        video.likes++;
        likedVideos.add(video.id);
    }
    
    likeCount.textContent = formatCount(video.likes);
    updateLikeButtonState(video.id);
    
    // Сохраняем лайки в localStorage
    localStorage.setItem('likedVideos', JSON.stringify([...likedVideos]));
}

// Обновление состояния кнопки лайка
function updateLikeButtonState(videoId) {
    if (likedVideos.has(videoId)) {
        likeBtn.classList.add('active');
        likeBtn.querySelector('i').className = 'fas fa-heart'; // Заполненное сердце
    } else {
        likeBtn.classList.remove('active');
        likeBtn.querySelector('i').className = 'far fa-heart'; // Пустое сердце
    }
}

// Переключение сохранения видео
function toggleSaveVideo() {
    if (!currentUser) {
        alert('Чтобы сохранить видео, войдите в аккаунт');
        showAuthModal('login');
        return;
    }

    const video = videos[currentVideoIndex];
    if (savedVideos.has(video.id)) {
        // Удаляем из сохраненных
        savedVideos.delete(video.id);
    } else {
        // Добавляем в сохраненные
        savedVideos.add(video.id);
    }
    
    updateSaveButtonState(video.id);
    // Сохраняем список сохраненных видео для текущего пользователя
    localStorage.setItem(`savedVideos_${currentUser.username}`, JSON.stringify([...savedVideos]));
}

// Обновление состояния кнопки сохранения
function updateSaveButtonState(videoId) {
    if (currentUser && savedVideos.has(videoId)) {
        saveBtn.classList.add('active');
        saveBtn.querySelector('i').className = 'fas fa-bookmark'; // Заполненная закладка
    } else {
        saveBtn.classList.remove('active');
        saveBtn.querySelector('i').className = 'far fa-bookmark'; // Пустая закладка
    }
}

// Показать комментарии
function showComments() {
    const video = videos[currentVideoIndex];
    commentsList.innerHTML = '';
    
    // Добавляем комментарии
    comments[video.id].forEach(comment => {
        const commentElement = document.createElement('div');
        commentElement.className = 'comment-item';
        commentElement.innerHTML = `
            <div class="comment-avatar">${comment.user.charAt(0).toUpperCase()}</div>
            <div class="comment-content">
                <div class="comment-author">${comment.user}</div>
                <div class="comment-text">${comment.text}</div>
            </div>
        `;
        commentsList.appendChild(commentElement);
    });
    
    commentModal.classList.add('active');
}

// Скрыть комментарии
function hideComments() {
    commentModal.classList.remove('active');
    commentText.value = '';
}

// Добавить комментарий
function addComment() {
    if (!currentUser) {
        alert('Чтобы оставить комментарий, войдите в аккаунт');
        hideComments();
        showAuthModal('login');
        return;
    }
    
    const text = commentText.value.trim();
    if (!text) return;
    
    const video = videos[currentVideoIndex];
    comments[video.id].push({
        user: currentUser.username,
        text: text
    });
    
    video.comments++;
    commentCount.textContent = formatCount(video.comments);
    
    // Добавляем новый комментарий в список
    const commentElement = document.createElement('div');
    commentElement.className = 'comment-item';
    commentElement.innerHTML = `
        <div class="comment-avatar">${currentUser.username.charAt(0).toUpperCase()}</div>
        <div class="comment-content">
            <div class="comment-author">${currentUser.username}</div>
            <div class="comment-text">${text}</div>
        </div>
    `;
    commentsList.appendChild(commentElement);
    
    commentText.value = '';
    
    // Прокручиваем к новому комментарию
    commentsList.scrollTop = commentsList.scrollHeight;
}

// Поделиться видео
function shareVideo() {
    if (navigator.share) {
        navigator.share({
            title: videos[currentVideoIndex].title,
            text: 'Посмотри это видео в ТочкаСхода!',
            url: window.location.href // Можно заменить на конкретную ссылку на видео
        })
        .catch(error => console.log('Ошибка при попытке поделиться:', error));
    } else {
        // Fallback для браузеров, которые не поддерживают Web Share API
        alert('Функция "Поделиться" доступна в современных браузерах и мобильных приложениях');
        // Можно предложить скопировать ссылку вручную
        const videoLink = window.location.href; // Или сгенерировать ссылку на текущее видео
        navigator.clipboard.writeText(videoLink)
            .then(() => alert('Ссылка на видео скопирована в буфер обмена!'))
            .catch(err => console.error('Не удалось скопировать ссылку:', err));
    }
}

// Показать модальное окно профиля
function showProfileModal() {
    if (!currentUser) {
        alert('Войдите в аккаунт, чтобы просмотреть профиль');
        showAuthModal('login');
        return;
    }

    profileUsername.textContent = currentUser.username;
    profileEmail.textContent = currentUser.email;
    renderSavedVideos();
    profileModal.classList.add('active');
}

// Скрыть модальное окно профиля
function hideProfileModal() {
    profileModal.classList.remove('active');
}

// Рендеринг сохраненных видео в профиле
function renderSavedVideos() {
    savedVideosList.innerHTML = '';
    if (savedVideos.size === 0) {
        savedVideosList.innerHTML = '<p style="color: var(--gray); text-align: center;">У вас пока нет сохраненных видео.</p>';
        return;
    }

    savedVideos.forEach(videoId => {
        const video = videos.find(v => v.id === videoId);
        if (video) {
            const savedVideoElement = document.createElement('div');
            savedVideoElement.className = 'saved-video-item';
            savedVideoElement.dataset.videoId = video.id;
            savedVideoElement.innerHTML = `
                <video src="${video.videoUrl}" muted></video>
                <div class="video-title-overlay">${video.title}</div>
            `;
            savedVideoElement.addEventListener('click', () => {
                // При клике на сохраненное видео, переключаемся на него в карусели
                const index = videos.findIndex(v => v.id === video.id);
                if (index !== -1) {
                    hideProfileModal();
                    updateVideoDisplay(index);
                }
            });
            savedVideosList.appendChild(savedVideoElement);
        }
    });
}


// Настройка жестов свайпа и прокрутки колесиком мыши
function setupVideoNavigation() {
    let startY = 0;
    let isSwiping = false;
    let swipeThreshold = 50; // Минимальное расстояние свайпа для переключения

    videoCarousel.addEventListener('touchstart', e => {
        if (isTransitioning) return;
        startY = e.touches[0].clientY;
        isSwiping = true;
    });
    
    videoCarousel.addEventListener('touchmove', e => {
        if (!isSwiping || isTransitioning) return;
        
        const currentY = e.touches[0].clientY;
        const diffY = startY - currentY;
        
        // Предотвращаем стандартную прокрутку, если свайп достаточно большой
        if (Math.abs(diffY) > 10) { // Небольшой порог для начала предотвращения прокрутки
            e.preventDefault(); 
        }

        // Если свайп достаточно большой по вертикали
        if (Math.abs(diffY) > swipeThreshold) {
            if (diffY > 0) {
                // Свайп вверх - следующее видео
                updateVideoDisplay(currentVideoIndex + 1);
            } else {
                // Свайп вниз - предыдущее видео
                updateVideoDisplay(currentVideoIndex - 1);
            }
            
            isSwiping = false; // Сбросить флаг после обработки свайпа
        }
    }, { passive: false }); // passive: false для предотвращения стандартной прокрутки
    
    videoCarousel.addEventListener('touchend', () => {
        isSwiping = false;
    });
    
    // Обработка колесика мыши для десктопных устройств
    videoCarousel.addEventListener('wheel', e => {
        if (isTransitioning) {
            e.preventDefault(); // Предотвращаем прокрутку, если идет анимация
            return;
        }

        e.preventDefault(); // Предотвращаем стандартную прокрутку страницы

        if (e.deltaY > 0) {
            // Прокрутка вниз - следующее видео
            updateVideoDisplay(currentVideoIndex + 1);
        } else {
            // Прокрутка вверх - предыдущее видео
            updateVideoDisplay(currentVideoIndex - 1);
        }
    }, { passive: false }); // passive: false для предотвращения стандартной прокрутки
    
    // Обработка клавиш для десктопных устройств
    document.addEventListener('keydown', e => {
        if (isTransitioning) return;

        if (e.key === 'ArrowUp') {
            updateVideoDisplay(currentVideoIndex - 1);
        } else if (e.key === 'ArrowDown') {
            updateVideoDisplay(currentVideoIndex + 1);
        }
    });
}

// Форматирование чисел (1K, 1M и т.д.)
function formatCount(count) {
    if (count >= 1000000) {
        return (count / 1000000).toFixed(1) + 'M';
    } else if (count >= 1000) {
        return (count / 1000).toFixed(1) + 'K';
    }
    return count.toString();
}
