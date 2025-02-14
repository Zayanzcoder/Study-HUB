import OpenAI from "openai";
import fs from 'fs';

const openai = new OpenAI({ baseURL: "https://api.x.ai/v1", apiKey: process.env.XAI_API_KEY });

export async function getAIResponse(prompt: string): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "grok-2-1212",
      messages: [
        { role: "system", content: "You are a helpful AI assistant for a student productivity platform." },
        { role: "user", content: prompt }
      ],
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
      model: "grok-2-1212",
      messages: [
        { 
          role: "system", 
          content: "You are an expert study note generator. Create clear, well-structured notes that help students understand complex topics."
        },
        { role: "user", content: prompt }
      ],
    });

    return response.choices[0].message.content || "Failed to generate notes.";
  } catch (error: any) {
    console.error("Note generation error:", error);
    if (error.status === 429) {
      throw new Error("AI service quota exceeded. Please try again later.");
    }
    throw new Error("Failed to generate notes: " + error.message);
  }
}

export async function transcribeAudio(audioBase64: string): Promise<string> {
  try {
    // Convert base64 to buffer
    const audioBuffer = Buffer.from(audioBase64, 'base64');

    // Create a temporary file
    const tempFilePath = `/tmp/audio-${Date.now()}.webm`;
    fs.writeFileSync(tempFilePath, audioBuffer);

    try {
      // Using Grok's vision model for audio transcription
      const transcription = await openai.chat.completions.create({
        model: "grok-2-vision-1212",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Please transcribe this audio file accurately."
              },
              {
                type: "audio_url",
                audio_url: {
                  url: `data:audio/webm;base64,${audioBase64}`
                }
              }
            ],
          },
        ],
        max_tokens: 1000,
      });

      return transcription.choices[0].message.content;
    } finally {
      // Clean up temporary file
      fs.unlinkSync(tempFilePath);
    }
  } catch (error: any) {
    console.error("Transcription error:", error);
    if (error.status === 429) {
      throw new Error("AI service quota exceeded. Please try again later.");
    }
    throw new Error("Failed to transcribe audio: " + error.message);
  }
}