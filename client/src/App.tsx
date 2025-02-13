import React, { useState, useEffect } from "react";
import { Switch, Route } from "wouter";
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

function Router() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const isGuest = localStorage.getItem('isGuest') === 'true';

  useEffect(() => {
    fetch('/auth/status')
      .then(res => res.json())
      .then(data => setIsAuthenticated(data.authenticated))
      .catch(console.error);
  }, []);

  return (
    <Shell>
      <Switch>
        <Route path="/" component={Home} />
        {(isAuthenticated || isGuest) && (
          <>
            <Route path="/dashboard" component={Dashboard} />
            <Route path="/tasks" component={Tasks} />
            <Route path="/notes" component={Notes} />
            <Route path="/ai-chat" component={AIChat} />
          </>
        )}
        <Route component={NotFound} />
      </Switch>
    </Shell>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;