import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, Pencil, Trash2, Loader2, X } from "lucide-react";
import { useDocumentMeta } from "@/hooks/useDocumentMeta";
import { api } from "@/lib/api";
import { Thumbnail } from "@/components/Thumbnail";

export function AdminProductsPage() {
  useDocumentMeta({
    title: "Products · Admin",
    description: "Integrit admin products view.",
    robots: "noindex",
  });

  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<any>(null); // null means new

  // Form states
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("workflow");
  const [price, setPrice] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [description, setDescription] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [status, setStatus] = useState("published");
  const [thumbnailImage, setThumbnailImage] = useState<string>("");

  async function loadProducts() {
    setLoading(true);
    try {
      // Admin gets all products
      const list = await api.products.list({ status: "" });
      setProducts(list);
    } catch (err: any) {
      setError(err.message || "Failed to load products");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProducts();
  }, []);

  const handleOpenModal = (product?: any) => {
    if (product) {
      setCurrentProduct(product);
      setTitle(product.title);
      setCategory(product.category);
      setPrice(String(product.price));
      setShortDescription(product.shortDescription);
      setDescription(product.description);
      setTagsInput(product.tags ? product.tags.join(", ") : "");
      setStatus(product.status || "published");
      setThumbnailImage(product.thumbnail && !product.thumbnail.startsWith("grad-") ? product.thumbnail : "");
    } else {
      setCurrentProduct(null);
      setTitle("");
      setCategory("workflow");
      setPrice("");
      setShortDescription("");
      setDescription("");
      setTagsInput("");
      setStatus("published");
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
    const parsedTags = tagsInput.split(",").map(t => t.trim()).filter(Boolean);
    const parsedPrice = parseFloat(price);

    const productPayload = {
      title,
      category,
      price: parsedPrice,
      shortDescription,
      description,
      tags: parsedTags,
      status,
      thumbnail: thumbnailImage || currentProduct?.thumbnail || "grad-1",
    };

    try {
      if (currentProduct) {
        // Edit existing
        await api.products.update(currentProduct.slug, productPayload);
      } else {
        // Create new
        await api.products.create(productPayload);
      }
      handleCloseModal();
      loadProducts();
    } catch (err: any) {
      setError(err.message || "Operation failed.");
    }
  };

  const handleDelete = async (slug: string) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      await api.products.delete(slug);
      loadProducts();
    } catch (err: any) {
      alert(err.message || "Failed to delete product.");
    }
  };

  return (
    <div>
      <header className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-4xl font-bold">Products</h1>
          <p className="text-muted-foreground mt-1">
            {loading ? "Loading catalog..." : `${products.length} items in catalog.`}
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="btn-lime inline-flex items-center gap-2 text-sm cursor-pointer"
        >
          <Plus size={14} /> New product
        </button>
      </header>

      {error && <p className="text-sm text-destructive mb-4">{error}</p>}

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="animate-spin text-lime" size={32} />
        </div>
      ) : (
        <div className="glass rounded-3xl p-6 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="pb-3">Title</th>
                <th className="pb-3">Category</th>
                <th className="pb-3">Price</th>
                <th className="pb-3">Status</th>
                <th className="pb-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.slug} className="border-t border-border">
                  <td className="py-4">
                    <div className="font-medium">{product.title}</div>
                    <div className="text-xs text-muted-foreground">{product.slug}</div>
                  </td>
                  <td className="py-4 capitalize text-muted-foreground">{product.category}</td>
                  <td className="py-4 text-lime">${product.price}</td>
                  <td className="py-4">
                    <span
                      className={`text-[10px] uppercase px-2 py-1 rounded-full ${
                        product.status === "published"
                          ? "bg-lime/20 text-lime"
                          : "bg-muted-foreground/20 text-muted-foreground"
                      }`}
                    >
                      {product.status || "Published"}
                    </span>
                  </td>
                  <td className="py-4 text-right">
                    <button
                      onClick={() => handleOpenModal(product)}
                      className="p-2 hover:text-lime cursor-pointer"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(product.slug)}
                      className="p-2 hover:text-destructive cursor-pointer"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal dialog */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 grid place-items-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass rounded-3xl p-6 w-full max-w-lg relative overflow-y-auto max-h-[90vh]"
          >
            <button
              onClick={handleCloseModal}
              className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-white cursor-pointer"
            >
              <X size={18} />
            </button>
            <h2 className="font-display text-2xl font-bold mb-6">
              {currentProduct ? "Edit Product" : "Create Product"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="mb-6">
                <label className="text-xs uppercase tracking-wider text-muted-foreground mb-3 block">
                  Thumbnail Image
                </label>
                <div className="rounded-2xl overflow-hidden aspect-[4/3] w-full">
                  <Thumbnail
                    variant={currentProduct?.thumbnail || "grad-1"}
                    imageUrl={thumbnailImage}
                    label={title || "Product"}
                    editable={true}
                    onImageUpload={handleThumbnailUpload}
                    className="w-full h-full"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs uppercase tracking-wider text-muted-foreground mb-1 block">
                  Product Title
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-secondary/40 rounded-full px-4 py-2 outline-none focus:ring-1 focus:ring-lime text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs uppercase tracking-wider text-muted-foreground mb-1 block">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-secondary/40 rounded-full px-4 py-2 outline-none focus:ring-1 focus:ring-lime text-sm"
                  >
                    <option value="workflow">Workflow</option>
                    <option value="plugin">Plugin</option>
                    <option value="social">Social</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs uppercase tracking-wider text-muted-foreground mb-1 block">
                    Price (USD)
                  </label>
                  <input
                    type="number"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full bg-secondary/40 rounded-full px-4 py-2 outline-none focus:ring-1 focus:ring-lime text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs uppercase tracking-wider text-muted-foreground mb-1 block">
                  Short Description
                </label>
                <input
                  type="text"
                  required
                  value={shortDescription}
                  onChange={(e) => setShortDescription(e.target.value)}
                  className="w-full bg-secondary/40 rounded-full px-4 py-2 outline-none focus:ring-1 focus:ring-lime text-sm"
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

              <div>
                <label className="text-xs uppercase tracking-wider text-muted-foreground mb-1 block">
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  placeholder="e.g. Sales, Outreach, GPT-4"
                  className="w-full bg-secondary/40 rounded-full px-4 py-2 outline-none focus:ring-1 focus:ring-lime text-sm"
                />
              </div>

              <div>
                <label className="text-xs uppercase tracking-wider text-muted-foreground mb-1 block">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full bg-secondary/40 rounded-full px-4 py-2 outline-none focus:ring-1 focus:ring-lime text-sm"
                >
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                </select>
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
                  {currentProduct ? "Save Changes" : "Create Product"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
