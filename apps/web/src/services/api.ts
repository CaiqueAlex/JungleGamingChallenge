import type { CreateTaskApiData, UpdateTaskData } from '../lib/schemas'
import type { Task } from '../hooks/useTasks'

const API_BASE_URL = 'http://localhost:3001'

class ApiService {
  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${API_BASE_URL}${endpoint}`
    
    console.log('🚀 API REQUEST:', {
      url,
      method: options.method || 'GET',
      headers: options.headers,
      body: options.body
    })
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    })

    const responseData = await response.text()
    console.log('📥 API RESPONSE:', {
      status: response.status,
      statusText: response.statusText,
      data: responseData
    })

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText} - ${responseData}`)
    }

    return responseData ? JSON.parse(responseData) : {}
  }

  async login(email: string, password: string) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
  }

  async register(name: string, email: string, password: string) {
    return this.request('/auth/register', {
      method: 'POST', 
      body: JSON.stringify({ 
        username: name,
        email, 
        password 
      }),
    })
  }

  async getProfile(token: string) {
    return this.request('/profile/me', {
      headers: { Authorization: `Bearer ${token}` },
    })
  }

  async getTasks(token: string): Promise<Task[]> {
    return this.request('/tasks', {
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
    })
  }

  async getTask(taskId: string, token: string): Promise<Task> {
    return this.request(`/tasks/${taskId}`, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
    })
  }

  async createTask(data: CreateTaskApiData, token: string): Promise<Task> {
    console.log('🚀 CREATING TASK:', data)
    return this.request('/tasks', {
      method: 'POST',
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data),
    })
  }

  async updateTask(taskId: string, data: UpdateTaskData, token: string): Promise<Task> {
    return this.request(`/tasks/${taskId}`, {
      method: 'PUT',
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data),
    })
  }

  async deleteTask(taskId: string, token: string): Promise<void> {
    return this.request(`/tasks/${taskId}`, {
      method: 'DELETE',
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
    })
  }

  async getTaskComments(taskId: string, token: string) {
    return this.request(`/tasks/${taskId}/comments`, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
    })
  }

  async createComment(taskId: string, content: string, token: string) {
    return this.request(`/tasks/${taskId}/comments`, {
      method: 'POST',
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ content }),
    })
  }
}

export const apiService = new ApiService()