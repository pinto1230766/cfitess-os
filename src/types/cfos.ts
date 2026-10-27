export type ClubId = 'carre-de-soie' | 'beynost';
export type ClubFilter = 'all' | ClubId;

export type Role = 'admin' | 'manager' | 'commercial' | 'coach' | 'apprenti' | 'kiosque';

export type ShellMode = 'admin' | 'employe' | 'tablette' | 'telephone';

export type AdminSection =
  | 'dashboard'
  | 'orchestrator'
  | 'my-day'
  | 'planning-hr'
  | 'devices'
  | 'telephony'
  | 'crm'
  | 'ats'
  | 'academy'
  | 'governance'
  | 'executive-dossier';

export type ContractType = 'CDI' | 'CDD' | 'Apprentissage' | 'Extra';

export type SipTrunkProvider = 'ovhcloud_sip' | 'ovhcloud_mobile_07';

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
  monthlyGrossEur?: number;
  monthlySubscriptionsTarget?: number;
  monthlySubscriptionsActual?: number;
  probationMonths?: number;
  probationRenewed?: boolean;
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
  heitzEmployeeId?: number;
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

export interface ElectronicSignatureProof {
  proofId: string;
  documentId: string;
  employeeId: string;
  signerFullName: string;
  signerEmail: string;
  signerPhone: string;
  identityVerificationMethod: 'OTP_SMS_6_DIGITS + AUTH_SESSION_CFOS';
  otpCodeVerified: string;
  consentStatement: string;
  signedAtIso: string;
  documentSha256: string;
  proofSealSha256: string;
  userAgent: string;
  clubIpAddress: string;
  legalFramework: 'Code civil Art. 1366 & 1367 + Règlement UE eIDAS n°910/2014 (0 € / signature)';
}

export interface HRDocument {
  id: string;
  employeeId: string;
  title: string;
  category: 'Contrat' | 'Avenant' | 'Bulletin Silae' | 'Diplôme BPJEPS' | 'Carte Pro' | 'DPAE' | 'Attestation';
  uploadedAt: string;
  encryptedAtRest: boolean;
  signedStatus: 'Signé horodaté' | 'En attente signature' | 'Archivé coffre-fort';
  period?: string;
  contractBodyText?: string;
  signatureProof?: ElectronicSignatureProof;
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
  heitzPassageQrCode?: string;
  heitzBookingId?: number;
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
  ringoverTags?: string[];
  callNote?: string;
  voicemailDropped?: boolean;
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
  sourceChannel:
    | 'recrutement@c.fitness'
    | 'Site c.fitness'
    | 'Indeed'
    | 'WTTJ'
    | 'LinkedIn'
    | 'France Travail'
    | 'JobTeaser';
  stage: CandidateStage;
  cvPdfFileName?: string;
  rgpdAckSentAt?: string;
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
  rfidBluetoothEnabled?: boolean;
  mywellnessMemberId?: string;
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  homeClubId: ClubId;
  subscriptionName: string;
  activeSubscription: boolean;
  finBalanceEur: number;
  finBalanceState: 0 | 1;
  lastPassageAt?: string;
  technogymMoves30d: number;
  daysSinceLastWorkout: number;
  technogymCheckupWellnessAge?: number;
  technogymCheckupScore?: number;
  loyaltyPoints?: number;
  referralsCount?: number;
  lastRewardLabel?: string;
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
  readerType?: 'RFID_MIFARE_HEITZ' | 'BLUETOOTH_BLE_HEITZ' | 'QR_PASSAGE_CODE_HEITZ';
  idClientHeitz?: number;
  idCenterHeitz?: number;
}

