import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";
import * as os from "node:os";
import Server from "../../src/server.js";

describe("Server", () => {
  let testDir: string;
  let server: Server;
  let port: number;

  beforeEach(() => {
    // Create a temporary directory for testing
    testDir = fs.mkdtempSync(path.join(os.tmpdir(), "fdir-server-unit-"));

    // Find an available port
    port = 4000 + Math.floor(Math.random() * 1000);
    server = new Server(port, testDir);
  });

  afterEach(() => {
    // Clean up temporary directory
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
  });

  describe("constructor", () => {
    it("should create a server with specified port and directory", () => {
      const testServer = new Server(8080, testDir);
      expect(testServer.port).toBe(8080);
      expect(testServer.directory).toBeDefined();
    });

    it("should use default directory when not specified", () => {
      const testServer = new Server(8080);
      expect(testServer.port).toBe(8080);
      expect(testServer.directory).toBeDefined();
    });
  });

  describe("start()", () => {
    it("should start server and call callback with port", () => {
      return new Promise<void>((resolve) => {
        server.start((actualPort) => {
          expect(actualPort).toBe(port);
          resolve();
        });
      });
    });
  });

  describe("handleRequest()", () => {
    let mockRes: any;
    let mockReq: any;

    beforeEach(() => {
      mockRes = {
        writeHead: vi.fn(),
        end: vi.fn(),
      };

      mockReq = {
        method: "GET",
        url: "/",
      };
    });

    it("should return 405 for non-GET/HEAD methods", () => {
      mockReq.method = "POST";

      server.handleRequest(mockReq, mockRes);

      expect(mockRes.writeHead).toHaveBeenCalledWith(405, {
        "Content-Type": "text/plain; charset=utf-8",
      });
      expect(mockRes.end).toHaveBeenCalledWith("Method Not Allowed");
    });

    it("should handle root path listing", () => {
      fs.writeFileSync(path.join(testDir, "test.txt"), "content");

      mockReq.url = "/";
      server.handleRequest(mockReq, mockRes);

      expect(mockRes.writeHead).toHaveBeenCalledWith(200, {
        "Content-Type": "text/html; charset=utf-8",
      });
      expect(mockRes.end).toHaveBeenCalled();
    });

    it("should handle file requests", () => {
      const testFile = path.join(testDir, "test.html");
      fs.writeFileSync(testFile, "<html><body>Test</body></html>");

      mockReq.url = "/test.html";
      server.handleRequest(mockReq, mockRes);

      expect(mockRes.writeHead).toHaveBeenCalledWith(200, {
        "Content-Type": "text/html; charset=utf-8",
      });
      expect(mockRes.end).toHaveBeenCalled();
    });

    it("should return 404 for non-existent files", () => {
      mockReq.url = "/nonexistent.txt";
      server.handleRequest(mockReq, mockRes);

      expect(mockRes.writeHead).toHaveBeenCalledWith(404, {
        "Content-Type": "text/plain; charset=utf-8",
      });
      expect(mockRes.end).toHaveBeenCalledWith("Not Found");
    });

    it("should return empty body for HEAD requests", () => {
      const testFile = path.join(testDir, "test.txt");
      fs.writeFileSync(testFile, "content");

      mockReq.method = "HEAD";
      mockReq.url = "/test.txt";
      server.handleRequest(mockReq, mockRes);

      expect(mockRes.writeHead).toHaveBeenCalled();
      expect(mockRes.end).toHaveBeenCalledWith("");
    });

    it("should handle directory requests", () => {
      fs.mkdirSync(path.join(testDir, "subdir"));
      fs.writeFileSync(path.join(testDir, "subdir", "file.txt"), "nested");

      mockReq.url = "/subdir";
      server.handleRequest(mockReq, mockRes);

      expect(mockRes.writeHead).toHaveBeenCalledWith(200, {
        "Content-Type": "text/html; charset=utf-8",
      });
      expect(mockRes.end).toHaveBeenCalled();
    });

    it("should handle URL-encoded paths", () => {
      fs.writeFileSync(path.join(testDir, "file with space.txt"), "content");

      mockReq.url = "/file%20with%20space.txt";
      server.handleRequest(mockReq, mockRes);

      expect(mockRes.writeHead).toHaveBeenCalledWith(200, {
        "Content-Type": "text/plain; charset=utf-8",
      });
    });
  });
});
