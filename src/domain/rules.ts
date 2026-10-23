import type {
  AccessEvent,
  AuditEntry,
  Candidate,
  Club,
  ClubId,
  Employee,
  HRDocument,
  HeitzMember,
  LeaveRequest,
  ModuleProgress,
  PointageType,
  Prospect,
  Role,
  Shift,
  TrainingModule,
} from '../types/cfos';

export function formatPointageType(type: PointageType): string {
  switch (type) {
    case 'arrivee':
      return 'Arrivée';
    case 'debut_pause':
      return 'Début de pause';
    case 'fin_pause':
      return 'Fin de pause';
    case 'depart':
      return 'Départ';
  }
}

export function formatLeaveStatus(status: LeaveRequest['status']): string {
  switch (status) {
    case 'en_attente':
      return 'En attente de validation';
    case 'valide':
      return 'Validé';
    case 'refuse':
      return 'Refusé';
  }
}

export interface ShiftComplianceViolation {
  code:
    | 'DAILY_REST_UNDER_11H'
    | 'DAILY_WORK_OVER_10H'
    | 'AMPLITUDE_OVER_13H'
    | 'MISSING_MANDATORY_BREAK'
    | 'SHIFT_OVERLAP';
  severity: 'error' | 'warning';
  message: string;
  shiftId: string;
  employeeId: string;
}

export function parseDateTimeMinutes(dateStr: string, timeStr: string): number {
  const [year, month, day] = dateStr.split('-').map(Number);
  const [hour, minute] = timeStr.split(':').map(Number);
  const utcMs = Date.UTC(year, month - 1, day, hour, minute, 0);
  return Math.floor(utcMs / 60000);
}

export function getShiftSpanMinutes(shift: Pick<Shift, 'date' | 'startTime' | 'endTime'>): {
  startMin: number;
  endMin: number;
  amplitudeMin: number;
} {
  const startMin = parseDateTimeMinutes(shift.date, shift.startTime);
  let endMin = parseDateTimeMinutes(shift.date, shift.endTime);
  if (endMin <= startMin) {
    endMin += 24 * 60;
  }
  return {
    startMin,
    endMin,
    amplitudeMin: endMin - startMin,
  };
}

export function getEffectiveWorkedMinutes(
  shift: Pick<Shift, 'date' | 'startTime' | 'endTime' | 'breakMinutes'>
): number {
  const { amplitudeMin } = getShiftSpanMinutes(shift);
  return Math.max(0, amplitudeMin - Math.max(0, shift.breakMinutes));
}

export function evaluateShiftCompliance(shifts: Shift[]): ShiftComplianceViolation[] {
  const violations: ShiftComplianceViolation[] = [];
  const byEmployee = new Map<string, Shift[]>();

  for (const s of shifts) {
    const list = byEmployee.get(s.employeeId) ?? [];
    list.push(s);
    byEmployee.set(s.employeeId, list);
  }

  for (const [employeeId, empShifts] of byEmployee.entries()) {
    const sorted = [...empShifts].sort(
      (a, b) => getShiftSpanMinutes(a).startMin - getShiftSpanMinutes(b).startMin
    );

    for (let i = 0; i < sorted.length; i++) {
      const current = sorted[i];
      const { startMin, amplitudeMin } = getShiftSpanMinutes(current);
      const workedMin = Math.max(0, amplitudeMin - current.breakMinutes);

      if (workedMin > 600) {
        violations.push({
          code: 'DAILY_WORK_OVER_10H',
          severity: 'error',
          shiftId: current.id,
          employeeId,
          message: `Durée effective de ${(workedMin / 60).toFixed(1)}h > maximum légal 10h (IDCC 2511).`,
        });
      }

      if (amplitudeMin > 780) {
        violations.push({
          code: 'AMPLITUDE_OVER_13H',
          severity: 'error',
          shiftId: current.id,
          employeeId,
          message: `Amplitude journalière de ${(amplitudeMin / 60).toFixed(1)}h > plafond 13h (IDCC 2511).`,
        });
      }

      if (workedMin >= 360 && current.breakMinutes < 20) {
        violations.push({
          code: 'MISSING_MANDATORY_BREAK',
          severity: 'warning',
          shiftId: current.id,
          employeeId,
          message: `Pause de ${current.breakMinutes} min insuffisante : minimum 20 min requis dès 6h travaillées.`,
        });
      }

      if (i > 0) {
        const prev = sorted[i - 1];
        const prevSpan = getShiftSpanMinutes(prev);
        const restMinutes = startMin - prevSpan.endMin;

        if (restMinutes < 0) {
          violations.push({
            code: 'SHIFT_OVERLAP',
            severity: 'error',
            shiftId: current.id,
            employeeId,
            message: `Chevauchement horaire avec le shift précédent du ${prev.date} (${prev.startTime}–${prev.endTime}).`,
          });
        } else if (restMinutes < 660) {
          const restHours = (restMinutes / 60).toFixed(1);
          violations.push({
            code: 'DAILY_REST_UNDER_11H',
            severity: 'error',
            shiftId: current.id,
            employeeId,
            message: `Repos quotidien de ${restHours}h < 11h obligatoires (IDCC 2511) après le shift finissant à ${prev.endTime}.`,
          });
        }
      }
    }
  }

  return violations;
}

