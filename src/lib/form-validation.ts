export function normalizeDigits(value: string, maxLength = 10) {
  return value.replace(/\D/g, "").slice(0, maxLength);
}

export function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export function isValidPhone(value: string) {
  return /^\d{10}$/.test(value.trim());
}

export function isValidName(value: string, minLength = 2) {
  return value.trim().length >= minLength;
}

export function isValidMessage(value: string, minLength = 10) {
  return value.trim().length >= minLength;
}
