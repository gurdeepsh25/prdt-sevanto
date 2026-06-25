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

// =====================================================
// Phase 3 — Worker Profiles
// =====================================================

export type SkillLevel = "BEGINNER" | "INTERMEDIATE" | "EXPERT";

export interface SkillRef {
  id: string;
  name: string;
}

export interface WorkerSkillRef {
  name: string;
  level: SkillLevel;
}

export interface WorkerPortfolioItem {
  id: string;
  imageUrl: string;
  caption: string | null;
}

export interface PublicWorkerCard {
  id: string;
  userId: string;
  fullName: string;
  headline: string;
  city: string;
  avgRating: number;
  totalReviews: number;
  totalJobsCompleted: number;
  isVerified: boolean;
  hourlyRate: number | null;
  yearsExperience: number;
  skills: WorkerSkillRef[];
}

export interface PublicWorkerDetail extends PublicWorkerCard {
  bio: string;
  serviceRadiusKm: number;
  portfolio: WorkerPortfolioItem[];
}

export interface PublicWorkerList {
  items: PublicWorkerCard[];
  total: number;
  page: number;
  pageSize: number;
}

export interface PublicWorkerListQuery {
  page?: number;
  pageSize?: number;
  city?: string;
  skill?: string;
  minRating?: number;
  verifiedOnly?: boolean;
  categoryId?: string;
  categorySlug?: string;
  subcategoryId?: string;
  maxHourlyRate?: number;
  minYearsExperience?: number;
  sort?:
    | "avgRating:desc"
    | "avgRating:asc"
    | "createdAt:desc"
    | "createdAt:asc"
    | "yearsExperience:desc"
    | "yearsExperience:asc"
    | "hourlyRate:asc"
    | "hourlyRate:desc"
    | "totalJobsCompleted:desc";
}

export interface WorkerProfileCore {
  headline: string;
  bio: string;
  yearsExperience: number;
  hourlyRate: number | null;
  city: string;
  serviceRadiusKm: number;
}

export interface WorkerPortfolioInput {
  imageUrl: string;
  caption?: string | null;
  sortOrder?: number;
}

export interface WorkerSkillInput {
  skillId: string;
  level: SkillLevel;
}

export interface UpsertSkillsInput {
  skills: WorkerSkillInput[];
}

export interface MyWorkerSkill {
  id: string;
  name: string;
  level: SkillLevel;
}

export interface MyWorkerPortfolioItem {
  id: string;
  imageUrl: string;
  caption: string | null;
  sortOrder: number;
}

export interface MyWorkerProfile {
  id: string;
  userId: string;
  headline: string;
  bio: string;
  yearsExperience: number;
  hourlyRate: number | null;
  city: string;
  serviceRadiusKm: number;
  isVerified: boolean;
  verifiedAt: string | null;
  avgRating: number;
  totalJobsCompleted: number;
  totalReviews: number;
  createdAt: string;
  updatedAt: string;
}

export interface MyWorkerProfileResponse {
  profile: MyWorkerProfile;
  completeness: number; // 0..100
  skills: MyWorkerSkill[];
  portfolio: MyWorkerPortfolioItem[];
}

export interface SkillCatalogItem {
  id: string;
  name: string;
  slug: string;
  subcategoryId?: string | null;
}

export interface SkillCatalog {
  items: SkillCatalogItem[];
}

export interface PendingWorkerQueueItem {
  profileId: string;
  userId: string;
  fullName: string;
  email: string;
  headline: string;
  city: string;
  yearsExperience: number;
  hourlyRate: number | null;
  createdAt: string;
  skillsCount: number;
  portfolioCount: number;
  completeness: number;
}

export interface PendingWorkerQueue {
  items: PendingWorkerQueueItem[];
}

export interface PendingWorkerQuery {
  page?: number;
  pageSize?: number;
  city?: string;
  search?: string;
}

// =====================================================
// Phase 4 — Job Categories
// =====================================================

export interface CategoryRef {
  id: string;
  name: string;
  slug: string;
  iconKey: string | null;
  sortOrder: number;
  isActive?: boolean;
}

export interface CategoryWithSubs extends CategoryRef {
  description: string | null;
  subcategories: SubcategoryRef[];
}

export interface SubcategoryRef {
  id: string;
  categoryId: string;
  name: string;
  slug: string;
  description?: string | null;
  sortOrder: number;
  isActive?: boolean;
}

export interface PublicCategoryListItem extends CategoryRef {
  description: string | null;
  subcategoriesCount: number;
}

export interface CategoryCreateInput {
  name: string;
  slug?: string;
  description?: string | null;
  iconKey?: string | null;
  sortOrder?: number;
  isActive?: boolean;
}

