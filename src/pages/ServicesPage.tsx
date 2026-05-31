import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Check, MessageCircle, Loader2 } from "lucide-react";
import { Section } from "@/components/Section";
import { fadeUp, staggerContainer } from "@/animations/variants";
import { useDocumentMeta } from "@/hooks/useDocumentMeta";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";

export function ServicesPage() {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useDocumentMeta({
    title: "Services — Integrit",
    description:
      "Growth marketing services: Instagram, YouTube, SEO, paid ads, branding, and funnel creation.",
    ogTitle: "Services — Integrit",
    ogDescription: "Marketing services that scale.",
  });

  useEffect(() => {
    async function load() {
      try {
        const list = await api.services.list();
        setServices(list);
      } catch (err) {
        console.error("Failed to load services:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <>
      <Section className="py-12 text-center">
        <motion.h1 variants={fadeUp} className="font-display text-5xl md:text-6xl font-bold tracking-tighter">
          Marketing, <span className="text-lime">delivered.</span>
        </motion.h1>
        <motion.p variants={fadeUp} className="text-muted-foreground mt-4 max-w-2xl mx-auto text-lg">
          Done-for-you services run by operators who&apos;ve scaled real brands.
        </motion.p>
      </Section>

      <Section className="py-12">
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-lime" size={32} />
          </div>
        ) : (
          <motion.div variants={staggerContainer} className="space-y-12">
          {services.map((service) => {
            const isCustomImage = service.thumbnail && !service.thumbnail.startsWith("grad-");
            return (
              <motion.div key={service.slug} variants={fadeUp} className="glass rounded-3xl p-8 md:p-10">
                <div className="flex items-start gap-5 mb-8 flex-wrap">
                  <div className="size-14 rounded-2xl overflow-hidden bg-lime/15 grid place-items-center shrink-0">
                    {isCustomImage ? (
                      <img
                        src={service.thumbnail}
                        className="w-full h-full object-cover"
                        alt={service.title}
                      />
                    ) : (
                      <span className="text-3xl">{service.icon}</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <h2 className="font-display text-3xl font-bold">{service.title}</h2>
                    <p className="text-muted-foreground mt-1">{service.description}</p>
                  </div>
                <a
                  href="https://wa.me/15555550100"
                  target="_blank"
                  rel="noreferrer"
                  className="btn-ghost text-sm inline-flex items-center gap-2"
                >
                  <MessageCircle size={14} /> WhatsApp
                </a>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                {service.packages.map((pkg: any, index: number) => (
                  <div
                    key={pkg.name}
                    className={`rounded-2xl p-6 transition-all ${
                      index === 1
                        ? "bg-lime text-black ring-2 ring-lime"
                        : "border border-border bg-surface glow-hover"
                    }`}
                  >
                    <div className="flex items-baseline justify-between mb-1">
                      <h3 className="font-display text-xl">{pkg.name}</h3>
                      {index === 1 && (
                        <span className="text-[10px] uppercase tracking-wider bg-black/10 px-2 py-1 rounded-full">
                          Popular
                        </span>
                      )}
                    </div>
                    <div className="font-display text-3xl font-bold mb-1">
                      ${pkg.price.toLocaleString()}
                    </div>
                    <div className={`text-xs mb-5 ${index === 1 ? "text-black/60" : "text-muted-foreground"}`}>
                      {pkg.duration}
                    </div>
                    <ul className="space-y-2 mb-6">
                      {pkg.deliverables.map((deliverable: any) => (
                        <li key={deliverable} className="flex items-start gap-2 text-sm">
                          <Check
                            size={14}
                            className={`mt-1 shrink-0 ${index === 1 ? "text-black" : "text-lime"}`}
                          />
                          <span>{deliverable}</span>
                        </li>
                      ))}
                    </ul>
                    <Link
                      to="/contact"
                      className={`block text-center rounded-full py-2.5 text-sm font-medium transition-transform hover:scale-[1.02] ${
                        index === 1 ? "bg-black text-lime" : "btn-lime"
                      }`}
                    >
                      Book consultation
                    </Link>
                  </div>
                ))}
              </div>
            </motion.div>
          );
        })}
        </motion.div>
        )}
      </Section>
    </>
  );
}
