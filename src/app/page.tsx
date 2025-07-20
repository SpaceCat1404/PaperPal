"use client";

import React, { useState } from 'react';
import type { ChangeEvent, DragEvent } from 'react';
import {
  Upload, FileText, Image, BookOpen, HelpCircle, Lightbulb, Download, History, Search, Sparkles, Clock, Key
} from 'lucide-react';

// Types for paper data and figures
type Figure = {
  id: number;
  title: string;
  description: string;
  url: string;
};

type PaperData = {
  title: string;
  authors: string;
  abstract: string;
  simplifiedSummary: string;
  keyPoints: string[];
  figures: Figure[];
  extractedText?: string;
  deepDive?: {
    methodology: string;
    results: string;
    implications: string;
    technicalDetails: string;
    context: string;
  };
};

type QuizQuestion = {
  id: number;
  type: 'multiple-choice' | 'text';
  question: string;
  options?: string[];
  correctAnswer?: number;
  correctKeywords?: string[];
  explanation: string;
};

type Applications = {
  projectIdeas: string[];
  industryApplications: string[];
  researchDirections: string[];
  blogTopics: string[];
};

const PaperPal = () => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [paperData, setPaperData] = useState<PaperData | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [extractedText, setExtractedText] = useState('');
  const [processingStage, setProcessingStage] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [applications, setApplications] = useState<Applications | null>(null);
  // Add skill level state
  const [skillLevel, setSkillLevel] = useState<'undergraduate' | 'highschool' | 'graduate'>('undergraduate');

  const steps = [
    { icon: FileText, title: "Summary & Visuals", description: "Simplified overview with key points and visual elements" },
    { icon: BookOpen, title: "Deep Dive", description: "Detailed concept explanations and analysis" },
    { icon: HelpCircle, title: "Quiz", description: "Test your understanding with generated questions" },
    { icon: Lightbulb, title: "Applications", description: "Real-world use cases and practical applications" }
  ];

  // Extract text from PDF
  const extractTextFromPDF = async (file: File): Promise<string> => {
    if (typeof window === 'undefined') {
      return '';
    }

    // @ts-expect-error: No type declarations for ESM build
    const pdfjsLib = await import('pdfjs-dist/build/pdf.mjs');
    // Set the workerSrc to the public path (make sure public/pdf.worker.mjs exists)
    pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.mjs';

    try {
      setProcessingStage('Extracting text from PDF...');
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

      let fullText = '';
      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const content = await page.getTextContent();
        const pageText = content.items.map((item: any) => item.str).join(' ');
        fullText += pageText + '\n\n';
      }

      setExtractedText(fullText);
      return fullText;
    } catch (error) {
      console.error('Error extracting text from PDF:', error);
      return '';
    }
  };

  // Generate content using LLM API
  const generateContentFromText = async (text: string, skillLevel: string): Promise<PaperData> => {
    setProcessingStage('Analyzing content and generating summary...');
    
    try {
      const response = await fetch('/api/generate-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text,
          apiKey: apiKey,
          skillLevel: skillLevel,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Generated content:', data);
      
      if (data.error) {
        console.error('API returned error:', data.error);
        throw new Error(data.error);
      }
      
      return data;
    } catch (error) {
      console.error('Error generating content:', error);
      // Fallback to mock data
      return {
        title: "Research Paper",
        authors: "Authors",
        abstract: "Abstract extracted from the paper.",
        simplifiedSummary: "This paper presents important findings in the field.",
        keyPoints: [
          "Key finding 1",
          "Key finding 2", 
          "Key finding 3",
          "Key finding 4"
        ],
        figures: [
          {
            id: 1,
            title: "Main Concept",
            description: "Visual representation of the main concept",
            url: "https://via.placeholder.com/400x300/3B82F6/FFFFFF?text=Main+Concept"
          }
        ],
        deepDive: {
          methodology: "The research employs systematic analysis and experimental validation to establish its findings.",
          results: "The study demonstrates significant improvements in the target domain with supporting evidence.",
          implications: "These findings have important implications for future research and practical applications.",
          technicalDetails: "The research introduces innovative approaches and technical solutions to address the problem domain.",
          context: "This work builds upon existing literature and addresses important gaps in current understanding."
        }
      };
    }
  };

  // Generate quiz questions
  const generateQuizQuestions = async (content: string): Promise<QuizQuestion[]> => {
    setProcessingStage('Generating quiz questions...');
    
    try {
      const response = await fetch('/api/generate-quiz', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: content,
          apiKey: apiKey,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Generated quiz:', data);
      return data.questions;
    } catch (error) {
      console.error('Error generating quiz:', error);
      // Fallback questions
      return [
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
      ];
    }
  };

  // Generate applications
  const generateApplications = async (content: string): Promise<Applications> => {
    setProcessingStage('Generating real-world applications...');
    
    try {
      const response = await fetch('/api/generate-applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: content,
          apiKey: apiKey,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Generated applications:', data);
      return data.applications;
    } catch (error) {
      console.error('Error generating applications:', error);
      // Fallback applications
      return {
        projectIdeas: [
          "Build a proof-of-concept implementation",
          "Create a visualization tool for the concepts",
          "Develop a comparison framework"
        ],
        industryApplications: [
          "Apply to real-world problem domain",
          "Integrate with existing systems",
          "Scale for production use"
        ],
        researchDirections: [
          "Extend the methodology",
          "Apply to different domains",
          "Improve efficiency and performance"
        ],
        blogTopics: [
          "Understanding the key concepts",
          "Practical implementation guide",
          "Future implications and trends"
        ]
      };
    }
  };

  // Add a function to fetch relevant images from the web
  const fetchRelevantImages = async (query: string): Promise<string[]> => {
    setProcessingStage('Fetching relevant diagrams and flowcharts...');
    try {
      const response = await fetch(`/api/fetch-images`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });
      if (!response.ok) throw new Error('Image fetch failed');
      const data = await response.json();
      return data.images || [];
    } catch (e) {
      console.error('Image fetch error:', e);
      return [];
    }
  };

  const handleFileUpload = async (file: File | undefined) => {
    if (file && file.type === 'application/pdf') {
      if (!apiKey) {
        setShowApiKeyInput(true);
        return;
      }
      
      setUploadedFile(file);
      setIsProcessing(true);
      setProcessingStage('Preparing to process your paper...');
      
      try {
        // Extract text from PDF
        const extractedText = await extractTextFromPDF(file);

        // Generate content using LLM
        const generatedContent = await generateContentFromText(extractedText, skillLevel);
        // Fetch relevant images
        const images = await fetchRelevantImages(`${generatedContent.title} ${generatedContent.keyPoints?.join(' ')} diagram flowchart`);
        // Combine all data
        const paperData: PaperData = {
          ...generatedContent,
          extractedText: extractedText,
          figures: images.map((url, idx) => ({
            id: idx + 1,
            title: `Relevant Diagram ${idx + 1}`,
            description: 'Diagram or flowchart relevant to the paper',
            url,
          })),
        };

        setPaperData(paperData);

        // Try to generate quiz questions (don't fail if this doesn't work)
        try {
          const quizData = await generateQuizQuestions(extractedText);
          setQuizQuestions(quizData);
        } catch (error) {
          console.warn('Quiz generation failed, using fallback:', error);
          // Keep the fallback quiz questions
        }

        // Try to generate applications (don't fail if this doesn't work)
        try {
          const applicationsData = await generateApplications(extractedText);
          setApplications(applicationsData);
        } catch (error) {
          console.warn('Applications generation failed, using fallback:', error);
          // Keep the fallback applications
        }
        setIsProcessing(false);
        setCurrentStep(1);

      } catch (error) {
        console.error('Error processing paper:', error);
        setIsProcessing(false);
        alert('Error processing the paper. Please try again.');
      }
    } else {
      alert('Please upload a PDF file.');
    }
  };

  const handleApiKeySubmit = () => {
    if (apiKey.trim()) {
      setShowApiKeyInput(false);
      if (uploadedFile) {
        handleFileUpload(uploadedFile);
      }
    } else {
      alert('Please enter a valid API key.');
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    handleFileUpload(file);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
  };

  const ApiKeyModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex items-center space-x-2 mb-4">
          <Key className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Enter API Key</h3>
        </div>
        <p className="text-gray-600 mb-4">
          To process your research paper and generate dynamic content, we need an OpenRouter API key.
        </p>
        <input
          type="password"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="sk-or-..."
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4"
        />
        <div className="flex space-x-3">
          <button
            onClick={() => setShowApiKeyInput(false)}
            className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
          >
            Cancel
          </button>
          <button
            onClick={handleApiKeySubmit}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );

  const UploadSection = () => (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-amber-900 mb-4">PaperPal</h1>
        <p className="text-xl text-amber-700">Transform complex research papers into digestible insights</p>
      </div>
      
      <div
        className={`border-2 border-dashed rounded-xl p-12 text-center transition-all duration-200 ${
          dragOver ? 'border-orange-400 bg-orange-50' : 'border-amber-300 hover:border-amber-400'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <Upload className="mx-auto h-12 w-12 text-amber-500 mb-4" />
        <h3 className="text-lg font-semibold text-amber-900 mb-2">Upload Research Paper</h3>
        <p className="text-amber-700 mb-4">Drag and drop your PDF file here, or click to browse</p>
        <input
          type="file"
          accept=".pdf"
          onChange={(e: ChangeEvent<HTMLInputElement>) => handleFileUpload(e.target.files?.[0])}
          className="hidden"
          id="file-upload"
        />
        <label
          htmlFor="file-upload"
          className="inline-flex items-center px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 cursor-pointer transition-colors"
        >
          Choose File
        </label>
      </div>
      
      {!apiKey && (
        <div className="mt-6 text-center">
          <button
            onClick={() => setShowApiKeyInput(true)}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Key size={16} />
            <span>Add API Key</span>
          </button>
        </div>
      )}
    </div>
  );

  const ProcessingSection = () => (
    <div className="max-w-2xl mx-auto text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
      <h3 className="text-lg font-semibold text-amber-900 mb-2">Processing Your Paper</h3>
      <p className="text-amber-700">{processingStage}</p>
      <div className="mt-4 bg-amber-50 rounded-lg p-4">
        <p className="text-sm text-amber-600">This may take a moment as we analyze your document...</p>
      </div>
    </div>
  );

  const StepNavigation = () => (
    <div className="flex justify-center mb-8">
      <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
        {steps.map((step, index) => {
          const Icon = step.icon;
          return (
            <button
              key={index}
              onClick={() => setCurrentStep(index + 1)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-all ${
                currentStep === index + 1
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              type="button"
            >
              <Icon size={16} />
              <span className="hidden sm:inline">{step.title}</span>
            </button>
          );
        })}
      </div>
    </div>
  );

  const SkillLevelSelector = () => (
    <div className="flex justify-center mb-6">
      <label className="mr-2 font-medium text-gray-700">Explain for:</label>
      <select
        value={skillLevel}
        onChange={e => setSkillLevel(e.target.value as any)}
        className="p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
      >
        <option value="highschool">High School Student</option>
        <option value="undergraduate">Undergraduate Student</option>
        <option value="graduate">Graduate Student</option>
      </select>
    </div>
  );

  const SummarySection = () => {
    if (!paperData) {
      return (
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Summary Available</h3>
            <p className="text-gray-600">Summary and visuals will be generated once you upload a research paper.</p>
          </div>
        </div>
      );
    }

    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center space-x-2 mb-4">
            <Sparkles className="h-5 w-5 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">{paperData?.title}</h2>
          </div>
          <p className="text-gray-600 mb-4">by {paperData?.authors}</p>
          
          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-blue-900 mb-2">Simplified Summary</h3>
            <p className="text-blue-800">{paperData?.simplifiedSummary}</p>
          </div>
          
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">Key Points</h3>
            <div className="space-y-2">
              {paperData?.keyPoints?.map((point, index) => (
                <div key={index} className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-gray-700">{point}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Visual Elements Section */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Image className="h-5 w-5 text-green-600" />
              <h3 className="text-xl font-semibold text-gray-900">Visual Elements</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {paperData?.figures?.map((figure) => (
                <div key={figure.id} className="bg-gray-50 rounded-lg p-4">
                  <img
                    src={figure.url}
                    alt={figure.title}
                    className="w-full h-40 object-cover rounded-lg mb-3"
                  />
                  <h4 className="font-semibold text-gray-900 mb-2">{figure.title}</h4>
                  <p className="text-sm text-gray-600">{figure.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const DeepDiveSection = () => {
    if (!paperData) {
      return (
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Analysis Available</h3>
            <p className="text-gray-600">Deep dive analysis will be generated once you upload a research paper.</p>
          </div>
        </div>
      );
    }

    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-2 mb-6">
            <BookOpen className="h-5 w-5 text-purple-600" />
            <h2 className="text-2xl font-bold text-gray-900">Deep Dive Analysis</h2>
          </div>
          
          <div className="space-y-8">
            {/* Core Concepts */}
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-purple-900 mb-4">Core Concepts Explained</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-purple-800 mb-2">Research Overview</h4>
                  <p className="text-purple-700">{paperData?.abstract}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-purple-800 mb-2">Key Contributions</h4>
                  <div className="space-y-2">
                    {paperData?.keyPoints?.map((point, index) => (
                      <div key={index} className="flex items-start space-x-2">
                        <div className="w-2 h-2 bg-purple-600 rounded-full mt-2 flex-shrink-0"></div>
                        <p className="text-purple-700">{point}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Technical Details */}
            <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-blue-900 mb-4">Technical Analysis</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-blue-800 mb-2">Methodology</h4>
                  <p className="text-blue-700">{paperData?.deepDive?.methodology || "The research employs systematic analysis and experimental validation to establish its findings."}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-blue-800 mb-2">Results</h4>
                  <p className="text-blue-700">{paperData?.deepDive?.results || "The study demonstrates significant improvements in the target domain with supporting evidence."}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-blue-800 mb-2">Technical Details</h4>
                  <p className="text-blue-700">{paperData?.deepDive?.technicalDetails || "The research introduces innovative approaches and technical solutions to address the problem domain."}</p>
                </div>
              </div>
            </div>

            {/* Historical Context */}
            <div className="bg-gradient-to-r from-green-50 to-yellow-50 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-green-900 mb-4">Context & Impact</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-green-800 mb-2">Research Context</h4>
                  <p className="text-green-700">{paperData?.deepDive?.context || "This work builds upon existing literature and addresses important gaps in current understanding."}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-green-800 mb-2">Practical Impact</h4>
                  <p className="text-green-700">{paperData?.deepDive?.implications || "The research has direct applications in real-world scenarios and industry settings."}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-green-800 mb-2">Future Directions</h4>
                  <p className="text-green-700">This work opens up new avenues for further research and development in the field, building upon the foundation established by these findings.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const QuizSection = () => {
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState<{[key: number]: string | number}>({});
    const [showResults, setShowResults] = useState(false);

    const handleAnswerChange = (questionId: number, answer: string | number) => {
      setAnswers(prev => ({
        ...prev,
        [questionId]: answer
      }));
    };

    const checkAnswer = (question: QuizQuestion, userAnswer: string | number) => {
      if (question.type === 'multiple-choice') {
        return userAnswer === question.correctAnswer;
      } else if (question.type === 'text') {
        const userAnswerStr = typeof userAnswer === 'string' ? userAnswer.toLowerCase() : '';
        return question.correctKeywords?.some((keyword: string) => 
          userAnswerStr.includes(keyword.toLowerCase())
        ) || false;
      }
      return false;
    };

    const calculateScore = () => {
      let correct = 0;
      quizQuestions.forEach(question => {
        if (answers[question.id] && checkAnswer(question, answers[question.id])) {
          correct++;
        }
      });
      return { correct, total: quizQuestions.length, percentage: Math.round((correct / quizQuestions.length) * 100) };
    };

    const renderQuestion = (question: QuizQuestion) => {
      if (question.type === 'multiple-choice') {
        return (
          <div className="space-y-3">
            {question.options?.map((option: string, index: number) => (
              <label key={index} className="flex items-center space-x-3 p-3 bg-white rounded-lg border hover:bg-gray-50 cursor-pointer">
                <input
                  type="radio"
                  name={`q${question.id}`}
                  value={index}
                  checked={answers[question.id] === index}
                  onChange={(e) => handleAnswerChange(question.id, parseInt(e.target.value))}
                  className="text-blue-600"
                />
                <span className="text-gray-700">{option}</span>
              </label>
            ))}
          </div>
        );
      } else if (question.type === 'text') {
        return (
          <textarea
            className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={4}
            placeholder="Type your answer here..."
            value={answers[question.id] as string || ''}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
          />
        );
      }
      return null;
    };

    const renderResults = () => {
      const score = calculateScore();
      return (
        <div className="space-y-6">
          <div className="text-center">
            <div className="text-4xl font-bold text-blue-600 mb-2">{score.percentage}%</div>
            <div className="text-lg text-gray-600">You got {score.correct} out of {score.total} questions correct!</div>
            {score.percentage >= 80 && (
              <div className="text-green-600 font-semibold mt-2">Excellent understanding! 🎉</div>
            )}
            {score.percentage >= 60 && score.percentage < 80 && (
              <div className="text-yellow-600 font-semibold mt-2">Good work! Keep studying! 📚</div>
            )}
            {score.percentage < 60 && (
              <div className="text-red-600 font-semibold mt-2">Review the concepts and try again! 💪</div>
            )}
          </div>
          
          <div className="space-y-4">
            {quizQuestions.map((question, index) => (
              <div key={question.id} className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-3">
                  <span className="text-sm font-medium text-gray-500">Question {index + 1}</span>
                  {answers[question.id] && checkAnswer(question, answers[question.id]) ? (
                    <span className="text-green-600 text-sm">✓ Correct</span>
                  ) : answers[question.id] ? (
                    <span className="text-red-600 text-sm">✗ Incorrect</span>
                  ) : (
                    <span className="text-gray-400 text-sm">Not answered</span>
                  )}
                </div>
                <h4 className="font-semibold text-gray-900 mb-3">{question.question}</h4>
                {answers[question.id] && (
                  <div className="mb-3">
                    <div className="text-sm text-gray-600 mb-1">Your answer:</div>
                    <div className="bg-white p-2 rounded border">
                      {typeof answers[question.id] === 'string' ? answers[question.id] : 
                       question.options?.[answers[question.id] as number] || 'Invalid answer'}
                    </div>
                  </div>
                )}
                <div className="bg-blue-50 p-3 rounded">
                  <div className="text-sm font-medium text-blue-900 mb-1">Explanation:</div>
                  <div className="text-sm text-blue-800">{question.explanation}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    };

    if (quizQuestions.length === 0) {
      return (
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
            <HelpCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Quiz Available</h3>
            <p className="text-gray-600">Quiz questions will be generated once you upload a research paper.</p>
          </div>
        </div>
      );
    }

    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <HelpCircle className="h-5 w-5 text-orange-600" />
              <h2 className="text-2xl font-bold text-gray-900">Knowledge Check</h2>
            </div>
            {!showResults && (
              <div className="text-sm text-gray-500">
                Question {currentQuestion + 1} of {quizQuestions.length}
              </div>
            )}
          </div>
          
          {!showResults ? (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-orange-900 mb-4">
                  {quizQuestions[currentQuestion].question}
                </h3>
                {renderQuestion(quizQuestions[currentQuestion])}
              </div>
              
              <div className="flex justify-between">
                <button
                  onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
                  disabled={currentQuestion === 0}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600"
                >
                  Previous
                </button>
                
                {currentQuestion < quizQuestions.length - 1 ? (
                  <button
                    onClick={() => setCurrentQuestion(currentQuestion + 1)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Next
                  </button>
                ) : (
                  <button
                    onClick={() => setShowResults(true)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Submit Quiz
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div>
              {renderResults()}
              <div className="mt-6 text-center">
                <button
                  onClick={() => {
                    setShowResults(false);
                    setCurrentQuestion(0);
                    setAnswers({});
                  }}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Retake Quiz
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const ApplicationsSection = () => {
    if (!applications) {
      return (
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
            <Lightbulb className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Applications Available</h3>
            <p className="text-gray-600">Real-world applications will be generated once you upload a research paper.</p>
          </div>
        </div>
      );
    }

    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-2 mb-6">
            <Lightbulb className="h-5 w-5 text-yellow-600" />
            <h2 className="text-2xl font-bold text-gray-900">Real-World Applications</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">Project Ideas</h3>
              <ul className="text-blue-800 space-y-1">
                {applications.projectIdeas.map((idea, index) => (
                  <li key={index}>• {idea}</li>
                ))}
              </ul>
            </div>
            
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4">
              <h3 className="font-semibold text-green-900 mb-2">Industry Applications</h3>
              <ul className="text-green-800 space-y-1">
                {applications.industryApplications.map((app, index) => (
                  <li key={index}>• {app}</li>
                ))}
              </ul>
            </div>
            
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4">
              <h3 className="font-semibold text-purple-900 mb-2">Research Directions</h3>
              <ul className="text-purple-800 space-y-1">
                {applications.researchDirections.map((direction, index) => (
                  <li key={index}>• {direction}</li>
                ))}
              </ul>
            </div>
            
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4">
              <h3 className="font-semibold text-orange-900 mb-2">Blog Topics</h3>
              <ul className="text-orange-800 space-y-1">
                {applications.blogTopics.map((topic, index) => (
                  <li key={index}>• {topic}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const HistorySidebar = () => (
    <div className={`fixed left-0 top-0 h-full w-80 bg-white shadow-lg transform transition-transform duration-300 z-50 ${
      showHistory ? 'translate-x-0' : '-translate-x-full'
    }`}>
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">History</h2>
          <button
            onClick={() => setShowHistory(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            ×
          </button>
        </div>
      </div>
      
      <div className="p-4 space-y-3">
        {paperData ? (
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center space-x-2 mb-1">
              <Clock size={14} className="text-gray-500" />
              <span className="text-sm text-gray-500">Just now</span>
            </div>
            <h3 className="font-medium text-gray-900">{paperData.title}</h3>
            <p className="text-sm text-gray-600">by {paperData.authors}</p>
          </div>
        ) : (
          <div className="text-center text-gray-500 py-8">
            <History size={24} className="mx-auto mb-2" />
            <p className="text-sm">No papers processed yet</p>
            <p className="text-xs">Upload a paper to see it here</p>
          </div>
        )}
      </div>
    </div>
  );

  const Header = () => (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="p-2 text-gray-500 hover:text-gray-700 rounded-md"
            >
              <History size={20} />
            </button>
            <h1 className="text-xl font-bold text-gray-900">PaperPal</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <Download size={16} />
              <span>Export</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );

  const renderCurrentStep = () => {
    if (isProcessing) return <ProcessingSection />;
    switch (currentStep) {
      case 0:
        return <UploadSection />;
      case 1:
        return <SummarySection />;
      case 2:
        return <DeepDiveSection />;
      case 3:
        return <QuizSection />;
      case 4:
        return <ApplicationsSection />;
      default:
        return <UploadSection />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <HistorySidebar />
      {showApiKeyInput && <ApiKeyModal />}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {paperData && !isProcessing && <SkillLevelSelector />}
        {paperData && !isProcessing && <StepNavigation />}
        {renderCurrentStep()}
      </main>
    </div>
  );
};

export default PaperPal;