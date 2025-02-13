import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Task } from "@shared/schema";
import { format } from "date-fns";
import { Trash2, Edit, Check } from "lucide-react";

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: number) => void;
  onComplete: (id: number) => void;
}

export function TaskCard({ task, onEdit, onDelete, onComplete }: TaskCardProps) {
  const priorityColors = {
    high: "text-red-500 border-red-500",
    medium: "text-yellow-500 border-yellow-500",
    low: "text-green-500 border-green-500",
  };

  const isCompleted = task.status === "completed";

  return (
    <Card className={`w-full ${isCompleted ? 'opacity-70' : ''}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{task.title}</CardTitle>
        <Badge
          variant="outline"
          className={priorityColors[task.priority as keyof typeof priorityColors]}
        >
          {task.priority}
        </Badge>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{task.description}</p>
        {task.dueDate && (
          <p className="text-xs text-muted-foreground mt-2">
            Due: {format(new Date(task.dueDate), "PPP")}
          </p>
        )}
        {!isCompleted && (
          <div className="flex gap-2 mt-4">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onComplete(task.id)}
              className="hover:bg-green-100 hover:text-green-700"
            >
              <Check className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onEdit(task)}
              className="hover:bg-blue-100 hover:text-blue-700"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onDelete(task.id)}
              className="hover:bg-red-100 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}