import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type {
  Role,
  DataRequest,
  Consent,
  AccessGrant,
  Notification,
  ActivityEvent,
  InvitedUser,
  ConsentField,
} from '../types';
import {
  INITIAL_REQUESTS,
  INITIAL_CONSENTS,
  INITIAL_GRANTS,
  INITIAL_NOTIFICATIONS,
  INITIAL_ACTIVITY,
  INITIAL_INVITATIONS,
  ALL_FIELDS,
  ORGANIZATIONS,
} from '../data/mockData';

// ─── App State Interface ────────────────────────────────────────────────────────

interface AppState {
  currentRole: Role;
  currentPrincipalId: string; // which data principal to simulate
  isLoggedIn: boolean;
  requests: DataRequest[];
  consents: Consent[];
  grants: AccessGrant[];
  notifications: Notification[];
  activity: ActivityEvent[];
  invitations: InvitedUser[];
  toasts: Toast[];
}

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

// ─── Context Interface ──────────────────────────────────────────────────────────

interface AppContextType extends AppState {
  // Auth
  login: () => void;
  logout: () => void;

  // Role
  setRole: (role: Role) => void;
  setPrincipal: (principalId: string) => void;

  // Requests
  createRequest: (req: Omit<DataRequest, 'id' | 'createdAt' | 'updatedAt' | 'status'>) => DataRequest;
  cancelRequest: (requestId: string) => void;

  // Consents
  approveConsent: (consentId: string) => void;
  rejectConsent: (consentId: string, reason: string) => void;
  revokeConsent: (consentId: string, reason?: string) => void;

  // Notifications
  markNotificationRead: (notifId: string) => void;
  markAllNotificationsRead: () => void;
  unreadCount: number;

  // Invitations
  inviteUser: (email: string, role: string, orgId: string) => void;
  cancelInvitation: (invitationId: string) => void;
  resendInvitation: (invitationId: string) => void;

  // UI
  addToast: (message: string, type: Toast['type']) => void;
  removeToast: (id: string) => void;

  // Demo
  resetDemoData: () => void;
}

// ─── Storage Key ────────────────────────────────────────────────────────────────

const STORAGE_KEY = 'consent-manager-state';

// ─── Initial App State ──────────────────────────────────────────────────────────

const initialState: AppState = {
  currentRole: 'consent-manager',
  currentPrincipalId: 'dp-rahul',
  isLoggedIn: false,
  requests: INITIAL_REQUESTS,
  consents: INITIAL_CONSENTS,
  grants: INITIAL_GRANTS,
  notifications: INITIAL_NOTIFICATIONS,
  activity: INITIAL_ACTIVITY,
  invitations: INITIAL_INVITATIONS,
  toasts: [],
};

// ─── Helpers ────────────────────────────────────────────────────────────────────

function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
}

function now(): string {
  return new Date().toISOString();
}

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

// ─── Load / Save ────────────────────────────────────────────────────────────────

function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as AppState;
      return { ...parsed, toasts: [] }; // never persist toasts
    }
  } catch {
    // ignore
  }
  return initialState;
}

function saveState(state: AppState) {
  try {
    const { toasts: _t, ...toSave } = state;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  } catch {
    // ignore
  }
}

