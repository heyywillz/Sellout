const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

const CONFIG = {
    // Automatically switch between localhost and your deployed backend URL on Render
    API_URL: isLocalhost
        ? 'http://localhost:5000/api'
        : 'https://sellout-backend.onrender.com/api',

    // Default currency
    CURRENCY: '₵',

    // Currency locale
    LOCALE: 'en-GH',

    // Categories
    CATEGORIES: ['Books', 'Electronics', 'Fashion', 'Furniture', 'Others'],

    // Conditions
    CONDITIONS: ['New', 'Fairly Used', 'Used'],

    // Default pagination
    PAGE_SIZE: 12,

    // Toast duration (ms)
    TOAST_DURATION: 4000,

    // Google OAuth Client ID (replace with your actual client ID from Google Cloud Console)
    // Example: '1234567890-abcdefg.apps.googleusercontent.com'
    GOOGLE_CLIENT_ID: '189971846664-6ujn5hs0u6fpgq4m7ruoqeegt8uham1d.apps.googleusercontent.com'
};

// Make it globally available
window.CONFIG = CONFIG;
