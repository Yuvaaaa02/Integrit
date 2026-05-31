import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { TrendingUp, DollarSign, Package, MessageSquare, Loader2 } from "lucide-react";
import { useDocumentMeta } from "@/hooks/useDocumentMeta";
import { api } from "@/lib/api";

const iconMap: Record<string, any> = {
  DollarSign,
  TrendingUp,
  Package,
  MessageSquare
};

export function AdminDashboardPage() {
  useDocumentMeta({
    title: "Dashboard · Admin",
    description: "Integrit admin dashboard.",
    robots: "noindex",
  });

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadStats() {
      try {
        const statsData = await api.admin.getStats();
        setData(statsData);
      } catch (err: any) {
        setError(err.message || "Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[50vh] grid place-items-center">
        <Loader2 className="animate-spin text-lime" size={32} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 glass rounded-3xl text-center text-destructive">
        <p>{error}</p>
      </div>
    );
  }

  const { stats, recentOrders, revenueTrend, blogPostsCount } = data || {
    stats: [],
    recentOrders: [],
    revenueTrend: [40, 65, 55, 80, 70, 95, 88],
    blogPostsCount: 0
  };

  return (
    <div>
      <header className="mb-10">
        <h1 className="font-display text-4xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Snapshot of your business today.</p>
      </header>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {stats.map((stat: any, index: number) => {
          const IconComponent = iconMap[stat.icon] || DollarSign;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="glass rounded-3xl p-5"
            >
              <IconComponent className="text-lime mb-3" size={20} />
              <div className="text-xs uppercase tracking-wider text-muted-foreground">{stat.label}</div>
              <div className="font-display text-3xl font-bold mt-1">{stat.value}</div>
              <div className="text-xs text-lime mt-1">{stat.change}</div>
            </motion.div>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-[2fr_1fr] gap-6">
        <div className="glass rounded-3xl p-6">
          <h2 className="font-display text-xl mb-5">Recent orders</h2>
          <div className="overflow-x-auto">
            {recentOrders.length === 0 ? (
              <p className="text-sm text-muted-foreground py-6 text-center">No orders found.</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground">
                    <th className="pb-3">Order</th>
                    <th className="pb-3">Product</th>
                    <th className="pb-3">Amount</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order: any) => (
                    <tr key={order.id} className="border-t border-border">
                      <td className="py-3 font-mono text-xs">{order.id}</td>
                      <td className="py-3">{order.product}</td>
                      <td className="py-3 text-lime">${order.amount}</td>
                      <td className="py-3">
                        <span
                          className={`text-[10px] uppercase tracking-wider px-2 py-1 rounded-full ${
                            order.status === "paid"
                              ? "bg-lime/20 text-lime"
                              : order.status === "pending"
                              ? "bg-yellow-500/20 text-yellow-500"
                              : "bg-destructive/20 text-destructive"
                          }`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="py-3 text-muted-foreground text-xs">{order.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <div className="glass rounded-3xl p-6">
          <h2 className="font-display text-xl mb-5">Revenue trend</h2>
          <div className="flex items-end gap-2 h-40">
            {revenueTrend.map((height: number, index: number) => (
              <motion.div
                key={index}
                initial={{ height: 0 }}
                animate={{ height: `${height}%` }}
                transition={{ delay: 0.1 + index * 0.05 }}
                className="flex-1 bg-lime rounded-t-lg"
                style={{ opacity: 0.4 + height / 200 }}
              />
            ))}
          </div>
          <div className="flex justify-between text-[10px] text-muted-foreground mt-2 uppercase tracking-wider">
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
            <span>Sun</span>
          </div>
          <div className="mt-6 pt-6 border-t border-border">
            <div className="text-xs text-muted-foreground">Blog posts published</div>
            <div className="font-display text-3xl mt-1">{blogPostsCount}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
