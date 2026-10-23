import type {
  AccessEvent,
  AdminSection,
  AuditEntry,
  BackupReplicaNode,
  BackupSnapshotEnvelope,
  CallLog,
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
  ServerPowerStatus,
  Shift,
  TimeEntry,
  TrainingModule,
} from '../types/cfos';

export function formatClubName(
  clubId: ClubId | 'bi-club' | 'all',
  short = false
): string {
  if (clubId === 'bi-club' || clubId === 'all') {
    return short ? 'BI-CLUB' : 'Bi-Club (CDS + Beynost)';
  }
  if (clubId === 'carre-de-soie') {
    return short ? 'CDS' : 'Carré de Soie';
  }
  return short ? 'BEY' : 'Beynost';
}

export const CFITNESS_LEGAL_IDENTITY = {
  raisonSociale: 'C.FITNESS',
  siegeSocial: '2 Rue Jacquard (Centre Commercial Carré de Soie), 69120 Vaulx-en-Velin',
  etablissementSecondaire: 'Centre Commercial Beynost – ZAC des Baterses, 01700 Beynost',
  siret: '818 651 317 00018',
  codeNaf: '9313Z (Centres de culture physique)',
  urssaf: 'URSSAF Rhône-Alpes — N° cotisant 827000002188207761',
  retraiteComplementaire: 'AGIRA Salariés (APICIL), 69300 Caluire-et-Cuire',
  prevoyance: 'REPAM, 69451 Lyon Cedex',
  conventionCollective: 'Convention Collective Nationale du Sport (IDCC 2511) — Catégorie Employé, Non-cadre, Groupe 1',
  tempsTravailHebdo: 35.0,
  heuresMensualisees: 151.67,
  salaireBrutMensuelEur: 1823.03,
  tauxHoraireBrutEur: 12.02,
  periodeEssaiInitialeMois: 2,
  periodeEssaiMaxMois: 4,
  objectifCommercialMensuelAbonnements: 20,
  emailRecrutementOfficiel: 'recrutement@c.fitness',
} as const;

export interface ProbationNoticeStatus {
  daysPresent: number;
  inProbation: boolean;
  employerNoticeDelayLabel: string;
  alertSeverity: 'normal' | 'warning' | 'urgent';
  explanation: string;
}

export function computeProbationNoticePeriod(
  hireDateIso: string,
  referenceDateIso = '2026-10-23',
  probationRenewed = false
): ProbationNoticeStatus {
  const startMs = Date.parse(hireDateIso);
  const refMs = Date.parse(referenceDateIso);
  const daysPresent = Math.max(0, Math.floor((refMs - startMs) / (1000 * 60 * 60 * 24)));
  const maxProbationDays = probationRenewed ? 120 : 60;
  const inProbation = daysPresent <= maxProbationDays;
  const daysRemaining = Math.max(0, maxProbationDays - daysPresent);

  let employerNoticeDelayLabel = '1 mois (au-delà de 3 mois de présence)';
  if (daysPresent < 8) {
    employerNoticeDelayLabel = '24 heures (< 8 jours de présence)';
  } else if (daysPresent <= 30) {
    employerNoticeDelayLabel = '48 heures (entre 8 jours et 1 mois)';
  } else if (daysPresent <= 90) {
    employerNoticeDelayLabel = '2 semaines (entre 1 et 3 mois)';
  }

  const alertSeverity: ProbationNoticeStatus['alertSeverity'] = !inProbation
    ? 'normal'
    : daysRemaining <= 15
    ? 'urgent'
    : daysRemaining <= 30
    ? 'warning'
    : 'normal';

  const explanation = inProbation
    ? `Période d’essai active (${daysPresent}j effectués, reste ${daysRemaining}j) · Délai de prévenance légal : ${employerNoticeDelayLabel}.`
    : `CDI confirmé hors période d’essai (${daysPresent} jours d’ancienneté).`;

  return {
    daysPresent,
    inProbation,
    employerNoticeDelayLabel,
    alertSeverity,
    explanation,
  };
}

