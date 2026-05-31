import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, ChevronDown, Loader2 } from "lucide-react";
import { Section } from "@/components/Section";
import { ProductCard } from "@/components/ProductCard";
import { TestimonialCard } from "@/components/TestimonialCard";
import { PreReleaseSection } from "@/components/PreReleaseSection";
import { fadeUp, staggerContainer } from "@/animations/variants";
import { useDocumentMeta } from "@/hooks/useDocumentMeta";
import { api } from "@/lib/api";

export function HomePage() {
  const [products, setProducts] = useState<any[]>([]);
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [faqs, setFaqs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [heroBg, setHeroBg] = useState("");
  const [prereleaseConfig, setPrereleaseConfig] = useState<any>(null);

  useDocumentMeta({
    title: "Integrit — Automate Growth with AI",
    description:
      "Agentic AI workflows, smart plugins, and growth marketing engineered to scale your business on autopilot.",
    ogTitle: "Integrit — Automate Growth with AI",
    ogDescription: "AI workflows. Smart plugins. Marketing that scales.",
  });

  useEffect(() => {
    async function loadData() {
      try {
        const [prodList, testList, faqList, settingsData, prereleaseData] = await Promise.all([
          api.products.list(),
          api.testimonials.list(),
          api.faqs.list(),
          api.settings.get().catch(() => null),
          api.prerelease.getConfig().catch(() => null),
        ]);
        setProducts(prodList);
        setTestimonials(testList);
        setFaqs(faqList);
        if (settingsData && settingsData.heroBackgroundImage) {
          setHeroBg(settingsData.heroBackgroundImage);
        }
        if (prereleaseData) {
          setPrereleaseConfig(prereleaseData);
        }
      } catch (err) {
        console.error("Failed to load home page data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const featured = products.slice(0, 3);

  return (
    <>
      <section
        className="relative overflow-hidden pb-24"
        style={
          heroBg
            ? {
                backgroundImage: `linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.7) 100%), url(${heroBg})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }
            : {}
        }
      >
        {!heroBg && <div className="absolute inset-0 hero-mesh" />}
        <FloatingOrbs />
        <div className="relative max-w-6xl mx-auto px-6 pt-12 md:pt-24 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 glass rounded-full px-4 py-2 text-xs mb-8"
          >
            <span className="size-1.5 rounded-full bg-lime animate-pulse" />
            <span className="text-muted-foreground">Now booking Q3 engagements</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.05 }}
            className="font-display text-5xl md:text-7xl lg:text-8xl font-bold leading-[0.95] tracking-tighter"
          >
            Automate Growth <br />
            with <span className="text-lime">Integrit</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto"
          >
            AI workflows. Smart plugins. Marketing that scales.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.6 }}
            className="mt-10 flex flex-wrap justify-center gap-3"
          >
            <Link to="/marketplace" className="btn-lime inline-flex items-center gap-2">
              Explore Workflows <ArrowRight size={16} />
            </Link>
            <Link to="/pre-release" className="btn-ghost inline-flex items-center gap-2">
              Launch Teaser
            </Link>
          </motion.div>
        </div>
      </section>

      <Section className="py-12">
        <motion.p
          variants={fadeUp}
          className="text-center text-xs uppercase tracking-[0.3em] text-muted-foreground mb-8"
        >
          Trusted by 240+ ambitious teams
        </motion.p>
      </Section>

      <Section className="py-24">
        <motion.div variants={fadeUp} className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="font-display text-4xl md:text-5xl font-bold">Featured systems</h2>
        </motion.div>
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="animate-spin text-lime" size={32} />
          </div>
        ) : (
          <motion.div variants={staggerContainer} className="grid md:grid-cols-3 gap-6">
            {featured.map((product) => (
              <ProductCard key={product.slug} product={product} />
            ))}
          </motion.div>
        )}
      </Section>

      {/* Pre-Release Launch Teaser Section */}
      {!loading && prereleaseConfig?.enabled && (
        <Section className="py-12">
          <PreReleaseSection config={prereleaseConfig} />
        </Section>
      )}

      <Section className="py-24">
        <motion.div variants={fadeUp} className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="font-display text-4xl md:text-5xl font-bold">What founders say</h2>
        </motion.div>
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="animate-spin text-lime" size={32} />
          </div>
        ) : (
          <div className="overflow-x-auto -mx-6 px-6 pb-4">
            <motion.div variants={staggerContainer} className="flex gap-6 w-max">
              {testimonials.map((testimonial) => (
                <TestimonialCard key={testimonial.name} t={testimonial} />
              ))}
            </motion.div>
          </div>
        )}
      </Section>

      <Section className="py-24">
        <motion.div variants={fadeUp} className="text-center mb-12">
          <h2 className="font-display text-4xl md:text-5xl font-bold">Questions, answered</h2>
        </motion.div>
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="animate-spin text-lime" size={32} />
          </div>
        ) : (
          <motion.div variants={staggerContainer} className="max-w-3xl mx-auto space-y-3">
            {faqs.map((faq, index) => (
              <FaqItem key={index} q={faq.q} a={faq.a} />
            ))}
          </motion.div>
        )}
      </Section>

      <Section className="py-24">
        <motion.div
          variants={fadeUp}
          className="relative overflow-hidden rounded-[2.5rem] p-12 md:p-20 text-center"
          style={{ background: "linear-gradient(135deg, var(--lime), oklch(0.85 0.2 140))" }}
        >
          <h2 className="font-display text-4xl md:text-6xl font-bold text-black tracking-tight">
            Let&apos;s build something <br /> that compounds.
          </h2>
          <p className="text-black/70 mt-6 max-w-xl mx-auto">
            Tell us where you want to grow. We&apos;ll architect the automation stack that gets you there.
          </p>
          <Link
            to="/contact"
            className="mt-10 inline-flex items-center gap-2 bg-black text-lime px-8 py-4 rounded-full font-semibold hover:scale-105 transition-transform"
          >
            Start a conversation <ArrowRight size={18} />
          </Link>
        </motion.div>
      </Section>
    </>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);

  return (
    <motion.div variants={fadeUp} className="glass rounded-2xl overflow-hidden">
      <button
        onClick={() => setOpen((current) => !current)}
        className="w-full flex items-center justify-between p-5 text-left hover:text-lime transition-colors cursor-pointer"
      >
        <span className="font-medium">{q}</span>
        <ChevronDown
          size={18}
          className={`transition-transform ${open ? "rotate-180 text-lime" : ""}`}
        />
      </button>
      <motion.div
        initial={false}
        animate={{ height: open ? "auto" : 0, opacity: open ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        className="overflow-hidden"
      >
        <p className="px-5 pb-5 text-sm text-muted-foreground">{a}</p>
      </motion.div>
    </motion.div>
  );
}

function FloatingOrbs() {
  return (
    <>
      {[
        { x: "10%", y: "20%", size: 220, delay: 0 },
        { x: "80%", y: "30%", size: 180, delay: 1 },
        { x: "60%", y: "70%", size: 260, delay: 2 },
      ].map((orb, index) => (
        <motion.div
          key={index}
          className="absolute rounded-full pointer-events-none"
          style={{
            left: orb.x,
            top: orb.y,
            width: orb.size,
            height: orb.size,
            background: "radial-gradient(circle, rgba(192,255,52,0.18), transparent 70%)",
            filter: "blur(20px)",
          }}
          animate={{ y: [0, -30, 0], x: [0, 20, 0] }}
          transition={{ duration: 8 + index * 2, repeat: Infinity, ease: "easeInOut", delay: orb.delay }}
        />
      ))}
    </>
  );
}
