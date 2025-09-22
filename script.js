// Данные приложения
let currentUser = null;
let currentVideoIndex = 0;
let videos = [];
let comments = {};
let likedVideos = new Set();

// Элементы DOM
const mainPage = document.getElementById('mainPage');
const authButtons = document.getElementById('authButtons');
const userMenu = document.getElementById('userMenu');
const loginBtn = document.getElementById('loginBtn');
const registerBtn = document.getElementById('registerBtn');
const userName = document.getElementById('userName');
const logoutBtn = document.getElementById('logoutBtn');
const videoContainer = document.querySelector('.video-container');
const likeBtn = document.getElementById('likeBtn');
const commentBtn = document.getElementById('commentBtn');
const shareBtn = document.getElementById('shareBtn');
const likeCount = document.getElementById('likeCount');
const commentCount = document.getElementById('commentCount');

// Модальные окна
const authModal = document.getElementById('authModal');
const commentModal = document.getElementById('commentModal');
const closeAuthModal = document.getElementById('closeAuthModal');
const closeCommentModal = document.getElementById('closeCommentModal');

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

// Инициализация приложения
document.addEventListener('DOMContentLoaded', function() {
    // Проверяем, есть ли сохраненный пользователь
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        updateUserInterface();
    }
    
    // Загружаем понравившиеся видео
    const savedLikes = localStorage.getItem('likedVideos');
    if (savedLikes) {
        likedVideos = new Set(JSON.parse(savedLikes));
    }
    
    // Инициализируем видео
    initVideos();
    
    // Настройка обработчиков событий
    setupEventListeners();
    
    // Загружаем первое видео
    loadVideo(currentVideoIndex);
});

// Инициализация видео
function initVideos() {
    // В реальном приложении здесь был бы запрос к API
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
    
    // Инициализируем комментарии
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
    
    // Модальные окна
    closeAuthModal.addEventListener('click', hideAuthModal);
    closeCommentModal.addEventListener('click', hideComments);
    
    // Формы авторизации
    showRegister.addEventListener('click', () => switchAuthForm('register'));
    showLogin.addEventListener('click', () => switchAuthForm('login'));
    submitLogin.addEventListener('click', handleLogin);
    submitRegister.addEventListener('click', handleRegister);
    
    // Управление видео
    likeBtn.addEventListener('click', toggleLike);
    commentBtn.addEventListener('click', showComments);
    shareBtn.addEventListener('click', shareVideo);
    
    // Комментарии
    postComment.addEventListener('click', addComment);
    commentText.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            addComment();
        }
    });
    
    // Свайпы для мобильных устройств
    setupSwipeGestures();
}

// Обновление интерфейса пользователя
function updateUserInterface() {
    if (currentUser) {
        authButtons.classList.add('hidden');
        userMenu.classList.remove('hidden');
        userName.textContent = currentUser.username;
    } else {
        authButtons.classList.remove('hidden');
        userMenu.classList.add('hidden');
    }
}

// Показать модальное окно авторизации
function showAuthModal(formType) {
    authModal.classList.add('active');
    switchAuthForm(formType);
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
    } else {
        registerForm.classList.add('active');
        registerForm.classList.remove('hidden');
        loginForm.classList.add('hidden');
        loginForm.classList.remove('active');
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
    
    // В реальном приложении здесь была бы проверка на сервере
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
    
    // В реальном приложении здесь была бы регистрация на сервере
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    if (users.find(u => u.username === username)) {
        alert('Пользователь с таким именем уже существует');
        return;
    }
    
    if (users.find(u => u.email === email)) {
        alert('Пользователь с таким email уже существует');
        return;
    }
    
    const newUser = { username, email, password };
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

// Загрузка видео
function loadVideo(index) {
    if (index < 0 || index >= videos.length) return;
    
    currentVideoIndex = index;
    const video = videos[index];
    
    // Очищаем контейнер
    videoContainer.innerHTML = '';
    
    // Создаем элемент видео
    const videoElement = document.createElement('div');
    videoElement.className = 'video-item';
    videoElement.innerHTML = `
        <video src="${video.videoUrl}" autoplay muted loop></video>
        <div class="video-info">
            <div class="video-title">${video.title}</div>
            <div class="video-author">
                <div class="author-avatar">${video.author.charAt(0)}</div>
                <span>${video.author}</span>
            </div>
        </div>
    `;
    
    videoContainer.appendChild(videoElement);
    
    // Обновляем счетчики
    likeCount.textContent = formatCount(video.likes);
    commentCount.textContent = formatCount(video.comments);
    
    // Обновляем состояние кнопки лайка
    if (likedVideos.has(video.id)) {
        likeBtn.classList.add('active');
        likeBtn.innerHTML = '<i class="fas fa-heart"></i><span>' + formatCount(video.likes) + '</span>';
    } else {
        likeBtn.classList.remove('active');
        likeBtn.innerHTML = '<i class="far fa-heart"></i><span>' + formatCount(video.likes) + '</span>';
    }
}

// Переключение лайка
function toggleLike() {
    const video = videos[currentVideoIndex];
    
    if (likedVideos.has(video.id)) {
        // Убираем лайк
        video.likes--;
        likedVideos.delete(video.id);
        likeBtn.classList.remove('active');
        likeBtn.innerHTML = '<i class="far fa-heart"></i><span>' + formatCount(video.likes) + '</span>';
    } else {
        // Ставим лайк
        video.likes++;
        likedVideos.add(video.id);
        likeBtn.classList.add('active');
        likeBtn.innerHTML = '<i class="fas fa-heart"></i><span>' + formatCount(video.likes) + '</span>';
    }
    
    likeCount.textContent = formatCount(video.likes);
    
    // Сохраняем лайки в localStorage
    localStorage.setItem('likedVideos', JSON.stringify([...likedVideos]));
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
            <div class="comment-avatar">${comment.user.charAt(0)}</div>
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
        <div class="comment-avatar">${currentUser.username.charAt(0)}</div>
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
            url: window.location.href
        })
        .catch(error => console.log('Ошибка при попытке поделиться:', error));
    } else {
        // Fallback для браузеров, которые не поддерживают Web Share API
        alert('Функция "Поделиться" доступна в современных браузерах и мобильных приложениях');
    }
}

// Настройка жестов свайпа
function setupSwipeGestures() {
    let startY = 0;
    let isSwiping = false;
    
    videoContainer.addEventListener('touchstart', e => {
        startY = e.touches[0].clientY;
        isSwiping = true;
    });
    
    videoContainer.addEventListener('touchmove', e => {
        if (!isSwiping) return;
        
        const currentY = e.touches[0].clientY;
        const diffY = startY - currentY;
        
        // Если свайп достаточно большой по вертикали
        if (Math.abs(diffY) > 50) {
            if (diffY > 0) {
                // Свайп вверх - следующее видео
                loadVideo((currentVideoIndex + 1) % videos.length);
            } else {
                // Свайп вниз - предыдущее видео
                loadVideo((currentVideoIndex - 1 + videos.length) % videos.length);
            }
            
            isSwiping = false;
        }
    });
    
    videoContainer.addEventListener('touchend', () => {
        isSwiping = false;
    });
    
    // Обработка клавиш для десктопных устройств
    document.addEventListener('keydown', e => {
        if (e.key === 'ArrowUp') {
            loadVideo((currentVideoIndex - 1 + videos.length) % videos.length);
        } else if (e.key === 'ArrowDown') {
            loadVideo((currentVideoIndex + 1) % videos.length);
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