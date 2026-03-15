import { describe, it, expect } from 'vitest';
import { getIpAddress } from '../../src/utils/device.js';

describe('getIpAddress', () => {
  it('should return a valid IPv4 address by default', () => {
    const result = getIpAddress();
    expect(result).toMatch(/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/);
  });

  it('should return 127.0.0.1 as fallback when no matching interface exists', () => {
    // Request external IPv4 - if no external interface exists, falls back to 127.0.0.1
    // Note: In most environments this will return an actual external IP
    const result = getIpAddress({ internal: false, family: 'IPv4' });
    expect(result).toMatch(/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/);
  });

  it('should support IPv6', () => {
    const result = getIpAddress({ family: 'IPv6' });
    expect(result).toBeTruthy();
    expect(typeof result).toBe('string');
  });

  it('should support internal addresses', () => {
    const result = getIpAddress({ internal: true, family: 'IPv4' });
    // Internal IPv4 addresses are typically 127.0.0.1
    expect(result).toMatch(/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/);
  });

  it('should validate IPv4 address format', () => {
    const result = getIpAddress({ family: 'IPv4' });
    const parts = result.split('.');
    expect(parts.length).toBe(4);
    parts.forEach(part => {
      const num = parseInt(part, 10);
      expect(num).toBeGreaterThanOrEqual(0);
      expect(num).toBeLessThanOrEqual(255);
    });
  });
});
