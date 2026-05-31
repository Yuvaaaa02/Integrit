export type Category = "workflow" | "plugin" | "social";

export interface Product {
  slug: string;
  title: string;
  category: Category;
  shortDescription: string;
  description: string;
  price: number;
  currency: string;
  tags: string[];
  rating: number;
  reviewCount: number;
  features: string[];
  techStack: string[];
  workflowSteps: { title: string; description: string }[];
  faqs: { q: string; a: string }[];
  demoUrl?: string;
  thumbnail: string;
}

export const products: Product[] = [
  {
    slug: "autopilot-sales-agent",
    title: "Autopilot Sales Agent",
    category: "workflow",
    shortDescription: "Autonomous AI SDR that books meetings 24/7.",
    description:
      "A multi-step agentic workflow that researches leads, drafts personalized outreach, follows up, and books qualified meetings directly to your calendar.",
    price: 299,
    currency: "USD",
    tags: ["Sales", "Outreach", "Agentic", "GPT-4"],
    rating: 4.9,
    reviewCount: 128,
    features: [
      "Lead enrichment via Apollo + LinkedIn",
      "Personalized multi-channel sequences",
      "Auto-reply handling with intent detection",
      "Calendar booking + CRM sync",
    ],
    techStack: ["OpenAI", "n8n", "Apollo", "HubSpot", "Calendly"],
    workflowSteps: [
      { title: "Discover", description: "Pull ICP-matched leads from data sources." },
      { title: "Research", description: "AI summarizes account + persona signals." },
      { title: "Engage", description: "Sends personalized email + LinkedIn touches." },
      { title: "Convert", description: "Books qualified intros to your calendar." },
    ],
    faqs: [
      { q: "Does it work with my CRM?", a: "Yes — HubSpot, Salesforce, Pipedrive, Attio." },
      { q: "What's the setup time?", a: "Under 30 minutes with guided onboarding." },
    ],
    thumbnail: "grad-1",
  },
  {
    slug: "content-factory-pro",
    title: "Content Factory Pro",
    category: "workflow",
    shortDescription: "Turn one idea into 30 pieces of content automatically.",
    description:
      "End-to-end content engine: blog → tweets → reels script → newsletter → LinkedIn carousel. Publishes on autopilot.",
    price: 199,
    currency: "USD",
    tags: ["Content", "SEO", "Social"],
    rating: 4.8,
    reviewCount: 94,
    features: ["Multi-format repurposing", "Brand voice training", "Auto-publishing", "Performance loop"],
    techStack: ["Claude", "Make.com", "Buffer", "Notion"],
    workflowSteps: [
      { title: "Ideate", description: "Trending topics scored for your niche." },
      { title: "Generate", description: "Draft 30 assets across 6 formats." },
      { title: "Review", description: "One-click human approval queue." },
      { title: "Publish", description: "Schedules to every channel." },
    ],
    faqs: [{ q: "Can I use my brand voice?", a: "Yes — upload samples for training." }],
    thumbnail: "grad-2",
  },
  {
    slug: "slack-ai-assistant",
    title: "Slack AI Assistant",
    category: "plugin",
    shortDescription: "Drop-in AI teammate for your Slack workspace.",
    description: "Answers questions from your docs, summarizes threads, and auto-routes support tickets.",
    price: 79,
    currency: "USD",
    tags: ["Slack", "Support", "RAG"],
    rating: 4.7,
    reviewCount: 211,
    features: ["RAG over Notion/Drive", "Thread summaries", "Ticket triage", "Multi-language"],
    techStack: ["OpenAI", "Pinecone", "Slack Bolt"],
    workflowSteps: [
      { title: "Install", description: "One-click Slack install." },
      { title: "Connect", description: "Hook up Notion, Drive, Linear." },
      { title: "Ask", description: "Mention @ping in any channel." },
      { title: "Resolve", description: "Auto-creates tickets when needed." },
    ],
    faqs: [{ q: "Is my data secure?", a: "All embeddings stored in your private namespace." }],
    thumbnail: "grad-3",
  },
  {
    slug: "shopify-upsell-ai",
    title: "Shopify Upsell AI",
    category: "plugin",
    shortDescription: "AI-driven post-purchase upsells that convert 3x.",
    description: "Personalized upsell offers generated per shopper based on cart, browsing history, and intent.",
    price: 129,
    currency: "USD",
    tags: ["Shopify", "Ecom", "Revenue"],
    rating: 4.9,
    reviewCount: 67,
    features: ["1-click checkout", "Dynamic bundling", "A/B test engine", "Revenue dashboard"],
    techStack: ["Shopify App", "Vercel", "OpenAI"],
    workflowSteps: [
      { title: "Install", description: "Add to your Shopify store in 2 clicks." },
      { title: "Train", description: "Learns from your catalog instantly." },
      { title: "Offer", description: "Shows the perfect upsell at checkout." },
      { title: "Earn", description: "Track lift in real time." },
    ],
    faqs: [{ q: "Does it slow checkout?", a: "No — under 80ms response time." }],
    thumbnail: "grad-4",
  },
  {
    slug: "viral-reels-engine",
    title: "Viral Reels Engine",
    category: "social",
    shortDescription: "30 short-form videos a month, hands-off.",
    description: "Full-service reels production powered by AI scripting + human editors. Done-for-you growth.",
    price: 1499,
    currency: "USD",
    tags: ["Reels", "TikTok", "Growth"],
    rating: 5.0,
    reviewCount: 42,
    features: ["AI script + hook testing", "Pro editor team", "Trend monitoring", "Analytics report"],
    techStack: ["In-house team", "Runway", "CapCut"],
    workflowSteps: [
      { title: "Strategy", description: "Niche + hook research." },
      { title: "Produce", description: "30 reels delivered monthly." },
      { title: "Publish", description: "We post + caption everything." },
      { title: "Iterate", description: "Weekly performance review." },
    ],
    faqs: [{ q: "Do I need to be on camera?", a: "Optional — we support faceless formats too." }],
    thumbnail: "grad-5",
  },
  {
    slug: "linkedin-authority-system",
    title: "LinkedIn Authority System",
    category: "social",
    shortDescription: "Build a personal brand that prints inbound leads.",
    description: "Ghostwriting + posting + DM playbooks designed to position founders as category leaders.",
    price: 999,
    currency: "USD",
    tags: ["LinkedIn", "Personal Brand", "Inbound"],
    rating: 4.9,
    reviewCount: 56,
    features: ["3 posts/week ghostwriting", "DM warmup scripts", "Engagement pods", "Monthly review"],
    techStack: ["Taplio", "Notion", "Calendly"],
    workflowSteps: [
      { title: "Voice", description: "Interview to capture your POV." },
      { title: "Write", description: "Weekly content calendar." },
      { title: "Engage", description: "Build relationships at scale." },
      { title: "Convert", description: "Inbound DMs to discovery calls." },
    ],
    faqs: [{ q: "How long until results?", a: "Most clients see traction in 30 days." }],
    thumbnail: "grad-6",
  },
];

