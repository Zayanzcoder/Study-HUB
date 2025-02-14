import { HfInference } from '@huggingface/inference';

const hf = new HfInference();

export async function getAIResponse(prompt: string): Promise<string> {
  try {
    const response = await hf.textGeneration({
      model: 'facebook/bart-large-cnn',
      inputs: prompt,
      parameters: {
        max_length: 500,
        temperature: 0.7,
      }
    });

    return response.generated_text || "I'm not sure how to help with that.";
  } catch (error: any) {
    console.error("AI API error:", error);
    return "Sorry, I'm having trouble processing your request right now.";
  }
}

export async function generateNoteContent(topic: string, context?: string): Promise<string> {
  try {
    const prompt = `Generate comprehensive study notes about "${topic}"${context ? ` with this additional context: ${context}` : ''}.
    Focus on key concepts, definitions, and examples. Format the content using markdown for better readability.`;

    const response = await hf.textGeneration({
      model: 'facebook/bart-large-cnn',
      inputs: prompt,
      parameters: {
        max_length: 1000,
        temperature: 0.7,
      }
    });

    return response.generated_text || "Failed to generate notes.";
  } catch (error: any) {
    console.error("Note generation error:", error);
    throw new Error("Failed to generate notes: " + error.message);
  }
}

export async function transcribeAudio(audioBase64: string): Promise<string> {
  try {
    const response = await hf.automaticSpeechRecognition({
      model: 'openai/whisper-small',
      data: Buffer.from(audioBase64, 'base64'),
    });

    return response.text;
  } catch (error: any) {
    console.error("Transcription error:", error);
    throw new Error("Failed to transcribe audio: " + error.message);
  }
}