import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const tiles = [
  {
    label: "OFFICE CHAIRS",
    href: "/shop?category=Chairs",
    image:
      "https://images.unsplash.com/photo-1580480055273-228ff5388ef8?auto=format&fit=crop&w=600&q=80",
  },
  {
    label: "STORAGE",
    href: "/shop?category=Storage",
    image:
      "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=600&q=80",
  },
  {
    label: "ADJUSTABLE DESK",
    href: "/shop?category=Adjustable+Desk",
    image:
      "https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?auto=format&fit=crop&w=600&q=80",
  },
  {
    label: "WORK STATION TABLES",
    href: "/shop?category=Adjustable+Desk",
    image:
      "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=600&q=80",
  },
];

const CategoryTiles = () => {
  return (
    <section className="bg-white py-8 lg:py-10">
      <div className="mx-auto max-w-7xl px-6 lg:px-12">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
          {tiles.map((tile, i) => (
            <motion.div
              key={tile.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.07 }}
            >
              <Link
                to={tile.href}
                className="group relative block overflow-hidden rounded-xl"
                style={{ aspectRatio: "4/3" }}
              >
                {/* Background image */}
                <img
                  src={tile.image}
                  alt={tile.label}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />

                {/* Dark gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

                {/* Label */}
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <span className="inline-block rounded-sm bg-white px-3 py-1.5 font-sans text-[11px] font-bold uppercase tracking-[0.18em] text-black shadow-sm">
                    {tile.label}
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoryTiles;
