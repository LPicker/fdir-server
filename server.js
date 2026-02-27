import * as http from "node:http";
import { Directory } from "./directory.js";

export class Server {
  constructor(port) {
    this.port = port;
  }

  start() {
    const directoryViews = this.getDirectoryViews();
    http
      .createServer((req, res) => {
        res.writeHead(200, { "Content-Type": "text/html" });
        res.end(directoryViews);
      })
      .listen(this.port);
    console.log(`Server running at http://localhost:${this.port}/`);
  }

  getFileItemView(file) {
    return `
      <li class="${file.isDirectory ? "folder" : ""}">
        <a href="${file.path}">${file.name}${file.isDirectory ? "/" : ""}</a>
      </li>
    `;
  }

  getDirectoryViews() {
    const list = new Directory(".").list();
    return `
      <ul>
        ${list.map((file) => this.getFileItemView(file)).join("")}
      </ul>
    `;
  }
}

new Server(3000).start();
