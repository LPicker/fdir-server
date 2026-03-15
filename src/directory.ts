import fs from "node:fs";
import path, { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 常见二进制文件扩展名
const BINARY_EXTENSIONS = new Set([
  // 图片
  '.png', '.jpg', '.jpeg', '.gif', '.webp', '.bmp', '.ico', '.svg', '.tiff', '.psd',
  // 文档
  '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx',
  // 压缩包
  '.zip', '.rar', '.7z', '.tar', '.gz', '.bz2', '.xz',
  // 可执行文件
  '.exe', '.dll', '.so', '.bin', '.dat', '.msi', '.app',
  // 音视频
  '.mp3', '.mp4', '.avi', '.mov', '.wav', '.flv', '.mkv', '.webm', '.flac', '.aac',
  // 字体
  '.woff', '.woff2', '.ttf', '.eot', '.otf',
  // 其他二进制
  '.psd', '.ai', '.eps', '.obj', '.stl', '.blend',
]);

export interface FileEntry {
  name: string;
  isDirectory: boolean;
}

export class Directory {
  rootPath: string;

  constructor(dirPath = ".") {
    this.rootPath = path.resolve(__dirname, dirPath);
  }

  list(): FileEntry[] {
    const list = fs.readdirSync(this.rootPath, { withFileTypes: true });
    return list.map((f) => ({
      name: f.name,
      isDirectory: f.isDirectory(),
    }));
  }

  /**
   * 检查路径是否安全（在 rootPath 范围内）
   */
  private isPathSafe(resolvedPath: string): boolean {
    const relative = path.relative(this.rootPath, resolvedPath);
    // 如果路径在 rootPath 内，relative 返回相对路径
    // 如果路径在 rootPath 外，relative 返回以 ".." 开头或绝对路径
    return !relative.startsWith('..') && !path.isAbsolute(relative);
  }

  readPath(filePath: string): FileEntry[] | string | Buffer | null {
    // 解码并规范化路径
    const decodedPath = decodeURIComponent(filePath);
    const resolvedPath = path.resolve(this.rootPath, decodedPath);

    // 安全检查：防止路径遍历攻击
    if (!this.isPathSafe(resolvedPath)) {
      return null;
    }

    // 使用 statSync 一次调用判断存在性和类型
    let stats: fs.Stats;
    try {
      stats = fs.statSync(resolvedPath);
    } catch {
      return null;
    }

    if (stats.isDirectory()) {
      const list = fs.readdirSync(resolvedPath, {
        withFileTypes: true,
      });
      return list.map((f) => ({
        name: f.name,
        isDirectory: f.isDirectory(),
      }));
    }

    // 获取扩展名，判断是否为常见二进制文件
    const ext = path.extname(resolvedPath).toLowerCase();
    if (BINARY_EXTENSIONS.has(ext)) {
      return fs.readFileSync(resolvedPath);
    }

    // 其他文件，读取内容检测是否为二进制
    const buffer = fs.readFileSync(resolvedPath);
    if (this.isBinaryContent(buffer)) {
      return buffer;
    }

    return buffer.toString('utf-8');
  }

  /**
   * 检测文件内容是否为二进制
   */
  private isBinaryContent(buffer: Buffer): boolean {
    // 检查常见二进制文件的 magic numbers
    const binarySignatures: number[][] = [
      [0x89, 0x50, 0x4E, 0x47], // PNG
      [0xFF, 0xD8, 0xFF],       // JPEG
      [0x47, 0x49, 0x46],       // GIF
      [0x52, 0x49, 0x46, 0x46], // RIFF (WEBP, AVI, WAV)
      [0x25, 0x50, 0x44, 0x46], // PDF
      [0x50, 0x4B, 0x03, 0x04], // ZIP
      [0x50, 0x4B, 0x05, 0x06], // ZIP (empty)
      [0x1F, 0x8B],             // GZIP
    ];

    for (const sig of binarySignatures) {
      if (sig.every((byte, i) => buffer[i] === byte)) {
        return true;
      }
    }

    // 检测缓冲区内是否有大量非文本字符
    // 检查前 512 字节（或文件实际大小）
    const checkLength = Math.min(buffer.length, 512);
    if (checkLength === 0) return false;

    let nullByteCount = 0;
    let controlCharCount = 0;

    for (let i = 0; i < checkLength; i++) {
      const byte = buffer[i];
      if (byte === 0) {
        nullByteCount++;
      } else if (byte < 0x09 || (byte >= 0x0E && byte < 0x20)) {
        controlCharCount++;
      }
    }

    // 存在空字节或大量控制字符，认为是二进制文件
    if (nullByteCount > 0) return true;
    if (controlCharCount / checkLength > 0.3) return true;

    return false;
  }
}
