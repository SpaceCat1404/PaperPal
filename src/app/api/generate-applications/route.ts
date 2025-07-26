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

    // Use OpenRouter API to generate applications
    const openrouterResponse = await fetch(LLM_CONFIG.baseUrl, {
      method: 'POST',
      headers: getHeaders(apiKey),
      body: JSON.stringify({
        ...getModelConfig(), // Uses default model and settings
        messages: [
          {
            role: 'system',
            content: `You are an expert in research applications and technology transfer. Based on the research paper content, generate practical applications appropriate for ${skillLevel} level students.

For high school students: Focus on simple, hands-on projects, basic industry applications, and introductory research concepts.
For undergraduate students: Focus on moderate complexity projects, practical industry applications, and intermediate research opportunities.
For graduate students: Focus on advanced projects, cutting-edge industry applications, and sophisticated research directions.

Generate practical applications in the following categories:

1. Project Ideas: 3-4 hands-on projects students can build
2. Industry Applications: 3-4 real-world industry use cases
3. Research Directions: 3-4 future research opportunities
4. Blog Topics: 3-4 engaging blog post ideas

Format your response as JSON:
{
  "applications": {
    "projectIdeas": [
      "Project idea 1",
      "Project idea 2",
      "Project idea 3"
    ],
    "industryApplications": [
      "Industry application 1",
      "Industry application 2",
      "Industry application 3"
    ],
    "researchDirections": [
      "Research direction 1",
      "Research direction 2",
      "Research direction 3"
    ],
    "blogTopics": [
      "Blog topic 1",
      "Blog topic 2",
      "Blog topic 3"
    ]
  }
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
    const applicationsContent = openrouterData.choices[0].message.content;

    // Parse the JSON response from the LLM
    let parsedApplications;
    try {
      parsedApplications = JSON.parse(applicationsContent);
    } catch (parseError) {
      // If parsing fails, create fallback applications
      parsedApplications = {
        applications: {
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
        }
      };
    }

    return NextResponse.json(parsedApplications);
  } catch (error) {
    console.error('Error in generate-applications API:', error);
    return NextResponse.json(
      { error: 'Failed to generate applications' },
      { status: 500 }
    );
  }
} 