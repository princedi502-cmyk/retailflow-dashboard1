import React, { useState, useEffect, useMemo, Suspense } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import KPICard from "../components/KPICard";
import DataTable from "../components/DataTable";
import ProductModal from "../components/ProductModal";
import RealTimeNotification from "../components/RealTimeNotification";
import WebSocketStatus from "../components/WebSocketStatus";
import { useAppContext } from "../context/AppContext";
import { formatCurrency, isLowStock } from "../utils/helpers";
import { getProducts, createProduct, updateProduct, deleteProduct, getThisMonthAnalytics, getAnalytics, getWorstProducts, getLowStockProducts, getMonthlyRevenue, getCategorySales } from "../services/api";
import { lazyWithTracking } from "../utils/performance";
import websocketService from '../services/websocket';

// Lazy loaded chart components with performance tracking
const ChartCard = lazyWithTracking(() => import("../components/ChartCard"), 'chart-card');
const LineChart = lazyWithTracking(() => import("../components/LineChart"), 'line-chart');
const DoughnutChart = lazyWithTracking(() => import("../components/DoughnutChart"), 'doughnut-chart');

// Loading component for charts
const ChartLoader = () => (
  <div className="flex items-center justify-center h-64">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
  </div>
);

const BASE_URL = "http://127.0.0.1:8000";

