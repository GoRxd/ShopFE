import { describe, it, expect, beforeEach } from 'vitest';
import { TranslateService } from './translate.service';

describe('TranslateService', () => {
  let service: TranslateService;

  beforeEach(() => {
    service = new TranslateService();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should translate exact match', () => {
    const result = service.translate('insufficient stock');
    expect(result).toBe('Niewystarczająca ilość produktu w magazynie');
  });

  it('should translate case-insensitive match', () => {
    const result = service.translate('Insufficient Stock');
    expect(result).toBe('Niewystarczająca ilość produktu w magazynie');
  });

  it('should translate partial match', () => {
    const result = service.translate('Error: insufficient stock for product XYZ');
    expect(result).toBe('Niewystarczająca ilość produktu w magazynie');
  });

  it('should return original message if no translation found', () => {
    const unknownError = 'Something went terribly wrong';
    const result = service.translate(unknownError);
    expect(result).toBe(unknownError);
  });

  it('should handle empty or null values', () => {
    expect(service.translate(null)).toBe('');
    expect(service.translate('')).toBe('');
  });
});
