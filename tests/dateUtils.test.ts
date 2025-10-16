/**
 * Deno tests for date utility functions
 * Run with: deno test tests/dateUtils.test.ts
 */

import { assertEquals } from "https://deno.land/std@0.208.0/assert/mod.ts";

// Date utility functions that could be useful in the app
function isDateInRange(date: Date, startDate: Date, endDate: Date): boolean {
  const timestamp = date.getTime();
  return timestamp >= startDate.getTime() && timestamp <= endDate.getTime();
}

function formatDateForDisplay(date: Date): string {
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  return date.toLocaleDateString("en-US", options);
}

function formatTimeForDisplay(date: Date): string {
  const options: Intl.DateTimeFormatOptions = {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  };
  return date.toLocaleTimeString("en-US", options);
}

function getDaysDifference(date1: Date, date2: Date): number {
  const oneDay = 24 * 60 * 60 * 1000; // milliseconds in a day
  return Math.round(Math.abs((date1.getTime() - date2.getTime()) / oneDay));
}

function isOverdue(dueDate: Date): boolean {
  return dueDate.getTime() < Date.now();
}

function getUpcomingDays(dueDate: Date): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);
  
  const diffTime = due.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

Deno.test("isDateInRange - date within range", () => {
  const date = new Date("2025-01-15");
  const start = new Date("2025-01-01");
  const end = new Date("2025-01-31");
  
  assertEquals(isDateInRange(date, start, end), true);
});

Deno.test("isDateInRange - date before range", () => {
  const date = new Date("2024-12-31");
  const start = new Date("2025-01-01");
  const end = new Date("2025-01-31");
  
  assertEquals(isDateInRange(date, start, end), false);
});

Deno.test("isDateInRange - date after range", () => {
  const date = new Date("2025-02-01");
  const start = new Date("2025-01-01");
  const end = new Date("2025-01-31");
  
  assertEquals(isDateInRange(date, start, end), false);
});

Deno.test("isDateInRange - date at start boundary", () => {
  const date = new Date("2025-01-01");
  const start = new Date("2025-01-01");
  const end = new Date("2025-01-31");
  
  assertEquals(isDateInRange(date, start, end), true);
});

Deno.test("isDateInRange - date at end boundary", () => {
  const date = new Date("2025-01-31");
  const start = new Date("2025-01-01");
  const end = new Date("2025-01-31");
  
  assertEquals(isDateInRange(date, start, end), true);
});

Deno.test("formatDateForDisplay - formats date correctly", () => {
  const date = new Date("2025-01-15T10:30:00");
  const formatted = formatDateForDisplay(date);
  
  assertEquals(formatted, "January 15, 2025");
});

Deno.test("formatTimeForDisplay - formats time correctly", () => {
  const date = new Date("2025-01-15T14:30:00");
  const formatted = formatTimeForDisplay(date);
  
  assertEquals(formatted, "2:30 PM");
});

Deno.test("getDaysDifference - calculates difference correctly", () => {
  const date1 = new Date("2025-01-01");
  const date2 = new Date("2025-01-10");
  
  assertEquals(getDaysDifference(date1, date2), 9);
});

Deno.test("getDaysDifference - works with reversed dates", () => {
  const date1 = new Date("2025-01-10");
  const date2 = new Date("2025-01-01");
  
  assertEquals(getDaysDifference(date1, date2), 9);
});

Deno.test("getDaysDifference - same date returns 0", () => {
  const date = new Date("2025-01-01");
  
  assertEquals(getDaysDifference(date, date), 0);
});

Deno.test("isOverdue - past date is overdue", () => {
  const pastDate = new Date("2020-01-01");
  
  assertEquals(isOverdue(pastDate), true);
});

Deno.test("isOverdue - future date is not overdue", () => {
  const futureDate = new Date("2030-01-01");
  
  assertEquals(isOverdue(futureDate), false);
});

Deno.test("getUpcomingDays - calculates days until due date", () => {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  assertEquals(getUpcomingDays(tomorrow), 1);
});

Deno.test("getUpcomingDays - negative for past dates", () => {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  assertEquals(getUpcomingDays(yesterday), -1);
});
