import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, Loader2, X } from "lucide-react";
import { useDocumentMeta } from "@/hooks/useDocumentMeta";
import { api } from "@/lib/api";
import { Thumbnail } from "@/components/Thumbnail";

export function AdminServicesPage() {
  useDocumentMeta({
    title: "Services · Admin",
    description: "Integrit admin services view.",
    robots: "noindex",
  });

  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [currentService, setCurrentService] = useState<any>(null);

  // Form states
  const [title, setTitle] = useState("");
  const [icon, setIcon] = useState("");
  const [description, setDescription] = useState("");
  const [thumbnailImage, setThumbnailImage] = useState<string>("");

  async function loadServices() {
    setLoading(true);
    try {
      const list = await api.services.list();
      setServices(list);
    } catch (err: any) {
      setError(err.message || "Failed to load services");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadServices();
  }, []);

  const handleOpenModal = (service?: any) => {
    if (service) {
      setCurrentService(service);
      setTitle(service.title);
      setIcon(service.icon);
      setDescription(service.description);
      setThumbnailImage(service.thumbnail && !service.thumbnail.startsWith("grad-") ? service.thumbnail : "");
    } else {
      setCurrentService(null);
      setTitle("");
      setIcon("✨");
      setDescription("");
      setThumbnailImage("");
    }
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  const handleThumbnailUpload = async (file: File) => {
    try {
      const data = await api.uploadImage(file);
      if (data.url) {
        setThumbnailImage(data.url);
      }
    } catch (err) {
      console.error("Thumbnail upload error:", err);
      alert("Failed to upload image");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const payload = {
      title,
      icon,
      description,
      thumbnail: thumbnailImage || currentService?.thumbnail || "grad-1",
      packages: currentService?.packages || [
        { name: "Starter", price: 499, deliverables: ["Deliverable 1"], duration: "Monthly" }
      ]
    };

    try {
      if (currentService) {
        await api.services.update(currentService.slug, payload);
      } else {
        await api.services.create(payload);
      }
      handleCloseModal();
      loadServices();
    } catch (err: any) {
      setError(err.message || "Operation failed.");
    }
  };

  const handleDelete = async (slug: string) => {
    if (!window.confirm("Are you sure you want to delete this service?")) return;
    try {
      await api.services.delete(slug);
      loadServices();
    } catch (err: any) {
      alert(err.message || "Failed to delete service.");
    }
  };

  return (
    <div>
      <header className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-4xl font-bold">Services</h1>
          <p className="text-muted-foreground mt-1">
            {loading ? "Loading services..." : `${services.length} service lines.`}
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="btn-lime inline-flex items-center gap-2 text-sm cursor-pointer"
        >
          <Plus size={14} /> New service
        </button>
      </header>

      {error && <p className="text-sm text-destructive mb-4">{error}</p>}

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="animate-spin text-lime" size={32} />
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {services.map((service) => (
            <div key={service.slug} className="glass rounded-3xl p-6">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="text-2xl mb-2">{service.icon}</div>
                  <h3 className="font-display text-xl">{service.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{service.description}</p>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => handleOpenModal(service)}
                    className="p-2 hover:text-lime cursor-pointer"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(service.slug)}
                    className="p-2 hover:text-destructive cursor-pointer"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                {service.packages &&
                  service.packages.map((pkg: any) => (
                    <span key={pkg.name} className="text-[11px] px-3 py-1 rounded-full border border-border">
                      {pkg.name} · ${pkg.price}
                    </span>
                  ))}
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
              {currentService ? "Edit Service" : "Create Service"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs uppercase tracking-wider text-muted-foreground mb-3 block">
                  Thumbnail Image
                </label>
                <div className="rounded-2xl overflow-hidden aspect-[4/3] w-full">
                  <Thumbnail
                    variant={currentService?.thumbnail || "grad-1"}
                    imageUrl={thumbnailImage}
                    label={title || "Service"}
                    editable={true}
                    onImageUpload={handleThumbnailUpload}
                    className="w-full h-full"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs uppercase tracking-wider text-muted-foreground mb-1 block">
                  Service Title
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-secondary/40 rounded-full px-4 py-2 outline-none focus:ring-1 focus:ring-lime text-sm"
                />
              </div>

              <div>
                <label className="text-xs uppercase tracking-wider text-muted-foreground mb-1 block">
                  Icon (Emoji)
                </label>
                <input
                  type="text"
                  required
                  value={icon}
                  onChange={(e) => setIcon(e.target.value)}
                  placeholder="e.g. 📸, 🚀"
                  className="w-full bg-secondary/40 rounded-full px-4 py-2 outline-none focus:ring-1 focus:ring-lime text-sm text-center font-bold"
                />
              </div>

              <div>
                <label className="text-xs uppercase tracking-wider text-muted-foreground mb-1 block">
                  Description
                </label>
                <textarea
                  required
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
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
                  {currentService ? "Save Changes" : "Create Service"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
