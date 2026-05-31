import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Section } from "@/components/Section";
import { Thumbnail } from "@/components/Thumbnail";
import { BlogCard } from "@/components/BlogCard";
import { fadeUp, staggerContainer } from "@/animations/variants";
import { useDocumentMeta } from "@/hooks/useDocumentMeta";
import { api } from "@/lib/api";

export function BlogPostPage() {
  const { slug } = useParams();
  const [post, setPost] = useState<any>(null);
  const [related, setRelated] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      if (!slug) return;
      setLoading(true);
      try {
        const postData = await api.blog.get(slug);
        setPost(postData);

        // Fetch other blog posts to show related articles
        const list = await api.blog.list();
        setRelated(list.filter((p: any) => p.slug !== postData.slug).slice(0, 2));
      } catch (err: any) {
        setError(err.message || "Failed to load post");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [slug]);

  useDocumentMeta({
    title: post ? `${post.title} — Integrit` : "Post — Integrit",
    description: post?.excerpt ?? "Read the latest Integrit field notes.",
    ogTitle: post?.title ?? "Integrit Blog",
    ogDescription: post?.excerpt ?? "Read the latest Integrit field notes.",
  });

  if (loading) {
    return (
      <div className="min-h-[50vh] grid place-items-center">
        <Loader2 className="animate-spin text-lime" size={32} />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="text-center py-32">
        <h1 className="font-display text-3xl">Post not found</h1>
        <Link to="/blog" className="btn-lime text-sm mt-6 inline-block">
          Back to blog
        </Link>
      </div>
    );
  }

  return (
    <>
      <Section className="py-8">
        <motion.div variants={fadeUp}>
          <Link to="/blog" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-lime">
            <ArrowLeft size={14} /> All posts
          </Link>
        </motion.div>
      </Section>

      <Section className="py-6">
        <motion.div variants={fadeUp}>
          <Thumbnail variant={post.thumbnail} className="aspect-[21/9] rounded-[2rem]" label={post.title} />
        </motion.div>
      </Section>

      <article className="max-w-3xl mx-auto px-6 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
            {post.tags &&
              post.tags.map((tag: string) => (
                <span key={tag} className="px-2 py-1 rounded-full border border-border">
                  {tag}
                </span>
              ))}
          </div>
          <h1 className="font-display text-4xl md:text-6xl font-bold tracking-tighter mb-6">
            {post.title}
          </h1>
          <div className="flex items-center gap-3 text-sm text-muted-foreground mb-12 pb-8 border-b border-border">
            <div className="size-9 rounded-full bg-lime/20 grid place-items-center text-lime text-sm font-bold">
              {post.author ? post.author[0] : "I"}
            </div>
            <div>
              <div className="text-foreground">{post.author || "Integrit Team"}</div>
              <div className="text-xs">
                {post.date} · {post.readTime || "5 min"}
              </div>
            </div>
          </div>
          <div
            className="prose prose-invert max-w-none prose-headings:font-display prose-headings:tracking-tight prose-h2:text-2xl prose-h2:mt-10 prose-p:text-muted-foreground prose-p:leading-relaxed prose-strong:text-foreground"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </motion.div>
      </article>

      {related.length > 0 && (
        <Section className="py-16">
          <motion.h2 variants={fadeUp} className="font-display text-3xl font-bold mb-8">
            Keep reading
          </motion.h2>
          <motion.div variants={staggerContainer} className="grid md:grid-cols-2 gap-6">
            {related.map((relatedPost) => (
              <BlogCard key={relatedPost.slug} post={relatedPost} />
            ))}
          </motion.div>
        </Section>
      )}
    </>
  );
}
