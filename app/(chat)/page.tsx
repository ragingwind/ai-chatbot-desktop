import { cookies } from 'next/headers';

import { Chat } from '@/components/chat';
import { DEFAULT_CHAT_MODEL } from '@/lib/ai/models';
import { DEFAULT_PROVIDER } from '@/lib/ai/providers';
import { generateUUID } from '@/lib/utils';
import { DataStreamHandler } from '@/components/data-stream-handler';
import { auth } from '../(auth)/auth';
import { redirect } from 'next/navigation';

export default async function Page() {
  const session = await auth();

  if (!session) {
    redirect('/api/auth/guest');
  }

  const id = generateUUID();

  const cookieStore = await cookies();
  const modelIdFromCookie = cookieStore.get('chat-model');
  const providerModelFromCookie = cookieStore.get('provider-model');

  return (
    <>
      <Chat
        key={id}
        id={id}
        initialMessages={[]}
        initialChatModel={modelIdFromCookie?.value || DEFAULT_CHAT_MODEL}
        initialProviderModel={
          providerModelFromCookie?.value || DEFAULT_PROVIDER
        }
        initialVisibilityType="private"
        isReadonly={false}
        session={session}
        autoResume={false}
      />
      <DataStreamHandler id={id} />
    </>
  );
}
