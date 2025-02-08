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
     * Get the stored access token.
     * @returns {string|null} - The access token, or null if not set.
     */
    getAccessToken() {
        return this.accessToken;
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
