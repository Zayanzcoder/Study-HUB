import { Card, CardContent, CardHeader, CardTitle } from "./card";
import { Button } from "./button";
import { Badge } from "./badge";
import { Note } from "@shared/schema";
import { Trash2, Edit, Share2, Globe, Lock } from "lucide-react";

interface NoteCardProps {
  note: Note;
  onEdit: (note: Note) => void;
  onDelete: (id: number) => void;
  onShare: (note: Note) => void;
}

export function NoteCard({ note, onEdit, onDelete, onShare }: NoteCardProps) {
  return (
    <Card className="w-full h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base font-medium line-clamp-1">{note.title}</CardTitle>
        <Badge variant={note.isPublic ? "default" : "secondary"} className="h-6">
          {note.isPublic ? (
            <Globe className="h-3.5 w-3.5 mr-1" />
          ) : (
            <Lock className="h-3.5 w-3.5 mr-1" />
          )}
          {note.isPublic ? "Public" : "Private"}
        </Badge>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        <div className="flex-1">
          <p className="text-sm text-muted-foreground line-clamp-4 whitespace-pre-wrap">
            {note.content}
          </p>
        </div>
        <div className="flex gap-2 mt-4 justify-end">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onShare(note)}
            title="Share note"
          >
            <Share2 className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onEdit(note)}
            title="Edit note"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onDelete(note.id)}
            title="Delete note"
            className="hover:bg-destructive hover:text-destructive-foreground"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}