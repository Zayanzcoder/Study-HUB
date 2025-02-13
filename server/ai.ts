
const COHERE_API_KEY = process.env.COHERE_API_KEY;

export async function getAIResponse(prompt: string): Promise<string> {
  try {
    const response = await fetch(
      'https://api.cohere.ai/v1/generate',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${COHERE_API_KEY}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          model: 'command',
          prompt: prompt,
          max_tokens: 300,
          temperature: 0.7,
        })
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result.generations[0].text || "I'm not sure how to help with that.";
  } catch (error: any) {
    console.error("AI API error:", error);
    
    if (error.status === 429) {
      throw new Error("The AI service is temporarily unavailable due to high demand. Please try again in a few minutes.");
    }
    
    return "Sorry, I'm having trouble processing your request right now.";
  }
}
