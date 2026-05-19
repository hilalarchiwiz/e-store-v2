"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import ThemeToggle from "./ThemeToggle";
import { useAppSelector } from "@/redux/store";
import { useDebounce } from "use-debounce";
import { useSession } from "@/lib/auth-client";

interface HeaderProps {
  logo?: { logo?: string; dark_logo?: string; favicon?: string };
}

interface ProductResult {
  id: number;
  title: string;
  images: string[];
  price: number;
  discountedPrice: number | null;
}

const NAV_LINKS = [
  { href: "/shop", label: "Shop", icon: "storefront" },
  { href: "/about", label: "About", icon: "info" },
  { href: "/contact", label: "Contact", icon: "mail" },
];

const Header = ({ logo }: HeaderProps) => {
  const { data: session } = useSession();
  const isAdmin = (session?.user as any)?.roleName && (session?.user as any)?.roleName !== "user";
  const cartCount = useAppSelector((state) =>
    state.cartReducer.items.reduce((sum, item) => sum + item.quantity, 0),
  );
  const wishlistCount = useAppSelector((state) => state.wishlistReducer.count);
  const pathname = usePathname();

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery] = useDebounce(searchQuery, 300);
  const [searchResults, setSearchResults] = useState<ProductResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setShowDropdown(false);
    setMobileOpen(false);
    if (searchQuery.trim()) {
      router.push(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push(`/shop`);
    }
  };

  useEffect(() => {
    const fetchResults = async () => {
      if (debouncedSearchQuery.trim().length > 1) {
        setIsSearching(true);
        try {
          const res = await fetch(
            `/api/products?q=${encodeURIComponent(debouncedSearchQuery)}`,
          );
          const data = await res.json();
          setSearchResults(data.products || []);
          setShowDropdown(true);
        } catch (error) {
          console.error("Search error:", error);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
        setShowDropdown(false);
      }
    };

    fetchResults();
  }, [debouncedSearchQuery]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-50 bg-white dark:bg-background-dark border-b border-solid border-[#f1f4f2] dark:border-[#2a3a2f] px-6 md:px-10 py-4">
        <div className="max-w-400 mx-auto flex items-center justify-between gap-8">
          <div className="flex items-center gap-10">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 text-primary">
              {logo?.logo || logo?.dark_logo ? (
                <>
                  {logo.logo && (
                    <img
                      src={logo.logo}
                      alt="Logo (White)"
                      className={`h-9 w-auto object-contain ${logo.dark_logo ? "hidden dark:block" : ""}`}
                    />
                  )}
                  {logo.dark_logo && (
                    <img
                      src={logo.dark_logo}
                      alt="Logo (Black)"
                      className={`h-9 w-auto object-contain ${logo.logo ? "dark:hidden block" : ""}`}
                    />
                  )}
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-3xl font-bold">
                    eco
                  </span>
                  <h2 className="text-[#121714] dark:text-white text-2xl font-black leading-tight tracking-[-0.015em]">
                    Ecomare
                  </h2>
                </>
              )}
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-8">
              <Link
                className="text-[#121714] dark:text-white text-sm font-semibold leading-normal hover:text-primary transition-colors"
                href="/shop"
              >
                Shop
              </Link>
              <Link
                className="text-[#121714] dark:text-white text-sm font-semibold leading-normal hover:text-primary transition-colors"
                href="/about"
              >
                About
              </Link>
              <Link
                className="text-[#121714] dark:text-white text-sm font-semibold leading-normal hover:text-primary transition-colors"
                href="/contact"
              >
                Contact
              </Link>
            </nav>
          </div>

          <div className="flex flex-1 justify-end items-center gap-4">
            {/* Desktop Search */}
            <div className="hidden md:block flex-1 max-w-md relative" ref={searchRef}>
              <form
                onSubmit={handleSearch}
                className="flex items-stretch rounded-lg h-10 bg-[#f1f4f2] dark:bg-[#2a3a2f] border border-transparent focus-within:border-primary transition-all"
              >
                <div className="flex items-center justify-center pl-4 text-[#668571]">
                  {isSearching ? (
                    <div className="size-4 border-2 border-primary border-t-transparent animate-spin rounded-full" />
                  ) : (
                    <span className="material-symbols-outlined">search</span>
                  )}
                </div>
                <input
                  className="w-full border-none bg-transparent focus:ring-0 text-sm placeholder:text-[#668571] px-4"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    if (e.target.value.length > 1) {
                      setShowDropdown(true);
                    } else {
                      setShowDropdown(false);
                      setSearchResults([]);
                    }
                  }}
                  onFocus={() => searchQuery.length > 1 && setShowDropdown(true)}
                />
              </form>

              {/* Autocomplete Dropdown */}
              {showDropdown && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-[#1a251e] rounded-xl shadow-2xl border border-[#f1f4f2] dark:border-[#2a3a2f] overflow-hidden z-50 max-h-[400px] overflow-y-auto">
                  {isSearching && searchResults.length === 0 ? (
                    <div className="p-4 text-center text-sm text-[#668571] flex items-center justify-center gap-2">
                      <div className="size-4 border-2 border-primary border-t-transparent animate-spin rounded-full" />
                      Searching...
                    </div>
                  ) : searchResults.length > 0 ? (
                    <div className="py-2">
                      {searchResults.map((product) => (
                        <Link
                          key={product.id}
                          href={`/product/${product.id}`}
                          onClick={() => {
                            setShowDropdown(false);
                            setSearchQuery("");
                          }}
                          className="flex items-center gap-4 px-4 py-3 hover:bg-[#f1f4f2] dark:hover:bg-[#2a3a2f] transition-colors group"
                        >
                          <div className="size-12 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 flex-shrink-0">
                            {product.images?.[0] ? (
                              <img
                                src={product.images[0]}
                                alt={product.title}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-400">
                                <span className="material-symbols-outlined">image</span>
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-semibold text-[#121714] dark:text-white truncate">
                              {product.title}
                            </h4>
                            <div className="flex items-center gap-2 mt-1">
                              {product.discountedPrice ? (
                                <>
                                  <span className="text-primary font-bold text-sm">
                                    PKR {(product.price * (100 - product.discountedPrice) / 100).toFixed(2)}
                                  </span>
                                  <span className="text-xs text-[#668571] line-through">
                                    PKR {product.price}
                                  </span>
                                </>
                              ) : (
                                <span className="text-sm font-bold text-[#121714] dark:text-white">
                                  PKR {product.price}
                                </span>
                              )}
                            </div>
                          </div>
                          <span className="material-symbols-outlined text-[#668571] opacity-0 group-hover:opacity-100 transition-opacity">
                            chevron_right
                          </span>
                        </Link>
                      ))}
                    </div>
                  ) : !isSearching && searchQuery.length > 1 ? (
                    <div className="p-4 text-center text-sm text-[#668571]">
                      No products found for &quot;{searchQuery}&quot;
                    </div>
                  ) : null}
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <ThemeToggle />

              {/* Wishlist */}
              <Link
                href="/wishlist"
                className="relative size-10 flex items-center justify-center rounded-lg bg-[#f1f4f2] dark:bg-[#2a3a2f] text-[#121714] dark:text-white hover:bg-primary/20 transition-colors"
              >
                <span className="material-symbols-outlined">favorite</span>
                {wishlistCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full bg-primary text-white text-[10px] font-bold leading-none">
                    {wishlistCount > 99 ? "99+" : wishlistCount}
                  </span>
                )}
              </Link>

              {/* Cart */}
              <Link
                href="/cart"
                className="relative size-10 flex items-center justify-center rounded-lg bg-[#f1f4f2] dark:bg-[#2a3a2f] text-[#121714] dark:text-white hover:bg-primary/20 transition-colors"
              >
                <span className="material-symbols-outlined">shopping_cart</span>
                {cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full bg-primary text-white text-[10px] font-bold leading-none">
                    {cartCount > 99 ? "99+" : cartCount}
                  </span>
                )}
              </Link>

              {/* Account */}
              <Link
                href={isAdmin ? "/admin" : "/dashboard"}
                className="size-10 flex items-center justify-center rounded-lg bg-primary text-white hover:bg-primary-dark transition-colors"
              >
                <span className="material-symbols-outlined">person</span>
              </Link>

              {/* Hamburger — visible only below lg */}
              <button
                onClick={() => setMobileOpen((o) => !o)}
                aria-label="Toggle navigation menu"
                className="lg:hidden size-10 flex items-center justify-center rounded-lg bg-[#f1f4f2] dark:bg-[#2a3a2f] text-[#121714] dark:text-white hover:bg-primary/20 transition-colors"
              >
                <span
                  className={`material-symbols-outlined transition-transform duration-300 ${mobileOpen ? "rotate-90" : ""}`}
                >
                  {mobileOpen ? "close" : "menu"}
                </span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ── Mobile Sidebar ── */}
      {/* Backdrop */}
      <div
        onClick={() => setMobileOpen(false)}
        aria-hidden="true"
        className={`fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${
          mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      />

      {/* Drawer panel */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-[300px] bg-white dark:bg-[#0c120e] shadow-2xl flex flex-col transition-transform duration-300 ease-in-out lg:hidden ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Drawer top bar */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#f1f4f2] dark:border-[#2a3a2f]">
          <Link href="/" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 text-primary">
            {logo?.logo || logo?.dark_logo ? (
              <>
                {logo.logo && (
                  <img src={logo.logo} alt="Logo" className={`h-8 w-auto object-contain ${logo.dark_logo ? "hidden dark:block" : ""}`} />
                )}
                {logo.dark_logo && (
                  <img src={logo.dark_logo} alt="Logo" className={`h-8 w-auto object-contain ${logo.logo ? "dark:hidden block" : ""}`} />
                )}
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-2xl">eco</span>
                <span className="text-[#121714] dark:text-white text-xl font-black">Ecomare</span>
              </>
            )}
          </Link>
          <button
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu"
            className="size-9 rounded-full flex items-center justify-center bg-[#f1f4f2] dark:bg-[#2a3a2f] text-[#121714] dark:text-white hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-500 transition-all"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Mobile Search */}
        <div className="px-4 py-4 border-b border-[#f1f4f2] dark:border-[#2a3a2f]">
          <form
            onSubmit={handleSearch}
            className="flex items-center rounded-xl h-11 bg-[#f1f4f2] dark:bg-[#2a3a2f] border border-transparent focus-within:border-primary transition-all px-4 gap-3"
          >
            <span className="material-symbols-outlined text-[#668571]">search</span>
            <input
              className="flex-1 border-none bg-transparent focus:ring-0 text-sm placeholder:text-[#668571]"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>
        </div>

        {/* Nav links */}
        <nav className="flex-1 overflow-y-auto px-4 py-6 flex flex-col gap-1">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-3 mb-2">
            Navigation
          </p>

          {NAV_LINKS.map((link, idx) => {
            const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                style={{ transitionDelay: mobileOpen ? `${idx * 50 + 80}ms` : "0ms" }}
                className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl font-semibold text-sm transition-all duration-200 group ${
                  isActive
                    ? "bg-primary text-white shadow-lg shadow-primary/30"
                    : "text-[#121714] dark:text-white hover:bg-[#f1f4f2] dark:hover:bg-[#2a3a2f] hover:text-primary"
                }`}
              >
                <span
                  className={`material-symbols-outlined text-[20px] transition-transform duration-200 group-hover:scale-110 ${
                    isActive ? "" : "text-primary"
                  }`}
                >
                  {link.icon}
                </span>
                {link.label}
                {!isActive && (
                  <span className="material-symbols-outlined text-[16px] ml-auto text-gray-300 dark:text-gray-600">
                    chevron_right
                  </span>
                )}
              </Link>
            );
          })}

          <div className="h-px bg-[#f1f4f2] dark:bg-[#2a3a2f] my-4" />
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-3 mb-2">
            Account
          </p>

          <Link
            href={isAdmin ? "/admin" : "/dashboard"}
            onClick={() => setMobileOpen(false)}
            className="flex items-center gap-4 px-4 py-3.5 rounded-2xl font-semibold text-sm text-[#121714] dark:text-white hover:bg-[#f1f4f2] dark:hover:bg-[#2a3a2f] hover:text-primary transition-all group"
          >
            <span className="material-symbols-outlined text-[20px] text-primary group-hover:scale-110 transition-transform">
              {isAdmin ? "admin_panel_settings" : "person"}
            </span>
            {isAdmin ? "Admin Dashboard" : "My Account"}
            <span className="material-symbols-outlined text-[16px] ml-auto text-gray-300 dark:text-gray-600">
              chevron_right
            </span>
          </Link>

          <Link
            href="/wishlist"
            onClick={() => setMobileOpen(false)}
            className="flex items-center gap-4 px-4 py-3.5 rounded-2xl font-semibold text-sm text-[#121714] dark:text-white hover:bg-[#f1f4f2] dark:hover:bg-[#2a3a2f] hover:text-primary transition-all group"
          >
            <span className="material-symbols-outlined text-[20px] text-primary group-hover:scale-110 transition-transform">
              favorite
            </span>
            Wishlist
            {wishlistCount > 0 && (
              <span className="ml-auto bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                {wishlistCount}
              </span>
            )}
          </Link>

          <Link
            href="/cart"
            onClick={() => setMobileOpen(false)}
            className="flex items-center gap-4 px-4 py-3.5 rounded-2xl font-semibold text-sm text-[#121714] dark:text-white hover:bg-[#f1f4f2] dark:hover:bg-[#2a3a2f] hover:text-primary transition-all group"
          >
            <span className="material-symbols-outlined text-[20px] text-primary group-hover:scale-110 transition-transform">
              shopping_cart
            </span>
            Cart
            {cartCount > 0 && (
              <span className="ml-auto bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                {cartCount}
              </span>
            )}
          </Link>
        </nav>
      </aside>
    </>
  );
};

export default Header;
