'use client'
import { useRouter, useSearchParams } from "next/navigation";
import BlogItem from "../Blog/BlogItem";
import Categories from "../Blog/Categories";
import Breadcrumb from "../Common/Breadcrumb";
import Pagination from "../Pagination";

const BlogGridSection = ({ blogs, totalPages, currentPage, tags }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTag = searchParams.get("tag") || "All Posts";

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", newPage.toString());
    router.push(`?${params.toString()}`);
  };

  const handleTagChange = (tag: string) => {
    const params = new URLSearchParams();
    params.set("tag", tag);
    params.set("page", "1"); // Reset to page 1 on filter
    router.push(`?${params.toString()}`);
  };
  const categories = [
    {
      name: "All Posts",
    }
  ];

  return (
    <>
      <Breadcrumb title={"Blog"} pages={["blogs"]} />

      <section className="overflow-hidden py-5 bg-gray-2">
        <div className=" max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <div className="flex flex-col lg:flex-row gap-7.5">
            {/* <!-- blog grid --> */}
            <div className="">
              <div className="flex items-center gap-3 mb-2">
                {["All Posts", ...tags].map((tag) => (
                  <button
                    key={tag}
                    onClick={() => handleTagChange(tag)}
                    className={`px-4 py-2 cursor-pointer rounded-full text-sm transition ${activeTag === tag
                      ? "bg-blue text-white"
                      : "bg-white text-dark hover:bg-blue hover:text-white"
                      }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-y-10 gap-x-7.5">
                {blogs.map((blog, key) => (
                  <BlogItem blog={blog} key={key} />
                ))}
              </div>

              {/* <!-- Blog Pagination Start --> */}
              <Pagination currentPage={currentPage} totalPages={totalPages} />
              {/* <!-- Blog Pagination End --> */}
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default BlogGridSection;
