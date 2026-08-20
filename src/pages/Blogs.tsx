import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Loader2, FileText, Search, ArrowRight, Calendar, User } from "lucide-react";
import { blogsApi, type Blog } from "@/lib/api";
import { DEFAULT_BLOGS } from "@/data/defaultBlogs";
import SEO from "@/components/SEO";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Blogs = () => {
  const [blogs, setBlogs]   = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [input, setInput]   = useState("");

  const load = useCallback(async (q = "") => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (q) params.search = q;
      const res = await blogsApi.list(params);
      const published = res.items.filter(b => b.status === "published");
      if (published.length > 0) {
        setBlogs(published);
      } else {
        const filtered = DEFAULT_BLOGS.filter(b => 
          !q || b.title.toLowerCase().includes(q.toLowerCase()) || b.excerpt.toLowerCase().includes(q.toLowerCase())
        );
        setBlogs(filtered);
      }
    } catch (e) {
      console.error(e);
      const filtered = DEFAULT_BLOGS.filter(b => 
        !q || b.title.toLowerCase().includes(q.toLowerCase()) || b.excerpt.toLowerCase().includes(q.toLowerCase())
      );
      setBlogs(filtered);
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(input);
    load(input);
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title="Office Furnisho Journal & Ergonomic Guides" 
        description="Read expert articles on ergonomics, workplace interior design, productivity, and office seating comparisons."
      />
      <Navbar />

      {/* Hero */}
      <section className="border-b border-border bg-[#FAFAF8] py-14">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="mb-3 inline-block font-sans text-[10px] font-semibold uppercase tracking-[0.35em] text-primary">
              Divine Diaries
            </span>
            <h1 className="font-display text-4xl font-light tracking-wide sm:text-5xl">
              Our <span className="italic">Blog</span>
            </h1>
            <p className="mx-auto mt-4 max-w-lg font-sans text-sm text-muted-foreground">
              Insights, guides, and stories about ergonomic furniture, sustainable choices, and smarter workspaces.
            </p>

            {/* Search */}
            <form onSubmit={handleSearch} className="mx-auto mt-8 flex max-w-md gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  placeholder="Search articles…"
                  className="w-full rounded-sm border border-border bg-white py-2.5 pl-10 pr-4 font-sans text-sm outline-none focus:border-primary"
                />
              </div>
              <button type="submit" className="rounded-sm bg-primary px-5 font-sans text-xs font-bold uppercase tracking-widest text-primary-foreground hover:bg-primary/90 transition-colors">
                Go
              </button>
            </form>
          </motion.div>
        </div>
      </section>

      {/* Blog grid */}
      <section className="mx-auto max-w-7xl px-6 py-14 lg:px-12">
        {loading ? (
          <div className="flex h-48 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : blogs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <FileText className="mb-4 h-14 w-14 text-muted-foreground/30" />
            <p className="font-display text-xl font-light text-muted-foreground">
              {search ? `No results for "${search}"` : "No published articles yet."}
            </p>
          </div>
        ) : (
          <>
            <p className="mb-8 font-sans text-sm text-muted-foreground">{blogs.length} article{blogs.length !== 1 ? "s" : ""}</p>
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {blogs.map((blog, i) => (
                <motion.article
                  key={blog.id}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: i * 0.08 }}
                  className="group overflow-hidden rounded-xl border border-border bg-white shadow-sm hover:shadow-md hover:border-primary/30 transition-all"
                >
                  {/* Cover image */}
                  <Link to={`/blog/${blog.slug}`}>
                    <div className="aspect-[16/9] overflow-hidden bg-muted">
                      {blog.cover_image ? (
                        <img
                          src={blog.cover_image}
                          alt={blog.title}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
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
                        {blog.tags.slice(0, 2).map(tag => (
                          <span key={tag} className="rounded-full bg-primary/10 px-2.5 py-0.5 font-sans text-[10px] font-semibold uppercase tracking-wide text-primary">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    <Link to={`/blog/${blog.slug}`}>
                      <h2 className="font-display text-lg font-medium leading-snug tracking-wide transition-colors group-hover:text-primary line-clamp-2">
                        {blog.title}
                      </h2>
                    </Link>

                    {blog.excerpt && (
                      <p className="mt-2 font-sans text-xs leading-relaxed text-muted-foreground line-clamp-3">
                        {blog.excerpt}
                      </p>
                    )}

                    {/* Meta */}
                    <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
                      <div className="flex items-center gap-3 text-muted-foreground">
                        <span className="flex items-center gap-1 font-sans text-[11px]">
                          <User className="h-3 w-3" /> {blog.author}
                        </span>
                        {blog.published_at && (
                          <span className="flex items-center gap-1 font-sans text-[11px]">
                            <Calendar className="h-3 w-3" />
                            {new Date(blog.published_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                          </span>
                        )}
                      </div>
                      <Link to={`/blog/${blog.slug}`} className="flex items-center gap-1 font-sans text-[11px] font-bold uppercase tracking-wider text-primary hover:underline">
                        Read <ArrowRight className="h-3 w-3" />
                      </Link>
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          </>
        )}
      </section>

      <Footer />
    </div>
  );
};

export default Blogs;
