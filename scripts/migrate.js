#!/usr/bin/env node
import { initializeTables } from '../lib/db.js';

async function main() {
  try {
    console.log('Initializing database tables...');
    await initializeTables();
    console.log('Database initialized successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

main();
