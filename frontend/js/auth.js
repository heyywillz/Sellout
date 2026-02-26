// Authentication Module

const auth = {
    /**
     * Check if user is logged in
     */
    isLoggedIn() {
        return !!localStorage.getItem('token');
    },

    /**
     * Get current user data
     */
    getUser() {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    },

    /**
     * Get token
     */
    getToken() {
        return localStorage.getItem('token');
    },

    /**
     * Set auth data after login/register
     */
    setAuthData(token, user) {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
    },

    /**
     * Clear auth data (logout)
     */
    clearAuthData() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    },

    /**
     * Logout user
     */
    logout() {
        this.clearAuthData();
        showToast('Logged out successfully', 'success');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);
    },

    /**
     * Update UI based on auth state
     */
    updateUI() {
        const isLoggedIn = this.isLoggedIn();
        const user = this.getUser();

        // Desktop elements
        const authButtons = document.getElementById('authButtons');
        const userMenu = document.getElementById('userMenu');
        const userName = document.getElementById('userName');
        const userAvatar = document.getElementById('userAvatar');

        // Mobile elements
        const mobileAuthButtons = document.getElementById('mobileAuthButtons');
        const mobileUserMenu = document.getElementById('mobileUserMenu');

        if (isLoggedIn && user) {
            // Show user menu, hide auth buttons
            if (authButtons) authButtons.classList.add('hidden');
            if (userMenu) userMenu.classList.remove('hidden');
            if (mobileAuthButtons) mobileAuthButtons.classList.add('hidden');
            if (mobileUserMenu) mobileUserMenu.classList.remove('hidden');

            // Update user info
            if (userName) userName.textContent = user.name?.split(' ')[0] || 'User';

            if (userAvatar && user.profile_image) {
                userAvatar.innerHTML = `<img src="${user.profile_image}" alt="${user.name}" class="w-full h-full object-cover">`;
            }
        } else {
            // Show auth buttons, hide user menu
            if (authButtons) authButtons.classList.remove('hidden');
            if (userMenu) userMenu.classList.add('hidden');
            if (mobileAuthButtons) mobileAuthButtons.classList.remove('hidden');
            if (mobileUserMenu) mobileUserMenu.classList.add('hidden');
        }
    },

    /**
     * Initialize auth UI event listeners
     */
    init() {
        this.updateUI();

        // User dropdown toggle
        const userMenuBtn = document.getElementById('userMenuBtn');
        const userDropdown = document.getElementById('userDropdown');

        if (userMenuBtn && userDropdown) {
            userMenuBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                userDropdown.classList.toggle('hidden');
            });

            // Close dropdown when clicking outside
            document.addEventListener('click', () => {
                userDropdown.classList.add('hidden');
            });
        }

        // Logout buttons
        const logoutBtn = document.getElementById('logoutBtn');
        const mobileLogoutBtn = document.getElementById('mobileLogoutBtn');

        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.logout());
        }
        if (mobileLogoutBtn) {
            mobileLogoutBtn.addEventListener('click', () => this.logout());
        }

        // Handle sell links - require login
        const sellLink = document.getElementById('sellLink');
        const mobileSellLink = document.getElementById('mobileSellLink');
        const heroSellBtn = document.getElementById('heroSellBtn');

        const handleSellClick = (e) => {
            if (!this.isLoggedIn()) {
                e.preventDefault();
                showToast('Please login to list items', 'info');
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 1500);
            } else {
                window.location.href = 'upload-product.html';
            }
        };

        if (sellLink) sellLink.addEventListener('click', handleSellClick);
        if (mobileSellLink) mobileSellLink.addEventListener('click', handleSellClick);
        if (heroSellBtn) heroSellBtn.addEventListener('click', handleSellClick);
    }
};

// Make globally available
window.auth = auth;
