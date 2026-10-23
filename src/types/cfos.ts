export type ClubId = 'carre-de-soie' | 'beynost';
export type ClubFilter = 'all' | ClubId;

export type Role = 'admin' | 'manager' | 'commercial' | 'coach' | 'apprenti' | 'kiosque';

export type ShellMode = 'admin' | 'employe' | 'tablette' | 'telephone';

export type AdminSection =
  | 'dashboard'
  | 'telephony'
  | 'crm'
  | 'planning-hr'
  | 'academy'
  | 'ats'
  | 'devices'
  | 'governance';

export type ContractType = 'CDI' | 'CDD' | 'Apprentissage' | 'Extra';

export interface Club {
  id: ClubId;
  name: string;
  city: string;
  address: string;
  landline: string;
  mobilePool: string[];
  internetType: string;
  fixedIp: boolean;
  serverHost: boolean;
  fmiCurrent: number;
  fmiCapacity: number;
  wireguardLatencyMs: number;
  degradedMode: boolean;
  fireAlarmOpen: boolean;
}

export interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: Role;
  clubId: ClubId;
  contractType: ContractType;
  jobTitle: string;
  hourlyRate: number;
  weeklyContractHours: number;
  pinCode: string;
  failedPinAttempts: number;
  pinLocked: boolean;
  totpEnabled: boolean;
  cpBalance: number;
  rttBalance: number;
  hireDate: string;
  proCardExpiry?: string;
  medicalVisitDue?: string;
  contractEndDate?: string;
  tutorName?: string;
}

export interface Shift {
  id: string;
  employeeId: string;
  clubId: ClubId;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  breakMinutes: number;
  roleLabel: string;
  published: boolean;
}

export type PointageType = 'arrivee' | 'debut_pause' | 'fin_pause' | 'depart';

export interface TimeEntry {
  id: string;
  employeeId: string;
  clubId: ClubId;
  timestamp: string; // ISO string
  type: PointageType;
  source: 'tablette_pin' | 'mobile_qr' | 'correction_manager';
  syncedFromOffline: boolean;
  note?: string;
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  clubId: ClubId;
  type: 'CP' | 'RTT' | 'Maladie' | 'Formation CFA';
  startDate: string;
  endDate: string;
  daysCount: number;
  status: 'en_attente' | 'valide' | 'refuse';
  requestedAt: string;
  validatedBy?: string;
}

export interface HRDocument {
  id: string;
  employeeId: string;
  title: string;
  category: 'Contrat' | 'Bulletin Silae' | 'Diplôme BPJEPS' | 'Carte Pro' | 'DPAE' | 'Attestation';
  uploadedAt: string;
  encryptedAtRest: boolean;
  signedStatus: 'Signé horodaté' | 'En attente signature' | 'Archivé coffre-fort';
  period?: string;
}

export type ProspectStage =
  | 'Nouveau'
  | 'Contacté'
  | 'Séance planifiée'
  | 'Venu'
  | 'Adhérent'
  | 'Perdu';

export interface Prospect {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  clubId: ClubId;
  source: 'Site c.fitness' | 'Tablette accueil' | 'Appel entrant' | 'Parrainage';
  stage: ProspectStage;
  assignedToId: string;
  rgpdConsent: boolean;
  bloctelListed: boolean;
  smsStopOptOut: boolean;
  lastOutbound07Used?: string;
  retryCount: number;
  trialDate?: string;
  goal: string;
  notes: string;
  createdAt: string;
  pendingSmsDraft?: string;
}

export interface PhoneLine {
  id: string;
  clubId: ClubId;
  label: string;
  lineType: 'commercial' | 'coach';
  extension: string;
  assignedNumber04: string;
  activeAgentId: string | null;
  sessionStartedAt: string | null;
  status: 'libre' | 'en_ligne' | 'en_appel' | 'post_appel';
  currentProspectName?: string;
}

