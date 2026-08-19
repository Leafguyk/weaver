import cron from 'node-cron';
import { fetchAndParseAllSources } from './services/fetcher';

let isCronStarted = false;

export function startCronJobs() {
  // Prevent multiple initializations in development mode due to hot reloading
  if (isCronStarted) return;
  isCronStarted = true;

  console.log('🕒 Starting background cron jobs...');

  // Run the fetcher every 30 minutes
  cron.schedule('*/30 * * * *', async () => {
    console.log('🔄 [CRON] Triggering scheduled data fetch...');
    try {
      await fetchAndParseAllSources();
    } catch (error) {
      console.error('❌ [CRON] Fetch job failed:', error);
    }
  });

  // Run the pruner once a day at 3:00 AM to keep the DB clean
  cron.schedule('0 3 * * *', async () => {
    console.log('🧹 [CRON] Triggering scheduled database prune...');
    try {
      // We can directly hit our own internal API route locally
      const res = await fetch('http://127.0.0.0:3000/api/prune', { method: 'POST' });
      const data = await res.json();
      console.log(`🧹 [CRON] Prune complete. Deleted ${data.pruned || 0} old items.`);
    } catch (error) {
      console.error('❌ [CRON] Prune job failed:', error);
    }
  });
}
