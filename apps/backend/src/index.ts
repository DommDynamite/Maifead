import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cron from 'node-cron';
import { initializeDatabase } from './config/database.js';
import { FeedService } from './services/feedService.js';

// Import routes
import authRoutes from './routes/auth.js';
import sourcesRoutes from './routes/sources.js';
import feedItemsRoutes from './routes/feedItems.js';
import collectionsRoutes from './routes/collections.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/sources', sourcesRoutes);
app.use('/api/feed-items', feedItemsRoutes);
app.use('/api/collections', collectionsRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Initialize database
initializeDatabase();

// Schedule periodic feed fetching (every 15 minutes by default)
const fetchInterval = process.env.FEED_FETCH_INTERVAL || '*/15 * * * *';
cron.schedule(fetchInterval, async () => {
  console.log('Running scheduled feed fetch...');
  try {
    await FeedService.fetchAllSources();
    console.log('Scheduled feed fetch completed');
  } catch (error) {
    console.error('Error in scheduled feed fetch:', error);
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Feed fetch scheduled: ${fetchInterval}`);
});
