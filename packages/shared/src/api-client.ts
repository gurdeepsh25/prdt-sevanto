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
  PublicWorkerList,
  PublicWorkerListQuery,
  PublicWorkerDetail,
  WorkerProfileCore,
  WorkerPortfolioInput,
  WorkerPortfolioItem,
  UpsertSkillsInput,
  MyWorkerProfileResponse,
  SkillCatalog,
  SkillCatalogItem,
  PendingWorkerQueue,
  PendingWorkerQuery,
  CategoryWithSubs,
  PublicCategoryListItem,
  SubcategoryRef,
  CategoryCreateInput,
  CategoryUpdateInput,
  SubcategoryCreateInput,
  SubcategoryUpdateInput,
  SkillCreateInput,
  SkillUpdateInput,
  PublicSkillsQuery,
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

  // =====================================================
  // Phase 3 — Worker Profiles (public)
  // =====================================================

  listPublicWorkers(
    query: PublicWorkerListQuery = {},
  ): Promise<PublicWorkerList> {
    const params = new URLSearchParams();
    if (query.page) params.set("page", String(query.page));
    if (query.pageSize) params.set("pageSize", String(query.pageSize));
    if (query.city) params.set("city", query.city);
    if (query.skill) params.set("skill", query.skill);
    if (query.minRating !== undefined)
      params.set("minRating", String(query.minRating));
    if (query.verifiedOnly) params.set("verifiedOnly", "true");
    if (query.sort) params.set("sort", query.sort);
    const qs = params.toString();
    return this.request<PublicWorkerList>(
      `/api/v1/workers${qs ? `?${qs}` : ""}`,
    );
  }

  getPublicWorker(id: string): Promise<PublicWorkerDetail> {
    return this.request<PublicWorkerDetail>(`/api/v1/workers/${id}`);
  }

  // =====================================================
  // Phase 3 — Worker self-service
  // =====================================================

  getMyWorkerProfile(): Promise<MyWorkerProfileResponse> {
    return this.request<MyWorkerProfileResponse>(`/api/v1/workers/me`);
  }

  upsertMyWorkerProfile(
    input: WorkerProfileCore,
  ): Promise<MyWorkerProfileResponse> {
    return this.request<MyWorkerProfileResponse>(`/api/v1/workers/me`, {
      method: "PUT",
      body: JSON.stringify(input),
    });
  }

  patchMyWorkerProfile(
    input: Partial<WorkerProfileCore>,
  ): Promise<MyWorkerProfileResponse> {
    return this.request<MyWorkerProfileResponse>(`/api/v1/workers/me`, {
      method: "PATCH",
      body: JSON.stringify(input),
    });
  }

  upsertMySkills(input: UpsertSkillsInput): Promise<{ count: number }> {
    return this.request<{ count: number }>(`/api/v1/workers/me/skills`, {
      method: "PUT",
      body: JSON.stringify(input),
    });
  }

  listMyPortfolio(): Promise<{ items: WorkerPortfolioItem[] }> {
    return this.request<{ items: WorkerPortfolioItem[] }>(
      `/api/v1/workers/me/portfolio`,
    );
  }

  addMyPortfolioItem(
    input: WorkerPortfolioInput,
  ): Promise<{ item: WorkerPortfolioItem }> {
    return this.request<{ item: WorkerPortfolioItem }>(
      `/api/v1/workers/me/portfolio`,
      {
        method: "POST",
        body: JSON.stringify(input),
      },
    );
  }

  deleteMyPortfolioItem(id: string): Promise<{ ok: true }> {
    return this.request<{ ok: true }>(`/api/v1/workers/me/portfolio/${id}`, {
      method: "DELETE",
    });
  }

  // =====================================================
  // Phase 3 — Skill catalog (public)
  // =====================================================

  listSkills(): Promise<SkillCatalog> {
    return this.request<SkillCatalog>(`/api/v1/skills`);
  }

  // =====================================================
  // Phase 3 — Admin verification queue
  // =====================================================

  adminListPendingWorkers(
    _query: PendingWorkerQuery = {},
  ): Promise<PendingWorkerQueue> {
    return this.request<PendingWorkerQueue>(`/api/v1/admin/workers/pending`);
  }

  adminVerifyWorker(
    profileId: string,
  ): Promise<{ profile: { id: string; isVerified: boolean } }> {
    return this.request<{ profile: { id: string; isVerified: boolean } }>(
      `/api/v1/admin/workers/${profileId}/verify`,
      { method: "POST" },
    );
  }

  adminUnverifyWorker(
    profileId: string,
  ): Promise<{ profile: { id: string; isVerified: boolean } }> {
    return this.request<{ profile: { id: string; isVerified: boolean } }>(
      `/api/v1/admin/workers/${profileId}/verify`,
      { method: "DELETE" },
    );
  }

  // =====================================================
  // Phase 4 — Categories & Taxonomy
  // =====================================================

  listCategories(): Promise<{ items: PublicCategoryListItem[] }> {
    return this.request<{ items: PublicCategoryListItem[] }>(
      "/api/v1/categories",
    );
  }

  getCategoryBySlug(slug: string): Promise<{ category: CategoryWithSubs }> {
    return this.request<{ category: CategoryWithSubs }>(
      `/api/v1/categories/${encodeURIComponent(slug)}`,
    );
  }

  listSubcategoriesByCategory(slug: string): Promise<{ items: SubcategoryRef[] }> {
    return this.request<{ items: SubcategoryRef[] }>(
      `/api/v1/categories/${encodeURIComponent(slug)}/subcategories`,
    );
  }

  listSkillsExtended(
    query: PublicSkillsQuery = {},
  ): Promise<{ items: SkillCatalogItem[] }> {
    const params = new URLSearchParams();
    if (query.categoryId) params.set("categoryId", query.categoryId);
    if (query.subcategoryId) params.set("subcategoryId", query.subcategoryId);
    if (query.categorySlug) params.set("categorySlug", query.categorySlug);
    if (query.includeInactive) params.set("includeInactive", "true");
    const qs = params.toString();
    return this.request<{ items: SkillCatalogItem[] }>(
      `/api/v1/skills${qs ? `?${qs}` : ""}`,
    );
  }

  // ---- Admin: categories ----
  adminListCategories(): Promise<{ items: CategoryWithSubs[] }> {
    return this.request<{ items: CategoryWithSubs[] }>(
      "/api/v1/admin/categories",
    );
  }

  adminCreateCategory(input: CategoryCreateInput): Promise<{ category: { id: string; name: string; slug: string } }> {
    return this.request<{ category: { id: string; name: string; slug: string } }>(
      "/api/v1/admin/categories",
      { method: "POST", body: JSON.stringify(input) },
    );
  }

  adminUpdateCategory(
    id: string,
    input: CategoryUpdateInput,
  ): Promise<{ category: CategoryWithSubs }> {
    return this.request<{ category: CategoryWithSubs }>(
      `/api/v1/admin/categories/${id}`,
      { method: "PATCH", body: JSON.stringify(input) },
    );
  }

  adminAddSubcategory(
    categoryId: string,
    input: SubcategoryCreateInput,
  ): Promise<{ subcategory: SubcategoryRef }> {
    return this.request<{ subcategory: SubcategoryRef }>(
      `/api/v1/admin/categories/${categoryId}/subcategories`,
      { method: "POST", body: JSON.stringify(input) },
    );
  }

  adminUpdateSubcategory(
    id: string,
    input: SubcategoryUpdateInput,
  ): Promise<{ subcategory: SubcategoryRef }> {
    return this.request<{ subcategory: SubcategoryRef }>(
      `/api/v1/admin/subcategories/${id}`,
      { method: "PATCH", body: JSON.stringify(input) },
    );
  }

  // ---- Admin: skills ----
  adminCreateSkill(input: SkillCreateInput): Promise<{ skill: SkillCatalogItem }> {
    return this.request<{ skill: SkillCatalogItem }>(
      "/api/v1/admin/skills",
      { method: "POST", body: JSON.stringify(input) },
    );
  }

  adminUpdateSkill(
    id: string,
    input: SkillUpdateInput,
  ): Promise<{ skill: SkillCatalogItem }> {
    return this.request<{ skill: SkillCatalogItem }>(
      `/api/v1/admin/skills/${id}`,
      { method: "PATCH", body: JSON.stringify(input) },
    );
  }
}
