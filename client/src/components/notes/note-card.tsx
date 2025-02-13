
import { motion } from "framer-motion";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Share2, Edit2, Globe, Lock } from "lucide-react";
import { useState } from "react";
import { type Note } from "@shared/schema";

type NoteCardProps = {
  note: Note;
  onEdit: (note: Note) => void;
  onShare: (note: Note) => void;
};

export default function NoteCard({ note, onEdit, onShare }: NoteCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <h3 className="text-lg font-semibold">{note.title}</h3>
          <Badge variant={note.isPublic ? "default" : "secondary"}>
            {note.isPublic ? <Globe className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
          </Badge>
        </CardHeader>
        <CardContent>
          <div 
            className="prose dark:prose-invert"
            dangerouslySetInnerHTML={{ __html: note.content }}
          />
        </CardContent>
        <CardFooter className="justify-end gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onEdit(note)}
          >
            <Edit2 className="h-4 w-4 mr-1" />
            Edit
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onShare(note)}
          >
            <Share2 className="h-4 w-4 mr-1" />
            Share
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
