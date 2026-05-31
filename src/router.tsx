import { createBrowserRouter } from "react-router-dom";
import { PublicLayout } from "@/layouts/PublicLayout";
import { AdminLayout } from "@/layouts/AdminLayout";
import { HomePage } from "@/pages/HomePage";
import { MarketplacePage } from "@/pages/MarketplacePage";
import { MarketplaceDetailPage } from "@/pages/MarketplaceDetailPage";
import { ServicesPage } from "@/pages/ServicesPage";
import { BlogPage } from "@/pages/BlogPage";
import { BlogPostPage } from "@/pages/BlogPostPage";
import { ContactPage } from "@/pages/ContactPage";
import { CheckoutSuccessPage } from "@/pages/CheckoutSuccessPage";
import { CheckoutFailedPage } from "@/pages/CheckoutFailedPage";
import { NotFoundPage } from "@/pages/NotFoundPage";
import { AdminLoginPage } from "@/pages/AdminLoginPage";
import { AdminDashboardPage } from "@/pages/AdminDashboardPage";
import { AdminProductsPage } from "@/pages/AdminProductsPage";
import { AdminServicesPage } from "@/pages/AdminServicesPage";
import { AdminOrdersPage } from "@/pages/AdminOrdersPage";
import { AdminBlogPage } from "@/pages/AdminBlogPage";
import { AdminTestimonialsPage } from "@/pages/AdminTestimonialsPage";
import { AdminInquiriesPage } from "@/pages/AdminInquiriesPage";
import { AdminSettingsPage } from "@/pages/AdminSettingsPage";
import { AdminNotFoundPage } from "@/pages/AdminNotFoundPage";
import { PreReleasePage } from "@/pages/PreReleasePage";
import { AdminPreReleasePage } from "@/pages/AdminPreReleasePage";

export const router = createBrowserRouter([
  {
    path: "/admin",
    element: <AdminLayout />,
    children: [
      { index: true, element: <AdminLoginPage /> },
      { path: "dashboard", element: <AdminDashboardPage /> },
      { path: "products", element: <AdminProductsPage /> },
      { path: "services", element: <AdminServicesPage /> },
      { path: "orders", element: <AdminOrdersPage /> },
      { path: "blog", element: <AdminBlogPage /> },
      { path: "testimonials", element: <AdminTestimonialsPage /> },
      { path: "inquiries", element: <AdminInquiriesPage /> },
      { path: "settings", element: <AdminSettingsPage /> },
      { path: "prerelease", element: <AdminPreReleasePage /> },
      { path: "*", element: <AdminNotFoundPage /> },
    ],
  },
  {
    path: "/",
    element: <PublicLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "marketplace", element: <MarketplacePage /> },
      { path: "marketplace/:slug", element: <MarketplaceDetailPage /> },
      { path: "services", element: <ServicesPage /> },
      { path: "blog", element: <BlogPage /> },
      { path: "blog/:slug", element: <BlogPostPage /> },
      { path: "contact", element: <ContactPage /> },
      { path: "pre-release", element: <PreReleasePage /> },
      { path: "checkout/success", element: <CheckoutSuccessPage /> },
      { path: "checkout/failed", element: <CheckoutFailedPage /> },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
]);
