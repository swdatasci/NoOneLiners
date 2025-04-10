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
}

export const storage = new MemStorage();
