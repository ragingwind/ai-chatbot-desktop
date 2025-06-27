import {
  customProvider,
  extractReasoningMiddleware,
  wrapLanguageModel,
} from 'ai';
import { xai } from '@ai-sdk/xai';
import { anthropic } from '@ai-sdk/anthropic';
import { createOpenAI } from '@ai-sdk/openai';
import { ollama } from 'ollama-ai-provider';
import { isTestEnvironment } from '../constants';
import {
  artifactModel,
  chatModel,
  reasoningModel,
  titleModel,
} from './models.test';

export const DEFAULT_PROVIDER: string = 'anthropic';

const textModel = customProvider({
  languageModels: {
    'chat-model': chatModel,
    'chat-model-reasoning': reasoningModel,
    'title-model': titleModel,
    'artifact-model': artifactModel,
  },
});

export const xaiProvider = isTestEnvironment
  ? textModel
  : customProvider({
      languageModels: {
        'chat-model': xai('grok-2-vision-1212'),
        'chat-model-reasoning': wrapLanguageModel({
          model: xai('grok-3-mini-beta'),
          middleware: extractReasoningMiddleware({ tagName: 'think' }),
        }),
        'title-model': xai('grok-2-1212'),
        'artifact-model': xai('grok-2-1212'),
      },
      imageModels: {
        'small-model': xai.image('grok-2-image'),
      },
    });

export const anthropicProvider = isTestEnvironment
  ? textModel
  : customProvider({
      languageModels: {
        'chat-model': anthropic('claude-3-7-sonnet-20250219'),
        'chat-model-reasoning': wrapLanguageModel({
          model: anthropic('claude-3-7-sonnet-20250219'),
          middleware: extractReasoningMiddleware({ tagName: 'think' }),
        }),
        'title-model': anthropic('claude-3-7-sonnet-20250219'),
        'artifact-model': anthropic('claude-3-7-sonnet-20250219'),
      },
    });

const ollamaModel = ollama(process.env.OLLAMA_MODEL || 'llama3');

export const ollamaProvider = isTestEnvironment
  ? textModel
  : customProvider({
      languageModels: {
        'chat-model': ollamaModel,
        'chat-model-reasoning': wrapLanguageModel({
          model: ollamaModel,
          middleware: extractReasoningMiddleware({ tagName: 'think' }),
        }),
        'title-model': ollamaModel,
        'artifact-model': ollamaModel,
      },
    });

const webllmModel =
  process.env.WEB_LLM_MODEL || 'Llama-3.2-1B-Instruct-q4f32_1-MLC';
const webllm = createOpenAI({
  baseURL: process.env.WEB_LLM_BASE_URL || 'http://localhost:15408/v1',
  apiKey: process.env.WEB_LLM_API_KEY || 'dummy',
});

export const webllmProvider = isTestEnvironment
  ? textModel
  : customProvider({
      languageModels: {
        'chat-model': webllm(webllmModel),
        'chat-model-reasoning': wrapLanguageModel({
          model: webllm(webllmModel),
          middleware: extractReasoningMiddleware({ tagName: 'think' }),
        }),
        'title-model': webllm(webllmModel),
        'artifact-model': webllm(webllmModel),
      },
    });

export const providers = {
  anthropic: {
    provider: anthropicProvider,
    name: 'Anthropic',
    description:
      'Claude models from Anthropic with advanced reasoning capabilities',
  },
  xai: {
    provider: xaiProvider,
    name: 'xAI',
    description: 'Grok models from xAI with vision and reasoning support',
  },
  ollama: {
    provider: ollamaProvider,
    name: 'Ollama',
    description: 'Local AI models running through Ollama',
  },
  webllm: {
    provider: webllmProvider,
    name: 'WebLLM',
    description: 'Browser-based AI models with WebLLM runtime',
  },
};

export function getProviderById(providerId: string) {
  return (
    providers[providerId as keyof typeof providers]?.provider ||
    providers.anthropic.provider
  );
}

export function getImageProviderById(providerId: string) {
  // Only xAI currently supports image generation
  const provider = providers[providerId as keyof typeof providers];
  if (provider?.provider && 'imageModel' in provider.provider) {
    return provider.provider;
  }
  // Fallback to xAI for image generation
  return providers.xai.provider;
}
