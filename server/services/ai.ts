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
Generate comprehensive NCERT/CBSE study notes for the topic: "${topic}"

Learning Style: ${preferences.learningStyle}
Difficulty Level: ${preferences.difficultyLevel}

Instructions:
- Focus on creating detailed study notes, not recommendations
- Use clear, concise explanations
- Include NCERT/CBSE specific content
- Format with proper headings and subheadings

Structure the notes as follows:

1. TOPIC INTRODUCTION
   - Definition and basic concept
   - Importance in NCERT curriculum
   - Related NCERT chapters

2. KEY CONCEPTS
   - Main points and theories
   - Important formulas (if applicable)
   - Definitions and terminology
   - Step-by-step concept breakdowns

3. DETAILED EXPLANATIONS
   - In-depth analysis of each concept
   - NCERT examples and their solutions
   - Visual descriptions (diagrams, charts, etc.)
   - Common misconceptions and clarifications

4. PRACTICAL APPLICATIONS
   - Real-world examples
   - NCERT exercise problems
   - Step-by-step problem solving
   - Practice questions with solutions

5. QUICK REVISION
   - Summary points
   - Important formulas and facts
   - Memory aids and mnemonics
   - Key terms and definitions

Format Requirements:
- Use clear headings for each section
- Include bullet points for better readability
- Maintain consistent indentation
- Add line breaks between sections`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Clean up and format the notes
    const formattedNotes = text
      .replace(/\*\*/g, '')
      .replace(/•/g, '-')
      .split('\n')
      .map(line => {
        // Add proper indentation for bullet points
        if (line.trim().startsWith('-')) {
          return '   ' + line.trim();
        }
        // Add spacing for main headers
        if (line.trim().match(/^\d+\./)) {
          return '\n' + line.trim();
        }
        return line;
      })
      .join('\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim();

    return formattedNotes;
  } catch (error: any) {
    console.error('Gemini API error:', error);
    throw new Error(`Failed to generate study notes: ${error.message}`);
  }
}