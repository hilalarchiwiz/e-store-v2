"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion"; // Added Framer Motion
import Breadcrumb from "../Common/Breadcrumb";
import CustomSelect from "./CustomSelect";
import CategoryDropdown from "./CategoryDropdown";
import ColorsDropdwon from "./ColorsDropdwon";
import PriceDropdown from "./PriceDropdown";
import shopData from "../Shop/shopData";
import SingleGridItem from "../Shop/SingleGridItem";
import SingleListItem from "../Shop/SingleListItem";
import InStockDropdown from "./InStockDropdown";
import SortDropdown from "./SortDropdown";
import BrandDropdown from "./BrandDropdown";
import Link from "next/link";
import Pagination from "../Pagination";

const ShopWithSidebar = ({ products, categories, brands, price_range, showingCount, totalCount, totalPages, currentPage }) => {
  const [productStyle, setProductStyle] = useState("grid");
  const [productSidebar, setProductSidebar] = useState(false);
  const [stickyMenu, setStickyMenu] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Framer Motion Variants for the Grid
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1, // This creates the "one by one" pop-up effect
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.4, ease: "easeOut" },
    },
  };

  const handleStickyMenu = () => {
    if (window.scrollY >= 80) {
      setStickyMenu(true);
    } else {
      setStickyMenu(false);
    }
  };

  const options = [
    { label: "Newest Arrivals", value: "newest" },
    { label: "Oldest Products", value: "oldest" },
    { label: "Price: Low to High", value: "price-asc" },
    { label: "Price: High to Low", value: "price-desc" },
  ];

  const inStocks = [{ name: "In Stock", products: totalCount }];

  const sortBy = [
    { name: "Alphabetically, A-Z", value: "a-z" },
    { name: "Alphabetically, Z-A", value: "z-a" },
    { name: "Price, low to high", value: "price-asc" },
    { name: "Price, high to low", value: "price-desc" },
    { name: "Date, new to old", value: "newest" },
    { name: "Date, old to new", value: "oldest" },
  ];

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, [products, currentPage]); // Triggers loading on data change

  useEffect(() => {
    window.addEventListener("scroll", handleStickyMenu);
    function handleClickOutside(event) {
      if (!event.target.closest(".sidebar-content")) {
        setProductSidebar(false);
      }
    }
    if (productSidebar) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      window.removeEventListener("scroll", handleStickyMenu);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [productSidebar]);

  return (
    <>
      <Breadcrumb
        title={"All Products"}
        pages={["shop"]}
      />
      <section className="overflow-hidden relative pb-20 pt-5 lg:pt-20 xl:pt-28 bg-[#f3f4f6]">
        <div className=" max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <div className="flex gap-7.5">
            {/* */}
            <div
              className={`sidebar-content fixed xl:z-1 z-9999 left-0 top-0 xl:translate-x-0 xl:static max-w-[310px] xl:max-w-[270px] w-full ease-out duration-200 ${productSidebar
                ? "translate-x-0 bg-white p-5 h-screen overflow-y-auto"
                : "-translate-x-full"
                }`}
            >
              <button
                onClick={() => setProductSidebar(!productSidebar)}
                className={`xl:hidden absolute -right-12.5 sm:-right-8 flex items-center justify-center w-8 h-8 rounded-md bg-white shadow-1 ${stickyMenu ? "lg:top-20 sm:top-34.5 top-35" : "lg:top-24 sm:top-39 top-37"
                  }`}
              >
                <svg className="fill-current" width="24" height="24" viewBox="0 0 24 24"><path d="M10.0068 3.44714C10.3121 3.72703 10.3328 4.20146 10.0529 4.5068L5.70494 9.25H20C20.4142 9.25 20.75 9.58579 20.75 10C20.75 10.4142 20.4142 10.75 20 10.75H4.00002C3.70259 10.75 3.43327 10.5742 3.3135 10.302C3.19374 10.0298 3.24617 9.71246 3.44715 9.49321L8.94715 3.49321C9.22704 3.18787 9.70147 3.16724 10.0068 3.44714Z" /><path d="M20.6865 13.698C20.5668 13.4258 20.2974 13.25 20 13.25L4.00001 13.25C3.5858 13.25 3.25001 13.5858 3.25001 14C3.25001 14.4142 3.5858 14.75 4.00001 14.75L18.2951 14.75L13.9472 19.4932C13.6673 19.7985 13.6879 20.273 13.9932 20.5529C14.2986 20.8328 14.773 20.8121 15.0529 20.5068L20.5529 14.5068C20.7539 14.2876 20.8063 13.9703 20.6865 13.698Z" /></svg>
              </button>

              <form onSubmit={(e) => e.preventDefault()}>
                <div className="flex flex-col gap-6">
                  <div className="bg-white shadow-1 rounded-lg py-4 px-5">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-dark">Filters:</p>
                      <Link href={'/shop'} className="text-blue hover:underline">Clean All</Link>
                    </div>
                  </div>
                  <CategoryDropdown categories={categories} />
                  <BrandDropdown brands={brands} />
                  <InStockDropdown inStocks={inStocks} />
                  <SortDropdown sortOptions={sortBy} />
                  <PriceDropdown max={price_range?.max} min={price_range?.min} />
                </div>
              </form>
            </div>

            {/* */}
            <div className=" w-full">
              <div className="rounded-lg bg-white shadow-1 pl-3 pr-2.5 py-2.5 mb-6">
                <div className="flex items-center justify-between">
                  <div className="flex flex-wrap items-center gap-4">
                    <CustomSelect options={options} />
                    <p className="text-sm">
                      Showing <span className="text-dark font-medium">{showingCount} of {totalCount}</span> Products
                    </p>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <button onClick={() => setProductStyle("grid")} className={`p-2 rounded-[5px] border ease-in-out duration-200 ${productStyle === "grid" ? "bg-blue-dark text-white" : "bg-gray-1"}`}>
                      <svg className="fill-current" width="18" height="18" viewBox="0 0 18 18"><path d="M1 1h6v6H1V1zm10 0h6v6h-6V1zM1 11h6v6H1v-6zm10 0h6v6h-6v-6z" /></svg>
                    </button>
                    <button onClick={() => setProductStyle("list")} className={`p-2 rounded-[5px] border ease-in-out duration-200 ${productStyle === "list" ? "bg-blue-dark text-white" : "bg-gray-1"}`}>
                      <svg className="fill-current" width="18" height="18" viewBox="0 0 18 18"><path d="M1 4h16M1 9h16M1 14h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
                    </button>
                  </div>
                </div>
              </div>

              {/* Animated Content Area */}
              <AnimatePresence mode="wait">
                {isLoading ? (
                  <motion.div
                    key="loader"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-7.5"
                  >
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="bg-white p-4 rounded-lg shadow-1 animate-pulse">
                        <div className="bg-gray-200 h-48 rounded-md mb-4"></div>
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    ))}
                  </motion.div>
                ) : (
                  <motion.div
                    key="products"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className={`${productStyle === "grid"
                      ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-7.5 gap-y-9"
                      : "flex flex-col gap-7.5"
                      }`}
                  >
                    {products?.length > 0 ? (
                      products.map((item, key) => (
                        <motion.div key={item.id || key} variants={itemVariants}>
                          {productStyle === "grid" ? (
                            <SingleGridItem item={item} />
                          ) : (
                            <SingleListItem item={item} />
                          )}
                        </motion.div>
                      ))
                    ) : (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="col-span-full text-center py-20">
                        <p className="text-xl text-gray-500">No products found matching your search.</p>
                      </motion.div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="mt-10">
                <Pagination totalPages={totalPages} currentPage={currentPage} />
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default ShopWithSidebar;