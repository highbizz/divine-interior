import { useEffect, useState } from "react";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, FileText, Loader2, Calendar, User } from "lucide-react";
import { blogsApi, type Blog } from "@/lib/api";
import { DEFAULT_BLOGS } from "@/data/defaultBlogs";

const BlogsSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const [blogs, setBlogs]     = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    blogsApi.list({ per_page: "3" })
      .then(res => {
        const published = res.items.filter(b => b.status === "published").slice(0, 3);
        setBlogs(published.length > 0 ? published : DEFAULT_BLOGS.slice(0, 3));
      })
      .catch(() => setBlogs(DEFAULT_BLOGS.slice(0, 3)))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="bg-background py-14 lg:py-20" ref={ref}>
      <div className="mx-auto max-w-7xl px-6 lg:px-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="mb-10 flex items-center justify-between border-b border-border pb-5"
        >
          <div>
            <p className="mb-1 font-sans text-[10px] font-medium uppercase tracking-[0.3em] text-primary">
              Divine Diaries
            </p>
            <h2 className="font-sans text-xl font-bold tracking-tight text-foreground md:text-2xl">
              Our Latest Blog
            </h2>
          </div>
          <Link
            to="/blogs"
            className="font-sans text-xs font-bold uppercase tracking-wider text-foreground hover:text-primary transition-colors flex items-center gap-1"
          >
            View All <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </motion.div>

        {/* Loading */}
        {loading && (
          <div className="flex h-48 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        )}

        {/* Empty — no published blogs yet */}
        {!loading && blogs.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <FileText className="mb-3 h-10 w-10 text-muted-foreground/30" />
            <p className="font-sans text-sm text-muted-foreground">No blog articles published yet.</p>
            <p className="font-sans text-xs text-muted-foreground/60 mt-1">
              Create and publish articles in the <Link to="/studio/blogs" className="text-primary hover:underline">admin panel</Link>.
            </p>
          </div>
        )}

        {/* Blog cards from DB */}
        {!loading && blogs.length > 0 && (
          <div className="grid gap-6 sm:grid-cols-3">
            {blogs.map((blog, i) => (
              <motion.article
                key={blog.id}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: i * 0.12 }}
                className="group cursor-pointer overflow-hidden rounded-xl border border-border bg-white shadow-sm hover:shadow-md transition-all hover:border-primary/30"
              >
                {/* Cover image */}
                <Link to={`/blog/${blog.slug}`}>
                  <div className="aspect-[16/9] overflow-hidden bg-muted">
                    {blog.cover_image ? (
                      <img
                        src={blog.cover_image}
                        alt={blog.title}
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-[#F8F5F0]">
                        <FileText className="h-10 w-10 text-muted-foreground/30" />
                      </div>
                    )}
                  </div>
                </Link>

                {/* Content */}
                <div className="p-5">
                  {/* Tags */}
                  {blog.tags.length > 0 && (
                    <div className="mb-3 flex flex-wrap gap-1.5">
                      <span className="rounded-full bg-primary/10 px-2.5 py-0.5 font-sans text-[10px] font-semibold uppercase tracking-wide text-primary">
                        {blog.tags[0]}
                      </span>
                      {blog.published_at && (
                        <span className="flex items-center gap-1 font-sans text-[10px] text-muted-foreground">
                          <Calendar className="h-2.5 w-2.5" />
                          {new Date(blog.published_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                        </span>
                      )}
                    </div>
                  )}

                  <Link to={`/blog/${blog.slug}`}>
                    <h3 className="font-display text-base font-medium leading-snug tracking-wide transition-colors group-hover:text-primary sm:text-[17px] line-clamp-2">
                      {blog.title}
                    </h3>
                  </Link>

                  {blog.excerpt && (
                    <p className="mt-2 font-sans text-xs font-light leading-relaxed text-muted-foreground line-clamp-3">
                      {blog.excerpt}
                    </p>
                  )}

                  <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
                    <span className="flex items-center gap-1.5 font-sans text-[11px] text-muted-foreground">
                      <User className="h-3 w-3" /> {blog.author}
                    </span>
                    <Link
                      to={`/blog/${blog.slug}`}
                      className="flex items-center gap-1 font-sans text-[11px] font-bold uppercase tracking-wider text-primary hover:underline"
                    >
                      Read More <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default BlogsSection;
