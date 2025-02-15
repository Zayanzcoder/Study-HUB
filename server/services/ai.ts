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
As an expert CBSE/NCERT curriculum advisor, create a detailed, personalized study recommendation for an Indian student with the following preferences:

Learning Style: ${preferences.learningStyle}
Difficulty Level: ${preferences.difficultyLevel}
Study Goals: ${preferences.studyGoals}
Subjects: ${preferences.subjects.join(', ')}

Structure your response focusing on CBSE/NCERT curriculum in the following format:

1) NCERT Chapter Progression:
   - Current chapter focus points
   - Key NCERT concepts to master
   - Previous year question analysis
   - Important formulas and theorems (if applicable)

2) ${preferences.learningStyle.toUpperCase()} Learning Approach:
   - NCERT example-based learning methods
   - Practice questions from NCERT exemplar
   - Subject-specific learning techniques
   - Diagram/concept map suggestions

3) Weekly Study Plan:
   - Monday to Sunday schedule
   - NCERT chapter-wise breakup
   - Practice session timings
   - Revision blocks

4) Practice Strategy:
   - NCERT exercise questions
   - NCERT exemplar problems
   - Previous years' board questions
   - Sample paper practice schedule

5) Test Preparation:
   - Weekly test schedule
   - Monthly assessment plan
   - NCERT-based mock tests
   - Performance tracking method

After this, write "RECOMMENDED STUDY MATERIALS:" and list:
   - Required NCERT textbooks
   - Reference books (specific Indian editions)
   - Online resources (Indian educational platforms)
   - Practice material sources

Keep the format clean with following rules:
1. Use proper indentation (3 spaces) for bullet points
2. Add blank lines between main sections
3. Use consistent "-" for all bullet points
4. Maintain proper line spacing between points
5. Focus on practical, actionable steps aligned with CBSE/NCERT standards
`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();

  // Split the response into recommendation and resources sections
  const sections = text.split('RECOMMENDED STUDY MATERIALS:');
  const recommendation = sections[0].trim();
  const resources = sections.length > 1 ? sections[1].trim() : '';

  return {
    recommendation,
    resources,
  };
}