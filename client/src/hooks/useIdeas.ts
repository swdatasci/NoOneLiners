import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Idea } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

export function useIdeas(userId: number) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch all ideas for a user
  const { 
    data: ideas, 
    isLoading,
    isError,
    error,
    refetch 
  } = useQuery<Idea[]>({
    queryKey: [`/api/ideas?userId=${userId}`],
  });

  // Create a new idea
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
      queryClient.invalidateQueries({ queryKey: [`/api/ideas?userId=${userId}`] });
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

  // Update an existing idea
  const updateIdeaMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<Idea> }) => {
      const res = await apiRequest("PUT", `/api/ideas/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/ideas?userId=${userId}`] });
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

  // Delete an idea
  const deleteIdeaMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/ideas/${id}`, undefined);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/ideas?userId=${userId}`] });
      toast({
        title: "Success",
        description: "Idea deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete idea: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Generate questions for an idea
  const generateQuestionsMutation = useMutation({
    mutationFn: async (ideaId: number) => {
      const res = await apiRequest("POST", `/api/ideas/${ideaId}/generate-questions`, {});
      return res.json();
    },
    onSuccess: (data, ideaId) => {
      queryClient.invalidateQueries({ queryKey: [`/api/ideas/${ideaId}/generate-questions`] });
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

  // Get ideas by category
  const getIdeasByCategory = (categoryId: number | null) => {
    if (!ideas) return [];
    if (categoryId === null) return ideas;
    return ideas.filter(idea => idea.categoryId === categoryId);
  };

  // Get completed/saved ideas
  const getSavedIdeas = () => {
    if (!ideas) return [];
    return ideas.filter(idea => idea.status === 'completed');
  };

  // Get in-progress ideas
  const getInProgressIdeas = () => {
    if (!ideas) return [];
    return ideas.filter(idea => idea.status === 'in_progress');
  };

  return {
    ideas,
    isLoading,
    isError,
    error,
    refetch,
    createIdea: createIdeaMutation.mutate,
    updateIdea: updateIdeaMutation.mutate,
    deleteIdea: deleteIdeaMutation.mutate,
    generateQuestions: generateQuestionsMutation.mutate,
    getIdeasByCategory,
    getSavedIdeas,
    getInProgressIdeas,
    isDeletingIdea: deleteIdeaMutation.isPending,
    isCreatingIdea: createIdeaMutation.isPending,
    isUpdatingIdea: updateIdeaMutation.isPending,
    isGeneratingQuestions: generateQuestionsMutation.isPending,
  };
}
