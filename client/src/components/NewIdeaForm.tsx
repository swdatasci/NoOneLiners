import { useState } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface NewIdeaFormProps {
  userId: number;
  onCancel?: () => void;
}

const NewIdeaForm = ({ userId, onCancel }: NewIdeaFormProps) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get categories
  const { data: categories } = useQuery({
    queryKey: [`/api/categories?userId=${userId}`],
  });

  const createIdeaMutation = useMutation({
    mutationFn: async (idea: {
      title: string;
      description: string;
      categoryId: number | null;
      userId: number;
      mediaUrls: string[];
    }) => {
      const res = await apiRequest("POST", "/api/ideas", idea);
      return res.json();
    },
    onSuccess: () => {
      // Reset form
      setTitle("");
      setDescription("");
      setCategoryId(null);
      setMediaUrls([]);

      // Refresh ideas list
      queryClient.invalidateQueries({ queryKey: ["/api/ideas"] });

      toast({
        title: "Success",
        description: "Idea created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to create idea: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = () => {
    if (!title.trim()) {
      toast({
        title: "Error",
        description: "Please enter a title for your idea",
        variant: "destructive",
      });
      return;
    }

    createIdeaMutation.mutate({
      title,
      description,
      categoryId,
      userId,
      mediaUrls,
    });
  };

  const simulateRecording = () => {
    setIsRecording(true);
    setTimeout(() => {
      setIsRecording(false);
      setMediaUrls([...mediaUrls, "audio-recording"]);
      toast({
        title: "Recording saved",
        description: "Audio recording has been added to your idea",
      });
    }, 3000);
  };

  const simulateImageUpload = () => {
    setMediaUrls([...mediaUrls, "image-upload"]);
    toast({
      title: "Image added",
      description: "Image has been added to your idea",
    });
  };

  return (
    <div className="bg-white shadow-sm border border-gray-200 rounded-xl p-4 mb-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Capture a new idea
      </h2>

      <div className="mb-4">
        <label htmlFor="idea-title" className="block text-sm font-medium text-gray-700 mb-1">
          Title
        </label>
        <input
          type="text"
          id="idea-title"
          placeholder="Give your idea a title..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      <div className="mb-4">
        <label htmlFor="idea-description" className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          id="idea-description"
          rows={3}
          placeholder="Describe your idea in detail..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <button
          className={`flex items-center px-3 py-2 ${
            isRecording
              ? "bg-red-100 text-red-700 recording-pulse"
              : "bg-gray-100 hover:bg-gray-200"
          } rounded-lg text-sm`}
          onClick={simulateRecording}
          disabled={isRecording}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-2 text-gray-600"
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
          <span>{isRecording ? "Recording..." : "Record Audio"}</span>
        </button>
        <button
          className="flex items-center px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm"
          onClick={simulateImageUpload}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-2 text-gray-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          <span>Add Image</span>
        </button>
        <select
          className="flex items-center px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm appearance-none"
          value={categoryId || ""}
          onChange={(e) => setCategoryId(e.target.value ? Number(e.target.value) : null)}
        >
          <option value="">Select Category</option>
          {categories?.map((category: any) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      {/* Media previews */}
      {mediaUrls.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-2">
          {mediaUrls.map((url, index) => (
            <div
              key={index}
              className={`${
                url.includes("audio") ? "bg-blue-50 text-blue-700" : "bg-green-50 text-green-700"
              } px-3 py-1 rounded-full text-xs font-medium flex items-center`}
            >
              {url.includes("audio") ? (
                <>
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
                      d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                    />
                  </svg>
                  Audio
                </>
              ) : (
                <>
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
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  Image
                </>
              )}
              <button
                className="ml-2 text-gray-500 hover:text-gray-700"
                onClick={() => {
                  setMediaUrls(mediaUrls.filter((_, i) => i !== index));
                }}
              >
                &times;
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex justify-between">
        <button 
          className="text-gray-500 text-sm hover:text-gray-700"
          onClick={onCancel}
        >
          Cancel
        </button>
        <button
          className="bg-primary-600 hover:bg-primary-700 text-white font-medium px-4 py-2 rounded-lg text-sm"
          onClick={handleSubmit}
          disabled={createIdeaMutation.isPending}
        >
          {createIdeaMutation.isPending ? "Saving..." : "Save Idea"}
        </button>
      </div>
    </div>
  );
};

export default NewIdeaForm;
