import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type {
  AccessEvent,
  AdminSection,
  AuditEntry,
  BackupReplicaNode,
  BackupSnapshotEnvelope,
  BpjepsMilestone,
  CallLog,
  Candidate,
  CandidateStage,
  Club,
  ClubChecklistItem,
  ClubFilter,
  ClubId,
  CollaboratorNotification,
  CollaboratorTask,
  Employee,
  GoNoGoPhase,
  HRDocument,
  HeitzKpiTicket,
  HeitzMember,
  InBodyScan,
  JobOffer,
  LeaveRequest,
  ModuleProgress,
  PhoneLine,
  PointageType,
  Prospect,
  ProspectStage,
  ServerPowerStatus,
  ShellMode,
  Shift,
  SipTrunkProvider,
  TimeEntry,
  TrainingModule,
  UnifiedPlanningEvent,
} from '../types/cfos';
import {
  INITIAL_ACCESS_EVENTS,
  INITIAL_AUDIT_LOGS,
  INITIAL_BPJEPS_MILESTONES,
  INITIAL_CALL_LOGS,
  INITIAL_CANDIDATES,
  INITIAL_CHECKLISTS,
  INITIAL_CLUBS,
  INITIAL_COLLABORATOR_NOTIFICATIONS,
  INITIAL_COLLABORATOR_TASKS,
  INITIAL_EMPLOYEES,
  INITIAL_GONOGO_PHASES,
  INITIAL_HEITZ_KPI_TICKETS,
  INITIAL_HEITZ_MEMBERS,
  INITIAL_HR_DOCUMENTS,
  INITIAL_INBODY_SCANS,
  INITIAL_JOB_OFFERS,
  INITIAL_LEAVE_REQUESTS,
  INITIAL_MODULE_PROGRESS,
  INITIAL_PHONE_LINES,
  INITIAL_PROSPECTS,
  INITIAL_SHIFTS,
  INITIAL_TIME_ENTRIES,
  INITIAL_TRAINING_MODULES,
  INITIAL_UNIFIED_EXTERNAL_EVENTS,
} from '../data/seed';
import {
  CFITNESS_LEGAL_IDENTITY,
  INITIAL_BACKUP_REPLICAS,
  buildBackupEnvelope,
  buildMywellnessContextualUrl,
  canCallProspectProspection,
  canSendProspectSms,
  convertProspectToHeitzMember,
  createInternalElectronicSignatureProof,
  evaluateGatePassage,
  executeTransactionalOnboarding,
  findDuplicateProspect,
  generateHeitzTrialPassageCode,
  mergeFailoverSnapshot,
  parseRecruitmentEmailPayload,
  selectOutboundNumber,
  verifyEmployeePin,
  type OnboardingTransactionResult,
} from '../domain/rules';
import {
  type AccentColorId,
  getNextAccentColor,
  isValidAccentColor,
  isValidThemeMode,
} from '../domain/theme';

const STORAGE_KEY = 'cfitness_os_state_v7';
const THEME_STORAGE_KEY = 'cfos_theme_mode';
const ACCENT_STORAGE_KEY = 'cfos_accent_color';
const BACKUP_ENVELOPE_KEY = 'cfitness_os_backup_envelope_v13';
const IDB_NAME = 'cfitness_os_failover_idb';
const IDB_STORE = 'replica_snapshots';

function persistEnvelopeToIndexedDb(envelope: BackupSnapshotEnvelope): void {
  try {
    if (typeof window === 'undefined' || !('indexedDB' in window)) return;
    const req = window.indexedDB.open(IDB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(IDB_STORE)) {
        db.createObjectStore(IDB_STORE, { keyPath: 'id' });
      }
    };
    req.onsuccess = () => {
      const db = req.result;
      const tx = db.transaction(IDB_STORE, 'readwrite');
      const store = tx.objectStore(IDB_STORE);
      store.put({ id: 'latest_autonomous_replica', ...envelope });
      tx.oncomplete = () => db.close();
    };
  } catch {
    // ignore IndexedDB restricted context errors
  }
}

interface PersistedState {
  clubs: Club[];
  employees: Employee[];
  shifts: Shift[];
  timeEntries: TimeEntry[];
  offlinePointageQueue: TimeEntry[];
  kioskOfflineMode: boolean;
  sipTrunkProvider: SipTrunkProvider;
  serverPowerStatus: ServerPowerStatus;
  activeFailoverNodeId: string;
  backupReplicas: BackupReplicaNode[];
  lastAutoBackupAt: string;
  lastBackupChecksum: string;
  leaveRequests: LeaveRequest[];
  hrDocuments: HRDocument[];
  prospects: Prospect[];
  phoneLines: PhoneLine[];
  callLogs: CallLog[];
  trainingModules: TrainingModule[];
  moduleProgress: ModuleProgress[];
  bpjepsMilestones: BpjepsMilestone[];
  checklists: ClubChecklistItem[];
  jobOffers: JobOffer[];
  candidates: Candidate[];
  heitzMembers: HeitzMember[];
  accessEvents: AccessEvent[];
  inBodyScans: InBodyScan[];
  auditLogs: AuditEntry[];
  goNoGoPhases: GoNoGoPhase[];
  unifiedExternalEvents: UnifiedPlanningEvent[];
  collaboratorTasks: CollaboratorTask[];
  collaboratorNotifications: CollaboratorNotification[];
  heitzKpiTickets: HeitzKpiTicket[];
}

function getDefaultState(): PersistedState {
  return {
    clubs: INITIAL_CLUBS,
    employees: INITIAL_EMPLOYEES,
    shifts: INITIAL_SHIFTS,
    timeEntries: INITIAL_TIME_ENTRIES,
    offlinePointageQueue: [],
    kioskOfflineMode: false,
    sipTrunkProvider: 'ovhcloud_sip',
    serverPowerStatus: 'nominal',
    activeFailoverNodeId: 'replica-pc-beynost',
    backupReplicas: INITIAL_BACKUP_REPLICAS,
    lastAutoBackupAt: new Date().toISOString(),
    lastBackupChecksum: 'CFOS-SHA-9F4A2C81',
    leaveRequests: INITIAL_LEAVE_REQUESTS,
    hrDocuments: INITIAL_HR_DOCUMENTS,
    prospects: INITIAL_PROSPECTS,
    phoneLines: INITIAL_PHONE_LINES,
    callLogs: INITIAL_CALL_LOGS,
    trainingModules: INITIAL_TRAINING_MODULES,
    moduleProgress: INITIAL_MODULE_PROGRESS,
    bpjepsMilestones: INITIAL_BPJEPS_MILESTONES,
    checklists: INITIAL_CHECKLISTS,
    jobOffers: INITIAL_JOB_OFFERS,
    candidates: INITIAL_CANDIDATES,
    heitzMembers: INITIAL_HEITZ_MEMBERS,
    accessEvents: INITIAL_ACCESS_EVENTS,
    inBodyScans: INITIAL_INBODY_SCANS,
    auditLogs: INITIAL_AUDIT_LOGS,
    goNoGoPhases: INITIAL_GONOGO_PHASES,
    unifiedExternalEvents: INITIAL_UNIFIED_EXTERNAL_EVENTS,
    collaboratorTasks: INITIAL_COLLABORATOR_TASKS,
    collaboratorNotifications: INITIAL_COLLABORATOR_NOTIFICATIONS,
    heitzKpiTickets: INITIAL_HEITZ_KPI_TICKETS,
  };
}

interface CfosContextValue extends PersistedState {
  currentUser: Employee;
  isAuthenticated: boolean;
  isArchitectUnlocked: boolean;
  shellMode: ShellMode;
  activeSection: AdminSection;
  navSubTarget: string | null;
  clubFilter: ClubFilter;
  themeMode: 'light' | 'dark';
  setThemeMode: (mode: 'light' | 'dark') => void;
  toggleThemeMode: () => void;
  accentColor: AccentColorId;
  setAccentColor: (color: AccentColorId) => void;
  cycleAccentColor: () => void;
  bannerNotice: { tone: 'success' | 'warning' | 'error'; text: string } | null;
  clearBanner: () => void;
  setShellMode: (mode: ShellMode) => void;
  setActiveSection: (sec: AdminSection, subTarget?: string) => void;
  unlockArchitectSpace: () => void;
  lockArchitectSpace: () => void;
  setClubFilter: (filter: ClubFilter) => void;
  switchUserSession: (employeeId: string, preferredShell?: ShellMode) => void;
  loginWithLocalCredentials: (params: {
    employeeId: string;
    secretOrPin: string;
    preferredShell?: ShellMode;
  }) => { ok: boolean; message: string; locked?: boolean };
  logoutSession: () => void;
  resetDemoData: () => void;

  syncAllDeviceReplicasNow: (targetNodeId?: string) => void;
  toggleReplicaAutoSync: (nodeId: string) => void;
  simulateServerPowerOutage: (outageActive: boolean, failoverNodeId?: string) => void;
  exportDeviceBackupJson: (targetNodeId?: string) => void;
  importAndMergeDeviceBackup: (rawJson: string) => { ok: boolean; message: string };


  setSipTrunkProvider: (provider: SipTrunkProvider) => void;
  takePhoneLineSession: (lineId: string) => void;
  releasePhoneLineSession: (lineId: string) => void;
  placeSimulatedCall: (params: {
    prospectId?: string;
    customPhone?: string;
    customName?: string;
    clubId: ClubId;
    lineMode: '04' | '07';
    outcome: CallLog['outcome'];
    durationSec?: number;
    voicemailDropped?: boolean;
    ringoverTags?: string[];
    callNote?: string;
  }) => { ok: boolean; message: string; callerIdUsed?: string };
  qualifyRingoverCall: (params: {
    callId: string;
    outcome: CallLog['outcome'];
    ringoverTags: string[];
    callNote: string;
  }) => void;

  createProspect: (input: {
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
    clubId: ClubId;
    source: Prospect['source'];
    goal: string;
    rgpdConsent: boolean;
  }) => { ok: boolean; message: string };
  updateProspectStage: (prospectId: string, stage: ProspectStage) => void;
  scheduleProspectTrial: (prospectId: string, trialDateLabel: string) => void;
  convertProspectToMember: (
    prospectId: string,
    subscriptionName: string
  ) => { ok: boolean; message: string; badgeCode?: string; sepaMandateRum?: string };
  sendValidatedProspectSms: (prospectId: string, text: string) => { ok: boolean; message: string };
  toggleProspectStopSms: (prospectId: string) => void;

  addShift: (shift: Omit<Shift, 'id'>) => void;
  deleteShift: (shiftId: string) => void;
  punchWithPin: (
    clubId: ClubId,
    employeeId: string,
    pinInput: string,
    type: PointageType
  ) => { ok: boolean; message: string; locked?: boolean };
  unlockEmployeePin: (employeeId: string) => void;
  toggleKioskOfflineMode: (offline: boolean) => void;
  submitLeaveRequest: (input: {
    employeeId: string;
    clubId: ClubId;
    type: LeaveRequest['type'];
    startDate: string;
    endDate: string;
    daysCount: number;
  }) => void;
  decideLeaveRequest: (leaveId: string, decision: 'valide' | 'refuse' | 'en_attente') => void;
  signHrDocument: (docId: string) => void;

