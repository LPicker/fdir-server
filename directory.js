import fs from "node:fs";

export class Directory {
  constructor(path) {
    this.path = path;
  }

  list() {
    const list = fs.readdirSync(this.path, { withFileTypes: true });
    return list.map((f) => ({
      name: f.name,
      isDirectory: f.isDirectory(),
    }));
  }
}
