import {
  customProvider,
  extractReasoningMiddleware,
  wrapLanguageModel,
} from 'ai';
import { xai } from '@ai-sdk/xai';
import { anthropic } from '@ai-sdk/anthropic';
import { ollama } from 'ollama-ai-provider';
import { isTestEnvironment } from '../constants';
import {
  artifactModel,
  chatModel,
  reasoningModel,
  titleModel,
} from './models.test';

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

export const ollamaProvider = isTestEnvironment
  ? textModel
  : customProvider({
      languageModels: {
        'chat-model': ollama(process.env.OLLAMA_CHAT_MODEL || 'llama3'),
        'chat-model-reasoning': wrapLanguageModel({
          model: ollama(process.env.OLLAMA_CHAT_MODEL || 'llama3'),
          middleware: extractReasoningMiddleware({ tagName: 'think' }),
        }),
        'title-model': ollama(process.env.OLLAMA_CHAT_MODEL || 'llama3'),
        'artifact-model': ollama(process.env.OLLAMA_CHAT_MODEL || 'llama3'),
      },
    });

const providers = {
  anthropic: anthropicProvider,
  xai: xaiProvider,
  ollama: ollamaProvider,
};

export const myProvider =
  providers[(process.env.AI_PROVIDER as keyof typeof providers) || 'anthropic'];
