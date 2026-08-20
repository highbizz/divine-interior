import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { useCartSync } from "@/hooks/useCartSync";
import { useEffect, useState, useRef } from "react";
import { Loader2 } from "lucide-react";

// ── Storefront pages ──────────────────────────────────────
import Index from "./pages/Index";
import Shop from "./pages/Shop";
import Sale from "./pages/Sale";
import About from "./pages/About";
import Contact from "./pages/Contact";
import ProductDetail from "./pages/ProductDetail";
import NotFound from "./pages/NotFound";
import Blogs from "./pages/Blogs";
import BlogDetail from "./pages/BlogDetail";

// ── Customer pages ────────────────────────────────────────
import CustomerAuth from "./pages/CustomerAuth";
import Checkout from "./pages/Checkout";
import OrderConfirmation from "./pages/OrderConfirmation";
import AccountLayout from "./pages/account/AccountLayout";
import AccountOrders from "./pages/account/AccountOrders";
import AccountProfile from "./pages/account/AccountProfile";
import AccountAddresses from "./pages/account/AccountAddresses";

// ── Admin pages ───────────────────────────────────────────
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminBlogs from "./pages/admin/AdminBlogs";
import AdminCustomers from "./pages/admin/AdminCustomers";
import AdminUsers from "./pages/admin/AdminUsers";

// ── Layout / stores ───────────────────────────────────────
import { AdminLayout } from "./components/admin/AdminLayout";
import { FloatingWhatsApp } from "./components/FloatingWhatsApp";
import { useAdminStore } from "./stores/adminStore";
import { useCustomerStore } from "./stores/customerStore";
import { getToken, getCustomerToken } from "./lib/api";

const queryClient = new QueryClient();

// ─────────────────────────────────────────────────────────
// AdminGuard — properly waits for auth check, never flickers
// ─────────────────────────────────────────────────────────
const AdminGuard = () => {
  const { user, loadMe, signOut } = useAdminStore();
  const [status, setStatus] = useState<'checking' | 'ok' | 'denied'>('checking');
  const checked = useRef(false);

  useEffect(() => {
    if (checked.current) return;
    checked.current = true;

    const token = getToken();

    // No token at all → go to login
    if (!token) {
      setStatus('denied');
      return;
    }

    // Token exists — if we already have user in store, trust it
    if (user) {
      setStatus('ok');
      return;
    }

    // Token exists but no user in store → try to reload from server
    loadMe()
      .then(() => {
        // After loadMe, check store again
        const freshUser = useAdminStore.getState().user;
        if (freshUser) {
          setStatus('ok');
        } else {
          setStatus('denied');
        }
      })
      .catch(() => {
        setStatus('denied');
      });
  }, []);

  if (status === 'checking') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          <p className="font-sans text-xs text-gray-400">Loading…</p>
        </div>
      </div>
    );
  }

  if (status === 'denied') {
    return <Navigate to="/studio/login" replace />;
  }

  return (
    <AdminLayout>
      <Outlet />
    </AdminLayout>
  );
};

// ─────────────────────────────────────────────────────────
// AdminLoginGuard — redirect if already logged in
// ─────────────────────────────────────────────────────────
const AdminLoginGuard = () => {
  const { user } = useAdminStore();
  if (getToken() && user) return <Navigate to="/studio" replace />;
  return <AdminLogin />;
};

// ─────────────────────────────────────────────────────────
// App routes
// ─────────────────────────────────────────────────────────
const AppContent = () => {
  useCartSync();

  const { loadMe } = useCustomerStore();
  useEffect(() => {
    if (getCustomerToken()) loadMe();

    // Prevent right click & drag on images and videos
    const handleContextMenu = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        target &&
        (target.tagName === 'IMG' ||
         target.tagName === 'VIDEO' ||
         target.closest('img') ||
         target.closest('video'))
      ) {
        e.preventDefault();
      }
    };

    const handleDragStart = (e: DragEvent) => {
      const target = e.target as HTMLElement;
      if (
        target &&
        (target.tagName === 'IMG' ||
         target.tagName === 'VIDEO' ||
         target.closest('img') ||
         target.closest('video'))
      ) {
        e.preventDefault();
      }
    };

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('dragstart', handleDragStart);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('dragstart', handleDragStart);
    };
  }, []);

  return (
    <>
      <Routes>
        {/* ── Storefront ── */}
        <Route path="/"                   element={<Index />} />
        <Route path="/shop"               element={<Shop />} />
        <Route path="/sale"               element={<Sale />} />
        <Route path="/about"              element={<About />} />
        <Route path="/contact"            element={<Contact />} />
        <Route path="/product/:handle"    element={<ProductDetail />} />
        <Route path="/blogs"              element={<Blogs />} />
        <Route path="/blog/:slug"         element={<BlogDetail />} />

        {/* ── Customer auth ── */}
        <Route path="/auth"               element={<CustomerAuth />} />
        <Route path="/checkout"           element={<Checkout />} />
        <Route path="/order-confirmation" element={<OrderConfirmation />} />

        {/* ── Customer account ── */}
        <Route path="/account"            element={<AccountLayout />}>
          <Route index                    element={<Navigate to="/account/orders" replace />} />
          <Route path="orders"            element={<AccountOrders />} />
          <Route path="profile"           element={<AccountProfile />} />
          <Route path="addresses"         element={<AccountAddresses />} />
        </Route>

        {/* ── Admin ── */}
        <Route path="/studio/login"       element={<AdminLoginGuard />} />
        <Route path="/studio"             element={<AdminGuard />}>
          <Route index                    element={<AdminDashboard />} />
          <Route path="products"          element={<AdminProducts />} />
          <Route path="orders"            element={<AdminOrders />} />
          <Route path="blogs"             element={<AdminBlogs />} />
          <Route path="customers"         element={<AdminCustomers />} />
          <Route path="users"             element={<AdminUsers />} />
        </Route>

        {/* Legacy redirects */}
        <Route path="/admin/login"        element={<Navigate to="/studio/login" replace />} />
        <Route path="/admin/*"            element={<Navigate to="/studio" replace />} />

        <Route path="*"                   element={<NotFound />} />
      </Routes>
      <FloatingWhatsApp />
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
