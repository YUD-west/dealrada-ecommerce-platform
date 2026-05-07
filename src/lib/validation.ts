/** Shared auth input validation (server + client). */

export const EMAIL_MAX_LEN = 254;
export const NAME_MAX_LEN = 120;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateName(name: string): string | null {
  const t = name.trim();
  if (!t) return "Name is required.";
  if (t.length > NAME_MAX_LEN) return `Name must be at most ${NAME_MAX_LEN} characters.`;
  return null;
}

export function validateEmail(email: string): string | null {
  const t = email.trim().toLowerCase();
  if (!t) return "Email is required.";
  if (t.length > EMAIL_MAX_LEN) return "Email is too long.";
  if (!EMAIL_RE.test(t)) return "Enter a valid email address.";
  return null;
}

/** Signup + password change: length + letter + digit. */
export function validateNewPassword(password: string): string | null {
  if (!password) return "Password is required.";
  if (password.length < 8) return "Password must be at least 8 characters.";
  if (password.length > 128) return "Password must be at most 128 characters.";
  if (!/[a-zA-Z]/.test(password)) {
    return "Password must include at least one letter.";
  }
  if (!/[0-9]/.test(password)) {
    return "Password must include at least one number.";
  }
  return null;
}

export function validateLoginPassword(password: string): string | null {
  if (!password) return "Password is required.";
  if (password.length > 128) return "Invalid input.";
  return null;
}
