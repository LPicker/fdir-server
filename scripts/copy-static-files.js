import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootDir = path.resolve(__dirname, "..");
const srcDir = path.join(rootDir, "src");
const distDir = path.join(rootDir, "dist");

/**
 * Copy static files from src to dist
 * @param {string} srcDir - Source directory
 * @param {string} distDir - Destination directory
 * @param {string[]} patterns - Patterns to copy (relative to srcDir)
 */
function copyStaticFiles(srcDir, distDir, patterns) {
  for (const pattern of patterns) {
    const srcPath = path.join(srcDir, pattern);
    const dstPath = path.join(distDir, pattern);

    if (!fs.existsSync(srcPath)) {
      console.log(`Skip: ${srcPath} (not found)`);
      continue;
    }

    const stat = fs.statSync(srcPath);
    if (stat.isDirectory()) {
      fs.mkdirSync(dstPath, { recursive: true });
      const files = fs.readdirSync(srcPath);
      for (const file of files) {
        const srcFile = path.join(srcPath, file);
        const dstFile = path.join(dstPath, file);
        fs.copyFileSync(srcFile, dstFile);
        console.log(`Copied: ${srcFile} -> ${dstFile}`);
      }
    } else {
      fs.mkdirSync(path.dirname(dstPath), { recursive: true });
      fs.copyFileSync(srcPath, dstPath);
      console.log(`Copied: ${srcPath} -> ${dstPath}`);
    }
  }
}

// Static resources to copy
const patternsToCopy = ["templates"];

copyStaticFiles(srcDir, distDir, patternsToCopy);
console.log("Static files copy complete.");