// ─── Context ────────────────────────────────────────────────────────────────────

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(loadState);

  // Persist on change
  useEffect(() => {
    saveState(state);
  }, [state]);

  const unreadCount = state.notifications.filter(
    n =>
      !n.read &&
      (n.targetRoles.includes(state.currentRole) ||
        (n.targetPrincipalId && n.targetPrincipalId === state.currentPrincipalId))
  ).length;

  // ── Auth ──────────────────────────────────────────────────────────────────────

  const login = useCallback(() => {
    setState(s => ({ ...s, isLoggedIn: true }));
  }, []);

  const logout = useCallback(() => {
    setState(s => ({ ...s, isLoggedIn: false }));
  }, []);

  // ── Role ──────────────────────────────────────────────────────────────────────

  const setRole = useCallback((role: Role) => {
    setState(s => ({ ...s, currentRole: role }));
  }, []);

  const setPrincipal = useCallback((principalId: string) => {
    setState(s => ({ ...s, currentPrincipalId: principalId }));
  }, []);

  // ── Requests ──────────────────────────────────────────────────────────────────

  const createRequest = useCallback(
    (req: Omit<DataRequest, 'id' | 'createdAt' | 'updatedAt' | 'status'>) => {
      const id = `REQ-${1040 + Math.floor(Math.random() * 100)}`;
      const consentId = `CST-${2000 + Math.floor(Math.random() * 100)}`;
      const timestamp = now();
      const startDate = timestamp;
      const expiryDate = addDays(startDate, req.durationDays);

      const newRequest: DataRequest = {
        ...req,
        id,
        status: 'CONSENT_REQUESTED',
        createdAt: timestamp,
        updatedAt: timestamp,
        consentId,
      };

      const newConsent: Consent = {
        id: consentId,
        requestId: id,
        dataPrincipalId: req.dataPrincipalId,
        dataPrincipalName: req.dataPrincipalName,
        requesterOrgId: req.requesterOrgId,
        requesterOrgName: req.requesterOrgName,
        dataOwnerOrgId: req.dataOwnerOrgId,
        dataOwnerOrgName: req.dataOwnerOrgName,
        purpose: req.purpose,
        fields: req.fields,
        status: 'PENDING',
        startDate: '',
        expiryDate: '',
        createdAt: timestamp,
      };

      const notif: Notification = {
        id: generateId('notif'),
        title: 'New Data Request',
        message: `${req.requesterOrgName} has requested access to data for ${req.purpose}.`,
        type: 'info',
        read: false,
        createdAt: timestamp,
        relatedId: id,
        relatedType: 'request',
        targetRoles: ['data-principal'],
        targetPrincipalId: req.dataPrincipalId,
      };

      const act1: ActivityEvent = {
        id: generateId('act'),
        actor: req.requesterName,
        actorType: 'org-user',
        action: 'Created data request',
        target: id,
        targetId: id,
        targetType: 'request',
        timestamp,
        status: 'CONSENT_REQUESTED',
      };

      const act2: ActivityEvent = {
        id: generateId('act'),
        actor: 'System',
        actorType: 'system',
        action: `Consent request sent to ${req.dataPrincipalName}`,
        target: consentId,
        targetId: consentId,
        targetType: 'consent',
        timestamp: new Date(new Date(timestamp).getTime() + 1000).toISOString(),
        status: 'PENDING',
      };

      setState(s => ({
        ...s,
        requests: [newRequest, ...s.requests],
        consents: [newConsent, ...s.consents],
        notifications: [notif, ...s.notifications],
        activity: [act2, act1, ...s.activity],
      }));

      return newRequest;
    },
    []
  );

  const cancelRequest = useCallback((requestId: string) => {
    const timestamp = now();
    setState(s => ({
      ...s,
      requests: s.requests.map(r =>
        r.id === requestId ? { ...r, status: 'CANCELLED', updatedAt: timestamp } : r
      ),
      activity: [
        {
          id: generateId('act'),
          actor: 'User',
          actorType: 'org-user',
          action: 'Cancelled data request',
          target: requestId,
          targetId: requestId,
          targetType: 'request',
          timestamp,
          status: 'CANCELLED',
        },
        ...s.activity,
      ],
    }));
  }, []);

  // ── Consents ──────────────────────────────────────────────────────────────────

  const approveConsent = useCallback((consentId: string) => {
    const timestamp = now();
    setState(s => {
      const consent = s.consents.find(c => c.id === consentId);
      if (!consent) return s;

      // Find the linked request to get duration
      const request = s.requests.find(r => r.consentId === consentId);
      const durationDays = request?.durationDays ?? 30;
      const startDate = timestamp;
      const expiryDate = addDays(startDate, durationDays);
      const grantId = generateId('GRT');

      const updatedConsent: Consent = {
        ...consent,
        status: 'ACTIVE',
        approvedAt: timestamp,
        startDate,
        expiryDate,
      };

      const newGrant: AccessGrant = {
        id: grantId,
        consentId: consent.id,
        requestId: consent.requestId,
        dataPrincipalId: consent.dataPrincipalId,
        dataPrincipalName: consent.dataPrincipalName,
        requesterOrgId: consent.requesterOrgId,
        requesterOrgName: consent.requesterOrgName,
        dataOwnerOrgId: consent.dataOwnerOrgId,
        dataOwnerOrgName: consent.dataOwnerOrgName,
        purpose: consent.purpose,
        fields: consent.fields,
        status: 'ACTIVE',
        grantedAt: timestamp,
        expiryDate,
      };

      const updatedRequests = s.requests.map(r =>
        r.consentId === consentId
          ? { ...r, status: 'ACTIVE' as const, updatedAt: timestamp, startDate, expiryDate }
          : r
      );

      const notif: Notification = {
        id: generateId('notif'),
        title: 'Consent Approved',
        message: `${consent.dataPrincipalName} approved the ${consent.purpose} request. Access is now active.`,
        type: 'success',
        read: false,
        createdAt: timestamp,
        relatedId: consentId,
        relatedType: 'consent',
        targetRoles: ['org-user', 'consent-manager'],
      };

      const act1: ActivityEvent = {
        id: generateId('act'),
        actor: consent.dataPrincipalName,
        actorType: 'data-principal',
        action: `Approved consent for ${consent.purpose}`,
        target: consentId,
        targetId: consentId,
        targetType: 'consent',
        timestamp,
        status: 'ACTIVE',
      };

      const act2: ActivityEvent = {
        id: generateId('act'),
        actor: 'System',
        actorType: 'system',
        action: 'Access grant activated',
        target: grantId,
        targetId: grantId,
        targetType: 'grant',
        timestamp: new Date(new Date(timestamp).getTime() + 1000).toISOString(),
        status: 'ACTIVE',
      };

      return {
        ...s,
        consents: s.consents.map(c => (c.id === consentId ? updatedConsent : c)),
        grants: [newGrant, ...s.grants],
        requests: updatedRequests,
        notifications: [notif, ...s.notifications],
        activity: [act2, act1, ...s.activity],
      };
    });
  }, []);

  const rejectConsent = useCallback((consentId: string, reason: string) => {
    const timestamp = now();
    setState(s => {
      const consent = s.consents.find(c => c.id === consentId);
      if (!consent) return s;

      const updatedConsent: Consent = {
        ...consent,
        status: 'REJECTED',
        rejectedAt: timestamp,
        rejectionReason: reason,
      };

      const updatedRequests = s.requests.map(r =>
        r.consentId === consentId
          ? { ...r, status: 'REJECTED' as const, updatedAt: timestamp, rejectionReason: reason }
          : r
      );

      const notif: Notification = {
        id: generateId('notif'),
        title: 'Consent Rejected',
        message: `${consent.dataPrincipalName} rejected the ${consent.purpose} request.`,
        type: 'error',
        read: false,
        createdAt: timestamp,
        relatedId: consentId,
        relatedType: 'consent',
        targetRoles: ['org-user', 'consent-manager'],
      };

      const act: ActivityEvent = {
        id: generateId('act'),
        actor: consent.dataPrincipalName,
        actorType: 'data-principal',
        action: `Rejected consent for ${consent.purpose}`,
        target: consentId,
        targetId: consentId,
        targetType: 'consent',
        timestamp,
        status: 'REJECTED',
      };

      return {
        ...s,
        consents: s.consents.map(c => (c.id === consentId ? updatedConsent : c)),
        requests: updatedRequests,
        notifications: [notif, ...s.notifications],
        activity: [act, ...s.activity],
      };
    });
  }, []);

  const revokeConsent = useCallback((consentId: string, reason?: string) => {
    const timestamp = now();
    setState(s => {
      const consent = s.consents.find(c => c.id === consentId);
      if (!consent) return s;

      const updatedConsent: Consent = {
        ...consent,
        status: 'REVOKED',
        revokedAt: timestamp,
        revocationReason: reason,
      };

      const updatedGrants = s.grants.map(g =>
        g.consentId === consentId
          ? { ...g, status: 'REVOKED' as const, revokedAt: timestamp }
          : g
      );

      const updatedRequests = s.requests.map(r =>
        r.consentId === consentId
          ? { ...r, status: 'REVOKED' as const, updatedAt: timestamp }
          : r
      );

      const notif: Notification = {
        id: generateId('notif'),
        title: 'Consent Revoked',
        message: `Consent for ${consent.purpose} by ${consent.dataPrincipalName} has been revoked.`,
        type: 'warning',
        read: false,
        createdAt: timestamp,
        relatedId: consentId,
        relatedType: 'consent',
        targetRoles: ['org-user', 'consent-manager', 'data-principal'],
        targetPrincipalId: consent.dataPrincipalId,
      };

      const act: ActivityEvent = {
        id: generateId('act'),
        actor: consent.dataPrincipalName,
        actorType: 'data-principal',
        action: `Revoked consent for ${consent.purpose}`,
        target: consentId,
        targetId: consentId,
        targetType: 'consent',
        timestamp,
        status: 'REVOKED',
      };

      return {
        ...s,
        consents: s.consents.map(c => (c.id === consentId ? updatedConsent : c)),
        grants: updatedGrants,
        requests: updatedRequests,
        notifications: [notif, ...s.notifications],
        activity: [act, ...s.activity],
      };
    });
  }, []);

  // ── Notifications ─────────────────────────────────────────────────────────────

  const markNotificationRead = useCallback((notifId: string) => {
    setState(s => ({
      ...s,
      notifications: s.notifications.map(n => (n.id === notifId ? { ...n, read: true } : n)),
    }));
  }, []);

  const markAllNotificationsRead = useCallback(() => {
    setState(s => ({
      ...s,
      notifications: s.notifications.map(n => ({ ...n, read: true })),
    }));
  }, []);

  // ── Invitations ───────────────────────────────────────────────────────────────

  const inviteUser = useCallback((email: string, role: string, orgId: string) => {
    const inv: InvitedUser = {
      id: generateId('inv'),
      email,
      role: role as 'admin' | 'user' | 'viewer',
      organizationId: orgId,
      invitedBy: 'Current Admin',
      invitedAt: now(),
      status: 'PENDING',
    };
    setState(s => ({ ...s, invitations: [inv, ...s.invitations] }));
  }, []);

  const cancelInvitation = useCallback((invitationId: string) => {
    setState(s => ({
      ...s,
      invitations: s.invitations.filter(i => i.id !== invitationId),
    }));
  }, []);

  const resendInvitation = useCallback((invitationId: string) => {
    setState(s => ({
      ...s,
      invitations: s.invitations.map(i =>
        i.id === invitationId ? { ...i, invitedAt: now(), status: 'PENDING' } : i
      ),
    }));
  }, []);

  // ── Toasts ────────────────────────────────────────────────────────────────────

  const addToast = useCallback((message: string, type: Toast['type']) => {
    const id = generateId('toast');
    setState(s => ({ ...s, toasts: [...s.toasts, { id, message, type }] }));
    setTimeout(() => {
      setState(s => ({ ...s, toasts: s.toasts.filter(t => t.id !== id) }));
    }, 4000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setState(s => ({ ...s, toasts: s.toasts.filter(t => t.id !== id) }));
  }, []);

  // ── Demo Reset ────────────────────────────────────────────────────────────────

  const resetDemoData = useCallback(() => {
    setState(s => ({
      ...initialState,
      isLoggedIn: true,
      currentRole: s.currentRole,
      toasts: [],
    }));
  }, []);

  // ─────────────────────────────────────────────────────────────────────────────

  const value: AppContextType = {
    ...state,
    unreadCount,
    login,
    logout,
    setRole,
    setPrincipal,
    createRequest,
    cancelRequest,
    approveConsent,
    rejectConsent,
    revokeConsent,
    markNotificationRead,
    markAllNotificationsRead,
    inviteUser,
    cancelInvitation,
    resendInvitation,
    addToast,
    removeToast,
    resetDemoData,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextType {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
