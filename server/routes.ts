import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import {
  insertUserSchema,
  insertCategorySchema,
  insertIdeaSchema,
  insertAnswerSchema,
  insertQuestionSchema,
  insertQuestionFeedbackSchema,
  insertSettingsSchema,
  insertIdeaVersionSchema,
  insertApiConfigSchema
} from "@shared/schema";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication and get the isAuthenticated middleware
  const { isAuthenticated } = setupAuth(app);
  
  const httpServer = createServer(app);

  // Helper function to validate request body
  function validateBody(schema: any, body: any) {
    const result = schema.safeParse(body);
    if (!result.success) {
      throw new Error(fromZodError(result.error).message);
    }
    return result.data;
  }

  // Auth routes are now handled by Passport in auth.ts

  // Additional user route to check if username exists (for registration form)
  app.get("/api/check-username/:username", async (req: Request, res: Response) => {
    try {
      const { username } = req.params;
      const user = await storage.getUserByUsername(username);
      return res.status(200).json({ exists: !!user });
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  });

  // Category routes
  app.get("/api/categories", async (req: Request, res: Response) => {
    try {
      const userId = req.query.userId ? Number(req.query.userId) : null;
      const categories = await storage.getCategories(userId);
      return res.status(200).json(categories);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  });
  
  app.post("/api/categories", async (req: Request, res: Response) => {
    try {
      const categoryData = validateBody(insertCategorySchema, req.body);
      const category = await storage.createCategory(categoryData);
      return res.status(201).json(category);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  });

  // Idea routes
  app.get("/api/ideas", async (req: Request, res: Response) => {
    try {
      if (!req.query.userId) {
        return res.status(400).json({ message: "User ID is required" });
      }
      
      const userId = Number(req.query.userId);
      const ideas = await storage.getIdeas(userId);
      return res.status(200).json(ideas);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  });
  
  app.get("/api/ideas/:id", async (req: Request, res: Response) => {
    try {
      const ideaId = Number(req.params.id);
      const idea = await storage.getIdeaById(ideaId);
      
      if (!idea) {
        return res.status(404).json({ message: "Idea not found" });
      }
      
      return res.status(200).json(idea);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  });
  
  app.post("/api/ideas", async (req: Request, res: Response) => {
    try {
      const ideaData = validateBody(insertIdeaSchema, req.body);
      const idea = await storage.createIdea(ideaData);
      
      // Create an initial version
      await storage.createIdeaVersion({
        ideaId: idea.id,
        title: idea.title,
        description: idea.description,
        answersSnapshot: []
      });
      
      return res.status(201).json(idea);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  });
  
  app.put("/api/ideas/:id", async (req: Request, res: Response) => {
    try {
      const ideaId = Number(req.params.id);
      const ideaData = req.body;
      
      const updatedIdea = await storage.updateIdea(ideaId, ideaData);
      
      // Create a new version with current answers
      const answers = await storage.getAnswersByIdeaId(ideaId);
      const answersSnapshot = [];
      
      for (const answer of answers) {
        const question = await storage.getQuestionById(answer.questionId);
        if (question) {
          answersSnapshot.push({
            questionId: answer.questionId,
            questionText: question.text,
            answerText: answer.text
          });
        }
      }
      
      await storage.createIdeaVersion({
        ideaId: updatedIdea.id,
        title: updatedIdea.title,
        description: updatedIdea.description,
        answersSnapshot
      });
      
      return res.status(200).json(updatedIdea);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  });
  
  app.delete("/api/ideas/:id", async (req: Request, res: Response) => {
    try {
      const ideaId = Number(req.params.id);
      await storage.deleteIdea(ideaId);
      return res.status(204).send();
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  });

  // Question routes
  app.get("/api/questions", async (req: Request, res: Response) => {
    try {
      let questions;
      
      if (req.query.categoryId) {
        const categoryId = Number(req.query.categoryId);
        questions = await storage.getQuestionsByCategory(categoryId);
      } else {
        questions = await storage.getQuestions();
      }
      
      return res.status(200).json(questions);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  });
  
  app.post("/api/questions", async (req: Request, res: Response) => {
    try {
      const questionData = validateBody(insertQuestionSchema, req.body);
      const question = await storage.createQuestion(questionData);
      return res.status(201).json(question);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  });

  // Answer routes
  app.get("/api/ideas/:ideaId/answers", async (req: Request, res: Response) => {
    try {
      const ideaId = Number(req.params.ideaId);
      const answers = await storage.getAnswersByIdeaId(ideaId);
      
      // Fetch the question text for each answer
      const answersWithQuestions = await Promise.all(
        answers.map(async (answer) => {
          const question = await storage.getQuestionById(answer.questionId);
          return {
            ...answer,
            questionText: question ? question.text : 'Unknown question'
          };
        })
      );
      
      return res.status(200).json(answersWithQuestions);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  });
  
  app.post("/api/answers", async (req: Request, res: Response) => {
    try {
      const answerData = validateBody(insertAnswerSchema, req.body);
      const answer = await storage.createAnswer(answerData);
      
      // Update the idea's updatedAt timestamp
      const idea = await storage.getIdeaById(answer.ideaId);
      if (idea) {
        await storage.updateIdea(idea.id, {});
      }
      
      return res.status(201).json(answer);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  });
  
  app.put("/api/answers/:id", async (req: Request, res: Response) => {
    try {
      const answerId = Number(req.params.id);
      const answerData = req.body;
      
      const updatedAnswer = await storage.updateAnswer(answerId, answerData);
      
      // Update the idea's updatedAt timestamp
      const idea = await storage.getIdeaById(updatedAnswer.ideaId);
      if (idea) {
        await storage.updateIdea(idea.id, {});
      }
      
      return res.status(200).json(updatedAnswer);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  });

  // Version history routes
  app.get("/api/ideas/:ideaId/versions", async (req: Request, res: Response) => {
    try {
      const ideaId = Number(req.params.ideaId);
      const versions = await storage.getVersionsByIdeaId(ideaId);
      return res.status(200).json(versions);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  });
  
  app.post("/api/versions", async (req: Request, res: Response) => {
    try {
      const versionData = validateBody(insertIdeaVersionSchema, req.body);
      const version = await storage.createIdeaVersion(versionData);
      return res.status(201).json(version);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  });

  // Question feedback routes
  app.post("/api/question-feedback", async (req: Request, res: Response) => {
    try {
      const feedbackData = validateBody(insertQuestionFeedbackSchema, req.body);
      const feedback = await storage.createQuestionFeedback(feedbackData);
      return res.status(201).json(feedback);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  });

  // Settings routes
  app.get("/api/settings/:userId", async (req: Request, res: Response) => {
    try {
      const userId = Number(req.params.userId);
      const settings = await storage.getSettings(userId);
      
      if (!settings) {
        return res.status(404).json({ message: "Settings not found" });
      }
      
      return res.status(200).json(settings);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  });
  
  app.put("/api/settings/:userId", async (req: Request, res: Response) => {
    try {
      const userId = Number(req.params.userId);
      const settingsData = req.body;
      
      const updatedSettings = await storage.updateSettings(userId, settingsData);
      return res.status(200).json(updatedSettings);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  });

  // Generate AI-based questions for an idea
  app.post("/api/ideas/:ideaId/generate-questions", async (req: Request, res: Response) => {
    try {
      const ideaId = Number(req.params.ideaId);
      const idea = await storage.getIdeaById(ideaId);
      
      if (!idea) {
        return res.status(404).json({ message: "Idea not found" });
      }
      
      // Get existing answers for this idea to avoid duplicating questions
      const existingAnswers = await storage.getAnswersByIdeaId(ideaId);
      const answeredQuestionIds = existingAnswers.map(a => a.questionId);
      
      // Get category-specific and generic questions
      let availableQuestions = await storage.getQuestionsByCategory(idea.categoryId || 0);
      
      // Filter out questions that have already been answered
      availableQuestions = availableQuestions.filter(q => !answeredQuestionIds.includes(q.id));
      
      // Sort by effectiveness (if self-learning is enabled)
      const userSettings = await storage.getSettings(idea.userId);
      if (userSettings && userSettings.enableSelfLearning) {
        availableQuestions.sort((a, b) => (b.effectiveness || 0) - (a.effectiveness || 0));
      }
      
      // Take up to 5 most relevant questions
      const selectedQuestions = availableQuestions.slice(0, 5);
      
      return res.status(200).json(selectedQuestions);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  });

  // Restore idea from a version
  app.post("/api/ideas/:ideaId/restore/:versionId", async (req: Request, res: Response) => {
    try {
      const ideaId = Number(req.params.ideaId);
      const versionId = Number(req.params.versionId);
      
      const idea = await storage.getIdeaById(ideaId);
      if (!idea) {
        return res.status(404).json({ message: "Idea not found" });
      }
      
      const versions = await storage.getVersionsByIdeaId(ideaId);
      const version = versions.find(v => v.id === versionId);
      
      if (!version) {
        return res.status(404).json({ message: "Version not found" });
      }
      
      // Update the idea with the version data
      const updatedIdea = await storage.updateIdea(ideaId, {
        title: version.title,
        description: version.description
      });
      
      // Clear existing answers and recreate from the snapshot
      const existingAnswers = await storage.getAnswersByIdeaId(ideaId);
      
      // In a real database, we would use transactions here
      if (version.answersSnapshot && version.answersSnapshot.length > 0) {
        for (const snapshot of version.answersSnapshot) {
          // Check if a question with this text exists
          const questions = await storage.getQuestions();
          let questionId = snapshot.questionId;
          
          // If we don't find the exact question ID, try to find by text
          const question = questions.find(q => q.id === questionId) || 
                          questions.find(q => q.text === snapshot.questionText);
          
          if (question) {
            questionId = question.id;
            
            // Check if we already have an answer for this question
            const existingAnswer = existingAnswers.find(a => a.questionId === questionId);
            
            if (existingAnswer) {
              // Update the existing answer
              await storage.updateAnswer(existingAnswer.id, {
                text: snapshot.answerText
              });
            } else {
              // Create a new answer
              await storage.createAnswer({
                ideaId,
                questionId,
                text: snapshot.answerText
              });
            }
          }
        }
      }
      
      // Create a new version to mark the restore point
      await storage.createIdeaVersion({
        ideaId,
        title: updatedIdea.title,
        description: updatedIdea.description,
        answersSnapshot: version.answersSnapshot
      });
      
      return res.status(200).json(updatedIdea);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  });

  // API Configuration routes
  app.get("/api/api-configs", async (req: Request, res: Response) => {
    try {
      const configs = await storage.getApiConfigs();
      // Strip API keys for security before sending to client
      const safeConfigs = configs.map(config => ({
        ...config,
        apiKey: "••••••••••••••••••••••••" // Mask API key
      }));
      return res.status(200).json(safeConfigs);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/api-configs/:provider", async (req: Request, res: Response) => {
    try {
      const provider = req.params.provider;
      const config = await storage.getApiConfigByProvider(provider);
      
      if (!config) {
        return res.status(404).json({ message: `No active configuration found for ${provider}` });
      }
      
      // Strip API key for security
      const safeConfig = {
        ...config,
        apiKey: "••••••••••••••••••••••••" // Mask API key
      };
      
      return res.status(200).json(safeConfig);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/api-configs", async (req: Request, res: Response) => {
    try {
      const configData = validateBody(insertApiConfigSchema, req.body);
      
      // Check if a config for this provider already exists
      const configs = await storage.getApiConfigs();
      const existingConfig = configs.find(c => c.provider === configData.provider);
      
      if (existingConfig) {
        // Update existing config
        const updatedConfig = await storage.updateApiConfig(existingConfig.id, {
          ...configData,
          isActive: true
        });
        
        // Return safe version without API key
        const safeConfig = {
          ...updatedConfig,
          apiKey: "••••••••••••••••••••••••" // Mask API key
        };
        
        return res.status(200).json(safeConfig);
      } else {
        // Create new config
        const newConfig = await storage.createApiConfig(configData);
        
        // Return safe version without API key
        const safeConfig = {
          ...newConfig,
          apiKey: "••••••••••••••••••••••••" // Mask API key
        };
        
        return res.status(201).json(safeConfig);
      }
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  });

  app.put("/api/api-configs/:id", async (req: Request, res: Response) => {
    try {
      const configId = Number(req.params.id);
      const configData = req.body;
      
      const updatedConfig = await storage.updateApiConfig(configId, configData);
      
      // Return safe version without API key
      const safeConfig = {
        ...updatedConfig,
        apiKey: "••••••••••••••••••••••••" // Mask API key
      };
      
      return res.status(200).json(safeConfig);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  });

  app.delete("/api/api-configs/:id", async (req: Request, res: Response) => {
    try {
      const configId = Number(req.params.id);
      await storage.deleteApiConfig(configId);
      return res.status(204).send();
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  });
  
  // Test route to verify API connectivity
  app.post("/api/test-ai-connection", async (req: Request, res: Response) => {
    try {
      const { provider } = req.body;
      
      if (!provider) {
        return res.status(400).json({ message: "Provider is required" });
      }
      
      const config = await storage.getApiConfigByProvider(provider);
      
      if (!config) {
        return res.status(404).json({ message: `No configuration found for ${provider}` });
      }
      
      // In a production app, we would actually test the connection here
      // For now, just return success if the config exists
      
      return res.status(200).json({ message: "Connection successful" });
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  });
  
  // Generic AI generation endpoint
  app.post("/api/ai/generate", async (req: Request, res: Response) => {
    try {
      const { provider, prompt, maxTokens = 1000, temperature = 0.7 } = req.body;
      
      if (!provider || !prompt) {
        return res.status(400).json({ message: "Provider and prompt are required" });
      }
      
      // Get API configuration for the specified provider
      const config = await storage.getApiConfigByProvider(provider);
      
      if (!config) {
        return res.status(404).json({ message: `No active configuration found for ${provider}` });
      }
      
      // This would be an actual call to the AI provider in production
      // For now, return a simulated response
      const simulatedResponse = {
        text: `This is a simulated response to prompt: "${prompt}". In production, this would be generated by ${provider}.`,
        provider,
        tokenUsage: {
          prompt: prompt.length / 4, // Rough token estimate
          completion: 50,
          total: (prompt.length / 4) + 50
        }
      };
      
      return res.status(200).json(simulatedResponse);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  });

  return httpServer;
}
