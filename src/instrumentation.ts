import { startCronJobs } from '@/cron';

// This file is used to run initialization code exactly once when the Next.js server starts.
// By placing the cron job starter here, we ensure it runs in the background.

export function initialize() {
  if (process.env.NODE_ENV !== 'development' || !global._initialized) {
    global._initialized = true;
    startCronJobs();
  }
}

declare global {
  var _initialized: boolean;
}
