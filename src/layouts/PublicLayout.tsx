import { AnimatePresence, motion } from "framer-motion";
import { useLocation, useOutlet } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ChatbotPlaceholder } from "@/components/ChatbotPlaceholder";
import { useScrollToTop } from "@/hooks/useScrollToTop";

export function PublicLayout() {
  const location = useLocation();
  const outlet = useOutlet();

  useScrollToTop();

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />
      <AnimatePresence mode="wait">
        <motion.main
          key={location.pathname}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="flex-1 pt-24"
        >
          {outlet}
        </motion.main>
      </AnimatePresence>
      <Footer />
      <ChatbotPlaceholder />
    </div>
  );
}
