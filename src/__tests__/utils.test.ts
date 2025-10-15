/**
 * Data Service Tests
 * Tests for data validation utilities
 */

describe('Data Service Utilities', () => {
  describe('Email Validation', () => {
    const validateEmail = (email: string): boolean => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
    };

    test('should validate correct email addresses', () => {
      expect(validateEmail('test@example.com')).toBe(true);
      expect(validateEmail('user.name@domain.co.uk')).toBe(true);
      expect(validateEmail('user+tag@example.com')).toBe(true);
    });

    test('should reject invalid email addresses', () => {
      expect(validateEmail('invalid')).toBe(false);
      expect(validateEmail('test@')).toBe(false);
      expect(validateEmail('@example.com')).toBe(false);
      expect(validateEmail('test @example.com')).toBe(false);
    });

    test('should reject empty email', () => {
      expect(validateEmail('')).toBe(false);
    });
  });

  describe('Password Validation', () => {
    const validatePassword = (password: string): { valid: boolean; message?: string } => {
      if (password.length < 6) {
        return { valid: false, message: 'Password must be at least 6 characters' };
      }
      return { valid: true };
    };

    test('should validate strong passwords', () => {
      expect(validatePassword('password123').valid).toBe(true);
      expect(validatePassword('MyP@ssw0rd').valid).toBe(true);
    });

    test('should reject weak passwords', () => {
      const result = validatePassword('12345');
      expect(result.valid).toBe(false);
      expect(result.message).toBe('Password must be at least 6 characters');
    });

    test('should reject empty password', () => {
      const result = validatePassword('');
      expect(result.valid).toBe(false);
    });
  });

  describe('Date Utilities', () => {
    test('should format date correctly', () => {
      const date = new Date('2025-10-15T12:00:00Z');
      const formatted = date.toISOString().split('T')[0];
      expect(formatted).toBe('2025-10-15');
    });

    test('should compare dates correctly', () => {
      const date1 = new Date('2025-10-15');
      const date2 = new Date('2025-10-16');
      expect(date1.getTime() < date2.getTime()).toBe(true);
    });
  });
});
