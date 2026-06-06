import { useState, useEffect } from "react";
import { Loader2, Plus, Pencil, Trash2, Search, X, Check, Eye } from "lucide-react";
import { useDocumentMeta } from "@/hooks/useDocumentMeta";
import { api } from "@/lib/api";

export function AdminOrdersPage() {
  useDocumentMeta({
    title: "Orders · Admin",
    description: "Integrit admin orders view.",
    robots: "noindex",
  });

  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<"all" | "paid" | "pending" | "failed" | "refunded">("all");
  const [search, setSearch] = useState("");

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  // Form states (Add/Edit)
  const [customer, setCustomer] = useState("");
  const [product, setProduct] = useState("");
  const [productSlug, setProductSlug] = useState("");
  const [amount, setAmount] = useState("");
  const [gateway, setGateway] = useState("razorpay");
  const [status, setStatus] = useState("pending");
  const [date, setDate] = useState("");

  async function loadOrders() {
    setLoading(true);
    try {
      const list = await api.orders.list();
      setOrders(list);
    } catch (err: any) {
      setError(err.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadOrders();
  }, []);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      await api.orders.updateStatus(orderId, newStatus);
      loadOrders();
    } catch (err: any) {
      alert(err.message || "Failed to update order status");
    }
  };

  const handleOpenFormModal = (order?: any) => {
    if (order) {
      setSelectedOrder(order);
      setCustomer(order.customer || "");
      setProduct(order.product || "");
      setProductSlug(order.productSlug || "");
      setAmount(String(order.amount || ""));
      setGateway(order.gateway || "stripe");
      setStatus(order.status || "pending");
      setDate(order.date || new Date().toISOString().split("T")[0]);
    } else {
      setSelectedOrder(null);
      setCustomer("");
      setProduct("");
      setProductSlug("");
      setAmount("");
      setGateway("razorpay");
      setStatus("pending");
      setDate(new Date().toISOString().split("T")[0]);
    }
    setModalOpen(true);
  };

  const handleOpenDetailsModal = (order: any) => {
    setSelectedOrder(order);
    setDetailsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const payload = {
      customer,
      product,
      productSlug: productSlug || product.toLowerCase().replace(/\s+/g, "-"),
      amount: parseFloat(amount),
      gateway,
      status,
      date,
    };

    try {
      if (selectedOrder) {
        await api.orders.update(selectedOrder.id || selectedOrder.orderId, payload);
      } else {
        await api.orders.create(payload);
      }
      setModalOpen(false);
      loadOrders();
    } catch (err: any) {
      setError(err.message || "Order operation failed.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this order permanently?")) return;
    try {
      await api.orders.delete(id);
      loadOrders();
    } catch (err: any) {
      alert(err.message || "Failed to delete order.");
    }
  };

  // Filter & Search
  const filtered = orders.filter((order) => {
    const matchesFilter = filter === "all" || order.status === filter;
    
    const searchLower = search.toLowerCase();
    const matchesSearch =
      !search ||
      (order.orderId && order.orderId.toLowerCase().includes(searchLower)) ||
      (order.id && order.id.toLowerCase().includes(searchLower)) ||
      (order.customer && order.customer.toLowerCase().includes(searchLower)) ||
      (order.product && order.product.toLowerCase().includes(searchLower)) ||
      (order.gateway && order.gateway.toLowerCase().includes(searchLower));

    return matchesFilter && matchesSearch;
  });

  return (
    <div>
      <header className="mb-8 flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="font-display text-4xl font-bold">Orders</h1>
          <p className="text-muted-foreground mt-1">Full transaction registry and status manager.</p>
        </div>
        <button
          onClick={() => handleOpenFormModal()}
          className="btn-lime inline-flex items-center gap-2 text-sm cursor-pointer"
        >
          <Plus size={14} /> Create Order
        </button>
      </header>

      {/* Filters and Search Bar */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center mb-6">
        <div className="flex flex-wrap gap-2">
          {(["all", "paid", "pending", "failed", "refunded"] as const).map((item) => (
            <button
              key={item}
              onClick={() => setFilter(item)}
              className={`px-4 py-2 rounded-full text-sm capitalize cursor-pointer transition-all ${
                filter === item ? "bg-lime text-black font-medium" : "glass hover:text-lime"
              }`}
            >
              {item}
            </button>
          ))}
        </div>

        <div className="relative max-w-md w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
          <input
            type="text"
            placeholder="Search orders, customers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-secondary/40 rounded-full pl-12 pr-4 py-2.5 outline-none focus:ring-1 focus:ring-lime text-sm"
          />
        </div>
      </div>

      {error && <p className="text-sm text-destructive mb-4">{error}</p>}

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="animate-spin text-lime" size={32} />
        </div>
      ) : (
        <div className="glass rounded-3xl p-6 overflow-x-auto border border-border/20">
          {filtered.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">No orders found.</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="pb-3 pl-2">Order ID</th>
                  <th className="pb-3">Customer</th>
                  <th className="pb-3">Product</th>
                  <th className="pb-3">Amount</th>
                  <th className="pb-3">Gateway</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Date</th>
                  <th className="pb-3 text-right pr-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((order) => (
                  <tr key={order.id || order.orderId} className="border-t border-border/20 hover:bg-secondary/10 transition-colors">
                    <td className="py-4 font-mono text-xs pl-2">{order.orderId || order.id}</td>
                    <td className="py-4 font-medium">{order.customer}</td>
                    <td className="py-4">{order.product}</td>
                    <td className="py-4 text-lime font-semibold">${order.amount}</td>
                    <td className="py-4 capitalize text-muted-foreground text-xs">{order.gateway}</td>
                    <td className="py-4">
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.id || order.orderId, e.target.value)}
                        className={`text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded-full bg-secondary/80 text-white border-none outline-none cursor-pointer ${
                          order.status === "paid" || order.status === "completed"
                            ? "bg-lime/20 !text-lime"
                            : order.status === "pending"
                            ? "bg-yellow-500/20 !text-yellow-500"
                            : order.status === "refunded"
                            ? "bg-blue-500/20 !text-blue-400"
                            : "bg-destructive/20 !text-destructive"
                        }`}
                      >
                        <option value="pending" className="bg-black text-white">Pending</option>
                        <option value="paid" className="bg-black text-white">Paid</option>
                        <option value="failed" className="bg-black text-white">Failed</option>
                        <option value="refunded" className="bg-black text-white">Refunded</option>
                      </select>
                    </td>
                    <td className="py-4 text-xs text-muted-foreground">{order.date}</td>
                    <td className="py-4 text-right pr-2">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleOpenDetailsModal(order)}
                          className="p-1.5 hover:text-lime rounded-full hover:bg-secondary/40 cursor-pointer"
                          title="View Details"
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          onClick={() => handleOpenFormModal(order)}
                          className="p-1.5 hover:text-lime rounded-full hover:bg-secondary/40 cursor-pointer"
                          title="Edit Order"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(order.id || order.orderId)}
                          className="p-1.5 hover:text-destructive rounded-full hover:bg-secondary/40 cursor-pointer"
                          title="Delete Order"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Add/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 grid place-items-center p-4 animate-fade-in">
          <div className="glass rounded-[2rem] p-6 w-full max-w-lg relative border border-border/30">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-white rounded-full bg-secondary/30 hover:bg-secondary/60 cursor-pointer"
            >
              <X size={18} />
            </button>
            <h2 className="font-display text-2xl font-bold mb-6">
              {selectedOrder ? "Edit Order" : "Create Order"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs uppercase tracking-wider text-muted-foreground mb-1 block font-medium">
                  Customer Email
                </label>
                <input
                  type="email"
                  required
                  value={customer}
                  onChange={(e) => setCustomer(e.target.value)}
                  placeholder="customer@domain.com"
                  className="w-full bg-secondary/40 rounded-full px-4 py-2 outline-none focus:ring-1 focus:ring-lime text-sm"
                />
              </div>

              <div>
                <label className="text-xs uppercase tracking-wider text-muted-foreground mb-1 block font-medium">
                  Product / Service Name
                </label>
                <input
                  type="text"
                  required
                  value={product}
                  onChange={(e) => setProduct(e.target.value)}
                  placeholder="e.g. Dynamic SEO Engine"
                  className="w-full bg-secondary/40 rounded-full px-4 py-2 outline-none focus:ring-1 focus:ring-lime text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs uppercase tracking-wider text-muted-foreground mb-1 block font-medium">
                    Amount (USD)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="299.00"
                    className="w-full bg-secondary/40 rounded-full px-4 py-2 outline-none focus:ring-1 focus:ring-lime text-sm"
                  />
                </div>

                <div>
                  <label className="text-xs uppercase tracking-wider text-muted-foreground mb-1 block font-medium">
                    Order Date
                  </label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-secondary/40 rounded-full px-4 py-2 outline-none focus:ring-1 focus:ring-lime text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs uppercase tracking-wider text-muted-foreground mb-1 block font-medium">
                    Gateway
                  </label>
                  <select
                    value={gateway}
                    onChange={(e) => setGateway(e.target.value)}
                    className="w-full bg-secondary/40 rounded-full px-4 py-2 outline-none focus:ring-1 focus:ring-lime text-sm"
                  >
                    <option value="razorpay">Razorpay</option>
                    <option value="paypal">PayPal</option>
                    <option value="manual">Manual Transfer</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs uppercase tracking-wider text-muted-foreground mb-1 block font-medium">
                    Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full bg-secondary/40 rounded-full px-4 py-2 outline-none focus:ring-1 focus:ring-lime text-sm"
                  >
                    <option value="pending">Pending</option>
                    <option value="paid">Paid</option>
                    <option value="failed">Failed</option>
                    <option value="refunded">Refunded</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="btn-ghost text-sm cursor-pointer"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-lime text-sm cursor-pointer">
                  {selectedOrder ? "Save Changes" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Details View Modal */}
      {detailsModalOpen && selectedOrder && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 grid place-items-center p-4 animate-fade-in">
          <div className="glass rounded-[2.5rem] p-8 w-full max-w-md relative border border-border/30">
            <button
              onClick={() => setDetailsModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-white rounded-full bg-secondary/30 hover:bg-secondary/60 cursor-pointer"
            >
              <X size={18} />
            </button>
            <h2 className="font-display text-2xl font-bold mb-6">Order Details</h2>

            <div className="space-y-4 text-sm">
              <div className="flex justify-between border-b border-border/20 pb-2">
                <span className="text-muted-foreground">Order ID</span>
                <span className="font-mono text-xs">{selectedOrder.orderId || selectedOrder.id}</span>
              </div>
              <div className="flex justify-between border-b border-border/20 pb-2">
                <span className="text-muted-foreground">Customer Email</span>
                <span className="font-semibold">{selectedOrder.customer}</span>
              </div>
              <div className="flex justify-between border-b border-border/20 pb-2">
                <span className="text-muted-foreground">Product</span>
                <span>{selectedOrder.product}</span>
              </div>
              <div className="flex justify-between border-b border-border/20 pb-2">
                <span className="text-muted-foreground">Amount</span>
                <span className="text-lime font-semibold">${selectedOrder.amount}</span>
              </div>
              <div className="flex justify-between border-b border-border/20 pb-2">
                <span className="text-muted-foreground">Payment Gateway</span>
                <span className="capitalize">{selectedOrder.gateway}</span>
              </div>
              <div className="flex justify-between border-b border-border/20 pb-2">
                <span className="text-muted-foreground">Status</span>
                <span
                  className={`text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded-full ${
                    selectedOrder.status === "paid" || selectedOrder.status === "completed"
                      ? "bg-lime/20 text-lime"
                      : selectedOrder.status === "pending"
                      ? "bg-yellow-500/20 text-yellow-500"
                      : selectedOrder.status === "refunded"
                      ? "bg-blue-500/20 text-blue-400"
                      : "bg-destructive/20 text-destructive"
                  }`}
                >
                  {selectedOrder.status}
                </span>
              </div>
              <div className="flex justify-between pb-2">
                <span className="text-muted-foreground">Order Date</span>
                <span>{selectedOrder.date}</span>
              </div>
            </div>

            <div className="flex justify-end pt-6">
              <button
                onClick={() => setDetailsModalOpen(false)}
                className="btn-lime text-xs cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
