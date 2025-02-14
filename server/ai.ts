import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function getAIResponse(prompt: string): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "You are a helpful AI assistant for a student productivity platform." },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 500
    });

    return response.choices[0].message.content || "I'm not sure how to help with that.";
  } catch (error: any) {
    console.error("AI API error:", error);

    if (error.status === 429) {
      throw new Error("The AI service is temporarily unavailable due to high demand. Please try again in a few minutes.");
    }

    return "Sorry, I'm having trouble processing your request right now.";
  }
}

export async function generateNoteContent(topic: string, context?: string): Promise<string> {
  try {
    const prompt = `Generate comprehensive study notes about "${topic}"${context ? ` with this additional context: ${context}` : ''}.
    Focus on key concepts, definitions, and examples. Format the content using markdown for better readability.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { 
          role: "system", 
          content: "You are an expert study note generator. Create clear, well-structured notes that help students understand complex topics."
        },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 1000
    });

    return response.choices[0].message.content || "Failed to generate notes.";
  } catch (error: any) {
    console.error("Note generation error:", error);
    throw new Error("Failed to generate notes: " + error.message);
  }
}

export async function transcribeAudio(audioBase64: string): Promise<string> {
  try {
    // Convert base64 to buffer
    const audioBuffer = Buffer.from(audioBase64, 'base64');

    const transcription = await openai.audio.transcriptions.create({
      file: audioBuffer,
      model: "whisper-1",
      language: "en"
    });

    return transcription.text;
  } catch (error: any) {
    console.error("Transcription error:", error);
    throw new Error("Failed to transcribe audio: " + error.message);
  }
}