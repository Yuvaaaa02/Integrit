import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import { useDocumentMeta } from "@/hooks/useDocumentMeta";
import { api } from "@/lib/api";

export function CheckoutSuccessPage() {
  useDocumentMeta({
    title: "Order confirmed — Integrit",
    description: "Order confirmed. Your Integrit onboarding instructions are on the way.",
  });

  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [status, setStatus] = useState<"verifying" | "success" | "error">("verifying");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!sessionId) {
      // If no session_id, assume we navigated here or it was processed
      setStatus("success");
      return;
    }

    let isMounted = true;
    async function verify() {
      try {
        const result = await api.payments.verifySession(sessionId!);
        if (isMounted) {
          if (result.verified) {
            setStatus("success");
          } else {
            setStatus("error");
            setErrorMsg("Payment was not completed successfully.");
          }
        }
      } catch (err: any) {
        if (isMounted) {
          setStatus("error");
          setErrorMsg(err.message || "Failed to verify payment session.");
        }
      }
    }

    verify();

    return () => {
      isMounted = false;
    };
  }, [sessionId]);

  if (status === "verifying") {
    return (
      <div className="min-h-[70vh] grid place-items-center px-6">
        <div className="text-center max-w-md">
          <Loader2 className="animate-spin text-lime mx-auto mb-6" size={48} />
          <h1 className="font-display text-3xl font-bold mb-4">Verifying your payment</h1>
          <p className="text-muted-foreground">
            Please wait while we secure confirmation from Stripe. This will only take a moment...
          </p>
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="min-h-[70vh] grid place-items-center px-6">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-md">
          <div className="mx-auto size-24 rounded-full bg-destructive/15 grid place-items-center mb-8">
            <AlertCircle size={48} className="text-destructive" />
          </div>
          <h1 className="font-display text-4xl font-bold mb-4">Verification failed</h1>
          <p className="text-muted-foreground mb-10">
            {errorMsg || "We couldn't verify your Stripe session. Please check with your payment provider or contact support."}
          </p>
          <div className="flex justify-center gap-3 flex-wrap">
            <Link to="/marketplace" className="btn-lime text-sm">
              Back to marketplace
            </Link>
            <Link to="/contact" className="btn-ghost text-sm">
              Contact support
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-[70vh] grid place-items-center px-6">
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-md">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", delay: 0.2 }}
          className="mx-auto size-24 rounded-full bg-lime grid place-items-center mb-8"
          style={{ boxShadow: "0 0 60px rgba(192,255,52,0.5)" }}
        >
          <CheckCircle2 size={48} className="text-black" />
        </motion.div>
        <h1 className="font-display text-5xl font-bold mb-4">You&apos;re in.</h1>
        <p className="text-muted-foreground mb-10">
          Order confirmed. Check your inbox — onboarding instructions are on the way.
        </p>
        <div className="flex justify-center gap-3 flex-wrap">
          <Link to="/marketplace" className="btn-lime text-sm">
            Back to marketplace
          </Link>
          <Link to="/" className="btn-ghost text-sm">
            Home
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
