import React, { createContext, useContext, useState, useEffect } from "react"
import { loginUser } from "../services/api"

const AuthContext = createContext()

const TOKEN_KEY = "retailflow_token"

export function AuthProvider({ children }) {

  const [user, setUser] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    checkSession()
  }, [])

  const checkSession = () => {

    const token = localStorage.getItem(TOKEN_KEY)

    if (token) {
      setIsAuthenticated(true)
    }

    setIsLoading(false)
  }

  const login = async (email, password) => {

    try {

      const result = await loginUser(email, password)

      if (result.access_token) {

  localStorage.setItem(TOKEN_KEY, result.access_token)

  const payload = JSON.parse(atob(result.access_token.split(".")[1]))

  setUser({
    email: payload.sub,
    role: payload.role
  })

  setIsAuthenticated(true)

  return { success: true }
}

      return { success: false, error: "Invalid credentials" }

    } catch (error) {

      return { success: false, error: "Server error" }

    }

  }

  const logout = () => {

    localStorage.removeItem(TOKEN_KEY)

    setIsAuthenticated(false)

    setUser(null)
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