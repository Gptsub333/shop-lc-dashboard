// API Configuration
const API_CONFIG = {
    // REST API base URL - update this with your actual backend URL
    REST_URL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",

    // API endpoints
    ENDPOINTS: {
        CONVERSATION: "/api/dashboard/conversations", // + /{mobile_number}
    },
}

// API Client Class
class DashboardAPI {
    constructor(baseUrl = API_CONFIG.REST_URL) {
        this.baseUrl = baseUrl
    }

    async fetch(endpoint, options = {}) {
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            ...options,
            headers: {
                "Content-Type": "application/json",
                ...options?.headers,
            },
        })

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}))
            throw new Error(errorData.message || `API Error: ${response.status} ${response.statusText}`)
        }

        return response.json()
    }

    // Get conversation for a mobile number (mobile number is used as session ID)
    async getConversation(mobileNumber) {
        return this.fetch(`${API_CONFIG.ENDPOINTS.CONVERSATION}/${mobileNumber}`)
    }
}

// Singleton API instance
export const dashboardAPI = new DashboardAPI()
export { API_CONFIG }
