import { useState } from "react";
import { Question, Answer } from "@/lib/types";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface QuestionItemProps {
  question: Question;
  answer?: Answer;
  onSave: (text: string) => void;
}

const QuestionItem = ({ question, answer, onSave }: QuestionItemProps) => {
  const [answerText, setAnswerText] = useState(answer?.text || "");
  const [isEditing, setIsEditing] = useState(!answer?.text);
  const { toast } = useToast();

  const feedbackMutation = useMutation({
    mutationFn: async (helpful: boolean) => {
      const res = await apiRequest("POST", "/api/question-feedback", {
        questionId: question.id,
        userId: 1, // TODO: Get from auth context
        helpful,
      });
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Feedback recorded",
        description: "Thank you for your feedback!",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to submit feedback: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    if (!answerText.trim()) return;
    onSave(answerText);
    setIsEditing(false);
  };

  const handleFeedback = (helpful: boolean) => {
    feedbackMutation.mutate(helpful);
  };

  return (
    <div className="bg-gray-50 p-3 rounded-lg">
      <div className="flex justify-between items-start mb-1">
        <p className="text-sm font-medium text-gray-700">{question.text}</p>
        {!isEditing && answer && (
          <div className="flex space-x-1">
            <button
              className="text-xs text-gray-500 hover:text-gray-700"
              onClick={() => handleFeedback(true)}
              title="Helpful question"
            >
              👍
            </button>
            <button
              className="text-xs text-gray-500 hover:text-gray-700"
              onClick={() => handleFeedback(false)}
              title="Unhelpful question"
            >
              👎
            </button>
          </div>
        )}
      </div>
      <div className="flex items-start">
        {isEditing ? (
          <div className="w-full">
            <textarea
              className="text-sm flex-1 border border-gray-300 rounded px-3 py-2 w-full"
              rows={2}
              placeholder="Answer this question..."
              value={answerText}
              onChange={(e) => setAnswerText(e.target.value)}
            />
            <div className="flex justify-end mt-2">
              <button
                className="bg-primary-600 hover:bg-primary-700 text-white text-xs font-medium px-3 py-1 rounded"
                onClick={handleSave}
              >
                Save
              </button>
            </div>
          </div>
        ) : (
          <div className="w-full">
            <p className="text-sm text-gray-600">
              {answer?.text || "No answer yet"}
            </p>
            <div className="flex justify-end mt-1">
              <button
                className="text-xs text-primary-600 hover:text-primary-800"
                onClick={() => setIsEditing(true)}
              >
                Edit
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuestionItem;
