import React, { useState, useMemo, useEffect, Suspense } from 'react'; // Added useEffect
import DashboardLayout from '../layouts/DashboardLayout';
import KPICard from '../components/KPICard';
import DataTable from '../components/DataTable';
import ProductSelector from '../components/ProductSelector';
import WebSocketStatus from '../components/WebSocketStatus';
import { useAppContext } from '../context/AppContext';
import { isToday, isThisWeek } from '../utils/helpers';
import { getProducts,getAnalytics } from "../services/api"; // Added API import
import { Html5Qrcode } from "html5-qrcode";
import { lazyWithTracking } from "../utils/performance";
import websocketService from '../services/websocket';

// Lazy loaded billing component with performance tracking
const BillingCart = lazyWithTracking(() => import('../components/BillingCart'), 'billing-cart');

// Loading component for billing cart
const BillingLoader = () => (
  <div className="flex items-center justify-center h-64">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
  </div>
);

const EmployeeDashboard = () => {
  // Removed 'products' from useAppContext as it now comes from the backend
  const { getSales, getLowStockProducts } = useAppContext();
  
  // 1. Add local state for products
  const [products, setProducts] = useState([]);
  const [showBilling, setShowBilling] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [bestSellers, setBestSellers] = useState([])
  const [worstSellers, setWorstSellers] = useState([])
  const [kpiData, setKpiData] = useState({
  soldToday: 0,
  soldWeek: 0
})
  const [showScanner, setShowScanner] = useState(false)
  const [scanner, setScanner] = useState(null)

const [lowStockProducts, setLowStockProducts] = useState([])
  const [wsConnected, setWsConnected] = useState(false)
  
  const columns = [
  { field: "id", headerName: "ID", width: 90 },
  { field: "name", headerName: "Product", flex: 1 },
  { field: "unitsSold", headerName: "Units Sold", flex: 1 },
  // { field: "stock", headerName: "Stock", flex: 1}
]

  // 2. Fetch products from Backend on mount
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const token = sessionStorage.getItem("retailflow_token");
        const data = await getProducts(token);
        setProducts(data);
      } catch (err) {
        console.error("Failed to fetch products:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

useEffect(() => {
  if (!showScanner) return

  const html5QrCode = new Html5Qrcode("reader")
  setScanner(html5QrCode)

  const config = {
    fps: 10,
    qrbox: { width: 250, height: 120 }
  }

  html5QrCode.start(
    { facingMode: "environment" },
    config,
    (decodedText) => {
      console.log("Scanned:", decodedText)

      const product = products.find(
        (p) => p.barcode === decodedText
      )

      if (product) {
        alert(`Product Found: ${product.name}`)
        // TODO connect to cart
      } else {
        alert("Product not found")
      }
    },
    (error) => {}
  )

  return () => {
    html5QrCode.stop().then(() => {
      html5QrCode.clear()
    })
  }
}, [showScanner, products])



  useEffect(() => {
  if (products.length > 0) {
    loadAnalytics()
  }
}, [products])

const loadAnalytics = async () => {
  try {

    const token = sessionStorage.getItem("retailflow_token")

    const bestRes = await fetch("http://127.0.0.1:8000/analytics/top-products", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    const worstRes = await fetch("http://127.0.0.1:8000/analytics/worst-products", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    if (!bestRes.ok || !worstRes.ok) {
      throw new Error("Analytics request failed")
    }

    const bestData = await bestRes.json()
    const worstData = await worstRes.json()

  const bestMapped = bestData.map((item, index) => ({
  id: index + 1,
  name: item.name,
  unitsSold: item.unitsSold,
  category: item.category || "N/A",
  stock: Array.isArray(item.stock) ? item.stock[0] : item.stock
}))

const worstMapped = worstData.map((item, index) => ({
  id: index + 1,
  name: item.name,
  unitsSold: item.unitsSold,
  category: item.category || "N/A",
  stock: Array.isArray(item.stock) ? item.stock[0] : item.stock
}))

    setBestSellers(bestMapped)
    setWorstSellers(worstMapped)

  } catch (err) {
    console.error("Analytics error:", err)
  }
}

  const sessionSales = getSales('employee');

  const metrics = useMemo(() => {
    const soldToday = sessionSales
      .filter(sale => isToday(sale.dateTime))
      .reduce((sum, sale) => {
        return sum + sale.items.reduce((s, item) => s + item.quantity, 0);
      }, 0);

    const soldWeek = sessionSales
      .filter(sale => isThisWeek(sale.dateTime))
      .reduce((sum, sale) => {
        return sum + sale.items.reduce((s, item) => s + item.quantity, 0);
      }, 0);

    // Note: getLowStockProducts might still use context data. 
    // If it breaks, you can calculate this filter directly from the 'products' state above.
    const lowStockCount = getLowStockProducts().length;

    return { soldToday, soldWeek, lowStockCount };
  }, [sessionSales, getLowStockProducts]);

  // const { bestSellers, worstSellers } = useMemo(() => {
  //   const productSales = {};
    
  //   sessionSales.forEach(sale => {
  //     sale.items.forEach(item => {
  //       if (!productSales[item.productId]) {
  //         productSales[item.productId] = {
  //           name: item.productName,
  //           quantity: 0
  //         };
  //       }
  //       productSales[item.productId].quantity += item.quantity;
  //     });
  //   });

  //   const salesArray = Object.entries(productSales).map(([id, data]) => {
  //     const product = products.find(p => p.id === id || p._id === id); // Handle MongoDB _id
  //     return {
  //       id,
  //       name: data.name,
  //       category: product?.category || 'N/A',
  //       unitsSold: data.quantity,
  //       stock: product?.quantity || 0
  //     };
  //   });

  //   salesArray.sort((a, b) => b.unitsSold - a.unitsSold);

  //   return {
  //     bestSellers: salesArray.slice(0, 5).map((item, index) => ({ ...item, id: index + 1 })),
  //     worstSellers: salesArray.slice(-5).reverse().map((item, index) => ({ ...item, id: index + 1 }))
  //   };
  // }, [products, sessionSales]);
const loadKPIs = async () => {
  try {

    const token = sessionStorage.getItem("retailflow_token")

    const res = await fetch("http://127.0.0.1:8000/analytics/sales-summary", {
      headers: { Authorization: `Bearer ${token}` }
    })

    const data = await res.json()

    setKpiData({
      soldToday: data.items_sold_today,
      soldWeek: data.items_sold_week
    })

  } catch (err) {
    console.error("KPI error:", err)
  }
}
const loadLowStock = async () => {
  try {

    const token = sessionStorage.getItem("retailflow_token")

    const res = await fetch("http://127.0.0.1:8000/analytics/low-stock-products", {
      headers: { Authorization: `Bearer ${token}` }
    })

    const data = await res.json()

    setLowStockProducts(data)

  } catch (err) {
    console.error("Low stock error:", err)
  }
}

useEffect(() => {
  loadKPIs()
  loadLowStock()
}, [])

// WebSocket connection effect
useEffect(() => {
  const token = sessionStorage.getItem("retailflow_token");
  
  console.log('WebSocket effect running, token exists:', !!token);
  
  if (token) {
    // Connect to WebSocket
    websocketService.connect(token)
      .then(() => {
        console.log('WebSocket connected successfully');
        setWsConnected(true);
      })
      .catch((error) => {
        console.error('Failed to connect WebSocket:', error);
        setWsConnected(false);
        // Fallback: set up periodic polling if WebSocket fails
        const pollInterval = setInterval(() => {
          console.log('Polling KPI data as WebSocket fallback');
          loadKPIs();
        }, 30000); // Poll every 30 seconds
        
        return () => clearInterval(pollInterval);
      });

    // Set up event listeners
    const handleSalesUpdate = (data) => {
      console.log('Received sales update:', data);
      setKpiData({
        soldToday: data.items_sold_today,
        soldWeek: data.items_sold_week
      });
    };

    const handleOrderCreated = (data) => {
      console.log('Received order created notification:', data);
      // Optionally show a notification or refresh other data
      loadKPIs(); // Refresh KPIs to ensure consistency
    };

    websocketService.on('sales_update', handleSalesUpdate);
    websocketService.on('order_created', handleOrderCreated);

    // Cleanup on unmount
    return () => {
      console.log('Cleaning up WebSocket connection');
      websocketService.off('sales_update', handleSalesUpdate);
      websocketService.off('order_created', handleOrderCreated);
      websocketService.disconnect();
      setWsConnected(false);
    };
  } else {
    console.log('No token found, WebSocket not connecting');
  }
}, [])

// Listen for custom KPI update events from BillingCart
useEffect(() => {
  const handleKpiUpdate = (event) => {
    console.log('Received KPI update event:', event.detail);
    setKpiData({
      soldToday: event.detail.soldToday,
      soldWeek: event.detail.soldWeek
    });
  };

  window.addEventListener('kpiUpdate', handleKpiUpdate);
  
  return () => {
    window.removeEventListener('kpiUpdate', handleKpiUpdate);
  };
}, [])
  const productColumns = [
    { label: "#", key: "id" },
  { label: "Product Name", key: "name" },
  { label: "Category", key: "category" },
  { label: "Units Sold", key: "unitsSold" },
  { label: "Stock", key: "stock" }
  ];

  const handleSaleComplete = () => {
    setShowBilling(false);
    // WebSocket will automatically update the KPIs, but we can also refresh products
    // and KPIs immediately to ensure updates
    const refreshData = async () => {
      try {
        const token = sessionStorage.getItem("retailflow_token");
        
        // Refresh products to update stock levels
        const productData = await getProducts(token);
        setProducts(productData);
        
        // Also refresh KPIs as backup
        await loadKPIs();
        
        console.log('Data refreshed after sale completion');
      } catch (err) {
        console.error("Failed to refresh data after sale:", err);
      }
    };
    
    refreshData();
  };

  return (
    <DashboardLayout role="employee" pageTitle="Employee Dashboard">
 <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">

  <KPICard
    title="Items Sold Today"
    value={kpiData.soldToday}
    icon="📦"
    subtitle={wsConnected ? "🟢 Live" : "🔴 Offline"}
  />

  <KPICard
    title="Items Sold This Week"
    value={kpiData.soldWeek}
    icon="📊"
    subtitle={wsConnected ? "🟢 Live" : "🔴 Offline"}
  />

  <KPICard
    title="Low Stock Alerts"
    value={lowStockProducts.length}
    icon="⚠️"
  />

</div>

<div className="flex flex-wrap gap-4 mb-10">
  <button
    onClick={() => setShowBilling(!showBilling)}
    className="btn btn-primary"
  >
    <span className="mr-2">{showBilling ? "📊" : "➕"}</span>
    {showBilling ? "Hide Billing" : "Create Bill"}
  </button>

  {showBilling && (
    <button
      onClick={() => setShowScanner(!showScanner)}
      className="btn btn-secondary bg-indigo-600 text-white"
    >
      <span className="mr-2">📷</span>
      {showScanner ? "Close Scanner" : "Scan Barcode"}
    </button>
  )}
</div>
{showBilling && (
  <div className="space-y-6 mb-10">

    {showScanner && (
      <div className="card p-4 bg-white shadow-md max-w-md mx-auto">
        <div id="reader"></div>
        <p className="text-center text-sm text-gray-500 mt-2">
          Align barcode inside the box
        </p>
      </div>
    )}

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <ProductSelector products={products} />
      <Suspense fallback={<BillingLoader />}>
        <BillingCart onSaleComplete={handleSaleComplete} />
      </Suspense>
    </div>

  </div>
)}
      {/* <div className="flex flex-wrap gap-4 mb-10">
        <button onClick={() => setShowBilling(!showBilling)} className="btn btn-primary">
          <span className="mr-2">{showBilling ? '📊' : '➕'}</span>
          {showBilling ? 'Hide Billing' : 'Create Bill'}
        </button>
        <button className="btn btn-secondary">
          <span className="mr-2">📝</span>
          Request Stock Update
        </button>
      </div> */}
      
      {/* {showBilling && ( */}
        {/* // <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10"> */}
          {/* Ensure these components also receive the new products if they don't use context */}
          {/* <ProductSelector products={products} />  */}
          {/* // <BillingCart onSaleComplete={handleSaleComplete} /> */}
        {/* </div> */}
      {/* )} */}
      

      <div className="space-y-6">
        {isLoading ? (
          <div className="text-center py-10">Loading products...</div>
        ) : (
          <>
            {bestSellers.length > 0 ? (
              <DataTable
                title="Top 5 Best-Selling Products (Your Session)"
                columns={productColumns}
                data={bestSellers}
              />
            ) : (
              <div className="card p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Top 5 Best-Selling Products</h3>
                <p className="text-gray-500 text-center py-8">No sales recorded yet</p>
              </div>
            )}
            
            {worstSellers.length > 0 && (
              <DataTable
                title="Top 5 Worst-Selling Products (Your Session)"
                columns={productColumns}
                data={worstSellers}
              />
            )}
             <DataTable
        title="Low Stock Products"
        columns={[
          { label: "Product", key: "name" },
          { label: "Category", key: "category" },
          { label: "Stock Left", key: "stock" }
        ]}
        data={lowStockProducts}
      />
          </>
        )}
      </div>
      
      {/* WebSocket Status Indicator */}
      <WebSocketStatus connected={wsConnected} userRole="Employee" />
    </DashboardLayout>
  );
};

export default EmployeeDashboard;
