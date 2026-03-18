const API_BASE = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000"

const getToken = () => {
  return sessionStorage.getItem("retailflow_token")
}

const getRefreshToken = () => {
  return sessionStorage.getItem("retailflow_refresh_token")
}

const isTokenExpired = (token) => {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]))
    return payload.exp < Date.now() / 1000
  } catch (error) {
    return true
  }
}

let isRefreshing = false
let refreshSubscribers = []

const addRefreshSubscriber = (callback) => {
  refreshSubscribers.push(callback)
}

const onTokenRefreshed = (newToken) => {
  refreshSubscribers.forEach(callback => callback(newToken))
  refreshSubscribers = []
}

const refreshAccessToken = async () => {
  const refreshToken = getRefreshToken()
  if (!refreshToken) {
    throw new Error("No refresh token available")
  }

  const response = await fetch(`${API_BASE}/auth/refresh`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ refresh_token: refreshToken })
  })

  if (!response.ok) {
    throw new Error("Token refresh failed")
  }

  const data = await response.json()
  sessionStorage.setItem("retailflow_token", data.access_token)
  return data.access_token
}

const makeAuthenticatedRequest = async (url, options = {}) => {
  let token = getToken()
  
  // Don't try refresh if no token (login/register pages)
  if (!token) {
    throw new Error("No authentication token available")
  }
  
  if (isTokenExpired(token)) {
    if (!isRefreshing) {
      isRefreshing = true
      try {
        const newToken = await refreshAccessToken()
        token = newToken
        onTokenRefreshed(newToken)
      } catch (error) {
        refreshSubscribers.forEach(callback => callback(null))
        refreshSubscribers = []
        // Don't automatically clear tokens - let auth context handle it
        throw new Error("Authentication failed")
      } finally {
        isRefreshing = false
      }
    } else {
      // Wait for token refresh to complete
      token = await new Promise((resolve, reject) => {
        addRefreshSubscriber((newToken) => {
          if (newToken) {
            resolve(newToken)
          } else {
            reject(new Error("Token refresh failed"))
          }
        })
      })
    }
  }

  const headers = {
    ...options.headers,
    "Authorization": `Bearer ${token}`
  }

  return fetch(url, { ...options, headers })
}
export const loginUser = async (email, password) => {

  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: new URLSearchParams({
      username: email,
      password: password
    })
  })

  const data = await res.json()

  console.log("LOGIN RESPONSE:", data)

  if (res.ok && data.access_token) {
    sessionStorage.setItem("retailflow_token", data.access_token)
    if (data.refresh_token) {
      sessionStorage.setItem("retailflow_refresh_token", data.refresh_token)
    }
    return { success: true, ...data }
  } else {
    // Handle different error types
    if (res.status === 423) {
      // Account locked
      return { success: false, error: data.detail, isLocked: true }
    } else {
      // General authentication error
      return { success: false, error: data.detail || 'Login failed' }
    }
  }
}

export const registerUser = async (userData) => {
  try {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(userData)
    })

    const data = await res.json()

    console.log("REGISTER RESPONSE:", data)

    if (res.ok) {
      return { success: true, data }
    } else {
      return { success: false, error: data.detail || 'Registration failed' }
    }
  } catch (error) {
    console.error("Registration error:", error)
    return { success: false, error: 'Network error occurred' }
  }
}

export const changePassword = async (currentPassword, newPassword) => {
  try {
    const res = await makeAuthenticatedRequest(`${API_BASE}/auth/change-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        current_password: currentPassword,
        new_password: newPassword
      })
    })

    const data = await res.json()

    if (res.ok) {
      return { success: true, data }
    } else {
      return { success: false, error: data.detail || 'Password change failed' }
    }
  } catch (error) {
    console.error("Password change error:", error)
    return { success: false, error: 'Network error occurred' }
  }
}

export async function getProducts() {
  try {
    const response = await makeAuthenticatedRequest(`${API_BASE}/products/`)
    
    if (!response.ok) {
      throw new Error("Failed to fetch products");
    }

    return response.json();
  } catch (error) {
    if (error.message === "Authentication failed") {
      // Don't hard redirect - let auth context handle routing
      throw new Error("Authentication required");
    }
    throw error
  }
}

export const createProduct = async (product) => {
  try {
    const res = await makeAuthenticatedRequest(`${API_BASE}/products/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(product)
    })

    return res.json()
  } catch (error) {
    if (error.message === "Authentication failed") {
      // Don't hard redirect - let auth context handle routing
      throw new Error("Authentication required");
    }
    throw error
  }
}

