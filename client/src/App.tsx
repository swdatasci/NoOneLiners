import { Switch, Route, useLocation } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { useState, useEffect } from "react";

// Pages
import Home from "@/pages/Home";
import AllIdeas from "@/pages/AllIdeas";
import Saved from "@/pages/Saved";
import Categories from "@/pages/Categories";
import VersionHistory from "@/pages/VersionHistory";
import Settings from "@/pages/Settings";
import NotFound from "@/pages/not-found";

// Components
import Sidebar from "@/components/Sidebar";
import BottomNavigation from "@/components/BottomNavigation";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/ideas" component={AllIdeas} />
      <Route path="/saved" component={Saved} />
      <Route path="/categories" component={Categories} />
      <Route path="/version-history" component={VersionHistory} />
      <Route path="/settings" component={Settings} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });
  
  const [location] = useLocation();
  
  // Mock login for demo purposes
  useEffect(() => {
    if (!user) {
      // Auto-login with a demo user
      const demoUser = { id: 1, username: "demouser" };
      setUser(demoUser);
      localStorage.setItem("user", JSON.stringify(demoUser));
    }
  }, [user]);

  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex flex-col lg:flex-row h-screen overflow-hidden">
        <Sidebar user={user} />
        <main className="flex-1 overflow-y-auto pb-16 lg:pb-0">
          <Router />
        </main>
        <BottomNavigation currentPath={location} />
      </div>
    </QueryClientProvider>
  );
}

export default App;
