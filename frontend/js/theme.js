// ============================================
// Dark Mode Theme Manager
// ============================================
(function () {
    const STORAGE_KEY = 'sellout-theme';

    function getPreferred() {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) return stored;
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }

    function apply(theme) {
        document.documentElement.classList.toggle('dark', theme === 'dark');
        localStorage.setItem(STORAGE_KEY, theme);
        updateToggleIcons(theme);
    }

    function toggle() {
        const current = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
        apply(current === 'dark' ? 'light' : 'dark');
    }

    function updateToggleIcons(theme) {
        document.querySelectorAll('.theme-toggle').forEach(btn => {
            const icon = btn.querySelector('i');
            if (icon) {
                icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
            }
        });
    }

    // Apply immediately (before DOM ready) to prevent flash
    apply(getPreferred());

    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
        if (!localStorage.getItem(STORAGE_KEY)) {
            apply(e.matches ? 'dark' : 'light');
        }
    });

    // Expose globally
    window.toggleTheme = toggle;
    window.setTheme = apply;
    window.getTheme = () => document.documentElement.classList.contains('dark') ? 'dark' : 'light';
})();
