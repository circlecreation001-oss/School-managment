export const AUTH_CONSTANTS = {
  /** Maximum failed login attempts before lockout */
  MAX_LOGIN_ATTEMPTS: 5,
  /** Lockout duration in minutes after max failed attempts */
  LOCKOUT_DURATION_MINUTES: 30,
  /** Number of previous passwords to check against reuse */
  PASSWORD_HISTORY_COUNT: 5,
  /** Password reset token validity in minutes */
  RESET_TOKEN_EXPIRY_MINUTES: 30,
  /** Email verification token validity in hours */
  EMAIL_VERIFICATION_EXPIRY_HOURS: 24,
  /** Whether to rotate refresh tokens on use */
  REFRESH_TOKEN_ROTATION: true,
  /** Maximum concurrent sessions per user */
  SESSION_MAX_PER_USER: 5,
  /** Minimum password length */
  PASSWORD_MIN_LENGTH: 12,
  /** Bcrypt rounds for password hashing */
  BCRYPT_ROUNDS: 12,
} as const;

export const AUTH_ERRORS = {
  INVALID_CREDENTIALS: 'Invalid email or password',
  ACCOUNT_LOCKED: 'Account is locked due to too many failed login attempts. Try again later.',
  ACCOUNT_INACTIVE: 'Account is inactive. Please contact administrator.',
  ACCOUNT_SUSPENDED: 'Account has been suspended.',
  EMAIL_NOT_VERIFIED: 'Email address not verified. Please check your inbox.',
  TOKEN_EXPIRED: 'Token has expired',
  TOKEN_INVALID: 'Token is invalid',
  SESSION_REVOKED: 'Session has been revoked',
  PASSWORD_SAME_AS_OLD: 'New password cannot be the same as current password',
  PASSWORD_IN_HISTORY: 'This password was used recently. Choose a different password.',
  CURRENT_PASSWORD_WRONG: 'Current password is incorrect',
  TENANT_NOT_FOUND: 'Institution not found',
  USER_NOT_FOUND: 'User not found',
  EMAIL_ALREADY_EXISTS: 'A user with this email already exists',
  RESET_TOKEN_INVALID: 'Password reset token is invalid or has expired',
  VERIFICATION_TOKEN_INVALID: 'Email verification token is invalid or has expired',
} as const;
