import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { ListTodo, StickyNote, MessageSquare, Home, BookOpen, BookMarked } from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/tasks", label: "Tasks", icon: ListTodo },
  { href: "/notes", label: "Notes", icon: StickyNote },
  { href: "/practice-tests", label: "Practice Tests", icon: BookOpen },
  { href: "/resources", label: "Resources", icon: BookMarked },
  { href: "/ai-chat", label: "AI Chat", icon: MessageSquare },
];

export function Navbar() {
  const [location] = useLocation();

  return (
    <nav className="border-b bg-background shadow-sm">
      <div className="container mx-auto px-4 py-2">
        <NavigationMenu>
          <NavigationMenuList className="flex-wrap justify-start">
            {navItems.map(({ href, label, icon: Icon }) => (
              <NavigationMenuItem key={href}>
                <Link href={href}>
                  <NavigationMenuLink
                    className={cn(
                      navigationMenuTriggerStyle(),
                      "gap-2",
                      location === href && "bg-accent text-accent-foreground"
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {label}
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>
      </div>
    </nav>
  );
}