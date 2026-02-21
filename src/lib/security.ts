/**
 * Security utilities for input validation and sanitization
 */

/**
 * Sanitize HTML content by removing potential XSS vectors
 */
export const sanitizeHtml = (input: string): string => {
  if (!input) return "";

  const div = document.createElement("div");
  div.textContent = input;
  return div.innerHTML;
};

/**
 * Validate email format
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate phone number (basic validation)
 */
export const isValidPhoneNumber = (phone: string): boolean => {
  const phoneRegex = /^(\+62|0)[0-9]{9,12}$/;
  return phoneRegex.test(phone.replace(/\s+/g, ""));
};

/**
 * Validate URL format
 */
export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Sanitize user input for database operations
 */
export const sanitizeInput = (input: string): string => {
  if (!input) return "";

  // Remove potential SQL injection patterns
  let sanitized = input.trim();

  // Remove excessive whitespace
  sanitized = sanitized.replace(/\s+/g, " ");

  // Limit length
  sanitized = sanitized.substring(0, 1000);

  return sanitized;
};

/**
 * Validate hospital data before submission
 */
export const validateHospitalData = (
  data: Record<string, unknown>,
): {
  valid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];
  const nameStr = typeof data.name === "string" ? data.name : "";
  const addressStr = typeof data.address === "string" ? data.address : "";
  const phoneStr = typeof data.phone === "string" ? data.phone : "";
  const imageStr = typeof data.image === "string" ? data.image : "";
  const emailStr = typeof data.email === "string" ? data.email : "";

  if (!nameStr.trim()) {
    errors.push("Nama rumah sakit harus diisi");
  }

  if (!addressStr.trim()) {
    errors.push("Alamat harus diisi");
  }

  if (!phoneStr.trim() || !isValidPhoneNumber(phoneStr)) {
    errors.push("Nomor telepon harus valid");
  }

  if (!data.city) {
    errors.push("Kota harus dipilih");
  }

  if (!imageStr.trim() || !isValidUrl(imageStr)) {
    errors.push("URL gambar harus valid");
  }

  if (emailStr && !isValidEmail(emailStr)) {
    errors.push("Format email tidak valid");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

/**
 * Rate limiting helper
 */
export class RateLimiter {
  private readonly attempts: Map<string, number[]> = new Map();
  private readonly maxAttempts: number;
  private readonly windowMs: number;

  constructor(maxAttempts: number = 5, windowMs: number = 60000) {
    this.maxAttempts = maxAttempts;
    this.windowMs = windowMs;
  }

  isAllowed(key: string): boolean {
    const now = Date.now();
    const attempts = this.attempts.get(key) || [];

    // Remove old attempts outside the window
    const recentAttempts = attempts.filter(
      (time) => now - time < this.windowMs,
    );

    if (recentAttempts.length >= this.maxAttempts) {
      return false;
    }

    recentAttempts.push(now);
    this.attempts.set(key, recentAttempts);

    // Cleanup old entries
    if (this.attempts.size > 1000) {
      const oldestKey = this.attempts.keys().next().value;
      this.attempts.delete(oldestKey);
    }

    return true;
  }

  reset(key: string): void {
    this.attempts.delete(key);
  }
}

export default {
  sanitizeHtml,
  isValidEmail,
  isValidPhoneNumber,
  isValidUrl,
  sanitizeInput,
  validateHospitalData,
  RateLimiter,
};
