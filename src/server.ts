import * as http from "node:http";
import * as fs from "node:fs";
import * as path from "node:path";
import { Directory, type FileEntry } from "./directory.js";
import { getMimeType } from "./utils/file.js";
import { formatSize, formatDate, escapeHtml } from "./utils/format.js";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function getContentTypeStr(mimeType: string): string {
  return `${mimeType}; charset=utf-8`;
}

function getHtmlPage(title: string, content: string): string {
  const templatePath = path.join(__dirname, "templates", "index.html");
  let template: string;

  try {
    template = fs.readFileSync(templatePath, "utf-8");
  } catch (err) {
    console.error("Failed to read template:", err);
    // Fallback to simple template if file not found
    return `<!DOCTYPE html><html><head><title>${title}</title></head><body><h1>${title}</h1>${content}</body></html>`;
  }

  return template.replace(/\{\{title\}\}/g, title).replace(/\{\{content\}\}/g, content);
}

export default class Server {
  port: number;
  directory: Directory;

  constructor(port: number, dir = ".") {
    this.port = port;
    this.directory = new Directory(dir);
  }

  start(cb?: (port: number) => void): void {
    const server = http.createServer((req, res) => this.handleRequest(req, res));

    server.listen(this.port, () => {
      if (typeof cb === "function") {
        cb(this.port);
      }
    });

    server.on("error", (err) => {
      if ((err as any).code === "EADDRINUSE") {
        console.warn(`\nPort ${this.port} is already in use, trying ${this.port + 1} ...`);
        this.port++;
        // 关闭当前 server 实例，避免资源泄露
        server.close();
        this.start(cb);
      } else {
        console.error("Server error:", err);
        process.exit(1);
      }
    });
  }

  handleRequest(req: http.IncomingMessage, res: http.ServerResponse): void {
    // 只允许 GET 和 HEAD 方法
    if (req.method !== "GET" && req.method !== "HEAD") {
      res.writeHead(405, { "Content-Type": getContentTypeStr("text/plain") });
      res.end("Method Not Allowed");
      return;
    }

    try {
      if (!req.url || req.url === "/") {
        const rootList = this.directory.list();
        const html = this.renderDirectoryPage("Index of /", rootList);
        if (req.method === "HEAD") {
          res.writeHead(200, { "Content-Type": getContentTypeStr("text/html") });
          res.end();
        } else {
          this.sendResponse(res, html, 200);
        }
      } else {
        // 改进 URL 路径解析：移除前导 / 并规范化
        const requestPath = req.url.startsWith("/") ? req.url.slice(1) : req.url;
        const result = this.directory.readPath(requestPath);

        if (result === null) {
          res.writeHead(404, { "Content-Type": getContentTypeStr("text/plain") });
          res.end(req.method === "HEAD" ? "" : "Not Found");
        } else if (Array.isArray(result)) {
          const html = this.renderDirectoryPage(`Index of /${requestPath}`, result);
          if (req.method === "HEAD") {
            res.writeHead(200, { "Content-Type": getContentTypeStr("text/html") });
            res.end();
          } else {
            res.writeHead(200, { "Content-Type": getContentTypeStr("text/html") });
            res.end(html);
          }
        } else {
          // 文件内容
          const mimeType = getMimeType(req.url);
          res.writeHead(200, { "Content-Type": getContentTypeStr(mimeType) });
          res.end(req.method === "HEAD" ? "" : result);
        }
      }
    } catch (err) {
      console.error("Request error:", err);
      res.writeHead(500, { "Content-Type": getContentTypeStr("text/plain") });
      res.end("Internal Server Error");
    }
  }

  private sendResponse(res: http.ServerResponse, html: string, status: number): void {
    res.writeHead(status, { "Content-Type": getContentTypeStr("text/html") });
    res.end(html);
  }

  private renderDirectoryPage(title: string, list: FileEntry[]): string {
    if (list.length === 0) {
      return getHtmlPage(escapeHtml(title), "<p>Empty Directory</p>");
    }

    // 排序：文件夹在前，然后是文件
    const sorted = [...list].sort((a, b) => {
      if (a.isDirectory && !b.isDirectory) return -1;
      if (!a.isDirectory && b.isDirectory) return 1;
      return a.name.localeCompare(b.name);
    });

    const rows = sorted
      .map(
        (file) => `
        <tr class="${file.isDirectory ? 'folder' : ''}">
          <td class="name">
            <a href="./${file.name}${file.isDirectory ? "/" : ""}">${escapeHtml(file.name)}${file.isDirectory ? "/" : ""}</a>
          </td>
          <td class="size">${formatSize(file.size)}</td>
          <td class="modified">${formatDate(file.lastModified)}</td>
        </tr>`,
      )
      .join("");

    const table = `
      <table>
        <thead>
          <tr>
            <th>名称</th>
            <th>大小</th>
            <th>修改时间</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>`;

    return getHtmlPage(escapeHtml(title), table);
  }
}
