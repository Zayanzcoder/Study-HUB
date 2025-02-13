import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Task } from "@shared/schema";
import { TaskCard } from "@/components/ui/task-card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { ListTodo, CheckCircle2, Clock, AlertCircle } from "lucide-react";

export default function Dashboard() {
  // For guest users, we'll show sample data
  const isGuest = !localStorage.getItem('user');

  const { data: tasks } = useQuery<Task[]>({
    queryKey: ["/api/tasks/1"],
    enabled: !isGuest, // Only fetch if not a guest
  });

  // Sample data for guest users
  const guestTasks = isGuest ? [
    {
      id: 1,
      userId: 1,
      title: "Sample Task 1",
      description: "This is a sample task",
      dueDate: new Date().toISOString(),
      priority: "medium",
      status: "pending"
    },
    {
      id: 2,
      userId: 1,
      title: "Sample Task 2",
      description: "Another sample task",
      dueDate: new Date().toISOString(),
      priority: "high",
      status: "pending"
    }
  ] : [];

  const currentTasks = isGuest ? guestTasks : (tasks || []);
  const upcomingTasks = currentTasks.filter(task => task.status === "pending").slice(0, 3);
  const completedTasks = currentTasks.filter(task => task.status === "completed").length;
  const pendingTasks = currentTasks.filter(task => task.status === "pending").length;
  const totalTasks = currentTasks.length;

  const chartData = [
    { name: 'Mon', completed: 4 },
    { name: 'Tue', completed: 3 },
    { name: 'Wed', completed: 5 },
    { name: 'Thu', completed: 2 },
    { name: 'Fri', completed: 6 },
    { name: 'Sat', completed: 3 },
    { name: 'Sun', completed: 4 },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">
        {isGuest ? "Welcome Guest!" : "Welcome back!"}
      </h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
            <ListTodo className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTasks}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedTasks}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingTasks}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0}%
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Task Completion Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <LineChart width={500} height={300} data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="completed" stroke="#8884d8" />
            </LineChart>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming Tasks</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {upcomingTasks.map((task) => (
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