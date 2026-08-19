import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    // Delete unread items older than 14 days, and read items older than 7 days, UNLESS they are saved.
    
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Delete old unread items
    const deletedUnread = await prisma.item.deleteMany({
      where: {
        isSaved: false,
        isRead: false,
        publishedAt: {
          lt: fourteenDaysAgo
        }
      }
    });

    // Delete old read items
    const deletedRead = await prisma.item.deleteMany({
      where: {
        isSaved: false,
        isRead: true,
        publishedAt: {
          lt: sevenDaysAgo
        }
      }
    });

    return NextResponse.json({ 
      success: true, 
      pruned: deletedUnread.count + deletedRead.count 
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}
