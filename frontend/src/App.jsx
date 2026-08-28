import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { CartProvider } from "./context/CartContext";
import { FavoriteProvider } from "./context/FavoriteContext";
import Login from "./pages/Login/Login";
import SignUp from "./pages/SignUp/signUp";
import DashboardLayout from "./layouts/DashboardLayout";
import Menu from "./pages/Dashboard/Menu/menu";
import AboutUs from "./pages/Dashboard/AboutUs/aboutUs";
import Contact from "./pages/Dashboard/Contact/contact";
import Cart from "./pages/Dashboard/Cart/cart";
import Favorite from "./pages/Dashboard/Favorite/favorite";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminLayout from "./layouts/AdminLayout";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import CategoryManagement from "./pages/Admin/CategoryManagement";
import ProductManagement from "./pages/Admin/ProductManagement";
import UserManagement from "./pages/Admin/UserManagement";
import ContactManagement from "./pages/Admin/ContactManagement";
import OrderManagement from "./pages/Admin/OrderManagement";

import CategoryPage from "./pages/Dashboard/Category/CategoryPage";
import ProductDetail from "./pages/Dashboard/Product/ProductDetail";
import Checkout from "./pages/Dashboard/Checkout/Checkout";
import OrderHistory from "./pages/Dashboard/OrderHistory/OrderHistory";
import Profile from "./pages/Dashboard/Profile/Profile";

function App() {
  return (
    <FavoriteProvider>
      <CartProvider>
        <BrowserRouter>
        <Routes>
          {/* Auth pages - không có header */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/sign-up" element={<SignUp />} />

          {/* Dashboard pages - có header chung, dành cho USER */}
          <Route element={<ProtectedRoute requiredRole="USER" />}>
            <Route element={<DashboardLayout />}>
              <Route
                path="/dashboard"
                element={<Navigate to="/dashboard/menu" replace />}
              />
              <Route path="/dashboard/menu" element={<Menu />} />
              <Route path="/dashboard/about" element={<AboutUs />} />
              <Route path="/dashboard/contact" element={<Contact />} />
              <Route path="/dashboard/cart" element={<Cart />} />
              <Route path="/dashboard/checkout" element={<Checkout />} />
              <Route path="/dashboard/favorite" element={<Favorite />} />
              <Route path="/dashboard/orders" element={<OrderHistory />} />
              <Route path="/dashboard/profile" element={<Profile />} />

              {/* Category & Product pages */}
              <Route path="/dashboard/category/:slug" element={<CategoryPage />} />
              <Route path="/dashboard/product/:id" element={<ProductDetail />} />
            </Route>
          </Route>

          {/* Admin pages - dành riêng cho ADMIN */}
          <Route element={<ProtectedRoute requiredRole="ADMIN" />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/categories" element={<CategoryManagement />} />
              <Route path="/admin/products" element={<ProductManagement />} />
              <Route path="/admin/users" element={<UserManagement />} />
              <Route path="/admin/orders" element={<OrderManagement />} />
              <Route path="/admin/contacts" element={<ContactManagement />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </CartProvider>
  </FavoriteProvider>
  );
}

export default App;
