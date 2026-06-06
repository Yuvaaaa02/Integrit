import path from 'node:path';
import { fileURLToPath } from 'node:url';
import bcrypt from 'bcryptjs';
import { JsonStore } from './JsonStore.js';

/**
 * Seed all JSON storage files with initial data.
 * Only seeds if the file is empty (first run).
 */
export async function seedAll() {
  console.log('🌱 Checking seed data...');

  // ── Admins ──
  const adminStore = new JsonStore('admins.json');
  const adminSeeded = await adminStore.seed([
    {
      id: 'admin_001',
      username: 'admin',
      email: 'admin@example.com',
      password: await bcrypt.hash('Admin@123', 10),
      name: 'Integrit Admin',
      role: 'super_admin',
      avatar: null,
    },
  ]);
  if (adminSeeded) console.log('  ✓ admins.json seeded');

  // ── Products ──
  const productStore = new JsonStore('products.json');
  const productSeeded = await productStore.seed([
    {
      slug: 'autopilot-sales-agent',
      title: 'Autopilot Sales Agent',
      category: 'workflow',
      shortDescription: 'Autonomous AI SDR that books meetings 24/7.',
      description: 'A multi-step agentic workflow that researches leads, drafts personalized outreach, follows up, and books qualified meetings directly to your calendar.',
      price: 299,
      currency: 'USD',
      tags: ['Sales', 'Outreach', 'Agentic', 'GPT-4'],
      rating: 4.9,
      reviewCount: 128,
      features: [
        'Lead enrichment via Apollo + LinkedIn',
        'Personalized multi-channel sequences',
        'Auto-reply handling with intent detection',
        'Calendar booking + CRM sync',
      ],
      techStack: ['OpenAI', 'n8n', 'Apollo', 'HubSpot', 'Calendly'],
      workflowSteps: [
        { title: 'Discover', description: 'Pull ICP-matched leads from data sources.' },
        { title: 'Research', description: 'AI summarizes account + persona signals.' },
        { title: 'Engage', description: 'Sends personalized email + LinkedIn touches.' },
        { title: 'Convert', description: 'Books qualified intros to your calendar.' },
      ],
      faqs: [
        { q: 'Does it work with my CRM?', a: 'Yes — HubSpot, Salesforce, Pipedrive, Attio.' },
        { q: "What's the setup time?", a: 'Under 30 minutes with guided onboarding.' },
      ],
      demoUrl: null,
      thumbnail: 'grad-1',
      status: 'published',
    },
    {
      slug: 'content-factory-pro',
      title: 'Content Factory Pro',
      category: 'workflow',
      shortDescription: 'Turn one idea into 30 pieces of content automatically.',
      description: 'End-to-end content engine: blog → tweets → reels script → newsletter → LinkedIn carousel. Publishes on autopilot.',
      price: 199,
      currency: 'USD',
      tags: ['Content', 'SEO', 'Social'],
      rating: 4.8,
      reviewCount: 94,
      features: ['Multi-format repurposing', 'Brand voice training', 'Auto-publishing', 'Performance loop'],
      techStack: ['Claude', 'Make.com', 'Buffer', 'Notion'],
      workflowSteps: [
        { title: 'Ideate', description: 'Trending topics scored for your niche.' },
        { title: 'Generate', description: 'Draft 30 assets across 6 formats.' },
        { title: 'Review', description: 'One-click human approval queue.' },
        { title: 'Publish', description: 'Schedules to every channel.' },
      ],
      faqs: [{ q: 'Can I use my brand voice?', a: 'Yes — upload samples for training.' }],
      thumbnail: 'grad-2',
      status: 'published',
    },
    {
      slug: 'slack-ai-assistant',
      title: 'Slack AI Assistant',
      category: 'plugin',
      shortDescription: 'Drop-in AI teammate for your Slack workspace.',
      description: 'Answers questions from your docs, summarizes threads, and auto-routes support tickets.',
      price: 79,
      currency: 'USD',
      tags: ['Slack', 'Support', 'RAG'],
      rating: 4.7,
      reviewCount: 211,
      features: ['RAG over Notion/Drive', 'Thread summaries', 'Ticket triage', 'Multi-language'],
      techStack: ['OpenAI', 'Pinecone', 'Slack Bolt'],
      workflowSteps: [
        { title: 'Install', description: 'One-click Slack install.' },
        { title: 'Connect', description: 'Hook up Notion, Drive, Linear.' },
        { title: 'Ask', description: 'Mention @ping in any channel.' },
        { title: 'Resolve', description: 'Auto-creates tickets when needed.' },
      ],
      faqs: [{ q: 'Is my data secure?', a: 'All embeddings stored in your private namespace.' }],
      thumbnail: 'grad-3',
      status: 'published',
    },
    {
      slug: 'shopify-upsell-ai',
      title: 'Shopify Upsell AI',
      category: 'plugin',
      shortDescription: 'AI-driven post-purchase upsells that convert 3x.',
      description: 'Personalized upsell offers generated per shopper based on cart, browsing history, and intent.',
      price: 129,
      currency: 'USD',
      tags: ['Shopify', 'Ecom', 'Revenue'],
      rating: 4.9,
      reviewCount: 67,
      features: ['1-click checkout', 'Dynamic bundling', 'A/B test engine', 'Revenue dashboard'],
      techStack: ['Shopify App', 'Vercel', 'OpenAI'],
      workflowSteps: [
        { title: 'Install', description: 'Add to your Shopify store in 2 clicks.' },
        { title: 'Train', description: 'Learns from your catalog instantly.' },
        { title: 'Offer', description: 'Shows the perfect upsell at checkout.' },
        { title: 'Earn', description: 'Track lift in real time.' },
      ],
      faqs: [{ q: 'Does it slow checkout?', a: 'No — under 80ms response time.' }],
      thumbnail: 'grad-4',
      status: 'published',
    },
    {
      slug: 'viral-reels-engine',
      title: 'Viral Reels Engine',
      category: 'social',
      shortDescription: '30 short-form videos a month, hands-off.',
      description: 'Full-service reels production powered by AI scripting + human editors. Done-for-you growth.',
      price: 1499,
      currency: 'USD',
      tags: ['Reels', 'TikTok', 'Growth'],
      rating: 5.0,
      reviewCount: 42,
      features: ['AI script + hook testing', 'Pro editor team', 'Trend monitoring', 'Analytics report'],
      techStack: ['In-house team', 'Runway', 'CapCut'],
      workflowSteps: [
        { title: 'Strategy', description: 'Niche + hook research.' },
        { title: 'Produce', description: '30 reels delivered monthly.' },
        { title: 'Publish', description: 'We post + caption everything.' },
        { title: 'Iterate', description: 'Weekly performance review.' },
      ],
      faqs: [{ q: 'Do I need to be on camera?', a: 'Optional — we support faceless formats too.' }],
      thumbnail: 'grad-5',
      status: 'published',
    },
    {
      slug: 'linkedin-authority-system',
      title: 'LinkedIn Authority System',
      category: 'social',
      shortDescription: 'Build a personal brand that prints inbound leads.',
      description: 'Ghostwriting + posting + DM playbooks designed to position founders as category leaders.',
      price: 999,
      currency: 'USD',
      tags: ['LinkedIn', 'Personal Brand', 'Inbound'],
      rating: 4.9,
      reviewCount: 56,
      features: ['3 posts/week ghostwriting', 'DM warmup scripts', 'Engagement pods', 'Monthly review'],
      techStack: ['Taplio', 'Notion', 'Calendly'],
      workflowSteps: [
        { title: 'Voice', description: 'Interview to capture your POV.' },
        { title: 'Write', description: 'Weekly content calendar.' },
        { title: 'Engage', description: 'Build relationships at scale.' },
        { title: 'Convert', description: 'Inbound DMs to discovery calls.' },
      ],
      faqs: [{ q: 'How long until results?', a: 'Most clients see traction in 30 days.' }],
      thumbnail: 'grad-6',
      status: 'published',
    },
  ]);
  if (productSeeded) console.log('  ✓ products.json seeded');

  // ── Services ──
  const serviceStore = new JsonStore('services.json');
  const serviceSeeded = await serviceStore.seed([
    {
      slug: 'instagram-growth',
      title: 'Instagram Growth',
      icon: '📸',
      description: 'Organic reach engineered for the algorithm.',
      packages: [
        { name: 'Starter', price: 799, duration: 'Monthly', deliverables: ['12 posts', '30 stories', 'Hashtag strategy'] },
        { name: 'Growth', price: 1499, duration: 'Monthly', deliverables: ['20 posts', '60 stories', '8 reels', 'DM management'] },
        { name: 'Scale', price: 2999, duration: 'Monthly', deliverables: ['Daily content', '15 reels', 'Paid amplification', 'Dedicated manager'] },
      ],
    },
    {
      slug: 'youtube-automation',
      title: 'YouTube Automation',
      icon: '▶️',
      description: 'Long-form content engine with AI-assisted production.',
      packages: [
        { name: 'Starter', price: 1499, duration: 'Monthly', deliverables: ['4 videos', 'Thumbnails', 'SEO'] },
        { name: 'Growth', price: 2999, duration: 'Monthly', deliverables: ['8 videos', 'Shorts repurposing', 'Analytics'] },
        { name: 'Scale', price: 4999, duration: 'Monthly', deliverables: ['12 videos', 'Channel strategy', 'Sponsorship outreach'] },
      ],
    },
    {
      slug: 'seo-optimization',
      title: 'SEO Optimization',
      icon: '🔍',
      description: 'Technical + content SEO that compounds.',
      packages: [
        { name: 'Audit', price: 499, duration: 'One-time', deliverables: ['Full site audit', 'Action plan'] },
        { name: 'Ongoing', price: 1999, duration: 'Monthly', deliverables: ['8 articles', 'Backlinks', 'Reporting'] },
        { name: 'Enterprise', price: 4999, duration: 'Monthly', deliverables: ['20 articles', 'Programmatic SEO', 'Dedicated strategist'] },
      ],
    },
    {
      slug: 'paid-ads',
      title: 'Paid Ads',
      icon: '🎯',
      description: 'Meta + Google + TikTok ads that scale profitably.',
      packages: [
        { name: 'Launch', price: 999, duration: 'Monthly', deliverables: ['Creative + setup', '1 channel'] },
        { name: 'Multi-channel', price: 2499, duration: 'Monthly', deliverables: ['3 channels', 'Creative rotation', 'Weekly review'] },
        { name: 'Performance', price: 4999, duration: 'Monthly + 5% spend', deliverables: ['All channels', 'CRO', 'Attribution'] },
      ],
    },
    {
      slug: 'ai-content-creation',
      title: 'AI Content Creation',
      icon: '✨',
      description: 'Branded content at machine speed.',
      packages: [
        { name: 'Basic', price: 599, duration: 'Monthly', deliverables: ['20 graphics', '10 captions'] },
        { name: 'Pro', price: 1299, duration: 'Monthly', deliverables: ['50 assets', 'Brand voice training'] },
        { name: 'Studio', price: 2999, duration: 'Monthly', deliverables: ['Unlimited', 'Video AI', 'Dedicated creator'] },
      ],
    },
    {
      slug: 'branding',
      title: 'Branding',
      icon: '🎨',
      description: 'Identity systems for ambitious companies.',
      packages: [
        { name: 'Logo', price: 1499, duration: '2 weeks', deliverables: ['Logo system', 'Type', 'Color'] },
        { name: 'Identity', price: 4999, duration: '4 weeks', deliverables: ['Full brand', 'Guidelines', 'Templates'] },
        { name: 'System', price: 9999, duration: '8 weeks', deliverables: ['Brand + web', 'Motion', 'Launch kit'] },
      ],
    },
    {
      slug: 'funnel-creation',
      title: 'Funnel Creation',
      icon: '🚀',
      description: 'Conversion-engineered funnels from ad to upsell.',
      packages: [
        { name: 'Single', price: 1999, duration: '2 weeks', deliverables: ['Landing page', 'Email seq'] },
        { name: 'Full funnel', price: 4999, duration: '4 weeks', deliverables: ['Multi-step', 'CRM', 'Tracking'] },
        { name: 'Empire', price: 9999, duration: '8 weeks', deliverables: ['Webinar + upsells', 'Affiliate', 'Optimization'] },
      ],
    },
  ]);
  if (serviceSeeded) console.log('  ✓ services.json seeded');

  // ── Blog Posts ──
  const blogStore = new JsonStore('blog-posts.json');
  const blogSeeded = await blogStore.seed([
    {
      slug: 'agentic-ai-2026',
      title: 'The Agentic AI Stack in 2026',
      excerpt: 'What every founder needs to know about autonomous workflows that actually ship revenue.',
      content: '<p>In 2026, agentic AI isn\'t a demo — it\'s a line item on the P&amp;L. The teams winning right now share three traits...</p><h2>1. They own their workflows</h2><p>Off-the-shelf agents are a starting point. The compounding edge comes from custom orchestration.</p><h2>2. They measure outcomes, not tokens</h2><p>Cost per booked meeting. Cost per closed deal. Tokens are infrastructure, not strategy.</p><h2>3. They invest in evaluation</h2><p>Without evals, you\'re flying blind. The best teams ship evals before they ship features.</p>',
      date: 'May 12, 2026',
      author: 'Integrit Team',
      readTime: '6 min',
      tags: ['AI', 'Strategy'],
      thumbnail: 'grad-1',
      status: 'published',
    },
    {
      slug: 'viral-loops-playbook',
      title: 'The Viral Loops Playbook',
      excerpt: 'Five mechanics behind every product that grew without paid acquisition.',
      content: '<p>Virality isn\'t luck. It\'s a small set of loops, engineered.</p><h2>Loop 1: Invite</h2><p>Built into the core action.</p><h2>Loop 2: Content</h2><p>Every user creates artifacts that pull in new users.</p>',
      date: 'April 28, 2026',
      author: 'Maya Patel',
      readTime: '8 min',
      tags: ['Growth', 'Product'],
      thumbnail: 'grad-2',
      status: 'published',
    },
    {
      slug: 'rag-vs-fine-tuning',
      title: 'RAG vs Fine-Tuning: A Practical Decision Tree',
      excerpt: 'When to retrieve, when to train, and when to do both.',
      content: '<p>The short answer: start with RAG. The long answer is more interesting.</p><h2>RAG when...</h2><p>Knowledge changes daily, sources are structured, latency budget is forgiving.</p><h2>Fine-tune when...</h2><p>Style and format matter more than facts. Or when latency is tight.</p>',
      date: 'April 14, 2026',
      author: 'Daniel Chen',
      readTime: '5 min',
      tags: ['AI', 'Engineering'],
      thumbnail: 'grad-3',
      status: 'published',
    },
  ]);
  if (blogSeeded) console.log('  ✓ blog-posts.json seeded');

  // ── Testimonials ──
  const testimonialStore = new JsonStore('testimonials.json');
  const testimonialSeeded = await testimonialStore.seed([
    { name: 'Maya Patel', role: 'Founder', company: 'Northwind AI', rating: 5, content: "Integrit's Autopilot SDR booked 47 qualified meetings in our first month. Pure ROI." },
    { name: 'James Okafor', role: 'Head of Growth', company: 'Lumen Studio', rating: 5, content: "The Reels Engine 10x'd our reach. We finally have a content moat." },
    { name: 'Sofia Reyes', role: 'CMO', company: 'Drift Commerce', rating: 5, content: 'Shopify Upsell AI added $84k in incremental revenue in 60 days. Stupid simple.' },
    { name: 'Daniel Chen', role: 'CEO', company: 'Helix Health', rating: 5, content: 'Their LinkedIn system turned our cold pipeline into a warm inbound machine.' },
    { name: 'Aisha Bello', role: 'Operations Lead', company: 'Mira Labs', rating: 5, content: "Best agency-meets-product team we've worked with. Polished, fast, no fluff." },
  ]);
  if (testimonialSeeded) console.log('  ✓ testimonials.json seeded');

  // ── FAQs ──
  const faqStore = new JsonStore('faqs.json');
  const faqSeeded = await faqStore.seed([
    { q: 'How fast can I get started?', a: 'Most workflows ship in under 48 hours. Marketing services kick off within a week.' },
    { q: 'Do you offer custom builds?', a: 'Yes — book a consultation and we\'ll scope a custom agent or system for your stack.' },
    { q: "What if it doesn't perform?", a: 'Every engagement has a 30-day performance guarantee. If we miss, we make it right.' },
    { q: 'Which industries do you serve?', a: 'SaaS, ecommerce, professional services, and creator-led brands primarily.' },
    { q: 'Can I white-label?', a: 'Reseller and agency partnerships available — reach out to discuss terms.' },
    { q: 'How is pricing structured?', a: 'One-time for plugins, monthly retainers for services, hybrid for managed agents.' },
    { q: 'Do you integrate with my CRM?', a: 'We support HubSpot, Salesforce, Pipedrive, Attio, Close, and custom APIs.' },
    { q: 'Is there a refund policy?', a: 'Yes — 14-day money back on all plugin and workflow purchases.' },
  ]);
  if (faqSeeded) console.log('  ✓ faqs.json seeded');

  // ── Orders (mock) ──
  const orderStore = new JsonStore('orders.json');
  const orderSeeded = await orderStore.seed([
    { orderId: 'ord_8821', customer: 'maya@northwind.ai', product: 'Autopilot Sales Agent', productSlug: 'autopilot-sales-agent', amount: 299, currency: 'USD', gateway: 'razorpay', status: 'paid', date: '2026-05-29' },
    { orderId: 'ord_8820', customer: 'james@lumen.studio', product: 'Viral Reels Engine', productSlug: 'viral-reels-engine', amount: 1499, currency: 'USD', gateway: 'razorpay', status: 'paid', date: '2026-05-29' },
    { orderId: 'ord_8819', customer: 'sofia@drift.co', product: 'Slack AI Assistant', productSlug: 'slack-ai-assistant', amount: 79, currency: 'USD', gateway: 'razorpay', status: 'paid', date: '2026-05-28' },
    { orderId: 'ord_8818', customer: 'daniel@helix.health', product: 'LinkedIn Authority System', productSlug: 'linkedin-authority-system', amount: 999, currency: 'USD', gateway: 'razorpay', status: 'pending', date: '2026-05-28' },
    { orderId: 'ord_8817', customer: 'aisha@miralabs.io', product: 'Content Factory Pro', productSlug: 'content-factory-pro', amount: 199, currency: 'USD', gateway: 'razorpay', status: 'paid', date: '2026-05-27' },
    { orderId: 'ord_8816', customer: 'tom@apex.ventures', product: 'Shopify Upsell AI', productSlug: 'shopify-upsell-ai', amount: 129, currency: 'USD', gateway: 'razorpay', status: 'failed', date: '2026-05-26' },
  ]);
  if (orderSeeded) console.log('  ✓ orders.json seeded');

  // ── Inquiries (mock) ──
  const inquiryStore = new JsonStore('inquiries.json');
  const inquirySeeded = await inquiryStore.seed([
    { name: 'Olivia Park', email: 'olivia@apex.io', phone: '', type: 'consultation', message: 'Looking to build a custom sales agent for our outbound team.', date: '2026-05-29', read: false },
    { name: 'Marcus Lee', email: 'm.lee@drift.com', phone: '', type: 'inquiry', message: "What's pricing for the YouTube automation package at scale?", date: '2026-05-28', read: false },
    { name: 'Priya Nair', email: 'priya@helix.health', phone: '', type: 'consultation', message: 'Need a LinkedIn ghostwriting system for 3 execs.', date: '2026-05-27', read: true },
    { name: 'Tom Becker', email: 'tom@orbital.studio', phone: '', type: 'inquiry', message: 'Do you offer reseller pricing?', date: '2026-05-26', read: true },
  ]);
  if (inquirySeeded) console.log('  ✓ inquiries.json seeded');

  // ── Payments (empty) ──
  const paymentStore = new JsonStore('payments.json');
  await paymentStore.seed([]);
  console.log('  ✓ payments.json ready');

  // ── Analytics ──
  const analyticsStore = new JsonStore('analytics.json');
  const analyticsSeeded = await analyticsStore.seed([
    {
      type: 'summary',
      totalUsers: 1,
      totalOrders: 6,
      totalRevenue: 48920,
      totalInquiries: 4,
      loginAttempts: 0,
      paymentAttempts: 0,
      apiCalls: 0,
    },
  ]);
  if (analyticsSeeded) console.log('  ✓ analytics.json seeded');

  // ── Sessions (empty) ──
  const sessionStore = new JsonStore('sessions.json');
  await sessionStore.seed([]);
  console.log('  ✓ sessions.json ready');

  // ── Settings ──
  const settingsStore = new JsonStore('settings.json');
  const settingsSeeded = await settingsStore.seed([
    {
      type: 'app',
      siteName: 'Integrit',
      contactEmail: 'hello@integrit.ai',
      whatsapp: '+1 (555) 555-0100',
      address: 'Remote-first · NYC / Lisbon / Bangalore',
      currency: 'USD',
      bookingUrl: 'https://calendly.com',
    },
  ]);
  if (settingsSeeded) console.log('  ✓ settings.json seeded');

  // ── Logs (empty) ──
  const logStore = new JsonStore('logs.json');
  await logStore.seed([]);
  console.log('  ✓ logs.json ready');

  // ── Pre-Release Config (custom data folder) ──
  const prereleaseConfigStore = new JsonStore(
    'prerelease-config.json',
    path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../data')
  );
  const prereleaseConfigSeeded = await prereleaseConfigStore.seed([
    {
      enabled: true,
      title: "Integrit Sales Autopilot Agent",
      subtitle: "Hire our next-gen autonomous SDR workflow to book qualified calls directly on your calendar, 24/7.",
      videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
      thumbnail: "grad-1",
      ctaText: "Enroll Now",
      badge: "Coming Soon"
    }
  ]);
  if (prereleaseConfigSeeded) console.log('  ✓ prerelease-config.json seeded');

  console.log('🌱 Seed check complete.\n');
}