  completeAcademyQuiz: (employeeId: string, moduleId: string, selectedOption: number) => {
    passed: boolean;
    message: string;
  };
  toggleBpjepsMilestoneValidation: (milestoneId: string) => void;
  toggleChecklistItem: (itemId: string) => void;

  moveCandidateStage: (candidateId: string, stage: CandidateStage) => OnboardingTransactionResult | null;
  ingestEmailCandidate: (rawInput: {
    senderLine: string;
    subjectLine: string;
    bodyText: string;
    attachmentPdf?: string;
  }) => { candidate: Candidate; rgpdReply: string };
  createJobOffer: (input: {
    title: string;
    clubId: ClubId;
    contractType: JobOffer['contractType'];
    weeklyHours: number;
    hourlyRate: number;
    channels: string[];
  }) => void;
  runCandidateOnboarding: (params: {
    candidateId: string;
    firstShiftDate: string;
    firstShiftStart: string;
    firstShiftEnd: string;
    hourlyRate: number;
    weeklyHours: number;
    simulateMidWayFailure?: boolean;
  }) => OnboardingTransactionResult;

  simulateMemberGateScan: (memberId: string, clubId: ClubId) => AccessEvent | null;
  triggerManualTurnstileOpen: (
    clubId: ClubId,
    gateLabel: string,
    reasonLabel: string
  ) => AccessEvent;
  regularizeMemberSepa: (memberId: string) => void;
  toggleMemberSubscriptionStatus: (memberId: string) => void;
  rewardMemberLoyaltyOrReferral: (
    memberId: string,
    rewardType: 'parrainage' | 'anniversaire',
    friendName?: string
  ) => void;
  recordQuickTpvSale: (
    clubId: ClubId,
    itemLabel: string,
    amountEur: number,
    memberName?: string
  ) => void;
  toggleClubMode: (clubId: ClubId, field: 'degradedMode' | 'fireAlarmOpen') => void;
  addInBodyScan: (scan: Omit<InBodyScan, 'id'>) => void;

  signGoNoGoPhase: (phaseId: string, signerNames: string) => void;

  createOrUpdateExternalPlanningEvent: (
    eventInput: Omit<UnifiedPlanningEvent, 'id' | 'lastSyncedAt'>
  ) => void;
  deleteExternalPlanningEvent: (id: string) => void;
  toggleCollaboratorTask: (taskId: string) => void;
  addCollaboratorTask: (taskInput: Omit<CollaboratorTask, 'id' | 'completed'>) => void;
  markNotificationRead: (notifId: string) => void;
  signDocumentWithInternalProof: (params: {
    docId: string;
    otpInput: string;
    consentChecked: boolean;
    consentPhrase: string;
  }) => { ok: boolean; message: string };
  openMywellnessLink: (params: {
    mywellnessMemberId?: string;
    personName?: string;
    clubId?: ClubId;
  }) => { url: string; label: string; isContextualDeepLink: boolean };
  activeMywellnessModal: {
    mywellnessMemberId?: string;
    personName?: string;
    clubId?: ClubId;
  } | null;
  closeMywellnessModal: () => void;
}

const CfosContext = createContext<CfosContextValue | null>(null);

