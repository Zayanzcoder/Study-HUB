import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "@shared/schema";
import { useState, useEffect } from 'react';
import { LoginButton } from "@/components/ui/login-button";
import { Settings, User as UserIcon, LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface HeaderProps {
  onLogout: () => void;
}

export function Header({ onLogout }: HeaderProps) {
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [, setLocation] = useLocation();

  useEffect(() => {
    async function getUser() {
      try {
        const response = await fetch('/api/user');
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        }
      } catch (error) {
        console.error('Failed to get user:', error);
      }
    }
    getUser();
  }, []);

  const handleLogout = async () => {
    if (isLoggingOut) return; // Prevent multiple logout attempts

    setIsLoggingOut(true);
    try {
      // First clear local state
      setUser(null);

      // Then make the logout request
      const response = await fetch('/auth/logout', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        // Call the onLogout callback first
        onLogout();

        // Show success message
        toast({
          title: "Logged out successfully",
          description: "You have been logged out of your account",
        });

        // Finally redirect to home page
        window.location.href = '/';
      } else {
        throw new Error('Logout failed');
      }
    } catch (error) {
      console.error('Logout failed:', error);
      // Restore user state on error
      const response = await fetch('/api/user');
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      }
      toast({
        title: "Error",
        description: "Failed to log out. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <header className="border-b">
      <div className="flex h-16 items-center px-4">
        <Button variant="ghost" className="text-2xl font-bold text-primary p-0">
          <Link href="/">
            StudyHub
          </Link>
        </Button>
        <div className="ml-auto flex items-center space-x-4">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-8 w-8 rounded-full"
                  disabled={isLoggingOut}
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatar || undefined} alt={user.name} />
                    <AvatarFallback>
                      {user.name?.charAt(0).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setLocation('/profile')}>
                  <UserIcon className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLocation('/settings')}>
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="text-red-600 focus:text-red-600"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  {isLoggingOut ? "Signing out..." : "Sign out"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <LoginButton />
          )}
        </div>
      </div>
    </header>
  );
}