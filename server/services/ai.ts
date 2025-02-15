import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function generateStudyRecommendation(preferences: {
  subjects: string[];
  learningStyle: string;
  studyGoals: string;
  difficultyLevel: string;
}) {
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });

  const prompt = `
As an expert AI tutor, create a detailed, personalized study recommendation for a student with the following preferences:

Learning Style: ${preferences.learningStyle}
Difficulty Level: ${preferences.difficultyLevel}
Study Goals: ${preferences.studyGoals}
Subjects: ${preferences.subjects.join(', ')}

Structure your response in the following format, using bullet points and clear sections:

1. LEARNING PATHWAY:
• Outline a clear progression path for ${preferences.subjects[0]}
• Break down into weekly milestones
• Align with ${preferences.difficultyLevel} level

2. ${preferences.learningStyle.toUpperCase()} LEARNING STRATEGIES:
• List specific techniques that match their learning style
• Include practical examples
• Suggest tools and methods

3. ACHIEVABLE MILESTONES:
• Weekly goals
• Monthly targets
• Assessment checkpoints

4. PRACTICAL EXERCISES:
• Daily practice tasks
• Weekly assignments
• Interactive projects

5. TIME MANAGEMENT:
• Suggested study schedule
• Break intervals
• Review periods

Separate your response with "RECOMMENDED RESOURCES:" and then list:
• Online platforms
• Tools and applications
• Reference materials
• Practice resources

Keep each bullet point concise and actionable. Format everything clearly with bullet points (•).
`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();

  // Split the response into recommendation and resources sections
  const sections = text.split('RECOMMENDED RESOURCES:');
  const recommendation = sections[0].trim();
  const resources = sections.length > 1 ? sections[1].trim() : '';

  return {
    recommendation,
    resources,
  };
}