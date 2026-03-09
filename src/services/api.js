const API_BASE = "http://127.0.0.1:8000"

const getToken = () => {
  return localStorage.getItem("retailflow_token")
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

  if (data.access_token) {
    localStorage.setItem("retailflow_token", data.access_token)
  }

  return data
}

export async function getProducts() {
  const token = localStorage.getItem("retailflow_token");

  const response = await fetch("http://127.0.0.1:8000/products/", {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!response.ok) {
    throw new Error("Failed to fetch products");
  }

  return response.json();
}

export const createProduct = async (product, token) => {
  const res = await fetch(`${API_BASE}/products/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(product)
  })

  return res.json()
}

export const createOrder = async (order) => {

  const token = localStorage.getItem("retailflow_token")

  const res = await fetch(`${API_BASE}/orders/`, {

    method: "POST",

    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },

    body: JSON.stringify(order)

  })

  return res.json()
}


export const getAnalytics = async () => {

  const token = localStorage.getItem("retailflow_token")

  const res = await fetch(`${API_BASE}/analytics/top-products`, {

    headers: {
      Authorization: `Bearer ${token}`
    }

  })

  return res.json()
}

export const getOrders = async () => {
  const token = localStorage.getItem("retailflow_token")

  const res = await fetch(`${API_BASE}/orders/`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })

  return res.json()
} 


