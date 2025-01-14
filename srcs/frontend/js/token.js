class TokenManager {
    constructor() {
        this.accessToken = null; // Initialize the access token as null
    }

    /**
     * Set the access token.
     * @param {string} token - The access token to store.
     */
    setAccessToken(token) {
        this.accessToken = token;
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
    }
}

// Export a single instance (singleton pattern)
const tokenManager = new TokenManager();
export default tokenManager;
