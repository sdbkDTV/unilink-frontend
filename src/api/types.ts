// src/api/types.ts - Backend veri modelleri (UniLink Rehberi Bölüm 6.7)

export type PostingType = "PROJECT" | "COMPETITION" | "STARTUP";
export type PostingStage = "IDEA" | "PROTOTYPE" | "PRODUCT";
export type PostingStatus = "OPEN" | "CLOSED" | "CANCELLED";
export type ApplicationStatus = "PENDING" | "ACCEPTED" | "REJECTED" | "WITHDRAWN";

export interface ApiError {
  timestamp: string;
  status: number;
  error: string;
  message: string;
  path: string;
  fieldErrors?: Record<string, string>;
}

export interface Page<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: "Bearer";
  expiresInSeconds: number;
}

export interface Technology {
  id: string;
  name: string;
}

export interface Profile {
  userId: string;
  email: string;
  fullName: string;
  university: string;
  department: string;
  bio: string | null;
  githubUrl: string | null;
  linkedinUrl: string | null;
  technologies: Technology[];
}

export interface PostingOwner {
  id: string;
  fullName: string;
  university: string;
  department: string;
}

export interface PostingRole {
  id: string;
  role: string;
  requiredCount: number;
  acceptedCount: number;
  remainingCount: number;
}

export interface PostingSummary {
  id: string;
  type: PostingType;
  title: string;
  shortDescription: string;
  organizationName: string | null;
  open: boolean;
  deadline: string;
  createdAt: string;
  owner: PostingOwner;
  roles: PostingRole[];
  totalRemaining: number;
  technologies: Technology[];
}

export interface Posting {
  id: string;
  type: PostingType;
  title: string;
  description: string;
  organizationName: string | null;
  stage: PostingStage | null;
  benefitsNote: string | null;
  status: PostingStatus;
  open: boolean;
  deadline: string;
  createdAt: string;
  owner: PostingOwner;
  roles: PostingRole[];
  technologies: Technology[];
}

export interface RoleRef {
  id: string;
  role: string;
}

export interface Application {
  id: string;
  status: ApplicationStatus;
  message: string | null;
  createdAt: string;
  decidedAt: string | null;
  posting: {
    id: string;
    title: string;
    type: PostingType;
    status: PostingStatus;
    open: boolean;
    deadline: string;
  };
  appliedRoles: RoleRef[];
  acceptedRole: RoleRef | null;
}

export interface IncomingApplication {
  id: string;
  status: ApplicationStatus;
  message: string | null;
  createdAt: string;
  decidedAt: string | null;
  applicant: {
    userId: string;
    fullName: string;
    university: string;
    department: string;
    bio: string | null;
    githubUrl: string | null;
    linkedinUrl: string | null;
    technologies: Technology[];
    email: string | null;
  };
  appliedRoles: RoleRef[];
  acceptedRole: RoleRef | null;
}
