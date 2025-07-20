// LLM API utility functions for PaperPal

export interface LLMResponse {
  success: boolean;
  data?: any;
  error?: string;
}

export interface QuizQuestion {
  id: number;
  type: 'multiple-choice' | 'text';
  question: string;
  options?: string[];
  correctAnswer?: number;
  correctKeywords?: string[];
  explanation: string;
}

export interface GeneratedContent {
  title: string;
  authors: string;
  abstract: string;
  simplifiedSummary: string;
  keyPoints: string[];
  quizQuestions: QuizQuestion[];
  applications: {
    projectIdeas: string[];
    industryApplications: string[];
    researchDirections: string[];
    blogTopics: string[];
  };
}

// Extract text from PDF using PDF.js
export const extractTextFromPDF = async (file: File): Promise<string> => {
  try {
    // For now, we'll use a simple approach
    // In production, you'd want to use PDF.js or a similar library
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    
    // This is a placeholder - in reality, you'd use PDF.js to extract text
    // For demonstration, we'll return a mock extraction
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(`
          Abstract
          This is a sample research paper abstract that would be extracted from the uploaded PDF.
          The paper discusses important findings and methodologies in the field of study.
          
          1. Introduction
          This section introduces the research problem and provides background information.
          The authors present their motivation and outline the contributions of their work.
          
          2. Methodology
          The research methodology is described in detail, including data collection methods,
          experimental setup, and analysis techniques used in the study.
          
          3. Results
          The experimental results are presented with supporting data and analysis.
          Key findings and statistical significance are discussed.
          
          4. Discussion
          The implications of the results are discussed in the context of existing literature.
          Limitations and future work directions are also addressed.
          
          5. Conclusion
          The paper concludes with a summary of contributions and their significance.
        `);
      }, 2000); // Simulate processing time
    });
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    throw new Error('Failed to extract text from PDF');
  }
};

// Generate content using LLM API
export const generateContentFromText = async (
  extractedText: string,
  apiKey: string
): Promise<GeneratedContent> => {
  try {
    const response = await fetch('/api/generate-content', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: extractedText,
        apiKey: apiKey,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error generating content:', error);
    throw new Error('Failed to generate content from text');
  }
};

// Generate quiz questions specifically
export const generateQuizQuestions = async (
  paperContent: string,
  apiKey: string
): Promise<QuizQuestion[]> => {
  try {
    const response = await fetch('/api/generate-quiz', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content: paperContent,
        apiKey: apiKey,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.questions;
  } catch (error) {
    console.error('Error generating quiz:', error);
    throw new Error('Failed to generate quiz questions');
  }
};

// Generate real-world applications
export const generateApplications = async (
  paperContent: string,
  apiKey: string
): Promise<{
  projectIdeas: string[];
  industryApplications: string[];
  researchDirections: string[];
  blogTopics: string[];
}> => {
  try {
    const response = await fetch('/api/generate-applications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content: paperContent,
        apiKey: apiKey,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.applications;
  } catch (error) {
    console.error('Error generating applications:', error);
    throw new Error('Failed to generate applications');
  }
}; 