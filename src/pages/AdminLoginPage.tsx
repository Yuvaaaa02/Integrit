import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Lock, Loader2 } from "lucide-react";
import { isAdminLoggedIn, setAdminLoggedIn } from "@/lib/admin-auth";
import { useDocumentMeta } from "@/hooks/useDocumentMeta";
import { api } from "@/lib/api";

export function AdminLoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useDocumentMeta({
    title: "Admin · Integrit",
    description: "Integrit admin login.",
    robots: "noindex",
  });

  useEffect(() => {
    if (isAdminLoggedIn()) {
      navigate("/admin/dashboard");
    }
  }, [navigate]);

  return (
    <div className="min-h-screen grid place-items-center px-6 bg-background">
      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={async (event) => {
          event.preventDefault();
          setLoading(true);
          setError("");
          try {
            await api.auth.login({ email, password });
            setAdminLoggedIn(true);
            navigate("/admin/dashboard");
          } catch (err: any) {
            setError(err.message || "Invalid credentials. Try admin@example.com / Admin@123");
          } finally {
            setLoading(false);
          }
        }}
        className="glass rounded-3xl p-10 w-full max-w-md"
      >
        <div className="size-12 rounded-2xl bg-lime/15 text-lime grid place-items-center mb-6">
          <Lock size={20} />
        </div>
        <h1 className="font-display text-3xl font-bold mb-2">Admin sign in</h1>
        <p className="text-sm text-muted-foreground mb-8">Authorized personnel only.</p>

        <label className="text-xs uppercase tracking-wider text-muted-foreground mb-2 block">Email / Username</label>
        <input
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          type="text"
          required
          placeholder="admin@example.com or admin"
          className="w-full bg-secondary/40 rounded-full px-4 py-3 outline-none focus:ring-1 focus:ring-lime text-sm mb-4"
        />
        <label className="text-xs uppercase tracking-wider text-muted-foreground mb-2 block">Password</label>
        <input
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          type="password"
          required
          placeholder="••••••••"
          className="w-full bg-secondary/40 rounded-full px-4 py-3 outline-none focus:ring-1 focus:ring-lime text-sm mb-2"
        />
        {error && <p className="text-xs text-destructive mb-4">{error}</p>}
        <button type="submit" disabled={loading} className="btn-lime w-full mt-6 inline-flex justify-center items-center gap-2">
          {loading ? (
            <>
              <Loader2 className="animate-spin" size={16} /> Signing in...
            </>
          ) : (
            "Sign in"
          )}
        </button>
        <p className="text-[11px] text-muted-foreground mt-6 text-center">
          Demo: admin@example.com / Admin@123
        </p>
      </motion.form>
    </div>
  );
}
