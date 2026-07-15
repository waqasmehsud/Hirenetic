import { describe, it, expect } from "vitest";
import { createItemSchema, updateItemSchema } from "../../lib/validation/items.schema";

describe("createItemSchema", () => {
  it("should accept valid input with name only", () => {
    const result = createItemSchema.safeParse({ name: "Test Item" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe("Test Item");
      expect(result.data.description).toBeUndefined();
    }
  });

  it("should accept valid input with name and description", () => {
    const result = createItemSchema.safeParse({
      name: "Test Item",
      description: "A test description",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe("Test Item");
      expect(result.data.description).toBe("A test description");
    }
  });

  it("should accept valid input with null description", () => {
    const result = createItemSchema.safeParse({
      name: "Test Item",
      description: null,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.description).toBeNull();
    }
  });

  it("should reject missing name (empty object)", () => {
    const result = createItemSchema.safeParse({});
    expect(result.success).toBe(false);
    if (!result.success) {
      const nameError = result.error.issues.find((i) => i.path.includes("name"));
      expect(nameError).toBeDefined();
    }
  });

  it("should reject empty string name", () => {
    const result = createItemSchema.safeParse({ name: "" });
    expect(result.success).toBe(false);
    if (!result.success) {
      const nameError = result.error.issues.find((i) => i.path.includes("name"));
      expect(nameError).toBeDefined();
      expect(nameError!.message).toBe("Name is required");
    }
  });

  it("should reject name exceeding 100 characters", () => {
    const longName = "a".repeat(101);
    const result = createItemSchema.safeParse({ name: longName });
    expect(result.success).toBe(false);
    if (!result.success) {
      const nameError = result.error.issues.find((i) => i.path.includes("name"));
      expect(nameError).toBeDefined();
      expect(nameError!.message).toBe("Name must be under 100 characters");
    }
  });

  it("should accept name at exactly 100 characters", () => {
    const exactName = "a".repeat(100);
    const result = createItemSchema.safeParse({ name: exactName });
    expect(result.success).toBe(true);
  });

  it("should reject description exceeding 500 characters", () => {
    const longDesc = "b".repeat(501);
    const result = createItemSchema.safeParse({ name: "Valid", description: longDesc });
    expect(result.success).toBe(false);
    if (!result.success) {
      const descError = result.error.issues.find((i) => i.path.includes("description"));
      expect(descError).toBeDefined();
      expect(descError!.message).toBe("Description must be under 500 characters");
    }
  });

  it("should accept description at exactly 500 characters", () => {
    const exactDesc = "b".repeat(500);
    const result = createItemSchema.safeParse({ name: "Valid", description: exactDesc });
    expect(result.success).toBe(true);
  });

  it("should reject non-string name (number)", () => {
    const result = createItemSchema.safeParse({ name: 123 });
    expect(result.success).toBe(false);
  });

  it("should reject non-string name (boolean)", () => {
    const result = createItemSchema.safeParse({ name: true });
    expect(result.success).toBe(false);
  });

  it("should strip extra/unknown fields", () => {
    const result = createItemSchema.safeParse({
      name: "Test",
      description: "desc",
      extraField: "should be removed",
      anotherExtra: 42,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual({ name: "Test", description: "desc" });
      expect((result.data as Record<string, unknown>)["extraField"]).toBeUndefined();
      expect((result.data as Record<string, unknown>)["anotherExtra"]).toBeUndefined();
    }
  });
});

describe("updateItemSchema", () => {
  it("should accept partial update with name only", () => {
    const result = updateItemSchema.safeParse({ name: "Updated Name" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe("Updated Name");
      expect(result.data.description).toBeUndefined();
    }
  });

  it("should accept partial update with description only", () => {
    const result = updateItemSchema.safeParse({ description: "Updated description" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.description).toBe("Updated description");
      expect(result.data.name).toBeUndefined();
    }
  });

  it("should accept empty object (no required fields)", () => {
    const result = updateItemSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual({});
    }
  });

  it("should still enforce name max length of 100", () => {
    const longName = "a".repeat(101);
    const result = updateItemSchema.safeParse({ name: longName });
    expect(result.success).toBe(false);
    if (!result.success) {
      const nameError = result.error.issues.find((i) => i.path.includes("name"));
      expect(nameError).toBeDefined();
      expect(nameError!.message).toBe("Name must be under 100 characters");
    }
  });

  it("should still enforce description max length of 500", () => {
    const longDesc = "b".repeat(501);
    const result = updateItemSchema.safeParse({ description: longDesc });
    expect(result.success).toBe(false);
    if (!result.success) {
      const descError = result.error.issues.find((i) => i.path.includes("description"));
      expect(descError).toBeDefined();
      expect(descError!.message).toBe("Description must be under 500 characters");
    }
  });

  it("should accept full valid update with both fields", () => {
    const result = updateItemSchema.safeParse({
      name: "New Name",
      description: "New description",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual({ name: "New Name", description: "New description" });
    }
  });

  it("should accept null description in partial update", () => {
    const result = updateItemSchema.safeParse({ description: null });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.description).toBeNull();
    }
  });
});
