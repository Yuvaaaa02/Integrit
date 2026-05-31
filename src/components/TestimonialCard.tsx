import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { fadeUp } from "@/animations/variants";
import type { Testimonial } from "@/data/mock";

export function TestimonialCard({ t }: { t: Testimonial }) {
  return (
    <motion.div variants={fadeUp} className="glass glow-hover rounded-3xl p-6 min-w-[320px] max-w-sm">
      <div className="flex gap-1 mb-4">
        {Array.from({ length: t.rating }).map((_, i) => (
          <Star key={i} size={14} className="fill-[var(--lime)] text-lime" />
        ))}
      </div>
      <p className="text-sm leading-relaxed mb-6">"{t.content}"</p>
      <div className="flex items-center gap-3">
        <div className="size-10 rounded-full bg-lime/20 grid place-items-center text-lime font-display font-bold">
          {t.name[0]}
        </div>
        <div>
          <div className="text-sm font-medium">{t.name}</div>
          <div className="text-xs text-muted-foreground">{t.role}, {t.company}</div>
        </div>
      </div>
    </motion.div>
  );
}
