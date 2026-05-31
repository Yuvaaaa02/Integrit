import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import logoUrl from "@/assets/logo.png";

const links = [
  { to: "/", label: "Home" },
  { to: "/marketplace", label: "Marketplace" },
  { to: "/services", label: "Services" },
  { to: "/pre-release", label: "Pre-Release" },
  { to: "/blog", label: "Blog" },
  { to: "/contact", label: "Contact" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [location.pathname]);

  return (
    <motion.header
      initial={{ y: -30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="fixed top-4 inset-x-0 z-50 flex justify-center px-4"
    >
      <nav
        className={`flex items-center justify-between gap-6 rounded-full px-3 py-2 w-full max-w-5xl transition-all duration-500 ${
          scrolled ? "glass" : "bg-transparent border border-transparent"
        }`}
      >
        <Link to="/" className="flex items-center gap-3 pl-3">
          <img src={logoUrl} className="size-10 object-contain" alt="Integrit Logo" />
          <span className="font-display font-bold tracking-tight text-2xl">Integrit</span>
        </Link>

        <ul className="hidden md:flex items-center gap-1">
          {links.map((l) => {
            const active = l.to === "/" ? location.pathname === "/" : location.pathname.startsWith(l.to);
            return (
              <li key={l.to}>
                <Link
                  to={l.to}
                  className={`px-4 py-2 rounded-full text-sm transition-colors ${
                    active ? "text-lime" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {l.label}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="flex items-center gap-2">
          <Link to="/contact" className="hidden md:inline-flex btn-lime text-sm">
            Get Started
          </Link>
          <button
            className="md:hidden p-2 rounded-full glass"
            onClick={() => setOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </nav>

      {open && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden absolute top-20 left-4 right-4 glass rounded-3xl p-4 flex flex-col gap-1"
        >
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="px-4 py-3 rounded-2xl text-sm hover:bg-secondary"
            >
              {l.label}
            </Link>
          ))}
          <Link to="/contact" className="btn-lime text-sm text-center mt-2">
            Get Started
          </Link>
        </motion.div>
      )}
    </motion.header>
  );
}
