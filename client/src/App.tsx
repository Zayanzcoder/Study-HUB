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

function PrivateRoute({ component: Component, isAuthenticated, ...rest }: any) {
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isAuthenticated) {
      setLocation('/');
    }
  }, [isAuthenticated, setLocation]);

  return isAuthenticated ? <Component {...rest} /> : null;
}

function PublicShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      {children}
    </div>
  );
}

function AuthenticatedShell({ children }: { children: React.ReactNode }) {
  return (
    <Shell>
      {children}
    </Shell>
  );
}

function Router() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [, setLocation] = useLocation();

  useEffect(() => {
    fetch('/auth/status')
      .then(res => res.json())
      .then(data => {
        setIsAuthenticated(data.authenticated);
        if (data.authenticated) {
          setLocation('/dashboard');
        }
        setLoading(false);
      })
      .catch(error => {
        console.error('Auth check failed:', error);
        setLoading(false);
      });
  }, [setLocation]);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  // Public routes with different layout
  if (!isAuthenticated) {
    return (
      <PublicShell>
        <Switch>
          <Route path="/" component={Home} />
          <Route component={NotFound} />
        </Switch>
      </PublicShell>
    );
  }

  // Authenticated routes with dashboard layout
  return (
    <AuthenticatedShell>
      <Switch>
        <Route path="/" component={() => {
          setLocation('/dashboard');
          return null;
        }} />
        <Route 
          path="/dashboard" 
          component={(props) => (
            <PrivateRoute 
              component={Dashboard} 
              isAuthenticated={isAuthenticated} 
              {...props} 
            />
          )} 
        />
        <Route 
          path="/tasks" 
          component={(props) => (
            <PrivateRoute 
              component={Tasks} 
              isAuthenticated={isAuthenticated} 
              {...props} 
            />
          )} 
        />
        <Route 
          path="/notes" 
          component={(props) => (
            <PrivateRoute 
              component={Notes} 
              isAuthenticated={isAuthenticated} 
              {...props} 
            />
          )} 
        />
        <Route 
          path="/ai-chat" 
          component={(props) => (
            <PrivateRoute 
              component={AIChat} 
              isAuthenticated={isAuthenticated} 
              {...props} 
            />
          )} 
        />
        <Route 
          path="/profile" 
          component={(props) => (
            <PrivateRoute 
              component={Profile} 
              isAuthenticated={isAuthenticated} 
              {...props} 
            />
          )} 
        />
        <Route component={NotFound} />
      </Switch>
    </AuthenticatedShell>
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