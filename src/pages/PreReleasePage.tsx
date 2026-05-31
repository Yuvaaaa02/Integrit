import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles, CheckCircle2, AlertTriangle, Loader2, Play, Volume2,
  VolumeX, ShieldCheck, Zap, ArrowDown, Rocket
} from "lucide-react";
import { api } from "@/lib/api";
import { useDocumentMeta } from "@/hooks/useDocumentMeta";

export function PreReleasePage() {
  const [config, setConfig] = useState<any>(null);
  const [loadingConfig, setLoadingConfig] = useState(true);

  // Video states
  const [isPlaying, setIsPlaying] = useState(true);
  const [muted, setMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [errors, setErrors] = useState<{ name?: string; email?: string; phone?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Toast notifications state
  const [toast, setToast] = useState<{ show: boolean; message: string; type: "success" | "error" }>({
    show: false,
    message: "",
    type: "success"
  });

  const formSectionRef = useRef<HTMLDivElement>(null);

  useDocumentMeta({
    title: config?.title ? `${config.title} · Pre-Release` : "Pre-Release Launch · Integrit",
    description: config?.subtitle || "Enroll in Integrit's next-gen autonomous systems and workflows launch list.",
  });

  useEffect(() => {
    async function fetchConfig() {
      try {
        const data = await api.prerelease.getConfig();
        setConfig(data);
      } catch (err) {
        console.error("Failed to retrieve prerelease config:", err);
      } finally {
        setLoadingConfig(false);
      }
    }
    fetchConfig();
  }, []);

  const validate = () => {
    const tempErrors: { name?: string; email?: string; phone?: string } = {};
    if (!name.trim()) {
      tempErrors.name = "Name is required.";
    }
    if (!email.trim()) {
      tempErrors.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      tempErrors.email = "Please enter a valid email address.";
    }
    if (!phone.trim()) {
      tempErrors.phone = "Phone number is required.";
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleEnroll = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    showToast(false, "", "success"); // hide current toasts
    try {
      const res = await api.prerelease.enroll({ name, email, phone });
      showToast(true, res.message || "Successfully enrolled in the launch!", "success");
      setName("");
      setEmail("");
      setPhone("");
      setErrors({});
    } catch (err: any) {
      showToast(true, err.message || "Enrollment failed. Please try again.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const showToast = (show: boolean, message: string, type: "success" | "error") => {
    setToast({ show, message, type });
    if (show) {
      setTimeout(() => {
        setToast((prev) => ({ ...prev, show: false }));
      }, 5000);
    }
  };

  const handleScrollToForm = () => {
    formSectionRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handlePlayToggle = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play().catch(() => { });
    }
    setIsPlaying(!isPlaying);
  };

  const handleMuteToggle = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !muted;
    setMuted(!muted);
  };

  const isEmbed = config?.videoUrl?.includes("youtube.com") ||
    config?.videoUrl?.includes("youtu.be") ||
    config?.videoUrl?.includes("vimeo.com");

  return (
    <div className="min-h-screen relative overflow-hidden bg-background pt-24 pb-20">

      {/* Background Orbs */}
      <div className="absolute inset-0 hero-mesh" />
      <div
        className="absolute left-1/4 top-1/4 w-[400px] h-[400px] rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(192,255,52,0.08), transparent 70%)",
          filter: "blur(40px)",
        }}
      />
      <div
        className="absolute right-1/4 bottom-1/4 w-[350px] h-[350px] rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(192,255,52,0.06), transparent 70%)",
          filter: "blur(35px)",
        }}
      />

      <div className="relative z-10 max-w-5xl mx-auto px-6 space-y-24">

        {/* Toast Notifications */}
        <AnimatePresence>
          {toast.show && (
            <motion.div
              initial={{ opacity: 0, y: -40, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-6 py-4 rounded-full glass border shadow-2xl ${toast.type === "success"
                ? "border-lime/30 text-lime"
                : "border-destructive/30 text-destructive"
                }`}
            >
              {toast.type === "success" ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
              <span className="text-sm font-semibold tracking-wide text-foreground">{toast.message}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {loadingConfig ? (
          <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
            <Loader2 className="animate-spin text-lime mb-4" size={40} />
            <p className="text-muted-foreground text-sm">Opening pre-release launch console...</p>
          </div>
        ) : (
          <>
            {/* HERO SECTION */}
            <header className="text-center max-w-3xl mx-auto space-y-6 pt-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="inline-flex items-center gap-2 bg-lime/10 border border-lime/20 text-lime rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wider"
              >
                <Sparkles size={12} className="animate-pulse" />
                <span>{config?.badge || "Coming Soon"}</span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.1 }}
                className="font-display text-5xl md:text-7xl font-extrabold tracking-tighter leading-none"
              >
                {config?.title || "Sales Autopilot Agent"}
              </motion.h1>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.7, delay: 0.25 }}
                className="text-muted-foreground text-lg md:text-xl leading-relaxed max-w-2xl mx-auto"
              >
                {config?.subtitle || "Enroll in Integrit's next-gen autonomous SDR system to scale growth fully on autopilot."}
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.35 }}
                className="pt-4 flex justify-center"
              >
                <button
                  onClick={handleScrollToForm}
                  className="btn-lime flex items-center gap-2 text-sm px-8 py-4 cursor-pointer"
                >
                  <span>{config?.ctaText || "Join Launch list"}</span>
                  <ArrowDown size={14} className="animate-bounce" />
                </button>
              </motion.div>
            </header>

            {/* VIDEO SHOWCASE SECTION */}
            <motion.section
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.45 }}
              className="glass rounded-3xl overflow-hidden aspect-video w-full max-w-4xl mx-auto border border-border shadow-2xl relative group"
            >
              {isEmbed ? (
                <iframe
                  src={config?.videoUrl}
                  className="w-full h-full border-0 absolute inset-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title="Launch Trailer Player"
                  loading="lazy"
                />
              ) : config?.videoUrl ? (
                <>
                  <video
                    ref={videoRef}
                    src={config?.videoUrl}
                    className="w-full h-full object-cover"
                    autoPlay
                    muted={muted}
                    loop
                    playsInline
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                  />
                  {/* Overlay controller bar */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-4">
                    <button
                      onClick={handlePlayToggle}
                      className="p-4 bg-lime text-black rounded-full hover:scale-110 active:scale-95 transition-transform cursor-pointer"
                    >
                      {isPlaying ? <span className="block w-4 h-4 border-l-4 border-r-4 border-black box-border" style={{ borderStyle: 'double' }} /> : <Play size={18} fill="currentColor" />}
                    </button>
                    <button
                      onClick={handleMuteToggle}
                      className="p-4 bg-white/10 hover:bg-white/20 text-white rounded-full hover:scale-110 active:scale-95 transition-transform cursor-pointer"
                    >
                      {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                    </button>
                  </div>
                </>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-secondary/20 p-8 text-center select-none text-muted-foreground">
                  <Play size={48} className="text-lime/30 mb-4 animate-pulse" />
                  <p className="font-semibold text-foreground tracking-tight text-lg">Interactive Launch Stream Ready</p>
                  <p className="text-xs text-muted-foreground/80 mt-1 max-w-[280px]">Watch deep-dives, live workflow setups, and CRM connections upon launch release.</p>
                </div>
              )}
            </motion.section>

            {/* FEATURES SECTION */}
            <section className="space-y-12">
              <div className="text-center max-w-xl mx-auto space-y-3">
                <h2 className="font-display text-3xl md:text-4xl font-bold">Why enroll today?</h2>
                <p className="text-muted-foreground text-sm md:text-base">Securing your spot gets you early beta access and locked-in premium launch pricing.</p>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                {[
                  {
                    icon: Rocket,
                    title: "Priority Access",
                    desc: "Skip the waiting list and get onboarding support from our developer team during launch week."
                  },
                  {
                    icon: ShieldCheck,
                    title: "Exclusive Beta Testing",
                    desc: "Contribute to feature roadmaps and get custom workspace nodes crafted specifically for your systems."
                  },
                  {
                    icon: Zap,
                    title: "Early access advantage",
                    desc: "Be among the first creators to access new AI captioning features, premium styles, and workflow updates before public release."
                  }
                ].map((feat, idx) => {
                  const Icon = feat.icon;
                  return (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: idx * 0.1 }}
                      className="glass rounded-3xl p-8 border border-border/80 text-left space-y-4 hover:border-lime/25 glow-hover transition-all"
                    >
                      <div className="size-12 rounded-2xl bg-lime/10 border border-lime/25 grid place-items-center text-lime">
                        <Icon size={20} />
                      </div>
                      <h3 className="text-lg font-bold tracking-tight text-foreground">{feat.title}</h3>
                      <p className="text-muted-foreground text-xs leading-relaxed">{feat.desc}</p>
                    </motion.div>
                  );
                })}
              </div>
            </section>

            {/* ENROLLMENT FORM SECTION */}
            <section
              ref={formSectionRef}
              className="max-w-md mx-auto relative pt-12"
            >
              <div className="absolute -left-12 -top-12 size-40 rounded-full bg-lime/5 blur-3xl pointer-events-none" />

              <div className="glass rounded-[2rem] p-8 border border-border space-y-6 relative z-10">
                <div className="text-center space-y-2">
                  <h2 className="font-display text-2xl font-bold tracking-tight">Secure Launch Spot</h2>
                  <p className="text-muted-foreground text-xs">Fill out the quick launch details below to save your queue position.</p>
                </div>

                <form onSubmit={handleEnroll} className="space-y-4">
                  {/* Name field */}
                  <div className="space-y-1.5 text-left">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Full Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Olivia Park"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className={`w-full bg-secondary/40 border rounded-full px-5 py-3 outline-none text-sm transition-all focus:ring-1 focus:ring-lime ${errors.name ? "border-destructive/50" : "border-border/60"
                        }`}
                    />
                    {errors.name && <span className="text-[10px] text-destructive pl-1 font-semibold">{errors.name}</span>}
                  </div>

                  {/* Email field */}
                  <div className="space-y-1.5 text-left">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Email Address</label>
                    <input
                      type="email"
                      placeholder="e.g. olivia@domain.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={`w-full bg-secondary/40 border rounded-full px-5 py-3 outline-none text-sm transition-all focus:ring-1 focus:ring-lime ${errors.email ? "border-destructive/50" : "border-border/60"
                        }`}
                    />
                    {errors.email && <span className="text-[10px] text-destructive pl-1 font-semibold">{errors.email}</span>}
                  </div>

                  {/* Phone field */}
                  <div className="space-y-1.5 text-left">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Phone Number</label>
                    <input
                      type="tel"
                      placeholder="e.g. +91 98765 43210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className={`w-full bg-secondary/40 border rounded-full px-5 py-3 outline-none text-sm transition-all focus:ring-1 focus:ring-lime ${errors.phone ? "border-destructive/50" : "border-border/60"
                        }`}
                    />
                    {errors.phone && <span className="text-[10px] text-destructive pl-1 font-semibold">{errors.phone}</span>}
                  </div>

                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full btn-lime flex items-center justify-center gap-2 text-sm py-4 cursor-pointer disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          <span>Reserving Spot...</span>
                        </>
                      ) : (
                        <>
                          <Rocket size={16} />
                          <span>Join Pre-Release</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </section>

          </>
        )}

      </div>
    </div>
  );
}
