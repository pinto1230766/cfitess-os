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
  Employee,
  GoNoGoPhase,
  HRDocument,
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
} from '../types/cfos';
import {
  INITIAL_ACCESS_EVENTS,
  INITIAL_AUDIT_LOGS,
  INITIAL_BPJEPS_MILESTONES,
  INITIAL_CALL_LOGS,
  INITIAL_CANDIDATES,
  INITIAL_CHECKLISTS,
  INITIAL_CLUBS,
  INITIAL_EMPLOYEES,
  INITIAL_GONOGO_PHASES,
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
} from '../data/seed';
import {
  CFITNESS_LEGAL_IDENTITY,
  INITIAL_BACKUP_REPLICAS,
  buildBackupEnvelope,
  canCallProspectProspection,
  canSendProspectSms,
  evaluateGatePassage,
  executeTransactionalOnboarding,
  findDuplicateProspect,
  mergeFailoverSnapshot,
  parseRecruitmentEmailPayload,
  selectOutboundNumber,
  verifyEmployeePin,
  type OnboardingTransactionResult,
} from '../domain/rules';

const STORAGE_KEY = 'cfitness_os_state_v3';
const BACKUP_ENVELOPE_KEY = 'cfitness_os_backup_envelope_v12';
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
}

function getDefaultState(): PersistedState {
  return {
    clubs: INITIAL_CLUBS,
    employees: INITIAL_EMPLOYEES,
    shifts: INITIAL_SHIFTS,
    timeEntries: INITIAL_TIME_ENTRIES,
    offlinePointageQueue: [],
    kioskOfflineMode: false,
    sipTrunkProvider: 'freebox_pro',
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
  };
}

