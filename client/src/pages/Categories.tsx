import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Category, Idea } from "@/lib/types";
import IdeaCard from "@/components/IdeaCard";
import { useIdeas } from "@/hooks/useIdeas";

const Categories = () => {
  const [newCategoryName, setNewCategoryName] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Get user ID (in a real app, this would come from auth context)
  const userId = 1;

  // Fetch categories
  const { data: categories = [], isLoading: categoriesLoading } = useQuery<Category[]>({
    queryKey: [`/api/categories?userId=${userId}`],
  });

  // Use the custom hook to get ideas
  const { ideas, isLoading: ideasLoading } = useIdeas(userId);

  // Filter ideas by selected category
  const filteredIdeas = selectedCategory
    ? ideas?.filter(idea => idea.categoryId === selectedCategory) || []
    : [];

  // Mutation to create a new category
  const createCategoryMutation = useMutation({
    mutationFn: async (name: string) => {
      const res = await apiRequest("POST", "/api/categories", { 
        name, 
        userId 
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/categories`] });
      setNewCategoryName("");
      toast({
        title: "Category created",
        description: "Your new category has been created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to create category: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a category name",
        variant: "destructive",
      });
      return;
    }
    createCategoryMutation.mutate(newCategoryName);
  };

  const handleCategorySelect = (categoryId: number) => {
    setSelectedCategory(categoryId === selectedCategory ? null : categoryId);
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Categories</h1>
      </div>

      {/* Create Category Form */}
      <div className="bg-white shadow-sm border border-gray-200 rounded-xl p-4 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Create a new category</h2>
        <form onSubmit={handleCreateCategory} className="flex items-end gap-4">
          <div className="flex-1">
            <label htmlFor="category-name" className="block text-sm font-medium text-gray-700 mb-1">
              Category Name
            </label>
            <input
              type="text"
              id="category-name"
              placeholder="Enter category name..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
            />
          </div>
          <button
            type="submit"
            className="bg-primary-600 hover:bg-primary-700 text-white font-medium px-4 py-2 rounded-lg"
            disabled={createCategoryMutation.isPending}
          >
            {createCategoryMutation.isPending ? "Creating..." : "Create Category"}
          </button>
        </form>
      </div>

      {/* Categories List */}
      <div className="bg-white shadow-sm border border-gray-200 rounded-xl p-4 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Categories</h2>
        
        {categoriesLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse h-10 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        ) : categories.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {categories.map((category) => (
              <button
                key={category.id}
                className={`p-3 rounded-lg border text-left ${
                  selectedCategory === category.id
                    ? "border-primary-500 bg-primary-50 text-primary-700"
                    : "border-gray-200 hover:bg-gray-50"
                }`}
                onClick={() => handleCategorySelect(category.id)}
              >
                <span className="font-medium">{category.name}</span>
                <div className="text-xs text-gray-500 mt-1">
                  {ideas?.filter(idea => idea.categoryId === category.id).length || 0} ideas
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">No categories found. Create your first category above.</p>
          </div>
        )}
      </div>

      {/* Ideas in selected category */}
      {selectedCategory && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Ideas in {categories.find(c => c.id === selectedCategory)?.name}
            </h2>
          </div>

          {ideasLoading ? (
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-white shadow-sm border border-gray-200 rounded-xl p-4">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/4 mb-3"></div>
                    <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredIdeas.length > 0 ? (
            <div className="space-y-4">
              {filteredIdeas.map((idea) => (
                <IdeaCard
                  key={idea.id}
                  idea={idea}
                  questions={[]}
                  answers={[]}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-white rounded-lg border border-gray-200">
              <p className="text-gray-500">No ideas in this category yet.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Categories;
