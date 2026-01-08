import { describe, it, expect } from 'vitest';
import { cn } from './utils';

describe('cn utility function', () => {
  it('should merge class names correctly', () => {
    const result = cn('base-class', 'additional-class');
    expect(result).toBe('base-class additional-class');
  });

  it('should handle conditional classes', () => {
    const condition = true;
    const result = cn('base', condition && 'conditional');
    expect(result).toBe('base conditional');
  });

  it('should filter out falsy values', () => {
    const result = cn('base', false, null, undefined, 0, '', 'valid');
    expect(result).toBe('base valid');
  });

  it('should merge Tailwind classes correctly', () => {
    // Test that conflicting Tailwind classes are properly merged
    const result = cn('p-4 text-center', 'p-8');
    expect(result).toBe('text-center p-8');
  });

  it('should handle arrays of classes', () => {
    const result = cn(['base', 'array'], 'additional');
    expect(result).toBe('base array additional');
  });

  it('should handle object notation', () => {
    const result = cn({
      'base': true,
      'active': true,
      'disabled': false
    });
    expect(result).toBe('base active');
  });

  it('should work with no arguments', () => {
    const result = cn();
    expect(result).toBe('');
  });

  it('should handle complex nested structures', () => {
    const result = cn(
      'base',
      ['array-1', 'array-2'],
      {
        'object-true': true,
        'object-false': false
      },
      'final'
    );
    expect(result).toContain('base');
    expect(result).toContain('array-1');
    expect(result).toContain('array-2');
    expect(result).toContain('object-true');
    expect(result).not.toContain('object-false');
    expect(result).toContain('final');
  });
});