import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function analyzeChatMessage(message: string): Promise<string> {
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: "You are a helpful AI assistant for students. Help with study tips, organization, and general academic advice. Keep responses concise and practical.",
      },
      {
        role: "user",
        content: message,
      },
    ],
  });

  return response.choices[0].message.content || "I'm sorry, I couldn't process that request.";
}
