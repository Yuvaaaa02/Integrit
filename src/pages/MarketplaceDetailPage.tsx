import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Check, Share2, Star, Loader2, X } from "lucide-react";
import { Section } from "@/components/Section";
import { ProductCard } from "@/components/ProductCard";
import { Thumbnail } from "@/components/Thumbnail";
import { fadeUp, staggerContainer } from "@/animations/variants";
import { useDocumentMeta } from "@/hooks/useDocumentMeta";
import { api } from "@/lib/api";

const tabs = ["Overview", "Features", "Tech Stack", "Workflow", "FAQ"] as const;

export function MarketplaceDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<any>(null);
  const [related, setRelated] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Payment modal state
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [customerEmail, setCustomerEmail] = useState("");
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    async function load() {
      if (!slug) return;
      setLoading(true);
      try {
        const prod = await api.products.get(slug);
        setProduct(prod);

        // Fetch related products in same category
        const allProds = await api.products.list({ category: prod.category });
        setRelated(allProds.filter((p: any) => p.slug !== prod.slug).slice(0, 3));
      } catch (err: any) {
        setError(err.message || "Product not found");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [slug]);

  useDocumentMeta({
    title: product ? `${product.title} — Integrit` : "Product — Integrit",
    description: product?.shortDescription ?? "Browse Integrit products and workflows.",
    ogTitle: product?.title ?? "Integrit Product",
    ogDescription: product?.shortDescription ?? "Browse Integrit products and workflows.",
  });

  const handleBuyNowClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setEmailModalOpen(true);
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerEmail) return;
    setPaying(true);

    alert("payment option is uploaded soon");

    try {
      // 1. Create order on the backend
      const orderData = await api.payments.createOrder({
        customer: customerEmail,
        productSlug: product.slug,
      });

      // 2. Load the Razorpay Checkout script dynamically
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        throw new Error("Razorpay SDK failed to load. Check your internet connection.");
      }

      // 3. Define Razorpay checkout options
      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Integrit",
        description: `Purchase of ${orderData.productName}`,
        order_id: orderData.razorpayOrderId,
        prefill: {
          email: orderData.customerEmail,
        },
        theme: {
          color: "#C0FF34",
        },
        handler: async function (response: any) {
          setPaying(true);
          try {
            const verifyResult = await api.payments.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderId: orderData.orderId,
              paymentId: orderData.paymentId,
            });

            if (verifyResult.verified) {
              setEmailModalOpen(false);
              navigate(`/checkout/success?payment_id=${orderData.paymentId}`);
            } else {
              alert("Payment verification failed.");
            }
          } catch (err: any) {
            alert(err.message || "Payment verification failed.");
          } finally {
            setPaying(false);
          }
        },
        modal: {
          ondismiss: function () {
            setPaying(false);
          },
        },
      };

      // 4. Open Razorpay modal
      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err: any) {
      alert(err.message || "Payment initiation failed.");
      setPaying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] grid place-items-center">
        <Loader2 className="animate-spin text-lime" size={32} />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="text-center py-32">
        <h1 className="font-display text-3xl">Product not found</h1>
        <Link to="/marketplace" className="btn-lime text-sm mt-6 inline-block">
          Back to marketplace
        </Link>
      </div>
    );
  }

  return (
    <ProductDetailContent
      product={product}
      related={related}
      onBuyNow={handleBuyNowClick}
      emailModalOpen={emailModalOpen}
      customerEmail={customerEmail}
      paying={paying}
      setCustomerEmail={setCustomerEmail}
      onCloseModal={() => setEmailModalOpen(false)}
      onPaymentSubmit={handlePaymentSubmit}
    />
  );
}

