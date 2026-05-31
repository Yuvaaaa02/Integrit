import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Star } from "lucide-react";
import { fadeUp } from "@/animations/variants";
import type { Product } from "@/data/mock";
import { Thumbnail } from "./Thumbnail";

export function ProductCard({ product }: { product: Product }) {
  const isCustomImage = product.thumbnail && !product.thumbnail.startsWith("grad-");

  return (
    <motion.article variants={fadeUp} className="glass glow-hover rounded-3xl p-5 flex flex-col">
      <Thumbnail
        variant={isCustomImage ? "grad-1" : product.thumbnail}
        imageUrl={isCustomImage ? product.thumbnail : undefined}
        className="aspect-[4/3] rounded-2xl mb-5"
        label={product.title}
      />
      <div className="flex items-center gap-2 mb-2 flex-wrap">
        {product.tags.slice(0, 2).map((t) => (
          <span key={t} className="text-[10px] uppercase tracking-wider px-2 py-1 rounded-full border border-border text-muted-foreground">
            {t}
          </span>
        ))}
      </div>
      <h3 className="font-display text-xl mb-1">{product.title}</h3>
      <p className="text-sm text-muted-foreground mb-4 flex-1">{product.shortDescription}</p>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-1 text-xs">
          <Star size={12} className="fill-[var(--lime)] text-lime" />
          <span className="font-medium">{product.rating}</span>
          <span className="text-muted-foreground">({product.reviewCount})</span>
        </div>
        <div className="text-lime font-display text-xl">${product.price}</div>
      </div>
      <div className="flex gap-2">
        <Link to={`/marketplace/${product.slug}`} className="btn-ghost text-xs flex-1 text-center">
          View details
        </Link>
        <Link to={`/marketplace/${product.slug}`} className="btn-lime text-xs flex-1 text-center">
          Buy now
        </Link>
      </div>
    </motion.article>
  );
}
