import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Category } from "@/lib/types";

interface CategoryFilterProps {
  userId: number;
  selectedCategory: number | null;
  onCategorySelect: (categoryId: number | null) => void;
}

const CategoryFilter = ({
  userId,
  selectedCategory,
  onCategorySelect,
}: CategoryFilterProps) => {
  const { data: categories, isLoading } = useQuery<Category[]>({
    queryKey: [`/api/categories?userId=${userId}`],
  });

  if (isLoading) {
    return (
      <div className="flex space-x-2 overflow-x-auto pb-2 mb-6">
        <div className="animate-pulse h-8 w-24 bg-gray-200 rounded-full"></div>
        <div className="animate-pulse h-8 w-28 bg-gray-200 rounded-full"></div>
        <div className="animate-pulse h-8 w-20 bg-gray-200 rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="flex space-x-2 overflow-x-auto pb-2 mb-6">
      <button
        className={`flex items-center space-x-1 px-3 py-1.5 ${
          selectedCategory === null
            ? "bg-primary-100 text-primary-800"
            : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
        } rounded-full text-sm font-medium whitespace-nowrap`}
        onClick={() => onCategorySelect(null)}
      >
        <span>All Categories</span>
      </button>
      
      {categories?.map((category) => (
        <button
          key={category.id}
          className={`flex items-center space-x-1 px-3 py-1.5 ${
            selectedCategory === category.id
              ? "bg-primary-100 text-primary-800"
              : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
          } rounded-full text-sm font-medium whitespace-nowrap`}
          onClick={() => onCategorySelect(category.id)}
        >
          <span>{category.name}</span>
        </button>
      ))}
    </div>
  );
};

export default CategoryFilter;
