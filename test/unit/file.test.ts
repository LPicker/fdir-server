import { describe, it, expect } from 'vitest';
import { getMimeType } from '../../src/utils/file.js';

describe('getMimeType', () => {
  describe('Text files', () => {
    it('should return text/html for html files', () => {
      expect(getMimeType('index.html')).toBe('text/html');
    });

    it('should return text/css for css files', () => {
      expect(getMimeType('style.css')).toBe('text/css');
    });

    it('should return text/javascript for js and ts files', () => {
      expect(getMimeType('app.js')).toBe('text/javascript');
      expect(getMimeType('app.ts')).toBe('text/javascript');
    });

    it('should return application/json for json files', () => {
      expect(getMimeType('data.json')).toBe('application/json');
    });

    it('should return text/plain for txt and md files', () => {
      expect(getMimeType('readme.txt')).toBe('text/plain');
      expect(getMimeType('readme.md')).toBe('text/plain');
    });

    it('should return application/xml for xml files', () => {
      expect(getMimeType('config.xml')).toBe('application/xml');
    });
  });

  describe('Image files', () => {
    it('should return image/png for png files', () => {
      expect(getMimeType('image.png')).toBe('image/png');
    });

    it('should return image/jpeg for jpg and jpeg files', () => {
      expect(getMimeType('photo.jpg')).toBe('image/jpeg');
      expect(getMimeType('photo.jpeg')).toBe('image/jpeg');
    });

    it('should return image/gif for gif files', () => {
      expect(getMimeType('animation.gif')).toBe('image/gif');
    });

    it('should return image/svg+xml for svg files', () => {
      expect(getMimeType('icon.svg')).toBe('image/svg+xml');
    });

    it('should return image/x-icon for ico files', () => {
      expect(getMimeType('favicon.ico')).toBe('image/x-icon');
    });

    it('should return image/webp for webp files', () => {
      expect(getMimeType('photo.webp')).toBe('image/webp');
    });
  });

  describe('Font files', () => {
    it('should return font/woff for woff files', () => {
      expect(getMimeType('font.woff')).toBe('font/woff');
    });

    it('should return font/woff2 for woff2 files', () => {
      expect(getMimeType('font.woff2')).toBe('font/woff2');
    });

    it('should return font/ttf for ttf files', () => {
      expect(getMimeType('font.ttf')).toBe('font/ttf');
    });

    it('should return application/vnd.ms-fontobject for eot files', () => {
      expect(getMimeType('font.eot')).toBe('application/vnd.ms-fontobject');
    });
  });

  describe('Audio/Video files', () => {
    it('should return audio/mpeg for mp3 files', () => {
      expect(getMimeType('song.mp3')).toBe('audio/mpeg');
    });

    it('should return video/mp4 for mp4 files', () => {
      expect(getMimeType('video.mp4')).toBe('video/mp4');
    });

    it('should return video/webm for webm files', () => {
      expect(getMimeType('video.webm')).toBe('video/webm');
    });

    it('should return audio/ogg for ogg files', () => {
      expect(getMimeType('audio.ogg')).toBe('audio/ogg');
    });
  });

  describe('Document files', () => {
    it('should return application/pdf for pdf files', () => {
      expect(getMimeType('document.pdf')).toBe('application/pdf');
    });

    it('should return application/msword for doc files', () => {
      expect(getMimeType('document.doc')).toBe('application/msword');
    });

    it('should return application/vnd.openxmlformats-officedocument.wordprocessingml.document for docx files', () => {
      expect(getMimeType('document.docx')).toBe('application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    });

    it('should return application/vnd.ms-excel for xls files', () => {
      expect(getMimeType('spreadsheet.xls')).toBe('application/vnd.ms-excel');
    });

    it('should return application/vnd.openxmlformats-officedocument.spreadsheetml.sheet for xlsx files', () => {
      expect(getMimeType('spreadsheet.xlsx')).toBe('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    });
  });

  describe('Other files', () => {
    it('should return application/wasm for wasm files', () => {
      expect(getMimeType('module.wasm')).toBe('application/wasm');
    });

    it('should return application/zip for zip files', () => {
      expect(getMimeType('archive.zip')).toBe('application/zip');
    });
  });

  describe('Edge cases', () => {
    it('should return application/octet-stream for unknown extensions', () => {
      expect(getMimeType('file.unknown')).toBe('application/octet-stream');
    });

    it('should return application/octet-stream for files without extension', () => {
      expect(getMimeType('noextension')).toBe('application/octet-stream');
    });

    it('should handle uppercase extensions', () => {
      expect(getMimeType('file.TXT')).toBe('text/plain');
      expect(getMimeType('file.HTML')).toBe('text/html');
    });

    it('should handle files with multiple dots', () => {
      expect(getMimeType('file.min.js')).toBe('text/javascript');
      expect(getMimeType('archive.tar.gz')).toBe('application/octet-stream');
    });
  });
});