export interface CallLog {
  id: string;
  clubId: ClubId;
  agentId: string;
  prospectId?: string;
  prospectName: string;
  prospectPhone: string;
  displayedCallerId: string;
  lineMode: '04' | '07';
  direction: 'sortant' | 'entrant';
  outcome: 'Décroché — Qualifié' | 'RDV Séance fixé' | 'Pas de réponse' | 'Messagerie' | 'Adhésion conclue';
  durationSec: number;
  timestamp: string;
  whisperScore?: number;
  whisperTranscript?: string;
  detectedObjection?: string;
}

export interface TrainingModule {
  id: string;
  code: string;
  title: string;
  authors: string;
  durationMin: number;
  mandatoryFor: Role[];
  summary: string;
  keyPoints: string[];
  quizQuestion: string;
  quizOptions: string[];
  quizCorrectIndex: number;
}

export interface ModuleProgress {
  employeeId: string;
  moduleId: string;
  completed: boolean;
  scorePct: number;
  completedAt?: string;
}

export interface BpjepsMilestone {
  id: string;
  apprenticeId: string;
  ucCode: 'UC1' | 'UC2' | 'UC3' | 'UC4';
  title: string;
  tutorValidated: boolean;
  validatedBy?: string;
  validatedAt?: string;
  monthlyReviewNote: string;
}

export interface ClubChecklistItem {
  id: string;
  clubId: ClubId;
  shiftType: 'ouverture' | 'fermeture';
  label: string;
  checkedBy?: string;
  checkedAt?: string;
}

export type CandidateStage = 'Reçue' | 'Examen dirigeants' | 'Entretien club' | 'Retenu';

export interface JobOffer {
  id: string;
  title: string;
  clubId: ClubId;
  contractType: ContractType;
  weeklyHours: number;
  hourlyRate: number;
  channels: string[];
  active: boolean;
  publishedAt: string;
}

export interface Candidate {
  id: string;
  offerId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  clubId: ClubId;
  roleTarget: Role;
  contractTarget: ContractType;
  sourceChannel: 'Indeed' | 'WTTJ' | 'LinkedIn' | 'France Travail' | 'JobTeaser' | 'Site c.fitness';
  stage: CandidateStage;
  experienceSummary: string;
  certifications: string[];
  aiDecisionSupportNote: string;
  aiFitIndicators: string[];
  appliedAt: string;
  rgpdRetentionUntil: string;
  onboardedEmployeeId?: string;
}

export interface HeitzMember {
  id: string;
  badgeCode: string;
  firstName: string;
  lastName: string;
  phone: string;
  homeClubId: ClubId;
  subscriptionName: string;
  activeSubscription: boolean;
  finBalanceEur: number;
  finBalanceState: 0 | 1;
  lastPassageAt?: string;
  technogymMoves30d: number;
  daysSinceLastWorkout: number;
}

export interface AccessEvent {
  id: string;
  clubId: ClubId;
  memberId: string;
  memberName: string;
  homeClubId: ClubId;
  timestamp: string;
  latencyMs: number;
  granted: boolean;
  reason: string;
  smsRelanceSent: boolean;
  qrTokenGenerated: string;
}

export interface InBodyScan {
  id: string;
  personName: string;
  personType: 'Adhérent' | 'Prospect';
  clubId: ClubId;
  date: string;
  deviceModel: 'InBody 570' | 'InBody 270';
  weightKg: number;
  skeletalMuscleMassKg: number;
  bodyFatPercent: number;
  totalBodyWaterL: number;
  visceralFatLevel: number;
  coachNote: string;
}

export interface AuditEntry {
  id: string;
  timestamp: string;
  actorName: string;
  actorRole: Role;
  clubId: ClubId | 'global';
  action: string;
  target: string;
  beforeState?: string;
  afterState: string;
}

export interface GoNoGoPhase {
  id: string;
  code: string;
  title: string;
  durationLabel: string;
  deliverables: string[];
  exitCriteria: string;
  status: 'valide' | 'en_cours' | 'a_venir';
  signedBy?: string;
  signedAt?: string;
}