export interface PayrollSummaryRow {
  employeeId: string;
  matricule: string;
  fullName: string;
  clubId: ClubId;
  contractHours: number;
  normalHours: number;
  overtime25Hours: number;
  sundayHours: number;
  nightHours: number;
  grossVariableEstimateEur: number;
}

export function computePayrollVariables(
  employees: Employee[],
  shifts: Shift[]
): PayrollSummaryRow[] {
  return employees
    .filter((e) => e.role !== 'kiosque')
    .map((emp, idx) => {
      const empShifts = shifts.filter((s) => s.employeeId === emp.id);
      let totalMinutes = 0;
      let sundayMinutes = 0;
      let nightMinutes = 0;

      for (const s of empShifts) {
        const worked = getEffectiveWorkedMinutes(s);
        totalMinutes += worked;

        const [y, m, d] = s.date.split('-').map(Number);
        const dayOfWeek = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
        if (dayOfWeek === 0) {
          sundayMinutes += worked;
        }

        const [endH, endM] = s.endTime.split(':').map(Number);
        const endTotal = endH * 60 + endM;
        if (endTotal > 22 * 60) {
          nightMinutes += Math.min(worked, endTotal - 22 * 60);
        }
      }

      const totalHours = Number((totalMinutes / 60).toFixed(2));
      const normalHours = Number(Math.min(totalHours, emp.weeklyContractHours).toFixed(2));
      const overtime25Hours = Number(Math.max(0, totalHours - emp.weeklyContractHours).toFixed(2));
      const sundayHours = Number((sundayMinutes / 60).toFixed(2));
      const nightHours = Number((nightMinutes / 60).toFixed(2));

      const grossVariableEstimateEur = Number(
        (
          overtime25Hours * emp.hourlyRate * 1.25 +
          sundayHours * emp.hourlyRate * 0.5 +
          nightHours * emp.hourlyRate * 0.25
        ).toFixed(2)
      );

      return {
        employeeId: emp.id,
        matricule: `CF-${String(idx + 101).padStart(4, '0')}`,
        fullName: `${emp.firstName} ${emp.lastName}`,
        clubId: emp.clubId,
        contractHours: emp.weeklyContractHours,
        normalHours,
        overtime25Hours,
        sundayHours,
        nightHours,
        grossVariableEstimateEur,
      };
    });
}

export function generateSilaeCsv(rows: PayrollSummaryRow[], periodLabel: string): string {
  const header =
    'MATRICULE;COLLABORATEUR;ETABLISSEMENT;PERIODE;HEURES_NORMALES;HS_25;HEURES_DIMANCHE;HEURES_NUIT;VARIABLES_BRUT_EUR';
  const lines = rows.map((r) => {
    const clubCode = r.clubId === 'carre-de-soie' ? 'CDS_VAULX' : 'BEYNOST_ZAC';
    return [
      r.matricule,
      r.fullName,
      clubCode,
      periodLabel,
      r.normalHours.toFixed(2),
      r.overtime25Hours.toFixed(2),
      r.sundayHours.toFixed(2),
      r.nightHours.toFixed(2),
      r.grossVariableEstimateEur.toFixed(2),
    ].join(';');
  });
  return [header, ...lines].join('\n');
}

