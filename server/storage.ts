import {
  User,
  InsertUser,
  Category,
  InsertCategory,
  Idea,
  InsertIdea,
  Question,
  InsertQuestion,
  Answer,
  InsertAnswer,
  IdeaVersion,
  InsertIdeaVersion,
  QuestionFeedback,
  InsertQuestionFeedback,
  Settings,
  InsertSettings,
  ApiConfig,
  InsertApiConfig,
  AnswerSnapshot
} from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Category operations
  getCategories(userId: number): Promise<Category[]>;
  getCategoryById(id: number): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  
  // Idea operations
  getIdeas(userId: number): Promise<Idea[]>;
  getIdeaById(id: number): Promise<Idea | undefined>;
  createIdea(idea: InsertIdea): Promise<Idea>;
  updateIdea(id: number, idea: Partial<InsertIdea>): Promise<Idea>;
  deleteIdea(id: number): Promise<boolean>;
  getIdeasByCategory(categoryId: number): Promise<Idea[]>;
  
  // Question operations
  getQuestions(): Promise<Question[]>;
  getQuestionById(id: number): Promise<Question | undefined>;
  getQuestionsByCategory(categoryId: number): Promise<Question[]>;
  createQuestion(question: InsertQuestion): Promise<Question>;
  updateQuestionEffectiveness(id: number, effectiveness: number): Promise<Question>;
  
  // Answer operations
  getAnswersByIdeaId(ideaId: number): Promise<Answer[]>;
  createAnswer(answer: InsertAnswer): Promise<Answer>;
  updateAnswer(id: number, answer: Partial<InsertAnswer>): Promise<Answer>;
  
  // Version operations
  getVersionsByIdeaId(ideaId: number): Promise<IdeaVersion[]>;
  createIdeaVersion(version: InsertIdeaVersion): Promise<IdeaVersion>;
  
  // Feedback operations
  createQuestionFeedback(feedback: InsertQuestionFeedback): Promise<QuestionFeedback>;
  
  // Settings operations
  getSettings(userId: number): Promise<Settings | undefined>;
  createSettings(settings: InsertSettings): Promise<Settings>;
  updateSettings(userId: number, settings: Partial<InsertSettings>): Promise<Settings>;
  
  // API Configuration operations
  getApiConfigs(): Promise<ApiConfig[]>;
  getApiConfigByProvider(provider: string): Promise<ApiConfig | undefined>;
  createApiConfig(config: InsertApiConfig): Promise<ApiConfig>;
  updateApiConfig(id: number, config: Partial<InsertApiConfig>): Promise<ApiConfig>;
  deleteApiConfig(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private categories: Map<number, Category>;
  private ideas: Map<number, Idea>;
  private questions: Map<number, Question>;
  private answers: Map<number, Answer>;
  private ideaVersions: Map<number, IdeaVersion>;
  private questionFeedback: Map<number, QuestionFeedback>;
  private settings: Map<number, Settings>;
  
  private currentUserId: number;
  private currentCategoryId: number;
  private currentIdeaId: number;
  private currentQuestionId: number;
  private currentAnswerId: number;
  private currentVersionId: number;
  private currentFeedbackId: number;
  private currentSettingsId: number;
  
  constructor() {
    this.users = new Map();
    this.categories = new Map();
    this.ideas = new Map();
    this.questions = new Map();
    this.answers = new Map();
    this.ideaVersions = new Map();
    this.questionFeedback = new Map();
    this.settings = new Map();
    
    this.currentUserId = 1;
    this.currentCategoryId = 1;
    this.currentIdeaId = 1;
    this.currentQuestionId = 1;
    this.currentAnswerId = 1;
    this.currentVersionId = 1;
    this.currentFeedbackId = 1;
    this.currentSettingsId = 1;
    
    // No pre-initialized data for beta launch
  }
  
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }
  
  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // Category methods
  async getCategories(userId: number | null = null): Promise<Category[]> {
    const categories = Array.from(this.categories.values());
    if (userId === null) {
      return categories.filter(c => c.userId === null);
    }
    return categories.filter(c => c.userId === userId || c.userId === null);
  }
  
  async getCategoryById(id: number): Promise<Category | undefined> {
    return this.categories.get(id);
  }
  
  async createCategory(category: InsertCategory): Promise<Category> {
    const id = this.currentCategoryId++;
    const newCategory: Category = { ...category, id };
    this.categories.set(id, newCategory);
    return newCategory;
  }
  
  // Idea methods
  async getIdeas(userId: number): Promise<Idea[]> {
    return Array.from(this.ideas.values()).filter(idea => idea.userId === userId);
  }
  
  async getIdeaById(id: number): Promise<Idea | undefined> {
    return this.ideas.get(id);
  }
  
  async createIdea(idea: InsertIdea): Promise<Idea> {
    const id = this.currentIdeaId++;
    const now = new Date();
    const newIdea: Idea = {
      ...idea,
      id,
      createdAt: now,
      updatedAt: now,
      mediaUrls: idea.mediaUrls || []
    };
    this.ideas.set(id, newIdea);
    return newIdea;
  }
  
  async updateIdea(id: number, ideaUpdate: Partial<InsertIdea>): Promise<Idea> {
    const idea = this.ideas.get(id);
    if (!idea) {
      throw new Error(`Idea with id ${id} not found`);
    }
    
    const updatedIdea: Idea = {
      ...idea,
      ...ideaUpdate,
      updatedAt: new Date()
    };
    
    this.ideas.set(id, updatedIdea);
    return updatedIdea;
  }
  
  async deleteIdea(id: number): Promise<boolean> {
    return this.ideas.delete(id);
  }
  
  async getIdeasByCategory(categoryId: number): Promise<Idea[]> {
    return Array.from(this.ideas.values()).filter(idea => idea.categoryId === categoryId);
  }
  
  // Question methods
  async getQuestions(): Promise<Question[]> {
    return Array.from(this.questions.values());
  }
  
  async getQuestionById(id: number): Promise<Question | undefined> {
    return this.questions.get(id);
  }
  
  async getQuestionsByCategory(categoryId: number): Promise<Question[]> {
    return Array.from(this.questions.values())
      .filter(q => q.categoryId === categoryId || q.isGeneric);
  }
  
  async createQuestion(question: InsertQuestion): Promise<Question> {
    const id = this.currentQuestionId++;
    const newQuestion: Question = { ...question, id };
    this.questions.set(id, newQuestion);
    return newQuestion;
  }
  
  async updateQuestionEffectiveness(id: number, effectiveness: number): Promise<Question> {
    const question = this.questions.get(id);
    if (!question) {
      throw new Error(`Question with id ${id} not found`);
    }
    
    const updatedQuestion: Question = {
      ...question,
      effectiveness
    };
    
    this.questions.set(id, updatedQuestion);
    return updatedQuestion;
  }
  
  // Answer methods
  async getAnswersByIdeaId(ideaId: number): Promise<Answer[]> {
    return Array.from(this.answers.values()).filter(answer => answer.ideaId === ideaId);
  }
  
  async createAnswer(answer: InsertAnswer): Promise<Answer> {
    const id = this.currentAnswerId++;
    const newAnswer: Answer = {
      ...answer,
      id,
      createdAt: new Date()
    };
    this.answers.set(id, newAnswer);
    return newAnswer;
  }
  
  async updateAnswer(id: number, answerUpdate: Partial<InsertAnswer>): Promise<Answer> {
    const answer = this.answers.get(id);
    if (!answer) {
      throw new Error(`Answer with id ${id} not found`);
    }
    
    const updatedAnswer: Answer = {
      ...answer,
      ...answerUpdate
    };
    
    this.answers.set(id, updatedAnswer);
    return updatedAnswer;
  }
  
  // Version methods
  async getVersionsByIdeaId(ideaId: number): Promise<IdeaVersion[]> {
    return Array.from(this.ideaVersions.values())
      .filter(version => version.ideaId === ideaId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
  
  async createIdeaVersion(version: InsertIdeaVersion): Promise<IdeaVersion> {
    const id = this.currentVersionId++;
    const newVersion: IdeaVersion = {
      ...version,
      id,
      createdAt: new Date()
    };
    this.ideaVersions.set(id, newVersion);
    return newVersion;
  }
  
  // Feedback methods
  async createQuestionFeedback(feedback: InsertQuestionFeedback): Promise<QuestionFeedback> {
    const id = this.currentFeedbackId++;
    const newFeedback: QuestionFeedback = {
      ...feedback,
      id,
      createdAt: new Date()
    };
    this.questionFeedback.set(id, newFeedback);
    
    // Update question effectiveness based on feedback
    const question = await this.getQuestionById(feedback.questionId);
    if (question) {
      const allFeedback = Array.from(this.questionFeedback.values())
        .filter(fb => fb.questionId === feedback.questionId);
      
      const positiveCount = allFeedback.filter(fb => fb.helpful).length;
      const totalCount = allFeedback.length;
      
      const newEffectiveness = Math.round((positiveCount / totalCount) * 5);
      await this.updateQuestionEffectiveness(question.id, newEffectiveness);
    }
    
    return newFeedback;
  }
  
  // Settings methods
  async getSettings(userId: number): Promise<Settings | undefined> {
    return Array.from(this.settings.values()).find(setting => setting.userId === userId);
  }
  
  async createSettings(settingsData: InsertSettings): Promise<Settings> {
    const id = this.currentSettingsId++;
    const newSettings: Settings = {
      ...settingsData,
      id
    };
    this.settings.set(id, newSettings);
    return newSettings;
  }
  
  async updateSettings(userId: number, settingsUpdate: Partial<InsertSettings>): Promise<Settings> {
    const existingSettings = Array.from(this.settings.values()).find(s => s.userId === userId);
    
    if (!existingSettings) {
      throw new Error(`Settings for user ${userId} not found`);
    }
    
    const updatedSettings: Settings = {
      ...existingSettings,
      ...settingsUpdate
    };
    
    this.settings.set(existingSettings.id, updatedSettings);
    return updatedSettings;
  }

  // API Configuration methods
  private apiConfigs: Map<number, ApiConfig> = new Map();
  private currentApiConfigId: number = 1;

  async getApiConfigs(): Promise<ApiConfig[]> {
    return Array.from(this.apiConfigs.values());
  }

  async getApiConfigByProvider(provider: string): Promise<ApiConfig | undefined> {
    return Array.from(this.apiConfigs.values()).find(
      config => config.provider === provider && config.isActive
    );
  }

  async createApiConfig(config: InsertApiConfig): Promise<ApiConfig> {
    const id = this.currentApiConfigId++;
    const now = new Date();
    const newConfig: ApiConfig = {
      ...config,
      id,
      createdAt: now,
      updatedAt: now
    };
    this.apiConfigs.set(id, newConfig);
    return newConfig;
  }

  async updateApiConfig(id: number, configUpdate: Partial<InsertApiConfig>): Promise<ApiConfig> {
    const config = this.apiConfigs.get(id);
    if (!config) {
      throw new Error(`API Config with id ${id} not found`);
    }
    
    const updatedConfig: ApiConfig = {
      ...config,
      ...configUpdate,
      updatedAt: new Date()
    };
    
    this.apiConfigs.set(id, updatedConfig);
    return updatedConfig;
  }

  async deleteApiConfig(id: number): Promise<boolean> {
    return this.apiConfigs.delete(id);
  }
}

// Database Storage Implementation
import { db } from "./db";
import { eq, and, desc } from "drizzle-orm";
import connectPg from "connect-pg-simple";
import session from "express-session";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

export class DatabaseStorage implements IStorage {
  sessionStore: session.SessionStore;

  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool,
      createTableIfMissing: true
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  // Category methods
  async getCategories(userId: number): Promise<Category[]> {
    return await db.select().from(categories).where(
      userId ? eq(categories.userId, userId) : eq(categories.userId, null)
    );
  }

  async getCategoryById(id: number): Promise<Category | undefined> {
    const [category] = await db.select().from(categories).where(eq(categories.id, id));
    return category;
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const [newCategory] = await db.insert(categories).values(category).returning();
    return newCategory;
  }

  // Idea methods
  async getIdeas(userId: number): Promise<Idea[]> {
    return await db.select().from(ideas).where(eq(ideas.userId, userId));
  }

  async getIdeaById(id: number): Promise<Idea | undefined> {
    const [idea] = await db.select().from(ideas).where(eq(ideas.id, id));
    return idea;
  }

  async createIdea(idea: InsertIdea): Promise<Idea> {
    const [newIdea] = await db.insert(ideas).values(idea).returning();
    return newIdea;
  }

  async updateIdea(id: number, ideaUpdate: Partial<InsertIdea>): Promise<Idea> {
    const [updatedIdea] = await db
      .update(ideas)
      .set({ ...ideaUpdate, updatedAt: new Date() })
      .where(eq(ideas.id, id))
      .returning();
    return updatedIdea;
  }

  async deleteIdea(id: number): Promise<boolean> {
    await db.delete(ideas).where(eq(ideas.id, id));
    return true;
  }

  async getIdeasByCategory(categoryId: number): Promise<Idea[]> {
    return await db.select().from(ideas).where(eq(ideas.categoryId, categoryId));
  }

  // Question methods
  async getQuestions(): Promise<Question[]> {
    return await db.select().from(questions);
  }

  async getQuestionById(id: number): Promise<Question | undefined> {
    const [question] = await db.select().from(questions).where(eq(questions.id, id));
    return question;
  }

  async getQuestionsByCategory(categoryId: number): Promise<Question[]> {
    return await db
      .select()
      .from(questions)
      .where(
        // Return questions for the category or generic questions
        categoryId
          ? eq(questions.categoryId, categoryId) || eq(questions.isGeneric, true)
          : eq(questions.isGeneric, true)
      );
  }

  async createQuestion(question: InsertQuestion): Promise<Question> {
    const [newQuestion] = await db.insert(questions).values(question).returning();
    return newQuestion;
  }

  async updateQuestionEffectiveness(id: number, effectiveness: number): Promise<Question> {
    const [updatedQuestion] = await db
      .update(questions)
      .set({ effectiveness })
      .where(eq(questions.id, id))
      .returning();
    return updatedQuestion;
  }

  // Answer methods
  async getAnswersByIdeaId(ideaId: number): Promise<Answer[]> {
    return await db.select().from(answers).where(eq(answers.ideaId, ideaId));
  }

  async createAnswer(answer: InsertAnswer): Promise<Answer> {
    const [newAnswer] = await db.insert(answers).values(answer).returning();
    return newAnswer;
  }

  async updateAnswer(id: number, answerUpdate: Partial<InsertAnswer>): Promise<Answer> {
    const [updatedAnswer] = await db
      .update(answers)
      .set(answerUpdate)
      .where(eq(answers.id, id))
      .returning();
    return updatedAnswer;
  }

  // Version methods
  async getVersionsByIdeaId(ideaId: number): Promise<IdeaVersion[]> {
    return await db
      .select()
      .from(ideaVersions)
      .where(eq(ideaVersions.ideaId, ideaId))
      .orderBy(desc(ideaVersions.createdAt));
  }

  async createIdeaVersion(version: InsertIdeaVersion): Promise<IdeaVersion> {
    const [newVersion] = await db
      .insert(ideaVersions)
      .values(version)
      .returning();
    return newVersion;
  }

  // Feedback methods
  async createQuestionFeedback(feedback: InsertQuestionFeedback): Promise<QuestionFeedback> {
    const [newFeedback] = await db
      .insert(questionFeedback)
      .values(feedback)
      .returning();
    
    // Calculate new effectiveness based on all feedback
    const allFeedback = await db
      .select()
      .from(questionFeedback)
      .where(eq(questionFeedback.questionId, feedback.questionId));
    
    const positiveCount = allFeedback.filter(fb => fb.helpful).length;
    const totalCount = allFeedback.length;
    
    if (totalCount > 0) {
      const newEffectiveness = Math.round((positiveCount / totalCount) * 5);
      await this.updateQuestionEffectiveness(feedback.questionId, newEffectiveness);
    }
    
    return newFeedback;
  }

  // Settings methods
  async getSettings(userId: number): Promise<Settings | undefined> {
    const [setting] = await db
      .select()
      .from(settings)
      .where(eq(settings.userId, userId));
    return setting;
  }

  async createSettings(settingsData: InsertSettings): Promise<Settings> {
    const [newSettings] = await db
      .insert(settings)
      .values(settingsData)
      .returning();
    return newSettings;
  }

  async updateSettings(userId: number, settingsUpdate: Partial<InsertSettings>): Promise<Settings> {
    const [updatedSettings] = await db
      .update(settings)
      .set(settingsUpdate)
      .where(eq(settings.userId, userId))
      .returning();
    return updatedSettings;
  }

  // API Configuration methods
  async getApiConfigs(): Promise<ApiConfig[]> {
    return await db.select().from(apiConfigs);
  }

  async getApiConfigByProvider(provider: string): Promise<ApiConfig | undefined> {
    const [config] = await db
      .select()
      .from(apiConfigs)
      .where(
        and(
          eq(apiConfigs.provider, provider),
          eq(apiConfigs.isActive, true)
        )
      );
    return config;
  }

  async createApiConfig(config: InsertApiConfig): Promise<ApiConfig> {
    const [newConfig] = await db
      .insert(apiConfigs)
      .values(config)
      .returning();
    return newConfig;
  }

  async updateApiConfig(id: number, configUpdate: Partial<InsertApiConfig>): Promise<ApiConfig> {
    const [updatedConfig] = await db
      .update(apiConfigs)
      .set({ ...configUpdate, updatedAt: new Date() })
      .where(eq(apiConfigs.id, id))
      .returning();
    return updatedConfig;
  }

  async deleteApiConfig(id: number): Promise<boolean> {
    await db.delete(apiConfigs).where(eq(apiConfigs.id, id));
    return true;
  }
}

// Use Database Storage for production
export const storage = process.env.NODE_ENV === "production" 
  ? new DatabaseStorage() 
  : new MemStorage();
