# Deno Tests

This directory contains Deno tests for the GroupCalendar app's utility functions and business logic.

## Running Tests

Make sure you have [Deno](https://deno.land/) installed.

### Run all tests:

```bash
deno task test
```

### Run tests in watch mode:

```bash
deno task test:watch
```

### Run a specific test file:

```bash
deno test tests/useForm.test.ts
deno test tests/dateUtils.test.ts
deno test tests/dataValidation.test.ts
```

## Test Files

### `useForm.test.ts`

Tests for form validation logic including:

- Required field validation
- Min/max length validation
- Pattern validation (email, etc.)
- Custom validation rules
- Password confirmation matching

### `dateUtils.test.ts`

Tests for date utility functions including:

- Date range validation
- Date formatting
- Days difference calculations
- Overdue date checking
- Upcoming days calculation

### `dataValidation.test.ts`

Tests for data validation functions including:

- Group name validation
- Event title validation
- Event date validation
- Color validation (hex colors)
- Permission checks (owner, member, edit, view)

## Test Coverage

These tests cover:

- ✅ Form validation rules
- ✅ Date manipulation utilities
- ✅ Data validation
- ✅ Permission checking
- ✅ Edge cases and boundary conditions

## Why Deno?

Deno is used for these tests because:

- No configuration needed - works out of the box
- Fast execution
- Built-in TypeScript support
- Secure by default
- Modern JavaScript/TypeScript runtime
- Excellent standard library

## Future Tests

Consider adding tests for:

- API service mocking
- Complex async operations
- State management logic
- Data transformation functions
