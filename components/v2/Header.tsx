"use client";

import Link from "next/link";
import ThemeToggle from "./ThemeToggle";
import { useAppSelector } from "@/redux/store";

interface HeaderProps {
  logo?: { logo?: string; favicon?: string };
}

const Header = ({ logo }: HeaderProps) => {
  const cartCount = useAppSelector((state) =>
    state.cartReducer.items.reduce((sum, item) => sum + item.quantity, 0)
  );
  const wishlistCount = useAppSelector(
    (state) => state.wishlistReducer.count
  );

  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-background-dark border-b border-solid border-[#f1f4f2] dark:border-[#2a3a2f] px-6 md:px-10 py-4">
      <div className="max-w-300 mx-auto flex items-center justify-between gap-8">
        <div className="flex items-center gap-10">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 text-primary">
            {logo?.logo ? (
              <img
                src={logo.logo}
                alt="Logo"
                className="h-9 w-auto object-contain"
              />
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
          <div className="hidden md:flex flex-1 max-w-md items-stretch rounded-lg h-10 bg-[#f1f4f2] dark:bg-[#2a3a2f]">
            <div className="flex items-center justify-center pl-4 text-[#668571]">
              <span className="material-symbols-outlined">search</span>
            </div>
            <input
              className="w-full border-none bg-transparent focus:ring-0 text-sm placeholder:text-[#668571] px-4"
              placeholder="Search eco-products..."
            />
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
            <Link href="/dashboard" className="size-10 flex items-center justify-center rounded-lg bg-primary text-white hover:bg-primary-dark transition-colors">
              <span className="material-symbols-outlined">person</span>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