function ProductDetailContent({
  product,
  related,
  onBuyNow,
  emailModalOpen,
  customerEmail,
  paying,
  setCustomerEmail,
  onCloseModal,
  onPaymentSubmit,
}: {
  product: any;
  related: any[];
  onBuyNow: (e: React.MouseEvent) => void;
  emailModalOpen: boolean;
  customerEmail: string;
  paying: boolean;
  setCustomerEmail: (e: string) => void;
  onCloseModal: () => void;
  onPaymentSubmit: (e: React.FormEvent) => void;
}) {
  const [tab, setTab] = useState<(typeof tabs)[number]>("Overview");

  return (
    <>
      <Section className="py-8">
        <motion.div variants={fadeUp}>
          <Link
            to="/marketplace"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-lime"
          >
            <ArrowLeft size={14} /> Back to marketplace
          </Link>
        </motion.div>
      </Section>

      <Section className="py-6">
        <motion.div variants={fadeUp}>
          <Thumbnail variant={product.thumbnail} className="aspect-[21/9] rounded-[2rem]" label={product.title} />
        </motion.div>
      </Section>

      <Section className="py-12 grid lg:grid-cols-[1fr_360px] gap-10">
        <div>
          <motion.div variants={fadeUp} className="flex items-center gap-2 mb-3 flex-wrap">
            {product.tags &&
              product.tags.map((tag: string) => (
                <span
                  key={tag}
                  className="text-[10px] uppercase tracking-wider px-2 py-1 rounded-full border border-border text-muted-foreground"
                >
                  {tag}
                </span>
              ))}
          </motion.div>
          <motion.h1 variants={fadeUp} className="font-display text-4xl md:text-5xl font-bold mb-3 tracking-tighter">
            {product.title}
          </motion.h1>
          <motion.div variants={fadeUp} className="flex items-center gap-2 text-sm mb-8">
            <Star size={14} className="fill-[var(--lime)] text-lime" />
            <span className="font-medium">{product.rating}</span>
            <span className="text-muted-foreground">({product.reviewCount} reviews)</span>
          </motion.div>

          <motion.div variants={fadeUp} className="flex gap-1 overflow-x-auto mb-8 border-b border-border">
            {tabs.map((item) => (
              <button
                key={item}
                onClick={() => setTab(item)}
                className={`px-4 py-3 text-sm whitespace-nowrap border-b-2 transition-colors cursor-pointer ${
                  tab === item
                    ? "border-lime text-lime"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                {item}
              </button>
            ))}
          </motion.div>

          <motion.div variants={fadeUp} key={tab} className="prose prose-invert max-w-none">
            {tab === "Overview" && <p className="text-muted-foreground leading-relaxed">{product.description}</p>}
            {tab === "Features" && (
              <ul className="space-y-3">
                {product.features &&
                  product.features.map((feature: string) => (
                    <li key={feature} className="flex items-start gap-3">
                      <Check size={18} className="text-lime mt-0.5 shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
              </ul>
            )}
            {tab === "Tech Stack" && (
              <div className="flex flex-wrap gap-2">
                {product.techStack &&
                  product.techStack.map((stackItem: string) => (
                    <span key={stackItem} className="glass rounded-full px-4 py-2 text-sm">
                      {stackItem}
                    </span>
                  ))}
              </div>
            )}
            {tab === "Workflow" && (
              <div className="space-y-4">
                {product.workflowSteps &&
                  product.workflowSteps.map((step: any, index: number) => (
                    <div key={step.title} className="glass rounded-2xl p-5 flex gap-4">
                      <div className="size-10 rounded-full bg-lime text-black grid place-items-center font-bold shrink-0">
                        {index + 1}
                      </div>
                      <div>
                        <h4 className="font-display text-lg">{step.title}</h4>
                        <p className="text-sm text-muted-foreground">{step.description}</p>
                      </div>
                    </div>
                  ))}
              </div>
            )}
            {tab === "FAQ" && (
              <div className="space-y-3">
                {product.faqs &&
                  product.faqs.map((faq: any) => (
                    <div key={faq.q} className="glass rounded-2xl p-5">
                      <h4 className="font-medium mb-2">{faq.q}</h4>
                      <p className="text-sm text-muted-foreground">{faq.a}</p>
                    </div>
                  ))}
              </div>
            )}
          </motion.div>
        </div>

        <motion.aside variants={fadeUp} className="lg:sticky lg:top-28 self-start">
          <div className="glass rounded-3xl p-6">
            <div className="text-sm text-muted-foreground">Starting at</div>
            <div className="font-display text-5xl text-lime my-2">${product.price}</div>
            <div className="text-xs text-muted-foreground mb-6">{product.currency || "USD"} · one-time</div>
            <button onClick={onBuyNow} className="btn-lime w-full block text-center mb-3 cursor-pointer">
              Buy now
            </button>
            <Link to="/contact" className="btn-ghost w-full block text-center text-sm">
              Book a demo
            </Link>
            <button className="mt-4 w-full text-xs text-muted-foreground hover:text-lime inline-flex items-center justify-center gap-2">
              <Share2 size={12} /> Share
            </button>
          </div>
        </motion.aside>
      </Section>

      {related.length > 0 && (
        <Section className="py-20">
          <motion.h2 variants={fadeUp} className="font-display text-3xl font-bold mb-8">
            Related
          </motion.h2>
          <motion.div variants={staggerContainer} className="grid md:grid-cols-3 gap-6">
            {related.map((relatedProduct) => (
              <ProductCard key={relatedProduct.slug} product={relatedProduct} />
            ))}
          </motion.div>
        </Section>
      )}

      {/* Payment simulated email collector modal */}
      {emailModalOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 grid place-items-center p-4">
          <div className="glass rounded-3xl p-6 w-full max-w-sm relative">
            <button
              onClick={onCloseModal}
              className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-white cursor-pointer"
            >
              <X size={18} />
            </button>
            <h3 className="font-display text-xl font-bold mb-4">Complete purchase</h3>
            <p className="text-xs text-muted-foreground mb-6">
              Enter your email below to complete checkout. We will process this through our secure payment gateway.
            </p>

            <form onSubmit={onPaymentSubmit} className="space-y-4">
              <div>
                <label className="text-xs uppercase tracking-wider text-muted-foreground mb-1 block">
                  Email address
                </label>
                <input
                  type="email"
                  required
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="e.g. you@example.com"
                  className="w-full bg-secondary/40 rounded-full px-4 py-2 outline-none focus:ring-1 focus:ring-lime text-sm"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={paying}
                  className="btn-lime w-full text-sm inline-flex justify-center items-center gap-2 cursor-pointer"
                >
                  {paying ? (
                    <>
                      <Loader2 className="animate-spin" size={14} /> Processing...
                    </>
                  ) : (
                    `Pay $${product.price}`
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
