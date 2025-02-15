import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize with environment variable
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function generateStudyRecommendation(preferences: {
  subjects: string[];
  learningStyle: string;
  studyGoals: string;
  difficultyLevel: string;
}) {
  // Validate API key
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('Gemini API key not configured');
  }

  try {
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
   - Practice material sources`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Split the response into recommendation and resources sections
    const sections = text.split('RECOMMENDED STUDY MATERIALS:');
    let recommendation = sections[0].trim();
    let resources = sections.length > 1 ? sections[1].trim() : '';

    // Clean up the formatting
    recommendation = recommendation
      .replace(/\*\*/g, '')
      .replace(/•/g, '-')
      .split('\n')
      .map(line => {
        if (line.trim().startsWith('-')) {
          return '   ' + line.trim();
        }
        return line;
      })
      .join('\n')
      .replace(/\n{3,}/g, '\n\n');

    resources = resources
      .replace(/\*\*/g, '')
      .replace(/•/g, '-')
      .split('\n')
      .map(line => {
        if (line.trim().startsWith('-')) {
          return '   ' + line.trim();
        }
        return line;
      })
      .join('\n')
      .replace(/\n{3,}/g, '\n\n');

    return {
      recommendation,
      resources,
    };
  } catch (error: any) {
    console.error('Gemini API error:', error);
    throw new Error(`Failed to generate study recommendation: ${error.message}`);
  }
}

export async function generateStudyNotes(topic: string, preferences: {
  learningStyle: string;
  difficultyLevel: string;
}) {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('Gemini API key not configured');
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `
Create detailed and organized study notes for a CBSE/NCERT student on the topic: "${topic}"

Learning Style: ${preferences.learningStyle}
Difficulty Level: ${preferences.difficultyLevel}

Format the notes in the following structure:

1. TOPIC OVERVIEW
   - Brief introduction
   - Key concepts covered
   - Prerequisites (if any)

2. MAIN CONCEPTS
   - Detailed explanations
   - Important definitions
   - Formulas and their applications (if applicable)
   - Step-by-step explanations of complex ideas

3. EXAMPLES AND ILLUSTRATIONS
   - NCERT-based examples
   - Step-by-step solutions
   - Common misconceptions and clarifications

4. KEY POINTS TO REMEMBER
   - Important facts
   - Quick revision points
   - Mnemonics or memory aids (if applicable)

5. PRACTICE QUESTIONS
   - NCERT exercise questions
   - Previous years' questions on this topic
   - Quick self-assessment questions

Please structure the content clearly with proper headings and bullet points.
Focus on clarity and accuracy according to NCERT/CBSE curriculum standards.
Include relevant diagrams' descriptions where necessary.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Clean up the formatting
    const formattedNotes = text
      .replace(/\*\*/g, '')
      .replace(/•/g, '-')
      .split('\n')
      .map(line => {
        if (line.trim().startsWith('-')) {
          return '   ' + line.trim();
        }
        return line;
      })
      .join('\n')
      .replace(/\n{3,}/g, '\n\n');

    return formattedNotes;
  } catch (error: any) {
    console.error('Gemini API error:', error);
    throw new Error(`Failed to generate study notes: ${error.message}`);
  }
}