export function generateOfficialCdiContractText(params: {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  jobTitle: string;
  clubId: ClubId;
  startDate: string;
  monthlyGrossEur?: number;
}): string {
  const gross = (params.monthlyGrossEur ?? CFITNESS_LEGAL_IDENTITY.salaireBrutMensuelEur).toLocaleString(
    'fr-FR',
    { minimumFractionDigits: 2, maximumFractionDigits: 2 }
  );
  const primaryClub =
    params.clubId === 'carre-de-soie'
      ? CFITNESS_LEGAL_IDENTITY.siegeSocial
      : CFITNESS_LEGAL_IDENTITY.etablissementSecondaire;

  return [
    `CONTRAT DE TRAVAIL À DURÉE INDÉTERMINÉE (CDI) — TEMPS COMPLET`,
    `====================================================================`,
    `ENTRE LES SOUSSIGNÉS :`,
    `La Société ${CFITNESS_LEGAL_IDENTITY.raisonSociale}`,
    `• Siège social : ${CFITNESS_LEGAL_IDENTITY.siegeSocial}`,
    `• Établissement secondaire : ${CFITNESS_LEGAL_IDENTITY.etablissementSecondaire}`,
    `• SIRET : ${CFITNESS_LEGAL_IDENTITY.siret} | Code NAF : ${CFITNESS_LEGAL_IDENTITY.codeNaf}`,
    `• ${CFITNESS_LEGAL_IDENTITY.urssaf}`,
    `• Retraite complémentaire : ${CFITNESS_LEGAL_IDENTITY.retraiteComplementaire}`,
    `• Prévoyance : ${CFITNESS_LEGAL_IDENTITY.prevoyance}`,
    `Représentée par Messieurs Mario CARVALHO et Daniel CARVALHO, Co-Dirigeants,`,
    ``,
    `ET LE SALARIÉ :`,
    `• Nom & Prénom : ${params.firstName} ${params.lastName}`,
    `• Coordonnées : ${params.phone} — ${params.email}`,
    ``,
    `ARTICLE 1 — ENGAGEMENT & CONVENTION COLLECTIVE`,
    `Le Salarié est engagé à compter du ${params.startDate} en qualité de « ${params.jobTitle} » sous le régime de la ${CFITNESS_LEGAL_IDENTITY.conventionCollective}.`,
    `Lieu d'affectation principal : ${primaryClub}, avec clause de mobilité inter-clubs entre Vaulx-en-Velin (Carré de Soie) et Beynost (ZAC des Baterses).`,
    ``,
    `ARTICLE 2 — PÉRIODE D'ESSAI & DÉLAIS DE PRÉVENANCE LÉGAUX`,
    `Le présent contrat comporte une période d'essai initiale de 2 mois, renouvelable une fois pour une durée maximale de 2 mois supplémentaires (soit 4 mois au total).`,
    `En cas de rupture pendant la période d'essai, les délais de prévenance légaux applicables sont :`,
    `• Moins de 8 jours de présence : 24 heures`,
    `• Entre 8 jours et 1 mois de présence : 48 heures`,
    `• Entre 1 mois et 3 mois de présence : 2 semaines`,
    `• Au-delà de 3 mois de présence : 1 mois`,
    ``,
    `ARTICLE 3 — DURÉE DU TRAVAIL & RÉMUNÉRATION`,
    `La durée hebdomadaire de travail est fixée à 35,00 heures par semaine, soit 151,67 heures mensualisées.`,
    `En contrepartie de ses fonctions, le Salarié percevra une rémunération mensuelle brute de ${gross} € pour 151,67 heures travaillées.`,
    ``,
    `ARTICLE 4 — OBJECTIF COMMERCIAL CONTRACTUEL & TRAÇABILITÉ CRM OPPOSABLE`,
    `• Objectif commercial contractuel : réalisation d'un minimum de ${CFITNESS_LEGAL_IDENTITY.objectifCommercialMensuelAbonnements} abonnements mensuels.`,
    `• CLAUSE ESSENTIELLE DE TRAÇABILITÉ CRM (OPPOSABLE) : Le Salarié a l'obligation stricte et systématique de tracer en temps réel dans le CRM C.Fitness OS l'intégralité de son activité commerciale (appels entrants/sortants, relances, rendez-vous pris, séances d'essai et souscriptions d'abonnements).`,
    `  TOUTE ACTION COMMERCIALE NON TRACÉE DANS LE CRM C.FITNESS OS EST JURIDIQUEMENT RÉPUTÉE NON RÉALISÉE.`,
    ``,
    `ARTICLE 5 — OBLIGATIONS PROFESSIONNELLES, TÉLÉPHONE PERSONNEL & VIDÉOSURVEILLANCE`,
    `• Interdiction du téléphone portable personnel : L'usage du téléphone portable personnel est strictement interdit pendant les heures de service. Toutes les communications professionnelles s'effectuent exclusivement via le softphone virtuel intégré à C.Fitness OS (numéros 04 et pool 07 de l'entreprise).`,
    `• Confidentialité absolue : Les bases de données prospects et adhérents constituent un actif stratégique exclusif de C.FITNESS. Toute extraction, copie ou divulgation est strictement interdite.`,
    `• Vidéosurveillance : Le Salarié est informé que les établissements de Vaulx-en-Velin (Carré de Soie) et de Beynost sont placés sous dispositif de vidéosurveillance déclaré pour la sécurité des biens et des personnes.`,
  ].join('\n');
}

