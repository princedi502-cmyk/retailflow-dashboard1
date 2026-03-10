import React, { useState, useEffect, useMemo } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import KPICard from "../components/KPICard";
import DataTable from "../components/DataTable";
import ChartCard from "../components/ChartCard";
import LineChart from "../components/LineChart";
import DoughnutChart from "../components/DoughnutChart";
import ProductModal from "../components/ProductModal";
import { useAppContext } from "../context/AppContext";
import { formatCurrency, isLowStock } from "../utils/helpers";

const BASE_URL = "http://127.0.0.1:8000";

const OwnerDashboard = () => {
  const { addProduct, updateProduct, deleteProduct } = useAppContext();

  const [products, setProducts] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [worstSellers, setWorstSellers] = useState([]);
  const [lowStockItems, setLowStockItems] = useState([]);

  // FIX: Separate revenue and itemsSold, driven from /analytics/this-month
  const [revenue, setRevenue] = useState(0);
  const [itemsSold, setItemsSold] = useState(0);

  const [monthlyRevenue, setMonthlyRevenue] = useState([]);
  const [categorySales, setCategorySales] = useState({ labels: [], values: [] });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [modalMode, setModalMode] = useState("add");

  const token = localStorage.getItem("retailflow_token");

  const authHeader = { Authorization: `Bearer ${token}` };

  // =============================
  // LOAD PRODUCTS
  // =============================

  const loadProducts = async () => {
    try {
      const res = await fetch(`${BASE_URL}/products/`, { headers: authHeader });
      const data = await res.json();
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
        thisMonthRes,   // FIX: use /analytics/this-month for revenue + items sold KPIs
        bestRes,
        worstRes,
        lowStockRes,
        monthlyRevenueRes,
        categoryRes,
      ] = await Promise.all([
        fetch(`${BASE_URL}/analytics/this-month`, { headers: authHeader }),
        fetch(`${BASE_URL}/analytics/top-products`, { headers: authHeader }),
        fetch(`${BASE_URL}/analytics/worst-products`, { headers: authHeader }),
        fetch(`${BASE_URL}/analytics/low-stock-products`, { headers: authHeader }),
        fetch(`${BASE_URL}/analytics/monthly-revenue`, { headers: authHeader }),
        fetch(`${BASE_URL}/analytics/category-sales`, { headers: authHeader }),
      ]);

      const thisMonth = await thisMonthRes.json();
      const bestData = await bestRes.json();
      const worstData = await worstRes.json();
      const lowStockData = await lowStockRes.json();
      const revenueData = await monthlyRevenueRes.json();
      const categoryData = await categoryRes.json();

      // FIX: correct field names from /analytics/this-month response
      setRevenue(thisMonth.total_revenue ?? 0);
      setItemsSold(thisMonth.items_sold ?? 0);

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
          // FIX: backend returns `stock`, not `quantity`
          stock: item.stock,
          reorderLevel: 10,
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

  // FIX: Single consolidated useEffect — removed duplicate fetchItemsSold useEffect
  // that was overwriting itemsSold with undefined after loadAnalytics ran.
  useEffect(() => {
    loadProducts();
    loadAnalytics();
  }, []);

  // =============================
  // INVENTORY HEALTH
  // =============================

  const inventoryHealth = useMemo(() => {
    if (!products.length) return 0;
    // FIX: use `stock` field, not `quantity` (matches product schema)
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

  const payload = {
    name: formData.name,
    category: formData.category || null,
    price: Number(formData.price),
    stock: Number(formData.quantity)
  }

  console.log("Sending product:", payload)

  try {

    if (modalMode === "add") {

      await fetch(`${BASE_URL}/products/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      })

    } else {

      await fetch(`${BASE_URL}/products/${editingProduct.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      })

    }

    setIsModalOpen(false)
    loadProducts()

  } catch (err) {
    console.error("Save product error:", err)
  }

}
  const handleDeleteProduct = async (id) => {

  if (!window.confirm("Delete this product?")) return

  try {

    await fetch(`http://127.0.0.1:8000/products/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    loadProducts()

  } catch (err) {

    console.error("Delete error:", err)

  }

}

  // =============================
  // TABLE COLUMNS
  // =============================

  const productColumns = [
    { label: "#", key: "id" },
    { label: "Product", key: "name" },
    // FIX: removed `|| "N/A"` from key (it was on the config object, not the value)
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
          {v}
          {isLowStock(row) && " ⚠️"}
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
          {v}
          {isLowStock(row) && " ⚠️"}
        </span>
      ),
    },
    {
      label: "Actions",
      key: "id",
      render: (id, row) => (
        <div className="flex gap-2">
          <button onClick={() => handleEditProduct(row)} className="text-primary-600">
            Edit
          </button>
          <button onClick={() => handleDeleteProduct(id)} className="text-danger-600">
            Delete
          </button>
        </div>
      ),
    },
  ];

  return (
    <DashboardLayout role="owner" pageTitle="Owner Dashboard">
      {/* KPI */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <KPICard title="This Month Revenue" value={revenue} icon="💰" prefix="₹" />
        <KPICard title="Items Sold" value={itemsSold} icon="📦" />
        <KPICard title="Low Stock Products" value={lowStockItems.length} icon="⚠️" />
        <KPICard title="Inventory Health" value={inventoryHealth} suffix="%" icon="📊" />
      </div>

      {/* CHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
        <ChartCard title="Monthly Revenue">
          <LineChart
            data={monthlyRevenue}
            labels={["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]}
          />
        </ChartCard>

        <ChartCard title="Category Sales">
          <DoughnutChart data={categorySales.values} labels={categorySales.labels} />
        </ChartCard>
      </div>

      {/* INVENTORY */}
      {/* <DataTable title="Product Inventory" columns={inventoryColumns} data={products} /> */}
      <div className="mb-6 flex justify-between items-center">

<h2 className="text-lg font-semibold">Product Inventory</h2>

<button
onClick={handleAddProduct}
className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
>
Add Product
</button>

</div>

<DataTable
columns={inventoryColumns}
data={products}
/>

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
    </DashboardLayout>
  );
};

export default OwnerDashboard;