import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import Parser from 'rss-parser';

const parser = new Parser();

export async function GET() {
  try {
    const sources = await prisma.source.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json({ success: true, sources });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { url } = await req.json();
    
    // Check if user just pasted a raw YouTube Channel ID (e.g., UCHnyfMqiRRG1u-2MsSQLbXA)
    // Most YouTube channel IDs start with UC and are 24 characters long
    let feedUrl = url;
    if (url.startsWith('UC') && url.length === 24 && !url.includes('http')) {
      feedUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${url}`;
    }
    
    // Attempt to parse the URL to verify it's a valid feed and grab its title
    const feed = await parser.parseURL(feedUrl);
    const type = feedUrl.includes('youtube.com') ? 'youtube' : 'rss';
    
    const source = await prisma.source.create({
      data: {
        name: feed.title || 'Unknown Source',
        url: feedUrl,
        type,
      }
    });

    return NextResponse.json({ success: true, source });
  } catch {
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to parse RSS feed. Make sure the URL points to a valid RSS feed, or just paste a YouTube Channel ID.' 
    }, { status: 400 });
  }
}
