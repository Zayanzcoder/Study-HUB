import { useState } from "react";
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
import { Editor } from '@tiptap/react';
import { Wand2, Loader2 } from "lucide-react";
import { VoiceRecorder } from "./voice-recorder";

interface NoteFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedNote?: any; // Add type when we implement edit functionality
  onClose?: () => void;
}

export function NoteForm({ open, onOpenChange, selectedNote, onClose }: NoteFormProps) {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);

  const form = useForm({
    resolver: zodResolver(insertNoteSchema),
    defaultValues: {
      title: selectedNote?.title || "",
      content: selectedNote?.content || "",
      isPublic: selectedNote?.isPublic || false,
      userId: "1", // This will be replaced with actual user ID
      sharedWith: selectedNote?.sharedWith || [],
      topic: "", // For AI generation
    },
  });

  const createNote = useMutation({
    mutationFn: async (values: any) => {
      const res = await apiRequest("POST", "/api/notes", values);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.details || "Failed to create note");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notes/1"] });
      onOpenChange(false);
      if (onClose) onClose();
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

  const handleGenerateContent = async () => {
    const topic = form.getValues("topic");
    if (!topic) {
      toast({
        title: "Topic required",
        description: "Please enter a topic for AI to generate notes about",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch("/api/notes/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to generate notes");
      }

      const { content } = await response.json();
      form.setValue("content", content);
      toast({
        title: "Notes generated",
        description: "AI has generated notes based on your topic.",
      });
    } catch (error: any) {
      console.error('Generation error:', error);
      toast({
        title: "Generation failed",
        description: error.message || "Failed to generate notes. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

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
      <DialogContent className="sm:max-w-[725px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{selectedNote ? "Edit Note" : "Create New Note"}</DialogTitle>
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
                onClick={handleGenerateContent}
                disabled={isGenerating || createNote.isPending}
              >
                {isGenerating ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Wand2 className="h-4 w-4 mr-2" />
                )}
                {isGenerating ? "Generating..." : "Generate"}
              </Button>
            </div>

            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Content</FormLabel>
                  <FormControl>
                    <textarea
                      {...field}
                      className="w-full min-h-[200px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      placeholder="Write your note content here..."
                      disabled={createNote.isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  onOpenChange(false);
                  if (onClose) onClose();
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createNote.isPending}
              >
                {createNote.isPending ? "Creating..." : (selectedNote ? "Save Changes" : "Create Note")}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}