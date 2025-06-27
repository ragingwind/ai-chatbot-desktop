import type { UserType } from '@/app/(auth)/auth';
import type { ChatModel } from './models';

interface Entitlements {
  maxMessagesPerDay: number;
  availableChatModelIds: Array<ChatModel['id']>;
  availableProviderIds: Array<string>;
}

export const entitlementsByUserType: Record<UserType, Entitlements> = {
  /*
   * For users without an account
   */
  guest: {
    maxMessagesPerDay: 100,
    availableChatModelIds: ['chat-model', 'chat-model-reasoning'],
    availableProviderIds: ['anthropic', 'xai', 'ollama', 'webllm'],
  },

  /*
   * For users with an account
   */
  regular: {
    maxMessagesPerDay: 100,
    availableChatModelIds: ['chat-model', 'chat-model-reasoning'],
    availableProviderIds: ['anthropic', 'xai', 'ollama', 'webllm'],
  },

  /*
   * TODO: For users with an account and a paid membership
   */
};
