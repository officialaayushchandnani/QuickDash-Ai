import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * A utility function to conditionally and intelligently join CSS class names.
 *
 * This function combines two powerful utilities:
 * 1. `clsx`: For flexibly combining class names from strings, objects, or arrays.
 * It handles conditional logic gracefully.
 * 2. `tailwind-merge`: For intelligently merging Tailwind CSS utility classes,
 * so that conflicting styles are resolved automatically (e.g., `px-2` and `px-4` becomes `px-4`).
 *
 * @param {...ClassValue[]} inputs - A list of class names or conditions.
 * @returns {string} A string of final, merged class names.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}