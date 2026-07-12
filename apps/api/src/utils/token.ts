import jwt from 'jsonwebtoken';
import { env } from '../config/index.js';
import type { TokenPayload, TokenPair } from '@erp/types';

/**
 * Generate an access token
 */
export function generateAccessToken(payload: Omit<TokenPayload, 'iat' | 'exp'>): string {
  return jwt.sign(payload, env.jwtAccessSecret as jwt.Secret, {
    expiresIn: env.jwtAccessExpiry as any,
  });
}

/**
 * Generate a refresh token
 */
export function generateRefreshToken(payload: Omit<TokenPayload, 'iat' | 'exp'>): string {
  return jwt.sign(payload, env.jwtRefreshSecret as jwt.Secret, {
    expiresIn: env.jwtRefreshExpiry as any,
  });
}

/**
 * Generate both access and refresh tokens
 */
export function generateTokenPair(payload: Omit<TokenPayload, 'iat' | 'exp'>): TokenPair {
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  // Parse expiry to seconds
  const expiresIn = parseExpiry(env.jwtAccessExpiry);

  return { accessToken, refreshToken, expiresIn };
}

/**
 * Verify and decode an access token
 */
export function verifyAccessToken(token: string): TokenPayload {
  return jwt.verify(token, env.jwtAccessSecret) as TokenPayload;
}

/**
 * Verify and decode a refresh token
 */
export function verifyRefreshToken(token: string): TokenPayload {
  return jwt.verify(token, env.jwtRefreshSecret) as TokenPayload;
}

/**
 * Parse expiry string (e.g., "15m", "7d") to seconds
 */
function parseExpiry(expiry: string): number {
  const units: Record<string, number> = { s: 1, m: 60, h: 3600, d: 86400 };
  const match = expiry.match(/^(\d+)([smhd])$/);
  if (!match) return 900; // Default 15 minutes
  const value = parseInt(match[1]!, 10);
  const unit = match[2]!;
  return value * (units[unit] || 1);
}
