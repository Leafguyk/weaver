import prisma from '@/lib/prisma';
import FeedList from '../components/FeedList';

export const dynamic = 'force-dynamic';

export default async function ShortsPage() {
  const items = await prisma.item.findMany({
    where: { isShort: true },
    orderBy: [
      { isRead: 'asc' }, 
      { publishedAt: 'desc' }
    ],
    include: { source: true },
    take: 100,
  });

  return (
    <main className="w-full max-w-7xl mx-auto pb-20">
      <div className="p-4 md:p-6 lg:p-8">
        <div className="mb-8 border-b border-border-subtle pb-4">
          <h1 className="text-3xl font-bold text-ink font-serif flex items-center gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-accent"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
            Shorts
          </h1>
          <p className="text-ink-muted mt-2">Bite-sized videos separated from your main reading feed.</p>
        </div>
        <FeedList initialItems={items} />
      </div>
    </main>
  );
}