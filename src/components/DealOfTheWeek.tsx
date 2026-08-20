import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Loader2, ShoppingCart } from "lucide-react";
import { productsApi, type Product } from "@/lib/api";
import { toast } from "sonner";



const DealOfTheWeek = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    productsApi.list({ active: '1', per_page: '50' })
      .then(res => {
        const chairs = res.items.filter(p => p.category.toLowerCase().includes('chair'));
        const desks  = res.items.filter(p => p.category.toLowerCase().includes('desk') || p.category.toLowerCase().includes('table'));
        const mixed: Product[] = [];
        const maxLen = Math.max(chairs.length, desks.length);
        for (let i = 0; i < maxLen; i++) {
          if (chairs[i]) mixed.push(chairs[i]);
          if (desks[i]) mixed.push(desks[i]);
        }
        setProducts(mixed.slice(0, 6));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="bg-background py-16 lg:py-24 border-t border-border">
      <div className="mx-auto max-w-7xl px-6 lg:px-12">
        <div className="mb-10 flex items-center justify-between border-b border-border pb-5">
          <h2 className="font-sans text-xl font-bold tracking-tight text-foreground md:text-2xl">
            Featured Products
          </h2>
          <Link to="/shop" className="font-sans text-xs font-bold uppercase tracking-wider text-foreground hover:text-primary transition-colors flex items-center gap-1">
            View All <span className="text-sm">→</span>
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : products.length === 0 ? (
          <div className="py-16 text-center font-serif text-muted-foreground">New products coming soon.</div>
        ) : (
          <div className="grid gap-6 grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
            {products.map((p, i) => {
              const image      = p.images[0];
              const currentAmt = Number(p.price);
              const compareAmt = p.compare_at_price ? Number(p.compare_at_price) : null;
              const discount   = compareAmt && compareAmt > currentAmt
                ? Math.round(((compareAmt - currentAmt) / compareAmt) * 100) : null;
              const inStock    = p.stock > 0;

              return (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.08 }}
                  className="flex"
                >
                  <Link
                    to={`/product/${p.slug}`}
                    className="group flex flex-col w-full bg-white border border-gray-100 rounded-md overflow-hidden shadow-sm hover:shadow-md transition-all duration-300"
                  >
                    <div className="relative aspect-square w-full overflow-hidden bg-[#F8F9FA]">
                      {image ? (
                        <img src={image} alt={p.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
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
                    </div>

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
        )}
      </div>

    </section>
  );
};

export default DealOfTheWeek;
