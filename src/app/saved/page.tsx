import prisma from '@/lib/prisma';
import FeedList from '../components/FeedList';

export const dynamic = 'force-dynamic';

export default async function SavedPage() {
  const items = await prisma.item.findMany({
    where: { isSaved: true },
    orderBy: { publishedAt: 'desc' },
    include: { source: true },
  });

  return (
    <main className="w-full max-w-7xl mx-auto pb-20">
      <div className="p-4 md:p-6 lg:p-8">
        <div className="mb-8 border-b border-border-subtle pb-4">
          <h1 className="text-3xl font-bold text-ink font-serif">Saved Items</h1>
          <p className="text-ink-muted mt-2">Your reading list and bookmarked content.</p>
        </div>
        <FeedList initialItems={items} />
      </div>
    </main>
  );
}