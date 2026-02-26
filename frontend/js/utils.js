// Utility Functions

/**
 * Format price with currency symbol
 */
function formatPrice(price) {
    const num = parseFloat(price);
    if (isNaN(num)) return `${CONFIG.CURRENCY}0.00`;

    return `${CONFIG.CURRENCY}${num.toLocaleString(CONFIG.LOCALE, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
    })}`;
}

/**
 * Format date to relative time or date string
 */
function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;

    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 30) {
        return date.toLocaleDateString(CONFIG.LOCALE, {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    } else if (days > 0) {
        return `${days} day${days > 1 ? 's' : ''} ago`;
    } else if (hours > 0) {
        return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else if (minutes > 0) {
        return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else {
        return 'Just now';
    }
}

/**
 * Show toast notification
 */
function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast flex items-center gap-3 px-5 py-4 rounded-2xl shadow-lg border ${getToastClasses(type)}`;

    const icon = getToastIcon(type);

    toast.innerHTML = `
        <i class="${icon}"></i>
        <span class="text-sm font-medium">${message}</span>
        <button class="ml-auto text-current opacity-70 hover:opacity-100 transition-opacity" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;

    container.appendChild(toast);

    // Auto remove after duration
    setTimeout(() => {
        toast.classList.add('hide');
        setTimeout(() => toast.remove(), 300);
    }, CONFIG.TOAST_DURATION);
}

function getToastClasses(type) {
    switch (type) {
        case 'success':
            return 'bg-white border-green-200 text-green-700';
        case 'error':
            return 'bg-white border-red-200 text-red-700';
        case 'warning':
            return 'bg-white border-amber-200 text-amber-700';
        default:
            return 'bg-white border-blue-200 text-blue-700';
    }
}

function getToastIcon(type) {
    switch (type) {
        case 'success':
            return 'fas fa-check-circle';
        case 'error':
            return 'fas fa-exclamation-circle';
        case 'warning':
            return 'fas fa-exclamation-triangle';
        default:
            return 'fas fa-info-circle';
    }
}

/**
 * Debounce function
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Truncate text
 */
function truncateText(text, maxLength) {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}

/**
 * Generate WhatsApp link
 */
function generateWhatsAppLink(phone, productTitle, price) {
    const message = encodeURIComponent(
        `Hello, I'm interested in your item "${productTitle}" listed on Sellout for ${formatPrice(price)}. Is it still available?`
    );
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    return `https://wa.me/${cleanPhone}?text=${message}`;
}

/**
 * Get URL parameters
 */
function getUrlParams() {
    return new URLSearchParams(window.location.search);
}

/**
 * Set URL parameters without reload
 */
function setUrlParams(params) {
    const url = new URL(window.location);
    Object.keys(params).forEach(key => {
        if (params[key]) {
            url.searchParams.set(key, params[key]);
        } else {
            url.searchParams.delete(key);
        }
    });
    window.history.pushState({}, '', url);
}

/**
 * Validate email format
 */
function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

/**
 * Validate phone number
 */
function isValidPhone(phone) {
    const re = /^\+?[0-9]{10,15}$/;
    return re.test(phone.replace(/\s/g, ''));
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Get category icon
 */
function getCategoryIcon(category) {
    const icons = {
        'Books': 'fas fa-book',
        'Electronics': 'fas fa-laptop',
        'Fashion': 'fas fa-tshirt',
        'Furniture': 'fas fa-couch',
        'Others': 'fas fa-box'
    };
    return icons[category] || 'fas fa-box';
}

/**
 * Get category color classes
 */
function getCategoryColor(category) {
    const colors = {
        'Books': 'from-blue-100 to-blue-50 text-blue-600',
        'Electronics': 'from-purple-100 to-purple-50 text-purple-600',
        'Fashion': 'from-pink-100 to-pink-50 text-pink-600',
        'Furniture': 'from-amber-100 to-amber-50 text-amber-600',
        'Others': 'from-gray-100 to-gray-50 text-gray-600'
    };
    return colors[category] || 'from-gray-100 to-gray-50 text-gray-600';
}

// Make functions globally available
window.formatPrice = formatPrice;
window.formatDate = formatDate;
window.showToast = showToast;
window.debounce = debounce;
window.truncateText = truncateText;
window.generateWhatsAppLink = generateWhatsAppLink;
window.getUrlParams = getUrlParams;
window.setUrlParams = setUrlParams;
window.isValidEmail = isValidEmail;
window.isValidPhone = isValidPhone;
window.escapeHtml = escapeHtml;
window.getCategoryIcon = getCategoryIcon;
window.getCategoryColor = getCategoryColor;