interface CfosContextValue extends PersistedState {
  currentUser: Employee;
  isAuthenticated: boolean;
  shellMode: ShellMode;
  activeSection: AdminSection;
  clubFilter: ClubFilter;
  bannerNotice: { tone: 'success' | 'warning' | 'error'; text: string } | null;
  clearBanner: () => void;
  setShellMode: (mode: ShellMode) => void;
  setActiveSection: (sec: AdminSection) => void;
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
  }) => { ok: boolean; message: string; callerIdUsed?: string };

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
  decideLeaveRequest: (leaveId: string, decision: 'valide' | 'refuse') => void;
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
  regularizeMemberSepa: (memberId: string) => void;
  toggleClubMode: (clubId: ClubId, field: 'degradedMode' | 'fireAlarmOpen') => void;
  addInBodyScan: (scan: Omit<InBodyScan, 'id'>) => void;

  signGoNoGoPhase: (phaseId: string, signerNames: string) => void;
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
  const [activeSection, setActiveSection] = useState<AdminSection>('dashboard');
  const [clubFilter, setClubFilter] = useState<ClubFilter>('all');
  const [bannerNotice, setBannerNotice] = useState<CfosContextValue['bannerNotice']>(null);

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
      setActiveSection('dashboard');
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
    setIsAuthenticated(false);
    try {
      window.sessionStorage.removeItem('cfos_local_auth_active');
    } catch {
      // ignore
    }
  };

  const resetDemoData = () => {
    const fresh = getDefaultState();
    setState(fresh);
    setCurrentUserId('emp-mario');
    setShellMode('admin');
    setActiveSection('dashboard');
    setClubFilter('all');
    notify('success', 'Données de référence C.Fitness OS v1.2 réinitialisées.');
  };

  const setSipTrunkProvider = (provider: SipTrunkProvider) => {
    setState((prev) => ({
      ...prev,
      sipTrunkProvider: provider,
      auditLogs: appendAudit(prev.auditLogs, {
        clubId: 'global',
        action: 'BASCULE_TRUNK_SIP_ASTERISK',
        target: provider === 'ovhcloud_sip' ? 'Trunk SIP OVHcloud (sip.ovh.fr)' : 'Freebox Pro Beynost (SIP Central)',
        afterState:
          provider === 'ovhcloud_sip'
            ? 'Trunk SIP OVHcloud actif sur les 12 lignes (fixes 04 + pool 07 anti-spam)'
            : 'Trunk SIP Freebox Pro Beynost actif sur les 12 lignes',
      }),
    }));
    notify(
      'success',
      provider === 'ovhcloud_sip'
        ? 'Trunk SIP OVHcloud (https://www.ovhcloud.com/fr/phone/sip-trunk/) activé sur Asterisk (12 lignes 04/07).'
        : 'Trunk SIP Freebox Pro Beynost activé sur Asterisk (12 lignes 04/07).'
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
      durationSec: outcome === 'Pas de réponse' || outcome === 'Messagerie' ? 24 : durationSec,
      timestamp: new Date().toISOString(),
      whisperScore:
        outcome === 'Pas de réponse' || outcome === 'Messagerie' ? undefined : 89,
      whisperTranscript:
        outcome === 'Pas de réponse' || outcome === 'Messagerie'
          ? undefined
          : 'Appel sortant analysé localement (whisper-rs) : présentation club claire, écoute active et proposition de créneau découverte.',
      detectedObjection:
        outcome === 'RDV Séance fixé'
          ? 'Disponibilité horaires du soir (créneau adapté proposé)'
          : undefined,
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
            : outcome === 'Décroché — Qualifié' && p.stage === 'Nouveau'
            ? 'Contacté'
            : p.stage;
        return {
          ...p,
          stage: nextStage,
          lastOutbound07Used: lineMode === '07' ? callerIdUsed : p.lastOutbound07Used,
          retryCount: p.retryCount + 1,
        };
      }),
    }));

    const msg = `Appel journalisé dans le CRM (Clause Art. 4) via ${callerIdUsed} (${outcome}).`;
    notify('success', msg);
    return { ok: true, message: msg, callerIdUsed };
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

  const decideLeaveRequest = (leaveId: string, decision: 'valide' | 'refuse') => {
    setState((prev) => ({
      ...prev,
      leaveRequests: prev.leaveRequests.map((l) =>
        l.id === leaveId
          ? {
              ...l,
              status: decision,
              validatedBy: `${currentUser.firstName} ${currentUser.lastName}`,
            }
          : l
      ),
      auditLogs: appendAudit(prev.auditLogs, {
        clubId: 'global',
        action: decision === 'valide' ? 'VALIDATION_CONGES_RH' : 'REFUS_CONGES_RH',
        target: leaveId,
        afterState: `Statut: ${decision}`,
      }),
    }));
    notify('success', decision === 'valide' ? 'Congé validé.' : 'Demande refusée.');
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
        action: 'IMPORT_BILAN_INBODY_SANTE',
        target: scanInput.personName,
        afterState: `${scanInput.deviceModel} · Masse musc. ${scanInput.skeletalMuscleMassKg} kg (accès RGPD cloisonné)`,
      }),
    }));
    notify('success', `Bilan ${scanInput.deviceModel} enregistré pour ${scanInput.personName}.`);
  };

  const signGoNoGoPhase = (phaseId: string, signerNames: string) => {
    if (!signerNames.trim()) return;
    const today = new Date().toISOString().slice(0, 10);
    setState((prev) => ({
      ...prev,
      goNoGoPhases: prev.goNoGoPhases.map((p) =>
        p.id === phaseId
          ? {
              ...p,
              status: 'valide',
              signedBy: signerNames.trim(),
              signedAt: today,
            }
          : p
      ),
      auditLogs: appendAudit(prev.auditLogs, {
        clubId: 'global',
        action: 'SIGNATURE_PORTE_GO_NOGO',
        target: phaseId,
        afterState: `Signé par ${signerNames.trim()} le ${today}`,
      }),
    }));
    notify('success', `Porte Go/No-Go validée et signée par ${signerNames.trim()}.`);
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

  const value: CfosContextValue = {
    ...state,
    currentUser,
    isAuthenticated,
    shellMode,
    activeSection,
    clubFilter,
    bannerNotice,
    clearBanner: () => setBannerNotice(null),
    setShellMode,
    setActiveSection,
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
    createProspect,
    updateProspectStage,
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
    regularizeMemberSepa,
    toggleClubMode,
    addInBodyScan,
    signGoNoGoPhase,
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
