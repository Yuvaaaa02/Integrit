import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { XCircle } from "lucide-react";
import { useDocumentMeta } from "@/hooks/useDocumentMeta";

export function CheckoutFailedPage() {
  useDocumentMeta({
    title: "Payment failed — Integrit",
    description: "Something went wrong with the transaction. No charge was made.",
  });

  return (
    <div className="min-h-[70vh] grid place-items-center px-6">
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-md">
        <div className="mx-auto size-24 rounded-full bg-destructive/15 grid place-items-center mb-8">
          <XCircle size={48} className="text-destructive" />
        </div>
        <h1 className="font-display text-5xl font-bold mb-4">Payment failed</h1>
        <p className="text-muted-foreground mb-10">
          Something went wrong with the transaction. No charge was made — give it another shot.
        </p>
        <div className="flex justify-center gap-3 flex-wrap">
          <Link to="/marketplace" className="btn-lime text-sm">
            Try again
          </Link>
          <Link to="/contact" className="btn-ghost text-sm">
            Talk to us
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