export interface ParsedRecruitmentEmail {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  cvPdfFileName: string;
  clubId: ClubId;
  roleTarget: Role;
  rgpdAutoReplyText: string;
}

export function parseRecruitmentEmailPayload(rawInput: {
  senderLine: string;
  subjectLine: string;
  bodyText: string;
  attachmentPdf?: string;
}): ParsedRecruitmentEmail {
  const emailMatch =
    rawInput.senderLine.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/) ||
    rawInput.bodyText.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
  const email = emailMatch ? emailMatch[1].toLowerCase() : 'candidat@cfitness-web.fr';

  const phoneMatch = rawInput.bodyText.match(/(0[67](?:[\s.-]*\d{2}){4})/);
  const phone = phoneMatch
    ? phoneMatch[1].replace(/\D/g, '').replace(/(\d{2})(?=\d)/g, '$1 ').trim()
    : '06 44 55 66 77';

  // Extract name before <email> or from "Nom : ... Prénom : ..."
  let firstName = 'Camille';
  let lastName = 'Roche';
  const nameBeforeBracket = rawInput.senderLine.split('<')[0].trim();
  if (nameBeforeBracket && nameBeforeBracket.includes(' ')) {
    const parts = nameBeforeBracket.split(/\s+/);
    firstName = parts[0];
    lastName = parts.slice(1).join(' ');
  }

  const lowerAll = `${rawInput.subjectLine} ${rawInput.bodyText}`.toLowerCase();
  const clubId: ClubId = lowerAll.includes('beynost') ? 'beynost' : 'carre-de-soie';
  const roleTarget: Role =
    lowerAll.includes('bpjeps') || lowerAll.includes('apprenti')
      ? 'apprenti'
      : lowerAll.includes('coach')
      ? 'coach'
      : 'commercial';

  const cvPdfFileName =
    rawInput.attachmentPdf?.trim() ||
    `CV_${firstName}_${lastName.replace(/\s+/g, '_')}_2026.pdf`;

  const rgpdAutoReplyText = `Accusé de réception automatique envoyé depuis recrutement@c.fitness à ${email} : « Bonjour ${firstName}, C.FITNESS (Carré de Soie & Beynost) confirme la bonne réception de votre candidature et de votre CV (${cvPdfFileName}). Vos données sont traitées par Mario & Daniel Carvalho conformément au RGPD (conservation max. 24 mois). »`;

  return {
    firstName,
    lastName,
    phone,
    email,
    cvPdfFileName,
    clubId,
    roleTarget,
    rgpdAutoReplyText,
  };
}

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
      return role === 'admin' || role === 'manager' || role === 'commercial';
    case 'inbody_health_data':
      return role === 'admin' || role === 'manager' || role === 'coach' || role === 'apprenti';
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

