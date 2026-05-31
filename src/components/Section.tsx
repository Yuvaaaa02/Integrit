import { motion, useInView } from "framer-motion";
import { useRef, type ReactNode } from "react";
import { staggerContainer } from "@/animations/variants";

export function Section({
  children,
  className = "",
  id,
}: {
  children: ReactNode;
  className?: string;
  id?: string;
}) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.section
      ref={ref}
      id={id}
      variants={staggerContainer}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      className={`relative max-w-7xl mx-auto px-6 ${className}`}
    >
      {children}
    </motion.section>
  );
}
