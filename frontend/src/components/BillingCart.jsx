import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { formatCurrency, calculateCartTotal } from '../utils/helpers';
import { createOrder, getProducts } from "../services/api"; // 1. Import the API service

const BillingCart = ({ onSaleComplete }) => {
  // Added 'cart' and 'clearCart' from context
  const { cart, updateCartItem, removeFromCart, clearCart } = useAppContext();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleQuantityChange = (productId, newQuantity) => {
    if (newQuantity < 1) return;
    try {
      updateCartItem(productId, newQuantity);
    } catch (error) {
      alert(error.message);
    }
  };

  // 2. Updated to use the new Async Backend logic
  const handleConfirmSale = async () => {
    if (cart.length === 0) {
      alert('Cart is empty');
      return;
    }

    if (!window.confirm('Confirm this sale?')) {
      return;
    }

    setIsProcessing(true);
    try {
      const token = sessionStorage.getItem("retailflow_token")

      // 3. Map local cart items to the format the backend expects (barcode + quantity)
      const order = {
        items: cart.map(item => ({
          barcode: item.barcode, // Ensure your context products have a barcode field
          quantity: item.quantity
        }))
      };

      const result = await createOrder(order, token);

      if (result) {
        alert(`Sale completed successfully!`);
        clearCart(); // Clear local UI cart after successful DB entry
        
        await getProducts() 

        // Force immediate refresh of KPI data
        try {
          const kpiResponse = await fetch("http://127.0.0.1:8000/analytics/sales-summary", {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          if (kpiResponse.ok) {
            const kpiData = await kpiResponse.json();
            console.log('KPI data refreshed:', kpiData);
            // Emit a custom event to notify the dashboard
            window.dispatchEvent(new CustomEvent('kpiUpdate', { 
              detail: {
                soldToday: kpiData.items_sold_today,
                soldWeek: kpiData.items_sold_week
              }
            }));
          }
        } catch (err) {
          console.error('Failed to refresh KPI data:', err);
        }

        if (onSaleComplete) {
          onSaleComplete(result);
        }
      }
    } catch (error) {
      console.error("Order error:", error);
      alert(`Sale failed: ${error.response?.data?.message || error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClearCart = () => {
    if (window.confirm('Clear all items from cart?')) {
      clearCart();
    }
  };

  const total = calculateCartTotal(cart);

  return (
    <div className="card p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-5">Billing Cart</h3>

      {cart.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg mb-2">🛒 Cart is empty</p>
          <p className="text-sm">Add products to create a bill</p>
        </div>
      ) : (
        <>
          {/* Cart Items List */}
          <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
            {cart.map(item => (
              <div
                key={item.productId}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{item.productName}</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    {formatCurrency(item.price)} × {item.quantity} = {formatCurrency(item.price * item.quantity)}
                  </p>
                </div>
                
                <div className="flex items-center gap-2">
                  <div className="flex items-center border border-gray-300 rounded">
                    <button
                      onClick={() => handleQuantityChange(item.productId, item.quantity - 1)}
                      className="px-2 py-1 hover:bg-gray-100"
                      disabled={item.quantity <= 1 || isProcessing}
                    >
                      −
                    </button>
                    <span className="px-3 py-1 min-w-[3rem] text-center font-medium">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => handleQuantityChange(item.productId, item.quantity + 1)}
                      className="px-2 py-1 hover:bg-gray-100"
                      disabled={item.quantity >= item.availableStock || isProcessing}
                    >
                      +
                    </button>
                  </div>
                  
                  <button
                    onClick={() => removeFromCart(item.productId)}
                    className="text-danger-600 hover:text-danger-700 px-2"
                    title="Remove item"
                    disabled={isProcessing}
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Total Calculation */}
          <div className="border-t border-gray-200 pt-4 mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">Subtotal:</span>
              <span className="text-sm font-medium">{formatCurrency(total)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold text-gray-900">Total:</span>
              <span className="text-2xl font-bold text-primary-600">{formatCurrency(total)}</span>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleClearCart}
              className="btn btn-outline flex-1"
              disabled={isProcessing}
            >
              Clear Cart
            </button>
            <button
              onClick={handleConfirmSale}
              className="btn btn-primary flex-1"
              disabled={isProcessing}
            >
              {isProcessing ? 'Processing...' : 'Confirm Sale'}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default BillingCart;
