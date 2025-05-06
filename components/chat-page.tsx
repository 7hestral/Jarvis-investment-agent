'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePrivy, getAccessToken } from '@privy-io/react-auth';
import { Chat } from '@/components/chat';

const TRIAL_KEY = 'anon_trials';
const MAX_TRIALS = 2;

export function ChatPage({ chatId }: { chatId: string }) {
  const router = useRouter();
  const { ready, authenticated, user } = usePrivy();
  const [messages, setMessages] = useState<any[]>([]);
  const [models, setModels] = useState<any[]>([]);

  // Async loader
  async function loadChat() {
    // 1. Anonymous trial logic
    if (!authenticated) {
      let trials = parseInt(localStorage.getItem(TRIAL_KEY) ?? `${MAX_TRIALS}`, 10);
      if (trials <= 0) {
        router.replace('/login');
        return;
      }
      localStorage.setItem(TRIAL_KEY, String(trials - 1));
    }

    // 2. Determine userId
    const userId = authenticated ? user?.id : 'anonymous';

    try {
      // 3. Fetch chat
      const token = await getAccessToken();
      const res = await fetch(`/api/chat/${chatId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'X-User-Id': userId || 'anonymous',
        },
      });

      if (res.status === 404) {
        router.replace('/');
        return;
      }
      if (res.status === 401) {
        router.replace('/login');
        return;
      }

      const data = await res.json();
      setMessages(data.messages);

      // 4. Fetch models
      const modelsRes = await fetch('/api/models');
      const modelsData = await modelsRes.json();
      setModels(modelsData);
    } catch (error) {
      console.error('Error loading chat:', error);
      router.replace('/');
    }
  }

  useEffect(() => {
    if (ready) {
      loadChat();
    }
  }, [ready, authenticated, user, chatId]);

  if (!ready) {
    return <p>Loading…</p>;
  }

  return <Chat id={chatId} savedMessages={messages} models={models} />;
}
