import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useIdeas } from "@/hooks/useIdeas";
import { Idea } from "@/lib/types";

const VersionHistory = () => {
  const [selectedIdea, setSelectedIdea] = useState<Idea | null>(null);
  
  // Get user ID (in a real app, this would come from auth context)
  const userId = 1;
  
  // Get all ideas
  const { ideas, isLoading } = useIdeas(userId);
  
  // Get versions for selected idea
  const { data: versions = [], isLoading: versionsLoading } = useQuery({
    queryKey: [`/api/ideas/${selectedIdea?.id}/versions`],
    enabled: !!selectedIdea,
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Version History</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Ideas List */}
        <div className="lg:col-span-1">
          <div className="bg-white shadow-sm border border-gray-200 rounded-xl p-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Select an Idea</h2>
            
            {isLoading ? (
              <div className="space-y-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="animate-pulse h-10 bg-gray-200 rounded-lg mb-2"></div>
                ))}
              </div>
            ) : ideas && ideas.length > 0 ? (
              <div className="space-y-2">
                {ideas.map((idea) => (
                  <button
                    key={idea.id}
                    className={`w-full text-left p-3 rounded-lg border ${
                      selectedIdea?.id === idea.id
                        ? "border-primary-500 bg-primary-50 text-primary-700"
                        : "border-gray-200 hover:bg-gray-50"
                    }`}
                    onClick={() => setSelectedIdea(idea)}
                  >
                    <div className="font-medium truncate">{idea.title}</div>
                    <div className="text-xs text-gray-500">
                      Updated {new Date(idea.updatedAt).toLocaleDateString()}
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No ideas found</p>
              </div>
            )}
          </div>
        </div>

        {/* Version Timeline */}
        <div className="lg:col-span-2">
          <div className="bg-white shadow-sm border border-gray-200 rounded-xl p-4 h-full">
            {!selectedIdea ? (
              <div className="h-full flex items-center justify-center">
                <p className="text-gray-500">Select an idea to view its version history</p>
              </div>
            ) : versionsLoading ? (
              <div className="space-y-6 pt-4">
                <div className="animate-pulse h-4 bg-gray-200 rounded w-3/4 mb-8"></div>
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex animate-pulse">
                    <div className="h-4 w-4 rounded-full bg-gray-200 mr-4 mt-1"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/3 mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-full mb-1"></div>
                      <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Version History for "{selectedIdea.title}"
                </h2>

                <div className="relative">
                  <div className="version-line"></div>
                  
                  {versions.length > 0 ? (
                    <div className="space-y-6 relative">
                      {versions.map((version, index) => (
                        <div className="flex" key={version.id}>
                          <div className="flex-shrink-0 mt-1 relative">
                            <div
                              className={`h-4 w-4 rounded-full ${
                                index === 0
                                  ? "bg-primary-600"
                                  : "bg-gray-300"
                              } border-2 border-white z-10 relative`}
                            ></div>
                          </div>
                          <div className="ml-4">
                            <h4 className="text-sm font-medium text-gray-900">
                              {index === 0
                                ? "Latest Version"
                                : index === versions.length - 1
                                ? "Initial Version"
                                : `Version ${versions.length - index}`}
                            </h4>
                            <p className="text-xs text-gray-500 mt-0.5">
                              {formatDate(version.createdAt)}
                            </p>
                            <p className="mt-1 text-sm text-gray-700">
                              {version.description.length > 150
                                ? `${version.description.substring(0, 150)}...`
                                : version.description}
                            </p>
                            <div className="mt-2">
                              {version.answersSnapshot && version.answersSnapshot.length > 0 && (
                                <details className="text-xs">
                                  <summary className="text-primary-600 font-medium cursor-pointer">
                                    View answers from this version
                                  </summary>
                                  <div className="mt-2 ml-2 space-y-2 bg-gray-50 p-2 rounded">
                                    {version.answersSnapshot.map((answer, i) => (
                                      <div key={i} className="border-b border-gray-100 pb-2 last:border-b-0 last:pb-0">
                                        <p className="text-xs font-medium text-gray-700">{answer.questionText}</p>
                                        <p className="text-xs text-gray-600">{answer.answerText}</p>
                                      </div>
                                    ))}
                                  </div>
                                </details>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500">No version history available for this idea</p>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VersionHistory;
