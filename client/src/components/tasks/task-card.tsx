import { useMutation } from "@tanstack/react-query";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { type Task } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";

const priorityColors = {
  low: "bg-blue-500",
  medium: "bg-yellow-500",
  high: "bg-red-500",
};

type TaskCardProps = {
  task: Task;
};

export default function TaskCard({ task }: TaskCardProps) {
  const completeTask = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("PATCH", `/api/tasks/${task.id}/complete`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
    },
  });

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.2 }}
      >
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold">{task.title}</h3>
              <Badge className={priorityColors[task.priority]}>
                {task.priority}
              </Badge>
            </div>
            {!task.completed && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => completeTask.mutate()}
                disabled={completeTask.isPending}
              >
                Complete
              </Button>
            )}
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{task.description}</p>
            {task.dueDate && (
              <p className="text-sm text-muted-foreground mt-2">
                Due: {format(new Date(task.dueDate), "PPP")}
              </p>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}