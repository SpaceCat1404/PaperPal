# PaperPal - Research Paper Analysis Platform

PaperPal is a comprehensive platform that helps students and researchers understand and apply research papers through a 4-step process:

1. **Summarize with visuals** - Extract key information and generate relevant visual elements
2. **Deep-dive into concepts** - Detailed analysis and explanation of core concepts
3. **Quiz generation** - Interactive questions to test understanding
4. **Real-world applications** - Practical use cases and project ideas

## Features

- **PDF Upload & Text Extraction**: Upload research papers in PDF format
- **AI-Powered Analysis**: Uses OpenRouter (DeepSeek R1) to analyze and structure paper content
- **Dynamic Content Generation**: Creates summaries, quizzes, and applications specific to each paper
- **Interactive Quiz System**: Multiple-choice and text-based questions with scoring
- **Real-World Applications**: Project ideas, industry applications, and research directions
- **Modern UI**: Clean, responsive interface built with Next.js and Tailwind CSS

## Setup Instructions

### Prerequisites

- Node.js 18+ 
- npm or yarn
- OpenRouter API key

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd idea-platform
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Create environment file:
```bash
cp .env.local.example .env.local
```

4. Add your OpenRouter API key to `.env.local`:
```
OPENROUTER_API_KEY=your_openrouter_api_key_here
```

5. Run the development server:
```bash
npm run dev
# or
yarn dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

### OpenRouter API Key Setup

1. **Get an OpenRouter API key**:
   - Visit [OpenRouter](https://openrouter.ai/)
   - Sign up for an account
   - Navigate to the API Keys section
   - Create a new API key (starts with `sk-or-`)

2. **Add the API key in the application**:
   - When prompted during paper upload, or
   - Set it in your environment variables

3. **Available Models**: The application uses DeepSeek R1 by default, but you can change to any model OpenRouter supports:
   - `deepseek-ai/deepseek-r1` (default)
   - `anthropic/claude-3.5-sonnet`
   - `openai/gpt-4`
   - `google/gemini-pro`
   - `meta-llama/llama-3.1-8b-instruct`
   - And many more!

## Usage

1. **Upload Paper**: Drag and drop or select a PDF research paper
2. **Enter API Key**: Provide your OpenRouter API key for content generation
3. **Review Summary**: View the generated summary with key points and visual elements
4. **Deep Dive**: Explore detailed concept explanations and analysis
5. **Take Quiz**: Test your understanding with AI-generated questions
6. **Explore Applications**: Discover real-world use cases and project ideas

## Technical Architecture

- **Frontend**: Next.js 14 with TypeScript and Tailwind CSS
- **API Routes**: Next.js API routes for LLM integration
- **LLM Provider**: OpenRouter (DeepSeek R1) for content generation
- **PDF Processing**: Text extraction from PDF files (simulated)
- **State Management**: React hooks for local state

## API Endpoints

- `/api/generate-content` - Generate paper summary and structure
- `/api/generate-quiz` - Create quiz questions from paper content
- `/api/generate-applications` - Generate real-world applications

## Customization

### Changing the LLM Model

To use a different model, modify the `model` parameter in the API routes:

```typescript
// In src/app/api/generate-content/route.ts
model: 'openai/gpt-4', // Change to any OpenRouter model
```

### Popular OpenRouter Models

- `deepseek-ai/deepseek-r1` - Excellent for research analysis and reasoning
- `anthropic/claude-3.5-sonnet` - Strong general performance and analysis
- `openai/gpt-4` - Reliable and well-rounded capabilities
- `google/gemini-pro` - Good for technical content
- `meta-llama/llama-3.1-8b-instruct` - Fast and efficient

### Adding New LLM Providers

To use a different LLM provider entirely, modify the API routes in `src/app/api/`:

1. Update the API endpoint URL
2. Modify the request format
3. Adjust the response parsing

### Styling

The application uses Tailwind CSS for styling. Customize the design by modifying:
- Component styles in `src/app/page.tsx`
- Tailwind configuration in `tailwind.config.js`

### Content Generation

Customize the prompts used for content generation by modifying the system messages in:
- `src/app/api/generate-content/route.ts`
- `src/app/api/generate-quiz/route.ts`
- `src/app/api/generate-applications/route.ts`

## Why OpenRouter?

OpenRouter provides several advantages:

- **Multiple Models**: Access to 100+ LLM models through one API
- **Cost Effective**: Often cheaper than direct API access
- **Easy Switching**: Change models without code changes
- **Reliability**: Built-in fallbacks and redundancy
- **Analytics**: Usage tracking and cost monitoring

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For questions or issues, please open an issue on GitHub or contact the development team.
