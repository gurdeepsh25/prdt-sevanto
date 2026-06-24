import type {
  ApiResponse,
  AuthResponse,
  SignupInput,
  LoginInput,
  ForgotPasswordInput,
  ResetPasswordInput,
  User,
  Address,
  UpdateProfileInput,
  ChangePasswordInput,
  AddressInput,
  AdminUserListQuery,
  PaginatedUsers,
} from "./types";

/**
 * Sevanto API client. Works in both browser and server contexts.
 *
 * - Uses credentials: 'include' so the refresh cookie flows.
 * - On 401, attempts one silent refresh + retry.
 * - All endpoints live under `${baseUrl}/api/v1`.
 */
export class ApiError extends Error {
  public readonly code: string;
  public readonly status: number;
  public readonly details?: Array<{ path?: string; issue: string }>;

  constructor(
    status: number,
    code: string,
    message: string,
    details?: Array<{ path?: string; issue: string }>,
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export interface ApiClientOptions {
  baseUrl: string;
  /** Called by the client when it needs to persist updated tokens. */
  onTokens?: (tokens: { accessToken: string; refreshToken: string }) => void;
  /** Called when tokens must be cleared (logout, refresh failure). */
  onClearTokens?: () => void;
  /** Provide a way to read the current refresh token for silent refresh. */
  getRefreshToken?: () => string | null;
}

export class ApiClient {
  private accessToken: string | null = null;
  private refreshInFlight: Promise<void> | null = null;

  constructor(private readonly opts: ApiClientOptions) {}

  setAccessToken(token: string | null): void {
    this.accessToken = token;
  }

  // =====================================================
  // Low-level fetch
  // =====================================================
  async request<T>(
    path: string,
    init: RequestInit & { auth?: boolean } = {},
  ): Promise<T> {
    const headers = new Headers(init.headers);
    if (init.body && !headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }

    const authNeeded = init.auth !== false && !!this.accessToken;
    if (authNeeded && this.accessToken) {
      headers.set("Authorization", `Bearer ${this.accessToken}`);
    }

    const res = await fetch(`${this.opts.baseUrl}${path}`, {
      ...init,
      headers,
      credentials: "include",
    });

    // Try to parse JSON regardless of status.
    let body: ApiResponse<T> | null = null;
    try {
      body = (await res.json()) as ApiResponse<T>;
    } catch {
      // Non-JSON response.
    }

    if (res.status === 401 && authNeeded && this.opts.getRefreshToken) {
      // Attempt one silent refresh.
      await this.silentRefresh();
      // Retry once with the new access token.
      if (this.accessToken) {
        headers.set("Authorization", `Bearer ${this.accessToken}`);
        const retry = await fetch(`${this.opts.baseUrl}${path}`, {
          ...init,
          headers,
          credentials: "include",
        });
        body = (await retry.json()) as ApiResponse<T>;
        return this.unwrap(body);
      }
    }

    return this.unwrap(body);
  }

  private unwrap<T>(body: ApiResponse<T> | null): T {
    if (!body) throw new ApiError(0, "INTERNAL", "Empty response from server");
    if (!body.success) {
      throw new ApiError(
        0,
        body.error.code,
        body.error.message,
        body.error.details,
      );
    }
    return body.data;
  }

  private async silentRefresh(): Promise<void> {
    if (this.refreshInFlight) return this.refreshInFlight;
    const refreshToken = this.opts.getRefreshToken?.();
    if (!refreshToken)
      throw new ApiError(401, "UNAUTHENTICATED", "No refresh token");

    this.refreshInFlight = (async () => {
      try {
        const res = await fetch(`${this.opts.baseUrl}/api/v1/auth/refresh`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ refreshToken }),
        });
        const body = (await res.json()) as ApiResponse<AuthResponse>;
        if (!body.success)
          throw new ApiError(401, body.error.code, body.error.message);
        this.accessToken = body.data.tokens.accessToken;
        this.opts.onTokens?.({
          accessToken: body.data.tokens.accessToken,
          refreshToken: body.data.tokens.refreshToken,
        });
      } catch {
        this.opts.onClearTokens?.();
        throw new ApiError(401, "UNAUTHENTICATED", "Session expired");
      } finally {
        this.refreshInFlight = null;
      }
    })();

