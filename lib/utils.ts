import type { CoreAssistantMessage, CoreToolMessage, UIMessage } from 'ai';
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { Document } from '@/lib/db/schema';
import { ChatSDKError, type ErrorCode } from './errors';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const fetcher = async (url: string) => {
  const response = await fetch(url);

  if (!response.ok) {
    const { code, cause } = await response.json();
    throw new ChatSDKError(code as ErrorCode, cause);
  }

  return response.json();
};

export async function fetchWithErrorHandlers(
  input: RequestInfo | URL,
  init?: RequestInit,
) {
  try {
    const response = await fetch(input, init);

    if (!response.ok) {
      const { code, cause } = await response.json();
      throw new ChatSDKError(code as ErrorCode, cause);
    }

    return response;
  } catch (error: unknown) {
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      throw new ChatSDKError('offline:chat');
    }

    throw error;
  }
}

export function getLocalStorage(key: string) {
  if (typeof window !== 'undefined') {
    return JSON.parse(localStorage.getItem(key) || '[]');
  }
  return [];
}

export function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

type ResponseMessageWithoutId = CoreToolMessage | CoreAssistantMessage;
type ResponseMessage = ResponseMessageWithoutId & { id: string };

export function getMostRecentUserMessage(messages: Array<UIMessage>) {
  const userMessages = messages.filter((message) => message.role === 'user');
  return userMessages.at(-1);
}

export function getDocumentTimestampByIndex(
  documents: Array<Document>,
  index: number,
) {
  if (!documents) return new Date();
  if (index > documents.length) return new Date();

  return documents[index].createdAt;
}

export function getTrailingMessageId({
  messages,
}: {
  messages: Array<ResponseMessage>;
}): string | null {
  const trailingMessage = messages.at(-1);

  if (!trailingMessage) return null;

  return trailingMessage.id;
}

export function sanitizeText(text: string) {
  return text.replace('<has_function_call>', '');
}

export function formatJSON(jsonString: string) {
  try {
    return JSON.stringify(jsonString, null, 2);
  } catch (e) {
    return jsonString;
  }
}

export function formatToolContent(result?: any) {
  if (result && typeof result === 'object') {
    if (result.content) {
      if (typeof result.content === 'object') {
        if (Array.isArray(result.content)) {
          return result.content
            .map((item: any) => {
              if (item.type && item.type === 'text') {
                return item.text;
              } else {
                return JSON.stringify(item, null, 2);
              }
            })
            .join('\n');
        } else {
          return JSON.stringify(result.content, null, 2);
        }
      } else if (typeof result.content === 'string') {
        return result.content;
      } else {
        return 'Unknwown content type';
      }
    } else {
      return JSON.stringify(result, null, 2);
    }
  }

  return '';
}

export function extractMCPToolNameFromString(message: string): string[] {
  const regex = /@(\w+)/g;
  const matches = message.match(regex);
  if (!matches) {
    return [];
  }
  return matches.map((match) => match.replace('@', ''));
}

type DeepMerge<T, U> = {
  [K in keyof T | keyof U]: K extends keyof U
    ? K extends keyof T
      ? T[K] extends object
        ? U[K] extends object
          ? DeepMerge<T[K], U[K]>
          : U[K]
        : U[K]
      : U[K]
    : K extends keyof T
      ? T[K]
      : never;
};

export function deepMerge<
  T extends Record<string, any>,
  U extends Record<string, any>,
>(target: T, source: U): DeepMerge<T, U>;

export function deepMerge<T extends Record<string, any>>(
  target: T,
  ...sources: Array<Record<string, any>>
): T;

export function deepMerge<T extends Record<string, any>>(
  target: T,
  ...sources: Array<Record<string, any>>
): any {
  // Create deep copy to avoid mutation
  const result = structuredClone(target);

  for (const source of sources) {
    const sourceCopy = structuredClone(source);
    mergeInto(result, sourceCopy);
  }

  return result;
}

function mergeInto(
  target: Record<string, any>,
  source: Record<string, any>,
): void {
  for (const key in source) {
    if (Object.prototype.hasOwnProperty.call(source, key)) {
      const sourceValue = source[key];
      const targetValue = target[key];

      if (isObject(sourceValue) && isObject(targetValue)) {
        mergeInto(targetValue, sourceValue);
      } else {
        target[key] = sourceValue;
      }
    }
  }
}

function isObject(item: unknown): item is Record<string, any> {
  return item !== null && typeof item === 'object' && !Array.isArray(item);
}
