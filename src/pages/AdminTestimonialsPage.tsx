import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, Star, Loader2, X } from "lucide-react";
import { useDocumentMeta } from "@/hooks/useDocumentMeta";
import { api } from "@/lib/api";

export function AdminTestimonialsPage() {
  useDocumentMeta({
    title: "Testimonials · Admin",
    description: "Integrit admin testimonials view.",
    robots: "noindex",
  });

  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [currentTestimonial, setCurrentTestimonial] = useState<any>(null);

  // Form states
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [company, setCompany] = useState("");
  const [content, setContent] = useState("");
  const [rating, setRating] = useState(5);

  async function loadTestimonials() {
    setLoading(true);
    try {
      const list = await api.testimonials.list();
      setTestimonials(list);
    } catch (err: any) {
      setError(err.message || "Failed to load testimonials");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTestimonials();
  }, []);

  const handleOpenModal = (testimonial?: any) => {
    if (testimonial) {
      setCurrentTestimonial(testimonial);
      setName(testimonial.name);
      setRole(testimonial.role);
      setCompany(testimonial.company);
      setContent(testimonial.content);
      setRating(testimonial.rating);
    } else {
      setCurrentTestimonial(null);
      setName("");
      setRole("");
      setCompany("");
      setContent("");
      setRating(5);
    }
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const payload = {
      name,
      role,
      company,
      content,
      rating: Number(rating)
    };

    try {
      if (currentTestimonial) {
        await api.testimonials.update(currentTestimonial.id, payload);
      } else {
        await api.testimonials.create(payload);
      }
      handleCloseModal();
      loadTestimonials();
    } catch (err: any) {
      setError(err.message || "Operation failed.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this testimonial?")) return;
    try {
      await api.testimonials.delete(id);
      loadTestimonials();
    } catch (err: any) {
      alert(err.message || "Failed to delete testimonial.");
    }
  };

  return (
    <div>
      <header className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-4xl font-bold">Testimonials</h1>
          <p className="text-muted-foreground mt-1">
            {loading ? "Loading testimonials..." : `${testimonials.length} published.`}
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="btn-lime inline-flex items-center gap-2 text-sm cursor-pointer"
        >
          <Plus size={14} /> Add testimonial
        </button>
      </header>

      {error && <p className="text-sm text-destructive mb-4">{error}</p>}

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="animate-spin text-lime" size={32} />
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {testimonials.map((testimonial) => (
            <div key={testimonial.id || testimonial.name} className="glass rounded-3xl p-6">
              <div className="flex items-start justify-between mb-3">
                <div className="flex gap-1">
                  {Array.from({ length: testimonial.rating || 5 }).map((_, index) => (
                    <Star key={index} size={12} className="fill-[var(--lime)] text-lime" />
                  ))}
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => handleOpenModal(testimonial)}
                    className="p-1 hover:text-lime cursor-pointer"
                  >
                    <Pencil size={12} />
                  </button>
                  <button
                    onClick={() => handleDelete(testimonial.id)}
                    className="p-1 hover:text-destructive cursor-pointer"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
              <p className="text-sm mb-4">&quot;{testimonial.content}&quot;</p>
              <div className="text-xs text-muted-foreground">
                {testimonial.name} · {testimonial.role}, {testimonial.company}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Dialog */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 grid place-items-center p-4">
          <div className="glass rounded-3xl p-6 w-full max-w-md relative">
            <button
              onClick={handleCloseModal}
              className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-white cursor-pointer"
            >
              <X size={18} />
            </button>
            <h2 className="font-display text-2xl font-bold mb-6">
              {currentTestimonial ? "Edit Testimonial" : "Add Testimonial"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs uppercase tracking-wider text-muted-foreground mb-1 block">
                  Customer Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-secondary/40 rounded-full px-4 py-2 outline-none focus:ring-1 focus:ring-lime text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs uppercase tracking-wider text-muted-foreground mb-1 block">
                    Role / Position
                  </label>
                  <input
                    type="text"
                    required
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    placeholder="e.g. Founder, CMO"
                    className="w-full bg-secondary/40 rounded-full px-4 py-2 outline-none focus:ring-1 focus:ring-lime text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs uppercase tracking-wider text-muted-foreground mb-1 block">
                    Company
                  </label>
                  <input
                    type="text"
                    required
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="e.g. Northwind AI"
                    className="w-full bg-secondary/40 rounded-full px-4 py-2 outline-none focus:ring-1 focus:ring-lime text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs uppercase tracking-wider text-muted-foreground mb-1 block">
                  Rating
                </label>
                <select
                  value={rating}
                  onChange={(e) => setRating(Number(e.target.value))}
                  className="w-full bg-secondary/40 rounded-full px-4 py-2 outline-none focus:ring-1 focus:ring-lime text-sm"
                >
                  <option value={5}>5 Stars</option>
                  <option value={4}>4 Stars</option>
                  <option value={3}>3 Stars</option>
                  <option value={2}>2 Stars</option>
                  <option value={1}>1 Star</option>
                </select>
              </div>

              <div>
                <label className="text-xs uppercase tracking-wider text-muted-foreground mb-1 block">
                  Feedback Content
                </label>
                <textarea
                  required
                  rows={4}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full bg-secondary/40 rounded-3xl px-4 py-3 outline-none focus:ring-1 focus:ring-lime text-sm"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="btn-ghost text-sm cursor-pointer"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-lime text-sm cursor-pointer">
                  {currentTestimonial ? "Save Changes" : "Add Testimonial"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
