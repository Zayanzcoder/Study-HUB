import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { insertNoteSchema } from "@shared/schema";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { NoteEditor } from "./note-editor";
import { Wand2 } from "lucide-react";
import { VoiceRecorder } from "./voice-recorder";

interface NoteFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NoteForm({ open, onOpenChange }: NoteFormProps) {
  const { toast } = useToast();

  const form = useForm({
    resolver: zodResolver(insertNoteSchema),
    defaultValues: {
      title: "",
      content: "",
      isPublic: false,
      userId: 1, // Hardcoded for demo
      sharedWith: [],
      topic: "", // Added default value for topic
    },
  });

  const createNote = useMutation({
    mutationFn: async (values: any) => {
      try {
        const res = await apiRequest("POST", "/api/notes", values);
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.details || "Failed to create note");
        }
        return res.json();
      } catch (error: any) {
        console.error("Note creation error:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notes/1"] });
      onOpenChange(false);
      toast({ title: "Note created successfully" });
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Failed to create note",
        description: error.message || "An error occurred while creating the note",
        variant: "destructive",
      });
    },
  });

  function onSubmit(values: any) {
    if (!values.content.trim()) {
      toast({
        title: "Note content required",
        description: "Please add some content to your note",
        variant: "destructive",
      });
      return;
    }
    createNote.mutate(values);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[725px]">
        <DialogHeader>
          <DialogTitle>Add New Note</DialogTitle>
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
                    <Input placeholder="Note title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex items-center justify-between space-x-2">
              <FormField
                control={form.control}
                name="topic"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Topic for AI Generation (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter topic for AI to generate notes about" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="button"
                variant="outline"
                className="mt-8"
                onClick={async () => {
                  const topic = form.getValues("topic");
                  if (!topic) {
                    toast({
                      title: "Topic required",
                      description: "Please enter a topic for AI to generate notes about",
                      variant: "destructive",
                    });
                    return;
                  }

                  try {
                    const response = await fetch("/api/notes/generate", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ topic }),
                    });

                    if (!response.ok) {
                      throw new Error("Failed to generate notes");
                    }

                    const { content } = await response.json();
                    form.setValue("content", content);
                  } catch (error) {
                    toast({
                      title: "Generation failed",
                      description: "Failed to generate notes. Please try again.",
                      variant: "destructive",
                    });
                  }
                }}
                disabled={createNote.isPending}
              >
                <Wand2 className="h-4 w-4 mr-2" />
                Generate
              </Button>
            </div>

            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Content</FormLabel>
                  <FormControl>
                    <NoteEditor
                      value={field.value}
                      onChange={field.onChange}
                      disabled={createNote.isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex items-center justify-between space-x-2">
              <FormLabel>Voice Input</FormLabel>
              <VoiceRecorder
                onTranscription={(text) => {
                  const currentContent = form.getValues("content");
                  form.setValue("content", currentContent ? `${currentContent}\n\n${text}` : text);
                }}
                disabled={createNote.isPending}
              />
            </div>
            <FormField
              control={form.control}
              name="isPublic"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Public Note</FormLabel>
                    <div className="text-sm text-muted-foreground">
                      Make this note visible to others
                    </div>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={createNote.isPending}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <Button
              type="submit"
              className="w-full"
              disabled={createNote.isPending}
            >
              {createNote.isPending ? "Creating..." : "Create Note"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}