import { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Mic, Square, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface VoiceRecorderProps {
  onTranscription: (text: string) => void;
  disabled?: boolean;
}

export function VoiceRecorder({ onTranscription, disabled }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);
  const { toast } = useToast();

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);
      chunks.current = [];

      mediaRecorder.current.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.current.push(e.data);
        }
      };

      mediaRecorder.current.onstop = async () => {
        const blob = new Blob(chunks.current, { type: 'audio/webm' });
        const reader = new FileReader();
        
        reader.onloadend = async () => {
          try {
            setIsProcessing(true);
            const base64Audio = (reader.result as string).split(',')[1];
            
            const response = await fetch('/api/notes/transcribe', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ audioData: base64Audio }),
            });

            if (!response.ok) {
              throw new Error('Failed to transcribe audio');
            }

            const { text } = await response.json();
            onTranscription(text);
          } catch (error) {
            toast({
              title: "Transcription failed",
              description: "Failed to convert speech to text. Please try again.",
              variant: "destructive",
            });
          } finally {
            setIsProcessing(false);
          }
        };

        reader.readAsDataURL(blob);
      };

      mediaRecorder.current.start();
      setIsRecording(true);
    } catch (error) {
      toast({
        title: "Microphone access denied",
        description: "Please allow microphone access to use voice recording.",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorder.current && isRecording) {
      mediaRecorder.current.stop();
      mediaRecorder.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {isProcessing ? (
        <Button disabled variant="outline" size="icon">
          <Loader2 className="h-4 w-4 animate-spin" />
        </Button>
      ) : isRecording ? (
        <Button
          onClick={stopRecording}
          variant="destructive"
          size="icon"
          disabled={disabled}
        >
          <Square className="h-4 w-4" />
        </Button>
      ) : (
        <Button
          onClick={startRecording}
          variant="outline"
          size="icon"
          disabled={disabled}
        >
          <Mic className="h-4 w-4" />
        </Button>
      )}
      {isRecording && <span className="text-sm text-muted-foreground">Recording...</span>}
      {isProcessing && <span className="text-sm text-muted-foreground">Processing...</span>}
    </div>
  );
}
