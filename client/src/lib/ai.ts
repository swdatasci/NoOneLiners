import { apiRequest } from "./queryClient";
import { ProviderType } from "@/hooks/useAiProviders";

export interface AiRequestOptions {
  provider: ProviderType;
  prompt: string;
  maxTokens?: number;
  temperature?: number;
}

export interface AiResponse {
  text: string;
  provider: ProviderType;
  tokenUsage?: {
    prompt: number;
    completion: number;
    total: number;
  };
}

/**
 * Handles requests to various AI providers through our backend API
 * 
 * @param options Configuration options for the AI request
 * @returns The AI response with the generated text
 */
export async function generateAiResponse(options: AiRequestOptions): Promise<AiResponse> {
  try {
    const response = await apiRequest("POST", "/api/ai/generate", options);
    return await response.json();
  } catch (error: any) {
    console.error("AI generation error:", error);
    
    if (error.message.includes("configuration")) {
      throw new Error(`No valid API configuration found for ${options.provider}. Please add your API key in settings.`);
    } else if (error.message.includes("quota") || error.message.includes("limit")) {
      throw new Error(`API quota exceeded for ${options.provider}. Please try again later or use a different AI provider.`);
    } else {
      throw new Error(`Failed to generate response: ${error.message}`);
    }
  }
}

/**
 * Generates questions for an idea based on its title and description
 * 
 * @param ideaId The ID of the idea
 * @param provider The AI provider to use
 * @returns Array of questions
 */
export async function generateQuestionsForIdea(ideaId: number, provider: ProviderType = "openai"): Promise<string[]> {
  try {
    const response = await apiRequest(
      "POST", 
      `/api/ideas/${ideaId}/generate-questions`,
      { provider }
    );
    
    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error("Question generation error:", error);
    throw new Error(`Failed to generate questions: ${error.message}`);
  }
}

/**
 * Test the connection to an AI provider using the stored API key
 * 
 * @param provider The AI provider to test
 * @returns Success or error message
 */
export async function testAiProviderConnection(provider: ProviderType): Promise<{ success: boolean; message: string }> {
  try {
    const response = await apiRequest(
      "POST",
      "/api/test-ai-connection",
      { provider }
    );
    
    const data = await response.json();
    return { 
      success: true, 
      message: data.message || "Connection successful"
    };
  } catch (error: any) {
    console.error("AI connection test error:", error);
    return {
      success: false,
      message: error.message || "Connection failed"
    };
  }
}