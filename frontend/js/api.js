// API Service - Handles all API requests

const api = {
    /**
     * Get authorization headers
     */
    getHeaders() {
        const headers = {
            'Content-Type': 'application/json'
        };

        const token = localStorage.getItem('token');
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        return headers;
    },

    /**
     * Handle API response
     */
    async handleResponse(response) {
        const data = await response.json();

        // Handle authentication errors
        if (response.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');

            // Only redirect if not already on login page
            if (!window.location.pathname.includes('login.html')) {
                showToast('Session expired. Please login again.', 'error');
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 1500);
            }
            throw new Error(data.message || 'Unauthorized');
        }

        if (!response.ok) {
            throw new Error(data.message || 'Something went wrong');
        }

        return data;
    },

    /**
     * GET request
     */
    async get(endpoint) {
        try {
            const response = await fetch(`${CONFIG.API_URL}${endpoint}`, {
                method: 'GET',
                headers: this.getHeaders()
            });
            return await this.handleResponse(response);
        } catch (error) {
            console.error('API GET Error:', error);
            throw error;
        }
    },

    /**
     * POST request (JSON)
     */
    async post(endpoint, data) {
        try {
            const response = await fetch(`${CONFIG.API_URL}${endpoint}`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify(data)
            });
            return await this.handleResponse(response);
        } catch (error) {
            console.error('API POST Error:', error);
            throw error;
        }
    },

    /**
     * POST request (FormData - for file uploads)
     */
    async postFormData(endpoint, formData) {
        try {
            const headers = {};
            const token = localStorage.getItem('token');
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const response = await fetch(`${CONFIG.API_URL}${endpoint}`, {
                method: 'POST',
                headers: headers,
                body: formData
            });
            return await this.handleResponse(response);
        } catch (error) {
            console.error('API POST FormData Error:', error);
            throw error;
        }
    },

    /**
     * PUT request (JSON)
     */
    async put(endpoint, data) {
        try {
            const response = await fetch(`${CONFIG.API_URL}${endpoint}`, {
                method: 'PUT',
                headers: this.getHeaders(),
                body: JSON.stringify(data)
            });
            return await this.handleResponse(response);
        } catch (error) {
            console.error('API PUT Error:', error);
            throw error;
        }
    },

    /**
     * PUT request (FormData - for file uploads)
     */
    async putFormData(endpoint, formData) {
        try {
            const headers = {};
            const token = localStorage.getItem('token');
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const response = await fetch(`${CONFIG.API_URL}${endpoint}`, {
                method: 'PUT',
                headers: headers,
                body: formData
            });
            return await this.handleResponse(response);
        } catch (error) {
            console.error('API PUT FormData Error:', error);
            throw error;
        }
    },

    /**
     * DELETE request
     */
    async delete(endpoint) {
        try {
            const response = await fetch(`${CONFIG.API_URL}${endpoint}`, {
                method: 'DELETE',
                headers: this.getHeaders()
            });
            return await this.handleResponse(response);
        } catch (error) {
            console.error('API DELETE Error:', error);
            throw error;
        }
    }
};

// Make globally available
window.api = api;
