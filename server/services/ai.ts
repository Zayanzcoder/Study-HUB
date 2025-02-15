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

Generate a comprehensive study plan that includes:
1. A detailed roadmap for the primary subject (${preferences.subjects[0]})
2. Specific learning strategies tailored to their ${preferences.learningStyle} learning style
3. Concrete, actionable steps to achieve their goals: ${preferences.studyGoals}
4. Recommended resources and tools
5. Practical exercises and assessments
6. Time management suggestions

Format the response to be directly applicable and actionable.
`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();

  // Split the response into recommendation and resources sections
  const sections = text.split('\n\nRecommended Resources:');
  const recommendation = sections[0].trim();
  const resources = sections.length > 1 ? sections[1].trim() : '';

  return {
    recommendation,
    resources,
  };
}
