import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Note } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { NoteCard } from "@/components/ui/note-card";
import { NoteForm } from "@/components/notes/note-form";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Notes() {
  const { toast } = useToast();
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [showAddNote, setShowAddNote] = useState(false);
  const [showNoteForm, setShowNoteForm] = useState(false); // Added state for note form


  const { data: notes } = useQuery<Note[]>({
    queryKey: ["/api/notes/1"], // Hardcoded user ID for demo
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/notes/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notes/1"] });
      toast({ title: "Note deleted" });
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

  const handleEdit = (note: Note) => {
    setSelectedNote(note);
    setShowNoteForm(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Notes</h1>
        <Button onClick={() => setShowAddNote(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Note
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {notes?.map((note) => (
          <NoteCard
            key={note.id}
            note={note}
            onEdit={() => handleEdit(note)}
            onDelete={(id) => deleteMutation.mutate(id)}
            onShare={() => handleShare(note)}
          />
        ))}
      </div>

      <NoteForm 
        open={showAddNote || showNoteForm} 
        onOpenChange={setShowAddNote}
        selectedNote={selectedNote}
        setSelectedNote={setSelectedNote}
        onClose={() => setShowNoteForm(false)} //Added close handler
      />
    </div>
  );
}