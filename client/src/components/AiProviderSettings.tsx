import React, { useState } from "react";
import { useAiProviders, ProviderType } from "@/hooks/useAiProviders";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";

interface AiProviderSettingsProps {
  userId: number;
  onClose?: () => void;
}

export default function AiProviderSettings({ userId, onClose }: AiProviderSettingsProps) {
  const { toast } = useToast();
  const {
    apiConfigs,
    isLoading,
    error,
    updateConfigMutation,
    deleteConfigMutation,
    testConnectionMutation,
    isProviderConfigured
  } = useAiProviders();

  const [activeTab, setActiveTab] = useState<ProviderType>("openai");
  const [apiKey, setApiKey] = useState<string>("");

  const handleSaveConfig = async () => {
    if (!apiKey.trim()) {
      toast({
        title: "API Key Required",
        description: "Please enter a valid API key",
        variant: "destructive",
      });
      return;
    }

    try {
      await updateConfigMutation.mutateAsync({
        provider: activeTab,
        apiKey,
        isActive: true
      });

      toast({
        title: "API Configuration Saved",
        description: `${activeTab.toUpperCase()} API configuration has been saved successfully.`,
      });

      // Clear the input field
      setApiKey("");
    } catch (error: any) {
      toast({
        title: "Error Saving Configuration",
        description: error.message || "An error occurred",
        variant: "destructive",
      });
    }
  };

  const handleTestConnection = async () => {
    if (!isProviderConfigured(activeTab)) {
      toast({
        title: "Provider Not Configured",
        description: `Please save your ${activeTab.toUpperCase()} API key first.`,
        variant: "destructive",
      });
      return;
    }

    try {
      await testConnectionMutation.mutateAsync(activeTab);
      
      toast({
        title: "Connection Successful",
        description: `Successfully connected to ${activeTab.toUpperCase()} API.`,
      });
    } catch (error: any) {
      toast({
        title: "Connection Failed",
        description: error.message || "Failed to connect to the API",
        variant: "destructive",
      });
    }
  };

  const handleDeleteConfig = async (id: number, provider: string) => {
    if (confirm(`Are you sure you want to delete the ${provider.toUpperCase()} API configuration?`)) {
      try {
        await deleteConfigMutation.mutateAsync(id);
        
        toast({
          title: "Configuration Deleted",
          description: `${provider.toUpperCase()} API configuration has been removed.`,
        });
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "An error occurred",
          variant: "destructive",
        });
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-6">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertDescription>
          Failed to load API configurations. Please try again.
        </AlertDescription>
      </Alert>
    );
  }

  const getProviderConfig = (provider: ProviderType) => {
    return apiConfigs?.find(config => config.provider === provider);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>AI Provider Settings</CardTitle>
        <CardDescription>
          Configure the AI providers for generating questions and insights for your ideas.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs
          defaultValue="openai"
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as ProviderType)}
        >
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="openai">OpenAI</TabsTrigger>
            <TabsTrigger value="gemini">Gemini</TabsTrigger>
            <TabsTrigger value="mistral">Mistral</TabsTrigger>
            <TabsTrigger value="anthropic">Anthropic</TabsTrigger>
          </TabsList>

          {["openai", "gemini", "mistral", "anthropic"].map((provider) => (
            <TabsContent key={provider} value={provider} className="space-y-4">
              <div className="space-y-2 mt-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">{provider.toUpperCase()} Configuration</h3>
                  {isProviderConfigured(provider as ProviderType) && (
                    <Badge variant="outline" className="bg-green-100">
                      <CheckCircle2 className="w-3 h-3 mr-1" /> Configured
                    </Badge>
                  )}
                </div>

                {getProviderConfig(provider as ProviderType) && (
                  <div className="bg-muted p-3 rounded-md mb-4">
                    <p className="text-sm">
                      Status: {getProviderConfig(provider as ProviderType)?.isActive ? 'Active' : 'Inactive'}
                    </p>
                    <div className="flex justify-end mt-2">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => 
                          handleDeleteConfig(
                            getProviderConfig(provider as ProviderType)?.id || 0, 
                            provider
                          )
                        }
                        className="h-7 text-xs"
                        disabled={deleteConfigMutation.isPending}
                      >
                        {deleteConfigMutation.isPending ? (
                          <Loader2 className="h-3 w-3 animate-spin mr-1" />
                        ) : (
                          <XCircle className="h-3 w-3 mr-1" />
                        )}
                        Remove
                      </Button>
                    </div>
                  </div>
                )}

                <div className="space-y-1">
                  <Label htmlFor={`${provider}-api-key`}>API Key</Label>
                  <Input
                    id={`${provider}-api-key`}
                    type="password"
                    placeholder={`Enter your ${provider.toUpperCase()} API key`}
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Your API key is securely stored and never shared.
                  </p>
                </div>

                <div className="pt-4 flex space-x-2">
                  <Button
                    onClick={handleSaveConfig}
                    disabled={updateConfigMutation.isPending || !apiKey.trim()}
                  >
                    {updateConfigMutation.isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Save API Key
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleTestConnection}
                    disabled={testConnectionMutation.isPending || !isProviderConfigured(provider as ProviderType)}
                  >
                    {testConnectionMutation.isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Test Connection
                  </Button>
                </div>
              </div>

              <div className="mt-4">
                <h4 className="text-sm font-medium mb-2">About {provider.toUpperCase()}</h4>
                <p className="text-sm text-muted-foreground">
                  {provider === "openai" && "OpenAI offers powerful AI models like GPT-4, known for their versatility and advanced capabilities across various tasks."}
                  {provider === "gemini" && "Google's Gemini is designed for multimodal reasoning, excelling at understanding text, images, and code."}
                  {provider === "mistral" && "Mistral AI provides efficient and powerful language models that offer excellent performance with lower computational requirements."}
                  {provider === "anthropic" && "Anthropic's Claude models are designed to be helpful, harmless, and honest, with a focus on safety and ethical AI."}
                </p>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
        <div className="text-xs text-muted-foreground">
          You can switch between providers in your user settings.
        </div>
      </CardFooter>
    </Card>
  );
}