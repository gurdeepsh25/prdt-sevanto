/**
 * Shared types between Sevanto backend and all three frontends.
 * Mirrors the API envelopes and resource shapes from docs/08-api-design.md.
 */

export type Role = "CUSTOMER" | "WORKER" | "ADMIN";

export interface User {
  id: string;
  email: string;
  fullName: string;
  phone: string | null;
  avatarUrl: string | null;
  role: Role;
  isActive: boolean;
  isEmailVerified: boolean;
  createdAt: string;
}

export interface Address {
  id: string;
  label: string | null;
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  lat: number | null;
  lng: number | null;
  isDefault: boolean;
  createdAt: string;
}

export interface UpdateProfileInput {
  fullName?: string;
  phone?: string | null;
  avatarUrl?: string | null;
}

export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
}

export interface AddressInput {
  label?: string | null;
  line1: string;
  line2?: string | null;
  city: string;
  state: string;
  postalCode: string;
  country?: string;
  lat?: number | null;
  lng?: number | null;
  isDefault?: boolean;
}

export interface AdminUserListQuery {
  page?: number;
  pageSize?: number;
  role?: Role;
  status?: "active" | "suspended";
  search?: string;
  sort?: "createdAt:asc" | "createdAt:desc" | "fullName:asc" | "fullName:desc";
}

export interface PaginatedUsers {
  items: User[];
  total: number;
  page: number;
  pageSize: number;
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