export interface CategoryUpdateInput {
  name?: string;
  description?: string | null;
  iconKey?: string | null;
  sortOrder?: number;
  isActive?: boolean;
}

export interface SubcategoryCreateInput {
  name: string;
  slug?: string;
  description?: string | null;
  sortOrder?: number;
  isActive?: boolean;
}

export interface SubcategoryUpdateInput {
  name?: string;
  description?: string | null;
  sortOrder?: number;
  isActive?: boolean;
}

export interface SkillCreateInput {
  name: string;
  slug?: string;
  subcategoryId?: string | null;
  isActive?: boolean;
}

export interface SkillUpdateInput {
  name?: string;
  subcategoryId?: string | null;
  isActive?: boolean;
}

export interface SkillWithSubcategory extends SkillCatalogItem {
  subcategoryId: string | null;
}

export interface PublicSkillsQuery {
  categoryId?: string;
  subcategoryId?: string;
  categorySlug?: string;
  includeInactive?: boolean;
}

// =====================================================
// Phase 5 — Jobs (Job Posting)
// =====================================================

export type JobStatus =
  | "DRAFT"
  | "OPEN"
  | "ASSIGNED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED"
  | "EXPIRED";

export type JobUrgency = "LOW" | "NORMAL" | "HIGH" | "URGENT";

export interface JobAttachmentDTO {
  id: string;
  url: string;
  caption: string | null;
  sortOrder: number;
  createdAt: string;
}

export interface JobSummary {
  id: string;
  customerId: string;
  title: string;
  status: JobStatus;
  urgency: JobUrgency;
  city: string;
  categoryId: string;
  categoryName: string;
  subcategoryId: string | null;
  subcategoryName: string | null;
  budgetMin: number | null;
  budgetMax: number | null;
  currency: string;
  scheduledFor: string | null;
  createdAt: string;
  updatedAt: string;
  attachmentCount: number;
}

export interface JobDetail extends JobSummary {
  description: string;
  addressId: string;
  cancelledAt: string | null;
  cancelReason: string | null;
  attachments: JobAttachmentDTO[];
}

export interface JobListResult {
  items: JobSummary[];
  total: number;
  page: number;
  pageSize: number;
}

export interface JobCreateInput {
  title: string;
  description: string;
  categoryId: string;
  subcategoryId?: string | null;
  addressId: string;
  budgetMin?: number | null;
  budgetMax?: number | null;
  currency?: string;
  urgency?: JobUrgency;
  scheduledFor?: string | null;
  status?: Extract<JobStatus, "DRAFT" | "OPEN">;
}

export interface JobUpdateInput {
  title?: string;
  description?: string;
  categoryId?: string;
  subcategoryId?: string | null;
  addressId?: string;
  budgetMin?: number | null;
  budgetMax?: number | null;
  currency?: string;
  urgency?: JobUrgency;
  scheduledFor?: string | null;
  status?: Extract<JobStatus, "DRAFT" | "OPEN">;
}

export interface JobCancelInput {
  reason?: string;
}

export interface JobAttachmentCreateInput {
  url: string;
  caption?: string | null;
  sortOrder?: number;
}

export interface JobListQuery {
  status?: JobStatus;
  page?: number;
  pageSize?: number;
  sort?: "createdAt:desc" | "createdAt:asc" | "scheduledFor:asc";
}

export interface AdminJobRow extends JobSummary {
  customerName: string;
  customerEmail: string;
}

// =====================================================
// Phase 6 — Public Job Discovery
// =====================================================

export interface PublicJobCard {
  id: string;
  title: string;
  status: "OPEN";
  urgency: JobUrgency;
  city: string;
  categoryId: string;
  categoryName: string;
  subcategoryId: string | null;
  subcategoryName: string | null;
  budgetMin: number | null;
  budgetMax: number | null;
  currency: string;
  scheduledFor: string | null;
  createdAt: string;
  attachmentCount: number;
  applicantCount: number;
}

export interface PublicJobListResult {
  items: PublicJobCard[];
  total: number;
  page: number;
  pageSize: number;
}

export interface PublicJobsQuery {
  page?: number;
  pageSize?: number;
  categoryId?: string;
  subcategoryId?: string;
  categorySlug?: string;
  city?: string;
  urgency?: JobUrgency;
  minBudget?: number;
  maxBudget?: number;
  scheduledAfter?: string;
  search?: string;
  sort?:
    | "createdAt:desc"
    | "createdAt:asc"
    | "scheduledFor:asc"
    | "budgetMax:desc"
    | "budgetMax:asc"
    | "urgency:desc";
}
