#!/usr/bin/env node
import "./utils/device.js";
import Server from "./server.js";
import { getIpAddress } from "./utils/device.js";

const port = Number(process.argv[2]) || 8080;
const dir = process.argv[3] || process.cwd();

const server = new Server(port, dir);
server.start((port) => {
  console.log(`\nServing files from: ${dir}`);

  console.log(`\nAvailable on the following URLs:
  - http://${getIpAddress({ internal: true })}:${port}/
  - http://${getIpAddress({ internal: false })}:${port}/`);
});
