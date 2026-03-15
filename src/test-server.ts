#!/usr/bin/env node
import Server from './server.js';

const port = Number(process.argv[2]) || 8080;
const dir = process.argv[3] || process.cwd();

const server = new Server(port, dir);
server.start((port) => {
  console.log(`Serving files from: ${dir} on port ${port}`);
});

// Keep the process running
process.on('SIGINT', () => {
  console.log('\nShutting down server...');
  process.exit(0);
});
