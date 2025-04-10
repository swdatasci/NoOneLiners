// Types based on the schema.ts file

export interface User {
  id: number;
  username: string;
  password: string;
}

export interface Category {
  id: number;
  name: string;
  userId: number | null;
}

export interface Idea {
  id: number;
  title: string;
  description: string;
  categoryId: number | null;
  userId: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  mediaUrls: string[];
}

export interface Question {
  id: number;
  text: string;
  categoryId: number | null;
  effectiveness: number;
  isGeneric: boolean;
}

export interface Answer {
  id: number;
  ideaId: number;
  questionId: number;
  text: string;
  createdAt: string;
  questionText?: string; // Added from API response
}

export interface IdeaVersion {
  id: number;
  ideaId: number;
  title: string;
  description: string;
  answersSnapshot: AnswerSnapshot[];
  createdAt: string;
}

export interface QuestionFeedback {
  id: number;
  questionId: number;
  userId: number;
  helpful: boolean;
  createdAt: string;
}

export interface Settings {
  id: number;
  userId: number;
  enableSelfLearning: boolean;
  storeQuestionEffectiveness: boolean;
  improveQuestionsBasedOnAnswers: boolean;
  theme: string;
  language: string;
  version: string;
}

export interface AnswerSnapshot {
  questionId: number;
  questionText: string;
  answerText: string;
}

// Form submission types
export interface IdeaFormSubmission {
  title: string;
  description: string;
  categoryId: number | null;
  userId: number;
  mediaUrls: string[];
}

export interface AnswerFormSubmission {
  ideaId: number;
  questionId: number;
  text: string;
}

export interface QuestionGenerationRequest {
  ideaId: number;
}

export interface CategoryFormSubmission {
  name: string;
  userId: number;
}

export interface SettingsUpdateSubmission {
  enableSelfLearning?: boolean;
  storeQuestionEffectiveness?: boolean;
  improveQuestionsBasedOnAnswers?: boolean;
  theme?: string;
  language?: string;
}