    return this.refreshInFlight;
  }

  // =====================================================
  // Auth endpoints
  // =====================================================
  signup(input: SignupInput): Promise<AuthResponse> {
    return this.request<AuthResponse>("/api/v1/auth/signup", {
      method: "POST",
      body: JSON.stringify(input),
      auth: false,
    });
  }

  login(input: LoginInput): Promise<AuthResponse> {
    return this.request<AuthResponse>("/api/v1/auth/login", {
      method: "POST",
      body: JSON.stringify(input),
      auth: false,
    });
  }

  logout(refreshToken?: string): Promise<{ ok: true }> {
    return this.request<{ ok: true }>("/api/v1/auth/logout", {
      method: "POST",
      body: JSON.stringify(refreshToken ? { refreshToken } : {}),
      auth: false,
    });
  }

  forgotPassword(input: ForgotPasswordInput): Promise<{ ok: true }> {
    return this.request<{ ok: true }>("/api/v1/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify(input),
      auth: false,
    });
  }

  resetPassword(input: ResetPasswordInput): Promise<{ ok: true }> {
    return this.request<{ ok: true }>("/api/v1/auth/reset-password", {
      method: "POST",
      body: JSON.stringify(input),
      auth: false,
    });
  }

  verifyEmail(token: string): Promise<{ user: User }> {
    return this.request<{ user: User }>(
      `/api/v1/auth/verify-email?token=${encodeURIComponent(token)}`,
      {
        auth: false,
      },
    );
  }

  resendVerification(email: string): Promise<{ ok: true }> {
    return this.request<{ ok: true }>("/api/v1/auth/resend-verification", {
      method: "POST",
      body: JSON.stringify({ email }),
      auth: false,
    });
  }

  // =====================================================
  // User profile endpoints (Phase 2)
  // =====================================================
  getMe(): Promise<{ user: User }> {
    return this.request<{ user: User }>("/api/v1/users/me");
  }

  updateProfile(input: UpdateProfileInput): Promise<{ user: User }> {
    return this.request<{ user: User }>("/api/v1/users/me", {
      method: "PATCH",
      body: JSON.stringify(input),
    });
  }

  changePassword(input: ChangePasswordInput): Promise<{ ok: true }> {
    return this.request<{ ok: true }>("/api/v1/users/me/password", {
      method: "POST",
      body: JSON.stringify(input),
    });
  }

  deleteAccount(refreshToken?: string): Promise<{ ok: true }> {
    return this.request<{ ok: true }>("/api/v1/users/me/delete", {
      method: "POST",
      body: JSON.stringify(refreshToken ? { refreshToken } : {}),
    });
  }

  avatarUploadTicket(): Promise<{
    key: string;
    url: string;
    expiresAt: string;
  }> {
    return this.request<{ key: string; url: string; expiresAt: string }>(
      "/api/v1/users/me/avatar",
      { method: "POST" },
    );
  }

  // =====================================================
  // Address endpoints (Phase 2)
  // =====================================================
  listAddresses(): Promise<{ items: Address[] }> {
    return this.request<{ items: Address[] }>("/api/v1/users/me/addresses");
  }

  createAddress(input: AddressInput): Promise<{ address: Address }> {
    return this.request<{ address: Address }>("/api/v1/users/me/addresses", {
      method: "POST",
      body: JSON.stringify(input),
    });
  }

  updateAddress(
    id: string,
    input: Partial<AddressInput>,
  ): Promise<{ address: Address }> {
    return this.request<{ address: Address }>(
      `/api/v1/users/me/addresses/${id}`,
      {
        method: "PATCH",
        body: JSON.stringify(input),
      },
    );
  }

  deleteAddress(id: string): Promise<{ ok: true }> {
    return this.request<{ ok: true }>(`/api/v1/users/me/addresses/${id}`, {
      method: "DELETE",
    });
  }

  // =====================================================
  // Admin endpoints (Phase 2)
  // =====================================================
  adminListUsers(query: AdminUserListQuery = {}): Promise<PaginatedUsers> {
    const params = new URLSearchParams();
    if (query.page) params.set("page", String(query.page));
    if (query.pageSize) params.set("pageSize", String(query.pageSize));
    if (query.role) params.set("role", query.role);
    if (query.status) params.set("status", query.status);
    if (query.search) params.set("search", query.search);
    if (query.sort) params.set("sort", query.sort);
    const qs = params.toString();
    return this.request<PaginatedUsers>(`/api/v1/users${qs ? `?${qs}` : ""}`);
  }

  adminGetUser(id: string): Promise<{ user: User }> {
    return this.request<{ user: User }>(`/api/v1/users/${id}`);
  }

  adminUpdateUser(
    id: string,
    input: { isActive?: boolean },
  ): Promise<{ user: User }> {
    return this.request<{ user: User }>(`/api/v1/users/${id}`, {
      method: "PATCH",
      body: JSON.stringify(input),
    });
  }
}
