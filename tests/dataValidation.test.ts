/**
 * Deno tests for data validation functions
 * Run with: deno test tests/dataValidation.test.ts
 */

import { assertEquals, assertExists } from "https://deno.land/std@0.208.0/assert/mod.ts";

// Type definitions (simplified versions from the app)
interface Group {
  id: string;
  name: string;
  description?: string;
  members: string[];
  createdBy: string;
  createdAt: Date;
  color?: string;
}

interface Event {
  id: string;
  title: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  groupId?: string;
  createdBy: string;
  color?: string;
  allDay?: boolean;
}

// Validation functions
function validateGroupName(name: string): string | undefined {
  if (!name.trim()) {
    return "Group name is required";
  }
  if (name.length < 3) {
    return "Group name must be at least 3 characters";
  }
  if (name.length > 50) {
    return "Group name must be at most 50 characters";
  }
  return undefined;
}

function validateEventTitle(title: string): string | undefined {
  if (!title.trim()) {
    return "Event title is required";
  }
  if (title.length > 100) {
    return "Event title must be at most 100 characters";
  }
  return undefined;
}

function validateEventDates(startDate: Date, endDate: Date): string | undefined {
  if (startDate.getTime() >= endDate.getTime()) {
    return "End date must be after start date";
  }
  return undefined;
}

function validateHexColor(color: string): boolean {
  return /^#[0-9A-F]{6}$/i.test(color);
}

function isGroupOwner(group: Group, userId: string): boolean {
  return group.createdBy === userId;
}

function isGroupMember(group: Group, userId: string): boolean {
  return group.members.includes(userId);
}

function canEditGroup(group: Group, userId: string): boolean {
  return isGroupOwner(group, userId);
}

function canViewGroup(group: Group, userId: string): boolean {
  return isGroupMember(group, userId) || isGroupOwner(group, userId);
}

// Tests
Deno.test("validateGroupName - empty name fails", () => {
  assertEquals(validateGroupName(""), "Group name is required");
  assertEquals(validateGroupName("   "), "Group name is required");
});

Deno.test("validateGroupName - short name fails", () => {
  assertEquals(
    validateGroupName("ab"),
    "Group name must be at least 3 characters"
  );
});

Deno.test("validateGroupName - long name fails", () => {
  const longName = "a".repeat(51);
  assertEquals(
    validateGroupName(longName),
    "Group name must be at most 50 characters"
  );
});

Deno.test("validateGroupName - valid name passes", () => {
  assertEquals(validateGroupName("Family Calendar"), undefined);
  assertEquals(validateGroupName("Work Team"), undefined);
});

Deno.test("validateEventTitle - empty title fails", () => {
  assertEquals(validateEventTitle(""), "Event title is required");
  assertEquals(validateEventTitle("   "), "Event title is required");
});

Deno.test("validateEventTitle - long title fails", () => {
  const longTitle = "a".repeat(101);
  assertEquals(
    validateEventTitle(longTitle),
    "Event title must be at most 100 characters"
  );
});

Deno.test("validateEventTitle - valid title passes", () => {
  assertEquals(validateEventTitle("Team Meeting"), undefined);
  assertEquals(validateEventTitle("Dentist Appointment"), undefined);
});

Deno.test("validateEventDates - end before start fails", () => {
  const start = new Date("2025-01-15T10:00:00");
  const end = new Date("2025-01-15T09:00:00");
  
  assertEquals(
    validateEventDates(start, end),
    "End date must be after start date"
  );
});

Deno.test("validateEventDates - same start and end fails", () => {
  const date = new Date("2025-01-15T10:00:00");
  
  assertEquals(
    validateEventDates(date, date),
    "End date must be after start date"
  );
});

Deno.test("validateEventDates - valid dates pass", () => {
  const start = new Date("2025-01-15T10:00:00");
  const end = new Date("2025-01-15T11:00:00");
  
  assertEquals(validateEventDates(start, end), undefined);
});

Deno.test("validateHexColor - valid colors", () => {
  assertEquals(validateHexColor("#FF0000"), true);
  assertEquals(validateHexColor("#00ff00"), true);
  assertEquals(validateHexColor("#0000FF"), true);
  assertEquals(validateHexColor("#ABC123"), true);
});

Deno.test("validateHexColor - invalid colors", () => {
  assertEquals(validateHexColor("FF0000"), false); // Missing #
  assertEquals(validateHexColor("#FF00"), false); // Too short
  assertEquals(validateHexColor("#FF00000"), false); // Too long
  assertEquals(validateHexColor("#GGGGGG"), false); // Invalid characters
  assertEquals(validateHexColor("red"), false); // Named color
});

Deno.test("isGroupOwner - returns true for owner", () => {
  const group: Group = {
    id: "1",
    name: "Test Group",
    members: ["user1", "user2"],
    createdBy: "user1",
    createdAt: new Date(),
  };
  
  assertEquals(isGroupOwner(group, "user1"), true);
});

Deno.test("isGroupOwner - returns false for non-owner", () => {
  const group: Group = {
    id: "1",
    name: "Test Group",
    members: ["user1", "user2"],
    createdBy: "user1",
    createdAt: new Date(),
  };
  
  assertEquals(isGroupOwner(group, "user2"), false);
});

Deno.test("isGroupMember - returns true for member", () => {
  const group: Group = {
    id: "1",
    name: "Test Group",
    members: ["user1", "user2"],
    createdBy: "user1",
    createdAt: new Date(),
  };
  
  assertEquals(isGroupMember(group, "user2"), true);
});

Deno.test("isGroupMember - returns false for non-member", () => {
  const group: Group = {
    id: "1",
    name: "Test Group",
    members: ["user1", "user2"],
    createdBy: "user1",
    createdAt: new Date(),
  };
  
  assertEquals(isGroupMember(group, "user3"), false);
});

Deno.test("canEditGroup - owner can edit", () => {
  const group: Group = {
    id: "1",
    name: "Test Group",
    members: ["user1", "user2"],
    createdBy: "user1",
    createdAt: new Date(),
  };
  
  assertEquals(canEditGroup(group, "user1"), true);
});

Deno.test("canEditGroup - member cannot edit", () => {
  const group: Group = {
    id: "1",
    name: "Test Group",
    members: ["user1", "user2"],
    createdBy: "user1",
    createdAt: new Date(),
  };
  
  assertEquals(canEditGroup(group, "user2"), false);
});

Deno.test("canViewGroup - owner can view", () => {
  const group: Group = {
    id: "1",
    name: "Test Group",
    members: ["user2"],
    createdBy: "user1",
    createdAt: new Date(),
  };
  
  assertEquals(canViewGroup(group, "user1"), true);
});

Deno.test("canViewGroup - member can view", () => {
  const group: Group = {
    id: "1",
    name: "Test Group",
    members: ["user2"],
    createdBy: "user1",
    createdAt: new Date(),
  };
  
  assertEquals(canViewGroup(group, "user2"), true);
});

Deno.test("canViewGroup - non-member cannot view", () => {
  const group: Group = {
    id: "1",
    name: "Test Group",
    members: ["user2"],
    createdBy: "user1",
    createdAt: new Date(),
  };
  
  assertEquals(canViewGroup(group, "user3"), false);
});
