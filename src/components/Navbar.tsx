import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, User, Heart, LogOut, ShoppingBag, MapPin, ChevronDown, ClipboardList } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCustomerStore } from "@/stores/customerStore";

const navLinks = [
  { label: "Home",       href: "/",        isRoute: true },
  { label: "Shop",       href: "/shop",    isRoute: true },
  { label: "Sale",       href: "/sale",    isRoute: true },
  { label: "Blog",       href: "/blogs",   isRoute: true },
  { label: "About Us",   href: "/about",   isRoute: true },
  { label: "Contact Us", href: "/contact", isRoute: true },
];

const Navbar = () => {
  const [scrolled, setScrolled]   = useState(false);
  const [menuOpen, setMenuOpen]   = useState(false);
  const [search, setSearch]       = useState("");
  const navigate                  = useNavigate();
  const { user, signOut, isAuthenticated } = useCustomerStore();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const onSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate("/shop");
  };

  const handleSignOut = () => {
    signOut();
    navigate("/");
  };

  const initials = user?.name
    ? user.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
    : "";

  const loggedIn = isAuthenticated();

  return (
    <nav
      className={`sticky top-0 z-50 w-full border-b transition-all duration-500 ${
        scrolled
          ? "border-border bg-background/95 shadow-sm backdrop-blur-xl"
          : "border-border/40 bg-background"
      }`}
    >
      {/* Top utility row */}
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-6 py-4 lg:px-12">
        <Link to="/" className="flex flex-shrink-0 items-center">
          <img src="/banner/office-furnisho-logo.png?v=2" alt="Office Furnisho Logo" className="h-14 w-auto md:h-16 lg:h-20 object-contain transition-all duration-300" />
        </Link>

        <form onSubmit={onSearchSubmit} className="hidden flex-1 items-center md:flex">
          <div className="relative w-full max-w-2xl mx-auto">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search luxury furnishings..."
              className="w-full rounded-sm border border-border bg-secondary/60 py-2.5 pl-11 pr-4 font-sans text-sm font-light tracking-wide outline-none transition-colors focus:border-primary focus:bg-background"
            />
          </div>
        </form>

        <div className="ml-auto flex items-center gap-5 md:gap-6">

          {/* Account button — logged in shows avatar dropdown, guest shows Sign In */}
          {loggedIn && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="hidden sm:flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors" aria-label="Account">
                  <Avatar className="h-7 w-7">
                    <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-sans text-[10px] font-medium uppercase tracking-[0.25em]">
                    {user.name.split(" ")[0]}
                  </span>
                  <ChevronDown className="h-3 w-3" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel className="font-normal">
                  <p className="font-semibold text-sm">{user.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/account/orders" className="flex items-center gap-2 cursor-pointer">
                    <ClipboardList className="h-4 w-4" /> My Enquiries
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/account/profile" className="flex items-center gap-2 cursor-pointer">
                    <User className="h-4 w-4" /> Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/account/addresses" className="flex items-center gap-2 cursor-pointer">
                    <MapPin className="h-4 w-4" /> Addresses
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="text-destructive focus:text-destructive cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" /> Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link
              to="/auth"
              aria-label="Account"
              className="hidden items-center gap-2 text-muted-foreground transition-colors hover:text-foreground sm:flex"
            >
              <User className="h-5 w-5" />
              <span className="font-sans text-[10px] font-medium uppercase tracking-[0.25em]">
                Sign In
              </span>
            </Link>
          )}

          <button
            aria-label="Wishlist"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            <Heart className="h-5 w-5" />
          </button>

          {/* CartDrawer removed for single-item RFQ modal */}

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex flex-col gap-1.5 lg:hidden"
            aria-label="Toggle menu"
          >
            <span className={`h-[1px] w-6 bg-foreground transition-all duration-300 ${menuOpen ? "translate-y-[7px] rotate-45" : ""}`} />
            <span className={`h-[1px] w-4 bg-foreground transition-all duration-300 ${menuOpen ? "opacity-0" : ""}`} />
            <span className={`h-[1px] w-6 bg-foreground transition-all duration-300 ${menuOpen ? "-translate-y-[7px] -rotate-45" : ""}`} />
          </button>
        </div>
      </div>

      {/* Mobile search */}
      <form onSubmit={onSearchSubmit} className="px-6 pb-3 md:hidden">
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search..."
            className="w-full rounded-sm border border-border bg-secondary/60 py-2.5 pl-11 pr-4 font-sans text-sm font-light outline-none focus:border-primary focus:bg-background"
          />
        </div>
      </form>

      {/* Desktop nav links */}
      <div className="hidden border-t border-border/60 lg:block">
        <div className="mx-auto flex max-w-7xl items-center justify-center gap-10 px-6 py-3 lg:px-12">
          {navLinks.map((link) => {
            const cls = "group relative font-sans text-[11px] font-medium uppercase tracking-[0.25em] text-muted-foreground transition-colors hover:text-primary";
            const underline = <span className="absolute -bottom-1 left-0 h-[1px] w-0 bg-primary transition-all duration-300 group-hover:w-full" />;
            return link.isRoute ? (
              <Link key={link.label} to={link.href} className={cls}>
                {link.label}{underline}
              </Link>
            ) : (
              <a key={link.label} href={link.href} className={cls}>
                {link.label}{underline}
              </a>
            );
          })}
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`overflow-hidden border-t border-border/30 bg-background transition-all duration-500 lg:hidden ${menuOpen ? "max-h-[480px]" : "max-h-0"}`}>
        <div className="flex flex-col gap-5 px-6 py-6">
          {navLinks.map((link) =>
            link.isRoute ? (
              <Link key={link.label} to={link.href} onClick={() => setMenuOpen(false)}
                className="font-sans text-sm font-light uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground">
                {link.label}
              </Link>
            ) : (
              <a key={link.label} href={link.href} onClick={() => setMenuOpen(false)}
                className="font-sans text-sm font-light uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground">
                {link.label}
              </a>
            )
          )}
          {/* Mobile auth links */}
          <div className="border-t border-border/30 pt-4">
            {loggedIn ? (
              <>
                <Link to="/account/orders" onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 font-sans text-sm text-muted-foreground hover:text-foreground mb-3">
                  <ClipboardList className="h-4 w-4" /> My Enquiries
                </Link>
                <Link to="/account/profile" onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 font-sans text-sm text-muted-foreground hover:text-foreground mb-3">
                  <User className="h-4 w-4" /> Profile
                </Link>
                <button onClick={() => { handleSignOut(); setMenuOpen(false); }}
                  className="flex items-center gap-2 font-sans text-sm text-destructive">
                  <LogOut className="h-4 w-4" /> Sign Out
                </button>
              </>
            ) : (
              <Link to="/auth" onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2 font-sans text-sm text-muted-foreground hover:text-foreground">
                <User className="h-4 w-4" /> Sign In / Register
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
