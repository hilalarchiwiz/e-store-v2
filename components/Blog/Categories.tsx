import React from "react";

const Categories = ({ category }) => {
  return (
    <div className="shadow-1 bg-white rounded-full">
      <div className="py-2 px-4">
        <div className="flex items-center gap-3">
          <button className="group cursor-pointer flex items-center justify-between ease-out duration-200 text-dark hover:text-blue">
            {category?.name}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Categories;