export interface Service {
  slug: string;
  title: string;
  icon: string;
  description: string;
  packages: { name: string; price: number; deliverables: string[]; duration: string }[];
}

export const services: Service[] = [
  {
    slug: "instagram-growth",
    title: "Instagram Growth",
    icon: "📸",
    description: "Organic reach engineered for the algorithm.",
    packages: [
      { name: "Starter", price: 799, duration: "Monthly", deliverables: ["12 posts", "30 stories", "Hashtag strategy"] },
      { name: "Growth", price: 1499, duration: "Monthly", deliverables: ["20 posts", "60 stories", "8 reels", "DM management"] },
      { name: "Scale", price: 2999, duration: "Monthly", deliverables: ["Daily content", "15 reels", "Paid amplification", "Dedicated manager"] },
    ],
  },
  {
    slug: "youtube-automation",
    title: "YouTube Automation",
    icon: "▶️",
    description: "Long-form content engine with AI-assisted production.",
    packages: [
      { name: "Starter", price: 1499, duration: "Monthly", deliverables: ["4 videos", "Thumbnails", "SEO"] },
      { name: "Growth", price: 2999, duration: "Monthly", deliverables: ["8 videos", "Shorts repurposing", "Analytics"] },
      { name: "Scale", price: 4999, duration: "Monthly", deliverables: ["12 videos", "Channel strategy", "Sponsorship outreach"] },
    ],
  },
  {
    slug: "seo-optimization",
    title: "SEO Optimization",
    icon: "🔍",
    description: "Technical + content SEO that compounds.",
    packages: [
      { name: "Audit", price: 499, duration: "One-time", deliverables: ["Full site audit", "Action plan"] },
      { name: "Ongoing", price: 1999, duration: "Monthly", deliverables: ["8 articles", "Backlinks", "Reporting"] },
      { name: "Enterprise", price: 4999, duration: "Monthly", deliverables: ["20 articles", "Programmatic SEO", "Dedicated strategist"] },
    ],
  },
  {
    slug: "paid-ads",
    title: "Paid Ads",
    icon: "🎯",
    description: "Meta + Google + TikTok ads that scale profitably.",
    packages: [
      { name: "Launch", price: 999, duration: "Monthly", deliverables: ["Creative + setup", "1 channel"] },
      { name: "Multi-channel", price: 2499, duration: "Monthly", deliverables: ["3 channels", "Creative rotation", "Weekly review"] },
      { name: "Performance", price: 4999, duration: "Monthly + 5% spend", deliverables: ["All channels", "CRO", "Attribution"] },
    ],
  },
  {
    slug: "ai-content-creation",
    title: "AI Content Creation",
    icon: "✨",
    description: "Branded content at machine speed.",
    packages: [
      { name: "Basic", price: 599, duration: "Monthly", deliverables: ["20 graphics", "10 captions"] },
      { name: "Pro", price: 1299, duration: "Monthly", deliverables: ["50 assets", "Brand voice training"] },
      { name: "Studio", price: 2999, duration: "Monthly", deliverables: ["Unlimited", "Video AI", "Dedicated creator"] },
    ],
  },
  {
    slug: "branding",
    title: "Branding",
    icon: "🎨",
    description: "Identity systems for ambitious companies.",
    packages: [
      { name: "Logo", price: 1499, duration: "2 weeks", deliverables: ["Logo system", "Type", "Color"] },
      { name: "Identity", price: 4999, duration: "4 weeks", deliverables: ["Full brand", "Guidelines", "Templates"] },
      { name: "System", price: 9999, duration: "8 weeks", deliverables: ["Brand + web", "Motion", "Launch kit"] },
    ],
  },
  {
    slug: "funnel-creation",
    title: "Funnel Creation",
    icon: "🚀",
    description: "Conversion-engineered funnels from ad to upsell.",
    packages: [
      { name: "Single", price: 1999, duration: "2 weeks", deliverables: ["Landing page", "Email seq"] },
      { name: "Full funnel", price: 4999, duration: "4 weeks", deliverables: ["Multi-step", "CRM", "Tracking"] },
      { name: "Empire", price: 9999, duration: "8 weeks", deliverables: ["Webinar + upsells", "Affiliate", "Optimization"] },
    ],
  },
];

