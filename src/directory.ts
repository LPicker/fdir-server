import fs from "node:fs";
import path, { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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
    const normalizedRoot = path.normalize(this.rootPath);
    const normalizedResolved = path.normalize(resolvedPath);
    return normalizedResolved.startsWith(normalizedRoot + path.sep) || normalizedResolved === normalizedRoot;
  }

  readPath(filePath: string): FileEntry[] | string | null {
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

    return fs.readFileSync(resolvedPath, "utf-8");
  }
}