export function selectOutboundNumber(
  club: Pick<Club, 'landline' | 'mobilePool'>,
  lineMode: '04' | '07',
  lastOutbound07Used?: string,
  retryCount = 0
): string {
  if (lineMode === '04' || club.mobilePool.length === 0) {
    return club.landline;
  }
  if (club.mobilePool.length === 1) {
    return club.mobilePool[0];
  }
  if (lastOutbound07Used) {
    const lastIdx = club.mobilePool.indexOf(lastOutbound07Used);
    if (lastIdx !== -1) {
      return club.mobilePool[(lastIdx + 1) % club.mobilePool.length];
    }
  }
  return club.mobilePool[retryCount % club.mobilePool.length];
}

export interface PinAuthOutcome {
  authenticated: boolean;
  locked: boolean;
  remainingAttempts: number;
  updatedEmployee: Employee;
  reason: string;
}

export function verifyEmployeePin(employee: Employee, inputPin: string): PinAuthOutcome {
  if (employee.pinLocked || employee.failedPinAttempts >= 5) {
    return {
      authenticated: false,
      locked: true,
      remainingAttempts: 0,
      updatedEmployee: { ...employee, pinLocked: true },
      reason: 'Compte PIN verrouillé après 5 tentatives infructueuses. Déblocage Manager requis.',
    };
  }

  if (employee.pinCode === inputPin.trim()) {
    return {
      authenticated: true,
      locked: false,
      remainingAttempts: 5,
      updatedEmployee: {
        ...employee,
        failedPinAttempts: 0,
        pinLocked: false,
      },
      reason: 'Authentification PIN réussie.',
    };
  }

  const nextFailed = employee.failedPinAttempts + 1;
  const nowLocked = nextFailed >= 5;

  return {
    authenticated: false,
    locked: nowLocked,
    remainingAttempts: Math.max(0, 5 - nextFailed),
    updatedEmployee: {
      ...employee,
      failedPinAttempts: nextFailed,
      pinLocked: nowLocked,
    },
    reason: nowLocked
      ? 'Code PIN erroné (5/5) — Badgeuse verrouillée par sécurité pour ce collaborateur.'
      : `Code PIN incorrect. ${5 - nextFailed} essai(s) restant(s).`,
  };
}

export type RbacFeature =
  | 'finances_payroll'
  | 'planning_edit'
  | 'timeclock_pin'
  | 'calls_leads'
  | 'call_whisper_listen'
  | 'ats_write'
  | 'ats_read'
  | 'academy_author'
  | 'academy_follow'
  | 'inbody_health_data'
  | 'governance_sign';

export function canAccessFeature(role: Role, feature: RbacFeature): boolean {
  switch (feature) {
    case 'finances_payroll':
    case 'governance_sign':
    case 'ats_write':
      return role === 'admin';
    case 'call_whisper_listen':
    case 'academy_author':
    case 'planning_edit':
    case 'ats_read':
      return role === 'admin' || role === 'manager';
    case 'calls_leads':
    case 'inbody_health_data':
      return role === 'admin' || role === 'manager' || role === 'commercial';
    case 'academy_follow':
      return (
        role === 'admin' ||
        role === 'manager' ||
        role === 'commercial' ||
        role === 'coach' ||
        role === 'apprenti'
      );
    case 'timeclock_pin':
      return true;
    default:
      return false;
  }
}

export function normalizePhone(raw: string): string {
  return raw.replace(/\D/g, '');
}

export function findDuplicateProspect(
  existing: Prospect[],
  phone: string,
  email: string
): Prospect | undefined {
  const normPhone = normalizePhone(phone);
  const normEmail = email.trim().toLowerCase();
  return existing.find(
    (p) =>
      (normPhone.length >= 8 && normalizePhone(p.phone) === normPhone) ||
      (normEmail.length > 3 && p.email.trim().toLowerCase() === normEmail)
  );
}

export function canSendProspectSms(prospect: Pick<Prospect, 'rgpdConsent' | 'smsStopOptOut'>): {
  allowed: boolean;
  reason?: string;
} {
  if (prospect.smsStopOptOut) {
    return { allowed: false, reason: 'Opposition STOP SMS enregistrée — envoi bloqué.' };
  }
  if (!prospect.rgpdConsent) {
    return { allowed: false, reason: 'Consentement RGPD manquant — envoi SMS refusé.' };
  }
  return { allowed: true };
}

export function canCallProspectProspection(prospect: Pick<Prospect, 'bloctelListed' | 'stage'>): {
  allowed: boolean;
  reason?: string;
} {
  if (prospect.bloctelListed && prospect.stage === 'Nouveau') {
    return {
      allowed: false,
      reason: 'Numéro inscrit sur liste Bloctel — démarchage téléphonique sortant bloqué.',
    };
  }
  return { allowed: true };
}

