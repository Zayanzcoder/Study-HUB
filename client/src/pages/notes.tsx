import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Note } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { NoteCard } from "@/components/ui/note-card";
import { NoteForm } from "@/components/notes/note-form";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Plus, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Notes() {
  const { toast } = useToast();
  const [showNoteForm, setShowNoteForm] = useState(false);

  // Fetch notes
  const { data: notes, isLoading } = useQuery<Note[]>({
    queryKey: ["/api/notes/1"], // TODO: Replace with actual user ID
  });

  // Delete note mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/notes/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notes/1"] });
      toast({ 
        title: "Note deleted",
        description: "Your note has been successfully deleted."
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete note. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleShare = (note: Note) => {
    // Create a shareable link
    const shareUrl = `${window.location.origin}/notes/${note.id}`;
    navigator.clipboard.writeText(shareUrl);
    toast({
      title: "Link copied!",
      description: "The note link has been copied to your clipboard.",
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">My Notes</h1>
        <Button onClick={() => setShowNoteForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Note
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {notes?.map((note) => (
          <NoteCard
            key={note.id}
            note={note}
            onEdit={() => {
              // Handle edit in the future
              toast({
                title: "Coming soon",
                description: "Note editing will be available soon!",
              });
            }}
            onDelete={() => deleteMutation.mutate(note.id)}
            onShare={() => handleShare(note)}
          />
        ))}
        {notes?.length === 0 && (
          <div className="col-span-full text-center py-12">
            <h3 className="text-lg font-semibold mb-2">No notes yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first note to get started!
            </p>
            <Button onClick={() => setShowNoteForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Note
            </Button>
          </div>
        )}
      </div>

      <NoteForm 
        open={showNoteForm}
        onOpenChange={setShowNoteForm}
      />
    </div>
  );
}