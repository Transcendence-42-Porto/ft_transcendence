class TokenManager {
    constructor() {
        // Initialize the access token by checking sessionStorage (or fallback to null)
        this.accessToken = sessionStorage.getItem('accessToken') || null;
    }

    /**
     * Set the access token.
     * @param {string} token - The access token to store.
     */
    setAccessToken(token) {
        this.accessToken = token;
        // Save the token in sessionStorage so it persists during the session
        sessionStorage.setItem('accessToken', token);
    }

    /**
     * Check if the access token is valid.
     * @returns {boolean} - True if the token is valid, false otherwise.
     */
    isTokenValid() {
        if (!this.accessToken) {
            return false;
        }
        const payload = JSON.parse(atob(this.accessToken.split('.')[1]));
        const expiry = payload.exp * 1000;
        return Date.now() < expiry;
    }

    /**
     * Get the stored access token, refreshing it if necessary.
     * @returns {Promise<string|null>} - The access token, or null if not set.
     */

    async refreshToken(){
        const response = await fetch(`/api/token_ref/`, {
            method: 'GET',
        });
        if (!response.ok) {
            loadContent('login');
            throw new Error('Token refresh failed!');
        }
        const data = await response.json();
        if (data.access) {
            this.setAccessToken(data.access);
            return this.accessToken;
        } 
        return this.accessToken;
    }
    /**
     * Get the stored access token.
     * @returns {string|null} - The access token, or null if not set.
     */
    async getAccessToken() {
        if (this.isTokenValid()) {
            return this.accessToken;
        }
        return await this.refreshToken();
    }

    /**
     * Clear the access token.
     */
    clearAccessToken() {
        this.accessToken = null;
        // Remove the token from sessionStorage
        sessionStorage.removeItem('accessToken');
    }
}

// Export a single instance (singleton pattern)
const tokenManager = new TokenManager();
export default tokenManager;
