import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Idea, Answer, Question } from "@/lib/types";
import QuestionItem from "./QuestionItem";
import VersionHistoryModal from "./VersionHistoryModal";

interface IdeaCardProps {
  idea: Idea;
  questions: Question[];
  answers: Answer[];
  expanded?: boolean;
}

const IdeaCard = ({
  idea,
  questions,
  answers,
  expanded = false,
}: IdeaCardProps) => {
  const [isExpanded, setIsExpanded] = useState(expanded);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateIdeaMutation = useMutation({
    mutationFn: async (updatedIdea: Partial<Idea>) => {
      const res = await apiRequest("PUT", `/api/ideas/${idea.id}`, updatedIdea);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ideas"] });
      toast({
        title: "Success",
        description: "Idea updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update idea: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const saveAnswerMutation = useMutation({
    mutationFn: async ({ id, text }: { id?: number; text: string; questionId: number; ideaId: number }) => {
      if (id) {
        const res = await apiRequest("PUT", `/api/answers/${id}`, { text });
        return res.json();
      } else {
        const res = await apiRequest("POST", "/api/answers", {
          ideaId: idea.id,
          questionId: id,
          text,
        });
        return res.json();
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/ideas/${idea.id}/answers`] });
      toast({
        title: "Success",
        description: "Answer saved successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to save answer: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const formatDate = (date: string) => {
    const d = new Date(date);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) {
      return "Today";
    } else if (days === 1) {
      return "Yesterday";
    } else if (days < 7) {
      return `${days} days ago`;
    } else {
      return d.toLocaleDateString();
    }
  };

  const getCategoryColor = (categoryId: number | null) => {
    if (!categoryId) return "blue";
    
    const colors = {
      1: "green", // Product Ideas
      2: "blue",  // Business
      3: "purple", // Creative
      4: "indigo", // Personal
    };
    
    return colors[categoryId as keyof typeof colors] || "blue";
  };

  const getCategoryName = (categoryId: number | null) => {
    if (!categoryId) return "Uncategorized";
    
    const categories = {
      1: "Product Idea",
      2: "Business",
      3: "Creative",
      4: "Personal",
    };
    
    return categories[categoryId as keyof typeof categories] || "Uncategorized";
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case "completed":
        return { color: "green", label: "Completed" };
      case "in_progress":
        return { color: "yellow", label: "In Progress" };
      default:
        return { color: "gray", label: "New" };
    }
  };

  const handleSaveIdea = () => {
    updateIdeaMutation.mutate({
      status: idea.status === "in_progress" ? "completed" : "in_progress",
    });
  };

  const statusInfo = getStatusInfo(idea.status);
  const categoryColor = getCategoryColor(idea.categoryId);
  const categoryName = getCategoryName(idea.categoryId);

  const hasMedia = idea.mediaUrls && idea.mediaUrls.length > 0;

  return (
    <>
      <div className="idea-card bg-white shadow-sm border border-gray-200 rounded-xl overflow-hidden mb-6">
        <div className={`${isExpanded ? "border-b border-gray-200" : ""} p-4`}>
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">{idea.title}</h3>
              <div className="flex items-center text-sm text-gray-500 mb-2">
                <span className={`inline-block bg-${categoryColor}-100 text-${categoryColor}-800 text-xs font-medium mr-2 px-2 py-0.5 rounded-full`}>
                  {categoryName}
                </span>
                <span>Created {formatDate(idea.createdAt)}</span>
              </div>
            </div>
            <div className="flex space-x-1">
              <button className="p-1.5 text-gray-500 hover:text-gray-700">
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
                    d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z"
                  />
                </svg>
              </button>
            </div>
          </div>
          <p className="text-gray-700 mb-3">{idea.description}</p>

          {/* Expanded content with questions */}
          {isExpanded && (
            <div>
              <h4 className="font-medium text-gray-800 mb-2">Guided Questions</h4>
              <div className="space-y-3">
                {questions.length > 0 ? (
                  questions.map((question) => {
                    const answer = answers.find(a => a.questionId === question.id);
                    return (
                      <QuestionItem
                        key={question.id}
                        question={question}
                        answer={answer}
                        onSave={(text) =>
                          saveAnswerMutation.mutate({
                            id: answer?.id,
                            text,
                            questionId: question.id,
                            ideaId: idea.id,
                          })
                        }
                      />
                    );
                  })
                ) : (
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-500">
                      No questions yet. Add more details to get started.
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-4">
                <button className="text-primary-600 hover:text-primary-800 font-medium text-sm">
                  Add more details
                </button>
              </div>
            </div>
          )}

          {/* Media previews */}
          {hasMedia && !isExpanded && (
            <div className="mb-3 grid grid-cols-4 gap-2">
              {idea.mediaUrls.map((url, index) => {
                if (url.includes("audio")) {
                  return (
                    <div key={index} className="col-span-3">
                      <div className="flex items-center h-16 px-3 bg-gray-100 rounded-lg">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 text-gray-500 mr-2"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                          />
                        </svg>
                        <span className="text-sm text-gray-600">Audio recording</span>
                      </div>
                    </div>
                  );
                } else {
                  return (
                    <div key={index} className="col-span-1">
                      <div className="rounded-lg h-16 w-full bg-gray-100 flex items-center justify-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-6 w-6 text-gray-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                    </div>
                  );
                }
              })}
            </div>
          )}

          <div className="flex items-center space-x-2">
            <div>
              <span
                className={`w-2 h-2 inline-block bg-${statusInfo.color}-500 rounded-full`}
              ></span>
              <span className="text-xs text-gray-500">{statusInfo.label}</span>
            </div>
            <div className="flex-1"></div>
            <div className="flex space-x-2">
              <button
                className="flex items-center text-sm text-gray-500 hover:text-gray-700"
                onClick={handleSaveIdea}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                  />
                </svg>
                Save
              </button>
              <button
                className="flex items-center text-sm text-gray-500 hover:text-gray-700"
                onClick={() => setShowHistoryModal(true)}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                Version History
              </button>
              <button
                className="text-sm text-gray-500 hover:text-gray-700"
                onClick={() => setIsExpanded(!isExpanded)}
              >
                {isExpanded ? "Collapse" : "Expand"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {showHistoryModal && (
        <VersionHistoryModal
          idea={idea}
          onClose={() => setShowHistoryModal(false)}
        />
      )}
    </>
  );
};

export default IdeaCard;
