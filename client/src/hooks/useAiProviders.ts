import { useMutation, useQuery } from "@tanstack/react-query";
import { ApiConfig } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";

export type ProviderType = "openai" | "gemini" | "mistral" | "anthropic";

export interface ApiConfigSubmission {
  provider: ProviderType;
  apiKey: string;
  isActive?: boolean;
}

export function useAiProviders() {
  // Get all API configurations
  const {
    data: apiConfigs,
    isLoading,
    error
  } = useQuery<ApiConfig[]>({
    queryKey: ["/api/api-configs"],
  });
  
  // Create or update API configuration
  const updateConfigMutation = useMutation({
    mutationFn: async (configData: ApiConfigSubmission) => {
      const res = await apiRequest("POST", "/api/api-configs", configData);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/api-configs"] });
    }
  });
  
  // Delete API configuration
  const deleteConfigMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/api-configs/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/api-configs"] });
    }
  });
  
  // Test connection to API provider
  const testConnectionMutation = useMutation({
    mutationFn: async (provider: ProviderType) => {
      const res = await apiRequest("POST", "/api/test-ai-connection", { provider });
      return res.json();
    }
  });
  
  // Get active providers
  const activeProviders = apiConfigs?.filter(config => config.isActive) || [];
  
  // Check if a specific provider is configured
  const isProviderConfigured = (provider: ProviderType) => {
    return activeProviders.some(config => config.provider === provider);
  };
  
  return {
    apiConfigs,
    activeProviders,
    isLoading,
    error,
    updateConfigMutation,
    deleteConfigMutation,
    testConnectionMutation,
    isProviderConfigured
  };
}