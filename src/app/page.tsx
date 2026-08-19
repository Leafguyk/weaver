import prisma from '@/lib/prisma';
import FeedList from './components/FeedList';

// Set route to dynamic so it doesn't cache statically
export const dynamic = 'force-dynamic';

export default async function Home() {
  // Fetch items, unread first, then by date, limit to 100
  // EXCLUDE YouTube Shorts from the main feed
  const items = await prisma.item.findMany({
    where: { 
      isShort: false 
    },
    orderBy: [
      { isRead: 'asc' }, // false (unread) comes before true (read)
      { publishedAt: 'desc' }
    ],
    include: { source: true },
    take: 100,
  });

  return (
    <main className="w-full max-w-7xl mx-auto pb-20">
      <div className="p-4 md:p-6 lg:p-8">
        <FeedList initialItems={items} />
      </div>
    </main>
  );
}
