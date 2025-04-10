import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").default(""),
});

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  userId: integer("user_id").references(() => users.id),
});

export const ideas = pgTable("ideas", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  categoryId: integer("category_id").references(() => categories.id),
  userId: integer("user_id").references(() => users.id),
  status: text("status").notNull().default("in_progress"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  mediaUrls: jsonb("media_urls").$type<string[]>().default([]),
});

export const questions = pgTable("questions", {
  id: serial("id").primaryKey(),
  text: text("text").notNull(),
  categoryId: integer("category_id").references(() => categories.id),
  effectiveness: integer("effectiveness").default(0),
  isGeneric: boolean("is_generic").default(true),
});

export const answers = pgTable("answers", {
  id: serial("id").primaryKey(),
  ideaId: integer("idea_id").references(() => ideas.id),
  questionId: integer("question_id").references(() => questions.id),
  text: text("text").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const ideaVersions = pgTable("idea_versions", {
  id: serial("id").primaryKey(),
  ideaId: integer("idea_id").references(() => ideas.id),
  title: text("title").notNull(),
  description: text("description").notNull(),
  answersSnapshot: jsonb("answers_snapshot").$type<AnswerSnapshot[]>(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const questionFeedback = pgTable("question_feedback", {
  id: serial("id").primaryKey(),
  questionId: integer("question_id").references(() => questions.id),
  userId: integer("user_id").references(() => users.id),
  helpful: boolean("helpful").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const apiConfigs = pgTable("api_configs", {
  id: serial("id").primaryKey(),
  provider: text("provider").notNull(), // 'openai', 'gemini', 'mistral', 'anthropic'
  apiKey: text("api_key").notNull(), 
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).unique(),
  enableSelfLearning: boolean("enable_self_learning").default(true),
  storeQuestionEffectiveness: boolean("store_question_effectiveness").default(true),
  improveQuestionsBasedOnAnswers: boolean("improve_questions_based_on_answers").default(true),
  theme: text("theme").default("light"),
  language: text("language").default("en"),
  version: text("version").default("1.0.0"),
  // AI provider settings
  preferredProvider: text("preferred_provider").default("openai"),
  openaiModel: text("openai_model").default("gpt-4o"),
  geminiModel: text("gemini_model").default("gemini-pro"),
  mistralModel: text("mistral_model").default("mistral-large"),
  anthropicModel: text("anthropic_model").default("claude-3-opus"),
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export type Category = typeof categories.$inferSelect;
export type InsertCategory = typeof categories.$inferInsert;

export type Idea = typeof ideas.$inferSelect;
export type InsertIdea = typeof ideas.$inferInsert;

export type Question = typeof questions.$inferSelect;
export type InsertQuestion = typeof questions.$inferInsert;

export type Answer = typeof answers.$inferSelect;
export type InsertAnswer = typeof answers.$inferInsert;

export type IdeaVersion = typeof ideaVersions.$inferSelect;
export type InsertIdeaVersion = typeof ideaVersions.$inferInsert;

export type QuestionFeedback = typeof questionFeedback.$inferSelect;
export type InsertQuestionFeedback = typeof questionFeedback.$inferInsert;

export type ApiConfig = typeof apiConfigs.$inferSelect;
export type InsertApiConfig = typeof apiConfigs.$inferInsert;

export type Settings = typeof settings.$inferSelect;
export type InsertSettings = typeof settings.$inferInsert;

export type AnswerSnapshot = {
  questionId: number;
  questionText: string;
  answerText: string;
};

// Zod schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertCategorySchema = createInsertSchema(categories).pick({
  name: true,
  userId: true,
});

export const insertIdeaSchema = createInsertSchema(ideas).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertQuestionSchema = createInsertSchema(questions).omit({
  id: true,
});

export const insertAnswerSchema = createInsertSchema(answers).omit({
  id: true,
  createdAt: true,
});

export const insertIdeaVersionSchema = createInsertSchema(ideaVersions).omit({
  id: true,
  createdAt: true,
});

export const insertQuestionFeedbackSchema = createInsertSchema(questionFeedback).omit({
  id: true,
  createdAt: true,
});

export const insertSettingsSchema = createInsertSchema(settings).omit({
  id: true,
});

export const insertApiConfigSchema = createInsertSchema(apiConfigs).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
