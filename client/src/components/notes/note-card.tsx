import { motion } from "framer-motion";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { type Note } from "@shared/schema";

type NoteCardProps = {
  note: Note;
};

export default function NoteCard({ note }: NoteCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <h3 className="text-lg font-semibold">{note.title}</h3>
          {note.isPublic && (
            <Badge variant="secondary">Public</Badge>
          )}
        </CardHeader>
        <CardContent>
          <div 
            className="prose dark:prose-invert"
            dangerouslySetInnerHTML={{ __html: note.content }}
          />
        </CardContent>
      </Card>
    </motion.div>
  );
}
