const API_CONFIG = {
    // REST API base URL - update this with your actual backend URL
    REST_URL: process.env.NEXT_PUBLIC_API_URL || "https://shoplc.holbox.ai",

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

    // Get conversation for a mobile number with pagination
    async getConversation(mobileNumber, page = 1, pageSize = 10) {
        const queryParams = new URLSearchParams({
            page: page.toString(),
            page_size: pageSize.toString()
        })

        return this.fetch(`${API_CONFIG.ENDPOINTS.CONVERSATION}/${mobileNumber}?${queryParams}`)
    }
}

// Singleton API instance — CS server (NEXT_PUBLIC_API_URL)
export const dashboardAPI = new DashboardAPI()

// Singleton API instance — Agent / Sales server (NEXT_PUBLIC_API_URL1)
export const dashboardAPI1 = new DashboardAPI(
    process.env.NEXT_PUBLIC_API_URL1 || "https://shoplc-sales.holbox.ai"
)

export { API_CONFIG }