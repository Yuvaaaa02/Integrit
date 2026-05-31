import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Video, Play, Volume2, VolumeX } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { fadeUp } from "@/animations/variants";

interface PreReleaseConfig {
  enabled: boolean;
  title: string;
  subtitle: string;
  videoUrl: string;
  thumbnail: string;
  ctaText: string;
  badge: string;
}

export function PreReleaseSection({ config }: { config: PreReleaseConfig }) {
  const [muted, setMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const [counter, setCounter] = useState(148); // mock enrollment counter that ticks up
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // Tick counter up slowly to simulate live enrollments activity
    const timer = setInterval(() => {
      setCounter((prev) => prev + (Math.random() > 0.65 ? 1 : 0));
    }, 12000);
    return () => clearInterval(timer);
  }, []);

  const handlePlayToggle = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play().catch(() => {});
    }
    setIsPlaying(!isPlaying);
  };

  const handleMuteToggle = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !muted;
    setMuted(!muted);
  };

  const isEmbed = config.videoUrl?.includes("youtube.com") || 
                  config.videoUrl?.includes("youtu.be") || 
                  config.videoUrl?.includes("vimeo.com");

  return (
    <div className="relative overflow-hidden rounded-[2.5rem] border border-border/60 bg-secondary/20 p-8 md:p-16 my-16">
      {/* Decorative gradient glowing orb */}
      <div 
        className="absolute -right-20 -top-20 w-80 h-80 rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(192,255,52,0.12), transparent 70%)",
          filter: "blur(30px)",
        }}
      />
      
      <div className="grid lg:grid-cols-12 gap-12 items-center relative z-10">
        
        {/* Left Info Column */}
        <div className="lg:col-span-6 space-y-6">
          <div className="inline-flex items-center gap-2 bg-lime/10 border border-lime/25 text-lime rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-wider">
            <Sparkles size={12} className="animate-spin-slow" />
            <span>{config.badge || "Coming Soon"}</span>
          </div>

          <h2 className="font-display text-4xl md:text-5xl font-bold tracking-tight leading-none text-foreground">
            {config.title || "Next-Gen AI Workflow"}
          </h2>

          <p className="text-muted-foreground text-base md:text-lg leading-relaxed">
            {config.subtitle || "Get ready to automate your repetitive business tasks with our custom upcoming agent stack."}
          </p>

          {/* Enrollment Live Counter */}
          <div className="flex items-center gap-3 text-sm text-lime bg-lime/5 border border-lime/10 rounded-2xl p-4 w-fit">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-lime opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-lime"></span>
            </span>
            <span className="font-mono font-semibold">{counter.toLocaleString()}</span>
            <span className="text-muted-foreground font-medium">ambitious teams already enrolled</span>
          </div>

          <div className="pt-2">
            <Link 
              to="/pre-release" 
              className="btn-lime inline-flex items-center gap-3 px-8 py-4 text-sm font-semibold tracking-wide hover:scale-[1.03] active:scale-[0.98] transition-all cursor-pointer"
            >
              <span>{config.ctaText || "Enroll Now"}</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>

        {/* Right Teaser Video Showcase Column */}
        <div className="lg:col-span-6">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="glass rounded-3xl overflow-hidden aspect-video relative group shadow-2xl border border-border"
          >
            {isEmbed ? (
              // Embed (YouTube / Vimeo)
              <iframe
                src={config.videoUrl}
                className="w-full h-full border-0 absolute inset-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title="Pre-Release Teaser Video"
                loading="lazy"
              />
            ) : config.videoUrl ? (
              // Standard MP4
              <>
                <video
                  ref={videoRef}
                  src={config.videoUrl}
                  className="w-full h-full object-cover"
                  autoPlay
                  muted={muted}
                  loop
                  playsInline
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                />
                
                {/* Media Control Bar overlays on hover */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-4">
                  <button 
                    onClick={handlePlayToggle}
                    className="p-3.5 bg-lime text-black rounded-full hover:scale-110 active:scale-95 transition-transform cursor-pointer"
                  >
                    {isPlaying ? <span className="block w-3.5 h-3.5 border-l-4 border-r-4 border-black box-border" style={{ borderStyle: 'double' }} /> : <Play size={16} fill="currentColor" />}
                  </button>
                  <button 
                    onClick={handleMuteToggle}
                    className="p-3.5 bg-white/10 hover:bg-white/20 text-white rounded-full hover:scale-110 active:scale-95 transition-transform cursor-pointer"
                  >
                    {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                  </button>
                </div>
              </>
            ) : (
              // Fallback Thumbnail variant
              <div className="w-full h-full flex flex-col items-center justify-center bg-secondary/30 text-muted-foreground p-8 text-center select-none">
                <Video size={40} className="text-lime/40 mb-3 animate-pulse" />
                <p className="text-sm font-semibold tracking-tight text-foreground">Launch Teaser Video</p>
                <p className="text-xs text-muted-foreground/80 mt-1 max-w-[240px]">Preview player loaded and ready. Join launch list to watch live stream demo.</p>
              </div>
            )}
          </motion.div>
        </div>

      </div>
    </div>
  );
}
