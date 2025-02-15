import React, { useState, useEffect } from "react";
import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { Shell } from "@/components/layout/shell";
import Home from "@/pages/home";
import Dashboard from "@/pages/dashboard";
import Tasks from "@/pages/tasks";
import Notes from "@/pages/notes";
import AIChat from "@/pages/ai-chat";
import NotFound from "@/pages/not-found";
import Profile from "@/pages/profile";
import AIRecommendations from "@/pages/ai-recommendations";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [, setLocation] = useLocation();

  useEffect(() => {
    fetch('/auth/status')
      .then(res => res.json())
      .then(data => {
        setIsAuthenticated(data.authenticated);
        setLoading(false);
      })
      .catch(error => {
        console.error('Auth check failed:', error);
        setIsAuthenticated(false); // Default to not authenticated on error
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <Shell>
        <Switch>
          <Route path="/" component={isAuthenticated ? Dashboard : Home} />
          <Route path="/dashboard" component={isAuthenticated ? Dashboard : Home} />
          <Route path="/tasks" component={isAuthenticated ? Tasks : Home} />
          <Route path="/notes" component={isAuthenticated ? Notes : Home} />
          <Route path="/ai-chat" component={isAuthenticated ? AIChat : Home} />
          <Route path="/ai-recommendations" component={isAuthenticated ? AIRecommendations : Home} />
          <Route path="/profile" component={isAuthenticated ? Profile : Home} />
          <Route component={NotFound} />
        </Switch>
      </Shell>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;