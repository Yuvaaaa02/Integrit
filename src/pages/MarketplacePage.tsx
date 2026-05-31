import { useMemo, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, Loader2 } from "lucide-react";
import { ProductCard } from "@/components/ProductCard";
import { Section } from "@/components/Section";
import { fadeUp, staggerContainer } from "@/animations/variants";
import { type Category } from "@/data/mock";
import { useDocumentMeta } from "@/hooks/useDocumentMeta";
import { api } from "@/lib/api";

const tabs: { key: Category | "all"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "workflow", label: "Agentic Workflows" },
  { key: "plugin", label: "Plugins" },
  { key: "social", label: "Social Marketing" },
];

export function MarketplacePage() {
  const [tab, setTab] = useState<(typeof tabs)[number]["key"]>("all");
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useDocumentMeta({
    title: "Marketplace — Integrit",
    description: "Browse agentic AI workflows, plugins, and social marketing services.",
    ogTitle: "Integrit Marketplace",
    ogDescription: "Agentic workflows, plugins, and marketing services.",
  });

  useEffect(() => {
    async function load() {
      try {
        const list = await api.products.list();
        setProducts(list);
      } catch (err) {
        console.error("Failed to load products:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = useMemo(() => {
    return products.filter((product) => {
      const matchesTab = tab === "all" || product.category === tab;
      const matchesQuery =
        !query ||
        (
          product.title +
          product.shortDescription +
          (product.tags ? product.tags.join(" ") : "")
        )
          .toLowerCase()
          .includes(query.toLowerCase());

      return matchesTab && matchesQuery;
    });
  }, [products, query, tab]);

  return (
    <>
      <Section className="py-12">
        <motion.div variants={fadeUp} className="text-center max-w-3xl mx-auto">
          <h1 className="font-display text-5xl md:text-6xl font-bold tracking-tighter">
            The <span className="text-lime">marketplace</span>
          </h1>
          <p className="text-muted-foreground mt-4 text-lg">
            Production-grade AI workflows, plugins, and managed marketing services.
          </p>
        </motion.div>
      </Section>

      <Section className="py-6">
        <motion.div
          variants={fadeUp}
          className="glass rounded-full flex items-center gap-3 px-5 py-3 max-w-2xl mx-auto"
        >
          <Search size={18} className="text-muted-foreground" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search workflows, plugins, services…"
            className="bg-transparent outline-none flex-1 text-sm"
          />
        </motion.div>

        <motion.div variants={fadeUp} className="flex flex-wrap justify-center gap-2 mt-8">
          {tabs.map((item) => (
            <button
              key={item.key}
              onClick={() => setTab(item.key)}
              className={`px-5 py-2.5 rounded-full text-sm transition-all ${
                tab === item.key ? "bg-lime text-black font-medium" : "glass hover:text-lime"
              }`}
            >
              {item.label}
            </button>
          ))}
        </motion.div>
      </Section>

      <Section className="py-16">
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-lime" size={32} />
          </div>
        ) : filtered.length === 0 ? (
          <motion.p variants={fadeUp} className="text-center text-muted-foreground py-20">
            No results. Try a different search.
          </motion.p>
        ) : (
          <motion.div variants={staggerContainer} className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((product) => (
              <ProductCard key={product.slug} product={product} />
            ))}
          </motion.div>
        )}
      </Section>
    </>
  );
}
