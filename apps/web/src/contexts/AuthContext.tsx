import React, { createContext, useContext, useState, useEffect } from 'react'
import { apiService } from '../services/api'

interface User {
  id: string
  username: string
  email: string
}

interface AuthContextType {
  user: User | null
  token: string | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    try {
      const savedToken = localStorage.getItem('jungle-token')
      const savedUser = localStorage.getItem('jungle-user')
      
      if (savedToken && savedUser && savedUser !== 'undefined' && savedUser !== 'null') {
        const parsedUser = JSON.parse(savedUser)
        setToken(savedToken)
        setUser(parsedUser)
      }
    } catch (error) {
      console.error('❌ ERROR LOADING AUTH:', error)
      localStorage.removeItem('jungle-token')
      localStorage.removeItem('jungle-user')
    }
    
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    
    try {
      const response = await apiService.login(email, password)
      const accessToken = response.accessToken
      const userData = {
        id: response.user.id,
        username: response.user.username,
        email: response.user.email
      }
      
      setToken(accessToken)
      setUser(userData)
      localStorage.setItem('jungle-token', accessToken)
      localStorage.setItem('jungle-user', JSON.stringify(userData))
    } catch (error) {
      console.error('❌ LOGIN FAILED:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (name: string, email: string, password: string) => {
    setIsLoading(true)
    
    try {
      const rawResponse = await apiService.register(name, email, password)
      
      const response = rawResponse?.data ?? rawResponse
      
      let accessToken = response.accessToken
      let userData = response.user ?? response 

      if (!accessToken) {
        console.log('⚠️ No access token from register, attempting login...')
        const loginResponse = await apiService.login(email, password)
        accessToken = loginResponse.accessToken
        userData = loginResponse.user ?? loginResponse
      }
      
      if (!accessToken || !userData?.id) {
        throw new Error('Auth response missing token or user data')
      }

      const cleanUserData = {
        id: userData.id,
        username: userData.username,
        email: userData.email
      }
      
      setToken(accessToken)
      setUser(cleanUserData)
      localStorage.setItem('jungle-token', accessToken)
      localStorage.setItem('jungle-user', JSON.stringify(cleanUserData))
      
    } catch (error) {
      console.error('❌ REGISTER FAILED:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('jungle-token')
    localStorage.removeItem('jungle-user')
  }

  return (
    <AuthContext.Provider value={{
      user,
      token,
      isLoading,
      login,
      register,
      logout,
      isAuthenticated: !!user && !!token
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}