export function CfosProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<PersistedState>(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return { ...getDefaultState(), ...JSON.parse(saved) };
      }
    } catch {
      // ignore storage errors
    }
    return getDefaultState();
  });

  const [currentUserId, setCurrentUserId] = useState<string>(() => {
    try {
      return window.sessionStorage.getItem('cfos_local_auth_user_id') || 'emp-mario';
    } catch {
      return 'emp-mario';
    }
  });
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.get('shell') || params.get('autologin') === '1') {
        return true;
      }
      return window.sessionStorage.getItem('cfos_local_auth_active') === 'true';
    } catch {
      return false;
    }
  });
  const [shellMode, setShellMode] = useState<ShellMode>(() => {
    const params = new URLSearchParams(window.location.search);
    const shell = params.get('shell');
    if (shell === 'employe' || shell === 'tablette' || shell === 'telephone' || shell === 'admin') {
      return shell;
    }
    return 'admin';
  });
  const [activeSection, setActiveSectionState] = useState<AdminSection>('dashboard');
  const [navSubTarget, setNavSubTarget] = useState<string | null>(null);
  const [isArchitectUnlocked, setIsArchitectUnlocked] = useState<boolean>(false);
  const [clubFilter, setClubFilter] = useState<ClubFilter>('all');
  const [activeMywellnessModal, setActiveMywellnessModal] = useState<{
    mywellnessMemberId?: string;
    personName?: string;
    clubId?: ClubId;
  } | null>(null);
  const [themeMode, setThemeModeState] = useState<'light' | 'dark'>(() => {
    try {
      const saved = window.localStorage.getItem(THEME_STORAGE_KEY);
      if (isValidThemeMode(saved)) return saved;
    } catch {
      // ignore
    }
    return 'light';
  });
  const [accentColor, setAccentColorState] = useState<AccentColorId>(() => {
    try {
      const saved = window.localStorage.getItem(ACCENT_STORAGE_KEY);
      if (isValidAccentColor(saved)) return saved;
    } catch {
      // ignore
    }
    return 'violet';
  });

  const setThemeMode = (mode: 'light' | 'dark') => {
    setThemeModeState(mode);
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, mode);
    } catch {
      // ignore
    }
  };

  const toggleThemeMode = () => {
    setThemeModeState((prev) => {
      const next = prev === 'light' ? 'dark' : 'light';
      try {
        window.localStorage.setItem(THEME_STORAGE_KEY, next);
      } catch {
        // ignore
      }
      return next;
    });
  };

  const setAccentColor = (color: AccentColorId) => {
    setAccentColorState(color);
    try {
      window.localStorage.setItem(ACCENT_STORAGE_KEY, color);
    } catch {
      // ignore
    }
  };

  const cycleAccentColor = () => {
    setAccentColorState((prev) => {
      const next = getNextAccentColor(prev);
      try {
        window.localStorage.setItem(ACCENT_STORAGE_KEY, next);
      } catch {
        // ignore
      }
      return next;
    });
  };

  const [bannerNotice, setBannerNotice] = useState<CfosContextValue['bannerNotice']>(null);

  // Toujours purger l'ancien cache sessionStorage pour que Mon Espace ne soit jamais déverrouillé d'office
  useEffect(() => {
    try {
      window.sessionStorage.removeItem('cfos_architect_pin_unlocked');
      window.localStorage.removeItem('cfos_architect_pin_unlocked');
    } catch {
      // ignore
    }
  }, []);

  const setActiveSection = (sec: AdminSection, subTarget?: string) => {
    if (sec !== 'governance') {
      setIsArchitectUnlocked(false);
    }
    setActiveSectionState(sec);
    setNavSubTarget(subTarget ?? null);
  };

  const unlockArchitectSpace = () => {
    setIsArchitectUnlocked(true);
    setActiveSectionState('governance');
  };

  const lockArchitectSpace = () => {
    setIsArchitectUnlocked(false);
    try {
      window.sessionStorage.removeItem('cfos_architect_pin_unlocked');
      window.localStorage.removeItem('cfos_architect_pin_unlocked');
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    try {
      const rawState = JSON.stringify(state);
      window.localStorage.setItem(STORAGE_KEY, rawState);

      const envelope = buildBackupEnvelope(
        state as unknown as Parameters<typeof buildBackupEnvelope>[0],
        'C.Fitness OS Auto-Mesh',
        state.serverPowerStatus
      );
      window.localStorage.setItem(BACKUP_ENVELOPE_KEY, JSON.stringify(envelope));
      persistEnvelopeToIndexedDb(envelope);

      if ('BroadcastChannel' in window) {
        const bc = new BroadcastChannel('cfitness_os_mesh_replica');
        bc.postMessage({ type: 'CFOS_REPLICA_SYNC', checksum: envelope.checksum, exportedAt: envelope.exportedAt });
        bc.close();
      }
    } catch {
      // ignore quota errors
    }
  }, [state]);

  const currentUser = useMemo(() => {
    return state.employees.find((e) => e.id === currentUserId) ?? state.employees[0];
  }, [state.employees, currentUserId]);

  const appendAudit = (
    prevAudit: AuditEntry[],
    entry: Omit<AuditEntry, 'id' | 'timestamp' | 'actorName' | 'actorRole'>
  ): AuditEntry[] => {
    const newEntry: AuditEntry = {
      id: `aud-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: new Date().toISOString(),
      actorName: `${currentUser.firstName} ${currentUser.lastName}`,
      actorRole: currentUser.role,
      ...entry,
    };
    return [newEntry, ...prevAudit];
  };

  const notify = (tone: 'success' | 'warning' | 'error', text: string) => {
    setBannerNotice({ tone, text });
  };

  const switchUserSession = (employeeId: string, preferredShell?: ShellMode) => {
    const target = state.employees.find((e) => e.id === employeeId);
    if (!target) return;
    setIsArchitectUnlocked(false);
    setCurrentUserId(target.id);
    setIsAuthenticated(true);
    try {
      window.sessionStorage.setItem('cfos_local_auth_active', 'true');
      window.sessionStorage.setItem('cfos_local_auth_user_id', target.id);
    } catch {
      // ignore storage errors
    }
    if (preferredShell) {
      setShellMode(preferredShell);
    } else if (target.role === 'coach' || target.role === 'apprenti') {
      setShellMode('employe');
    } else if (target.role === 'kiosque') {
      setShellMode('tablette');
    } else {
      setShellMode('admin');
    }
    notify('success', `Session locale ouverte : ${target.firstName} ${target.lastName} (${target.jobTitle})`);
  };

  const loginWithLocalCredentials: CfosContextValue['loginWithLocalCredentials'] = ({
    employeeId,
    secretOrPin,
    preferredShell,
  }) => {
    const target = state.employees.find((e) => e.id === employeeId);
    if (!target) {
      return { ok: false, message: 'Profil collaborateur introuvable sur le serveur local.' };
    }

    // Verify either the 4-digit PIN or local password ("cfitness2026" / employee PIN)
    const normalizedSecret = secretOrPin.trim();
    const isValidLocalPassword =
      normalizedSecret.toLowerCase() === 'cfitness2026' ||
      normalizedSecret.toLowerCase() === 'cfitness';

    if (!isValidLocalPassword) {
      const pinCheck = verifyEmployeePin(target, normalizedSecret);
      if (!pinCheck.authenticated) {
        setState((prev) => ({
          ...prev,
          employees: prev.employees.map((e) =>
            e.id === target.id ? pinCheck.updatedEmployee : e
          ),
          auditLogs: appendAudit(prev.auditLogs, {
            clubId: target.clubId,
            action: pinCheck.locked ? 'AUTH_LOCALE_VERROUILLAGE_BRUTEFORCE' : 'AUTH_LOCALE_ECHEC',
            target: `${target.firstName} ${target.lastName} (${target.email})`,
            afterState: pinCheck.reason,
          }),
        }));
        return { ok: false, message: pinCheck.reason, locked: pinCheck.locked };
      }
      // Reset failed attempts on valid PIN
      setState((prev) => ({
        ...prev,
        employees: prev.employees.map((e) =>
          e.id === target.id ? pinCheck.updatedEmployee : e
        ),
        auditLogs: appendAudit(prev.auditLogs, {
          clubId: target.clubId,
          action: 'CONNEXION_LOCALE_ARGON2_JWT',
          target: `${target.firstName} ${target.lastName} [${target.role.toUpperCase()}]`,
          afterState: `Authentification locale Debian 12 validée (Club ${target.clubId})`,
        }),
      }));
    } else {
      setState((prev) => ({
        ...prev,
        employees: prev.employees.map((e) =>
          e.id === target.id ? { ...e, failedPinAttempts: 0 } : e
        ),
        auditLogs: appendAudit(prev.auditLogs, {
          clubId: target.clubId,
          action: 'CONNEXION_LOCALE_ARGON2_JWT',
          target: `${target.firstName} ${target.lastName} [${target.role.toUpperCase()}]`,
          afterState: `Authentification locale Debian 12 validée (Club ${target.clubId})`,
        }),
      }));
    }

    setCurrentUserId(target.id);
    setIsAuthenticated(true);
    try {
      window.sessionStorage.setItem('cfos_local_auth_active', 'true');
      window.sessionStorage.setItem('cfos_local_auth_user_id', target.id);
    } catch {
      // ignore storage errors
    }

    if (preferredShell) {
      setShellMode(preferredShell);
    } else if (target.role === 'coach' || target.role === 'apprenti') {
      setShellMode('admin');
      setActiveSection('devices');
    } else if (target.role === 'commercial') {
      setShellMode('admin');
      setActiveSection('crm');
    } else if (target.role === 'kiosque') {
      setShellMode('tablette');
    } else {
      setShellMode('admin');
      setActiveSection('my-day');
    }

    notify(
      'success',
      `Connecté en local : ${target.firstName} ${target.lastName} (${target.jobTitle} · Rôle ${target.role.toUpperCase()})`
    );
    return { ok: true, message: 'Authentification locale réussie.' };
  };

  const logoutSession = () => {
    setState((prev) => ({
      ...prev,
      auditLogs: appendAudit(prev.auditLogs, {
        clubId: currentUser.clubId,
        action: 'DECONNEXION_SESSION_LOCALE',
        target: `${currentUser.firstName} ${currentUser.lastName}`,
        afterState: 'Session locale verrouillée',
      }),
    }));
    setIsArchitectUnlocked(false);
    setIsAuthenticated(false);
    try {
      window.sessionStorage.removeItem('cfos_local_auth_active');
      window.sessionStorage.removeItem('cfos_architect_pin_unlocked');
      window.localStorage.removeItem('cfos_architect_pin_unlocked');
    } catch {
      // ignore
    }
  };

  const resetDemoData = () => {
    const fresh = getDefaultState();
    setState(fresh);
    setIsArchitectUnlocked(false);
    setCurrentUserId('emp-mario');
    setShellMode('admin');
    setActiveSection('my-day');
    setClubFilter('all');
    try {
      window.sessionStorage.removeItem('cfos_architect_pin_unlocked');
      window.localStorage.removeItem('cfos_architect_pin_unlocked');
    } catch {
      // ignore
    }
    notify('success', 'Données de référence C.Fitness OS v1.2 réinitialisées.');
  };

  const setSipTrunkProvider = (provider: SipTrunkProvider) => {
    setState((prev) => ({
      ...prev,
      sipTrunkProvider: provider,
      auditLogs: appendAudit(prev.auditLogs, {
        clubId: 'global',
        action: 'CONFIGURATION_TRUNK_SIP_OVHCLOUD',
        target:
          provider === 'ovhcloud_sip'
            ? 'Trunk SIP OVHcloud (sip.ovh.fr · Lignes Fixes 04)'
            : 'Canal Mobile 07 & SMS OVHcloud Télécom',
        afterState:
          provider === 'ovhcloud_sip'
            ? 'Trunk SIP OVHcloud actif sur les 12 lignes (fixes 04 + pool mobile 07)'
            : 'Canal Mobile 07 & SMS OVHcloud Télécom actif pour les communications mobiles',
      }),
    }));
    notify(
      'success',
      provider === 'ovhcloud_sip'
        ? 'Trunk SIP OVHcloud (sip.ovh.fr) activé sur Asterisk (12 lignes 04/07).'
        : 'Canal Mobile 07 & SMS OVHcloud Télécom activé pour les communications avec les téléphones mobiles.'
    );
  };

  const takePhoneLineSession = (lineId: string) => {
    setState((prev) => {
      const updatedLines = prev.phoneLines.map((l) => {
        if (l.id === lineId) {
          return {
            ...l,
            activeAgentId: currentUser.id,
            sessionStartedAt: new Date().toISOString(),
            status: 'en_ligne' as const,
          };
        }
        if (l.activeAgentId === currentUser.id) {
          return {
            ...l,
            activeAgentId: null,
            sessionStartedAt: null,
            status: 'libre' as const,
            currentProspectName: undefined,
          };
        }
        return l;
      });
      const targetLine = prev.phoneLines.find((l) => l.id === lineId);
      return {
        ...prev,
        phoneLines: updatedLines,
        auditLogs: appendAudit(prev.auditLogs, {
          clubId: targetLine?.clubId ?? 'global',
          action: 'PRISE_DE_POSTE_HOT_DESKING',
          target: targetLine?.label ?? lineId,
          beforeState: 'Libre',
          afterState: `Attribué à ${currentUser.firstName} ${currentUser.lastName}`,
        }),
      };
    });
    notify('success', `Poste téléphonique pris par ${currentUser.firstName} ${currentUser.lastName}.`);
  };

  const releasePhoneLineSession = (lineId: string) => {
    setState((prev) => {
      const targetLine = prev.phoneLines.find((l) => l.id === lineId);
      return {
        ...prev,
        phoneLines: prev.phoneLines.map((l) =>
          l.id === lineId
            ? {
                ...l,
                activeAgentId: null,
                sessionStartedAt: null,
                status: 'libre' as const,
                currentProspectName: undefined,
              }
            : l
        ),
        auditLogs: appendAudit(prev.auditLogs, {
          clubId: targetLine?.clubId ?? 'global',
          action: 'FIN_DE_POSTE_HOT_DESKING',
          target: targetLine?.label ?? lineId,
          afterState: 'Ligne libérée',
        }),
      };
    });
    notify('success', 'Poste téléphonique libéré.');
  };

  const placeSimulatedCall: CfosContextValue['placeSimulatedCall'] = ({
    prospectId,
    customPhone,
    customName,
    clubId,
    lineMode,
    outcome,
    durationSec = 185,
    voicemailDropped = false,
    ringoverTags,
    callNote,
  }) => {
    const club = state.clubs.find((c) => c.id === clubId) ?? state.clubs[0];
    const prospect = prospectId ? state.prospects.find((p) => p.id === prospectId) : undefined;

    if (prospect) {
      const guard = canCallProspectProspection(prospect);
      if (!guard.allowed) {
        notify('error', guard.reason ?? 'Appel bloqué.');
        return { ok: false, message: guard.reason ?? 'Appel bloqué.' };
      }
    }

    const callerIdUsed = selectOutboundNumber(
      club,
      lineMode,
      prospect?.lastOutbound07Used,
      prospect?.retryCount ?? 0
    );

    const defaultTags =
      ringoverTags && ringoverTags.length > 0
        ? ringoverTags
        : voicemailDropped
        ? ['Voicemail Drop Studio', 'À relancer J+1']
        : outcome === 'RDV Séance fixé'
        ? ['RDV Séance fixé', 'Prospect Chaud']
        : [outcome];

    const newCall: CallLog = {
      id: `cl-${Date.now()}`,
      clubId,
      agentId: currentUser.id,
      prospectId: prospect?.id,
      prospectName: prospect
        ? `${prospect.firstName} ${prospect.lastName}`
        : customName || 'Contact externe',
      prospectPhone: prospect ? prospect.phone : customPhone || '06 00 00 00 00',
      displayedCallerId: callerIdUsed,
      lineMode,
      direction: 'sortant',
      outcome,
      durationSec:
        voicemailDropped
          ? 8
          : outcome === 'Pas de réponse' || outcome === 'Messagerie'
          ? 24
          : durationSec,
      timestamp: new Date().toISOString(),
      whisperScore:
        outcome === 'Pas de réponse' || outcome === 'Messagerie' ? undefined : 89,
      whisperTranscript:
        voicemailDropped
          ? 'Dépôt automatique Voicemail Drop Ringover (Message Studio C.Fitness pré-enregistré déposé sans attente du bip).'
          : outcome === 'Pas de réponse' || outcome === 'Messagerie'
          ? undefined
          : 'Appel sortant analysé localement (whisper-rs) : présentation club claire, écoute active et proposition de créneau découverte.',
      detectedObjection:
        outcome === 'RDV Séance fixé'
          ? 'Disponibilité horaires du soir (créneau adapté proposé)'
          : undefined,
      ringoverTags: defaultTags,
      callNote:
        callNote ||
        (voicemailDropped
          ? 'Message vocal pré-enregistré déposé en 1 clic via Power Dialer.'
          : undefined),
      voicemailDropped,
    };

    setState((prev) => ({
      ...prev,
      callLogs: [newCall, ...prev.callLogs],
      prospects: prev.prospects.map((p) => {
        if (p.id !== prospect?.id) return p;
        const nextStage: ProspectStage =
          outcome === 'RDV Séance fixé'
            ? 'Séance planifiée'
            : outcome === 'Adhésion conclue'
            ? 'Adhérent'
            : (outcome === 'Décroché — Qualifié' || voicemailDropped) && p.stage === 'Nouveau'
            ? 'Contacté'
            : p.stage;
        const appendedNote = callNote
          ? `${p.notes} [Note Ringover : ${callNote}]`
          : voicemailDropped
          ? `${p.notes} [Voicemail Drop Studio déposé via ${callerIdUsed}]`
          : p.notes;
        return {
          ...p,
          stage: nextStage,
          lastOutbound07Used: lineMode === '07' ? callerIdUsed : p.lastOutbound07Used,
          retryCount: p.retryCount + 1,
          notes: appendedNote,
        };
      }),
    }));

    const msg = voicemailDropped
      ? `Voicemail Drop Studio déposé en 1 clic via ${callerIdUsed} et synchronisé dans la fiche CRM.`
      : `Appel journalisé dans le CRM (Clause Art. 4) via ${callerIdUsed} (${outcome}).`;
    notify('success', msg);
    return { ok: true, message: msg, callerIdUsed };
  };

  const qualifyRingoverCall: CfosContextValue['qualifyRingoverCall'] = ({
    callId,
    outcome,
    ringoverTags,
    callNote,
  }) => {
    const targetCall = state.callLogs.find((c) => c.id === callId);
    if (!targetCall) return;

    setState((prev) => ({
      ...prev,
      callLogs: prev.callLogs.map((c) =>
        c.id === callId
          ? {
              ...c,
              outcome,
              ringoverTags,
              callNote: callNote.trim() || c.callNote,
            }
          : c
      ),
      prospects: prev.prospects.map((p) => {
        if (
          p.id !== targetCall.prospectId &&
          p.phone.replace(/\s+/g, '') !== targetCall.prospectPhone.replace(/\s+/g, '')
        ) {
          return p;
        }
        const nextStage: ProspectStage =
          outcome === 'RDV Séance fixé'
            ? 'Séance planifiée'
            : outcome === 'Adhésion conclue'
            ? 'Adhérent'
            : outcome === 'Décroché — Qualifié' && p.stage === 'Nouveau'
            ? 'Contacté'
            : p.stage;
        return {
          ...p,
          stage: nextStage,
          notes: callNote.trim()
            ? `${p.notes} [Qualification Ringover (${ringoverTags.join(', ')}) : ${callNote.trim()}]`
            : p.notes,
        };
      }),
      auditLogs: appendAudit(prev.auditLogs, {
        clubId: targetCall.clubId,
        action: 'QUALIFICATION_APPEL_RINGOVER_CRM',
        target: `${targetCall.prospectName} (${targetCall.prospectPhone})`,
        afterState: `Statut: ${outcome} · Tags: ${ringoverTags.join(', ') || 'Aucun'}`,
      }),
    }));

    notify(
      'success',
      `Appel de ${targetCall.prospectName} qualifié (${outcome}) et synchronisé avec la fiche CRM.`
    );
  };

  const createProspect: CfosContextValue['createProspect'] = (input) => {
    if (!input.firstName.trim() || !input.lastName.trim() || !input.phone.trim()) {
      return { ok: false, message: 'Prénom, nom et téléphone sont obligatoires.' };
    }
    const dup = findDuplicateProspect(state.prospects, input.phone, input.email);
    if (dup) {
      const msg = `Doublon détecté : ${dup.firstName} ${dup.lastName} existe déjà dans le pipeline (${dup.stage}).`;
      notify('warning', msg);
      return { ok: false, message: msg };
    }

    const newProspect: Prospect = {
      id: `pr-${Date.now()}`,
      firstName: input.firstName.trim(),
      lastName: input.lastName.trim(),
      phone: input.phone.trim(),
      email: input.email.trim(),
      clubId: input.clubId,
      source: input.source,
      stage: 'Nouveau',
      assignedToId: input.clubId === 'carre-de-soie' ? 'emp-maxime' : 'emp-chloe',
      rgpdConsent: input.rgpdConsent,
      bloctelListed: false,
      smsStopOptOut: false,
      retryCount: 0,
      goal: input.goal.trim() || 'Séance découverte & bilan forme',
      notes: `Créé via ${input.source}.`,
      createdAt: new Date().toISOString().slice(0, 10),
      pendingSmsDraft: input.rgpdConsent
        ? `Bonjour ${input.firstName.trim()}, bienvenue chez C.Fitness ! Quand souhaitez-vous planifier votre séance d’essai offerte ? STOP au 36111.`
        : undefined,
    };

    setState((prev) => ({
      ...prev,
      prospects: [newProspect, ...prev.prospects],
      auditLogs: appendAudit(prev.auditLogs, {
        clubId: input.clubId,
        action: 'CREATION_PROSPECT_CRM',
        target: `${newProspect.firstName} ${newProspect.lastName}`,
        afterState: `Source: ${input.source} · Consentement RGPD: ${input.rgpdConsent ? 'Oui' : 'Non'}`,
      }),
    }));

    notify('success', `Prospect ${newProspect.firstName} ${newProspect.lastName} ajouté au pipeline.`);
    return { ok: true, message: 'Prospect enregistré avec succès.' };
  };

  const updateProspectStage = (prospectId: string, stage: ProspectStage) => {
    setState((prev) => ({
      ...prev,
      prospects: prev.prospects.map((p) => (p.id === prospectId ? { ...p, stage } : p)),
    }));
    notify('success', `Statut prospect mis à jour : ${stage}.`);
  };

  const scheduleProspectTrial = (prospectId: string, trialDateLabel: string) => {
    setState((prev) => {
      const target = prev.prospects.find((p) => p.id === prospectId);
      if (!target) return prev;
      const bookingQr = generateHeitzTrialPassageCode(target, trialDateLabel);
      const [datePart, timePart] = trialDateLabel.split(' ');
      const eventDate = datePart && /^\d{4}-\d{2}-\d{2}$/.test(datePart) ? datePart : '2026-10-23';
      const eventStart = timePart && /^\d{2}:\d{2}$/.test(timePart) ? timePart : '16:00';
      const startHour = Number(eventStart.split(':')[0] || 16);
      const eventEnd = `${String(Math.min(22, startHour + 1)).padStart(2, '0')}:${eventStart.split(':')[1] || '00'}`;

      const newHeitzPlanningEvent: UnifiedPlanningEvent = {
        id: `uev-hz-trial-${Date.now()}`,
        externalSourceId: `HZ-RDV-${bookingQr.heitzBookingId}`,
        originSystem: 'heitz_api',
        category: 'RDV Heitz',
        title: `Séance d’Essai & Découverte — ${target.firstName} ${target.lastName}`,
        subtitle: `POST /api/planning/book + QR Portillon ${bookingQr.heitzPassageQrCode}`,
        clubId: target.clubId,
        employeeId: target.assignedToId || currentUser.id,
        date: eventDate,
        startTime: eventStart,
        endTime: eventEnd,
        participantName: `${target.firstName} ${target.lastName}`,
        locationLabel:
          target.clubId === 'carre-de-soie'
            ? 'Plateau & Portillon Carré de Soie (#5052)'
            : 'Plateau & Portillon Beynost (#5053)',
        writableViaApi: true,
        lastSyncedAt: new Date().toISOString(),
        placesMax: 1,
        placesTaken: 1,
        bookingQueueCount: 0,
        attendanceRatePct: 100,
      };

      return {
        ...prev,
        prospects: prev.prospects.map((p) =>
          p.id === prospectId
            ? {
                ...p,
                stage: 'Séance planifiée',
                trialDate: trialDateLabel,
                heitzBookingId: bookingQr.heitzBookingId,
                heitzPassageQrCode: bookingQr.heitzPassageQrCode,
                pendingSmsDraft: p.rgpdConsent ? bookingQr.smsConfirmationText : p.pendingSmsDraft,
                notes: `${p.notes} [RDV Heitz #${bookingQr.heitzBookingId} fixé le ${trialDateLabel} · QR Portillon ${bookingQr.heitzPassageQrCode}]`,
              }
            : p
        ),
        unifiedExternalEvents: [newHeitzPlanningEvent, ...prev.unifiedExternalEvents],
        auditLogs: appendAudit(prev.auditLogs, {
          clubId: target.clubId,
          action: 'PLANIFICATION_SEANCE_ESSAI_HEITZ_QR',
          target: `${target.firstName} ${target.lastName} (${bookingQr.heitzPassageQrCode})`,
          afterState: `POST /api/planning/book (#${bookingQr.heitzBookingId}) + GET /api/passageCode/generate (${bookingQr.heitzPassageQrCode}) le ${trialDateLabel}`,
        }),
      };
    });
    notify(
      'success',
      `Séance d’essai planifiée dans Heitz (${trialDateLabel}) + QR Code Portillon généré (/api/passageCode/generate) et préparé dans le SMS 07.`
    );
  };

  const convertProspectToMember: CfosContextValue['convertProspectToMember'] = (
    prospectId,
    subscriptionName
  ) => {
    const target = state.prospects.find((p) => p.id === prospectId);
    if (!target) {
      return { ok: false, message: 'Prospect introuvable.' };
    }
    if (target.stage === 'Adhérent') {
      return { ok: false, message: 'Ce prospect est déjà converti en adhérent Heitz.' };
    }

    const nowIso = new Date().toISOString();
    const conv = convertProspectToHeitzMember({
      prospect: target,
      subscriptionName,
      actorName: `${currentUser.firstName} ${currentUser.lastName}`,
      actorRole: currentUser.role,
      nowIso,
    });

    const sellerEmp =
      state.employees.find((e) => e.id === target.assignedToId) || currentUser;
    const newKpiTicket: HeitzKpiTicket = {
      id: 1000307250000 + Math.floor(Date.now() % 9000),
      number: `000000${1457 + state.heitzKpiTickets.length}`,
      clubId: target.clubId,
      idCenter: target.clubId === 'carre-de-soie' ? 5052 : 5053,
      dateIso: nowIso.slice(0, 16).replace('T', ' '),
      idEmpSeller: sellerEmp.heitzEmployeeId ?? 100404,
      sellerEmployeeId: sellerEmp.id,
      sellerName: `${sellerEmp.firstName} ${sellerEmp.lastName}`,
      idClient: 1000301390000 + Math.floor(Date.now() % 9000),
      clientName: `${target.firstName} ${target.lastName}`,
      articleId: 1000301472469,
      articleCategory: 2,
      articleName: `01 - ${subscriptionName.toUpperCase()}`,
      paymentMethodName: 'PRELEVEMENT SEPA',
      amountTtcEur: subscriptionName.includes('49') ? 49.9 : 39.9,
      silaeCommissionEur: subscriptionName.includes('49') ? 12 : 10,
      ticketState: 1,
    };

    setState((prev) => ({
      ...prev,
      heitzMembers: [conv.newMember, ...prev.heitzMembers],
      heitzKpiTickets: [newKpiTicket, ...prev.heitzKpiTickets],
      prospects: prev.prospects.map((p) => (p.id === prospectId ? conv.updatedProspect : p)),
      employees: prev.employees.map((e) =>
        e.id === target.assignedToId || e.id === currentUser.id
          ? {
              ...e,
              monthlySubscriptionsActual: (e.monthlySubscriptionsActual ?? 0) + 1,
            }
          : e
      ),
      auditLogs: [conv.auditEntry, ...prev.auditLogs],
    }));

    const okMsg = `Adhésion validée ! ${target.firstName} ${target.lastName} est maintenant Adhérent Heitz actif (${conv.newMember.badgeCode} · Mandat SEPA ${conv.sepaMandateRum} · Ticket KPI #${newKpiTicket.number}).`;
    notify('success', okMsg);
    return {
      ok: true,
      message: okMsg,
      badgeCode: conv.newMember.badgeCode,
      sepaMandateRum: conv.sepaMandateRum,
    };
  };

  const sendValidatedProspectSms: CfosContextValue['sendValidatedProspectSms'] = (prospectId, text) => {
    const prospect = state.prospects.find((p) => p.id === prospectId);
    if (!prospect) return { ok: false, message: 'Prospect introuvable.' };
    const guard = canSendProspectSms(prospect);
    if (!guard.allowed) {
      notify('error', guard.reason ?? 'Envoi SMS bloqué.');
      return { ok: false, message: guard.reason ?? 'Envoi SMS bloqué.' };
    }
    if (!text.trim()) {
      return { ok: false, message: 'Le contenu du SMS ne peut pas être vide.' };
    }

    setState((prev) => ({
      ...prev,
      prospects: prev.prospects.map((p) =>
        p.id === prospectId
          ? {
              ...p,
              stage: p.stage === 'Nouveau' ? 'Contacté' : p.stage,
              pendingSmsDraft: undefined,
              notes: `${p.notes} [SMS validé envoyé : "${text.trim().slice(0, 60)}..."]`,
            }
          : p
      ),
      auditLogs: appendAudit(prev.auditLogs, {
        clubId: prospect.clubId,
        action: 'ENVOI_SMS_PROSPECT_VALIDE',
        target: `${prospect.firstName} ${prospect.lastName} (${prospect.phone})`,
        afterState: 'SMS de relance validé humainement et transmis via passerelle HTTP',
      }),
    }));

    notify('success', `SMS envoyé à ${prospect.firstName} ${prospect.lastName}.`);
    return { ok: true, message: 'SMS envoyé.' };
  };

  const toggleProspectStopSms = (prospectId: string) => {
    setState((prev) => ({
      ...prev,
      prospects: prev.prospects.map((p) =>
        p.id === prospectId ? { ...p, smsStopOptOut: !p.smsStopOptOut } : p
      ),
    }));
  };

  const addShift = (shiftInput: Omit<Shift, 'id'>) => {
    const newShift: Shift = {
      ...shiftInput,
      id: `sh-${Date.now()}`,
    };
    setState((prev) => ({
      ...prev,
      shifts: [...prev.shifts, newShift],
      auditLogs: appendAudit(prev.auditLogs, {
        clubId: shiftInput.clubId,
        action: 'AJOUT_SHIFT_PLANNING',
        target: `${shiftInput.date} (${shiftInput.startTime}–${shiftInput.endTime})`,
        afterState: shiftInput.roleLabel,
      }),
    }));
    notify('success', `Shift ajouté le ${shiftInput.date} (${shiftInput.startTime}–${shiftInput.endTime}).`);
  };

  const deleteShift = (shiftId: string) => {
    setState((prev) => ({
      ...prev,
      shifts: prev.shifts.filter((s) => s.id !== shiftId),
    }));
    notify('success', 'Créneau retiré du planning.');
  };

  const punchWithPin: CfosContextValue['punchWithPin'] = (clubId, employeeId, pinInput, type) => {
    const emp = state.employees.find((e) => e.id === employeeId);
    if (!emp) return { ok: false, message: 'Collaborateur introuvable.' };

    const auth = verifyEmployeePin(emp, pinInput);
    if (!auth.authenticated) {
      setState((prev) => ({
        ...prev,
        employees: prev.employees.map((e) => (e.id === employeeId ? auth.updatedEmployee : e)),
        auditLogs: auth.locked
          ? appendAudit(prev.auditLogs, {
              clubId,
              action: 'VERROUILLAGE_PIN_BRUTEFORCE',
              target: `${emp.firstName} ${emp.lastName}`,
              afterState: 'Verrouillé après 5 échecs PIN sur kiosque',
            })
          : prev.auditLogs,
      }));
      return { ok: false, message: auth.reason, locked: auth.locked };
    }

    const entry: TimeEntry = {
      id: `te-${Date.now()}`,
      employeeId,
      clubId,
      timestamp: new Date().toISOString(),
      type,
      source: 'tablette_pin',
      syncedFromOffline: state.kioskOfflineMode,
    };

    setState((prev) => ({
      ...prev,
      employees: prev.employees.map((e) => (e.id === employeeId ? auth.updatedEmployee : e)),
      timeEntries: state.kioskOfflineMode ? prev.timeEntries : [entry, ...prev.timeEntries],
      offlinePointageQueue: state.kioskOfflineMode
        ? [entry, ...prev.offlinePointageQueue]
        : prev.offlinePointageQueue,
      auditLogs: appendAudit(prev.auditLogs, {
        clubId,
        action: state.kioskOfflineMode ? 'POINTAGE_PIN_FILE_HORS_LIGNE' : 'POINTAGE_PIN_TABLETTE',
        target: `${emp.firstName} ${emp.lastName}`,
        afterState: `Type: ${type}`,
      }),
    }));

    const labelMap: Record<PointageType, string> = {
      arrivee: 'Arrivée enregistrée',
      debut_pause: 'Début de pause enregistré',
      fin_pause: 'Reprise de poste enregistrée',
      depart: 'Départ enregistré',
    };

    const suffix = state.kioskOfflineMode
      ? ' (stocké en file locale hors-ligne — zéro perte).'
      : ' (horodaté et synchronisé).';

    return { ok: true, message: `${labelMap[type]} pour ${emp.firstName} ${emp.lastName}${suffix}` };
  };

  const unlockEmployeePin = (employeeId: string) => {
    setState((prev) => {
      const target = prev.employees.find((e) => e.id === employeeId);
      return {
        ...prev,
        employees: prev.employees.map((e) =>
          e.id === employeeId ? { ...e, failedPinAttempts: 0, pinLocked: false } : e
        ),
        auditLogs: appendAudit(prev.auditLogs, {
          clubId: target?.clubId ?? 'global',
          action: 'DEBLOCAGE_PIN_COLLABORATEUR',
          target: target ? `${target.firstName} ${target.lastName}` : employeeId,
          beforeState: 'PIN verrouillé (5 échecs)',
          afterState: 'PIN réactivé par Manager/Admin',
        }),
      };
    });
    notify('success', 'Code PIN du collaborateur déverrouillé.');
  };

  const toggleKioskOfflineMode = (offline: boolean) => {
    setState((prev) => {
      if (!offline && prev.offlinePointageQueue.length > 0) {
        const flushedCount = prev.offlinePointageQueue.length;
        notify(
          'success',
          `Connexion Wi-Fi rétablie : ${flushedCount} pointage(s) hors-ligne resynchronisé(s) sans aucune perte.`
        );
        return {
          ...prev,
          kioskOfflineMode: false,
          timeEntries: [...prev.offlinePointageQueue, ...prev.timeEntries],
          offlinePointageQueue: [],
        };
      }
      return {
        ...prev,
        kioskOfflineMode: offline,
      };
    });
  };

  const submitLeaveRequest: CfosContextValue['submitLeaveRequest'] = (input) => {
    const newReq: LeaveRequest = {
      id: `lv-${Date.now()}`,
      ...input,
      status: 'en_attente',
      requestedAt: new Date().toISOString().slice(0, 10),
    };
    setState((prev) => ({
      ...prev,
      leaveRequests: [newReq, ...prev.leaveRequests],
    }));
    notify('success', 'Demande d’absence transmise au responsable pour validation.');
  };

  const decideLeaveRequest = (leaveId: string, decision: 'valide' | 'refuse' | 'en_attente') => {
    setState((prev) => ({
      ...prev,
      leaveRequests: prev.leaveRequests.map((l) =>
        l.id === leaveId
          ? {
              ...l,
              status: decision,
              validatedBy:
                decision === 'en_attente'
                  ? undefined
                  : `${currentUser.firstName} ${currentUser.lastName}`,
            }
          : l
      ),
      auditLogs: appendAudit(prev.auditLogs, {
        clubId: 'global',
        action:
          decision === 'valide'
            ? 'VALIDATION_CONGES_RH'
            : decision === 'refuse'
            ? 'REFUS_CONGES_RH'
            : 'REINITIALISATION_CONGES_RH',
        target: leaveId,
        afterState: `Statut: ${decision}`,
      }),
    }));
    notify(
      'success',
      decision === 'valide'
        ? 'Congé validé.'
        : decision === 'refuse'
        ? 'Demande refusée.'
        : 'Demande d’absence remise en attente.'
    );
  };

  const signHrDocument = (docId: string) => {
    setState((prev) => ({
      ...prev,
      hrDocuments: prev.hrDocuments.map((d) =>
        d.id === docId ? { ...d, signedStatus: 'Signé horodaté' } : d
      ),
      auditLogs: appendAudit(prev.auditLogs, {
        clubId: 'global',
        action: 'SIGNATURE_ELECTRONIQUE_DOCUMENT_RH',
        target: docId,
        beforeState: 'En attente signature',
        afterState: 'Signé et scellé horodaté dans le coffre-fort salarié',
      }),
    }));
    notify('success', 'Document signé électroniquement et horodaté.');
  };

  const completeAcademyQuiz: CfosContextValue['completeAcademyQuiz'] = (
    employeeId,
    moduleId,
    selectedOption
  ) => {
    const mod = state.trainingModules.find((m) => m.id === moduleId);
    if (!mod) return { passed: false, message: 'Module introuvable.' };

    const passed = selectedOption === mod.quizCorrectIndex;
    if (!passed) {
      return {
        passed: false,
        message: 'Réponse incorrecte. Relisez les points clés Mario & Daniel Carvalho puis réessayez.',
      };
    }

    setState((prev) => {
      const exists = prev.moduleProgress.some(
        (mp) => mp.employeeId === employeeId && mp.moduleId === moduleId
      );
      const nextProgress = exists
        ? prev.moduleProgress.map((mp) =>
            mp.employeeId === employeeId && mp.moduleId === moduleId
              ? { ...mp, completed: true, scorePct: 100, completedAt: new Date().toISOString().slice(0, 10) }
              : mp
          )
        : [
            ...prev.moduleProgress,
            {
              employeeId,
              moduleId,
              completed: true,
              scorePct: 100,
              completedAt: new Date().toISOString().slice(0, 10),
            },
          ];
      return {
        ...prev,
        moduleProgress: nextProgress,
      };
    });

    notify('success', `Module ${mod.code} validé avec un score de 100 %.`);
    return { passed: true, message: `Bravo ! Module ${mod.code} validé à 100 %.` };
  };

  const toggleBpjepsMilestoneValidation = (milestoneId: string) => {
    setState((prev) => ({
      ...prev,
      bpjepsMilestones: prev.bpjepsMilestones.map((m) =>
        m.id === milestoneId
          ? {
              ...m,
              tutorValidated: !m.tutorValidated,
              validatedBy: !m.tutorValidated
                ? `${currentUser.firstName} ${currentUser.lastName}`
                : undefined,
              validatedAt: !m.tutorValidated ? new Date().toISOString().slice(0, 10) : undefined,
            }
          : m
      ),
    }));
    notify('success', 'Jalon du livret d’apprentissage BPJEPS mis à jour.');
  };

  const toggleChecklistItem = (itemId: string) => {
    const nowHm = new Date().toTimeString().slice(0, 5);
    setState((prev) => ({
      ...prev,
      checklists: prev.checklists.map((c) =>
        c.id === itemId
          ? {
              ...c,
              checkedBy: c.checkedBy ? undefined : `${currentUser.firstName} ${currentUser.lastName}`,
              checkedAt: c.checkedBy ? undefined : nowHm,
            }
          : c
      ),
    }));
  };

  const runCandidateOnboarding: CfosContextValue['runCandidateOnboarding'] = ({
    candidateId,
    firstShiftDate,
    firstShiftStart,
    firstShiftEnd,
    hourlyRate,
    weeklyHours,
    simulateMidWayFailure,
  }) => {
    const candidate = state.candidates.find((c) => c.id === candidateId);
    if (!candidate) {
      return { ok: false, error: 'Candidat introuvable.' };
    }

    const result = executeTransactionalOnboarding({
      candidate,
      existingEmployees: state.employees,
      trainingModules: state.trainingModules,
      firstShiftDate,
      firstShiftStart,
      firstShiftEnd,
      hourlyRate,
      weeklyHours,
      actorName: `${currentUser.firstName} ${currentUser.lastName}`,
      actorRole: currentUser.role,
      nowIso: new Date().toISOString(),
      simulateMidWayFailure,
    });

    if (!result.ok) {
      notify('error', result.error ?? 'Transaction annulée.');
      return result;
    }

    setState((prev) => ({
      ...prev,
      employees: result.newEmployee ? [...prev.employees, result.newEmployee] : prev.employees,
      shifts: result.newShift ? [...prev.shifts, result.newShift] : prev.shifts,
      hrDocuments: result.newDocuments
        ? [...result.newDocuments, ...prev.hrDocuments]
        : prev.hrDocuments,
      moduleProgress: result.newModuleProgress
        ? [...prev.moduleProgress, ...result.newModuleProgress]
        : prev.moduleProgress,
      candidates: prev.candidates.map((c) =>
        c.id === candidateId && result.updatedCandidate ? result.updatedCandidate : c
      ),
      auditLogs: result.auditEntry ? [result.auditEntry, ...prev.auditLogs] : prev.auditLogs,
    }));

    notify(
      'success',
      `Onboarding 1-clic réussi : Contrat CDI officiel C.FITNESS généré pour ${result.newEmployee?.firstName} ${result.newEmployee?.lastName} (PIN ${result.newEmployee?.pinCode}).`
    );
    return result;
  };

  const moveCandidateStage: CfosContextValue['moveCandidateStage'] = (candidateId, stage) => {
    const targetCandidate = state.candidates.find((c) => c.id === candidateId);
    setState((prev) => ({
      ...prev,
      candidates: prev.candidates.map((c) => (c.id === candidateId ? { ...c, stage } : c)),
    }));

    // Spec v1.2 §1: Dès qu'un candidat est glissé/passé sur "Retenu", déclenchement automatique de la génération du contrat CDI pré-rempli
    if (stage === 'Retenu' && targetCandidate && !targetCandidate.onboardedEmployeeId) {
      return runCandidateOnboarding({
        candidateId,
        firstShiftDate: '2026-10-26',
        firstShiftStart: '09:00',
        firstShiftEnd: '17:00',
        hourlyRate: CFITNESS_LEGAL_IDENTITY.tauxHoraireBrutEur,
        weeklyHours: CFITNESS_LEGAL_IDENTITY.tempsTravailHebdo,
      });
    }

    notify('success', `Candidature déplacée vers "${stage}".`);
    return null;
  };

  const ingestEmailCandidate: CfosContextValue['ingestEmailCandidate'] = (rawInput) => {
    const parsed = parseRecruitmentEmailPayload(rawInput);
    const nowDate = new Date().toISOString().slice(0, 10);
    const nowTime = new Date().toTimeString().slice(0, 5);
    const newCandidate: Candidate = {
      id: `cand-${Date.now()}`,
      offerId: parsed.clubId === 'beynost' ? 'off-bey-bpjeps' : 'off-cds-comm',
      firstName: parsed.firstName,
      lastName: parsed.lastName,
      email: parsed.email,
      phone: parsed.phone,
      clubId: parsed.clubId,
      roleTarget: parsed.roleTarget,
      contractTarget: 'CDI',
      sourceChannel: 'recrutement@c.fitness',
      cvPdfFileName: parsed.cvPdfFileName,
      rgpdAckSentAt: `${nowDate} ${nowTime}`,
      stage: 'Reçue',
      experienceSummary: rawInput.bodyText.slice(0, 160),
      certifications: ['CV PDF extrait automatiquement'],
      aiDecisionSupportNote:
        'Ingestion automatique depuis recrutement@c.fitness : Nom, Prénom, Téléphone, Email et CV PDF extraits · Accusé RGPD envoyé.',
      aiFitIndicators: ['Source recrutement@c.fitness', 'CV PDF joint', 'Accusé RGPD envoyé'],
      appliedAt: nowDate,
      rgpdRetentionUntil: '2028-10-23',
    };

    setState((prev) => ({
      ...prev,
      candidates: [newCandidate, ...prev.candidates],
      auditLogs: appendAudit(prev.auditLogs, {
        clubId: parsed.clubId,
        action: 'INGESTION_AUTO_EMAIL_RECRUTEMENT',
        target: `${parsed.firstName} ${parsed.lastName} <${parsed.email}>`,
        afterState: `CV PDF (${parsed.cvPdfFileName}) parsé depuis recrutement@c.fitness + accusé RGPD envoyé`,
      }),
    }));

    notify(
      'success',
      `Candidature ${parsed.firstName} ${parsed.lastName} ingérée depuis recrutement@c.fitness + Accusé RGPD envoyé.`
    );
    return { candidate: newCandidate, rgpdReply: parsed.rgpdAutoReplyText };
  };

  const createJobOffer: CfosContextValue['createJobOffer'] = (input) => {
    const newOffer: JobOffer = {
      id: `off-${Date.now()}`,
      ...input,
      active: true,
      publishedAt: new Date().toISOString().slice(0, 10),
    };
    setState((prev) => ({
      ...prev,
      jobOffers: [newOffer, ...prev.jobOffers],
      auditLogs: appendAudit(prev.auditLogs, {
        clubId: input.clubId,
        action: 'PUBLICATION_OFFRE_MULTIPOSTING',
        target: input.title,
        afterState: `Diffusée sur : ${input.channels.join(', ')}`,
      }),
    }));
    notify('success', `Offre "${input.title}" publiée en multiposting.`);
  };

  const simulateMemberGateScan = (memberId: string, clubId: ClubId): AccessEvent | null => {
    const member = state.heitzMembers.find((m) => m.id === memberId);
    const club = state.clubs.find((c) => c.id === clubId);
    if (!member || !club) return null;

    const event = evaluateGatePassage(member, club, new Date().toISOString());

    setState((prev) => ({
      ...prev,
      accessEvents: [event, ...prev.accessEvents],
      clubs: prev.clubs.map((c) =>
        c.id === clubId && event.granted
          ? { ...c, fmiCurrent: Math.min(c.fmiCapacity, c.fmiCurrent + 1) }
          : c
      ),
      auditLogs: !event.granted
        ? appendAudit(prev.auditLogs, {
            clubId,
            action: 'HEITZ_WS_REFUS_PORTILLON',
            target: `${member.firstName} ${member.lastName} (${member.badgeCode})`,
            afterState: event.reason,
          })
        : prev.auditLogs,
    }));

    if (event.granted) {
      notify('success', `Portillon ouvert en ${event.latencyMs} ms — ${event.reason}`);
    } else {
      notify('warning', `Portillon refusé (${event.latencyMs} ms) — ${event.reason}`);
    }
    return event;
  };

  const regularizeMemberSepa = (memberId: string) => {
    setState((prev) => {
      const target = prev.heitzMembers.find((m) => m.id === memberId);
      return {
        ...prev,
        heitzMembers: prev.heitzMembers.map((m) =>
          m.id === memberId ? { ...m, finBalanceEur: 0, finBalanceState: 1 } : m
        ),
        auditLogs: appendAudit(prev.auditLogs, {
          clubId: target?.homeClubId ?? 'global',
          action: 'REGULARISATION_IMPAYE_SEPA_HEITZ',
          target: target ? `${target.firstName} ${target.lastName}` : memberId,
          beforeState: `Solde débiteur ${target?.finBalanceEur.toFixed(2)} €`,
          afterState: 'Solde 0.00 € (finBalanceState=1) — accès portillon rétabli',
        }),
      };
    });
    notify('success', 'Impayé SEPA régularisé : accès portillons Heitz immédiatement rétabli.');
  };

  const triggerManualTurnstileOpen: CfosContextValue['triggerManualTurnstileOpen'] = (
    clubId,
    gateLabel,
    reasonLabel
  ) => {
    const nowIso = new Date().toISOString();
    const manualEvent: AccessEvent = {
      id: `acc-man-${Date.now()}`,
      clubId,
      memberId: 'accueil-tpv',
      memberName: `Ouverture Accueil (${gateLabel})`,
      homeClubId: clubId,
      timestamp: nowIso,
      latencyMs: 11,
      granted: true,
      reason: `Impulsion contact sec NO 500 ms commandée depuis Pupitre TPV Heitz : ${gateLabel} (${reasonLabel})`,
      smsRelanceSent: false,
      qrTokenGenerated: `HZ-TPV-RELAY-${gateLabel.replace(/\s+/g, '-').toUpperCase()}-500MS`,
    };

    setState((prev) => ({
      ...prev,
      accessEvents: [manualEvent, ...prev.accessEvents],
      auditLogs: appendAudit(prev.auditLogs, {
        clubId,
        action: 'OUVERTURE_MANUELLE_PORTILLON_TPV_HEITZ',
        target: `${gateLabel} (${clubId === 'carre-de-soie' ? 'Carré de Soie' : 'Beynost'})`,
        afterState: `Relais IP contact sec NO 500ms activé · Motif : ${reasonLabel}`,
      }),
    }));

    notify(
      'success',
      `${gateLabel} ouvert manuellement (impulsion relais contact sec 500 ms · ${reasonLabel}).`
    );
    return manualEvent;
  };

  const toggleMemberSubscriptionStatus = (memberId: string) => {
    setState((prev) => {
      const target = prev.heitzMembers.find((m) => m.id === memberId);
      if (!target) return prev;
      const nextActive = !target.activeSubscription;
      return {
        ...prev,
        heitzMembers: prev.heitzMembers.map((m) =>
          m.id === memberId ? { ...m, activeSubscription: nextActive } : m
        ),
        auditLogs: appendAudit(prev.auditLogs, {
          clubId: target.homeClubId,
          action: nextActive
            ? 'REACTIVATION_ABONNEMENT_HEITZ'
            : 'GEL_MEDICAL_SUSPENSION_ABONNEMENT_HEITZ',
          target: `${target.firstName} ${target.lastName} (${target.badgeCode})`,
          afterState: nextActive ? 'Abonnement actif' : 'Abonnement suspendu (Gel médical / Congé)',
        }),
      };
    });
    notify('success', 'Statut de l’abonnement Heitz mis à jour (Gel médical / Réactivation).');
  };

  const rewardMemberLoyaltyOrReferral: CfosContextValue['rewardMemberLoyaltyOrReferral'] = (
    memberId,
    rewardType,
    friendName
  ) => {
    const target = state.heitzMembers.find((m) => m.id === memberId);
    if (!target) return;

    const addedPoints = rewardType === 'parrainage' ? 150 : 100;
    const nextPoints = (target.loyaltyPoints ?? 120) + addedPoints;
    const nextReferrals = (target.referralsCount ?? 1) + (rewardType === 'parrainage' ? 1 : 0);
    const label =
      rewardType === 'parrainage'
        ? `Parrainage validé${friendName ? ` (${friendName})` : ''} · +150 pts & 1 mois offert Heitz`
        : 'Bonus Anniversaire & Fidélité Heitz · +100 pts & SMS 07 envoyé';

    setState((prev) => ({
      ...prev,
      heitzMembers: prev.heitzMembers.map((m) =>
        m.id === memberId
          ? {
              ...m,
              loyaltyPoints: nextPoints,
              referralsCount: nextReferrals,
              lastRewardLabel: label,
            }
          : m
      ),
      auditLogs: appendAudit(prev.auditLogs, {
        clubId: target.homeClubId,
        action:
          rewardType === 'parrainage'
            ? 'PARRAINAGE_FIDELITE_HEITZ'
            : 'BONUS_ANNIVERSAIRE_FIDELITE_HEITZ',
        target: `${target.firstName} ${target.lastName} (${target.badgeCode})`,
        afterState: `${label} (Total : ${nextPoints} pts · ${nextReferrals} parrainage(s))`,
      }),
    }));

    notify(
      'success',
      `${target.firstName} ${target.lastName} : ${label} (Total fidélité : ${nextPoints} pts).`
    );
  };

  const recordQuickTpvSale: CfosContextValue['recordQuickTpvSale'] = (
    clubId,
    itemLabel,
    amountEur,
    memberName
  ) => {
    const nowIso = new Date().toISOString();
    const ticketSuffix = Math.floor(Math.random() * 90000) + 10000;
    setState((prev) => {
      const nextNum = 1457 + prev.heitzKpiTickets.length;
      const tpvTicket: HeitzKpiTicket = {
        id: 1000307250000 + prev.heitzKpiTickets.length * 100000 + ticketSuffix,
        number: `000000${nextNum}`,
        clubId,
        idCenter: clubId === 'carre-de-soie' ? 5052 : 5053,
        dateIso: nowIso.slice(0, 16).replace('T', ' '),
        idEmpSeller: currentUser.heitzEmployeeId ?? 100403,
        sellerEmployeeId: currentUser.id,
        sellerName: `${currentUser.firstName} ${currentUser.lastName}`,
        idClient: 1000301397776,
        clientName: memberName || 'Vente Comptoir Accueil',
        articleId: 1000301396496,
        articleCategory: 8,
        articleName: `00 - ${itemLabel.toUpperCase()}`,
        paymentMethodName: 'CB TPV',
        amountTtcEur: amountEur,
        silaeCommissionEur: Number((amountEur * 0.1).toFixed(2)),
        ticketState: 1,
      };
      return {
        ...prev,
        heitzKpiTickets: [tpvTicket, ...prev.heitzKpiTickets],
        auditLogs: appendAudit(prev.auditLogs, {
          clubId,
          action: 'ENCAISSEMENT_TPV_CAISSE_HEITZ',
          target: `${itemLabel} (${memberName || 'Vente Comptoir Accueil'})`,
          afterState: `Encaissé : ${amountEur.toFixed(2)} € TTC (CB / Espèces · Ticket KPI /api/ticket #${tpvTicket.number})`,
        }),
      };
    });
    notify(
      'success',
      `Vente TPV Heitz encaissée : ${itemLabel} (${amountEur.toFixed(2)} € TTC${
        memberName ? ` · ${memberName}` : ''
      }).`
    );
  };

  const toggleClubMode = (clubId: ClubId, field: 'degradedMode' | 'fireAlarmOpen') => {
    setState((prev) => {
      const targetClub = prev.clubs.find((c) => c.id === clubId);
      const nextVal = targetClub ? !targetClub[field] : false;
      return {
        ...prev,
        clubs: prev.clubs.map((c) => (c.id === clubId ? { ...c, [field]: nextVal } : c)),
        auditLogs: appendAudit(prev.auditLogs, {
          clubId,
          action: field === 'fireAlarmOpen' ? 'BASCULE_SECURITE_INCENDIE' : 'BASCULE_MODE_DEGRADE_LOCAL',
          target: targetClub?.name ?? clubId,
          afterState: nextVal ? 'Activé' : 'Désactivé (retour nominal)',
        }),
      };
    });
  };

  const addInBodyScan = (scanInput: Omit<InBodyScan, 'id'>) => {
    const newScan: InBodyScan = {
      ...scanInput,
      id: `inb-${Date.now()}`,
    };
    setState((prev) => ({
      ...prev,
      inBodyScans: [newScan, ...prev.inBodyScans],
      auditLogs: appendAudit(prev.auditLogs, {
        clubId: scanInput.clubId,
        action: 'SYNCHRO_BILAN_TECHNOGYM_CHECKUP_MYWELLNESS',
        target: scanInput.personName,
        afterState: `${scanInput.deviceModel} · Masse musc. ${scanInput.skeletalMuscleMassKg} kg (accès RGPD cloisonné)`,
      }),
    }));
    notify('success', `Bilan ${scanInput.deviceModel} enregistré pour ${scanInput.personName}.`);
  };

  const signGoNoGoPhase = (phaseId: string, signerNames: string) => {
    const today = new Date().toISOString().slice(0, 10);
    const targetPhase = state.goNoGoPhases.find((p) => p.id === phaseId);
    const isCurrentlyValidated = targetPhase?.status === 'valide';
    const resolvedSigner =
      signerNames && signerNames !== 'valide' && signerNames !== 'en_cours'
        ? signerNames.trim()
        : `${currentUser.firstName} ${currentUser.lastName}`;

    setState((prev) => ({
      ...prev,
      goNoGoPhases: prev.goNoGoPhases.map((p) =>
        p.id === phaseId
          ? isCurrentlyValidated
            ? {
                ...p,
                status: 'en_cours',
                signedBy: undefined,
                signedAt: undefined,
              }
            : {
                ...p,
                status: 'valide',
                signedBy: resolvedSigner,
                signedAt: today,
              }
          : p
      ),
      auditLogs: appendAudit(prev.auditLogs, {
        clubId: 'global',
        action: isCurrentlyValidated ? 'REOUVERTURE_PORTE_GO_NOGO' : 'SIGNATURE_PORTE_GO_NOGO',
        target: phaseId,
        afterState: isCurrentlyValidated
          ? 'Porte Go/No-Go remise en cours de vérification'
          : `Signé par ${resolvedSigner} le ${today}`,
      }),
    }));
    notify(
      'success',
      isCurrentlyValidated
        ? `Porte Go/No-Go (${targetPhase?.title || phaseId}) remise en attente de validation.`
        : `Porte Go/No-Go (${targetPhase?.title || phaseId}) validée et signée par ${resolvedSigner}.`
    );
  };

  const syncAllDeviceReplicasNow = (targetNodeId?: string) => {
    const nowIso = new Date().toISOString();
    setState((prev) => {
      const envelope = buildBackupEnvelope(
        prev as unknown as Parameters<typeof buildBackupEnvelope>[0],
        targetNodeId || 'Serveur Principal Debian 12 (.10)',
        prev.serverPowerStatus,
        nowIso
      );
      const sizeKb = Math.max(145, Math.round(JSON.stringify(envelope).length / 1024));
      const updatedReplicas = prev.backupReplicas.map((r) => {
        if (targetNodeId && r.id !== targetNodeId) return r;
        if (!targetNodeId && !r.autoSyncEnabled) return r;
        return {
          ...r,
          lastSyncedAt: nowIso,
          lastChecksum: envelope.checksum,
          snapshotSizeKb: sizeKb,
          status:
            prev.serverPowerStatus === 'coupure_courant_bascule_active' &&
            r.id === prev.activeFailoverNodeId
              ? ('relais_actif_secours' as const)
              : ('synchronise' as const),
          recordsMirrored: {
            members: prev.heitzMembers.length,
            employees: prev.employees.length,
            prospects: prev.prospects.length,
            shifts: prev.shifts.length,
            offlinePunches: prev.offlinePointageQueue.length,
          },
        };
      });

      const targetDevice = prev.backupReplicas.find((r) => r.id === targetNodeId);

      return {
        ...prev,
        backupReplicas: updatedReplicas,
        lastAutoBackupAt: nowIso,
        lastBackupChecksum: envelope.checksum,
        auditLogs: appendAudit(prev.auditLogs, {
          clubId: 'global',
          action: 'REPLICATION_AUTO_MULTI_APPAREILS',
          target: targetDevice
            ? targetDevice.deviceName
            : 'Tous les appareils de secours (2 PC, 2 Tablettes, 2 Téléphones)',
          afterState: `Snapshot ${envelope.checksum} répliqué (${prev.heitzMembers.length} adhérents, ${prev.employees.length} salariés, ${prev.prospects.length} prospects)`,
        }),
      };
    });

    notify(
      'success',
      targetNodeId
        ? 'Sauvegarde instantanée répliquée avec succès sur cet appareil de secours.'
        : 'Sauvegarde automatique répliquée sur tous les PC, Tablettes et Téléphones des 2 clubs.'
    );
  };

  const toggleReplicaAutoSync = (nodeId: string) => {
    setState((prev) => ({
      ...prev,
      backupReplicas: prev.backupReplicas.map((r) =>
        r.id === nodeId ? { ...r, autoSyncEnabled: !r.autoSyncEnabled } : r
      ),
    }));
  };

  const simulateServerPowerOutage = (outageActive: boolean, failoverNodeId?: string) => {
    const nowIso = new Date().toISOString();
    setState((prev) => {
      const selectedNodeId = failoverNodeId || prev.activeFailoverNodeId || 'replica-pc-beynost';
      const selectedNode =
        prev.backupReplicas.find((r) => r.id === selectedNodeId) ?? prev.backupReplicas[0];

      if (outageActive) {
        const envelope = buildBackupEnvelope(
          prev as unknown as Parameters<typeof buildBackupEnvelope>[0],
          selectedNode.deviceName,
          'coupure_courant_bascule_active',
          nowIso
        );
        return {
          ...prev,
          serverPowerStatus: 'coupure_courant_bascule_active',
          activeFailoverNodeId: selectedNode.id,
          kioskOfflineMode: true,
          clubs: prev.clubs.map((c) => ({ ...c, degradedMode: true })),
          lastAutoBackupAt: nowIso,
          lastBackupChecksum: envelope.checksum,
          backupReplicas: prev.backupReplicas.map((r) => ({
            ...r,
            lastSyncedAt: nowIso,
            lastChecksum: envelope.checksum,
            status:
              r.id === selectedNode.id
                ? ('relais_actif_secours' as const)
                : ('synchronise' as const),
          })),
          auditLogs: appendAudit(prev.auditLogs, {
            clubId: 'global',
            action: 'BASCULE_SECOURS_COUPURE_SERVEUR',
            target: selectedNode.deviceName,
            beforeState: 'Serveur Principal Debian 12 (.10) En Ligne',
            afterState: `Coupure serveur détectée -> Relais autonome actif sur ${selectedNode.deviceName} (Cache Tourniquets Heitz + Pointage PIN Hors-Ligne actifs)`,
          }),
        };
      }

      // Power restored on primary server: automatically flush offline pointages and restore nominal mode
      const flushedCount = prev.offlinePointageQueue.length;
      const mergedTimeEntries = [
        ...prev.offlinePointageQueue.map((p) => ({ ...p, syncedFromOffline: true })),
        ...prev.timeEntries,
      ];

      return {
        ...prev,
        serverPowerStatus: 'nominal',
        kioskOfflineMode: false,
        timeEntries: mergedTimeEntries,
        offlinePointageQueue: [],
        clubs: prev.clubs.map((c) => ({ ...c, degradedMode: false })),
        lastAutoBackupAt: nowIso,
        backupReplicas: prev.backupReplicas.map((r) => ({
          ...r,
          lastSyncedAt: nowIso,
          status: 'synchronise' as const,
          recordsMirrored: {
            members: prev.heitzMembers.length,
            employees: prev.employees.length,
            prospects: prev.prospects.length,
            shifts: prev.shifts.length,
            offlinePunches: 0,
          },
        })),
        auditLogs: appendAudit(prev.auditLogs, {
          clubId: 'global',
          action: 'RETOUR_COURANT_RESYNC_SERVEUR_PRINCIPAL',
          target: 'Serveur Principal Debian 12 (10.10.0.10)',
          beforeState: `Mode Secours sur ${selectedNode.deviceName}`,
          afterState: `Serveur rétabli · ${flushedCount} pointage(s) hors-ligne et passages tourniquets réintégrés sans aucune perte`,
        }),
      };
    });

    if (outageActive) {
      notify(
        'warning',
        'Coupure serveur simulée : Bascule automatique active sur l’appareil de secours (PC/Tablette/Téléphone). Les 2 clubs continuent de fonctionner.'
      );
    } else {
      notify(
        'success',
        'Courant & Serveur Principal rétablis : toutes les opérations saisies sur PC/Tablette/Téléphone de secours ont été resynchronisées.'
      );
    }
  };

  const exportDeviceBackupJson = (targetNodeId?: string) => {
    const targetDevice = state.backupReplicas.find((r) => r.id === targetNodeId);
    const originLabel = targetDevice
      ? targetDevice.deviceName
      : `${currentUser.firstName} ${currentUser.lastName} (PC / Tablette / Smartphone)`;

    const envelope = buildBackupEnvelope(
      state as unknown as Parameters<typeof buildBackupEnvelope>[0],
      originLabel,
      state.serverPowerStatus
    );

    const blob = new Blob([JSON.stringify(envelope, null, 2)], {
      type: 'application/json;charset=utf-8;',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const dateStamp = new Date().toISOString().slice(0, 16).replace(/[:T]/g, '-');
    const slug = targetNodeId ? targetNodeId.replace('replica-', '') : 'complet-biclub';
    a.href = url;
    a.download = `cfitness-os-secours-${slug}-${dateStamp}.cfos-backup.json`;
    a.click();
    URL.revokeObjectURL(url);

    syncAllDeviceReplicasNow(targetNodeId);
    notify(
      'success',
      `Fichier de secours autonome (.cfos-backup.json · ${envelope.checksum}) téléchargé pour continuer à faire tourner les clubs sur PC, Tablette ou Téléphone.`
    );
  };

  const importAndMergeDeviceBackup: CfosContextValue['importAndMergeDeviceBackup'] = (rawJson) => {
    try {
      const parsed = JSON.parse(rawJson);
      const replicaPayload =
        parsed && parsed.schemaVersion === 'cfos-replica-v1.2' && parsed.payload
          ? parsed.payload
          : parsed;

      if (!replicaPayload || !Array.isArray(replicaPayload.heitzMembers)) {
        const msg = 'Fichier de sauvegarde invalide : structure C.Fitness OS non reconnue.';
        notify('error', msg);
        return { ok: false, message: msg };
      }

      const mergeOutcome = mergeFailoverSnapshot(state, replicaPayload);
      const nowIso = new Date().toISOString();
      const summary = `+${mergeOutcome.stats.addedPunches} pointages, +${mergeOutcome.stats.addedAccessEvents} passages tourniquets, +${mergeOutcome.stats.addedProspects} prospects, ${mergeOutcome.stats.regularisedMembers} régularisations SEPA`;

      setState((prev) => ({
        ...prev,
        ...mergeOutcome.mergedState,
        lastAutoBackupAt: nowIso,
        auditLogs: appendAudit(mergeOutcome.mergedState.auditLogs, {
          clubId: 'global',
          action: 'RESTAURATION_FUSION_SAUVEGARDE_APPAREIL_SECOURS',
          target: parsed.originDevice || 'Fichier .cfos-backup.json (PC/Tablette/Téléphone)',
          afterState: `Fusion sans perte terminée (${summary})`,
        }),
      }));

      const okMsg = `Sauvegarde de secours fusionnée avec succès (${summary}) !`;
      notify('success', okMsg);
      return { ok: true, message: okMsg };
    } catch {
      const errMsg = 'Impossible de lire le fichier JSON de sauvegarde.';
      notify('error', errMsg);
      return { ok: false, message: errMsg };
    }
  };

  const createOrUpdateExternalPlanningEvent: CfosContextValue['createOrUpdateExternalPlanningEvent'] =
    (eventInput) => {
      const nowIso = new Date().toISOString();
      setState((prev) => {
        const existingIdx = prev.unifiedExternalEvents.findIndex(
          (ev) => ev.externalSourceId === eventInput.externalSourceId
        );
        let updatedEvents: UnifiedPlanningEvent[];
        if (existingIdx >= 0) {
          updatedEvents = prev.unifiedExternalEvents.map((ev, idx) =>
            idx === existingIdx
              ? { ...ev, ...eventInput, lastSyncedAt: nowIso }
              : ev
          );
        } else {
          updatedEvents = [
            {
              ...eventInput,
              id: `uev-${Date.now()}`,
              lastSyncedAt: nowIso,
            },
            ...prev.unifiedExternalEvents,
          ];
        }
        return {
          ...prev,
          unifiedExternalEvents: updatedEvents,
          auditLogs: appendAudit(prev.auditLogs, {
            clubId: eventInput.clubId,
            action: 'PLANNING_CENTRALISE_SYNCHRO_EVENEMENT',
            target: `${eventInput.title} (${eventInput.externalSourceId})`,
            afterState: `Synchronisé avec source d'origine ${eventInput.originSystem} sans duplication (${eventInput.date} ${eventInput.startTime}-${eventInput.endTime})`,
          }),
        };
      });
      notify(
        'success',
        `Événement « ${eventInput.title} » enregistré sur le planning centralisé et synchronisé avec sa source d'origine (${eventInput.originSystem}).`
      );
    };

  const deleteExternalPlanningEvent = (id: string) => {
    setState((prev) => ({
      ...prev,
      unifiedExternalEvents: prev.unifiedExternalEvents.filter((ev) => ev.id !== id),
    }));
    notify('success', 'Événement retiré du planning centralisé.');
  };

  const toggleCollaboratorTask = (taskId: string) => {
    const nowTime = new Date().toTimeString().slice(0, 5);
    setState((prev) => ({
      ...prev,
      collaboratorTasks: prev.collaboratorTasks.map((t) =>
        t.id === taskId
          ? {
              ...t,
              completed: !t.completed,
              completedAt: !t.completed ? nowTime : undefined,
            }
          : t
      ),
    }));
  };

  const addCollaboratorTask: CfosContextValue['addCollaboratorTask'] = (taskInput) => {
    setState((prev) => ({
      ...prev,
      collaboratorTasks: [
        {
          ...taskInput,
          id: `tsk-${Date.now()}`,
          completed: false,
        },
        ...prev.collaboratorTasks,
      ],
    }));
    notify('success', `Tâche ajoutée au tableau de bord « Ma Journée ».`);
  };

  const markNotificationRead = (notifId: string) => {
    setState((prev) => ({
      ...prev,
      collaboratorNotifications: prev.collaboratorNotifications.map((n) =>
        n.id === notifId ? { ...n, read: true } : n
      ),
    }));
  };

  const signDocumentWithInternalProof: CfosContextValue['signDocumentWithInternalProof'] = ({
    docId,
    otpInput,
    consentChecked,
    consentPhrase,
  }) => {
    const doc = state.hrDocuments.find((d) => d.id === docId);
    if (!doc) {
      return { ok: false, message: 'Document RH introuvable.' };
    }
    const emp = state.employees.find((e) => e.id === doc.employeeId) || currentUser;
    const res = createInternalElectronicSignatureProof({
      document: doc,
      employee: emp,
      otpInput,
      consentChecked,
      consentPhrase,
    });

    if (!res.ok || !res.signedDocument || !res.proof) {
      notify('error', res.error || 'Échec de la signature électronique.');
      return { ok: false, message: res.error || 'Échec de la signature électronique.' };
    }

    setState((prev) => ({
      ...prev,
      hrDocuments: prev.hrDocuments.map((d) => (d.id === docId ? res.signedDocument! : d)),
      collaboratorNotifications: prev.collaboratorNotifications.map((n) =>
        n.employeeId === emp.id && n.type === 'signature_requise' ? { ...n, read: true } : n
      ),
      auditLogs: appendAudit(prev.auditLogs, {
        clubId: emp.clubId,
        action: 'SIGNATURE_ELECTRONIQUE_INTERNE_CFITNESS_OS',
        target: `${doc.title} (${emp.firstName} ${emp.lastName})`,
        beforeState: 'En attente signature',
        afterState: `Signé & scellé (Preuve ${res.proof!.proofId} · ${res.proof!.proofSealSha256} · 0 € / signature)`,
      }),
    }));

    const okMsg = `Document signé électroniquement avec succès (Preuve juridique ${res.proof.proofId} · Empreinte ${res.proof.proofSealSha256} · 0 € / signature).`;
    notify('success', okMsg);
    return { ok: true, message: okMsg };
  };

  const openMywellnessLink: CfosContextValue['openMywellnessLink'] = (params) => {
    const built = buildMywellnessContextualUrl(params);
    setActiveMywellnessModal({
      mywellnessMemberId: params.mywellnessMemberId,
      personName: params.personName,
      clubId: params.clubId,
    });
    setState((prev) => ({
      ...prev,
      auditLogs: appendAudit(prev.auditLogs, {
        clubId: params.clubId || 'global',
        action: 'OUVERTURE_LIEN_CONTEXTUEL_MYWELLNESS',
        target: built.label,
        afterState: `Ouverture de la Fiche Sportive Mywellness intégrée (${built.label})`,
      }),
    }));
    notify(
      'success',
      `Fiche Sportive Technogym Mywellness ouverte : ${built.label}.`
    );
    return built;
  };

  const closeMywellnessModal = () => setActiveMywellnessModal(null);

  const value: CfosContextValue = {
    ...state,
    currentUser,
    isAuthenticated,
    isArchitectUnlocked,
    shellMode,
    activeSection,
    navSubTarget,
    clubFilter,
    themeMode,
    setThemeMode,
    toggleThemeMode,
    accentColor,
    setAccentColor,
    cycleAccentColor,
    bannerNotice,
    clearBanner: () => setBannerNotice(null),
    setShellMode,
    setActiveSection,
    unlockArchitectSpace,
    lockArchitectSpace,
    setClubFilter,
    switchUserSession,
    loginWithLocalCredentials,
    logoutSession,
    resetDemoData,
    syncAllDeviceReplicasNow,
    toggleReplicaAutoSync,
    simulateServerPowerOutage,
    exportDeviceBackupJson,
    importAndMergeDeviceBackup,
    setSipTrunkProvider,
    takePhoneLineSession,
    releasePhoneLineSession,
    placeSimulatedCall,
    qualifyRingoverCall,
    createProspect,
    updateProspectStage,
    scheduleProspectTrial,
    convertProspectToMember,
    sendValidatedProspectSms,
    toggleProspectStopSms,
    addShift,
    deleteShift,
    punchWithPin,
    unlockEmployeePin,
    toggleKioskOfflineMode,
    submitLeaveRequest,
    decideLeaveRequest,
    signHrDocument,
    completeAcademyQuiz,
    toggleBpjepsMilestoneValidation,
    toggleChecklistItem,
    moveCandidateStage,
    ingestEmailCandidate,
    createJobOffer,
    runCandidateOnboarding,
    simulateMemberGateScan,
    triggerManualTurnstileOpen,
    regularizeMemberSepa,
    toggleMemberSubscriptionStatus,
    rewardMemberLoyaltyOrReferral,
    recordQuickTpvSale,
    toggleClubMode,
    addInBodyScan,
    signGoNoGoPhase,
    createOrUpdateExternalPlanningEvent,
    deleteExternalPlanningEvent,
    toggleCollaboratorTask,
    addCollaboratorTask,
    markNotificationRead,
    signDocumentWithInternalProof,
    openMywellnessLink,
    activeMywellnessModal,
    closeMywellnessModal,
  };

  return <CfosContext.Provider value={value}>{children}</CfosContext.Provider>;
}

export function useCfos() {
  const ctx = useContext(CfosContext);
  if (!ctx) {
    throw new Error('useCfos must be used within CfosProvider');
  }
  return ctx;
}
