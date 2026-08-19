import Parser from 'rss-parser';
import prisma from '../lib/prisma';
import { parseISO, isValid } from 'date-fns';

const parser = new Parser({
  customFields: {
    item: [
      ['media:group', 'mediaGroup'],
      ['media:thumbnail', 'mediaThumbnail'],
      ['content:encoded', 'contentEncoded']
    ]
  }
});

// Helper to determine if a YouTube video is a short
async function checkIfIsShort(url: string): Promise<boolean> {
  try {
    // If the RSS feed already explicitly marks it as a short in the URL, return true immediately
    if (url.includes('/shorts/')) return true;

    // Otherwise, attempt to extract the ID and verify via network request
    const videoIdMatch = url.match(/(?:v=|v\/|vi=|vi\/|youtu.be\/|\/v\/|\/e\/|embed\/|\/user\/.*\/u\/\d+\/|user\/[^/]+\/|watch\?v=|&v=)([^#&?]*).*/);
    if (!videoIdMatch || !videoIdMatch[1]) return false;
    
    const videoId = videoIdMatch[1];
    // Make a HEAD request to the shorts URL. If it redirects, it's a normal video. If it returns 200, it's a Short.
    const res = await fetch(`https://www.youtube.com/shorts/${videoId}`, { 
      method: 'HEAD',
      redirect: 'manual'
    });
    
    // 200 means the /shorts/ page exists (it's a short)
    // 303 (See Other) means it redirected to /watch (it's a normal video)
    return res.status === 200;
  } catch (e) {
    console.error('Error checking if video is short', e);
    return false;
  }
}

export async function fetchAndParseAllSources() {
  console.log('Starting fetch job...');
  const sources = await prisma.source.findMany({
    where: { isActive: true }
  });

  let itemsAdded = 0;

  for (const source of sources) {
    console.log(`Fetching: ${source.name}`);
    try {
      const feed = await parser.parseURL(source.url);

      for (const item of feed.items) {
        // Skip items without link or title
        if (!item.link || !item.title) continue;

        // Try to parse published date
        let publishedAt = new Date();
        if (item.isoDate && isValid(parseISO(item.isoDate))) {
          publishedAt = parseISO(item.isoDate);
        } else if (item.pubDate) {
          const parsed = new Date(item.pubDate);
          if (isValid(parsed)) publishedAt = parsed;
        }

        // Extract a thumbnail URL if it's a YouTube video
        let thumbnailUrl = null;
        let isShort = false;
        
        if (source.type === 'youtube') {
          if (item.mediaGroup && item.mediaGroup['media:thumbnail']) {
            thumbnailUrl = item.mediaGroup['media:thumbnail'][0]?.$?.url || null;
          }
          isShort = await checkIfIsShort(item.link);
        }

        // Try to get a text snippet
        let snippet = item.contentSnippet || item.contentEncoded || item.content || '';
        snippet = snippet.substring(0, 300).trim();

        // Upsert into database
        const created = await prisma.item.upsert({
          where: { link: item.link },
          update: {}, // Don't update anything if it exists
          create: {
            title: item.title,
            link: item.link,
            contentSnippet: snippet,
            publishedAt,
            sourceId: source.id,
            thumbnailUrl,
            isShort,
          }
        });

        if (created.createdAt === created.updatedAt) {
          itemsAdded++;
        }
      }
    } catch (error) {
      console.error(`Failed to fetch ${source.name}:`, error);
    }
  }

  console.log(`Fetch job complete. Added ${itemsAdded} new items.`);
  return itemsAdded;
}
