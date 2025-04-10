import { Switch, Route, useLocation } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";

// Pages
import Home from "@/pages/Home";
import AllIdeas from "@/pages/AllIdeas";
import Saved from "@/pages/Saved";
import Categories from "@/pages/Categories";
import VersionHistory from "@/pages/VersionHistory";
import Settings from "@/pages/Settings";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";

// Components
import Sidebar from "@/components/Sidebar";
import BottomNavigation from "@/components/BottomNavigation";

// Auth
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";

function Router() {
  return (
    <Switch>
      <ProtectedRoute path="/" component={Home} />
      <ProtectedRoute path="/ideas" component={AllIdeas} />
      <ProtectedRoute path="/saved" component={Saved} />
      <ProtectedRoute path="/categories" component={Categories} />
      <ProtectedRoute path="/version-history" component={VersionHistory} />
      <ProtectedRoute path="/settings" component={Settings} />
      <Route path="/auth" component={AuthPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function AppContent() {
  const { user } = useAuth();
  const [location] = useLocation();
  
  // Only show sidebar and navigation when authenticated
  if (!user) {
    return (
      <main className="flex-1">
        <Router />
      </main>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row h-screen overflow-hidden">
      <Sidebar user={user} />
      <main className="flex-1 overflow-y-auto pb-16 lg:pb-0">
        <Router />
      </main>
      <BottomNavigation currentPath={location} />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppContent />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
