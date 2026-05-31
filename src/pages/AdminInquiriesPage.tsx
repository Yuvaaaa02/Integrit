import { useState, useEffect } from "react";
import { Loader2, Trash2 } from "lucide-react";
import { useDocumentMeta } from "@/hooks/useDocumentMeta";
import { api } from "@/lib/api";
import { InquiryDetailsModal } from "@/components/InquiryDetailsModal";

export function AdminInquiriesPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedInquiry, setSelectedInquiry] = useState<any>(null);

  useDocumentMeta({
    title: "Inquiries · Admin",
    description: "Integrit admin inquiries view.",
    robots: "noindex",
  });

  async function loadInquiries() {
    setLoading(true);
    try {
      const list = await api.inquiries.list();
      setItems(list);
    } catch (err: any) {
      setError(err.message || "Failed to load inquiries");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadInquiries();
  }, []);

  const markRead = async (id: string, read: boolean) => {
    try {
      await api.inquiries.markRead(id, read);
      setItems((current: any[]) => current.map((item: any) => (item.id === id ? { ...item, read } : item)));
      setSelectedInquiry((current: any) => (current && current.id === id ? { ...current, read } : current));
    } catch (err: any) {
      console.error("Failed to update inquiry status:", err);
    }
  };

  const handleDelete = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation(); // prevent triggering modal click
    try {
      await api.inquiries.delete(id);
      setItems((current: any[]) => current.filter((item: any) => item.id !== id));
      if (selectedInquiry?.id === id) {
        setSelectedInquiry(null);
      }
    } catch (err: any) {
      alert(err.message || "Failed to delete inquiry.");
    }
  };

  return (
    <div>
      <header className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="font-display text-4xl font-bold">Inquiries</h1>
          <p className="text-muted-foreground mt-1">
            {loading ? "Loading..." : `${items.filter((item) => !item.read).length} unread.`}
          </p>
        </div>
      </header>

      {error && <p className="text-sm text-destructive mb-4">{error}</p>}

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="animate-spin text-lime" size={32} />
        </div>
      ) : (
        <div className="space-y-3">
          {items.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6 glass rounded-2xl">
              No inquiries found.
            </p>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  setSelectedInquiry(item);
                  if (!item.read) {
                    markRead(item.id, true);
                  }
                }}
                className={`glass rounded-2xl p-5 cursor-pointer glow-hover relative transition-all group ${
                  !item.read ? "ring-1 ring-lime" : ""
                }`}
              >
                <div className="flex items-start justify-between mb-2 flex-wrap gap-2 pr-10">
                  <div>
                    <div className="font-medium flex items-center gap-2">
                      {item.name}
                      {!item.read && <span className="size-2 rounded-full bg-lime" />}
                    </div>
                    <div className="text-xs text-muted-foreground">{item.email}</div>
                    {item.phone && <div className="text-[10px] text-muted-foreground">Phone: {item.phone}</div>}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase tracking-wider px-2 py-1 rounded-full border border-border">
                      {item.type}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : item.date}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{item.message}</p>
                
                <button
                  onClick={(e) => handleDelete(item.id, e)}
                  className="absolute right-4 bottom-4 p-2 text-muted-foreground hover:text-destructive cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Delete Inquiry"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {selectedInquiry && (
        <InquiryDetailsModal
          inquiry={selectedInquiry}
          onClose={() => setSelectedInquiry(null)}
          onMarkRead={markRead}
          onDelete={async (id) => {
            await handleDelete(id);
          }}
        />
      )}
    </div>
  );
}
