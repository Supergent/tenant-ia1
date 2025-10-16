/**
 * Validation Helpers
 *
 * Pure functions for input validation.
 * NO database access, NO ctx parameter.
 */

/**
 * Validate task title
 */
export function isValidTaskTitle(title: string): boolean {
  return title.trim().length > 0 && title.length <= 200;
}

/**
 * Validate task description
 */
export function isValidTaskDescription(description: string): boolean {
  return description.length <= 2000;
}

/**
 * Validate tag name
 */
export function isValidTagName(name: string): boolean {
  return name.trim().length > 0 && name.length <= 50;
}

/**
 * Validate hex color
 */
export function isValidHexColor(color: string): boolean {
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
}

/**
 * Validate due date (must be in the future)
 */
export function isValidDueDate(dueDate: number): boolean {
  return dueDate > Date.now();
}

/**
 * Sanitize string input
 */
export function sanitizeString(input: string): string {
  return input.trim();
}
