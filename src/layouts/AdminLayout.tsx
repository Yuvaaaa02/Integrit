import { AnimatePresence, motion } from "framer-motion";
import {
  LayoutDashboard,
  Package,
  Wrench,
  ShoppingBag,
  FileText,
  MessageSquare,
  Star,
  Settings,
  LogOut,
  Rocket,
} from "lucide-react";
import { Link, Navigate, Outlet, useLocation, useOutlet } from "react-router-dom";
import { useScrollToTop } from "@/hooks/useScrollToTop";
import { isAdminLoggedIn, setAdminLoggedIn } from "@/lib/admin-auth";
import logoUrl from "@/assets/logo.png";

const navItems = [
  { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/products", label: "Products", icon: Package },
  { to: "/admin/services", label: "Services", icon: Wrench },
  { to: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { to: "/admin/blog", label: "Blog", icon: FileText },
  { to: "/admin/testimonials", label: "Testimonials", icon: Star },
  { to: "/admin/inquiries", label: "Inquiries", icon: MessageSquare },
  { to: "/admin/settings", label: "Settings", icon: Settings },
  { to: "/admin/prerelease", label: "Pre-Release", icon: Rocket },
] as const;

export function AdminLayout() {
  const location = useLocation();

  useScrollToTop();

  // Strip trailing slashes to prevent route matching issues (e.g., /admin/dashboard/ -> /admin/dashboard)
  if (location.pathname.endsWith("/") && location.pathname !== "/admin/" && location.pathname !== "/") {
    return <Navigate to={location.pathname.slice(0, -1)} replace />;
  }

  const isLogin = location.pathname === "/admin" || location.pathname === "/admin/";

  if (isLogin) {
    return (
      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        >
          <Outlet />
        </motion.div>
      </AnimatePresence>
    );
  }

  if (!isAdminLoggedIn()) {
    return <Navigate to="/admin" replace />;
  }

  return (
    <div className="min-h-screen flex bg-background">
      <aside className="w-64 border-r border-border p-6 flex flex-col gap-1 sticky top-0 h-screen">
        <Link to="/admin/dashboard" className="flex items-center gap-3 mb-8">
          <img src={logoUrl} className="size-10 object-contain" alt="Integrit Logo" />
          <span className="font-display font-bold tracking-tight text-xl">Integrit Admin</span>
        </Link>
        {navItems.map((item) => {
          const active = location.pathname.startsWith(item.to);
          const Icon = item.icon;

          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors ${
                active
                  ? "bg-lime text-black font-medium"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              }`}
            >
              <Icon size={16} />
              {item.label}
            </Link>
          );
        })}
        <div className="flex-1" />
        <button
          onClick={() => {
            setAdminLoggedIn(false);
            window.location.href = "/admin";
          }}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-muted-foreground hover:text-destructive"
        >
          <LogOut size={16} /> Sign out
        </button>
      </aside>
      <AnimatePresence mode="wait">
        <motion.main
          key={location.pathname}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="flex-1 p-10 overflow-y-auto"
        >
          <Outlet />
        </motion.main>
      </AnimatePresence>
    </div>
  );
}
