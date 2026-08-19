# <img src="./src/app/icon.png" width="36" align="top" alt="The Weaver Logo" /> The Weaver

**A cozy, editorial-style personal news aggregator.**

The Weaver pulls your favorite RSS feeds and YouTube channels into a unified, beautiful reading experience that feels more like a printed magazine than a digital feed.

## ✨ Features

- **Unified Feed:** Mixes RSS blogs and YouTube channels into a single, cohesive feed.
- **Editorial Design:** Features a warm, parchment-style aesthetic (`Lora` serif font, deep ink colors, and subtle borders) built with Tailwind CSS.
- **Dark Mode:** A comfortable, eye-friendly charcoal theme for late-night reading.
- **Shorts Filtering:** Automatically detects and segregates YouTube Shorts from your main feed, keeping your reading list focused on high-quality content.
- **Save & Read States:** Mark items as read (which fades them out) or save them for later reading.
- **Auto-Pruning:** Background jobs automatically clean up old, unread, or read articles to keep your local database lightning fast.

## 🛠️ Tech Stack

- **Framework:** [Next.js](https://nextjs.org/) (App Router)
- **Styling:** Tailwind CSS + `next-themes`
- **Database:** SQLite managed via [Prisma ORM](https://www.prisma.io/)
- **Ingestion:** `rss-parser`

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up the Database
This project uses a local SQLite database (`dev.db`). Initialize it by running:
```bash
npx prisma generate
npx prisma db push
```

### 3. Run the Server
Because this app runs background cron jobs to fetch data, you must build and start the production server:
```bash
npm run build
npm run start
```
Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

### 4. Fetching Data
The application has a built-in scheduler (`node-cron`) that automatically:
- **Fetches new articles** every 30 minutes in the background.
- **Prunes old data** every day at 3:00 AM (removes unread items older than 14 days, and read items older than 7 days).

You can also trigger a fetch manually at any time by navigating to "Manage Sources" and adding a new source, or by sending a POST request:
```bash
curl -X POST http://localhost:3000/api/fetch
```

## 📂 Managing Sources
Navigate to `http://localhost:3000/sources` to manage your subscriptions. 
You can paste any standard RSS link, or simply paste a raw **YouTube Channel ID** (e.g., `UCHnyfMqiRRG1u-2MsSQLbXA`), and The Weaver will automatically handle the rest.