const OwnerDashboard = () => {
  const { addProduct, updateProduct, deleteProduct } = useAppContext();

  const [products, setProducts] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [worstSellers, setWorstSellers] = useState([]);
  const [lowStockItems, setLowStockItems] = useState([]);

  const [revenue, setRevenue] = useState(0);
  const [itemsSold, setItemsSold] = useState(0);

  const [monthlyRevenue, setMonthlyRevenue] = useState([]);
  const [categorySales, setCategorySales] = useState({ labels: [], values: [] });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [modalMode, setModalMode] = useState("add");
  const [wsConnected, setWsConnected] = useState(false);
  const [notification, setNotification] = useState({ message: '', type: 'info' });

  const loadProducts = async () => {
    try {
      const data = await getProducts();
      setProducts(data);
    } catch (err) {
      console.error("Products fetch error:", err);
    }
  };

  // =============================
  // LOAD ANALYTICS
  // =============================

  const loadAnalytics = async () => {
    try {
      const [
        thisMonthData,
        bestData,
        worstData,
        lowStockData,
        revenueData,
        categoryData,
      ] = await Promise.all([
        getThisMonthAnalytics(),
        getAnalytics(),
        getWorstProducts(),
        getLowStockProducts(),
        getMonthlyRevenue(),
        getCategorySales(),
      ]);

      setRevenue(thisMonthData.total_revenue ?? 0);
      setItemsSold(thisMonthData.items_sold ?? 0);

      setBestSellers(
        bestData.map((item, i) => ({
          id: i + 1,
          name: item.name,
          category: item.category || "N/A",
          unitsSold: item.unitsSold,
          revenue: item.revenue ?? 0,
          stock: item.stock,
        }))
      );

      setWorstSellers(
        worstData.map((item, i) => ({
          id: i + 1,
          name: item.name,
          category: item.category || "N/A",
          unitsSold: item.unitsSold,
          revenue: item.revenue ?? 0,
          stock: item.stock,
        }))
      );

      setLowStockItems(
        lowStockData.map((item, i) => ({
          id: i + 1,
          name: item.name,
          category: item.category || "N/A",
          stock: item.stock,
          reorderLevel: item.low_stock_threshold ?? 10,
        }))
      );

      setMonthlyRevenue(revenueData.values ?? []);
      setCategorySales({
        labels: categoryData.labels ?? [],
        values: categoryData.values ?? [],
      });
    } catch (err) {
      console.error("Analytics error:", err);
    }
  };

  useEffect(() => {
    loadProducts();
    loadAnalytics();
  }, []);

  // WebSocket connection effect
  useEffect(() => {
    const token = sessionStorage.getItem("retailflow_token");
    
    console.log('Owner Dashboard WebSocket effect running, token exists:', !!token);
    
    if (token) {
      // Connect to WebSocket
      websocketService.connect(token)
        .then(() => {
          console.log('Owner Dashboard WebSocket connected successfully');
          setWsConnected(true);
        })
        .catch((error) => {
          console.error('Owner Dashboard failed to connect WebSocket:', error);
          setWsConnected(false);
          // Fallback: set up periodic polling if WebSocket fails
          const pollInterval = setInterval(() => {
            console.log('Owner Dashboard polling analytics data as WebSocket fallback');
            loadAnalytics();
          }, 30000); // Poll every 30 seconds
          
          return () => clearInterval(pollInterval);
        });

      // Set up event listeners
      const handleSalesUpdate = (data) => {
        console.log('Owner Dashboard received comprehensive sales update:', data);
        
        // Show notification
        setNotification({
          message: `Sales data updated! Revenue: ₹${data.this_month_revenue?.toFixed(2) || '0'}, Items sold: ${data.this_month_items_sold || '0'}`,
          type: 'success'
        });
        
        // Update basic metrics if available
        if (data.this_month_revenue !== undefined) {
          setRevenue(data.this_month_revenue);
        }
        if (data.this_month_items_sold !== undefined) {
          setItemsSold(data.this_month_items_sold);
        }
        
        // Update chart data if available
        if (data.monthly_revenue && Array.isArray(data.monthly_revenue)) {
          setMonthlyRevenue(data.monthly_revenue);
        }
        
        if (data.category_sales) {
          setCategorySales({
            labels: data.category_sales.labels || [],
            values: data.category_sales.values || [],
          });
        }
        
        // Refresh all analytics to ensure consistency
        loadAnalytics();
      };

      const handleOrderCreated = (data) => {
        console.log('Owner Dashboard received order created notification:', data);
        
        // Show notification
        setNotification({
          message: `New order created! ₹${data.total_price?.toFixed(2) || '0'} - ${data.items_count || 0} items`,
          type: 'success'
        });
        
        // Refresh all analytics when new order is created
        loadAnalytics();
      };

      websocketService.on('sales_update', handleSalesUpdate);
      websocketService.on('order_created', handleOrderCreated);

      // Cleanup on unmount
      return () => {
        console.log('Owner Dashboard cleaning up WebSocket connection');
        websocketService.off('sales_update', handleSalesUpdate);
        websocketService.off('order_created', handleOrderCreated);
        websocketService.disconnect();
        setWsConnected(false);
      };
    } else {
      console.log('Owner Dashboard no token found, WebSocket not connecting');
    }
  }, [])

  // Listen for custom KPI update events from BillingCart (for immediate updates)
  useEffect(() => {
    const handleKpiUpdate = (event) => {
      console.log('Owner Dashboard received KPI update event:', event.detail);
      // Refresh analytics to get the latest data
      loadAnalytics();
    };

    window.addEventListener('kpiUpdate', handleKpiUpdate);
    
    return () => {
      window.removeEventListener('kpiUpdate', handleKpiUpdate);
    };
  }, [])

  // =============================
  // INVENTORY HEALTH
  // =============================

  const inventoryHealth = useMemo(() => {
    if (!products.length) return 0;
    const healthy = products.filter((p) => (p.stock ?? 0) >= 10).length;
    return Math.round((healthy / products.length) * 100);
  }, [products]);

  // =============================
  // PRODUCT ACTIONS
  // =============================

  const handleAddProduct = () => {
    setModalMode("add");
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const handleEditProduct = (product) => {
    setModalMode("edit");
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleSaveProduct = async (formData) => {
    console.log("Sending product:", formData);

    try {
      if (modalMode === "add") {
        await createProduct(formData);
      } else {
        await updateProduct(editingProduct.id, formData);
      }

      setIsModalOpen(false);
      loadProducts();  // refresh table

    } catch (err) {
      console.error("Save product error:", err);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm("Delete this product?")) return;

    try {
      await deleteProduct(id);
      loadProducts();
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  // =============================
  // TABLE COLUMNS
  // =============================

  const productColumns = [
    { label: "#", key: "id" },
    { label: "Product", key: "name" },
    { label: "Category", key: "category" },
    { label: "Units Sold", key: "unitsSold" },
    { label: "Revenue", key: "revenue", render: (v) => formatCurrency(v ?? 0) },
    { label: "Stock", key: "stock" },
  ];

  const lowStockColumns = [
    { label: "#", key: "id" },
    { label: "Product", key: "name" },
    { label: "Category", key: "category" },
    {
      label: "Stock",
      key: "stock",
      render: (v, row) => (
        <span className={isLowStock(row) ? "text-danger-600 font-semibold" : ""}>
          {v}{isLowStock(row) && " ⚠️"}
        </span>
      ),
    },
    { label: "Reorder Level", key: "reorderLevel" },
  ];

  const inventoryColumns = [
    { label: "Product", key: "name" },
    { label: "Category", key: "category" },
    { label: "Price", key: "price", render: (v) => formatCurrency(v ?? 0) },
    {
      label: "Stock",
      key: "stock",
      render: (v, row) => (
        <span className={isLowStock(row) ? "text-danger-600 font-semibold" : ""}>
          {v}{isLowStock(row) && " ⚠️"}
        </span>
      ),
    },
    {
      label: "Actions",
      key: "id",
      render: (id, row) => (
        <div className="flex gap-2">
          <button onClick={() => handleEditProduct(row)} className="text-primary-600">Edit</button>
          <button onClick={() => handleDeleteProduct(id)} className="text-danger-600">Delete</button>
        </div>
      ),
    },
  ];

  return (
    <DashboardLayout role="owner" pageTitle="Owner Dashboard">
      
      {/* Real-time Notification */}
      <RealTimeNotification 
        message={notification.message} 
        type={notification.type} 
      />

      {/* KPI */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <KPICard title="This Month Revenue" value={revenue} icon="💰" prefix="₹" subtitle={wsConnected ? "🟢 Live" : "🔴 Offline"} />
        <KPICard title="Items Sold" value={itemsSold} icon="📦" subtitle={wsConnected ? "🟢 Live" : "🔴 Offline"} />
        <KPICard title="Low Stock Products" value={lowStockItems.length} icon="⚠️" subtitle={wsConnected ? "🟢 Live" : "🔴 Offline"} />
        <KPICard title="Inventory Health" value={inventoryHealth} suffix="%" icon="📊" subtitle={wsConnected ? "🟢 Live" : "🔴 Offline"} />
      </div>

      {/* CHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
        <Suspense fallback={<ChartLoader />}>
          <ChartCard title="Monthly Revenue">
            <LineChart
              data={monthlyRevenue}
              labels={["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]}
            />
          </ChartCard>
        </Suspense>
        <Suspense fallback={<ChartLoader />}>
          <ChartCard title="Category Sales">
            <DoughnutChart data={categorySales.values} labels={categorySales.labels} />
          </ChartCard>
        </Suspense>
      </div>

      {/* INVENTORY */}
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-lg font-semibold">Product Inventory</h2>
        <button
          onClick={handleAddProduct}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Add Product
        </button>
      </div>

      <DataTable columns={inventoryColumns} data={products} />

      {/* INSIGHTS */}
      <DataTable title="Top 5 Best Sellers" columns={productColumns} data={bestSellers} />
      <DataTable title="Top 5 Worst Sellers" columns={productColumns} data={worstSellers} />
      <DataTable title="Low Stock Products" columns={lowStockColumns} data={lowStockItems} />

      <ProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveProduct}
        product={editingProduct}
        mode={modalMode}
      />

      {/* WebSocket Status Indicator */}
      <WebSocketStatus connected={wsConnected} userRole="Owner" />

    </DashboardLayout>
  );
};

export default OwnerDashboard;