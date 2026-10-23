// src/api/postings.ts - İlan, Başvuru ve Kaydedilenler API Fonksiyonları (UniLink Rehberi Bölüm 9.5)
import { api } from "./client";
import type {
  Application,
  IncomingApplication,
  Page,
  Posting,
  PostingSummary,
  PostingType,
  Profile,
  Technology,
} from "./types";

export interface FeedParams {
  page?: number;
  size?: number;
  sort?: "NEWEST" | "DEADLINE";
  type?: PostingType;
  query?: string;
  technologies?: string[];
  role?: string;
  department?: string;
  university?: string;
  hasVacancy?: boolean;
}

const clean = <T extends object>(obj: T) =>
  Object.fromEntries(
    Object.entries(obj).filter(
      ([, v]) => v !== "" && v !== undefined && v !== null
    )
  ) as T;

// İLANLAR (POSTINGS)
export const getFeed = (params: FeedParams = {}) =>
  api
    .get<Page<PostingSummary>>("/api/postings", { params: clean(params) })
    .then((r) => r.data);

export const getPosting = (id: string) =>
  api.get<Posting>(`/api/postings/${id}`).then((r) => r.data);

export interface CreatePostingPayload {
  type: PostingType;
  title: string;
  description: string;
  organizationName?: string | null;
  stage?: "IDEA" | "PROTOTYPE" | "PRODUCT" | null;
  benefitsNote?: string | null;
  deadline: string; // ISO UTC
  roles: { role: string; requiredCount: number }[];
  technologies: string[];
}

export const createPosting = (payload: CreatePostingPayload) =>
  api.post<Posting>("/api/postings", payload).then((r) => r.data);

export const updatePosting = (id: string, payload: Partial<CreatePostingPayload>) =>
  api.put<Posting>(`/api/postings/${id}`, payload).then((r) => r.data);

export const cancelPosting = (id: string) =>
  api.delete(`/api/postings/${id}`).then((r) => r.data);

// BAŞVURULAR (APPLICATIONS)
export const applyToPosting = (
  postingId: string,
  body: { message?: string; roleIds: string[] }
) =>
  api
    .post<Application>(`/api/postings/${postingId}/applications`, body)
    .then((r) => r.data);

export const getMyApplications = (page = 0, size = 20) =>
  api
    .get<Page<Application>>("/api/applications/mine", {
      params: { page, size },
    })
    .then((r) => r.data);

export const getIncomingApplications = (
  postingId: string,
  status?: string,
  page = 0,
  size = 20
) =>
  api
    .get<Page<IncomingApplication>>(
      `/api/postings/${postingId}/applications`,
      { params: clean({ status, page, size }) }
    )
    .then((r) => r.data);

export const acceptApplication = (applicationId: string, roleId: string) =>
  api
    .post<IncomingApplication>(`/api/applications/${applicationId}/accept`, {
      roleId,
    })
    .then((r) => r.data);

export const rejectApplication = (applicationId: string) =>
  api
    .post<IncomingApplication>(`/api/applications/${applicationId}/reject`)
    .then((r) => r.data);

export const withdrawApplication = (applicationId: string) =>
  api
    .post<Application>(`/api/applications/${applicationId}/withdraw`)
    .then((r) => r.data);

export const getPendingCount = () =>
  api
    .get<{ pendingCount: number }>("/api/applications/incoming/pending-count")
    .then((r) => r.data.pendingCount);

// KAYDEDİLENLER (SAVED POSTINGS)
export const savePosting = (postingId: string) =>
  api.put(`/api/saved-postings/${postingId}`);

export const unsavePosting = (postingId: string) =>
  api.delete(`/api/saved-postings/${postingId}`);

export const getSavedPostings = (page = 0, size = 12) =>
  api
    .get<Page<PostingSummary>>("/api/saved-postings", {
      params: { page, size },
    })
    .then((r) => r.data);

// TEKNOLOJİLER & PROFİL
export const getTechnologies = (query = "") =>
  api
    .get<Technology[]>("/api/technologies", { params: { query } })
    .then((r) => r.data);

export const getMyProfile = () =>
  api.get<Profile>("/api/users/me").then((r) => r.data);

export const updateMyProfile = (profile: {
  fullName: string;
  university: string;
  department: string;
  bio?: string | null;
  githubUrl?: string | null;
  linkedinUrl?: string | null;
}) => api.put<Profile>("/api/users/me", profile).then((r) => r.data);

export const updateMyTechnologies = (technologies: string[]) =>
  api
    .put<Profile>("/api/users/me/technologies", { technologies })
    .then((r) => r.data);
