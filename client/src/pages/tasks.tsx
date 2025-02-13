import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Task } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { TaskCard } from "@/components/tasks/task-card";
import { TaskForm } from "@/components/tasks/task-form";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function Tasks() {
  const { toast } = useToast();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showAddTask, setShowAddTask] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const { data: tasks, isLoading } = useQuery<Task[]>({
    queryKey: ["/api/tasks/1"], // Hardcoded user ID for demo
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/tasks/${id}`);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to delete task");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks/1"] });
      toast({ title: "Task deleted successfully" });
    },
    onError: () => {
      toast({ 
        title: "Failed to delete task", 
        variant: "destructive" 
      });
    }
  });

  const completeMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("PATCH", `/api/tasks/${id}`, { status: "completed" });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to complete task");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks/1"] });
      toast({ title: "Task completed successfully" });
    },
    onError: () => {
      toast({ 
        title: "Failed to complete task", 
        variant: "destructive" 
      });
    }
  });

  const filteredTasks = tasks?.filter(task => 
    statusFilter === "all" ? true : task.status === statusFilter
  ) || [];

  return (
    <div className="space-y-4 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Tasks</h1>
        <div className="flex gap-4">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tasks</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={() => setShowAddTask(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Task
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-4">Loading tasks...</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onEdit={setSelectedTask}
              onDelete={(id) => {
                if (window.confirm('Are you sure you want to delete this task?')) {
                  deleteMutation.mutate(id);
                }
              }}
              onComplete={(id) => completeMutation.mutate(id)}
            />
          ))}
          {filteredTasks.length === 0 && (
            <div className="col-span-full text-center py-8 text-muted-foreground">
              No tasks found
            </div>
          )}
        </div>
      )}

      <TaskForm 
        open={showAddTask || !!selectedTask} 
        onOpenChange={(open) => {
          setShowAddTask(open);
          if (!open) setSelectedTask(null);
        }}
        task={selectedTask}
      />
    </div>
  );
}