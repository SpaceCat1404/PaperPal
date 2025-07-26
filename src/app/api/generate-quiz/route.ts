import { NextRequest, NextResponse } from 'next/server';
import { LLM_CONFIG, getModelConfig, getHeaders } from '@/config/llm';

export async function POST(request: NextRequest) {
  try {
    const { content, apiKey, skillLevel } = await request.json();

    if (!content || !apiKey) {
      return NextResponse.json(
        { error: 'Missing required fields: content and apiKey' },
        { status: 400 }
      );
    }

    // Use OpenRouter API to generate quiz questions
    const openrouterResponse = await fetch(LLM_CONFIG.baseUrl, {
      method: 'POST',
      headers: getHeaders(apiKey),
      body: JSON.stringify({
        ...getModelConfig(), // Uses default model and settings
        messages: [
          {
            role: 'system',
            content: `You are an expert educator creating quiz questions for a research paper at a ${skillLevel} level. 

For high school students: Create questions that test basic understanding, use simple language, and focus on fundamental concepts.
For undergraduate students: Create questions that test intermediate understanding, use moderate technical language, and focus on key concepts and applications.
For graduate students: Create questions that test advanced understanding, use technical language, and focus on nuanced analysis and critical thinking.

Generate 5 diverse questions based on the paper content:

1. 3 multiple-choice questions testing key concepts
2. 2 text-based questions requiring explanation

For multiple-choice questions, provide 4 options with one correct answer.
For text questions, provide keywords that indicate a correct answer.

Format your response as JSON:
{
  "questions": [
    {
      "id": 1,
      "type": "multiple-choice",
      "question": "Question text?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 1,
      "explanation": "Why this answer is correct"
    },
    {
      "id": 2,
      "type": "text",
      "question": "Explain the main concept...",
      "correctKeywords": ["keyword1", "keyword2", "keyword3"],
      "explanation": "Expected answer explanation"
    }
  ]
}`
          },
          {
            role: 'user',
            content: content
          }
        ],

      }),
    });

    if (!openrouterResponse.ok) {
      const errorText = await openrouterResponse.text();
      console.error('OpenRouter API error:', openrouterResponse.status, errorText);
      throw new Error(`OpenRouter API error: ${openrouterResponse.status} - ${errorText}`);
    }

    const openrouterData = await openrouterResponse.json();
    const quizContent = openrouterData.choices[0].message.content;

    // Parse the JSON response from the LLM
    let parsedQuiz;
    try {
      parsedQuiz = JSON.parse(quizContent);
    } catch (parseError) {
      // If parsing fails, create fallback questions
      parsedQuiz = {
        questions: [
          {
            id: 1,
            type: 'multiple-choice',
            question: "What is the main contribution of this research?",
            options: [
              "Improved methodology",
              "New theoretical framework", 
              "Better experimental design",
              "All of the above"
            ],
            correctAnswer: 3,
            explanation: "The research contributes across multiple dimensions."
          },
          {
            id: 2,
            type: 'text',
            question: "Explain the key methodology used in this research.",
            correctKeywords: ["method", "approach", "technique", "process"],
            explanation: "The methodology involves systematic data collection and analysis."
          }
        ]
      };
    }

    return NextResponse.json(parsedQuiz);
  } catch (error) {
    console.error('Error in generate-quiz API:', error);
    return NextResponse.json(
      { error: 'Failed to generate quiz' },
      { status: 500 }
    );
  }
} 