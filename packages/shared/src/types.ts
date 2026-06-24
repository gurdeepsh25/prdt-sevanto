/**
 * Shared types between Sevanto backend and all three frontends.
 * Mirrors the API envelopes and resource shapes from docs/08-api-design.md.
 */

export type Role = "CUSTOMER" | "WORKER" | "ADMIN";

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: Role;
  isEmailVerified: boolean;
  createdAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresIn: number; // seconds
  refreshTokenExpiresIn: number; // seconds
}

export interface AuthResponse {
  user: User;
  tokens: AuthTokens;
}

// =====================================================
// API envelopes
// =====================================================

export interface ErrorDetail {
  path?: string;
  issue: string;
}

export interface ApiError {
  code:
    | "VALIDATION_ERROR"
    | "UNAUTHENTICATED"
    | "FORBIDDEN"
    | "NOT_FOUND"
    | "CONFLICT"
    | "GONE"
    | "BUSINESS_RULE"
    | "RATE_LIMITED"
    | "INTERNAL";
  message: string;
  details?: ErrorDetail[];
}

export interface ApiErrorEnvelope {
  success: false;
  error: ApiError;
}

export interface ApiSuccessEnvelope<T> {
  success: true;
  data: T;
}

export type ApiResponse<T> = ApiSuccessEnvelope<T> | ApiErrorEnvelope;

// =====================================================
// Request payloads
// =====================================================

export interface SignupInput {
  email: string;
  password: string;
  fullName: string;
  role: Extract<Role, "CUSTOMER" | "WORKER">;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface ForgotPasswordInput {
  email: string;
}

export interface ResetPasswordInput {
  token: string;
  password: string;
}
