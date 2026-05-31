import { useMemo, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { Section } from "@/components/Section";
import { BlogCard } from "@/components/BlogCard";
import { fadeUp, staggerContainer } from "@/animations/variants";
import { useDocumentMeta } from "@/hooks/useDocumentMeta";
import { api } from "@/lib/api";

export function BlogPage() {
  const [tag, setTag] = useState("All");
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const list = await api.blog.list();
        setPosts(list);
      } catch (err) {
        console.error("Failed to load blog posts:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const allTags = useMemo(() => {
    const tags = new Set<string>();
    posts.forEach((post) => {
      if (post.tags) {
        post.tags.forEach((t: string) => tags.add(t));
      }
    });
    return ["All", ...Array.from(tags)];
  }, [posts]);

  const filtered = posts.filter((post) => tag === "All" || (post.tags && post.tags.includes(tag)));

  useDocumentMeta({
    title: "Blog — Integrit",
    description: "Field notes on AI, growth, and the future of automation.",
    ogTitle: "Integrit Blog",
    ogDescription: "Field notes on AI, growth, and the future of automation.",
  });

  return (
    <>
      <Section className="py-12 text-center">
        <motion.h1 variants={fadeUp} className="font-display text-5xl md:text-6xl font-bold tracking-tighter">
          Field <span className="text-lime">notes</span>
        </motion.h1>
        <motion.p variants={fadeUp} className="text-muted-foreground mt-4 text-lg">
          What we&apos;re learning, building, and shipping.
        </motion.p>
      </Section>

      <Section className="py-6">
        <motion.div variants={fadeUp} className="flex flex-wrap justify-center gap-2">
          {allTags.map((item) => (
            <button
              key={item}
              onClick={() => setTag(item)}
              className={`px-5 py-2 rounded-full text-sm transition-all ${
                tag === item ? "bg-lime text-black font-medium" : "glass hover:text-lime"
              }`}
            >
              {item}
            </button>
          ))}
        </motion.div>
      </Section>

      <Section className="py-12">
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-lime" size={32} />
          </div>
        ) : (
          <motion.div variants={staggerContainer} className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((post) => (
              <BlogCard key={post.slug} post={post} />
            ))}
          </motion.div>
        )}
      </Section>
    </>
  );
}
