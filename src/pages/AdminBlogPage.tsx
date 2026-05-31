import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, Eye, Loader2, X } from "lucide-react";
import { useDocumentMeta } from "@/hooks/useDocumentMeta";
import { api } from "@/lib/api";
import { Thumbnail } from "@/components/Thumbnail";

export function AdminBlogPage() {
  useDocumentMeta({
    title: "Blog · Admin",
    description: "Integrit admin blog view.",
    robots: "noindex",
  });

  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [currentPost, setCurrentPost] = useState<any>(null);

  // Form states
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [status, setStatus] = useState("published");
  const [thumbnailImage, setThumbnailImage] = useState<string>("");

  async function loadPosts() {
    setLoading(true);
    try {
      const list = await api.blog.list({ status: "" });
      setPosts(list);
    } catch (err: any) {
      setError(err.message || "Failed to load blog posts");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPosts();
  }, []);

  const handleOpenModal = (post?: any) => {
    if (post) {
      setCurrentPost(post);
      setTitle(post.title);
      setExcerpt(post.excerpt);
      setContent(post.content);
      setTagsInput(post.tags ? post.tags.join(", ") : "");
      setStatus(post.status || "published");
      setThumbnailImage(post.thumbnailImage || "");
    } else {
      setCurrentPost(null);
      setTitle("");
      setExcerpt("");
      setContent("");
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
      const formData = new FormData();
      formData.append("file", file);
      
      const response = await fetch("/api/uploads", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Upload failed");
      
      const data = await response.json();
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

    const payload = {
      title,
      excerpt,
      content,
      tags: parsedTags,
      status,
      thumbnail: currentPost?.thumbnail || "grad-1",
      thumbnailImage: thumbnailImage || undefined,
    };

    try {
      if (currentPost) {
        await api.blog.update(currentPost.slug, payload);
      } else {
        await api.blog.create(payload);
      }
      handleCloseModal();
      loadPosts();
    } catch (err: any) {
      setError(err.message || "Operation failed.");
    }
  };

  const handleDelete = async (slug: string) => {
    if (!window.confirm("Are you sure you want to delete this blog post?")) return;
    try {
      await api.blog.delete(slug);
      loadPosts();
    } catch (err: any) {
      alert(err.message || "Failed to delete blog post.");
    }
  };

  return (
    <div>
      <header className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-4xl font-bold">Blog</h1>
          <p className="text-muted-foreground mt-1">
            {loading ? "Loading posts..." : `${posts.length} posts in database.`}
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="btn-lime inline-flex items-center gap-2 text-sm cursor-pointer"
        >
          <Plus size={14} /> New post
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
                <th className="pb-3">Author</th>
                <th className="pb-3">Date</th>
                <th className="pb-3">Status</th>
                <th className="pb-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => (
                <tr key={post.slug} className="border-t border-border">
                  <td className="py-4 max-w-sm">
                    <div className="font-medium truncate">{post.title}</div>
                    <div className="text-xs text-muted-foreground truncate">{post.excerpt}</div>
                  </td>
                  <td className="py-4">{post.author}</td>
                  <td className="py-4 text-muted-foreground text-xs">{post.date}</td>
                  <td className="py-4">
                    <span
                      className={`text-[10px] uppercase px-2 py-1 rounded-full ${
                        post.status === "published"
                          ? "bg-lime/20 text-lime"
                          : "bg-muted-foreground/20 text-muted-foreground"
                      }`}
                    >
                      {post.status || "Published"}
                    </span>
                  </td>
                  <td className="py-4 text-right">
                    <a
                      href={`/blog/${post.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 hover:text-lime inline-block align-middle"
                    >
                      <Eye size={14} />
                    </a>
                    <button
                      onClick={() => handleOpenModal(post)}
                      className="p-2 hover:text-lime cursor-pointer inline-block align-middle"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(post.slug)}
                      className="p-2 hover:text-destructive cursor-pointer inline-block align-middle"
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

      {/* Modal Dialog */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 grid place-items-center p-4">
          <div className="glass rounded-3xl p-6 w-full max-w-lg relative overflow-y-auto max-h-[90vh]">
            <button
              onClick={handleCloseModal}
              className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-white cursor-pointer"
            >
              <X size={18} />
            </button>
            <h2 className="font-display text-2xl font-bold mb-6">
              {currentPost ? "Edit Blog Post" : "Create Blog Post"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="mb-6">
                <label className="text-xs uppercase tracking-wider text-muted-foreground mb-3 block">
                  Thumbnail Image
                </label>
                <div className="rounded-2xl overflow-hidden aspect-[16/10] w-full">
                  <Thumbnail
                    variant={currentPost?.thumbnail || "grad-1"}
                    imageUrl={thumbnailImage}
                    label={title || "Post"}
                    editable={true}
                    onImageUpload={handleThumbnailUpload}
                    className="w-full h-full"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs uppercase tracking-wider text-muted-foreground mb-1 block">
                  Post Title
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
                  Excerpt
                </label>
                <input
                  type="text"
                  required
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  className="w-full bg-secondary/40 rounded-full px-4 py-2 outline-none focus:ring-1 focus:ring-lime text-sm"
                />
              </div>

              <div>
                <label className="text-xs uppercase tracking-wider text-muted-foreground mb-1 block">
                  Content (HTML / Markdown)
                </label>
                <textarea
                  required
                  rows={8}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
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
                  placeholder="e.g. AI, Strategy, Growth"
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
                  {currentPost ? "Save Changes" : "Publish Post"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
