"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
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

const Header = ({ logo }: HeaderProps) => {
  const { data: session } = useSession();
  const isAdmin = session?.user?.roleName && session.user.roleName !== 'user';
  const cartCount = useAppSelector((state) =>
    state.cartReducer.items.reduce((sum, item) => sum + item.quantity, 0)
  );
  const wishlistCount = useAppSelector(
    (state) => state.wishlistReducer.count
  );

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery] = useDebounce(searchQuery, 300);
  const [searchResults, setSearchResults] = useState<ProductResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setShowDropdown(false);
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
          const res = await fetch(`/api/products?q=${encodeURIComponent(debouncedSearchQuery)}`);
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
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-background-dark border-b border-solid border-[#f1f4f2] dark:border-[#2a3a2f] px-6 md:px-10 py-4">
      <div className="max-w-300 mx-auto flex items-center justify-between gap-8">
        <div className="flex items-center gap-10">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 text-primary">
            {logo?.logo || logo?.dark_logo ? (
              <>
                {logo.logo && (
                  <img
                    src={logo.logo}
                    alt="Logo (White)"
                    className={`h-9 w-auto object-contain ${logo.dark_logo ? 'hidden dark:block' : ''}`}
                  />
                )}
                {logo.dark_logo && (
                  <img
                    src={logo.dark_logo}
                    alt="Logo (Black)"
                    className={`h-9 w-auto object-contain ${logo.logo ? 'dark:hidden block' : ''}`}
                  />
                )}
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-3xl font-bold">eco</span>
                <h2 className="text-[#121714] dark:text-white text-2xl font-black leading-tight tracking-[-0.015em]">
                  Ecomare
                </h2>
              </>
            )}
          </Link>

          {/* Nav */}
          <nav className="hidden lg:flex items-center gap-8">
            <Link className="text-[#121714] dark:text-white text-sm font-semibold leading-normal hover:text-primary transition-colors" href="/shop">
              Shop
            </Link>
            <Link className="text-[#121714] dark:text-white text-sm font-semibold leading-normal hover:text-primary transition-colors" href="/about">
              About
            </Link>
            <Link className="text-[#121714] dark:text-white text-sm font-semibold leading-normal hover:text-primary transition-colors" href="/contact">
              Contact
            </Link>
          </nav>
        </div>

        <div className="flex flex-1 justify-end items-center gap-4">
          {/* Search */}
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
                placeholder="Search eco-products..."
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
                                  ${product.discountedPrice}
                                </span>
                                <span className="text-xs text-[#668571] line-through">
                                  ${product.price}
                                </span>
                              </>
                            ) : (
                              <span className="text-sm font-bold text-[#121714] dark:text-white">
                                ${product.price}
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
                    No products found for "{searchQuery}"
                  </div>
                ) : null}
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <ThemeToggle />

            {/* Wishlist */}
            <Link href="/wishlist" className="relative size-10 flex items-center justify-center rounded-lg bg-[#f1f4f2] dark:bg-[#2a3a2f] text-[#121714] dark:text-white hover:bg-primary/20 transition-colors">
              <span className="material-symbols-outlined">favorite</span>
              {wishlistCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full bg-primary text-white text-[10px] font-bold leading-none">
                  {wishlistCount > 99 ? "99+" : wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart */}
            <Link href="/cart" className="relative size-10 flex items-center justify-center rounded-lg bg-[#f1f4f2] dark:bg-[#2a3a2f] text-[#121714] dark:text-white hover:bg-primary/20 transition-colors">
              <span className="material-symbols-outlined">shopping_cart</span>
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full bg-primary text-white text-[10px] font-bold leading-none">
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              )}
            </Link>

            {/* Account */}
            <Link href={isAdmin ? "/admin" : "/dashboard"} className="size-10 flex items-center justify-center rounded-lg bg-primary text-white hover:bg-primary-dark transition-colors">
              <span className="material-symbols-outlined">person</span>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
