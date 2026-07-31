import dotenv from 'dotenv';

// Load environment variables FIRST before anything else
dotenv.config();

// Now import and start the app
import('./index.js').catch(err => {
  console.error('Failed to start app:', err);
  process.exit(1);
});
