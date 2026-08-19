import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    
    // Parse the body to see if we are forcing a specific state (read or unread)
    // If no body is provided, we default to setting isRead to true for backwards compatibility
    let isRead = true;
    try {
      const body = await _req.json();
      if (typeof body.isRead === 'boolean') {
        isRead = body.isRead;
      }
    } catch {
      // Body might be empty, which is fine
    }

    await prisma.item.update({
      where: { id: params.id },
      data: { isRead }
    });
    return NextResponse.json({ success: true, isRead });
  } catch {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}