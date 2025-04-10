import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import SettingsModal from "@/components/SettingsModal";
import { Loader2 } from "lucide-react";

const Settings = () => {
  const [showModal, setShowModal] = useState(true);
  
  // Get user from auth context
  const { user, isLoading: isLoadingUser } = useAuth();
  
  // Get current settings
  const { data: settings, isLoading: isLoadingSettings } = useQuery({
    queryKey: user ? [`/api/settings/${user.id}`] : ['no-user'],
    enabled: !!user,
  });

  const [, setLocation] = useLocation();
  
  // This page just shows settings in a modal directly
  // When modal is closed, it redirects back to home
  const handleCloseModal = () => {
    setShowModal(false);
    // Redirect to home using wouter
    setLocation("/");
  };

  // Show loading state while user data is being fetched
  if (isLoadingUser) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }
  
  // If no user is found, they should be redirected to auth page automatically
  if (!user) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 py-6">
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            You must be logged in to access settings
          </h3>
        </div>
      </div>
    );
  }
  
  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6">
      {/* Settings content - Modal is shown by default */}
      {showModal && <SettingsModal userId={user.id} onClose={handleCloseModal} />}
      
      {/* Fallback content in case modal is dismissed */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>
      </div>
      
      <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-12 w-12 mx-auto text-gray-400 mb-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Manage your settings
        </h3>
        <p className="text-gray-500 mb-6">
          Configure your NoOneLiners experience with self-evolution settings and preferences
        </p>
        <button
          className="bg-primary-600 hover:bg-primary-700 text-white font-medium px-4 py-2 rounded-lg"
          onClick={() => setShowModal(true)}
        >
          Open Settings
        </button>
      </div>
    </div>
  );
};

export default Settings;
