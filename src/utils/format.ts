/**
 * 对字符串进行 HTML 转义，防止 XSS 攻击
 */
export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * 格式化数字大小为人类可读的字符串
 */
export function formatSize(size?: number, options?: FormatSizeOptions): string {
  if (size === undefined) return '-';
  if (size === 0) return '0 B';

  const units = options?.units ?? ['B', 'KB', 'MB', 'GB', 'TB'];
  const base = options?.base ?? 1024;
  const precision = options?.precision ?? 1;

  const index = Math.floor(Math.log(size) / Math.log(base));
  return `${(size / Math.pow(base, index)).toFixed(precision)} ${units[index]}`;
}

export interface FormatSizeOptions {
  /** 单位数组，默认 ['B', 'KB', 'MB', 'GB', 'TB'] */
  units?: string[];
  /** 进制基数，默认 1024 */
  base?: number;
  /** 小数位数，默认 1 */
  precision?: number;
}

/**
 * 格式化日期为字符串
 */
export function formatDate(date?: Date, options?: FormatDateOptions): string {
  if (!date) return '-';

  const format = options?.format ?? 'iso';

  switch (format) {
    case 'iso':
      return date.toISOString().replace('T', ' ').substring(0, 19);
    case 'date':
      return date.toLocaleDateString();
    case 'time':
      return date.toLocaleTimeString();
    case 'datetime':
      return date.toLocaleString();
    case 'custom':
      return options?.customFormat ?? date.toISOString();
    default:
      return date.toISOString();
  }
}

export interface FormatDateOptions {
  /** 格式化模式：'iso' | 'date' | 'time' | 'datetime' | 'custom' */
  format?: 'iso' | 'date' | 'time' | 'datetime' | 'custom';
  /** 自定义格式字符串（当 format='custom' 时使用） */
  customFormat?: string;
}
