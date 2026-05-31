import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Sparkles } from "lucide-react";

export function ChatbotPlaceholder() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1.2, type: "spring" }}
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-40 size-14 rounded-full bg-lime text-black grid place-items-center shadow-[0_0_40px_rgba(192,255,52,0.45)] hover:scale-110 transition-transform"
        aria-label="Open chatbot"
      >
        <MessageCircle size={22} />
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 grid place-items-center p-4 bg-black/60 backdrop-blur"
            onClick={() => setOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="glass rounded-3xl p-8 max-w-md w-full text-center relative"
            >
              <button onClick={() => setOpen(false)} className="absolute top-4 right-4 p-1 hover:text-lime">
                <X size={18} />
              </button>
              <Sparkles className="mx-auto text-lime mb-4" size={32} />
              <h3 className="font-display text-2xl mb-2">PingBot is warming up</h3>
              <p className="text-muted-foreground text-sm">
                Our AI concierge launches next month. In the meantime, drop us a line from the contact page —
                we reply in under an hour.
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
