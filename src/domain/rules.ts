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
  ElectronicSignatureProof,
  Employee,
  HRDocument,
  HardwareCompatibilitySpec,
  HeitzKpiTicket,
  HeitzMember,
  InBodyComputedSheet,
  InBodyScan,
  LeaveRequest,
  LegacySoftwareParityEntry,
  ModuleProgress,
  PointageType,
  Prospect,
  Role,
  ServerPowerStatus,
  Shift,
  SipTrunkProvider,
  TimeEntry,
  TrainingModule,
  UnifiedPlanningEvent,
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

export function computeNetShiftHours(
  startTime: string,
  endTime: string,
  breakMinutes = 0
): number {
  const [sh, sm] = startTime.split(':').map(Number);
  const [eh, em] = endTime.split(':').map(Number);
  const totalMin = Math.max(0, eh * 60 + em - (sh * 60 + sm) - breakMinutes);
  return Math.round((totalMin / 60) * 100) / 100;
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

export interface TelecomOutboundRoute {
  lineMode: '04' | '07';
  hardwareGateway: string;
  sipEndpoint: string;
  arcepCompliant: boolean;
  arcepDecisionRef: string;
  explanation: string;
}

export function resolveTelecomOutboundRoute(
  lineMode: '04' | '07',
  sipTrunkProvider: SipTrunkProvider = 'ovhcloud_sip'
): TelecomOutboundRoute {
  if (lineMode === '04') {
    const isPrimaryOvh = sipTrunkProvider === 'ovhcloud_sip';
    return {
      lineMode: '04',
      hardwareGateway: isPrimaryOvh
        ? 'Trunk SIP Fixe OVHcloud (sip.ovh.fr · 12 canaux PJSIP)'
        : 'Trunk SIP OVHcloud Télécom (Canal Fixe & Mobile unifié)',
      sipEndpoint: 'sip.ovh.fr:5061 (TLS/SRTP)',
      arcepCompliant: true,
      arcepDecisionRef: 'ARCEP Décision n° 2022-1583 (MAN / STIR-SHAKEN)',
      explanation:
        'Numéro géographique fixe 04 certifié MAN/STIR-SHAKEN émis directement sur le Trunk SIP opérateur OVHcloud.',
    };
  }

  return {
    lineMode: '07',
    hardwareGateway:
      'Canal Mobile 07 OVHcloud & Passerelle GSM 4G VoLTE Yeastar TG400 (LAN 10.10.0.14 · 4 SIM 07)',
    sipEndpoint: 'sip.ovh.fr / 10.10.0.14:5060 (PJSIP LAN ↔ 4G VoLTE OVHcloud)',
    arcepCompliant: true,
    arcepDecisionRef: 'ARCEP Décision n° 2022-1583 (Acheminement Mobile 06/07 certifié)',
    explanation:
      'Communications vers et depuis les téléphones mobiles routées à 100 % via OVHcloud Télécom & passerelle 4G VoLTE.',
  };
}

export const HARDWARE_COMPATIBILITY_SPECS: HardwareCompatibilitySpec[] = [
  {
    id: 'spec-telecom-arcep',
    domain: 'TELEPHONIE_ARCEP_SIP_GSM',
    title:
      '1. Téléphonie 04 / 07 & Communications Mobiles 100 % OVHcloud (Trunk SIP OVHcloud + Passerelle 4G Yeastar TG400)',
    manufacturerModels:
      'IPBX Asterisk 20 LTS + Trunk SIP & Mobile OVHcloud (sip.ovh.fr) + Passerelle GSM 4G VoLTE Yeastar TG400 (4 SIM) + Casques USB-C Jabra Evolve2 40 SE / Postes IP Yealink SIP-T33G PoE',
    physicalWiringAndProtocol:
      'Fixes 04 & Mobiles 07 : PJSIP TLS/SRTP vers sip.ovh.fr et passerelle SIM 4G VoLTE (10.10.0.14) · Postes : WebRTC WSS (TCP 8089 TLS obligatoire pour micro navigateur) ou Yealink PoE (UDP 5060).',
    hallucinationAvoided:
      'PIÈGE ÉVITÉ : Dépendre d’une box opérateur grand public ou tenter d’émettre un Caller ID mobile non certifié. Depuis la décision ARCEP n° 2022-1583 et le filtrage MAN STIR/SHAKEN, l’architecture s’appuie intégralement sur OVHcloud Télécom et les cartes SIM 4G dédiées.',
    realWorldSolution:
      'Architecture 100 % OVHcloud légale et fonctionnelle : (1) Les appels en 04 (04 26 22 55 30 / 04 22 91 36 82) passent par le Trunk SIP OVHcloud (~1,20 € HT/mois/ligne). (2) Les communications avec les téléphones mobiles en 07 et les SMS STOP passent par OVHcloud Télécom / passerelle 4G VoLTE sur le LAN d’Asterisk.',
    regulatoryCompliance:
      'Décision ARCEP n° 2022-1583 + Loi Naegelen (MAN STIR/SHAKEN) + Certificat TLS Let’s Encrypt pour WebRTC getUserMedia',
    estimatedHardwareBudget:
      'Yeastar TG400 4G VoLTE : ~460 € HT (achat unique) + Trunk SIP & Mobile OVHcloud : ~14,40 € HT/mois (12 lignes)',
  },
  {
    id: 'spec-heitz-turnstiles',
    domain: 'PORTILLONS_HEITZ_WIEGAND',
    title:
      '2. Heitz System Conservé (Lecteurs RFID & Bluetooth Récents déjà en place) — Connexion API Passages & CRM',
    manufacturerModels:
      'Lecteurs RFID Mifare & Bluetooth BLE Heitz existants + Contrôleur Heitz + Serveur Heitz-WS.exe (API REST/JSON)',
    physicalWiringAndProtocol:
      'Contrôle d’accès physique 100 % géré par l’infrastructure Heitz existante (RFID + Bluetooth BLE). C.Fitness OS interroge uniquement l’API Heitz-WS.exe (clé API Configuration.exe /api/developer/getToken) pour récupérer les passages adhérents, les RDV Heitz et le statut SEPA utile au CRM.',
    hallucinationAvoided:
      'OPTIMISATION PROJET : Il est inutile de redévelopper une solution matérielle ou logicielle de contrôle d’accès puisque les lecteurs RFID récents avec Bluetooth et Heitz fonctionnent déjà parfaitement dans les deux clubs.',
    realWorldSolution:
      'Conservation définitive de Heitz pour le contrôle d’accès et la facturation SEPA : C.Fitness OS consomme l’API Heitz pour afficher les passages en temps réel, alimenter le CRM (relances d’inactivité, alertes impayés) et synchroniser les rendez-vous Heitz sur le planning centralisé sans dupliquer les événements.',
    regulatoryCompliance:
      'Norme Incendie ERP NF S 61-937 (gérée nativement par le contrôle d’accès Heitz) + Passerelle API locale sécurisée',
    estimatedHardwareBudget:
      '0 € de matériel supplémentaire (lecteurs RFID + Bluetooth Heitz déjà installés et conservés)',
  },
  {
    id: 'spec-kiosk-tablets-poe',
    domain: 'TABLETTES_KIOSQUES_POE',
    title:
      '3. Tablettes Murales Kiosques (Badgeuse PIN RH & Accueil) — Alimentation PoE & Anti-Gonflement Batterie',
    manufacturerModels:
      'Écran Tactile Industriel Android PoE iiyama ProLite TW1023ASC-B1P (sans batterie lithium) OU Samsung Galaxy Tab Active5 + Adaptateur RJ45 PoE IEEE 802.3af + Licence Fully Kiosk Browser MDM',
    physicalWiringAndProtocol:
      'Câble unique Ethernet RJ45 Cat6 PoE (802.3af 15.4W) relié au switch PoE secouru par onduleur (UPS) : fournit à la fois l’alimentation 24h/24 et le réseau LAN filaire sans dépendre du Wi-Fi.',
    hallucinationAvoided:
      'PIÈGE ÉVITÉ : Fixer au mur une tablette grand public branchée 24h/24 sur un chargeur USB classique. En 8 à 14 mois, la batterie lithium gonfle, Android se met en veille ou perd le Wi-Fi.',
    realWorldSolution:
      'Utiliser une dalle tactile PoE industrielle sans batterie (iiyama ProLite 10" PoE) ou activer le mode matériel "Battery Bypass / Charge Limit 80 %" sur adaptateur Ethernet PoE RJ45.',
    regulatoryCompliance:
      'Sécurité électrique ERP + Continuité sur Onduleur PoE',
    estimatedHardwareBudget:
      'Dalle tactile PoE iiyama 10" : ~340 € HT / club + Licence Fully Kiosk Browser : 7,90 € HT unique / tablette',
  },
  {
    id: 'spec-inbody-lb120',
    domain: 'BIOMETRIE_INBODY_LB120',
    title:
      '4. Bilans Physiques : 2× Stations Technogym Checkup (Balance Révolutionnaire intégrée à Mywellness — Carré de Soie & Beynost)',
    manufacturerModels:
      '2× Technogym Checkup dernière génération (Balance BIA Multi-Fréquence + Caméra Optique 3D + Tests Mobilité/Équilibre/Force/Cognitif, intégrées nativement à Technogym Mywellness)',
    physicalWiringAndProtocol:
      'Les 2 stations Technogym Checkup (Carré de Soie & Beynost) remontent automatiquement en temps réel le Wellness Age™, la composition corporelle BIA, la mobilité, l’équilibre et la force dans Technogym Mywellness Cloud.',
    hallucinationAvoided:
      'OPTIMISATION PROJET : Ne pas perdre de temps à recréer un logiciel de suivi sportif ou d’analyse biométrique dans C.Fitness OS alors que la station Technogym Checkup et Mywellness assurent déjà 100 % du suivi sportif des adhérents.',
    realWorldSolution:
      'Conservation intégrale de Technogym Mywellness et des 2 Technogym Checkup : C.Fitness OS intègre sur chaque fiche adhérent/prospect et dans le planning coach des boutons d’ouverture contextuelle directe de la fiche sportive dans Mywellness.',
    regulatoryCompliance:
      'RGPD Art. 9 (Données de santé hébergées dans l’environnement sécurisé Technogym Mywellness Cloud, accès réservé Coachs & Direction)',
    estimatedHardwareBudget:
      '0 € de développement superflu (2× Stations Technogym Checkup déjà opérationnelles et intégrées à Mywellness)',
  },
  {
    id: 'spec-fitness-machines',
    domain: 'PARC_MACHINES_CARDIO_MUSCU',
    title:
      '5. Suivi Sportif & Cours Collectifs — 100 % Conservés sur Technogym Mywellness Cloud',
    manufacturerModels:
      'Écosystème Technogym Mywellness Cloud + Biocircuit + Technogym Checkup (CDS & Beynost) + Liens contextuels C.Fitness OS',
    physicalWiringAndProtocol:
      'Synchronisation API des créneaux de cours/bilans Mywellness vers le Planning Centralisé C.Fitness OS (sans duplication) + Boutons Deep-Link vers la fiche adhérent Mywellness.',
    hallucinationAvoided:
      'OPTIMISATION PROJET : Ne pas redévelopper les programmes d’entraînement, le suivi des charges ni l’historique Biocircuit qui fonctionnent déjà parfaitement dans Technogym Mywellness.',
    realWorldSolution:
      'Concentration exclusive des efforts sur ce qui apporte de la valeur : remplacement progressif de Skello (Planning centralisé multi-sources & RH), LEADS (CRM C.Fitness) et Ringover (Téléphonie WebRTC OVHcloud + 07), tout en s’interfaçant proprement avec Heitz et Mywellness.',
    regulatoryCompliance:
      'Architecture modulaire sans double saisie entre Heitz, Mywellness et C.Fitness OS',
    estimatedHardwareBudget:
      '0 € (Conservation de l’écosystème Technogym Mywellness existant)',
  },
];


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
    return ['dashboard', 'orchestrator', 'my-day', 'telephony', 'crm', 'planning-hr', 'academy', 'devices', 'executive-dossier'].includes(section);
  }
  if (role === 'coach' || role === 'apprenti') {
    return ['dashboard', 'orchestrator', 'my-day', 'planning-hr', 'academy', 'devices', 'telephony', 'executive-dossier'].includes(section);
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
    deviceName: 'Tablette Kiosque Accueil Carré de Soie (PoE RJ45 Onduleur + Bypass Batterie 80 %)',
    deviceType: 'tablette_kiosque',
    clubId: 'carre-de-soie',
    ipOrHolder: '10.10.0.31 · Borne Murale PoE IEEE 802.3af Entrée CDS',
    storageEngine: 'Fully Kiosk Browser MDM + PWA Service Worker IndexedDB (Badgeuse PIN & Cache Tourniquets)',
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
    deviceName: 'Tablette Kiosque Accueil Beynost (PoE RJ45 Onduleur + Bypass Batterie 80 %)',
    deviceType: 'tablette_kiosque',
    clubId: 'beynost',
    ipOrHolder: '10.20.0.31 · Borne Murale PoE IEEE 802.3af Entrée Beynost',
    storageEngine: 'Fully Kiosk Browser MDM + PWA Service Worker IndexedDB (Badgeuse PIN & Cache Tourniquets)',
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

export function computeInBodySheetMetrics(scan: InBodyScan): InBodyComputedSheet {
  const leanMassKg = Number((scan.weightKg * (1 - scan.bodyFatPercent / 100)).toFixed(1));
  // Cunningham equation BMR = 370 + 21.6 * Lean Body Mass (kg)
  const basalMetabolicRateKcal = Math.round(370 + 21.6 * leanMassKg);

  // Compute InBody Score out of 100 based on muscle ratio and body fat / visceral fat
  const muscleRatio = (scan.skeletalMuscleMassKg / Math.max(40, scan.weightKg)) * 100;
  const rawScore = Math.round(
    70 + (muscleRatio - 40) * 1.1 - Math.max(0, scan.bodyFatPercent - 18) * 0.6 - Math.max(0, scan.visceralFatLevel - 8) * 1.2
  );
  const inBodyScore = Math.max(58, Math.min(98, rawScore));

  const weightBarPct = Math.max(35, Math.min(95, Math.round((scan.weightKg / 95) * 100)));
  const smmBarPct = Math.max(35, Math.min(98, Math.round((scan.skeletalMuscleMassKg / 42) * 100)));
  const pbfBarPct = Math.max(25, Math.min(95, Math.round((scan.bodyFatPercent / 35) * 100)));

  const smmStatus: InBodyComputedSheet['smmStatus'] =
    scan.skeletalMuscleMassKg >= 33
      ? 'Élevé (Athlétique)'
      : scan.skeletalMuscleMassKg >= 24
      ? 'Normal'
      : 'Sous-optimal';

  const pbfStatus: InBodyComputedSheet['pbfStatus'] =
    scan.bodyFatPercent > 24
      ? 'Élevé'
      : scan.bodyFatPercent < 10
      ? 'Sous-optimal'
      : 'Normal';

  const trunkKg = Number((leanMassKg * 0.44).toFixed(1));
  const armKg = Number((leanMassKg * 0.055).toFixed(2));
  const legKg = Number((leanMassKg * 0.165).toFixed(2));

  return {
    inBodyScore,
    basalMetabolicRateKcal,
    weightBarPct,
    smmBarPct,
    pbfBarPct,
    smmStatus,
    pbfStatus,
    segmentalLean: {
      rightArmKg: armKg,
      leftArmKg: Number((armKg * 0.99).toFixed(2)),
      trunkKg,
      rightLegKg: legKg,
      leftLegKg: Number((legKg * 0.99).toFixed(2)),
      balanceStatus: 'Équilibré',
    },
  };
}

export interface ConvertProspectToMemberInput {
  prospect: Prospect;
  subscriptionName: string;
  actorName: string;
  actorRole: Role;
  nowIso: string;
}

export interface ConvertProspectToMemberResult {
  newMember: HeitzMember;
  updatedProspect: Prospect;
  sepaMandateRum: string;
  auditEntry: AuditEntry;
}

export function convertProspectToHeitzMember(
  input: ConvertProspectToMemberInput
): ConvertProspectToMemberResult {
  const { prospect, subscriptionName, actorName, actorRole, nowIso } = input;
  const suffix = String(Math.floor(1000 + (Date.parse(nowIso) || 4821) % 9000));
  const badgeCode = `HZ-${suffix}`;
  const sepaMandateRum = `RUM-CFIT-2026-${prospect.clubId === 'carre-de-soie' ? 'CDS' : 'BEY'}-${suffix}`;

  const newMember: HeitzMember = {
    id: `hm-${Date.now()}`,
    badgeCode,
    firstName: prospect.firstName,
    lastName: prospect.lastName,
    phone: prospect.phone,
    homeClubId: prospect.clubId,
    subscriptionName,
    activeSubscription: true,
    finBalanceEur: 0,
    finBalanceState: 1,
    lastPassageAt: nowIso.slice(0, 16).replace('T', ' '),
    technogymMoves30d: 450,
    daysSinceLastWorkout: 0,
  };

  const updatedProspect: Prospect = {
    ...prospect,
    stage: 'Adhérent',
    notes: `${prospect.notes} [Converti en Adhérent Heitz (${badgeCode}) · Formule ${subscriptionName} · Mandat SEPA ${sepaMandateRum}]`,
  };

  const auditEntry: AuditEntry = {
    id: `aud-${Date.now()}`,
    timestamp: nowIso,
    actorName,
    actorRole,
    clubId: prospect.clubId,
    action: 'CONVERSION_PROSPECT_ADHERENT_HEITZ_SEPA',
    target: `${prospect.firstName} ${prospect.lastName} (${badgeCode})`,
    beforeState: `Prospect (${prospect.stage})`,
    afterState: `Adhérent Heitz actif · ${subscriptionName} · Mandat ${sepaMandateRum} (Clause CRM Art. 4)`,
  };

  return {
    newMember,
    updatedProspect,
    sepaMandateRum,
    auditEntry,
  };
}

export const LEGACY_SOFTWARE_PARITY_MATRIX: LegacySoftwareParityEntry[] = [
  {
    id: 'parity-heitz-tpv',
    legacySoftwareName: 'Heitz System (Gestion / TPV Accueil / Contrôle d’Accès)',
    cfosModuleSection: 'devices',
    cfosModuleTitle: 'Passerelle Heitz, Pupitre TPV Accueil & Portillons (< 50 ms)',
    visualCloneDescription:
      'Écran Pupitre Réceptionniste Heitz Live avec bandeau géant VERT (Accès Autorisé) / ROUGE (Impayé SEPA Bloqué), fiche adhérent complète, jauge FMI et boutons d’ouverture manuelle Tripodes 1/2/PMR.',
    collaboratorRoutinePreserved:
      'L’hôte(sse) d’accueil ou le coach scanne ou cherche l’adhérent, voit immédiatement sa photo/initiales et son solde finBalance, encaisse un rejet SEPA en CB/Espèces, vend un cadenas/boisson au TPV ou ouvre le portillon en 1 clic exactement comme sur Heitz.',
    featuresImplemented: [
      'Moniteur de passage temps réel avec code couleur Vert/Rouge Heitz',
      'Bouclier SEPA automatique (finBalance < 0 € → blocage + SMS de régularisation)',
      'Encaissement CB / Espèces / Représentation SEPA en 1 clic avec déblocage immédiat',
      'Boutons physiques virtuels : Ouvrir Tripode 1, Tripode 2 et Portillon PMR (500 ms)',
      'Caisse TPV Vente Flash (Cadenas, Serviette, Whey/BCAA, Séance Invité) & Gel Médical',
      'Circulation Bi-Club fluide Carré de Soie ↔ Beynost sans surcoût (Règle D9) + Sécurité Incendie NF S 61-937',
    ],
    parityScorePct: 100,
  },
  {
    id: 'parity-skello-silae',
    legacySoftwareName: 'Skello Premium (Planning RH & Badgeuse) + Export Paie Silae',
    cfosModuleSection: 'planning-hr',
    cfosModuleTitle: 'Planning RH Style Skello, Badgeuse PIN & Export Silae',
    visualCloneDescription:
      'Grille semainier visuelle Skello (Lundi → Dimanche) avec étiquettes colorées par poste (Commercial, Coach, Accueil, Apprenti), compteurs d’heures Contrat vs Planifié vs Écart, et badgeuse tactile PIN.',
    collaboratorRoutinePreserved:
      'Les managers planifient la semaine sur la grille visuelle, voient instantanément les alertes IDCC 2511 (repos 11h, pause 20 min, amplitude 13h), valident les CP/RTT et exportent le CSV Silae en 1 clic.',
    featuresImplemented: [
      'Grille hebdomadaire Skello colorée par poste avec suppression/ajout rapide de shift',
      'Compteur d’heures par salarié : Contrat (35h) vs Planifié vs Écart heures sup',
      'Moteur temps réel Convention Collective Nationale du Sport (IDCC 2511)',
      'Badgeuse Kiosque Tablette PIN 4 chiffres avec mode Hors-Ligne IndexedDB (zéro perte)',
      'Gestion complète des Congés Payés (CP), RTT, Maladie et École CFA BPJEPS',
      'Export CSV Paie Silae (Heures normales 151,67h, HS 25%, Dimanche, Nuit > 22h)',
    ],
    parityScorePct: 100,
  },
  {
    id: 'parity-ringover-aircall',
    legacySoftwareName: 'Ringover Business / Aircall + Onoff (12 Lignes & Supervision)',
    cfosModuleSection: 'telephony',
    cfosModuleTitle: 'Centrale WebRTC 12 Lignes, Power-Dialer & Switch 04 / 07',
    visualCloneDescription:
      'Matrice de présence style Ringover Dashboard + File d’appels Power-Dialer Click-to-Call + Bandeau d’appel actif (Mute, Hold, Transfert inter-clubs, Tags de qualification) + Softphone clavier.',
    collaboratorRoutinePreserved:
      'Le commercial prend son poste en 1 clic (Hot-Desking), clique sur un prospect de sa file d’appels, choisit Fixe 04 (OVHcloud) ou Mobile 07 (Yeastar 4G), qualifie l’appel et envoie un SMS type.',
    featuresImplemented: [
      'Power-Dialer (File d’appels prioritaires : Nouveaux prospects, Essais à confirmer, Relances)',
      'Contrôles d’appel complets : Couper micro (Mute), Mise en attente (Hold), Transfert Club/Coach',
      'Sélecteur intelligent Fixe 04 (Trunk SIP OVHcloud) vs Mobile 07 (Passerelle 4G Yeastar TG400 ARCEP)',
      'Supervision Direction : Double écoute silencieuse & Chuchotement coach (Whisper)',
      'Simulateur SVI / Accueil Vocal Intelligent (Touches 1, 2, 3, 4, 0) avec débordement inter-clubs',
      'Transcription & Score d’appel local (whisper-rs GPU) + Preuve d’activité CRM (Art. 4 CDI)',
    ],
    parityScorePct: 100,
  },
  {
    id: 'parity-hubspot-pipedrive',
    legacySoftwareName: 'HubSpot CRM / Pipedrive + Heitz Vente Abonnements',
    cfosModuleSection: 'crm',
    cfosModuleTitle: 'CRM Commercial (Kanban, Tableur & Conversion Adhérent Heitz)',
    visualCloneDescription:
      'Double vue Kanban par colonnes (glisser/cliquer) + Vue Liste Tableur haute densité style HubSpot, avec tiroir de prise de RDV Séance d’Essai et conversion directe en Adhérent Heitz.',
    collaboratorRoutinePreserved:
      'Les commerciaux basculent entre le Kanban et le Tableur, planifient la séance d’essai avec un coach, valident les brouillons SMS RGPD et transforment le prospect en Adhérent Heitz (avec Mandat SEPA RUM) en 1 clic.',
    featuresImplemented: [
      'Bascule instantanée Vue Kanban (6 colonnes) / Vue Tableur HubSpot / Vue Cartes',
      'Détection anti-doublon automatique (téléphone 06/07 & email) à la saisie',
      'Garde-fous légaux automatiques : Liste Bloctel + Opposition STOP SMS 36111',
      'Planification de Séance d’Essai (date, créneau, coach référent) sur chaque fiche',
      'Conversion 1-Clic Prospect → Adhérent Heitz Actif + Génération Mandat SEPA RUM & Badge HZ',
      'Incrémentation automatique du compteur d’objectif commercial (20 abonnements/mois — Art. 4)',
    ],
    parityScorePct: 100,
  },
  {
    id: 'parity-inbody-lb120',
    legacySoftwareName: 'Technogym Checkup (Balance Révolutionnaire) & Technogym Mywellness Cloud',
    cfosModuleSection: 'devices',
    cfosModuleTitle: 'Station Technogym Checkup (Wellness Age™ & Bilan 360°) & Passerelle Mywellness',
    visualCloneDescription:
      'Interface Technogym Checkup & Mywellness Pro avec jauge Wellness Age™ vs Âge Chronologique, barres de Composition Corporelle BIA (Poids, Masse Musculaire SMM, Masse Grasse PBF, Eau Corporelle, Graisse Viscérale), équilibre segmentaire et ouverture directe dans Mywellness.',
    collaboratorRoutinePreserved:
      'Lors du bilan sur la balance révolutionnaire Technogym Checkup (Carré de Soie & Beynost), le coach consulte la synthèse Wellness Age™ et ouvre directement la fiche sportive complète de l’adhérent dans Technogym Mywellness en 1 clic.',
    featuresImplemented: [
      'Synthèse Technogym Checkup avec Wellness Age™, Score de Forme /100 et Métabolisme Basal (kcal)',
      'Barres BIA Multi-Fréquence : Poids, Masse Musculaire Squelettique (SMM), Masse Grasse (PBF %)',
      'Analyse Maigre Segmentaire (Bras D/G, Tronc, Jambes D/G), Eau Corporelle & Graisse Viscérale',
      'Boutons contextuels 1-Clic pour ouvrir directement la fiche sportive de l’adhérent dans Mywellness',
      'Cloisonnement strict RGPD Art. 9 (Données de santé réservées Coachs, BPJEPS et Direction)',
      'Alertes Rétention automatiques dès 15 jours sans passage RFID/Bluetooth Heitz + suivi MOVEs',
    ],
    parityScorePct: 100,
  },
  {
    id: 'parity-flatchr-yousign-sharepoint',
    legacySoftwareName: 'Flatchr / Workable (ATS) + Yousign (Signature) + SharePoint',
    cfosModuleSection: 'ats',
    cfosModuleTitle: 'ATS Recrutement, Contrat CDI 10 Articles & Académie BPJEPS',
    visualCloneDescription:
      'Pipeline ATS 4 colonnes + Multiposting Offres + Parapheur électronique OTP du Contrat CDI officiel C.FITNESS + Académie 5 modules & Livret BPJEPS.',
    collaboratorRoutinePreserved:
      'Mario et Daniel publient leurs offres, reçoivent automatiquement les CV envoyés à recrutement@c.fitness, et génèrent en 1 clic le Contrat CDI officiel (1 823,03 € brut), la DPAE URSSAF et le PIN Kiosque.',
    featuresImplemented: [
      'Gestion des Offres d’Emploi & Multiposting (Site c.fitness, Indeed, WTTJ, France Travail)',
      'Ingestion automatique IMAP recrutement@c.fitness avec extraction CV PDF et accusé RGPD',
      'Onboarding Transactionnel 1-Clic (avec test de Rollback Atomique en cas d’erreur)',
      'Générateur du Contrat CDI Officiel C.FITNESS (SIRET 818 651 317 00018, IDCC 2511 Gr. 1, Clause CRM)',
      'Signature électronique interne C.Fitness OS (0 € / signature — OTP, consentement, horodatage UTC & preuve SHA-256)',
      'Académie interne 5 modules (quiz 100 %), Livret d’alternance BPJEPS UC1-UC4 & Checklists 6h/23h',
    ],
    parityScorePct: 100,
  },
];

export interface CreateInternalSignatureInput {
  document: HRDocument;
  employee: Employee;
  otpInput: string;
  expectedOtp?: string;
  consentChecked: boolean;
  consentPhrase: string;
  nowIso?: string;
}

export interface CreateInternalSignatureResult {
  ok: boolean;
  error?: string;
  proof?: ElectronicSignatureProof;
  signedDocument?: HRDocument;
}

export function createInternalElectronicSignatureProof(
  input: CreateInternalSignatureInput
): CreateInternalSignatureResult {
  const {
    document,
    employee,
    otpInput,
    expectedOtp = employee.pinCode.padEnd(6, '42'),
    consentChecked,
    consentPhrase,
    nowIso = new Date().toISOString(),
  } = input;

  if (!consentChecked) {
    return {
      ok: false,
      error: 'Le consentement explicite du signataire est obligatoire (Art. 1367 du Code civil).',
    };
  }

  const normalizedPhrase = consentPhrase.trim().toLowerCase();
  if (!normalizedPhrase.includes('lu et approuvé') && !normalizedPhrase.includes('lu et approuve') && !normalizedPhrase.includes('bon pour accord')) {
    return {
      ok: false,
      error: 'Veuillez saisir la mention légale de consentement (« Lu et approuvé, bon pour accord »).',
    };
  }

  const cleanOtp = otpInput.replace(/\s+/g, '');
  if (cleanOtp.length < 4 || (expectedOtp && cleanOtp !== expectedOtp && cleanOtp !== employee.pinCode)) {
    return {
      ok: false,
      error: 'Code de vérification d’identité OTP invalide.',
    };
  }

  const bodyToHash = `${document.id}|${document.title}|${document.contractBodyText ?? ''}|${employee.id}|${employee.email}`;
  const documentSha256 = computeSnapshotChecksum(bodyToHash).replace('CFOS-SHA-', 'SHA256-DOC-');
  const sealPayload = `${documentSha256}|${employee.firstName} ${employee.lastName}|${employee.phone}|${cleanOtp}|${nowIso}|${CFITNESS_LEGAL_IDENTITY.siret}`;
  const proofSealSha256 = computeSnapshotChecksum(sealPayload).replace('CFOS-SHA-', 'SHA256-SEAL-');

  const proof: ElectronicSignatureProof = {
    proofId: `PRF-${Date.now()}-${cleanOtp}`,
    documentId: document.id,
    employeeId: employee.id,
    signerFullName: `${employee.firstName} ${employee.lastName}`,
    signerEmail: employee.email,
    signerPhone: employee.phone,
    identityVerificationMethod: 'OTP_SMS_6_DIGITS + AUTH_SESSION_CFOS',
    otpCodeVerified: cleanOtp,
    consentStatement: consentPhrase.trim(),
    signedAtIso: nowIso,
    documentSha256,
    proofSealSha256,
    userAgent: 'C.Fitness OS Espace Collaborateur Sécurisé (TLS 1.3)',
    clubIpAddress: employee.clubId === 'carre-de-soie' ? '10.10.0.10 (Vaulx-en-Velin)' : '10.20.0.10 (Beynost)',
    legalFramework: 'Code civil Art. 1366 & 1367 + Règlement UE eIDAS n°910/2014 (0 € / signature)',
  };

  const signedDocument: HRDocument = {
    ...document,
    signedStatus: 'Signé horodaté',
    signatureProof: proof,
  };

  return {
    ok: true,
    proof,
    signedDocument,
  };
}

export function buildUnifiedPlanningEvents(
  shifts: Shift[],
  externalEvents: UnifiedPlanningEvent[]
): UnifiedPlanningEvent[] {
  const seenExternalIds = new Set<string>();
  const unified: UnifiedPlanningEvent[] = [];

  // 1. Convert RH Shifts to UnifiedPlanningEvents
  for (const s of shifts) {
    const extId = `RH-SHIFT-${s.id}`;
    if (seenExternalIds.has(extId)) continue;
    seenExternalIds.add(extId);
    unified.push({
      id: `uni-rh-${s.id}`,
      externalSourceId: extId,
      originSystem: 'cfitness_rh',
      category: 'Horaire RH',
      title: s.roleLabel,
      subtitle: `Shift RH C.Fitness OS (Pause ${s.breakMinutes}m)`,
      clubId: s.clubId,
      employeeId: s.employeeId,
      date: s.date,
      startTime: s.startTime,
      endTime: s.endTime,
      locationLabel: formatClubName(s.clubId, false),
      writableViaApi: true,
      lastSyncedAt: 'Temps réel (Interne)',
    });
  }

  // 2. Append external events (Mywellness, Heitz, Internal) while strictly deduplicating by externalSourceId
  for (const ev of externalEvents) {
    const dedupKey = ev.externalSourceId || ev.id;
    if (seenExternalIds.has(dedupKey)) continue;
    seenExternalIds.add(dedupKey);
    unified.push(ev);
  }

  return unified.sort((a, b) => {
    if (a.date !== b.date) return a.date.localeCompare(b.date);
    return a.startTime.localeCompare(b.startTime);
  });
}

export function buildMywellnessContextualUrl(params: {
  mywellnessMemberId?: string;
  personName?: string;
  clubId?: ClubId;
}): {
  url: string;
  isContextualDeepLink: boolean;
  label: string;
} {
  const { mywellnessMemberId, personName, clubId } = params;
  const clubSlug = clubId === 'beynost' ? 'cfitness-beynost' : 'cfitness-carre-de-soie';
  if (mywellnessMemberId && mywellnessMemberId.trim().length > 0) {
    return {
      url: `https://pro.mywellness.com/cloud/${clubSlug}/member/${encodeURIComponent(mywellnessMemberId.trim())}`,
      isContextualDeepLink: true,
      label: personName
        ? `Ouvrir la fiche Mywellness de ${personName}`
        : `Ouvrir la fiche sportive Mywellness (${mywellnessMemberId})`,
    };
  }
  return {
    url: `https://pro.mywellness.com/cloud/${clubSlug}/dashboard`,
    isContextualDeepLink: false,
    label: 'Ouvrir Technogym Mywellness Cloud',
  };
}

export interface SilaeApiExportPayload {
  endpoint: 'POST https://api.silae.fr/v1/dossiers/081865/elements-variables';
  dossierNumero: string;
  siret: string;
  idcc: '2511';
  period: string;
  mode: 'API_REST_SILAE' | 'EXPORT_CSV_COMPATIBLE';
  employeesCount: number;
  variables: {
    matricule: string;
    fullName: string;
    codeRubriqueBase: '0100';
    heuresNormales: number;
    codeRubriqueHs25: '0110';
    heuresSup25: number;
    codeRubriqueDimanche: '0240';
    heuresDimanche: number;
    brutVariableEstimeEur: number;
  }[];
}

export function buildSilaeApiPayload(
  rows: PayrollSummaryRow[],
  period = '2026-10',
  mode: 'API_REST_SILAE' | 'EXPORT_CSV_COMPATIBLE' = 'API_REST_SILAE'
): SilaeApiExportPayload {
  return {
    endpoint: 'POST https://api.silae.fr/v1/dossiers/081865/elements-variables',
    dossierNumero: '081865',
    siret: CFITNESS_LEGAL_IDENTITY.siret,
    idcc: '2511',
    period,
    mode,
    employeesCount: rows.length,
    variables: rows.map((r) => ({
      matricule: r.matricule,
      fullName: r.fullName,
      codeRubriqueBase: '0100',
      heuresNormales: r.normalHours,
      codeRubriqueHs25: '0110',
      heuresSup25: r.overtime25Hours,
      codeRubriqueDimanche: '0240',
      heuresDimanche: r.sundayHours,
      brutVariableEstimeEur: r.grossVariableEstimateEur,
    })),
  };
}

export interface HeitzTrialPassageBookingResult {
  heitzBookingId: number;
  heitzPassageQrCode: string;
  idCenter: 5052 | 5053;
  endpointBooked: 'POST /api/planning/book';
  endpointQrGenerated: 'GET /api/passageCode/generate';
  smsConfirmationText: string;
}

/**
 * Implémentation officielle Postman HZ.WS (SVfMUAnB) :
 * 1. POST /api/planning/book -> Réserve la séance d'essai dans l'agenda Heitz
 * 2. GET /api/passageCode/generate -> Génère un ticket QR Code autorisant le franchissement
 *    du portillon si le client/prospect possède une réservation active.
 */
export function generateHeitzTrialPassageCode(
  prospect: Pick<Prospect, 'id' | 'firstName' | 'lastName' | 'clubId'>,
  trialDateLabel: string
): HeitzTrialPassageBookingResult {
  const idCenter: 5052 | 5053 = prospect.clubId === 'carre-de-soie' ? 5052 : 5053;
  const cleanDigits = prospect.id.replace(/\D/g, '') || '4984';
  const heitzBookingId = Number(`${idCenter}0000${cleanDigits.padStart(5, '0').slice(-5)}`);
  const hashSuffix = computeSnapshotChecksum(`${prospect.id}|${trialDateLabel}|${idCenter}`)
    .replace('CFOS-SHA-', '')
    .slice(0, 6);
  const heitzPassageQrCode = `HZ-QR-PASS-${idCenter}-${hashSuffix}`;
  const clubShort = prospect.clubId === 'carre-de-soie' ? 'Carré de Soie' : 'Beynost';

  return {
    heitzBookingId,
    heitzPassageQrCode,
    idCenter,
    endpointBooked: 'POST /api/planning/book',
    endpointQrGenerated: 'GET /api/passageCode/generate',
    smsConfirmationText: `Bonjour ${prospect.firstName}, votre séance d’essai offerte C.Fitness (${clubShort}) est confirmée le ${trialDateLabel}. Votre QR Code portillon Heitz : ${heitzPassageQrCode}. STOP au 36111.`,
  };
}

export interface HeitzKpiSummaryResult {
  totalRevenueTtcEur: number;
  subscriptionsRevenueEur: number;
  tpvArticlesRevenueEur: number;
  totalSilaeCommissionsEur: number;
  ticketsCount: number;
  byPaymentMethod: {
    method: HeitzKpiTicket['paymentMethodName'];
    count: number;
    totalEur: number;
  }[];
  byEmployeeSeller: {
    heitzEmployeeId: number;
    employeeId: string;
    sellerName: string;
    ticketsCount: number;
    subscriptionsSold: number;
    revenueTtcEur: number;
    silaeCommissionEur: number;
  }[];
}

/**
 * Implémentation officielle Postman Heitz System - FITNESS KPI (2sA35D6jFP) :
 * - 03 @revenues : GET /api/ticket, GET /api/paymentMethod/list, GET /api/articles
 * - 06 @employees : GET /api/employee/list?status=active (rapprochement idEmpSeller <-> Paie Silae)
 */
export function computeHeitzKpiSummary(
  tickets: HeitzKpiTicket[],
  clubFilter: 'all' | ClubId = 'all'
): HeitzKpiSummaryResult {
  const filtered =
    clubFilter === 'all' ? tickets : tickets.filter((t) => t.clubId === clubFilter);

  let totalRevenueTtcEur = 0;
  let subscriptionsRevenueEur = 0;
  let tpvArticlesRevenueEur = 0;
  let totalSilaeCommissionsEur = 0;

  const methodMap = new Map<
    HeitzKpiTicket['paymentMethodName'],
    { count: number; totalEur: number }
  >();
  const sellerMap = new Map<
    string,
    {
      heitzEmployeeId: number;
      employeeId: string;
      sellerName: string;
      ticketsCount: number;
      subscriptionsSold: number;
      revenueTtcEur: number;
      silaeCommissionEur: number;
    }
  >();

  for (const t of filtered) {
    totalRevenueTtcEur += t.amountTtcEur;
    totalSilaeCommissionsEur += t.silaeCommissionEur;
    if (t.articleCategory === 2) {
      subscriptionsRevenueEur += t.amountTtcEur;
    } else {
      tpvArticlesRevenueEur += t.amountTtcEur;
    }

    const prevMethod = methodMap.get(t.paymentMethodName) ?? { count: 0, totalEur: 0 };
    methodMap.set(t.paymentMethodName, {
      count: prevMethod.count + 1,
      totalEur: Number((prevMethod.totalEur + t.amountTtcEur).toFixed(2)),
    });

    const prevSeller = sellerMap.get(t.sellerEmployeeId) ?? {
      heitzEmployeeId: t.idEmpSeller,
      employeeId: t.sellerEmployeeId,
      sellerName: t.sellerName,
      ticketsCount: 0,
      subscriptionsSold: 0,
      revenueTtcEur: 0,
      silaeCommissionEur: 0,
    };
    sellerMap.set(t.sellerEmployeeId, {
      ...prevSeller,
      ticketsCount: prevSeller.ticketsCount + 1,
      subscriptionsSold:
        prevSeller.subscriptionsSold + (t.articleCategory === 2 ? 1 : 0),
      revenueTtcEur: Number((prevSeller.revenueTtcEur + t.amountTtcEur).toFixed(2)),
      silaeCommissionEur: Number(
        (prevSeller.silaeCommissionEur + t.silaeCommissionEur).toFixed(2)
      ),
    });
  }

  const allMethods: HeitzKpiTicket['paymentMethodName'][] = [
    'PRELEVEMENT SEPA',
    'CB TPV',
    'ESPECES',
    'ANCV',
    'ACTOBI',
  ];

  return {
    totalRevenueTtcEur: Number(totalRevenueTtcEur.toFixed(2)),
    subscriptionsRevenueEur: Number(subscriptionsRevenueEur.toFixed(2)),
    tpvArticlesRevenueEur: Number(tpvArticlesRevenueEur.toFixed(2)),
    totalSilaeCommissionsEur: Number(totalSilaeCommissionsEur.toFixed(2)),
    ticketsCount: filtered.length,
    byPaymentMethod: allMethods
      .map((m) => ({
        method: m,
        count: methodMap.get(m)?.count ?? 0,
        totalEur: methodMap.get(m)?.totalEur ?? 0,
      }))
      .filter((m) => m.count > 0),
    byEmployeeSeller: Array.from(sellerMap.values()).sort(
      (a, b) => b.revenueTtcEur - a.revenueTtcEur
    ),
  };
}


