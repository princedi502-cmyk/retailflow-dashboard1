import React, { createContext, useContext, useState, useEffect } from "react";
import {
  generateId,
  isLowStock,
  calculateCartTotal,
} from "../utils/helpers";
import { getProducts } from "../services/api";

const AppContext = createContext();

const BASE_URL = "http://127.0.0.1:8000";

// Helper — all authenticated API calls go through here.
// Automatically attaches the token and redirects to /login on 401/403.
const apiFetch = async (url, options = {}) => {
  const token = sessionStorage.getItem("retailflow_token");
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });

  if (res.status === 401 || res.status === 403) {
    localStorage.removeItem("retailflow_token");
    window.location.href = "/login";
    return null;
  }

  return res;
};

export function AppProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [sales, setSales] = useState([]);
  const [sessionId] = useState(generateId);

  // ============================================================
  // LOAD PRODUCTS FROM SERVER ON MOUNT
  // ============================================================

  useEffect(() => {
    const loadProducts = async () => {
      // Only load products if user is authenticated
      const token = sessionStorage.getItem("retailflow_token");
      if (!token) {
        console.log("No authentication token - skipping product load");
        return;
      }
      
      try {
        const data = await getProducts();
        setProducts(data);
      } catch (err) {
        console.error("Failed to load products:", err);
      }
    };
    loadProducts();
  }, []);

  // ============================================================
  // PRODUCT MANAGEMENT — all wired to the real API
  // ============================================================

  const addProduct = async (productData) => {
    // productData already has the correct shape from ProductModal:
    // { name, price, stock, category, barcode, low_stock_threshold }
    const res = await apiFetch(`${BASE_URL}/products/`, {
      method: "POST",
      body: JSON.stringify(productData),
    });

    if (!res) return; // redirected to login

    if (!res.ok) {
      const err = await res.json();
      console.error("Add product failed:", err);
      throw new Error(err.detail || "Failed to add product");
    }

    const newProduct = await res.json();
    setProducts((prev) => [...prev, newProduct]);
    return newProduct;
  };

  const updateProduct = async (id, updates) => {
    // updates has the same shape as ProductCreate
    const res = await apiFetch(`${BASE_URL}/products/${id}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    });

    if (!res) return;

    if (!res.ok) {
      const err = await res.json();
      console.error("Update product failed:", err);
      throw new Error(err.detail || "Failed to update product");
    }

    const updated = await res.json();
    setProducts((prev) => prev.map((p) => (p.id === id ? updated : p)));
    return updated;
  };

  const deleteProduct = async (id) => {
    const res = await apiFetch(`${BASE_URL}/products/${id}`, {
      method: "DELETE",
    });

    if (!res) return;

    if (!res.ok) {
      const err = await res.json();
      console.error("Delete product failed:", err);
      throw new Error(err.detail || "Failed to delete product");
    }

    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  // ============================================================
  // CART MANAGEMENT (local state only — no API needed)
  // ============================================================

  const addToCart = (productId, quantity) => {
    const product = products.find((p) => p.id === productId);
    if (!product) throw new Error("Product not found");

    setCart((prev) => {
      const existing = prev.find((item) => item.productId === productId);
      if (existing) {
        return prev.map((item) =>
          item.productId === productId
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [
        ...prev,
        {
          productId: product.id,
          productName: product.name,
          barcode: product.barcode,
          price: product.price,
          quantity,
          availableStock: product.stock,  // FIX: was product.quantity
        },
      ];
    });
  };

  const updateCartItem = (productId, quantity) => {
    const product = products.find((p) => p.id === productId);
    if (quantity < 1) throw new Error("Quantity must be at least 1");
    if (quantity > product.stock)   // FIX: was product.quantity
      throw new Error(`Only ${product.stock} items available in stock`);

    setCart((prev) =>
      prev.map((item) =>
        item.productId === productId ? { ...item, quantity } : item
      )
    );
  };

  const removeFromCart = (productId) => {
    setCart((prev) => prev.filter((item) => item.productId !== productId));
  };

  const clearCart = () => setCart([]);

  // ============================================================
  // SALES
  // ============================================================

  const confirmSale = (generatedBy = "employee") => {
    if (cart.length === 0) throw new Error("Cart is empty");

    for (const item of cart) {
      const product = products.find((p) => p.id === item.productId);
      if (!product) throw new Error(`Product ${item.productName} no longer exists`);
      if (item.quantity > product.stock)   // FIX: was product.quantity
        throw new Error(`Insufficient stock for ${item.productName}. Only ${product.stock} available.`);
    }

    const sale = {
      saleId: generateId(),
      dateTime: new Date().toISOString(),
      items: cart.map((item) => ({
        productId: item.productId,
        productName: item.productName,
        price: item.price,
        quantity: item.quantity,
        total: item.price * item.quantity,
      })),
      subtotal: calculateCartTotal(cart),
      total: calculateCartTotal(cart),
      generatedBy,
      sessionId,
    };

    // Deduct stock locally
    setProducts((prev) =>
      prev.map((product) => {
        const cartItem = cart.find((item) => item.productId === product.id);
        if (cartItem) {
          return {
            ...product,
            stock: product.stock - cartItem.quantity,  // FIX: was product.quantity
            updatedAt: new Date().toISOString(),
          };
        }
        return product;
      })
    );

    setSales((prev) => [...prev, sale]);
    setCart([]);
    return sale;
  };

  const getSales = (role) => {
    if (role === "owner") return sales;
    return sales.filter((sale) => sale.sessionId === sessionId);
  };

  const getLowStockProducts = () => {
    if (!Array.isArray(products)) return [];
    return products.filter(isLowStock);
  };

  const value = {
    products,
    cart,
    sales,
    addProduct,
    updateProduct,
    deleteProduct,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    confirmSale,
    getSales,
    getLowStockProducts,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) throw new Error("useAppContext must be used within AppProvider");
  return context;
}