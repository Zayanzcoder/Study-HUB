import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { insertTaskSchema, type Task } from "@shared/schema";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";

interface TaskFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task?: Task | null;
}

const priorities = ["low", "medium", "high"] as const;

export function TaskForm({ open, onOpenChange, task }: TaskFormProps) {
  const { toast } = useToast();
  const [date, setDate] = useState<Date | undefined>();
  const isEditing = !!task;

  const form = useForm({
    resolver: zodResolver(insertTaskSchema),
    defaultValues: {
      title: "",
      description: "",
      priority: "medium",
      status: "pending",
      userId: "1", // Convert to string to match schema
      dueDate: null,
    },
  });

  useEffect(() => {
    if (task) {
      form.reset({
        title: task.title,
        description: task.description || "",
        priority: task.priority,
        status: task.status,
        userId: task.userId,
        dueDate: task.dueDate,
      });
      if (task.dueDate) {
        setDate(new Date(task.dueDate));
      }
    }
  }, [task, form]);

  const mutation = useMutation({
    mutationFn: async (values: any) => {
      const formattedValues = {
        ...values,
        dueDate: date ? date.toISOString() : null,
        description: values.description || null,
      };

      const response = await apiRequest(
        isEditing ? "PATCH" : "POST",
        isEditing ? `/api/tasks/${task.id}` : "/api/tasks",
        formattedValues
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.details || `Failed to ${isEditing ? 'update' : 'create'} task`);
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks/1"] });
      onOpenChange(false);
      toast({ title: `Task ${isEditing ? 'updated' : 'created'} successfully` });
      form.reset();
      setDate(undefined);
    },
    onError: (error: any) => {
      console.error('Task mutation error:', error);
      toast({
        title: `Failed to ${isEditing ? 'update' : 'create'} task`,
        description: error.message || `An error occurred while ${isEditing ? 'updating' : 'creating'} the task`,
        variant: "destructive",
      });
    },
  });

  async function onSubmit(values: any) {
    try {
      await mutation.mutateAsync(values);
    } catch (error) {
      // Error is already handled in mutation.onError
      console.error("Form submission error:", error);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Task' : 'Add New Task'}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Task title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Task description" 
                      {...field} 
                      value={field.value || ''} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="priority"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Priority</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {priorities.map((priority) => (
                        <SelectItem key={priority} value={priority}>
                          {priority.charAt(0).toUpperCase() + priority.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormItem>
              <FormLabel>Due Date</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      className={!date ? "text-muted-foreground" : ""}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP") : "Pick a date"}
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </FormItem>
            <Button
              type="submit"
              className="w-full"
              disabled={mutation.isPending}
            >
              {mutation.isPending ? `${isEditing ? 'Updating' : 'Creating'}...` : isEditing ? 'Update Task' : 'Create Task'}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}