import { Link } from "react-router-dom";
import { useDocumentMeta } from "@/hooks/useDocumentMeta";

export function AdminNotFoundPage() {
  useDocumentMeta({
    title: "Admin Not Found - Integrit",
    description: "The admin page you are looking for does not exist.",
    robots: "noindex",
  });

  return (
    <div className="min-h-[70vh] grid place-items-center">
      <div className="text-center">
        <h1 className="font-display text-4xl font-bold mb-3">Admin page not found</h1>
        <p className="text-muted-foreground mb-6">
          The requested admin route is unavailable.
        </p>
        <Link to="/admin/dashboard" className="btn-lime text-sm">
          Back to dashboard
        </Link>
      </div>
    </div>
  );
}
