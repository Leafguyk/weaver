import prisma from '../src/lib/prisma';

async function main() {
  console.log('Seeding initial sources...');

  const sources = [
    {
      name: 'The Verge',
      url: 'https://www.theverge.com/rss/index.xml',
      type: 'rss',
    },
    {
      name: 'TechCrunch',
      url: 'https://techcrunch.com/feed/',
      type: 'rss',
    },
    {
      name: 'Veritasium',
      // YouTube channel RSS: https://www.youtube.com/feeds/videos.xml?channel_id=UCHnyfMqiRRG1u-2MsSQLbXA
      url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCHnyfMqiRRG1u-2MsSQLbXA',
      type: 'youtube',
    }
  ];

  for (const source of sources) {
    await prisma.source.upsert({
      where: { url: source.url },
      update: {},
      create: {
        name: source.name,
        url: source.url,
        type: source.type,
      },
    });
  }

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
