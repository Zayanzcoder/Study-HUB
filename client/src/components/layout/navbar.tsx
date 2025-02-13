import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { ListTodo, StickyNote, MessageSquare, Home } from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/tasks", label: "Tasks", icon: ListTodo },
  { href: "/notes", label: "Notes", icon: StickyNote },
  { href: "/ai-chat", label: "AI Chat", icon: MessageSquare },
];

export default function Navbar() {
  const [location] = useLocation();

  return (
    <nav className="border-b bg-card">
      <div className="container mx-auto px-4">
        <NavigationMenu>
          <NavigationMenuList>
            {navItems.map(({ href, label, icon: Icon }) => (
              <NavigationMenuItem key={href}>
                <Link href={href}>
                  <NavigationMenuLink
                    className={cn(
                      navigationMenuTriggerStyle(),
                      "gap-2",
                      location === href && "bg-accent"
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
