import { Link } from "react-router-dom";
import { MapPin, Phone, Mail, Instagram, Facebook, Linkedin, Youtube } from "lucide-react";

const Footer = () => {
  return (
    <footer className="border-t border-border bg-[#12100d] text-white">
      {/* Main footer */}
      <div className="mx-auto max-w-7xl px-6 py-14 lg:px-12">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">

          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="mb-3 flex items-center gap-3">
              <img src="/banner/office-furnisho-logo.png?v=2" alt="Office Furnisho Logo" className="h-14 w-auto md:h-18 object-contain brightness-0 invert" />
            </div>
            <p className="font-sans text-[9px] font-semibold uppercase tracking-[0.3em] mt-2 text-primary">
              Premium Ergonomic Chairs
            </p>
            <p className="mt-4 font-sans text-xs font-light leading-relaxed text-white/50 max-w-xs">
              Divine Interiors is your trusted destination for premium ergonomic office chairs, offering comfortable, durable, and thoughtfully designed seating solutions for businesses, workspaces, and home offices across India.
            </p>
            <div className="mt-5 flex gap-3">
              {[Instagram, Facebook, Linkedin, Youtube].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 text-white/40 transition-all hover:border-primary hover:text-primary"
                >
                  <Icon className="h-3.5 w-3.5" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <p className="mb-4 font-sans text-[10px] font-semibold uppercase tracking-[0.3em] text-white/40">
              Quick Links
            </p>
            <div className="space-y-2.5">
              {[
                { label: "Home", href: "/" },
                { label: "Shop", href: "/shop" },
                { label: "About Us", href: "/about" },
                { label: "Contact Us", href: "/contact" },
                { label: "My Account", href: "/account" },
                { label: "My Enquiries", href: "/account/orders" },
              ].map((l) => (
                <Link
                  key={l.label}
                  to={l.href}
                  className="block font-sans text-xs text-white/45 transition-colors hover:text-primary"
                >
                  {l.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Brands */}
          <div>
            <p className="mb-4 font-sans text-[10px] font-semibold uppercase tracking-[0.3em] text-white/40">
              Top Brands
            </p>
            <div className="space-y-2.5">
              {["Herman Miller", "Featherlite", "Steelcase", "Haworth", "All Brands"].map((b) => (
                <Link
                  key={b}
                  to="/shop"
                  className="block font-sans text-xs text-white/45 transition-colors hover:text-primary"
                >
                  {b}
                </Link>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div>
            <p className="mb-4 font-sans text-[10px] font-semibold uppercase tracking-[0.3em] text-white/40">
              Contact Us
            </p>
            <div className="space-y-3">
              <div className="flex items-start gap-2.5">
                <MapPin className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-primary" />
                <p className="font-sans text-xs leading-relaxed text-white/45">
                  Chennai, Tamil Nadu, India
                </p>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="h-3.5 w-3.5 flex-shrink-0 text-primary" />
                <a href="tel:+919876543210" className="font-sans text-xs text-white/45 hover:text-primary transition-colors">
                  +91 98765 43210
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="h-3.5 w-3.5 flex-shrink-0 text-primary" />
                <a href="mailto:info@divineinterior.com" className="font-sans text-xs text-white/45 hover:text-primary transition-colors">
                  info@divineinterior.com
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/5">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-6 py-5 sm:flex-row lg:px-12">
          <p className="font-sans text-[10px] tracking-[0.2em] text-white/25">
            © {new Date().getFullYear()} Divine Interior. All Rights Reserved.
          </p>
          <div className="flex items-center gap-4">
            {["Privacy Policy", "Terms of Service", "Shipping Policy"].map((l) => (
              <a key={l} href="#" className="font-sans text-[10px] text-white/25 hover:text-primary transition-colors">
                {l}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
