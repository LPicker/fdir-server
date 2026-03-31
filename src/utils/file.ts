const MIME_TYPES: Record<string, string> = {
  // Text
  html: "text/html",
  css: "text/css",
  js: "text/javascript",
  ts: "text/javascript",
  json: "application/json",
  xml: "application/xml",
  txt: "text/plain",
  md: "text/plain",

  // Images
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  gif: "image/gif",
  svg: "image/svg+xml",
  ico: "image/x-icon",
  webp: "image/webp",

  // Fonts
  woff: "font/woff",
  woff2: "font/woff2",
  ttf: "font/ttf",
  eot: "application/vnd.ms-fontobject",

  // Audio/Video
  mp3: "audio/mpeg",
  mp4: "video/mp4",
  webm: "video/webm",
  ogg: "audio/ogg",

  // Documents
  pdf: "application/pdf",
  doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  xls: "application/vnd.ms-excel",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",

  // Other
  wasm: "application/wasm",
  zip: "application/zip",
};

export function getMimeType(fileName: string): string {
  const ext = fileName.split(".").pop()?.toLowerCase();
  if (!ext) return "application/octet-stream";
  return MIME_TYPES[ext] || "application/octet-stream";
}
