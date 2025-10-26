/**
 * Script to update favicon icons for all existing sources
 * Run this once to add icons to sources that were created before the icon feature
 */
import { db } from '../config/database.js';
import { FeedService } from '../services/feedService.js';

async function main() {
  console.log('Starting icon update process...');

  // Get ALL sources and update their icons
  const sources = db.prepare('SELECT * FROM sources').all() as any[];

  console.log(`Updating icons for ${sources.length} sources...`);

  for (const source of sources) {
    await FeedService.updateSourceIcon(source.id, source.url);
  }

  console.log('Finished updating source icons');
  console.log('Done!');
  process.exit(0);
}

main().catch(err => {
  console.error('Error updating icons:', err);
  process.exit(1);
});
