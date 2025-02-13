
const HUGGING_FACE_API_KEY = process.env.HUGGING_FACE_API_KEY;
const MODEL_ID = "google/flan-t5-large"; // You can change this to any model you prefer

export async function getAIResponse(prompt: string): Promise<string> {
  try {
    const response = await fetch(
      `https://api.huggingface.co/models/${MODEL_ID}`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${HUGGING_FACE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ inputs: prompt }),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result[0].generated_text || "I'm not sure how to help with that.";
  } catch (error: any) {
    console.error("AI API error:", error);

    if (error.status === 429) {
      throw new Error("The AI service is temporarily unavailable due to high demand. Please try again in a few minutes.");
    }

    return "Sorry, I'm having trouble processing your request right now.";
  }
}
