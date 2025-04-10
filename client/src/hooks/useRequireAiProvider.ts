import { useState, useEffect, ReactNode } from 'react';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { useAiProviders } from './useAiProviders';
import { useAuth } from './use-auth';

export function useRequireAiProvider() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { 
    activeProviders, 
    isLoading,
    error 
  } = useAiProviders();
  
  const [isChecking, setIsChecking] = useState(true);
  const [hasProvider, setHasProvider] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      setIsChecking(false);
      
      // Check if any AI provider is active
      const hasActiveProvider = activeProviders.length > 0;
      setHasProvider(hasActiveProvider);
      
      // If user is logged in but has no active AI provider, show warning
      if (user && !hasActiveProvider && !error) {
        toast({
          title: "AI Provider Required",
          description: "You need to configure at least one AI provider in your settings to use advanced features.",
          variant: "destructive",
          action: (
            <span 
              className="bg-primary-600 text-white px-3 py-1.5 rounded text-xs cursor-pointer"
              onClick={() => setLocation("/settings")}
            >
              Go to Settings
            </span>
          ) as ReactNode,
        });
      }
    }
  }, [isLoading, activeProviders, user, error, toast, setLocation]);

  return {
    isChecking,
    hasProvider,
    isLoading,
    error
  };
}