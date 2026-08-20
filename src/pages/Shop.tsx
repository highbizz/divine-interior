import { useState, useEffect, useCallback } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Loader2, ShoppingCart, Search } from "lucide-react";
import { productsApi, type Product } from "@/lib/api";
import SEO from "@/components/SEO";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const CATEGORY_TABS = [
  { label: "All Products", value: "all" },
  { label: "Chairs", value: "Chairs" },
  { label: "Adjustable Desk", value: "Adjustable Desk" },
];

const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = searchParams.get("category") || "all";

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [activeCategory, setActiveCategory] = useState(categoryParam);

  useEffect(() => {
    setActiveCategory(searchParams.get("category") || "all");
  }, [searchParams]);

  const load = useCallback(async (q = '', cat = activeCategory) => {
    setLoading(true);
    try {
      const params: Record<string, string> = { active: '1', per_page: '50' };
      if (q) params.search = q;
      if (cat && cat !== 'all') params.category = cat;
      const res = await productsApi.list(params);
      setProducts(res.items);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }, [activeCategory]);

  useEffect(() => {
    load(search, activeCategory);
  }, [load, search, activeCategory]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    load(searchInput, activeCategory);
  };

  const handleCategoryChange = (catVal: string) => {
    setActiveCategory(catVal);
    const newParams = new URLSearchParams(searchParams);
    if (catVal === 'all') {
      newParams.delete('category');
    } else {
      newParams.set('category', catVal);
    }
    setSearchParams(newParams);
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title="Shop Ergonomic Office Chairs & Adjustable Desks" 
        description="Explore luxury ergonomic task chairs, height adjustable electric & manual standing desks at Divine Interior."
      />
      <Navbar />

      {/* Hero */}
      <section className="pt-32 pb-10 text-center">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          <span className="mb-4 inline-block font-sans text-[10px] font-medium uppercase tracking-[0.4em] text-primary">
            Exclusive Collection
          </span>
          <h1 className="font-display text-4xl font-light tracking-wide sm:text-5xl lg:text-6xl">
            The <span className="italic">Shop</span>
          </h1>
          <p className="mx-auto mt-4 max-w-lg font-serif text-base font-light text-muted-foreground">
            Discover our curated selection of premium ergonomic chairs and height-adjustable desks.
          </p>

          {/* Search bar */}
          <form onSubmit={handleSearch} className="mx-auto mt-8 flex max-w-md gap-2 px-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                placeholder="Search products…"
                className="w-full rounded-sm border border-border bg-secondary/60 py-2.5 pl-10 pr-4 font-sans text-sm font-light outline-none transition-colors focus:border-primary focus:bg-background"
              />
            </div>
            <button type="submit" className="rounded-sm bg-primary px-5 py-2.5 font-sans text-xs font-bold uppercase tracking-wider text-primary-foreground hover:bg-primary/90 transition-colors">
              Search
            </button>
          </form>

          {/* Category Filter Tabs */}
          <div className="mt-8 flex flex-wrap justify-center gap-2 px-4">
            {CATEGORY_TABS.map((tab) => {
              const isActive = (activeCategory === "all" && tab.value === "all") ||
                (activeCategory.toLowerCase().includes("desk") && tab.value.toLowerCase().includes("desk")) ||
                (activeCategory.toLowerCase() === tab.value.toLowerCase());
              return (
                <button
                  key={tab.value}
                  onClick={() => handleCategoryChange(tab.value)}
                  className={`rounded-full px-5 py-2 font-sans text-xs font-semibold uppercase tracking-wider transition-all ${
                    isActive
                      ? "bg-primary text-primary-foreground shadow-md"
                      : "bg-secondary/80 text-muted-foreground hover:bg-secondary hover:text-foreground"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </motion.div>
      </section>

      {/* Products Grid */}
      <section className="mx-auto max-w-7xl px-6 pb-28 lg:px-12">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <ShoppingCart className="h-16 w-16 text-muted-foreground/40 mb-6" />
            <h3 className="font-display text-2xl font-light tracking-wide mb-2">No Products Found</h3>
            <p className="font-serif text-muted-foreground max-w-md">
              {search ? `No results for "${search}". Try a different search.` : 'Our collection is being curated. Check back soon.'}
            </p>
          </div>
        ) : (
          <>
            <p className="mb-6 font-sans text-sm text-muted-foreground">{products.length} products</p>
            <div className="grid gap-6 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {products.map((p, i) => {
                const image     = p.images[0];
                const currentAmt = Number(p.price);
                const compareAmt = p.compare_at_price ? Number(p.compare_at_price) : null;
                const discount   = compareAmt && compareAmt > currentAmt
                  ? Math.round(((compareAmt - currentAmt) / compareAmt) * 100) : null;
                const inStock = p.stock > 0;

                return (
                  <motion.div
                    key={p.id}
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: i * 0.04 }}
                    className="flex"
                  >
                    <Link
                      to={`/product/${p.slug}`}
                      className="group flex flex-col w-full bg-white border border-gray-100 rounded-md overflow-hidden shadow-sm hover:shadow-md transition-all duration-300"
                    >
                      {/* Image */}
                      <div className="relative aspect-square w-full overflow-hidden bg-[#F8F9FA]">
                        {image ? (
                          <img
                            src={image}
                            alt={p.title}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <ShoppingCart className="h-10 w-10 text-muted-foreground/30" />
                          </div>
                        )}
                        {discount && (
                          <span className="absolute left-2 top-2 bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded-sm uppercase tracking-wider">
                            {discount}% OFF
                          </span>
                        )}
                        {!inStock && (
                          <span className="absolute inset-0 flex items-center justify-center bg-black/40">
                            <span className="bg-black/70 text-white font-sans text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-sm">Sold Out</span>
                          </span>
                        )}
                      </div>

                      {/* Details */}
                      <div className="p-3 flex flex-col flex-grow justify-between">
                        <div>
                          <h3 className="line-clamp-2 font-sans text-xs font-semibold text-gray-800 leading-snug group-hover:text-primary transition-colors mb-1.5 min-h-[32px]">
                            {p.title}
                          </h3>
                          <div className="flex items-baseline gap-1.5 mb-3">
                            <span className="font-sans text-sm font-bold text-primary">
                              ₹{currentAmt.toLocaleString("en-IN")}
                            </span>
                            {compareAmt && compareAmt > currentAmt && (
                              <span className="font-sans text-[11px] text-gray-400 line-through">
                                ₹{compareAmt.toLocaleString("en-IN")}
                              </span>
                            )}
                          </div>
                        </div>
                        <button
                          className="w-full py-2 rounded-sm font-sans text-[10px] font-bold uppercase tracking-wider text-center transition-colors bg-primary hover:bg-primary/90 text-primary-foreground"
                        >
                          View Details
                        </button>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </>
        )}
      </section>
      <Footer />
    </div>
  );
};

export default Shop;
