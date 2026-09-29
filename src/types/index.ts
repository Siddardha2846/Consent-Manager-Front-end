// Core domain types for Consent Manager

export type Role = 'consent-manager' | 'org-user' | 'data-principal' | 'org-admin';

export type RequestStatus = 
  | 'PENDING' 
  | 'CONSENT_REQUESTED' 
  | 'APPROVED' 
  | 'ACTIVE' 
  | 'REJECTED' 
  | 'REVOKED' 
  | 'EXPIRED' 
  | 'CANCELLED';

export type ConsentStatus = 'PENDING' | 'ACTIVE' | 'REJECTED' | 'REVOKED' | 'EXPIRED';

export type GrantStatus = 'ACTIVE' | 'REVOKED' | 'EXPIRED';

export type OrgType = 'University' | 'Hospital' | 'Insurance' | 'Government' | 'Corporate';

export type OrgStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';

export type UserRole = 'admin' | 'user' | 'viewer';

export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'INVITED';

export interface Organization {
  id: string;
  name: string;
  type: OrgType;
  description: string;
  status: OrgStatus;
  contactEmail: string;
  contactPhone: string;
  address: string;
  userCount: number;
  activeRequests: number;
  activeConsents: number;
  lastActivity: string;
  joinedDate: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  organizationId: string;
  organizationName: string;
  joinedDate: string;
  lastActive: string;
  initials: string;
}

export interface DataPrincipal {
  id: string;
  name: string;
  email: string;
  memberId: string;
  organizationId: string;
  organizationName: string;
  initials: string;
}

export interface ConsentField {
  id: string;
  name: string;
  category: string;
  description: string;
}

export interface DataRequest {
  id: string;
  requesterId: string;
  requesterName: string;
  requesterOrgId: string;
  requesterOrgName: string;
  dataOwnerOrgId: string;
  dataOwnerOrgName: string;
  dataPrincipalId: string;
  dataPrincipalName: string;
  purpose: string;
  purposeDescription: string;
  fields: ConsentField[];
  durationDays: number;
  startDate: string;
  expiryDate: string;
  status: RequestStatus;
  createdAt: string;
  updatedAt: string;
  consentId?: string;
  rejectionReason?: string;
  notes?: string;
}

export interface Consent {
  id: string;
  requestId: string;
  dataPrincipalId: string;
  dataPrincipalName: string;
  requesterOrgId: string;
  requesterOrgName: string;
  dataOwnerOrgId: string;
  dataOwnerOrgName: string;
  purpose: string;
  fields: ConsentField[];
  status: ConsentStatus;
  approvedAt?: string;
  rejectedAt?: string;
  revokedAt?: string;
  startDate: string;
  expiryDate: string;
  rejectionReason?: string;
  revocationReason?: string;
  createdAt: string;
}

export interface AccessGrant {
  id: string;
  consentId: string;
  requestId: string;
  dataPrincipalId: string;
  dataPrincipalName: string;
  requesterOrgId: string;
  requesterOrgName: string;
  dataOwnerOrgId: string;
  dataOwnerOrgName: string;
  purpose: string;
  fields: ConsentField[];
  status: GrantStatus;
  grantedAt: string;
  expiryDate: string;
  revokedAt?: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: string;
  relatedId?: string;
  relatedType?: 'request' | 'consent' | 'grant';
  targetRoles: Role[];
  targetPrincipalId?: string;
}

export interface ActivityEvent {
  id: string;
  actor: string;
  actorType: 'org-user' | 'data-principal' | 'system' | 'consent-manager';
  action: string;
  target: string;
  targetId: string;
  targetType: 'request' | 'consent' | 'grant' | 'organization' | 'user';
  timestamp: string;
  status?: RequestStatus | ConsentStatus | GrantStatus;
  metadata?: Record<string, string>;
}

export interface InvitedUser {
  id: string;
  email: string;
  role: UserRole;
  organizationId: string;
  invitedBy: string;
  invitedAt: string;
  status: 'PENDING' | 'ACCEPTED' | 'EXPIRED';
}
