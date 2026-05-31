import { useState, type ComponentType } from "react";
import { motion } from "framer-motion";
import { Calendar, Mail, MapPin, MessageCircle, Send } from "lucide-react";
import { Section } from "@/components/Section";
import { fadeUp } from "@/animations/variants";
import { useDocumentMeta } from "@/hooks/useDocumentMeta";
import { api } from "@/lib/api";

export function ContactPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
    type: "inquiry",
  });
  const [sent, setSent] = useState(false);

  useDocumentMeta({
    title: "Contact — Integrit",
    description: "Book a consultation or start a project with Integrit.",
    ogTitle: "Contact Integrit",
    ogDescription: "Book a consultation or start a project.",
  });

  return (
    <>
      <Section className="py-12 text-center">
        <motion.h1 variants={fadeUp} className="font-display text-5xl md:text-6xl font-bold tracking-tighter">
          Let&apos;s <span className="text-lime">talk.</span>
        </motion.h1>
        <motion.p variants={fadeUp} className="text-muted-foreground mt-4 max-w-xl mx-auto">
          Tell us what you&apos;re building. We reply within an hour, weekdays.
        </motion.p>
      </Section>

      <Section className="py-12 grid lg:grid-cols-[1.2fr_1fr] gap-10">
        <motion.form
          variants={fadeUp}
          onSubmit={async (event) => {
            event.preventDefault();
            if (form.name && form.email && form.message) {
              try {
                await api.inquiries.create(form);
                setSent(true);
                setForm({ name: "", email: "", phone: "", message: "", type: "inquiry" });
              } catch (err: any) {
                alert(err.message || "Failed to send message. Please try again.");
              }
            }
          }}
          className="glass rounded-3xl p-8 space-y-4"
        >
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Name" value={form.name} onChange={(value) => setForm({ ...form, name: value })} required />
            <Field
              label="Email"
              type="email"
              value={form.email}
              onChange={(value) => setForm({ ...form, email: value })}
              required
            />
          </div>
          <Field
            label="Phone (optional)"
            value={form.phone}
            onChange={(value) => setForm({ ...form, phone: value })}
          />
          <div>
            <label className="text-xs uppercase tracking-wider text-muted-foreground mb-2 block">Type</label>
            <div className="flex gap-2">
              {(["inquiry", "consultation"] as const).map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setForm({ ...form, type: item })}
                  className={`flex-1 py-2.5 rounded-full text-sm capitalize transition-all ${
                    form.type === item ? "bg-lime text-black font-medium" : "border border-border hover:text-lime"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs uppercase tracking-wider text-muted-foreground mb-2 block">Message</label>
            <textarea
              required
              rows={5}
              value={form.message}
              onChange={(event) => setForm({ ...form, message: event.target.value })}
              className="w-full bg-secondary/40 rounded-2xl p-4 outline-none focus:ring-1 focus:ring-lime resize-none text-sm"
            />
          </div>
          <button type="submit" className="btn-lime w-full inline-flex items-center justify-center gap-2">
            {sent ? "✓ Message sent" : <>Send message <Send size={14} /></>}
          </button>
        </motion.form>

        <motion.div variants={fadeUp} className="space-y-4">
          <InfoCard icon={Mail} title="Email" body="hello@integrit.ai" href="mailto:hello@integrit.ai" />
          <InfoCard
            icon={MessageCircle}
            title="WhatsApp"
            body="+1 (555) 555-0100 · Mon–Fri"
            href="https://wa.me/15555550100"
          />
          <InfoCard icon={Calendar} title="Book a call" body="Free 30-min consultation" href="https://calendly.com" />
          <InfoCard icon={MapPin} title="HQ" body="Remote-first · NYC / Lisbon / Bangalore" />
        </motion.div>
      </Section>
    </>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  required,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="text-xs uppercase tracking-wider text-muted-foreground mb-2 block">{label}</label>
      <input
        type={type}
        value={value}
        required={required}
        onChange={(event) => onChange(event.target.value)}
        className="w-full bg-secondary/40 rounded-full px-4 py-3 outline-none focus:ring-1 focus:ring-lime text-sm"
      />
    </div>
  );
}

function InfoCard({
  icon: Icon,
  title,
  body,
  href,
}: {
  icon: ComponentType<{ size?: number; className?: string }>;
  title: string;
  body: string;
  href?: string;
}) {
  const inner = (
    <>
      <div className="size-10 rounded-2xl bg-lime/15 text-lime grid place-items-center mb-3">
        <Icon size={18} />
      </div>
      <h3 className="font-display text-lg">{title}</h3>
      <p className="text-sm text-muted-foreground">{body}</p>
    </>
  );

  return href ? (
    <a href={href} target="_blank" rel="noreferrer" className="block glass glow-hover rounded-3xl p-6">
      {inner}
    </a>
  ) : (
    <div className="glass rounded-3xl p-6">{inner}</div>
  );
}
