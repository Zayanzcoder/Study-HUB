import { Card, CardContent, CardHeader, CardTitle } from "./card";
import { Button } from "./button";
import { Badge } from "./badge";
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

  return (
    <Card className="w-full">
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
        <div className="flex gap-2 mt-4">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onComplete(task.id)}
          >
            <Check className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onEdit(task)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onDelete(task.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
