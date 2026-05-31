import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { fadeUp } from "@/animations/variants";
import type { BlogPost } from "@/data/mock";
import { Thumbnail } from "./Thumbnail";

export function BlogCard({ post }: { post: BlogPost }) {
  return (
    <motion.article variants={fadeUp} className="glass glow-hover rounded-3xl overflow-hidden group">
      <Link to={`/blog/${post.slug}`} className="block">
        <Thumbnail variant={post.thumbnail} className="aspect-[16/10]" label={post.title} />
        <div className="p-6">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
            <span>{post.date}</span><span>·</span><span>{post.readTime}</span>
          </div>
          <h3 className="font-display text-xl mb-2 group-hover:text-lime transition-colors flex items-start justify-between gap-2">
            {post.title}
            <ArrowUpRight size={18} className="shrink-0 mt-1 opacity-0 group-hover:opacity-100 transition-opacity" />
          </h3>
          <p className="text-sm text-muted-foreground">{post.excerpt}</p>
        </div>
      </Link>
    </motion.article>
  );
}
