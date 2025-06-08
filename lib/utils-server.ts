import {
  convertToCoreMessages,
  type DataStreamWriter,
  formatDataStreamPart,
  type Message,
  type ToolSet,
} from 'ai';
import { getMessageById, updateMessage } from './db/queries';
import { APPROVAL } from './types';

export function getTrailingAssistantMessage({
  messages,
}: { messages: Array<Message> }): Message | null {
  const assistantMessages = messages.filter(
    (message) => message.role === 'assistant',
  );
  return assistantMessages.at(-1) || null;
}

export async function processToolCalls({
  id,
  dataStream,
  messages,
  toolSet,
}: {
  id: string;
  dataStream: DataStreamWriter;
  messages: Message[];
  toolSet: ToolSet;
}): Promise<Message[]> {
  const lastMessage = messages[messages.length - 1];
  const parts = lastMessage.parts;

  if (!parts) {
    return messages;
  }

  const processedParts = await Promise.all(
    parts.map(async (part) => {
      if (part.type !== 'tool-invocation') {
        return part;
      }

      const { toolInvocation } = part;
      const toolName = toolInvocation.toolName;

      if (
        !(toolName in toolSet) ||
        !toolSet[toolName].execute ||
        toolInvocation.state !== 'result'
      ) {
        return part;
      }

      let result: any;

      if (toolInvocation.result === APPROVAL.YES) {
        const toolInstance = toolSet[toolName].execute;
        if (toolInstance) {
          result = await toolInstance(toolInvocation.args, {
            messages: convertToCoreMessages(messages),
            toolCallId: toolInvocation.toolCallId,
          });
        } else {
          result = 'Error: No execute function found on tool';
        }
      } else if (toolInvocation.result === APPROVAL.NO) {
        result = 'Error: User denied access to tool execution';
      } else {
        return part;
      }

      dataStream.write(
        formatDataStreamPart('tool_result', {
          toolCallId: toolInvocation.toolCallId,
          result,
        }),
      );

      return {
        ...part,
        toolInvocation: {
          ...toolInvocation,
          result,
        },
      };
    }),
  );

  const processedMessages = [
    ...messages.slice(0, -1),
    { ...lastMessage, parts: processedParts },
  ];

  const updated =
    lastMessage?.parts?.some(
      (part, index) =>
        JSON.stringify(part) !== JSON.stringify(processedParts[index]),
    ) ?? false;

  if (updated) {
    const message = processedMessages.at(-1);
    if (message?.id) {
      const prevMessages = await getMessageById({
        id: message?.id,
      });

      if (prevMessages) {
        await updateMessage({
          message: {
            chatId: id,
            id: message.id,
            role: message.role,
            parts: message.parts,
            attachments: message.experimental_attachments ?? [],
            createdAt: new Date(),
          },
        });
      }
    }
  }

  return processedMessages;
}

export function getMostRecentMessageByRole(
  messages: Array<Message>,
  role: 'user' | 'assistant' = 'user',
): Message | undefined {
  const userMessages = messages.filter((message) => message.role === role);
  return userMessages.at(-1);
}
