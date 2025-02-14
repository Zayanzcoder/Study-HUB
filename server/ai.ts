import { PythonShell } from 'python-shell';
import fs from 'fs';

export async function getAIResponse(prompt: string): Promise<string> {
  try {
    let options = {
      mode: 'text' as const,
      pythonPath: 'python3',
      scriptPath: './server',
      args: [prompt]
    };

    const messages = await PythonShell.run('ai.py', options);
    return messages[messages.length - 1] || "I'm not sure how to help with that.";
  } catch (error: any) {
    console.error("AI API error:", error);
    return "Sorry, I'm having trouble processing your request right now.";
  }
}

export async function generateNoteContent(topic: string, context?: string): Promise<string> {
  try {
    const options = {
      mode: 'text' as const,
      pythonPath: 'python3',
      scriptPath: './server',
      args: ['generate', topic]
    };

    if (context) {
      options.args.push(context);
    }

    const messages = await PythonShell.run('ai.py', options);
    return messages[messages.length - 1] || "Failed to generate notes.";
  } catch (error: any) {
    console.error("Note generation error:", error);
    throw new Error("Failed to generate notes: " + error.message);
  }
}

export async function transcribeAudio(audioBase64: string): Promise<string> {
  try {
    const options = {
      mode: 'text' as const,
      pythonPath: 'python3',
      scriptPath: './server',
      args: ['transcribe', audioBase64]
    };

    const messages = await PythonShell.run('ai.py', options);
    return messages[messages.length - 1] || "";
  } catch (error: any) {
    console.error("Transcription error:", error);
    throw new Error("Failed to transcribe audio: " + error.message);
  }
}