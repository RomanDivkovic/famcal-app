/**
 * Deno tests for useForm hook validation logic
 * Run with: deno test tests/useForm.test.ts
 */

import { assertEquals, assertExists } from "https://deno.land/std@0.208.0/assert/mod.ts";

// Mock validation functions extracted from useForm hook
interface ValidationRules {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: string) => string | undefined;
}

function validateField(
  name: string,
  value: string,
  rules: ValidationRules
): string | undefined {
  if (rules.required && !value.trim()) {
    return `${name} is required`;
  }

  if (rules.minLength && value.length < rules.minLength) {
    return `${name} must be at least ${rules.minLength} characters`;
  }

  if (rules.maxLength && value.length > rules.maxLength) {
    return `${name} must be at most ${rules.maxLength} characters`;
  }

  if (rules.pattern && !rules.pattern.test(value)) {
    return `${name} is invalid`;
  }

  if (rules.custom) {
    return rules.custom(value);
  }

  return undefined;
}

Deno.test("validateField - required field validation", () => {
  const rules: ValidationRules = { required: true };
  
  // Empty string should fail
  assertEquals(validateField("email", "", rules), "email is required");
  
  // Whitespace only should fail
  assertEquals(validateField("email", "   ", rules), "email is required");
  
  // Valid value should pass
  assertEquals(validateField("email", "test@example.com", rules), undefined);
});

Deno.test("validateField - minLength validation", () => {
  const rules: ValidationRules = { minLength: 6 };
  
  // Too short should fail
  assertEquals(
    validateField("password", "12345", rules),
    "password must be at least 6 characters"
  );
  
  // Exact length should pass
  assertEquals(validateField("password", "123456", rules), undefined);
  
  // Longer than min should pass
  assertEquals(validateField("password", "1234567890", rules), undefined);
});

Deno.test("validateField - maxLength validation", () => {
  const rules: ValidationRules = { maxLength: 10 };
  
  // Too long should fail
  assertEquals(
    validateField("username", "12345678901", rules),
    "username must be at most 10 characters"
  );
  
  // Exact length should pass
  assertEquals(validateField("username", "1234567890", rules), undefined);
  
  // Shorter than max should pass
  assertEquals(validateField("username", "12345", rules), undefined);
});

Deno.test("validateField - pattern validation for email", () => {
  const emailPattern = /\S+@\S+\.\S+/;
  const rules: ValidationRules = { pattern: emailPattern };
  
  // Invalid emails should fail
  assertEquals(validateField("email", "invalid", rules), "email is invalid");
  assertEquals(validateField("email", "invalid@", rules), "email is invalid");
  assertEquals(validateField("email", "@example.com", rules), "email is invalid");
  
  // Valid emails should pass
  assertEquals(validateField("email", "test@example.com", rules), undefined);
  assertEquals(validateField("email", "user.name@example.co.uk", rules), undefined);
});

Deno.test("validateField - custom validation", () => {
  const customRule = (value: string) => {
    return value === "password123" ? "Password is too common" : undefined;
  };
  
  const rules: ValidationRules = { custom: customRule };
  
  // Custom validation should fail
  assertEquals(
    validateField("password", "password123", rules),
    "Password is too common"
  );
  
  // Custom validation should pass
  assertEquals(validateField("password", "securePass456!", rules), undefined);
});

Deno.test("validateField - combined rules", () => {
  const rules: ValidationRules = {
    required: true,
    minLength: 6,
    pattern: /^[a-zA-Z0-9]+$/,
  };
  
  // Empty should fail on required
  assertEquals(validateField("username", "", rules), "username is required");
  
  // Too short should fail on minLength
  assertEquals(
    validateField("username", "test", rules),
    "username must be at least 6 characters"
  );
  
  // Invalid pattern should fail
  assertEquals(
    validateField("username", "test@123", rules),
    "username is invalid"
  );
  
  // Valid value should pass all rules
  assertEquals(validateField("username", "test123", rules), undefined);
});

Deno.test("validateField - password confirmation", () => {
  const password = "myPassword123";
  const customRule = (value: string) => {
    return value !== password ? "Passwords do not match" : undefined;
  };
  
  const rules: ValidationRules = { custom: customRule };
  
  // Mismatch should fail
  assertEquals(
    validateField("confirmPassword", "differentPassword", rules),
    "Passwords do not match"
  );
  
  // Match should pass
  assertEquals(validateField("confirmPassword", "myPassword123", rules), undefined);
});