export function evaluateGatePassage(
  member: HeitzMember,
  club: Pick<Club, 'id' | 'degradedMode' | 'fireAlarmOpen'>,
  nowIso: string
): AccessEvent {
  const qrToken = `HZ-PASS-${member.id.toUpperCase()}-${nowIso.slice(11, 19).replace(/:/g, '')}`;

  if (club.fireAlarmOpen) {
    return {
      id: `acc-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      clubId: club.id,
      memberId: member.id,
      memberName: `${member.firstName} ${member.lastName}`,
      homeClubId: member.homeClubId,
      timestamp: nowIso,
      latencyMs: 8,
      granted: true,
      reason: 'Sécurité incendie active — ouverture libre prioritaire.',
      smsRelanceSent: false,
      qrTokenGenerated: qrToken,
    };
  }

  if (!member.activeSubscription) {
    return {
      id: `acc-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      clubId: club.id,
      memberId: member.id,
      memberName: `${member.firstName} ${member.lastName}`,
      homeClubId: member.homeClubId,
      timestamp: nowIso,
      latencyMs: 29,
      granted: false,
      reason: 'Abonnement expiré ou résilié dans Heitz.',
      smsRelanceSent: false,
      qrTokenGenerated: qrToken,
    };
  }

  if (member.finBalanceState === 0 || member.finBalanceEur < 0) {
    return {
      id: `acc-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      clubId: club.id,
      memberId: member.id,
      memberName: `${member.firstName} ${member.lastName}`,
      homeClubId: member.homeClubId,
      timestamp: nowIso,
      latencyMs: 34,
      granted: false,
      reason: `Bouclier SEPA (finBalance ${member.finBalanceEur.toFixed(2)} €) — portillon bloqué + alerte accueil.`,
      smsRelanceSent: true,
      qrTokenGenerated: qrToken,
    };
  }

  const interClubNote =
    member.homeClubId !== club.id
      ? 'Circulation bi-clubs fluide autorisée (sans surcoût — D9)'
      : club.degradedMode
      ? 'Validé via cache local autonome Heitz (mode dégradé VPN)'
      : 'Accès nominal autorisé via Heitz-WS (< 50 ms)';

  return {
    id: `acc-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    clubId: club.id,
    memberId: member.id,
    memberName: `${member.firstName} ${member.lastName}`,
    homeClubId: member.homeClubId,
    timestamp: nowIso,
    latencyMs: club.degradedMode ? 14 : 26,
    granted: true,
    reason: interClubNote,
    smsRelanceSent: false,
    qrTokenGenerated: qrToken,
  };
}

export interface OnboardingTransactionInput {
  candidate: Candidate;
  existingEmployees: Employee[];
  trainingModules: TrainingModule[];
  firstShiftDate: string;
  firstShiftStart: string;
  firstShiftEnd: string;
  hourlyRate: number;
  weeklyHours: number;
  actorName: string;
  actorRole: Role;
  nowIso: string;
  simulateMidWayFailure?: boolean;
}

export interface OnboardingTransactionResult {
  ok: boolean;
  error?: string;
  newEmployee?: Employee;
  newShift?: Shift;
  newDocuments?: HRDocument[];
  newModuleProgress?: ModuleProgress[];
  updatedCandidate?: Candidate;
  auditEntry?: AuditEntry;
}

export function generateUniquePin(existingPins: string[]): string {
  const candidates = ['4829', '7316', '5942', '8164', '3725', '6491', '2583', '9147'];
  for (const pin of candidates) {
    if (!existingPins.includes(pin)) {
      return pin;
    }
  }
  let n = 1357;
  while (existingPins.includes(String(n).padStart(4, '0'))) {
    n += 7;
  }
  return String(n % 10000).padStart(4, '0');
}

export function executeTransactionalOnboarding(
  input: OnboardingTransactionInput
): OnboardingTransactionResult {
  const {
    candidate,
    existingEmployees,
    trainingModules,
    firstShiftDate,
    firstShiftStart,
    firstShiftEnd,
    hourlyRate,
    weeklyHours,
    actorName,
    actorRole,
    nowIso,
    simulateMidWayFailure,
  } = input;

  if (!canAccessFeature(actorRole, 'ats_write')) {
    return {
      ok: false,
      error: 'Accès refusé (RBAC) : seul un Dirigeant / Admin peut déclencher un onboarding.',
    };
  }

  if (candidate.onboardedEmployeeId) {
    return {
      ok: false,
      error: 'Ce candidat a déjà fait l’objet d’un onboarding collaborateur.',
    };
  }

  if (!firstShiftDate || !firstShiftStart || !firstShiftEnd || hourlyRate <= 0 || weeklyHours <= 0) {
    return {
      ok: false,
      error: 'Paramètres contractuels ou horaire du 1er shift invalides — transaction annulée.',
    };
  }

  if (simulateMidWayFailure) {
    return {
      ok: false,
      error: 'Échec simulé à mi-parcours (test Phase 6) : rollback transactionnel exécuté, aucune donnée partielle créée.',
    };
  }

  const usedPins = existingEmployees.map((e) => e.pinCode);
  const pinCode = generateUniquePin(usedPins);
  const empId = `emp-${Date.now()}`;

  const newEmployee: Employee = {
    id: empId,
    firstName: candidate.firstName,
    lastName: candidate.lastName,
    email: candidate.email,
    phone: candidate.phone,
    role: candidate.roleTarget,
    clubId: candidate.clubId,
    contractType: candidate.contractTarget,
    jobTitle:
      candidate.roleTarget === 'coach'
        ? 'Coach Fitness & Biocircuit'
        : candidate.roleTarget === 'apprenti'
        ? 'Apprenti Coach BPJEPS AF'
        : candidate.roleTarget === 'commercial'
        ? 'Conseiller Commercial Fitness'
        : 'Manager de Club',
    hourlyRate,
    weeklyContractHours: weeklyHours,
    pinCode,
    failedPinAttempts: 0,
    pinLocked: false,
    totpEnabled: candidate.roleTarget === 'admin',
    cpBalance: 0,
    rttBalance: 0,
    hireDate: firstShiftDate,
    medicalVisitDue: firstShiftDate,
    tutorName: candidate.roleTarget === 'apprenti' ? 'Mario Carvalho' : undefined,
  };

  const newShift: Shift = {
    id: `sh-onb-${Date.now()}`,
    employeeId: empId,
    clubId: candidate.clubId,
    date: firstShiftDate,
    startTime: firstShiftStart,
    endTime: firstShiftEnd,
    breakMinutes: 30,
    roleLabel: 'Intégration & Accueil Club (J1)',
    published: true,
  };

  const newDocuments: HRDocument[] = [
    {
      id: `doc-dpae-${Date.now()}`,
      employeeId: empId,
      title: `Pré-remplissage DPAE URSSAF & Fiche Silae — ${candidate.firstName} ${candidate.lastName}`,
      category: 'DPAE',
      uploadedAt: nowIso.slice(0, 10),
      encryptedAtRest: true,
      signedStatus: 'Archivé coffre-fort',
    },
    {
      id: `doc-contrat-${Date.now() + 1}`,
      employeeId: empId,
      title: `Contrat ${candidate.contractTarget} IDCC 2511 — ${candidate.firstName} ${candidate.lastName}`,
      category: 'Contrat',
      uploadedAt: nowIso.slice(0, 10),
      encryptedAtRest: true,
      signedStatus: 'En attente signature',
    },
  ];

  const newModuleProgress: ModuleProgress[] = trainingModules
    .filter((m) => m.mandatoryFor.includes(candidate.roleTarget))
    .map((m) => ({
      employeeId: empId,
      moduleId: m.id,
      completed: false,
      scorePct: 0,
    }));

  const updatedCandidate: Candidate = {
    ...candidate,
    stage: 'Retenu',
    onboardedEmployeeId: empId,
  };

  const auditEntry: AuditEntry = {
    id: `aud-${Date.now()}`,
    timestamp: nowIso,
    actorName,
    actorRole,
    clubId: candidate.clubId,
    action: 'ONBOARDING_1_CLIC_TRANSACTIONNEL',
    target: `${candidate.firstName} ${candidate.lastName} (${empId})`,
    beforeState: `Candidat ATS (${candidate.stage})`,
    afterState: `Salarié créé · PIN ${pinCode} · 1er shift ${firstShiftDate} · DPAE + Académie initialisés`,
  };

  return {
    ok: true,
    newEmployee,
    newShift,
    newDocuments,
    newModuleProgress,
    updatedCandidate,
    auditEntry,
  };
}
