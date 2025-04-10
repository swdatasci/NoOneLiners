import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import NewIdeaForm from "@/components/NewIdeaForm";
import IdeaCard from "@/components/IdeaCard";
import CategoryFilter from "@/components/CategoryFilter";
import { Idea, Answer, Question } from "@/lib/types";

const Home = () => {
  const [showNewIdeaForm, setShowNewIdeaForm] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get user ID (in a real app, this would come from auth context)
  const userId = 1;

  // Get ideas
  const { data: ideas, isLoading: ideasLoading } = useQuery<Idea[]>({
    queryKey: [`/api/ideas?userId=${userId}`],
  });

  // Function to generate questions for an idea
  const generateQuestionsMutation = useMutation({
    mutationFn: async (ideaId: number) => {
      const res = await apiRequest(
        "POST",
        `/api/ideas/${ideaId}/generate-questions`,
        {}
      );
      return res.json();
    },
    onSuccess: (data, ideaId) => {
      queryClient.invalidateQueries({
        queryKey: [`/api/ideas/${ideaId}/generate-questions`],
      });
      toast({
        title: "Questions generated",
        description: "New questions have been generated for your idea",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to generate questions: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Filter ideas based on search and category
  const filteredIdeas = ideas
    ? ideas
        .filter((idea) => {
          // Filter by search query
          if (searchQuery) {
            return (
              idea.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
              idea.description.toLowerCase().includes(searchQuery.toLowerCase())
            );
          }
          return true;
        })
        .filter((idea) => {
          // Filter by category
          if (selectedCategory !== null) {
            return idea.categoryId === selectedCategory;
          }
          return true;
        })
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    : [];

  // Stats calculations
  const totalIdeas = ideas?.length || 0;
  const completedIdeas = ideas?.filter((idea) => idea.status === "completed").length || 0;
  const inProgressIdeas = ideas?.filter((idea) => idea.status === "in_progress").length || 0;
  const categoryCount = new Set(ideas?.map((idea) => idea.categoryId)).size;

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Your Ideas</h1>
        <div className="flex space-x-2">
          <div className="relative">
            <input
              type="text"
              placeholder="Search ideas..."
              className="pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 w-full sm:w-64"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-gray-400 absolute left-3 top-2.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <p className="text-sm text-gray-500 mb-1">Total Ideas</p>
          <p className="text-2xl font-semibold">{totalIdeas}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <p className="text-sm text-gray-500 mb-1">Completed</p>
          <p className="text-2xl font-semibold">{completedIdeas}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <p className="text-sm text-gray-500 mb-1">In Progress</p>
          <p className="text-2xl font-semibold">{inProgressIdeas}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <p className="text-sm text-gray-500 mb-1">Categories</p>
          <p className="text-2xl font-semibold">{categoryCount}</p>
        </div>
      </div>

      {/* Category Filter */}
      <CategoryFilter
        userId={userId}
        selectedCategory={selectedCategory}
        onCategorySelect={(categoryId) => setSelectedCategory(categoryId)}
      />

      {/* New Idea Form */}
      {showNewIdeaForm ? (
        <NewIdeaForm
          userId={userId}
          onCancel={() => setShowNewIdeaForm(false)}
        />
      ) : (
        <div className="mb-6">
          <button
            className="w-full bg-white shadow-sm border border-gray-200 rounded-xl p-4 text-center text-gray-700 hover:bg-gray-50 flex items-center justify-center space-x-2"
            onClick={() => setShowNewIdeaForm(true)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            <span>Capture a new idea</span>
          </button>
        </div>
      )}

      {/* Ideas List */}
      {ideasLoading ? (
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-white shadow-sm border border-gray-200 rounded-xl p-4">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/4 mb-3"></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3 mb-4"></div>
                <div className="flex justify-between">
                  <div className="h-3 bg-gray-200 rounded w-1/5"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredIdeas.length > 0 ? (
        filteredIdeas.map((idea) => {
          // Use React Query for getting answers and questions for each idea
          const { data: answers = [] } = useQuery<Answer[]>({
            queryKey: [`/api/ideas/${idea.id}/answers`],
          });

          const { data: questions = [] } = useQuery<Question[]>({
            queryKey: [`/api/ideas/${idea.id}/generate-questions`],
            enabled: false, // Don't fetch automatically
          });

          // If we don't have questions yet, and we have fewer than 3 answers, generate questions
          if (questions.length === 0 && answers.length < 3) {
            generateQuestionsMutation.mutate(idea.id);
          }

          return (
            <IdeaCard
              key={idea.id}
              idea={idea}
              questions={questions}
              answers={answers}
            />
          );
        })
      ) : (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-12 w-12 mx-auto text-gray-400 mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
            />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No ideas found
          </h3>
          <p className="text-gray-500 mb-6">
            {searchQuery || selectedCategory !== null
              ? "Try adjusting your search or filters"
              : "Get started by creating your first idea"}
          </p>
          <button
            className="bg-primary-600 hover:bg-primary-700 text-white font-medium px-4 py-2 rounded-lg"
            onClick={() => setShowNewIdeaForm(true)}
          >
            Create New Idea
          </button>
        </div>
      )}
    </div>
  );
};

export default Home;
