import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Settings } from "@/lib/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AiProviderSettings from "./AiProviderSettings";
import { ThemeSelector } from "./ThemeSelector";
import { useTheme } from "@/hooks/useTheme";

interface SettingsModalProps {
  userId: number;
  onClose: () => void;
}

const SettingsModal = ({ userId, onClose }: SettingsModalProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Animation effect
  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Get current settings
  const { data: settings, isLoading } = useQuery<Settings>({
    queryKey: [`/api/settings/${userId}`],
  });

  // Local state for settings
  const [localSettings, setLocalSettings] = useState<Partial<Settings>>({
    enableSelfLearning: true,
    storeQuestionEffectiveness: true,
    improveQuestionsBasedOnAnswers: true,
    theme: "light",
    language: "en",
    version: "1.0.0",
  });

  // Update local state when settings are loaded
  useEffect(() => {
    if (settings) {
      setLocalSettings(settings);
    }
  }, [settings]);

  // Update settings mutation
  const updateSettingsMutation = useMutation({
    mutationFn: async (updatedSettings: Partial<Settings>) => {
      const res = await apiRequest(
        "PUT",
        `/api/settings/${userId}`,
        updatedSettings
      );
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/settings/${userId}`] });
      toast({
        title: "Settings updated",
        description: "Your settings have been saved successfully",
      });
      handleClose();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update settings: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  const handleSave = () => {
    updateSettingsMutation.mutate(localSettings);
  };

  const handleBooleanChange = (field: keyof Settings) => {
    setLocalSettings((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const { theme, setTheme } = useTheme();
  
  // Update the theme when localSettings theme changes
  useEffect(() => {
    if (localSettings.theme && localSettings.theme !== theme) {
      setTheme(localSettings.theme as 'light' | 'dark' | 'system');
    }
  }, [localSettings.theme, setTheme, theme]);

  const handleSelectChange = (field: keyof Settings, value: string) => {
    setLocalSettings((prev) => ({
      ...prev,
      [field]: value,
    }));
    
    // Update theme immediately if that's the field being changed
    if (field === 'theme') {
      setTheme(value as 'light' | 'dark' | 'system');
    }
  };

  const handleReset = () => {
    // Show confirmation toast
    toast({
      title: "Confirm reset",
      description: "Are you sure you want to reset the system? This cannot be undone.",
      action: (
        <button
          className="bg-red-600 text-white px-3 py-1.5 rounded text-xs"
          onClick={() => {
            // Reset system
            updateSettingsMutation.mutate({
              enableSelfLearning: true,
              storeQuestionEffectiveness: true,
              improveQuestionsBasedOnAnswers: true,
              theme: "light",
              language: "en",
              version: "1.0.0",
            });
          }}
        >
          Yes, reset
        </button>
      ),
    });
  };

  return (
    <div
      className={`fixed inset-0 z-50 overflow-y-auto transition-opacity duration-300 ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
    >
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div
          className="fixed inset-0 transition-opacity"
          aria-hidden="true"
          onClick={handleClose}
        >
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>
        <span
          className="hidden sm:inline-block sm:align-middle sm:h-screen"
          aria-hidden="true"
        >
          &#8203;
        </span>
        <div
          className={`inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full transition-transform duration-300 ${
            isVisible ? "translate-y-0" : "translate-y-4"
          }`}
        >
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  Settings
                </h3>

                {isLoading ? (
                  <div className="py-6 flex justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                  </div>
                ) : (
                  <div className="mt-6 space-y-4">
                    <Tabs defaultValue="general" className="w-full">
                      <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="general">General</TabsTrigger>
                        <TabsTrigger value="ai-providers">AI Providers</TabsTrigger>
                        <TabsTrigger value="advanced">Advanced</TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="general" className="space-y-4 mt-4">
                        <h4 className="text-md font-medium text-gray-800">
                          System Configuration
                        </h4>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Theme
                            </label>
                            <div className="flex items-center space-x-4">
                              <ThemeSelector />
                              <div className="text-sm text-gray-500">
                                {theme === 'light' && 'Light mode'}
                                {theme === 'dark' && 'Dark mode'}
                                {theme === 'system' && 'System preference'}
                              </div>
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Language
                            </label>
                            <select
                              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                              value={localSettings.language}
                              onChange={(e) =>
                                handleSelectChange("language", e.target.value)
                              }
                            >
                              <option value="en">English</option>
                              <option value="es">Spanish</option>
                              <option value="fr">French</option>
                              <option value="de">German</option>
                            </select>
                          </div>
                        </div>

                        <h4 className="text-md font-medium text-gray-800 pt-4">
                          Self-Evolution Settings
                        </h4>

                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="self-learning" className="text-sm text-gray-700">Enable self-learning</Label>
                            <Switch
                              id="self-learning"
                              checked={!!localSettings.enableSelfLearning}
                              onCheckedChange={() =>
                                handleBooleanChange("enableSelfLearning")
                              }
                            />
                          </div>

                          <div className="flex items-center justify-between">
                            <Label htmlFor="store-effectiveness" className="text-sm text-gray-700">Store question effectiveness</Label>
                            <Switch
                              id="store-effectiveness"
                              checked={!!localSettings.storeQuestionEffectiveness}
                              onCheckedChange={() =>
                                handleBooleanChange("storeQuestionEffectiveness")
                              }
                            />
                          </div>

                          <div className="flex items-center justify-between">
                            <Label htmlFor="improve-questions" className="text-sm text-gray-700">Improve questions based on answers</Label>
                            <Switch
                              id="improve-questions"
                              checked={!!localSettings.improveQuestionsBasedOnAnswers}
                              onCheckedChange={() =>
                                handleBooleanChange("improveQuestionsBasedOnAnswers")
                              }
                            />
                          </div>
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="ai-providers" className="mt-4">
                        <AiProviderSettings 
                          userId={userId} 
                          onClose={() => {}} 
                        />
                      </TabsContent>
                      
                      <TabsContent value="advanced" className="space-y-4 mt-4">
                        <h4 className="text-md font-medium text-gray-800">
                          Version Control
                        </h4>

                        <div className="space-y-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Current Version
                            </label>
                            <div className="bg-gray-100 rounded-md px-3 py-2 text-sm text-gray-800">
                              {localSettings.version} (Updated recently)
                            </div>
                          </div>

                          <div className="pt-1">
                            <button
                              type="button"
                              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                            >
                              Rollback to Previous Version
                            </button>
                          </div>

                          <div className="pt-4">
                            <h4 className="text-md font-medium text-gray-800 mb-2">
                              System Reset
                            </h4>
                            <button
                              type="button"
                              className="inline-flex items-center px-4 py-2 border border-red-300 shadow-sm text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                              onClick={handleReset}
                            >
                              Reset System (Full Reset)
                            </button>
                          </div>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:ml-3 sm:w-auto sm:text-sm"
              onClick={handleSave}
              disabled={updateSettingsMutation.isPending}
            >
              {updateSettingsMutation.isPending ? "Saving..." : "Save Changes"}
            </button>
            <button
              type="button"
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              onClick={handleClose}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
