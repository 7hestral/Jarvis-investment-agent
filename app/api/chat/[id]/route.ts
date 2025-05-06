import { NextResponse } from 'next/server';
import { verifyAccessToken } from '@/lib/privy/verify-access-token';
import { getChat } from '@/lib/actions/chat'
import { convertToUIMessages } from '@/lib/utils'
export async function GET(req: Request, { params }: { params: { id: string } }) {
  const userId = req.headers.get('x-user-id');
  const authHeader = req.headers.get('authorization') || '';
  const token = authHeader.replace('Bearer ', '');

  if (userId !== 'anonymous') {
    let payload: any;
    try {
      payload = await verifyAccessToken(token);
    } catch {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
      // only authenticated user, payload.sub should match userId
    if (payload.sub !== userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }




  const chat = await getChat(params.id, userId || 'anonymous');
  if (!chat) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  // convertToUIMessages for useChat hook
  const messages = convertToUIMessages(chat?.messages || [])

  return NextResponse.json({ messages });
}
