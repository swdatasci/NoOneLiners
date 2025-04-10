import { Question } from "./types";

// This file contains utility functions for AI-related features
// In a production app, these would likely call actual AI services

/**
 * Extract key concepts from text to generate contextual questions
 * This is a simplified version that would be replaced with actual NLP in production
 */
export function extractKeywords(text: string): string[] {
  // Remove common words and split text into words
  const words = text.toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(word => 
      word.length > 3 && 
      !['this', 'that', 'with', 'from', 'have', 'will', 'would', 'should', 'could', 'about'].includes(word)
    );
  
  // Count occurrences
  const wordCounts: Record<string, number> = {};
  words.forEach(word => {
    wordCounts[word] = (wordCounts[word] || 0) + 1;
  });
  
  // Sort by count and return top words
  return Object.entries(wordCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([word]) => word);
}

/**
 * Generate a set of follow-up questions based on the idea content
 * This would be replaced with a more sophisticated ML-based approach in production
 */
export function generateFollowUpQuestions(title: string, description: string, category: string | null): Question[] {
  const keywords = extractKeywords(description);
  const questionTemplates = [
    "Who is the target audience for this?",
    "What problem does this solve?",
    "What resources would be needed to implement this?",
    "What are potential challenges or obstacles?",
    "How would you measure success for this idea?",
    "What's the timeline for implementation?",
    "How is this different from existing solutions?",
    "What are the first steps to move this forward?",
  ];
  
  // Add category-specific questions
  if (category === "Product Idea") {
    questionTemplates.push(
      "What key features would differentiate this product?",
      "How would you price this product?",
      "What would the manufacturing or development process look like?"
    );
  } else if (category === "Business") {
    questionTemplates.push(
      "What's the revenue model for this business?",
      "Who are the key competitors?",
      "What initial investment would be needed?"
    );
  } else if (category === "Creative") {
    questionTemplates.push(
      "What inspired this creative idea?",
      "Who is the intended audience?",
      "What emotional response are you hoping to evoke?"
    );
  }
  
  // Personalize some questions with extracted keywords
  const personalizedQuestions = keywords.map((keyword, i) => 
    `How does "${keyword}" factor into your overall plan?`
  ).slice(0, 2); // Only use top 2 keywords
  
  // Combine and return as Question objects
  const allQuestions = [...questionTemplates.slice(0, 3), ...personalizedQuestions, ...questionTemplates.slice(3, 6)];
  
  return allQuestions.slice(0, 5).map((text, index) => ({
    id: index + 1000, // These are mock IDs that would be replaced when saving to DB
    text,
    categoryId: null,
    effectiveness: 3,
    isGeneric: true
  }));
}

/**
 * Analyze the effectiveness of questions based on answer length and content
 */
export function analyzeQuestionEffectiveness(question: string, answer: string): number {
  if (!answer) return 0;
  
  // Simple metrics for effectiveness:
  // 1. Answer length (longer answers usually mean the question was thought-provoking)
  // 2. Presence of specific details (numbers, proper nouns, etc.)
  // 3. Mention of aspects like challenges, next steps, or resources
  
  let score = 0;
  
  // Length score (0-2 points)
  if (answer.length > 100) score += 2;
  else if (answer.length > 50) score += 1;
  
  // Detail score (0-2 points)
  const hasNumbers = /\d+/.test(answer);
  const hasProperNouns = /[A-Z][a-z]+/.test(answer);
  if (hasNumbers) score += 1;
  if (hasProperNouns) score += 1;
  
  // Content relevance score (0-1 point)
  const relevanceKeywords = [
    'challenge', 'problem', 'solution', 'next', 'step', 'resource', 
    'cost', 'time', 'process', 'method', 'approach', 'strategy'
  ];
  
  const hasRelevanceTerms = relevanceKeywords.some(term => 
    answer.toLowerCase().includes(term)
  );
  
  if (hasRelevanceTerms) score += 1;
  
  // Scale to 0-5 range
  return Math.min(5, score);
}
