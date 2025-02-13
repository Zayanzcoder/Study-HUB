import { Link } from "wouter";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { User } from "@shared/schema";
import { useState, useEffect } from 'react';
import { LoginButton } from "../ui/login-button";
import { useLocation } from "wouter";

interface HeaderProps {
  onLogout: () => void;
}

export function Header({ onLogout }: HeaderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [, setLocation] = useLocation();
  const isGuest = localStorage.getItem('isGuest') === 'true';

  useEffect(() => {
    async function getUser() {
      try {
        const response = await fetch('/__replauthuser');
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

  const handleLogout = () => {
    onLogout();
    localStorage.removeItem('isGuest'); // Clear guest status on logout
    setLocation('/');
  };

  return (
    <header className="border-b">
      <div className="flex h-16 items-center px-4">
        <Link href="/">
          <a className="text-2xl font-bold text-primary">StudyHub</a>
        </Link>
        <div className="ml-auto flex items-center space-x-4">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-8 w-8 rounded-full"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatar || undefined} alt={user.name} />
                    <AvatarFallback>
                      {user.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleLogout}>
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : isGuest ? (
            <Button onClick={handleLogout} variant="ghost">
              Exit Guest Mode
            </Button>
          ) : (
            <LoginButton />
          )}
        </div>
      </div>
    </header>
  );
}