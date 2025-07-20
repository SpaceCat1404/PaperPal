import { NextRequest, NextResponse } from 'next/server';
import { LLM_CONFIG, getModelConfig, getHeaders } from '@/config/llm';

export async function POST(request: NextRequest) {
  try {
    const { text, apiKey } = await request.json();

    if (!text || !apiKey) {
      return NextResponse.json(
        { error: 'Missing required fields: text and apiKey' },
        { status: 400 }
      );
    }

    // Use OpenRouter API (provides access to multiple LLM models)
    const openrouterResponse = await fetch(LLM_CONFIG.baseUrl, {
      method: 'POST',
      headers: getHeaders(apiKey),
      body: JSON.stringify({
        ...getModelConfig(), // Uses default model and settings
        messages: [
          {
            role: 'system',
            content: `You are an expert research paper analyzer. Extract and structure the following information from the provided research paper text:

1. Title: Extract the paper title
2. Authors: Extract author names
3. Abstract: Extract or summarize the abstract
4. Simplified Summary: Create a clear, non-technical summary (2-3 sentences)
5. Key Points: Extract 4-6 main points from the paper
6. Visual Elements: Suggest 2-3 relevant figures/diagrams that would help explain the concepts
7. Deep Dive Analysis: Provide detailed analysis in these categories:
   - Methodology: Detailed explanation of the research methods used
   - Results: Key findings and experimental outcomes
   - Implications: Practical and theoretical implications of the research
   - Technical Details: Important technical aspects and innovations
   - Context: How this research fits into the broader field

Format your response as JSON with the following structure:
{
  "title": "Paper Title",
  "authors": "Author Names",
  "abstract": "Abstract text",
  "simplifiedSummary": "Simple explanation",
  "keyPoints": ["Point 1", "Point 2", "Point 3", "Point 4"],
  "figures": [
    {
      "id": 1,
      "title": "Figure Title",
      "description": "Description of what this figure shows",
      "url": "https://via.placeholder.com/400x300/3B82F6/FFFFFF?text=Figure+1"
    }
  ],
  "deepDive": {
    "methodology": "Detailed explanation of the research methodology...",
    "results": "Key findings and experimental results...",
    "implications": "Practical and theoretical implications...",
    "technicalDetails": "Important technical aspects and innovations...",
    "context": "How this research fits into the broader field..."
  }
}`
          },
          {
            role: 'user',
            content: text
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
    console.log('OpenRouter API response:', openrouterData);
    
    const content = openrouterData.choices[0].message.content;
    console.log('LLM generated content:', content);

    // Parse the JSON response from the LLM
    let parsedContent;
    try {
      parsedContent = JSON.parse(content);
      console.log('Successfully parsed JSON:', parsedContent);
    } catch (parseError) {
      console.error('JSON parsing error:', parseError);
      console.log('Raw content that failed to parse:', content);
      
      // If parsing fails, create a fallback structure
      parsedContent = {
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

    return NextResponse.json(parsedContent);
  } catch (error) {
    console.error('Error in generate-content API:', error);
    return NextResponse.json(
      { error: 'Failed to generate content' },
      { status: 500 }
    );
  }
} 