export function isSectionAllowedForRole(section: AdminSection, role: Role): boolean {
  if (role === 'admin' || role === 'manager') return true;
  if (role === 'commercial') {
    return ['dashboard', 'telephony', 'crm', 'planning-hr', 'academy', 'devices'].includes(section);
  }
  if (role === 'coach' || role === 'apprenti') {
    return ['dashboard', 'planning-hr', 'academy', 'devices', 'telephony'].includes(section);
  }
  return true;
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

  const jobTitle =
    candidate.roleTarget === 'coach'
      ? 'Coach Fitness & Biocircuit'
      : candidate.roleTarget === 'apprenti'
      ? 'Apprenti Coach BPJEPS AF'
      : candidate.roleTarget === 'commercial'
      ? 'Conseiller Commercial Fitness'
      : 'Manager de Club';

  const newEmployee: Employee = {
    id: empId,
    firstName: candidate.firstName,
    lastName: candidate.lastName,
    email: candidate.email,
    phone: candidate.phone,
    role: candidate.roleTarget,
    clubId: candidate.clubId,
    contractType: 'CDI',
    jobTitle,
    hourlyRate: CFITNESS_LEGAL_IDENTITY.tauxHoraireBrutEur,
    weeklyContractHours: CFITNESS_LEGAL_IDENTITY.tempsTravailHebdo,
    monthlyGrossEur: CFITNESS_LEGAL_IDENTITY.salaireBrutMensuelEur,
    monthlySubscriptionsTarget:
      candidate.roleTarget === 'commercial'
        ? CFITNESS_LEGAL_IDENTITY.objectifCommercialMensuelAbonnements
        : undefined,
    monthlySubscriptionsActual: 0,
    probationMonths: CFITNESS_LEGAL_IDENTITY.periodeEssaiInitialeMois,
    probationRenewed: false,
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

  const contractBodyText = generateOfficialCdiContractText({
    firstName: candidate.firstName,
    lastName: candidate.lastName,
    email: candidate.email,
    phone: candidate.phone,
    jobTitle,
    clubId: candidate.clubId,
    startDate: firstShiftDate,
    monthlyGrossEur: CFITNESS_LEGAL_IDENTITY.salaireBrutMensuelEur,
  });

  const newDocuments: HRDocument[] = [
    {
      id: `doc-contrat-${Date.now()}`,
      employeeId: empId,
      title: `Contrat CDI Officiel C.FITNESS (IDCC 2511 Gr. 1 — 1 823,03 € brut) — ${candidate.firstName} ${candidate.lastName}`,
      category: 'Contrat',
      uploadedAt: nowIso.slice(0, 10),
      encryptedAtRest: true,
      signedStatus: 'En attente signature',
      contractBodyText,
    },
    {
      id: `doc-dpae-${Date.now() + 1}`,
      employeeId: empId,
      title: `DPAE URSSAF Rhône-Alpes (Cotisant ${CFITNESS_LEGAL_IDENTITY.siret}) — ${candidate.firstName} ${candidate.lastName}`,
      category: 'DPAE',
      uploadedAt: nowIso.slice(0, 10),
      encryptedAtRest: true,
      signedStatus: 'Archivé coffre-fort',
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
    action: 'ONBOARDING_1_CLIC_CONTRAT_CDI_CFITNESS',
    target: `${candidate.firstName} ${candidate.lastName} (${empId})`,
    beforeState: `Candidat ATS (${candidate.stage})`,
    afterState: `Contrat CDI C.FITNESS généré (1 823,03 € brut · 151,67h · Clause CRM opposable) · PIN ${pinCode}`,
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

export const INITIAL_BACKUP_REPLICAS: BackupReplicaNode[] = [
  {
    id: 'replica-pc-beynost',
    deviceName: 'PC Accueil & Secours Beynost (Windows 11 Pro / Batterie Onduleur)',
    deviceType: 'pc_secours',
    clubId: 'beynost',
    ipOrHolder: '10.20.0.15 (LAN Beynost via WireGuard)',
    storageEngine: 'IndexedDB + Disque SSD Local + Miroir SQLite/JSON',
    lastSyncedAt: '2026-10-23T11:30:00Z',
    lastChecksum: 'CFOS-SHA-9F4A2C81',
    snapshotSizeKb: 184,
    status: 'synchronise',
    autoSyncEnabled: true,
    recordsMirrored: {
      members: 6,
      employees: 7,
      prospects: 5,
      shifts: 9,
      offlinePunches: 0,
    },
  },
  {
    id: 'replica-pc-cds',
    deviceName: 'PC Portable Direction Carré de Soie (Autonomie Batterie 8h)',
    deviceType: 'pc_secours',
    clubId: 'carre-de-soie',
    ipOrHolder: '10.10.0.12 (LAN Carré de Soie / 4G Secours)',
    storageEngine: 'IndexedDB + Cache PWA + Export Auto .cfos-backup.json',
    lastSyncedAt: '2026-10-23T11:30:00Z',
    lastChecksum: 'CFOS-SHA-9F4A2C81',
    snapshotSizeKb: 184,
    status: 'synchronise',
    autoSyncEnabled: true,
    recordsMirrored: {
      members: 6,
      employees: 7,
      prospects: 5,
      shifts: 9,
      offlinePunches: 0,
    },
  },
  {
    id: 'replica-tablette-cds',
    deviceName: 'Tablette Kiosque Accueil Carré de Soie (Batterie interne 10h)',
    deviceType: 'tablette_kiosque',
    clubId: 'carre-de-soie',
    ipOrHolder: '10.10.0.31 · Borne Murale Entrée CDS',
    storageEngine: 'PWA Service Worker + IndexedDB (Badgeuse PIN & Cache Tourniquets)',
    lastSyncedAt: '2026-10-23T11:30:00Z',
    lastChecksum: 'CFOS-SHA-9F4A2C81',
    snapshotSizeKb: 184,
    status: 'synchronise',
    autoSyncEnabled: true,
    recordsMirrored: {
      members: 6,
      employees: 7,
      prospects: 5,
      shifts: 9,
      offlinePunches: 0,
    },
  },
  {
    id: 'replica-tablette-bey',
    deviceName: 'Tablette Kiosque Accueil Beynost (Batterie interne 10h)',
    deviceType: 'tablette_kiosque',
    clubId: 'beynost',
    ipOrHolder: '10.20.0.31 · Borne Murale Entrée Beynost',
    storageEngine: 'PWA Service Worker + IndexedDB (Badgeuse PIN & Cache Tourniquets)',
    lastSyncedAt: '2026-10-23T11:30:00Z',
    lastChecksum: 'CFOS-SHA-9F4A2C81',
    snapshotSizeKb: 184,
    status: 'synchronise',
    autoSyncEnabled: true,
    recordsMirrored: {
      members: 6,
      employees: 7,
      prospects: 5,
      shifts: 9,
      offlinePunches: 0,
    },
  },
  {
    id: 'replica-tel-mario',
    deviceName: 'Smartphone Mario Carvalho (iPhone 16 Pro — PWA 5G Secours)',
    deviceType: 'smartphone_pwa',
    clubId: 'bi-club',
    ipOrHolder: 'Co-Dirigeant · Réseau 5G / Wi-Fi Bi-Club',
    storageEngine: 'Stockage Chiffré Local iOS PWA + Partage AirDrop/Fichiers',
    lastSyncedAt: '2026-10-23T11:30:00Z',
    lastChecksum: 'CFOS-SHA-9F4A2C81',
    snapshotSizeKb: 184,
    status: 'synchronise',
    autoSyncEnabled: true,
    recordsMirrored: {
      members: 6,
      employees: 7,
      prospects: 5,
      shifts: 9,
      offlinePunches: 0,
    },
  },
  {
    id: 'replica-tel-daniel',
    deviceName: 'Smartphone Daniel Carvalho (PWA Direction 5G Secours)',
    deviceType: 'smartphone_pwa',
    clubId: 'bi-club',
    ipOrHolder: 'Co-Dirigeant · Réseau 5G / Wi-Fi Bi-Club',
    storageEngine: 'Stockage Chiffré Local Mobile PWA + Snapshot JSON',
    lastSyncedAt: '2026-10-23T11:30:00Z',
    lastChecksum: 'CFOS-SHA-9F4A2C81',
    snapshotSizeKb: 184,
    status: 'synchronise',
    autoSyncEnabled: true,
    recordsMirrored: {
      members: 6,
      employees: 7,
      prospects: 5,
      shifts: 9,
      offlinePunches: 0,
    },
  },
];

export function computeSnapshotChecksum(rawPayload: string): string {
  let h1 = 0x811c9dc5;
  let h2 = 0x01000193;
  for (let i = 0; i < rawPayload.length; i++) {
    const ch = rawPayload.charCodeAt(i);
    h1 ^= ch;
    h1 = Math.imul(h1, 0x01000193);
    h2 ^= ch + (i & 0xff);
    h2 = Math.imul(h2, 0x85ebca6b);
  }
  const hex1 = (h1 >>> 0).toString(16).toUpperCase().padStart(8, '0');
  const hex2 = (h2 >>> 0).toString(16).toUpperCase().padStart(4, '0').slice(0, 4);
  return `CFOS-SHA-${hex1}${hex2}`;
}

export interface BackupableStateSlice {
  heitzMembers: HeitzMember[];
  employees: Employee[];
  prospects: Prospect[];
  shifts: Shift[];
  timeEntries: TimeEntry[];
  offlinePointageQueue: TimeEntry[];
  accessEvents: AccessEvent[];
  callLogs: CallLog[];
  auditLogs: AuditEntry[];
}

export function buildBackupEnvelope(
  stateSlice: BackupableStateSlice & Record<string, unknown>,
  originDevice: string,
  serverPowerStatus: ServerPowerStatus,
  nowIso = new Date().toISOString()
): BackupSnapshotEnvelope {
  const serializedCore = JSON.stringify({
    heitzMembers: stateSlice.heitzMembers,
    employees: stateSlice.employees,
    prospects: stateSlice.prospects,
    shifts: stateSlice.shifts,
    timeEntries: stateSlice.timeEntries,
    offlinePointageQueue: stateSlice.offlinePointageQueue,
    accessEvents: stateSlice.accessEvents,
  });

  const checksum = computeSnapshotChecksum(serializedCore);

  return {
    schemaVersion: 'cfos-replica-v1.2',
    exportedAt: nowIso,
    originDevice,
    checksum,
    serverPowerStatus,
    counts: {
      members: stateSlice.heitzMembers.length,
      employees: stateSlice.employees.length,
      prospects: stateSlice.prospects.length,
      shifts: stateSlice.shifts.length,
      timeEntries: stateSlice.timeEntries.length,
      offlinePunches: stateSlice.offlinePointageQueue.length,
      accessEvents: stateSlice.accessEvents.length,
    },
    payload: stateSlice,
  };
}

function mergeById<T extends { id: string }>(primary: T[], replica: T[] = []): { merged: T[]; addedCount: number } {
  const existingIds = new Set(primary.map((item) => item.id));
  const newlyAdded: T[] = [];
  for (const item of replica) {
    if (item && typeof item.id === 'string' && !existingIds.has(item.id)) {
      newlyAdded.push(item);
      existingIds.add(item.id);
    }
  }
  return {
    merged: [...newlyAdded, ...primary],
    addedCount: newlyAdded.length,
  };
}

export function mergeFailoverSnapshot<T extends BackupableStateSlice>(
  primaryState: T,
  replicaState: Partial<BackupableStateSlice>
): {
  mergedState: T;
  stats: {
    addedPunches: number;
    addedAccessEvents: number;
    addedProspects: number;
    addedCalls: number;
    regularisedMembers: number;
  };
} {
  // Combine both committed timeEntries and offlinePointageQueue from the replica into timeEntries
  const replicaAllPunches = [
    ...(replicaState.offlinePointageQueue ?? []).map((p) => ({
      ...p,
      syncedFromOffline: true,
    })),
    ...(replicaState.timeEntries ?? []),
  ];

  const punchesMerge = mergeById(primaryState.timeEntries, replicaAllPunches);
  const accessMerge = mergeById(primaryState.accessEvents, replicaState.accessEvents);
  const prospectsMerge = mergeById(primaryState.prospects, replicaState.prospects);
  const callsMerge = mergeById(primaryState.callLogs, replicaState.callLogs);
  const shiftsMerge = mergeById(primaryState.shifts, replicaState.shifts);
  const auditsMerge = mergeById(primaryState.auditLogs, replicaState.auditLogs);

  // If any member had their SEPA debt regularized on the backup PC/tablet/phone during the power outage, preserve that regularization
  let regularisedMembers = 0;
  const replicaMembersMap = new Map(
    (replicaState.heitzMembers ?? []).map((m) => [m.id, m])
  );
  const mergedMembers = primaryState.heitzMembers.map((m) => {
    const rep = replicaMembersMap.get(m.id);
    if (rep && m.finBalanceEur < 0 && rep.finBalanceEur >= 0) {
      regularisedMembers += 1;
      return { ...m, finBalanceEur: rep.finBalanceEur, finBalanceState: rep.finBalanceState };
    }
    return m;
  });

  return {
    mergedState: {
      ...primaryState,
      timeEntries: punchesMerge.merged,
      offlinePointageQueue: [],
      accessEvents: accessMerge.merged,
      prospects: prospectsMerge.merged,
      callLogs: callsMerge.merged,
      shifts: shiftsMerge.merged,
      auditLogs: auditsMerge.merged,
      heitzMembers: mergedMembers,
    },
    stats: {
      addedPunches: punchesMerge.addedCount,
      addedAccessEvents: accessMerge.addedCount,
      addedProspects: prospectsMerge.addedCount,
      addedCalls: callsMerge.addedCount,
      regularisedMembers,
    },
  };
}

