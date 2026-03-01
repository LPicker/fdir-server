import * as http from "node:http";
import { Directory, type FileEntry } from "./directory.js";

export interface FileEntryWithPath extends FileEntry {}

export class Server {
  port: number;

  constructor(port: number) {
    this.port = port;
  }

  start(): void {
    const directoryViews = this.getDirectoryViews();
    http
      .createServer((req, res) => {
        res.writeHead(200, { "Content-Type": "text/html" });
        res.end(directoryViews);
      })
      .listen(this.port);
    console.log(`Server running at http://localhost:${this.port}/`);
  }

  getFileItemView(file: FileEntryWithPath): string {
    return `
      <li class="${file.isDirectory ? "folder" : ""}">
        <a href="${file.name}">${file.name}${file.isDirectory ? "/" : ""}</a>
      </li>
    `;
  }

  getDirectoryViews(): string {
    const list = new Directory(".").list();
    return `
      <ul>
        ${list.map((file) => this.getFileItemView(file)).join("")}
      </ul>
    `;
  }
}

new Server(3000).start();
