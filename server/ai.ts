import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function getAIResponse(prompt: string): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a helpful AI assistant for students. Help them with studying, organization, and academic questions. Keep responses concise and friendly.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      max_tokens: 500,
    });

    return response.choices[0].message.content || "I'm not sure how to help with that.";
  } catch (error: any) {
    console.error("OpenAI API error:", error);

    if (error.status === 429) {
      throw new Error("The AI service is temporarily unavailable due to high demand. Please try again in a few minutes.");
    }

    return "Sorry, I'm having trouble processing your request right now.";
  }
}