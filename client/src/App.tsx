import React, { useState, useEffect } from "react";
import { Switch, Route, useLocation, useNavigate } from "wouter";
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

function PrivateRoute({ component: Component, isAuthenticated, ...rest }: any) {
  const [, navigate] = useLocation();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  return isAuthenticated ? <Component {...rest} /> : null;
}

function Router() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [, navigate] = useLocation();

  useEffect(() => {
    fetch('/auth/status')
      .then(res => res.json())
      .then(data => {
        setIsAuthenticated(data.authenticated);
        if (data.authenticated) {
          navigate('/dashboard');
        }
        setLoading(false);
      })
      .catch(error => {
        console.error('Auth check failed:', error);
        setLoading(false);
      });
  }, [navigate]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Shell>
      <Switch>
        <Route path="/" component={Home} />
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