import { describe, it, expect } from 'vitest';
import { relativeTime } from '@/utils/exportUtils';

describe('relativeTime', () => {
  it('should return "Vừa xong" for very recent timestamps', () => {
    const now = new Date().toISOString();
    expect(relativeTime(now)).toBe('Vừa xong');
  });

  it('should return minutes ago for timestamps less than an hour', () => {
    const past = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    expect(relativeTime(past)).toBe('5 phút trước');
  });

  it('should return hours ago for timestamps less than a day', () => {
    const past = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
    expect(relativeTime(past)).toBe('2 giờ trước');
  });

  it('should return days ago for timestamps more than a day', () => {
    const past = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();
    expect(relativeTime(past)).toBe('3 ngày trước');
  });
});
