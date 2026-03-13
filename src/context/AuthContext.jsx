import React, { createContext, useContext, useState, useEffect } from "react"
import { loginUser } from "../services/api"

const AuthContext = createContext()

// Use sessionStorage for tab isolation (each tab has its own storage)
const TOKEN_KEY = "retailflow_token"

export function AuthProvider({ children }) {

  const [user, setUser] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    checkSession()
  }, [])

  const checkSession = () => {
    // Use sessionStorage instead of localStorage for tab isolation
    const token = sessionStorage.getItem(TOKEN_KEY)

    if (token) {
      try {
        // Parse JWT token to get user data
        const payload = JSON.parse(atob(token.split(".")[1]))
        
        // Validate token structure
        if (!payload.sub || !payload.role) {
          throw new Error('Invalid token structure')
        }

        setUser({
          email: payload.sub,  // Use 'sub' consistently
          role: payload.role
        })
        setIsAuthenticated(true)
      } catch (error) {
        // Invalid token - clear it
        console.error('Token validation error:', error)
        sessionStorage.removeItem(TOKEN_KEY)
        setUser(null)
        setIsAuthenticated(false)
      }
    } else {
      setUser(null)
      setIsAuthenticated(false)
    }

    setIsLoading(false)
  }

  const login = async (email, password) => {
    try {
      const result = await loginUser(email, password)

      if (result.success) {
        // Clear any existing token first
        sessionStorage.removeItem(TOKEN_KEY)
        
        // Store token in sessionStorage (tab-specific)
        sessionStorage.setItem(TOKEN_KEY, result.access_token)

        const payload = JSON.parse(atob(result.access_token.split(".")[1]))

        // Validate payload before setting state
        if (!payload.sub || !payload.role) {
          throw new Error('Invalid token received from server')
        }

        setUser({
          email: payload.sub,  // Use 'sub' consistently
          role: payload.role
        })

        setIsAuthenticated(true)

        return { success: true }
      } else {
        // Handle different error types
        if (result.isLocked) {
          return { success: false, error: result.error, isLocked: true }
        } else {
          return { success: false, error: result.error }
        }
      }

    } catch (error) {
      console.error('Login error:', error)
      return { success: false, error: "Server error" }
    }
  }

  const logout = () => {
    // Clear from sessionStorage (this tab only)
    sessionStorage.removeItem(TOKEN_KEY)
    setUser(null)
    setIsAuthenticated(false)
  }

  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider")
  }

  return context
}
