import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Task } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { TaskCard } from "@/components/ui/task-card";
import { TaskForm } from "@/components/tasks/task-form";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Tasks() {
  const { toast } = useToast();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showAddTask, setShowAddTask] = useState(false);

  const { data: tasks } = useQuery<Task[]>({
    queryKey: ["/api/tasks/1"], // Hardcoded user ID for demo
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/tasks/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks/1"] });
      toast({ title: "Task deleted" });
    },
  });

  const completeMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("PATCH", `/api/tasks/${id}`, { status: "completed" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks/1"] });
      toast({ title: "Task completed" });
    },
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Tasks</h1>
        <Button onClick={() => setShowAddTask(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Task
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {tasks?.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onEdit={setSelectedTask}
            onDelete={(id) => deleteMutation.mutate(id)}
            onComplete={(id) => completeMutation.mutate(id)}
          />
        ))}
      </div>

      <TaskForm 
        open={showAddTask} 
        onOpenChange={setShowAddTask}
      />
    </div>
  );
}