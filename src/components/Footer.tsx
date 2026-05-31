import { Link } from "react-router-dom";
import { useState } from "react";
import { Github, Twitter, Linkedin, Youtube } from "lucide-react";
import logoUrl from "@/assets/logo.png";

export function Footer() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);

  return (
    <footer className="relative border-t border-border mt-32">
      <div className="max-w-7xl mx-auto px-6 py-16 grid gap-12 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <img src={logoUrl} className="size-9 object-contain" alt="Integrit Logo" />
            <span className="font-display font-bold text-xl">Integrit</span>
          </div>
          <p className="text-muted-foreground max-w-sm">
            AI workflows, smart plugins, and growth marketing that scale your business on autopilot.
          </p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (email.includes("@")) {
                setDone(true);
                setEmail("");
              }
            }}
            className="mt-6 flex items-center gap-2 max-w-md glass rounded-full p-1.5"
          >
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              required
              placeholder="you@company.com"
              className="bg-transparent outline-none flex-1 px-4 text-sm"
            />
            <button className="btn-lime text-sm" type="submit">
              {done ? "✓ Subscribed" : "Subscribe"}
            </button>
          </form>
        </div>

        <div>
          <h4 className="font-display text-sm mb-4 text-muted-foreground uppercase tracking-wider">Product</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/marketplace" className="hover:text-lime">Marketplace</Link></li>
            <li><Link to="/services" className="hover:text-lime">Services</Link></li>
            <li><Link to="/blog" className="hover:text-lime">Blog</Link></li>
            <li><Link to="/contact" className="hover:text-lime">Contact</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-display text-sm mb-4 text-muted-foreground uppercase tracking-wider">Connect</h4>
          <div className="flex gap-3">
            {[Twitter, Linkedin, Github, Youtube].map((Icon, i) => (
              <a key={i} href="#" className="size-10 rounded-full glass grid place-items-center glow-hover">
                <Icon size={16} />
              </a>
            ))}
          </div>
        </div>
      </div>
      <div className="border-t border-border py-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Integrit. Engineered for growth.
      </div>
    </footer>
  );
}
