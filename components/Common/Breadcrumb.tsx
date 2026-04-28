import Link from "next/link";
import React from "react";

interface BreadcrumbPage {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  title: string;
  pages: (string | BreadcrumbPage)[];
}

const Breadcrumb = ({ title, pages }: BreadcrumbProps) => {
  return (
    <div className="overflow-hidden shadow-breadcrumb pt-[209px] sm:pt-[155px] lg:pt-[95px] xl:pt-[165px]">
      <div className="border-t border-gray-3">
        <div className=" max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0 py-5 xl:py-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h1 className="font-semibold text-dark text-xl sm:text-2xl xl:text-custom-2">
              {title}
            </h1>

            <ul className="flex items-center gap-2 flex-wrap">
              <li className="text-[14px] hover:text-blue">
                <Link href="/">Home</Link>
              </li>

              {pages.length > 0 &&
                pages.map((page, key) => {
                  const isLast = key === pages.length - 1;
                  const label = typeof page === "string" ? page : page.label;
                  const href = typeof page === "string" ? undefined : page.href;

                  return (
                    <React.Fragment key={key}>
                      <li className="text-[14px] text-gray-400">/</li>
                      <li className={`text-[14px] capitalize ${isLast ? "text-blue" : "hover:text-blue"}`}>
                        {href && !isLast ? (
                          <Link href={href}>{label}</Link>
                        ) : (
                          <span>{label}</span>
                        )}
                      </li>
                    </React.Fragment>
                  );
                })}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Breadcrumb;
