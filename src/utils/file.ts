export function getMimeType(fileName: string): string {
  const ext = fileName.split(".").pop()?.toLowerCase();
  switch (ext) {
    // Text
    case "html":
      return "text/html";
    case "css":
      return "text/css";
    case "js":
    case "ts":
      return "text/javascript";
    case "json":
      return "application/json";
    case "xml":
      return "application/xml";
    case "txt":
    case "md":
      return "text/plain";

    // Images
    case "png":
      return "image/png";
    case "jpg":
    case "jpeg":
      return "image/jpeg";
    case "gif":
      return "image/gif";
    case "svg":
      return "image/svg+xml";
    case "ico":
      return "image/x-icon";
    case "webp":
      return "image/webp";

    // Fonts
    case "woff":
      return "font/woff";
    case "woff2":
      return "font/woff2";
    case "ttf":
      return "font/ttf";
    case "eot":
      return "application/vnd.ms-fontobject";

    // Audio/Video
    case "mp3":
      return "audio/mpeg";
    case "mp4":
      return "video/mp4";
    case "webm":
      return "video/webm";
    case "ogg":
      return "audio/ogg";

    // Documents
    case "pdf":
      return "application/pdf";
    case "doc":
      return "application/msword";
    case "docx":
      return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    case "xls":
      return "application/vnd.ms-excel";
    case "xlsx":
      return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

    // Other
    case "wasm":
      return "application/wasm";
    case "zip":
      return "application/zip";

    default:
      return "application/octet-stream";
  }
}
