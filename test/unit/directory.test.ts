import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Directory } from '../../src/directory.js';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';

describe('Directory', () => {
  let testDir: string;
  let directory: Directory;

  beforeEach(() => {
    // Create a temporary directory for testing
    testDir = fs.mkdtempSync(path.join(os.tmpdir(), 'fdir-test-'));

    // Create some test files and folders
    fs.writeFileSync(path.join(testDir, 'test.txt'), 'Hello, World!');
    fs.writeFileSync(path.join(testDir, 'test.json'), JSON.stringify({ test: true }));
    fs.mkdirSync(path.join(testDir, 'subdir'));
    fs.writeFileSync(path.join(testDir, 'subdir', 'nested.txt'), 'Nested content');

    directory = new Directory(testDir);
  });

  afterEach(() => {
    // Clean up temporary directory
    fs.rmSync(testDir, { recursive: true, force: true });
  });

  describe('list()', () => {
    it('should list files and directories in the root path', () => {
      const result = directory.list();

      expect(result).toBeInstanceOf(Array);
      expect(result.length).toBeGreaterThanOrEqual(2);

      const fileNames = result.map(f => f.name);
      expect(fileNames).toContain('test.txt');
      expect(fileNames).toContain('test.json');
      expect(fileNames).toContain('subdir');
    });

    it('should correctly identify directories', () => {
      const result = directory.list();

      const subdir = result.find(f => f.name === 'subdir');
      expect(subdir).toBeDefined();
      expect(subdir?.isDirectory).toBe(true);

      const testFile = result.find(f => f.name === 'test.txt');
      expect(testFile).toBeDefined();
      expect(testFile?.isDirectory).toBe(false);
    });

    it('should return empty array for empty directory', () => {
      const emptyDir = fs.mkdtempSync(path.join(os.tmpdir(), 'fdir-empty-'));
      const emptyDirectory = new Directory(emptyDir);

      try {
        const result = emptyDirectory.list();
        expect(result).toEqual([]);
      } finally {
        fs.rmSync(emptyDir, { recursive: true, force: true });
      }
    });
  });

  describe('readPath()', () => {
    it('should read a file and return its content', () => {
      const result = directory.readPath('test.txt');
      expect(result).toBe('Hello, World!');
    });

    it('should read a directory and return its entries', () => {
      const result = directory.readPath('subdir');

      expect(Array.isArray(result)).toBe(true);
      const entry = (result as any[]).find(e => e.name === 'nested.txt');
      expect(entry).toBeDefined();
      expect(entry?.isDirectory).toBe(false);
    });

    it('should return null for non-existent file', () => {
      const result = directory.readPath('nonexistent.txt');
      expect(result).toBeNull();
    });

    it('should return null for path traversal attempts', () => {
      const result = directory.readPath('../outside.txt');
      expect(result).toBeNull();
    });

    it('should handle URL-encoded paths', () => {
      // Create a file with space in name
      fs.writeFileSync(path.join(testDir, 'test file.txt'), 'Content with space');

      const result = directory.readPath('test%20file.txt');
      expect(result).toBe('Content with space');
    });

    it('should handle nested paths', () => {
      const result = directory.readPath('subdir/nested.txt');
      expect(result).toBe('Nested content');
    });

    it('should handle root path', () => {
      const result = directory.readPath('');
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('isPathSafe()', () => {
    it('should allow paths within root', () => {
      // This is a private method, but we can test it indirectly
      const result = directory.readPath('test.txt');
      expect(result).not.toBeNull();
    });

    it('should reject paths outside root', () => {
      const result = directory.readPath('../../../etc/passwd');
      expect(result).toBeNull();
    });
  });

  describe('Binary file detection (via readPath)', () => {
    it('should detect PNG files as binary', () => {
      // Create a minimal PNG file (PNG signature)
      const pngBuffer = Buffer.from([
        0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
        // IHDR chunk
        0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
        0x08, 0x06, 0x00, 0x00, 0x00, 0x1f, 0x15, 0xc4, 0x89,
      ]);
      fs.writeFileSync(path.join(testDir, 'test.png'), pngBuffer);

      const result = directory.readPath('test.png');
      expect(Buffer.isBuffer(result)).toBe(true);
    });

    it('should detect JPEG files as binary', () => {
      // Create a minimal JPEG file (JPEG signature)
      const jpegBuffer = Buffer.from([
        0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01,
      ]);
      fs.writeFileSync(path.join(testDir, 'test.jpg'), jpegBuffer);

      const result = directory.readPath('test.jpg');
      expect(Buffer.isBuffer(result)).toBe(true);
    });

    it('should detect GIF files as binary', () => {
      // Create a minimal GIF file (GIF signature)
      const gifBuffer = Buffer.from([
        0x47, 0x49, 0x46, 0x38, 0x39, 0x61, 0x01, 0x00,
      ]);
      fs.writeFileSync(path.join(testDir, 'test.gif'), gifBuffer);

      const result = directory.readPath('test.gif');
      expect(Buffer.isBuffer(result)).toBe(true);
    });

    it('should detect PDF files as binary', () => {
      // Create a minimal PDF file
      const pdfContent = '%PDF-1.4';
      fs.writeFileSync(path.join(testDir, 'test.pdf'), pdfContent);

      const result = directory.readPath('test.pdf');
      expect(Buffer.isBuffer(result)).toBe(true);
    });

    it('should detect ZIP files as binary', () => {
      // Create a minimal ZIP file (local file header)
      const zipBuffer = Buffer.from([
        0x50, 0x4b, 0x03, 0x04, 0x14, 0x00, 0x00, 0x00, 0x08, 0x00,
      ]);
      fs.writeFileSync(path.join(testDir, 'test.zip'), zipBuffer);

      const result = directory.readPath('test.zip');
      expect(Buffer.isBuffer(result)).toBe(true);
    });

    it('should detect GZIP files as binary', () => {
      // Create a minimal GZIP file
      const gzipBuffer = Buffer.from([
        0x1f, 0x8b, 0x08, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x03,
      ]);
      fs.writeFileSync(path.join(testDir, 'test.gz'), gzipBuffer);

      const result = directory.readPath('test.gz');
      expect(Buffer.isBuffer(result)).toBe(true);
    });

    it('should return Buffer for files with null bytes', () => {
      const bufferWithNulls = Buffer.from([0x00, 0x01, 0x02, 0x00]);
      fs.writeFileSync(path.join(testDir, 'null-byte.dat'), bufferWithNulls);

      const result = directory.readPath('null-byte.dat');
      expect(Buffer.isBuffer(result)).toBe(true);
    });

    it('should return Buffer for files with high control character ratio', () => {
      // Create a buffer with >30% control characters
      const buffer = Buffer.alloc(100);
      for (let i = 0; i < 100; i++) {
        buffer[i] = i < 35 ? 0x01 : 0x20; // 35% control chars, rest space
      }
      fs.writeFileSync(path.join(testDir, 'control.dat'), buffer);

      const result = directory.readPath('control.dat');
      expect(Buffer.isBuffer(result)).toBe(true);
    });

    it('should return string for text files', () => {
      const textContent = 'Hello, World!\nThis is a text file.\n';
      fs.writeFileSync(path.join(testDir, 'text.txt'), textContent);

      const result = directory.readPath('text.txt');
      expect(typeof result).toBe('string');
      expect(result).toBe(textContent);
    });

    it('should return string for JSON files', () => {
      const jsonContent = JSON.stringify({ key: 'value', nested: { array: [1, 2, 3] } });
      fs.writeFileSync(path.join(testDir, 'data.json'), jsonContent);

      const result = directory.readPath('data.json');
      expect(typeof result).toBe('string');
      expect(JSON.parse(result as string)).toEqual({ key: 'value', nested: { array: [1, 2, 3] } });
    });

    it('should handle empty files', () => {
      fs.writeFileSync(path.join(testDir, 'empty.txt'), '');

      const result = directory.readPath('empty.txt');
      expect(typeof result).toBe('string');
      expect(result).toBe('');
    });

    it('should detect files with mixed content but majority text as text', () => {
      // Mostly printable ASCII with a few special characters
      const content = 'This is mostly normal text\n' +
                      'With some special chars: \t\r\n' +
                      'End of file';
      fs.writeFileSync(path.join(testDir, 'mixed.txt'), content);

      const result = directory.readPath('mixed.txt');
      expect(typeof result).toBe('string');
    });

    it('should handle files with common binary extensions by extension', () => {
      // Test .exe extension (binary)
      const exeBuffer = Buffer.from([0x4d, 0x5a, 0x90, 0x00]); // MZ header
      fs.writeFileSync(path.join(testDir, 'program.exe'), exeBuffer);

      const exeResult = directory.readPath('program.exe');
      expect(Buffer.isBuffer(exeResult)).toBe(true);

      // Test .mp4 extension (binary)
      const mp4Buffer = Buffer.from([0x00, 0x00, 0x00, 0x20, 0x66, 0x74, 0x79, 0x70]); // ftyp
      fs.writeFileSync(path.join(testDir, 'video.mp4'), mp4Buffer);

      const mp4Result = directory.readPath('video.mp4');
      expect(Buffer.isBuffer(mp4Result)).toBe(true);
    });
  });
});
