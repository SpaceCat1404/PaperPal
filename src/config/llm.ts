// LLM Configuration for PaperPal
// This file allows easy switching between different OpenRouter models

export const LLM_CONFIG = {
  // OpenRouter API Configuration
  baseUrl: 'https://openrouter.ai/api/v1/chat/completions',
  
  // Default model - you can change this to any model OpenRouter supports
  defaultModel: 'deepseek/deepseek-r1-0528:free',
  
  // Alternative models you can use
  models: {
    deepseekR1: 'deepseek/deepseek-r1-0528:free',
    deepseekCoder: 'deepseek-ai/deepseek-coder-33b-instruct',
    claude: 'anthropic/claude-3.5-sonnet',
    gpt4: 'openai/gpt-4',
    gemini: 'google/gemini-pro',
    llama: 'meta-llama/llama-3.1-8b-instruct',
    mistral: 'mistralai/mistral-7b-instruct',
    codellama: 'meta-llama/codellama-34b-instruct',
  },
  
  // Model-specific settings
  settings: {
    temperature: 0.3,
    maxTokens: 3000,
  },
  
  // Required headers for OpenRouter
  headers: {
    'Content-Type': 'application/json',
    'HTTP-Referer': 'http://localhost:3000',
    'X-Title': 'PaperPal',
  },
};

// Helper function to get model configuration
export const getModelConfig = (modelName?: string) => {
  const model = modelName || LLM_CONFIG.defaultModel;
  
  return {
    model,
    temperature: LLM_CONFIG.settings.temperature,
    max_tokens: LLM_CONFIG.settings.maxTokens,
  };
};

// Helper function to get headers
export const getHeaders = (apiKey: string) => {
  return {
    ...LLM_CONFIG.headers,
    'Authorization': `Bearer ${apiKey}`,
  };
}; 