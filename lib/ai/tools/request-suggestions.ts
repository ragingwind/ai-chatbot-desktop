import { z } from 'zod';
import type { Session } from 'next-auth';
import { type DataStreamWriter, streamObject, tool } from 'ai';
import { getDocumentById, saveSuggestions } from '@/lib/db/queries';
import type { Suggestion } from '@/lib/db/schema';
import { generateUUID } from '@/lib/utils';
import { getProviderById } from '../providers';

interface RequestSuggestionsProps {
  session: Session;
  dataStream: DataStreamWriter;
  selectedProvider?: string;
}

export const requestSuggestions = ({
  session,
  dataStream,
  selectedProvider,
}: RequestSuggestionsProps) =>
  tool({
    description: 'Request suggestions for a document',
    parameters: z.object({
      documentId: z
        .string()
        .describe('The ID of the document to request edits'),
    }),
    execute: async ({ documentId }) => {
      const document = await getDocumentById({ id: documentId });

      if (!document || !document.content) {
        return {
          error: 'Document not found',
        };
      }

      const suggestions: Array<
        Omit<Suggestion, 'userId' | 'createdAt' | 'documentCreatedAt'>
      > = [];

      const provider = getProviderById(selectedProvider || 'anthropic');
      const { elementStream } = streamObject({
        model: provider.languageModel('artifact-model'),
        system:
          'You are a help writing assistant. Given a piece of writing, please offer suggestions to improve the piece of writing and describe the change. It is very important for the edits to contain full sentences instead of just words. Max 5 suggestions.',
        prompt: document.content,
        output: 'array',
        schema: z.object({
          originalSentence: z.string().describe('The original sentence'),
          suggestedSentence: z.string().describe('The suggested sentence'),
          description: z.string().describe('The description of the suggestion'),
        }),
      });

      for await (const element of elementStream) {
        const suggestion = {
          originalText: element.originalSentence,
          suggestedText: element.suggestedSentence,
          description: element.description,
          id: generateUUID(),
          documentId: documentId,
          isResolved: false,
        };

        dataStream.writeData({
          type: 'suggestion',
          content: suggestion,
        });

        suggestions.push(suggestion);
      }

      if (session.user?.id) {
        const userId = session.user.id;

        await saveSuggestions({
          suggestions: suggestions.map((suggestion) => ({
            ...suggestion,
            userId,
            createdAt: new Date(),
            documentCreatedAt: document.createdAt,
          })),
        });
      }

      return {
        id: documentId,
        title: document.title,
        kind: document.kind,
        message: 'Suggestions have been added to the document',
      };
    },
  });
