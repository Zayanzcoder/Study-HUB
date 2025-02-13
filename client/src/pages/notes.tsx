import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Note } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { NoteCard } from "@/components/ui/note-card";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Notes() {
  const { toast } = useToast();
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);

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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Notes</h1>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Note
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {notes?.map((note) => (
          <NoteCard
            key={note.id}
            note={note}
            onEdit={setSelectedNote}
            onDelete={(id) => deleteMutation.mutate(id)}
            onShare={() => {}}
          />
        ))}
      </div>
    </div>
  );
}