export interface InBodyScan {
  id: string;
  personName: string;
  personType: 'Adhérent' | 'Prospect';
  clubId: ClubId;
  date: string;
  deviceModel:
    | 'Technogym Checkup (Mywellness)'
    | 'Technogym Checkup — Carré de Soie (Mywellness)'
    | 'Technogym Checkup — Beynost (Mywellness)';
  mywellnessSynced?: boolean;
  mywellnessDeepLink?: string;
  wellnessAgeYears?: number;
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

export type BackupDeviceType = 'pc_secours' | 'tablette_kiosque' | 'smartphone_pwa';

export type ServerPowerStatus = 'nominal' | 'coupure_courant_bascule_active';

export interface BackupReplicaNode {
  id: string;
  deviceName: string;
  deviceType: BackupDeviceType;
  clubId: ClubId | 'bi-club';
  ipOrHolder: string;
  storageEngine: string;
  lastSyncedAt: string;
  lastChecksum: string;
  snapshotSizeKb: number;
  status: 'synchronise' | 'relais_actif_secours' | 'en_attente';
  autoSyncEnabled: boolean;
  recordsMirrored: {
    members: number;
    employees: number;
    prospects: number;
    shifts: number;
    offlinePunches: number;
  };
}

export interface BackupSnapshotEnvelope {
  schemaVersion: 'cfos-replica-v1.2';
  exportedAt: string;
  originDevice: string;
  checksum: string;
  serverPowerStatus: ServerPowerStatus;
  counts: {
    members: number;
    employees: number;
    prospects: number;
    shifts: number;
    timeEntries: number;
    offlinePunches: number;
    accessEvents: number;
  };
  payload: Record<string, unknown>;
}

export interface HardwareCompatibilitySpec {
  id: string;
  domain:
    | 'TELEPHONIE_ARCEP_SIP_GSM'
    | 'PORTILLONS_HEITZ_WIEGAND'
    | 'TABLETTES_KIOSQUES_POE'
    | 'BIOMETRIE_INBODY_LB120'
    | 'PARC_MACHINES_CARDIO_MUSCU';
  title: string;
  manufacturerModels: string;
  physicalWiringAndProtocol: string;
  hallucinationAvoided: string;
  realWorldSolution: string;
  regulatoryCompliance: string;
  estimatedHardwareBudget: string;
}

export interface LegacySoftwareParityEntry {
  id: string;
  legacySoftwareName: string;
  cfosModuleSection: AdminSection;
  cfosModuleTitle: string;
  visualCloneDescription: string;
  collaboratorRoutinePreserved: string;
  featuresImplemented: string[];
  parityScorePct: 100;
}

export interface InBodyComputedSheet {
  inBodyScore: number;
  basalMetabolicRateKcal: number;
  weightBarPct: number;
  smmBarPct: number;
  pbfBarPct: number;
  smmStatus: 'Sous-optimal' | 'Normal' | 'Élevé (Athlétique)';
  pbfStatus: 'Sous-optimal' | 'Normal' | 'Élevé';
  segmentalLean: {
    rightArmKg: number;
    leftArmKg: number;
    trunkKg: number;
    rightLegKg: number;
    leftLegKg: number;
    balanceStatus: 'Équilibré';
  };
}

export type UnifiedEventSource =
  | 'cfitness_rh'
  | 'mywellness_api'
  | 'heitz_api'
  | 'interne_club';

export type UnifiedEventCategory =
  | 'Horaire RH'
  | 'Cours Mywellness'
  | 'Bilan Technogym Checkup'
  | 'RDV Heitz'
  | 'Événement Interne';

export interface UnifiedPlanningEvent {
  id: string;
  externalSourceId: string; // e.g. 'SH-101', 'MW-CRS-204', 'HZ-RDV-309', 'INT-401' (prevents duplication)
  originSystem: UnifiedEventSource;
  category: UnifiedEventCategory;
  title: string;
  subtitle: string;
  clubId: ClubId;
  employeeId: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  participantName?: string;
  mywellnessMemberId?: string;
  locationLabel: string;
  writableViaApi: boolean;
  lastSyncedAt: string;
  placesMax?: number;
  placesTaken?: number;
  bookingQueueCount?: number;
  attendanceRatePct?: number;
}

export interface CollaboratorTask {
  id: string;
  employeeId: string;
  clubId: ClubId;
  date: string;
  dueTime: string;
  title: string;
  category: 'Accueil & TPV' | 'Relance CRM (ex-LEADS)' | 'Suivi Mywellness' | 'RH & Administratif';
  priority: 'Haute' | 'Normale';
  completed: boolean;
  completedAt?: string;
  linkedSection?: AdminSection;
}

export interface CollaboratorNotification {
  id: string;
  employeeId: string;
  clubId: ClubId;
  createdAt: string;
  title: string;
  message: string;
  type: 'signature_requise' | 'rdv_heitz' | 'passage_club' | 'mywellness_checkup' | 'rh_planning';
  read: boolean;
  actionLabel?: string;
  targetSection?: AdminSection;
}

export interface HeitzKpiTicket {
  id: number;
  number: string;
  clubId: ClubId;
  idCenter: 5052 | 5053; // 5052 = Carré de Soie, 5053 = Beynost
  dateIso: string;
  idEmpSeller: number;
  sellerEmployeeId: string;
  sellerName: string;
  idClient: number;
  clientName: string;
  articleId: number;
  articleCategory: 2 | 8; // 2 = Abonnement ACCESS, 8 = Pass / Article TPV
  articleName: string;
  paymentMethodName: 'PRELEVEMENT SEPA' | 'CB TPV' | 'ESPECES' | 'ANCV' | 'ACTOBI';
  amountTtcEur: number;
  silaeCommissionEur: number;
  ticketState: 1;
}