export interface Testimonial {
  name: string;
  role: string;
  company: string;
  content: string;
  rating: number;
}

export const testimonials: Testimonial[] = [
  { name: "Maya Patel", role: "Founder", company: "Northwind AI", rating: 5, content: "Integrit's Autopilot SDR booked 47 qualified meetings in our first month. Pure ROI." },
  { name: "James Okafor", role: "Head of Growth", company: "Lumen Studio", rating: 5, content: "The Reels Engine 10x'd our reach. We finally have a content moat." },
  { name: "Sofia Reyes", role: "CMO", company: "Drift Commerce", rating: 5, content: "Shopify Upsell AI added $84k in incremental revenue in 60 days. Stupid simple." },
  { name: "Daniel Chen", role: "CEO", company: "Helix Health", rating: 5, content: "Their LinkedIn system turned our cold pipeline into a warm inbound machine." },
  { name: "Aisha Bello", role: "Operations Lead", company: "Mira Labs", rating: 5, content: "Best agency-meets-product team we've worked with. Polished, fast, no fluff." },
];

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  author: string;
  readTime: string;
  tags: string[];
  thumbnail: string;
}

export const blogPosts: BlogPost[] = [
  {
    slug: "agentic-ai-2026",
    title: "The Agentic AI Stack in 2026",
    excerpt: "What every founder needs to know about autonomous workflows that actually ship revenue.",
    content: `<p>In 2026, agentic AI isn't a demo — it's a line item on the P&amp;L. The teams winning right now share three traits...</p><h2>1. They own their workflows</h2><p>Off-the-shelf agents are a starting point. The compounding edge comes from custom orchestration.</p><h2>2. They measure outcomes, not tokens</h2><p>Cost per booked meeting. Cost per closed deal. Tokens are infrastructure, not strategy.</p><h2>3. They invest in evaluation</h2><p>Without evals, you're flying blind. The best teams ship evals before they ship features.</p>`,
    date: "May 12, 2026",
    author: "Integrit Team",
    readTime: "6 min",
    tags: ["AI", "Strategy"],
    thumbnail: "grad-1",
  },
  {
    slug: "viral-loops-playbook",
    title: "The Viral Loops Playbook",
    excerpt: "Five mechanics behind every product that grew without paid acquisition.",
    content: `<p>Virality isn't luck. It's a small set of loops, engineered.</p><h2>Loop 1: Invite</h2><p>Built into the core action.</p><h2>Loop 2: Content</h2><p>Every user creates artifacts that pull in new users.</p>`,
    date: "April 28, 2026",
    author: "Maya Patel",
    readTime: "8 min",
    tags: ["Growth", "Product"],
    thumbnail: "grad-2",
  },
  {
    slug: "rag-vs-fine-tuning",
    title: "RAG vs Fine-Tuning: A Practical Decision Tree",
    excerpt: "When to retrieve, when to train, and when to do both.",
    content: `<p>The short answer: start with RAG. The long answer is more interesting.</p><h2>RAG when...</h2><p>Knowledge changes daily, sources are structured, latency budget is forgiving.</p><h2>Fine-tune when...</h2><p>Style and format matter more than facts. Or when latency is tight.</p>`,
    date: "April 14, 2026",
    author: "Daniel Chen",
    readTime: "5 min",
    tags: ["AI", "Engineering"],
    thumbnail: "grad-3",
  },
];

export const faqs = [
  { q: "How fast can I get started?", a: "Most workflows ship in under 48 hours. Marketing services kick off within a week." },
  { q: "Do you offer custom builds?", a: "Yes — book a consultation and we'll scope a custom agent or system for your stack." },
  { q: "What if it doesn't perform?", a: "Every engagement has a 30-day performance guarantee. If we miss, we make it right." },
  { q: "Which industries do you serve?", a: "SaaS, ecommerce, professional services, and creator-led brands primarily." },
  { q: "Can I white-label?", a: "Reseller and agency partnerships available — reach out to discuss terms." },
  { q: "How is pricing structured?", a: "One-time for plugins, monthly retainers for services, hybrid for managed agents." },
  { q: "Do you integrate with my CRM?", a: "We support HubSpot, Salesforce, Pipedrive, Attio, Close, and custom APIs." },
  { q: "Is there a refund policy?", a: "Yes — 14-day money back on all plugin and workflow purchases." },
];
