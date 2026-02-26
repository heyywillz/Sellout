// Products Module - Handles product listing and filtering

const products = {
    currentPage: 1,
    currentFilters: {
        search: '',
        category: 'all',
        condition: 'all',
        campus: 'all',
        minPrice: '',
        maxPrice: '',
        sort: 'newest'
    },

    /**
     * Load products with current filters
     */
    async loadProducts(page = 1) {
        const grid = document.getElementById('productsGrid');
        const loadingState = document.getElementById('loadingState');
        const emptyState = document.getElementById('emptyState');
        const pagination = document.getElementById('pagination');
        const resultsCount = document.getElementById('resultsCount');

        if (!grid) return;

        // Show loading, hide others
        grid.innerHTML = '';
        loadingState?.classList.remove('hidden');
        emptyState?.classList.add('hidden');
        pagination?.classList.add('hidden');

        try {
            // Build query string
            const params = new URLSearchParams({
                page: page,
                limit: CONFIG.PAGE_SIZE
            });

            if (this.currentFilters.search) params.append('search', this.currentFilters.search);
            if (this.currentFilters.category !== 'all') params.append('category', this.currentFilters.category);
            if (this.currentFilters.condition !== 'all') params.append('condition', this.currentFilters.condition);
            if (this.currentFilters.campus !== 'all') params.append('campus', this.currentFilters.campus);
            if (this.currentFilters.minPrice) params.append('minPrice', this.currentFilters.minPrice);
            if (this.currentFilters.maxPrice) params.append('maxPrice', this.currentFilters.maxPrice);
            if (this.currentFilters.sort) params.append('sort', this.currentFilters.sort);

            const response = await api.get(`/products?${params.toString()}`);
            loadingState?.classList.add('hidden');

            if (response.success && response.data.products.length > 0) {
                this.currentPage = page;

                // Update results count
                if (resultsCount) {
                    resultsCount.textContent = response.data.pagination.total;
                }

                // Render products
                grid.innerHTML = response.data.products.map(product => this.renderProductCard(product)).join('');

                // Update pagination
                this.updatePagination(response.data.pagination);
            } else {
                emptyState?.classList.remove('hidden');
                if (resultsCount) resultsCount.textContent = '0';
            }
        } catch (error) {
            console.error('Error loading products:', error);
            loadingState?.classList.add('hidden');
            emptyState?.classList.remove('hidden');
            if (resultsCount) resultsCount.textContent = '0';
        }
    },

    /**
     * Render single product card
     */
    renderProductCard(product) {
        const conditionClass = product.product_condition === 'New' ? 'condition-new' :
            product.product_condition === 'Fairly Used' ? 'condition-fairly-used' : 'condition-used';

        return `
            <a href="product-details.html?id=${product.id}" class="product-card group block rounded-2xl bg-white border border-gray-200 overflow-hidden hover:border-green-200 transition-all shadow-sm">
                <div class="relative aspect-square overflow-hidden">
                    <img src="${product.image_url}" alt="${escapeHtml(product.title)}" 
                        class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy">
                    <div class="absolute top-3 left-3">
                        <span class="px-2.5 py-1 rounded-full ${conditionClass} text-xs font-medium backdrop-blur-sm">
                            ${product.product_condition}
                        </span>
                    </div>
                    <button class="favorite-btn" data-product-id="${product.id}" onclick="event.preventDefault(); event.stopPropagation(); products.toggleCardFavorite(this, ${product.id});" title="Add to Favorites">
                        <i class="far fa-heart text-sm text-gray-500"></i>
                    </button>
                    ${product.status === 'sold' ? `
                        <div class="absolute inset-0 bg-white/70 flex items-center justify-center">
                            <span class="px-4 py-2 rounded-full bg-red-500 text-white text-sm font-semibold">Sold</span>
                        </div>
                    ` : ''}
                </div>
                <div class="p-4">
                    <div class="flex items-center gap-2 mb-2">
                        <span class="text-xs text-gray-400">${product.category}</span>
                        <span class="text-gray-200">•</span>
                        <span class="text-xs text-gray-400">${product.campus}</span>
                    </div>
                    <h3 class="font-semibold text-sm mb-2 text-gray-800 line-clamp-2 group-hover:text-green-700 transition-colors">
                        ${escapeHtml(product.title)}
                    </h3>
                    <div class="flex items-center justify-between">
                        <p class="text-lg font-bold text-green-700">${formatPrice(product.price)}</p>
                        <span class="text-xs text-gray-400">${formatDate(product.created_at)}</span>
                    </div>
                </div>
            </a>
        `;
    },

    /**
     * Update pagination controls
     */
    updatePagination(paginationData) {
        const pagination = document.getElementById('pagination');
        const pageNumbers = document.getElementById('pageNumbers');
        const prevBtn = document.getElementById('prevPage');
        const nextBtn = document.getElementById('nextPage');

        if (!pagination || paginationData.pages <= 1) {
            pagination?.classList.add('hidden');
            return;
        }

        pagination.classList.remove('hidden');

        // Enable/disable prev/next buttons
        prevBtn.disabled = paginationData.page === 1;
        nextBtn.disabled = paginationData.page === paginationData.pages;

        // Generate page numbers
        let pagesHtml = '';
        const { page, pages } = paginationData;

        // Determine which pages to show
        let startPage = Math.max(1, page - 2);
        let endPage = Math.min(pages, page + 2);

        if (startPage > 1) {
            pagesHtml += `<button class="page-btn px-3 py-2 rounded-lg text-sm ${1 === page ? 'bg-green-600 text-white' : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'}" data-page="1">1</button>`;
            if (startPage > 2) {
                pagesHtml += `<span class="px-2 text-gray-400">...</span>`;
            }
        }

        for (let i = startPage; i <= endPage; i++) {
            pagesHtml += `
                <button class="page-btn px-3 py-2 rounded-lg text-sm ${i === page ? 'bg-green-600 text-white' : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'}" data-page="${i}">
                    ${i}
                </button>
            `;
        }

        if (endPage < pages) {
            if (endPage < pages - 1) {
                pagesHtml += `<span class="px-2 text-gray-400">...</span>`;
            }
            pagesHtml += `<button class="page-btn px-3 py-2 rounded-lg text-sm ${pages === page ? 'bg-green-600 text-white' : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'}" data-page="${pages}">${pages}</button>`;
        }

        pageNumbers.innerHTML = pagesHtml;

        // Add event listeners to page buttons
        pageNumbers.querySelectorAll('.page-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.loadProducts(parseInt(btn.dataset.page));
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
        });

        // Prev/Next button handlers
        prevBtn.onclick = () => {
            if (this.currentPage > 1) {
                this.loadProducts(this.currentPage - 1);
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        };

        nextBtn.onclick = () => {
            if (this.currentPage < paginationData.pages) {
                this.loadProducts(this.currentPage + 1);
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        };
    },

    /**
     * Load available campuses for filter
     */
    async loadCampuses() {
        const campusSelect = document.getElementById('filterCampus');
        if (!campusSelect) return;

        try {
            const response = await api.get('/products/campuses');
            if (response.success && response.data.campuses.length > 0) {
                response.data.campuses.forEach(campus => {
                    const option = document.createElement('option');
                    option.value = campus;
                    option.textContent = campus;
                    campusSelect.appendChild(option);
                });
            }
        } catch (error) {
            console.error('Error loading campuses:', error);
        }
    },

    /**
     * Apply filters from form
     */
    applyFilters() {
        // improved search logic to prefer visible input
        const searchInput = document.getElementById('searchInput');
        const mobileSearchInput = document.getElementById('mobileSearchInput');
        let searchValue = '';

        if (searchInput && searchInput.offsetParent !== null) {
            searchValue = searchInput.value;
        } else if (mobileSearchInput && mobileSearchInput.offsetParent !== null) {
            searchValue = mobileSearchInput.value;
        } else {
            searchValue = searchInput?.value || mobileSearchInput?.value || '';
        }

        this.currentFilters = {
            search: searchValue,
            category: document.getElementById('filterCategory')?.value || 'all',
            condition: document.getElementById('filterCondition')?.value || 'all',
            campus: document.getElementById('filterCampus')?.value || 'all',
            minPrice: document.getElementById('minPrice')?.value || '',
            maxPrice: document.getElementById('maxPrice')?.value || '',
            sort: document.getElementById('sortBy')?.value || 'newest'
        };

        this.loadProducts(1);
    },

    /**
     * Clear all filters
     */
    clearFilters() {
        // Reset filter inputs
        const searchInput = document.getElementById('searchInput');
        const mobileSearchInput = document.getElementById('mobileSearchInput');
        const filterCategory = document.getElementById('filterCategory');
        const filterCondition = document.getElementById('filterCondition');
        const filterCampus = document.getElementById('filterCampus');
        const minPrice = document.getElementById('minPrice');
        const maxPrice = document.getElementById('maxPrice');
        const sortBy = document.getElementById('sortBy');

        if (searchInput) searchInput.value = '';
        if (mobileSearchInput) mobileSearchInput.value = '';
        if (filterCategory) filterCategory.value = 'all';
        if (filterCondition) filterCondition.value = 'all';
        if (filterCampus) filterCampus.value = 'all';
        if (minPrice) minPrice.value = '';
        if (maxPrice) maxPrice.value = '';
        if (sortBy) sortBy.value = 'newest';

        this.currentFilters = {
            search: '',
            category: 'all',
            condition: 'all',
            campus: 'all',
            minPrice: '',
            maxPrice: '',
            sort: 'newest'
        };

        this.loadProducts(1);
    },

    /**
     * Initialize product module
     */
    init() {
        // Load initial products
        this.loadProducts();
        this.loadCampuses();

        // Search input handlers
        const searchInput = document.getElementById('searchInput');
        const mobileSearchInput = document.getElementById('mobileSearchInput');

        const handleSearch = debounce(() => {
            let query = '';
            // Determine active input based on visibility
            if (searchInput && searchInput.offsetParent !== null) {
                query = searchInput.value;
            } else if (mobileSearchInput && mobileSearchInput.offsetParent !== null) {
                query = mobileSearchInput.value;
            } else {
                query = searchInput?.value || mobileSearchInput?.value || '';
            }

            // Sync inputs so value persists when resizing
            if (searchInput && mobileSearchInput) {
                if (searchInput.value !== query) searchInput.value = query;
                if (mobileSearchInput.value !== query) mobileSearchInput.value = query;
            }

            this.currentFilters.search = query;
            this.loadProducts(1);
        }, 300);

        searchInput?.addEventListener('input', handleSearch);
        mobileSearchInput?.addEventListener('input', handleSearch);

        // Enter key on search
        const handleEnter = (e) => {
            if (e.key === 'Enter') {
                this.applyFilters();
            }
        };
        searchInput?.addEventListener('keypress', handleEnter);
        mobileSearchInput?.addEventListener('keypress', handleEnter);

        // Search Button Clicks
        document.getElementById('searchBtn')?.addEventListener('click', () => {
            this.applyFilters();
        });
        document.getElementById('mobileSearchBtn')?.addEventListener('click', () => {
            this.applyFilters();
        });

        // Filter controls
        document.getElementById('applyFilters')?.addEventListener('click', () => this.applyFilters());
        document.getElementById('clearFilters')?.addEventListener('click', () => this.clearFilters());
        document.getElementById('resetSearch')?.addEventListener('click', () => this.clearFilters());

        // Sort change
        document.getElementById('sortBy')?.addEventListener('change', () => this.applyFilters());

        // Category buttons
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const category = btn.dataset.category;
                const filterCategory = document.getElementById('filterCategory');
                if (filterCategory) {
                    filterCategory.value = category;
                }
                this.currentFilters.category = category;
                this.loadProducts(1);

                // Scroll to products
                document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' });
            });
        });

        // Mobile filter toggle
        const filterToggle = document.getElementById('filterToggle');
        const filterPanel = document.getElementById('filterPanel');

        filterToggle?.addEventListener('click', () => {
            filterPanel?.classList.toggle('hidden');
            filterPanel?.classList.toggle('filter-panel-open');
        });

        // Load stats for hero section
        this.loadStats();
    },

    /**
     * Load stats for hero section
     */
    async loadStats() {
        try {
            const response = await api.get('/products?limit=1');
            if (response.success) {
                const total = response.data.pagination.total;
                document.getElementById('statsProducts')?.setAttribute('data-count', total);
                animateCounter('statsProducts', total);
            }

            // Get unique campuses
            const campusResponse = await api.get('/products/campuses');
            if (campusResponse.success) {
                const campusCount = campusResponse.data.campuses.length;
                document.getElementById('statsCampuses')?.setAttribute('data-count', campusCount);
                animateCounter('statsCampuses', campusCount);
            }
        } catch (error) {
            console.error('Error loading stats:', error);
        }
    },

    /**
     * Toggle favorite from product card
     */
    async toggleCardFavorite(btnElement, productId) {
        const token = localStorage.getItem('token');
        if (!token) {
            showToast('Please login to add favorites', 'info');
            setTimeout(() => { window.location.href = 'login.html'; }, 1500);
            return;
        }

        try {
            const response = await api.post(`/favorites/${productId}`, {});
            if (response.success) {
                const icon = btnElement.querySelector('i');
                if (response.data.isFavorited) {
                    btnElement.classList.add('favorited', 'animate');
                    icon.className = 'fas fa-heart text-sm text-red-500';
                    showToast('Added to favorites', 'success');
                } else {
                    btnElement.classList.remove('favorited');
                    icon.className = 'far fa-heart text-sm text-gray-500';
                    showToast('Removed from favorites', 'info');
                }
                setTimeout(() => btnElement.classList.remove('animate'), 400);
            }
        } catch (error) {
            showToast('Failed to update favorite', 'error');
        }
    }
};

/**
 * Animate counter from 0 to target
 */
function animateCounter(elementId, target) {
    const element = document.getElementById(elementId);
    if (!element) return;

    const duration = 1500;
    const steps = 60;
    const stepDuration = duration / steps;
    const increment = target / steps;
    let current = 0;

    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            element.textContent = target;
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(current);
        }
    }, stepDuration);
}

// Make globally available
window.products = products;
