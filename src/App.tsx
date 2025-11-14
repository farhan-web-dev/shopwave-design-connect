import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import NotFound from "./pages/NotFound";
import Checkout from "./pages/Checkout";
import CheckoutSuccess from "./pages/CheckoutSuccess";
import SellerOnboarding from "./pages/SellerOnboarding";
import SellerLayout from "./components/seller/SellerLayout";
import DashboardOverview from "./pages/seller/DashboardOverview";
import MyProducts from "./pages/seller/MyProducts";
import AddProduct from "./pages/seller/AddProduct";
import OrdersReceived from "./pages/seller/OrdersReceived";
import Messages from "./pages/seller/Messages";
import ProfileSettings from "./pages/seller/ProfileSettings";
import BuyerMessages from "./pages/Messages";
import Favourites from "./pages/Favourites";
import Orders from "./pages/Orders";
import Seller from "./pages/Seller";
import CoursesPage from "./pages/Courses";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route
              path="/"
              element={
                <div className="flex flex-col min-h-screen">
                  <Header />
                  <main className="flex-1">
                    <Home />
                  </main>
                  <Footer />
                </div>
              }
            />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/seller/onboarding" element={<SellerOnboarding />} />
            <Route
              path="/products"
              element={
                <div className="flex flex-col min-h-screen">
                  <Header />
                  <main className="flex-1">
                    <Products />
                  </main>
                  <Footer />
                </div>
              }
            />
            <Route
              path="/products/:id"
              element={
                <div className="flex flex-col min-h-screen">
                  <Header />
                  <main className="flex-1">
                    <ProductDetail />
                  </main>
                  <Footer />
                </div>
              }
            />
            <Route
              path="/cart"
              element={
                <div className="flex flex-col min-h-screen">
                  <Header />
                  <main className="flex-1">
                    <Cart />
                  </main>
                  <Footer />
                </div>
              }
            />

            <Route
              path="/checkout"
              element={
                <div className="flex flex-col min-h-screen">
                  <Header />
                  <main className="flex-1">
                    <Checkout />
                  </main>
                  <Footer />
                </div>
              }
            />

            <Route
              path="/checkout/success"
              element={
                <div className="flex flex-col min-h-screen">
                  <Header />
                  <main className="flex-1">
                    <CheckoutSuccess />
                  </main>
                  <Footer />
                </div>
              }
            />

            <Route
              path="/messages"
              element={
                <ProtectedRoute>
                  <div className="flex flex-col min-h-screen">
                    <Header />
                    <main className="flex-1">
                      <BuyerMessages />
                    </main>
                    <Footer />
                  </div>
                </ProtectedRoute>
              }
            />

            <Route
              path="/favourites"
              element={
                <ProtectedRoute>
                  <div className="flex flex-col min-h-screen">
                    <Header />
                    <main className="flex-1">
                      <Favourites />
                    </main>
                    <Footer />
                  </div>
                </ProtectedRoute>
              }
            />

            <Route
              path="/courses"
              element={
                <ProtectedRoute>
                  <div className="flex flex-col min-h-screen">
                    <Header />
                    <main className="flex-1">
                      <CoursesPage />
                    </main>
                    <Footer />
                  </div>
                </ProtectedRoute>
              }
            />

            <Route
              path="/orders"
              element={
                <div className="flex flex-col min-h-screen">
                  <Header />
                  <main className="flex-1">
                    <Orders />
                  </main>
                  <Footer />
                </div>
              }
            />

            <Route
              path="/seller/:sellerId"
              element={
                <div className="flex flex-col min-h-screen">
                  <Header />
                  <main className="flex-1">
                    <Seller />
                  </main>
                  <Footer />
                </div>
              }
            />

            {/* Seller Dashboard Routes */}
            <Route
              path="/seller/dashboard"
              element={
                <ProtectedRoute requiredRole="seller">
                  <SellerLayout>
                    <DashboardOverview />
                  </SellerLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/seller/products"
              element={
                <ProtectedRoute requiredRole="seller">
                  <SellerLayout>
                    <MyProducts />
                  </SellerLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/seller/products/add"
              element={
                <ProtectedRoute requiredRole="seller">
                  <SellerLayout>
                    <AddProduct />
                  </SellerLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/seller/orders"
              element={
                <ProtectedRoute requiredRole="seller">
                  <SellerLayout>
                    <OrdersReceived />
                  </SellerLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/seller/messages"
              element={
                <ProtectedRoute requiredRole="seller">
                  <SellerLayout>
                    <Messages />
                  </SellerLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/seller/profile"
              element={
                <ProtectedRoute requiredRole="seller">
                  <SellerLayout>
                    <ProfileSettings />
                  </SellerLayout>
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
