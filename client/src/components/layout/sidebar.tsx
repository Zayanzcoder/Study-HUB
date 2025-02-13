import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import {
  LayoutDashboard,
  CheckSquare,
  FileText,
  MessageSquare,
} from "lucide-react";

const routes = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    href: "/",
  },
  {
    title: "Tasks",
    icon: CheckSquare,
    href: "/tasks",
  },
  {
    title: "Notes",
    icon: FileText,
    href: "/notes",
  },
  {
    title: "AI Chat",
    icon: MessageSquare,
    href: "/ai-chat",
  },
];

export function Sidebar() {
  const [location] = useLocation();

  return (
    <div className="flex h-full w-[200px] flex-col border-r bg-sidebar">
      <div className="flex-1 space-y-1 p-2">
        {routes.map((route) => (
          <Link key={route.href} href={route.href}>
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start gap-2",
                location === route.href && "bg-sidebar-accent text-sidebar-accent-foreground"
              )}
            >
              <route.icon className="h-4 w-4" />
              {route.title}
            </Button>
          </Link>
        ))}
      </div>
    </div>
  );
}