export const createOrder = async (order) => {
  try {
    const res = await makeAuthenticatedRequest(`${API_BASE}/orders/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(order)
    })

    return res.json()
  } catch (error) {
    if (error.message === "Authentication failed") {
      // Don't hard redirect - let auth context handle routing
      throw new Error("Authentication required");
    }
    throw error
  }
}


export const updateProduct = async (id, product) => {
  try {
    const res = await makeAuthenticatedRequest(`${API_BASE}/products/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(product)
    })

    return res.json()
  } catch (error) {
    if (error.message === "Authentication failed") {
      // Don't hard redirect - let auth context handle routing
      throw new Error("Authentication required");
    }
    throw error
  }
}

export const deleteProduct = async (id) => {
  try {
    const res = await makeAuthenticatedRequest(`${API_BASE}/products/${id}`, {
      method: "DELETE"
    })

    return res.json()
  } catch (error) {
    if (error.message === "Authentication failed") {
      // Don't hard redirect - let auth context handle routing
      throw new Error("Authentication required");
    }
    throw error
  }
}

export const getAnalytics = async () => {
  try {
    const res = await makeAuthenticatedRequest(`${API_BASE}/analytics/top-products`)
    return res.json()
  } catch (error) {
    if (error.message === "Authentication failed") {
      // Don't hard redirect - let auth context handle routing
      throw new Error("Authentication required");
    }
    throw error
  }
}

export const getThisMonthAnalytics = async () => {
  try {
    const res = await makeAuthenticatedRequest(`${API_BASE}/analytics/this-month`)
    return res.json()
  } catch (error) {
    if (error.message === "Authentication failed") {
      // Don't hard redirect - let auth context handle routing
      throw new Error("Authentication required");
    }
    throw error
  }
}

export const getWorstProducts = async () => {
  try {
    const res = await makeAuthenticatedRequest(`${API_BASE}/analytics/worst-products`)
    return res.json()
  } catch (error) {
    if (error.message === "Authentication failed") {
      // Don't hard redirect - let auth context handle routing
      throw new Error("Authentication required");
    }
    throw error
  }
}

export const getLowStockProducts = async () => {
  try {
    const res = await makeAuthenticatedRequest(`${API_BASE}/analytics/low-stock-products`)
    return res.json()
  } catch (error) {
    if (error.message === "Authentication failed") {
      // Don't hard redirect - let auth context handle routing
      throw new Error("Authentication required");
    }
    throw error
  }
}

export const getMonthlyRevenue = async () => {
  try {
    const res = await makeAuthenticatedRequest(`${API_BASE}/analytics/monthly-revenue`)
    return res.json()
  } catch (error) {
    if (error.message === "Authentication failed") {
      // Don't hard redirect - let auth context handle routing
      throw new Error("Authentication required");
    }
    throw error
  }
}

export const getCategorySales = async () => {
  try {
    const res = await makeAuthenticatedRequest(`${API_BASE}/analytics/category-sales`)
    return res.json()
  } catch (error) {
    if (error.message === "Authentication failed") {
      // Don't hard redirect - let auth context handle routing
      throw new Error("Authentication required");
    }
    throw error
  }
}

export const getOrders = async () => {
  try {
    const res = await makeAuthenticatedRequest(`${API_BASE}/orders/`)
    return res.json()
  } catch (error) {
    if (error.message === "Authentication failed") {
      // Don't hard redirect - let auth context handle routing
      throw new Error("Authentication required");
    }
    throw error
  }
} 

export const verifyEmail = async (token) => {
  try {
    const res = await fetch(`${API_BASE}/auth/verify-email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ token })
    })

    const data = await res.json()

    if (res.ok) {
      return { success: true, data }
    } else {
      return { success: false, error: data.detail || 'Email verification failed' }
    }
  } catch (error) {
    console.error("Email verification error:", error)
    return { success: false, error: 'Network error occurred' }
  }
}

export const resendVerificationEmail = async (email) => {
  try {
    const res = await fetch(`${API_BASE}/auth/resend-verification`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email })
    })

    const data = await res.json()

    if (res.ok) {
      return { success: true, data }
    } else {
      return { success: false, error: data.detail || 'Failed to resend verification email' }
    }
  } catch (error) {
    console.error("Resend verification error:", error)
    return { success: false, error: 'Network error occurred' }
  }
}

export const requestPasswordReset = async (email) => {
  try {
    const res = await fetch(`${API_BASE}/auth/request-password-reset`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email })
    })

    const data = await res.json()

    if (res.ok) {
      return { success: true, data }
    } else {
      return { success: false, error: data.detail || 'Failed to send password reset email' }
    }
  } catch (error) {
    console.error("Password reset request error:", error)
    return { success: false, error: 'Network error occurred' }
  }
}

export const resetPassword = async (token, newPassword) => {
  try {
    const res = await fetch(`${API_BASE}/auth/reset-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ token, new_password: newPassword })
    })

    const data = await res.json()

    if (res.ok) {
      return { success: true, data }
    } else {
      return { success: false, error: data.detail || 'Failed to reset password' }
    }
  } catch (error) {
    console.error("Password reset error:", error)
    return { success: false, error: 'Network error occurred' }
  }
} 


