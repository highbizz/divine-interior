import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Loader2, ArrowLeft, Calendar, User, Eye, FileText, Tag } from "lucide-react";
import { blogsApi, type Blog } from "@/lib/api";
import { DEFAULT_BLOGS } from "@/data/defaultBlogs";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

import SEO from "@/components/SEO";

const BlogDetail = () => {
  const { slug }  = useParams<{ slug: string }>();
  const [blog, setBlog]     = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);
  const [related, setRelated] = useState<Blog[]>([]);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);

    blogsApi.list({ per_page: "50" })
      .then(res => {
        const published = res.items.filter(b => b.status === "published");
        let found = published.find(b => b.slug === slug);
        let rel = published.filter(b => b.slug !== slug);
        
        if (!found) {
          found = DEFAULT_BLOGS.find(b => b.slug === slug);
        }
        if (rel.length === 0) {
          rel = DEFAULT_BLOGS.filter(b => b.slug !== slug);
        }
        
        setBlog(found ?? null);
        setRelated(rel.slice(0, 3));
      })
      .catch(() => {
        const found = DEFAULT_BLOGS.find(b => b.slug === slug) ?? null;
        const rel = DEFAULT_BLOGS.filter(b => b.slug !== slug).slice(0, 3);
        setBlog(found);
        setRelated(rel);
      })
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    </div>
  );

  if (!blog) return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex flex-col items-center justify-center py-32 text-center px-6">
        <FileText className="mb-4 h-16 w-16 text-muted-foreground/30" />
        <h2 className="font-display text-2xl font-light mb-3">Article Not Found</h2>
        <p className="font-sans text-sm text-muted-foreground mb-6">This article doesn't exist or hasn't been published yet.</p>
        <Link to="/blogs" className="font-sans text-xs font-bold uppercase tracking-widest text-primary hover:underline flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" /> Back to Blog
        </Link>
      </div>
      <Footer />
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title={blog.meta_title || blog.title}
        description={blog.meta_description || blog.excerpt}
        keywords={Array.isArray(blog.tags) ? blog.tags.join(", ") : undefined}
        image={blog.cover_image || undefined}
        type="article"
      />
      <Navbar />

      {/* Cover image */}
      {blog.cover_image && (
        <div className="w-full" style={{ height: "clamp(280px, 40vw, 520px)", overflow: "hidden" }}>
          <img src={blog.cover_image} alt={blog.title} className="h-full w-full object-cover" />
        </div>
      )}

      {/* Article */}
      <article className="mx-auto max-w-3xl px-6 py-12 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {/* Back */}
          <Link to="/blogs" className="mb-8 inline-flex items-center gap-2 font-sans text-xs text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Blog
          </Link>

          {/* Tags */}
          {blog.tags.length > 0 && (
            <div className="mb-4 flex flex-wrap gap-2">
              {blog.tags.map(tag => (
                <span key={tag} className="flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 font-sans text-[10px] font-semibold uppercase tracking-wider text-primary">
                  <Tag className="h-2.5 w-2.5" /> {tag}
                </span>
              ))}
            </div>
          )}

          {/* Title */}
          <h1 className="font-display text-3xl font-light leading-snug tracking-wide sm:text-4xl lg:text-5xl">
            {blog.title}
          </h1>

          {/* Excerpt */}
          {blog.excerpt && (
            <p className="mt-4 font-serif text-lg font-light italic leading-relaxed text-muted-foreground">
              {blog.excerpt}
            </p>
          )}

          {/* Meta */}
          <div className="mt-6 flex flex-wrap items-center gap-4 border-y border-border py-4">
            <span className="flex items-center gap-2 font-sans text-xs text-muted-foreground">
              <User className="h-3.5 w-3.5 text-primary" />
              {blog.author}
            </span>
            {blog.published_at && (
              <span className="flex items-center gap-2 font-sans text-xs text-muted-foreground">
                <Calendar className="h-3.5 w-3.5 text-primary" />
                {new Date(blog.published_at).toLocaleDateString("en-IN", { dateStyle: "long" })}
              </span>
            )}
            {blog.views > 0 && (
              <span className="flex items-center gap-2 font-sans text-xs text-muted-foreground">
                <Eye className="h-3.5 w-3.5 text-primary" />
                {blog.views.toLocaleString()} views
              </span>
            )}
          </div>

          {/* Content */}
          {blog.content ? (
            <div
              className="prose prose-stone mt-10 max-w-none font-sans"
              dangerouslySetInnerHTML={{ __html: blog.content }}
            />
          ) : (
            <div className="mt-10 flex flex-col items-center py-16 text-center text-muted-foreground">
              <FileText className="mb-3 h-10 w-10 opacity-30" />
              <p className="font-sans text-sm">Content coming soon.</p>
            </div>
          )}
        </motion.div>
      </article>

      {/* Related articles */}
      {related.length > 0 && (
        <section className="border-t border-border bg-[#FAFAF8] py-14">
          <div className="mx-auto max-w-7xl px-6 lg:px-12">
            <h3 className="mb-8 font-display text-2xl font-light tracking-wide">More Articles</h3>
            <div className="grid gap-6 sm:grid-cols-3">
              {related.map(r => (
                <Link
                  key={r.id}
                  to={`/blog/${r.slug}`}
                  className="group overflow-hidden rounded-xl border border-border bg-white shadow-sm hover:shadow-md hover:border-primary/30 transition-all"
                >
                  <div className="aspect-[16/9] overflow-hidden bg-muted">
                    {r.cover_image
                      ? <img src={r.cover_image} alt={r.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                      : <div className="flex h-full w-full items-center justify-center bg-[#F8F5F0]"><FileText className="h-8 w-8 text-muted-foreground/30" /></div>
                    }
                  </div>
                  <div className="p-4">
                    <h4 className="font-display text-base font-medium leading-snug tracking-wide line-clamp-2 transition-colors group-hover:text-primary">
                      {r.title}
                    </h4>
                    <p className="mt-1 font-sans text-[11px] text-muted-foreground">
                      {r.published_at ? new Date(r.published_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : ""}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
};

export default BlogDetail;
