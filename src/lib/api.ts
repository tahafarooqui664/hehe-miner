const API_BASE_URL = process.env.NEXT_PUBLIC_APP_URL ||
  (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000')

interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  [key: string]: any
}

class ApiClient {
  private baseURL: string
  private token: string | null = null

  constructor(baseURL: string) {
    this.baseURL = baseURL
  }

  setToken(token: string | null) {
    this.token = token
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}/api${endpoint}`
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    }

    if (this.token) {
      (headers as Record<string, string>).Authorization = `Bearer ${this.token}`
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      })

      const data = await response.json()
      return data
    } catch (error) {
      console.error('API request failed:', error)
      return {
        success: false,
        error: 'Network error occurred'
      }
    }
  }

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' })
  }

  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' })
  }

  // Auth methods
  async loginWithTelegram(telegramData: any) {
    return this.post('/auth/telegram', telegramData)
  }

  async loginMock() {
    return this.post('/auth/telegram', { mock: true })
  }

  // User methods
  async getUserProfile() {
    return this.get('/user/profile')
  }

  // Mining methods
  async startMining() {
    return this.post('/mining/start')
  }

  async claimMining(sessionId: string) {
    return this.post('/mining/claim', { sessionId })
  }

  // Subscription methods
  async activateBasicPlan() {
    return this.post('/subscription/basic-plan')
  }

  async purchaseSpeedUpgrade(data?: {
    transactionId?: string
    transactionHash?: string
    paymentMethod?: 'ton' | 'stars'
    paymentComment?: string
  }) {
    return this.post('/subscription/speed-upgrade', data)
  }

  // Tasks methods
  async getTasks() {
    return this.get('/tasks')
  }

  async completeTask(taskId: string) {
    return this.post('/tasks/complete', { taskId })
  }

  // Referrals methods
  async getReferrals() {
    return this.get('/referrals')
  }

  async createReferral(referredTelegramId: string) {
    return this.post('/referrals', { referredTelegramId })
  }
}

export const apiClient = new ApiClient(API_BASE_URL)
