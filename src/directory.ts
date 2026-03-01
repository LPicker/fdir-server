import fs from "node:fs";

export interface FileEntry {
  name: string;
  isDirectory: boolean;
}

export class Directory {
  path: string;

  constructor(path: string) {
    this.path = path;
  }

  list(): FileEntry[] {
    const list = fs.readdirSync(this.path, { withFileTypes: true });
    return list.map((f) => ({
      name: f.name,
      isDirectory: f.isDirectory(),
    }));
  }
}
