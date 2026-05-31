import { Link } from "react-router-dom";
import { useDocumentMeta } from "@/hooks/useDocumentMeta";

export function NotFoundPage() {
  useDocumentMeta({
    title: "404 - Integrit",
    description: "The page you are looking for does not exist.",
  });

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-8xl font-bold text-lime">404</h1>
        <h2 className="mt-4 text-xl font-semibold">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          This route doesn&apos;t exist - yet.
        </p>
        <div className="mt-6">
          <Link to="/" className="btn-lime text-sm">
            Back home
          </Link>
        </div>
      </div>
    </div>
  );
}
