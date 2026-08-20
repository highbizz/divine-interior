import { motion } from "framer-motion";
import { Link } from "react-router-dom";

// Each category uses a REAL product image from /products/
// Circle background matches the logo's gold accent
const categories = [
  {
    label: "Accessories",
    image: "/products/category-accessories.png",
    href: "/shop?category=Accessories",
  },
  {
    label: "Adjustable Desk",
    image: "/products/category-adjustable-desk.png",
    href: "/shop?category=Adjustable+Desk",
  },
  {
    label: "Cafeteria chairs",
    image: "/products/category-cafeteria-chairs.png",
    href: "/shop?category=Cafeteria+chairs",
  },
  {
    label: "Chairs",
    image: "/products/category-chairs.png",
    href: "/shop?category=Chairs",
  },
  {
    label: "Storage",
    image: "/products/category-storage.png",
    href: "/shop?category=Storage",
  },
  {
    label: "Table",
    image: "/products/category-table.png",
    href: "/shop?category=Adjustable+Desk",
  },
];

const CategoryCircles = () => {
  return (
    <section className="border-b border-border bg-white py-10 lg:py-12">
      <div className="mx-auto max-w-7xl px-6 lg:px-12">

        {/* Header row */}
        <div className="mb-8 flex items-center justify-between">
          <h2 className="font-sans text-base font-bold tracking-tight text-foreground sm:text-lg">
            Shop by Category
          </h2>
          <Link
            to="/shop"
            className="font-sans text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
          >
            VIEW ALL →
          </Link>
        </div>

        {/* Category circles */}
        <div className="flex flex-wrap justify-center gap-6 sm:gap-10 lg:gap-14">
          {categories.map((cat, i) => (
            <motion.div
              key={cat.label}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: i * 0.06 }}
            >
              <Link
                to={cat.href}
                className="group flex flex-col items-center gap-3"
              >
                {/* Logo gold tinted circle */}
                <div
                  className="relative flex h-[100px] w-[100px] items-center justify-center overflow-hidden rounded-full transition-all duration-300 group-hover:shadow-lg sm:h-[110px] sm:w-[110px]"
                  style={{ background: "hsl(47 60% 94%)" }}
                >
                  <img
                    src={cat.image}
                    alt={cat.label}
                    className="h-[82px] w-[82px] object-contain transition-transform duration-500 group-hover:scale-110 sm:h-[90px] sm:w-[90px]"
                    style={{ mixBlendMode: "multiply" }}
                  />
                </div>

                {/* Label */}
                <span className="text-center font-sans text-[12px] font-medium text-gray-700 transition-colors group-hover:text-primary sm:text-[13px]">
                  {cat.label}
                </span>
              </Link>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default CategoryCircles;
