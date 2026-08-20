import PromoBar from "@/components/PromoBar";
import Navbar from "@/components/Navbar";
import SEO from "@/components/SEO";
import HeroSection from "@/components/HeroSection";
import CategoryCircles from "@/components/CategoryCircles";
import DealOfTheWeek from "@/components/DealOfTheWeek";
import CategoryTiles from "@/components/CategoryTiles";
import BrandsSection from "@/components/BrandsSection";
import TrustBadgesSection from "@/components/TrustBadgesSection";
import AboutSection from "@/components/AboutSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import BlogsSection from "@/components/BlogsSection";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title="Luxury Ergonomic Office Chairs & Executive Seating" 
        description="Discover India's premier brand for luxury ergonomic office chairs, executive seating, and modern workspace furniture at Office Furnisho."
      />
      {/* ── Top announcement bar ── */}
      <PromoBar />

      {/* ── Navigation ── */}
      <Navbar />

      {/* ── 1. Full-width hero slider ── */}
      <HeroSection />

      {/* ── 2. Shop by Category (circles) ── */}
      <CategoryCircles />

      {/* ── 3. Featured / Deal of the Week products ── */}
      <DealOfTheWeek />

      {/* ── 4. Category image tiles (Office Chairs / Storage / Desk / Workstation) ── */}
      <CategoryTiles />

      {/* ── 5. Shop by Top Brands ── */}
      <BrandsSection />

      {/* ── 5. Trust badges (Sustainable · Affordable · Delivery · Quality) ── */}
      <TrustBadgesSection />

      {/* ── 6. Why It Matters (green section) ── */}
      <AboutSection />

      {/* ── 7. Customer Reviews ── */}
      <TestimonialsSection />

      {/* ── 8. Latest Blogs ── */}
      <BlogsSection />

      {/* ── 9. Contact ── */}
      <ContactSection />

      {/* ── 10. Footer ── */}
      <Footer />
    </div>
  );
};

export default Index;
