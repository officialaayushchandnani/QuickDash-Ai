// We are using the testing library "vitest" to define our tests.
import { describe, it, expect } from "vitest";
// This is the function we want to test.
import { cn } from "./utils";

// The 'describe' block groups all related tests for our `cn` function.
describe("cn utility function", () => {
  // Test case 1: Checking the most basic functionality.
  // It should take multiple strings and join them with spaces.
  it("should merge multiple class names into a single string", () => {
    expect(cn("text-red-500", "bg-blue-500")).toBe("text-red-500 bg-blue-500");
  });

  // Test case 2: Checking how it handles conditions that are true.
  // If a condition is true, the class should be included.
  it("should include classes when the condition is true", () => {
    const isActive = true;
    expect(cn("base-class", isActive && "active-class")).toBe(
      "base-class active-class"
    );
  });

  // Test case 3: Checking how it handles conditions that are false.
  // Falsy values like `false` or `null` should be ignored and not added to the string.
  it("should ignore falsy values like false, null, or undefined", () => {
    const isActive = false;
    expect(cn("base-class", isActive && "active-class", null)).toBe(
      "base-class"
    );
  });

  // Test case 4: This is the most important test for Tailwind CSS projects.
  // It checks if conflicting classes are merged correctly, with the last one winning.
  it("should intelligently merge conflicting Tailwind CSS classes", () => {
    // `px-4` should override the `px-2` from earlier in the string.
    expect(cn("px-2 py-1", "px-4")).toBe("py-1 px-4");
  });

  // Test case 5: Checking a common pattern for conditional classes.
  // It should be able to take an object where keys are class names
  // and values are booleans indicating if they should be included.
  it("should correctly apply classes from an object", () => {
    expect(cn("base", { conditional: true, "not-included": false })).toBe(
      "base conditional"
    );
  });
});