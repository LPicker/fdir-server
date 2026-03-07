import * as http from "node:http";
import { Directory, type FileEntry } from "./directory.js";
import { getMimeType } from "./utils/file.js";

function getContentTypeStr(mimeType: string): string {
  return `${mimeType}; charset=utf-8`;
}

function getHtmlPage(title: string, content: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    ul { list-style-type: none; padding: 0; }
    li { padding: 4px 0; }
    a { text-decoration: none; color: #0066cc; }
    a:hover { text-decoration: underline; }
    .folder { color: #666; }
  </style>
</head>
<body>
  <h1>${title}</h1>
  ${content}
</body>
</html>`;
}

export default class Server {
  port: number;
  directory: Directory;

  constructor(port: number, dir = ".") {
    this.port = port;
    this.directory = new Directory(dir);
  }

  start(): void {
    const server = http.createServer((req, res) => this.handleRequest(req, res));
    server.listen(this.port);
    server.on("error", (err) => {
      console.error("Server error:", err);
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
        this.sendResponse(res, html, 200);
      } else {
        // 改进 URL 路径解析：移除前导 / 并规范化
        const requestPath = req.url.startsWith("/") ? req.url.slice(1) : req.url;
        const result = this.directory.readPath(requestPath);

        if (result === null) {
          res.writeHead(404, { "Content-Type": getContentTypeStr("text/plain") });
          res.end("Not Found");
        } else if (Array.isArray(result)) {
          const html = this.renderDirectoryPage(`Index of /${requestPath}`, result);
          this.sendResponse(res, html, 200);
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
      return getHtmlPage(title, "<p>Empty Directory</p>");
    }

    const items = list
      .map(
        (file) => `
      <li class="${file.isDirectory ? "folder" : ""}">
        <a href="./${file.name}${file.isDirectory ? "/" : ""}">${file.name}${file.isDirectory ? "/" : ""}</a>
      </li>`,
      )
      .join("");

    return getHtmlPage(title, `<ul>${items}</ul>`);
  }
}
