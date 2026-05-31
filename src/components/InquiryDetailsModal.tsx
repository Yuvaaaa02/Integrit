import { motion } from "framer-motion";
import { X, Mail, Phone, Calendar, User, MessageSquare, Trash2, Check, CheckSquare } from "lucide-react";

interface InquiryDetailsModalProps {
  inquiry: any;
  onClose: () => void;
  onMarkRead: (id: string, read: boolean) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export function InquiryDetailsModal({ inquiry, onClose, onMarkRead, onDelete }: InquiryDetailsModalProps) {
  if (!inquiry) return null;

  const handleMarkReadToggle = async () => {
    await onMarkRead(inquiry.id, !inquiry.read);
  };

  const handleDeleteClick = async () => {
    if (window.confirm("Are you sure you want to delete this inquiry permanently?")) {
      await onDelete(inquiry.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 grid place-items-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="glass rounded-[2.5rem] w-full max-w-2xl overflow-hidden relative border border-border/30"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 text-muted-foreground hover:text-white rounded-full bg-secondary/30 hover:bg-secondary/60 transition-colors cursor-pointer"
        >
          <X size={18} />
        </button>

        {/* Modal Header */}
        <div className="p-8 pb-4 border-b border-border/20">
          <div className="flex items-center gap-3 mb-3">
            <span
              className={`text-[10px] uppercase tracking-wider px-2 py-1 rounded-full font-semibold ${
                inquiry.read
                  ? "bg-secondary text-muted-foreground"
                  : "bg-lime/20 text-lime"
              }`}
            >
              {inquiry.read ? "Read" : "Unread"}
            </span>
            {inquiry.type && (
              <span className="text-[10px] uppercase tracking-wider px-2 py-1 rounded-full bg-lime/10 text-lime font-medium">
                {inquiry.type}
              </span>
            )}
          </div>
          <h2 className="font-display text-2xl font-bold flex items-center gap-2">
            Inquiry Details
          </h2>
        </div>

        {/* Modal Body */}
        <div className="p-8 space-y-6 max-h-[60vh] overflow-y-auto">
          {/* Customer info card */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-secondary/20 rounded-2xl p-4 flex items-center gap-3">
              <User className="text-lime shrink-0" size={18} />
              <div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Full Name</div>
                <div className="text-sm font-semibold">{inquiry.name}</div>
              </div>
            </div>

            <div className="bg-secondary/20 rounded-2xl p-4 flex items-center gap-3">
              <Calendar className="text-lime shrink-0" size={18} />
              <div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Date Received</div>
                <div className="text-sm font-semibold">
                  {inquiry.createdAt
                    ? new Date(inquiry.createdAt).toLocaleString()
                    : new Date().toLocaleString()}
                </div>
              </div>
            </div>

            <div className="bg-secondary/20 rounded-2xl p-4 flex items-center gap-3">
              <Mail className="text-lime shrink-0" size={18} />
              <div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Email Address</div>
                <a href={`mailto:${inquiry.email}`} className="text-sm font-semibold text-lime hover:underline block truncate">
                  {inquiry.email}
                </a>
              </div>
            </div>

            <div className="bg-secondary/20 rounded-2xl p-4 flex items-center gap-3">
              <Phone className="text-lime shrink-0" size={18} />
              <div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Phone Number</div>
                <div className="text-sm font-semibold">{inquiry.phone || "Not Provided"}</div>
              </div>
            </div>
          </div>

          {/* Message Section */}
          <div className="bg-secondary/10 border border-border/20 rounded-2xl p-5 space-y-3">
            <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground font-semibold">
              <MessageSquare size={14} className="text-lime" />
              Message Content
            </div>
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{inquiry.message}</p>
          </div>
        </div>

        {/* Modal Footer / Actions */}
        <div className="p-8 pt-4 border-t border-border/20 bg-secondary/10 flex flex-wrap items-center justify-between gap-4">
          <div className="flex gap-2">
            <button
              onClick={handleMarkReadToggle}
              className="btn-ghost text-xs inline-flex items-center gap-2 cursor-pointer"
            >
              {inquiry.read ? (
                <>
                  <CheckSquare size={14} /> Mark as Unread
                </>
              ) : (
                <>
                  <Check size={14} className="text-lime" /> Mark as Read
                </>
              )}
            </button>
            <button
              onClick={handleDeleteClick}
              className="btn-ghost text-xs hover:text-destructive hover:bg-destructive/10 inline-flex items-center gap-2 cursor-pointer"
            >
              <Trash2 size={14} /> Delete
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              disabled
              title="Reply via admin dashboard is under development. Please click email address above."
              className="btn-lime text-xs opacity-50 cursor-not-allowed"
            >
              Reply Placeholder
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
