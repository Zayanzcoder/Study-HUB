import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Task } from "@shared/schema";
import { TaskCard } from "@/components/ui/task-card";

export default function Dashboard() {
  const { data: tasks } = useQuery<Task[]>({
    queryKey: ["/api/tasks/1"], // Hardcoded user ID for demo
  });

  const upcomingTasks = tasks?.filter(
    (task) => task.status === "pending"
  ).slice(0, 3);

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">Welcome back!</h1>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Tasks</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {upcomingTasks?.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onEdit={() => {}}
                onDelete={() => {}}
                onComplete={() => {}}
              />
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
