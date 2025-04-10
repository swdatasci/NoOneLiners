import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Idea, IdeaVersion } from "@/lib/types";

interface VersionHistoryModalProps {
  idea: Idea;
  onClose: () => void;
}

const VersionHistoryModal = ({ idea, onClose }: VersionHistoryModalProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Animate modal entrance
  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Get version history
  const { data: versions, isLoading } = useQuery({
    queryKey: [`/api/ideas/${idea.id}/versions`],
  });

  // Restore version mutation
  const restoreVersionMutation = useMutation({
    mutationFn: async (versionId: number) => {
      const res = await apiRequest(
        "POST",
        `/api/ideas/${idea.id}/restore/${versionId}`,
        {}
      );
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ideas"] });
      queryClient.invalidateQueries({
        queryKey: [`/api/ideas/${idea.id}/versions`],
      });
      queryClient.invalidateQueries({
        queryKey: [`/api/ideas/${idea.id}/answers`],
      });
      toast({
        title: "Version restored",
        description: "The idea has been restored to the selected version",
      });
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to restore version: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  const handleRestore = (versionId: number) => {
    restoreVersionMutation.mutate(versionId);
  };

  return (
    <div
      className={`fixed inset-0 z-50 overflow-y-auto transition-opacity duration-300 ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
    >
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div
          className="fixed inset-0 transition-opacity"
          aria-hidden="true"
          onClick={handleClose}
        >
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>
        <span
          className="hidden sm:inline-block sm:align-middle sm:h-screen"
          aria-hidden="true"
        >
          &#8203;
        </span>
        <div
          className={`inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full transition-transform duration-300 ${
            isVisible ? "translate-y-0" : "translate-y-4"
          }`}
        >
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="mt-3 text-center sm:mt-0 sm:text-left">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-2">
                Version History
              </h3>
              <p className="text-sm text-gray-500 mb-4">{idea.title}</p>

              {isLoading ? (
                <div className="py-6 flex justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                </div>
              ) : (
                <div className="relative">
                  <div className="version-line"></div>
                  <div className="space-y-5 relative">
                    {versions && versions.length > 0 ? (
                      versions.map((version: IdeaVersion, index: number) => (
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
                              {version.description.length > 100
                                ? `${version.description.substring(0, 100)}...`
                                : version.description}
                            </p>
                            {index !== 0 && (
                              <button
                                className="text-xs text-primary-600 font-medium mt-1"
                                onClick={() => handleRestore(version.id)}
                                disabled={restoreVersionMutation.isPending}
                              >
                                {restoreVersionMutation.isPending &&
                                restoreVersionMutation.variables === version.id
                                  ? "Restoring..."
                                  : "Restore this version"}
                              </button>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500">
                        No version history available
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:w-auto sm:text-sm"
              onClick={handleClose}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VersionHistoryModal;
