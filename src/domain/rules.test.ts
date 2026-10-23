import test from 'node:test';
import assert from 'node:assert/strict';
import {
  CFITNESS_LEGAL_IDENTITY,
  INITIAL_BACKUP_REPLICAS,
  buildBackupEnvelope,
  canAccessFeature,
  canCallProspectProspection,
  canSendProspectSms,
  computePayrollVariables,
  computeProbationNoticePeriod,
  computeSnapshotChecksum,
  evaluateGatePassage,
  evaluateShiftCompliance,
  executeTransactionalOnboarding,
  findDuplicateProspect,
  formatClubName,
  formatLeaveStatus,
  formatPointageType,
  generateOfficialCdiContractText,
  generateSilaeCsv,
  isSectionAllowedForRole,
  mergeFailoverSnapshot,
  parseRecruitmentEmailPayload,
  selectOutboundNumber,
  verifyEmployeePin,
} from './rules';
import type { Candidate, Employee, HeitzMember, Prospect, Shift, TrainingModule } from '../types/cfos';

const baseEmployee: Employee = {
  id: 'emp-1',
  firstName: 'Lucas',
  lastName: 'Martin',
  email: 'lucas@cfitness.fr',
  phone: '0612345678',
  role: 'coach',
  clubId: 'carre-de-soie',
  contractType: 'CDI',
  jobTitle: 'Coach Sportif',
  hourlyRate: 15,
  weeklyContractHours: 35,
  pinCode: '2468',
  failedPinAttempts: 0,
  pinLocked: false,
  totpEnabled: false,
  cpBalance: 12,
  rttBalance: 3,
  hireDate: '2025-09-01',
};

test('IDCC 2511 detects < 11h daily rest between evening close and early morning open', () => {
  const shifts: Shift[] = [
    {
      id: 's1',
      employeeId: 'emp-1',
      clubId: 'carre-de-soie',
      date: '2026-10-22',
      startTime: '14:00',
      endTime: '22:30',
      breakMinutes: 30,
      roleLabel: 'Fermeture Plateau',
      published: true,
    },
    {
      id: 's2',
      employeeId: 'emp-1',
      clubId: 'carre-de-soie',
      date: '2026-10-23',
      startTime: '06:30',
      endTime: '13:30',
      breakMinutes: 30,
      roleLabel: 'Ouverture Plateau',
      published: true,
    },
  ];

  const violations = evaluateShiftCompliance(shifts);
  assert.equal(violations.some((v) => v.code === 'DAILY_REST_UNDER_11H'), true);
});

test('IDCC 2511 passes compliant schedule with >= 11h rest and >= 20min break', () => {
  const shifts: Shift[] = [
    {
      id: 's1',
      employeeId: 'emp-1',
      clubId: 'carre-de-soie',
      date: '2026-10-22',
      startTime: '09:00',
      endTime: '17:00',
      breakMinutes: 30,
      roleLabel: 'Coaching',
      published: true,
    },
    {
      id: 's2',
      employeeId: 'emp-1',
      clubId: 'carre-de-soie',
      date: '2026-10-23',
      startTime: '08:00',
      endTime: '16:00',
      breakMinutes: 30,
      roleLabel: 'Coaching',
      published: true,
    },
  ];

  const violations = evaluateShiftCompliance(shifts);
  assert.equal(violations.length, 0);
});

test('07 mobile pool rotation never repeats the last 07 caller ID on consecutive retries', () => {
  const club = {
    landline: '04 26 22 55 30',
    mobilePool: ['07 55 52 28 04', '07 55 52 13 57', '07 55 52 44 19'],
  };

  assert.equal(selectOutboundNumber(club, '04'), '04 26 22 55 30');
  const first = selectOutboundNumber(club, '07', undefined, 0);
  const second = selectOutboundNumber(club, '07', first, 1);
  const third = selectOutboundNumber(club, '07', second, 2);

  assert.equal(first, '07 55 52 28 04');
  assert.equal(second, '07 55 52 13 57');
  assert.equal(third, '07 55 52 44 19');
  assert.notEqual(first, second);
  assert.notEqual(second, third);
});

test('PIN authentication locks employee after 5 consecutive wrong attempts', () => {
  let emp = { ...baseEmployee };
  for (let i = 1; i <= 4; i++) {
    const res = verifyEmployeePin(emp, '0000');
    assert.equal(res.authenticated, false);
    assert.equal(res.locked, false);
    assert.equal(res.remainingAttempts, 5 - i);
    emp = res.updatedEmployee;
  }

  const fifth = verifyEmployeePin(emp, '0000');
  assert.equal(fifth.authenticated, false);
  assert.equal(fifth.locked, true);
  assert.equal(fifth.remainingAttempts, 0);

  const afterLock = verifyEmployeePin(fifth.updatedEmployee, '2468');
  assert.equal(afterLock.authenticated, false);
  assert.equal(afterLock.locked, true);
});

test('Heitz gatekeeper blocks SEPA unpaid with SMS relance and allows inter-club access without surcharge (D9)', () => {
  const unpaidMember: HeitzMember = {
    id: 'm-1',
    badgeCode: 'HZ-9012',
    firstName: 'Camille',
    lastName: 'Roux',
    phone: '06 44 11 22 33',
    homeClubId: 'beynost',
    subscriptionName: 'Formule Liberté Bi-Clubs',
    activeSubscription: true,
    finBalanceEur: -39.9,
    finBalanceState: 0,
    technogymMoves30d: 2400,
    daysSinceLastWorkout: 3,
  };

  const blocked = evaluateGatePassage(
    unpaidMember,
    { id: 'carre-de-soie', degradedMode: false, fireAlarmOpen: false },
    '2026-10-23T10:15:00Z'
  );
  assert.equal(blocked.granted, false);
  assert.equal(blocked.smsRelanceSent, true);

  const validInterClubMember: HeitzMember = {
    ...unpaidMember,
    id: 'm-2',
    finBalanceEur: 0,
    finBalanceState: 1,
  };
  const allowed = evaluateGatePassage(
    validInterClubMember,
    { id: 'carre-de-soie', degradedMode: false, fireAlarmOpen: false },
    '2026-10-23T10:16:00Z'
  );
  assert.equal(allowed.granted, true);
  assert.equal(allowed.reason.includes('D9'), true);
});

test('Transactional 1-click onboarding rolls back cleanly on simulated failure and commits atomically with official C.FITNESS CDI contract', () => {
  const candidate: Candidate = {
    id: 'cand-1',
    offerId: 'off-1',
    firstName: 'Inès',
    lastName: 'Benali',
    email: 'ines.benali@mail.fr',
    phone: '06 78 90 12 34',
    clubId: 'beynost',
    roleTarget: 'commercial',
    contractTarget: 'CDI',
    sourceChannel: 'recrutement@c.fitness',
    stage: 'Retenu',
    experienceSummary: 'Vente et conseil fitness',
    certifications: ['PSC1'],
    aiDecisionSupportNote: 'Profil aligné accueil 3S',
    aiFitIndicators: ['PSC1 valide', 'Disponibilité samedi'],
    appliedAt: '2026-10-15',
    rgpdRetentionUntil: '2028-10-15',
  };

  const modules: TrainingModule[] = [
    {
      id: 'mod-1',
      code: 'M1',
      title: 'Accueil & posture 3S',
      authors: 'Mario & Daniel Carvalho',
      durationMin: 45,
      mandatoryFor: ['apprenti', 'coach', 'commercial'],
      summary: 'Sourire, Saluer, Servir',
      keyPoints: ['3S'],
      quizQuestion: 'Que signifie 3S ?',
      quizOptions: ['Sourire, Saluer, Servir', 'Sport, Santé, Souplesse'],
      quizCorrectIndex: 0,
    },
  ];

  const rbacDenied = executeTransactionalOnboarding({
    candidate,
    existingEmployees: [baseEmployee],
    trainingModules: modules,
    firstShiftDate: '2026-10-26',
    firstShiftStart: '09:00',
    firstShiftEnd: '16:00',
    hourlyRate: 12.02,
    weeklyHours: 35,
    actorName: 'Commercial Test',
    actorRole: 'commercial',
    nowIso: '2026-10-23T11:00:00Z',
  });
  assert.equal(rbacDenied.ok, false);

  const rolledBack = executeTransactionalOnboarding({
    candidate,
    existingEmployees: [baseEmployee],
    trainingModules: modules,
    firstShiftDate: '2026-10-26',
    firstShiftStart: '09:00',
    firstShiftEnd: '16:00',
    hourlyRate: 12.02,
    weeklyHours: 35,
    actorName: 'Mario Carvalho',
    actorRole: 'admin',
    nowIso: '2026-10-23T11:00:00Z',
    simulateMidWayFailure: true,
  });
  assert.equal(rolledBack.ok, false);
  assert.equal(rolledBack.newEmployee, undefined);

  const committed = executeTransactionalOnboarding({
    candidate,
    existingEmployees: [baseEmployee],
    trainingModules: modules,
    firstShiftDate: '2026-10-26',
    firstShiftStart: '09:00',
    firstShiftEnd: '16:00',
    hourlyRate: 12.02,
    weeklyHours: 35,
    actorName: 'Mario Carvalho',
    actorRole: 'admin',
    nowIso: '2026-10-23T11:00:00Z',
  });
  assert.equal(committed.ok, true);
  assert.equal(committed.newEmployee?.pinCode.length, 4);
  assert.equal(committed.newEmployee?.monthlyGrossEur, 1823.03);
  assert.equal(committed.newEmployee?.monthlySubscriptionsTarget, 20);
  assert.equal(committed.newDocuments?.length, 2);
  assert.equal(
    committed.newDocuments?.[0].contractBodyText?.includes(CFITNESS_LEGAL_IDENTITY.siret),
    true
  );
});

test('v1.2 specifications: probation notice periods, recrutement@c.fitness parser, and official CDI contract clauses', () => {
  const noticeUnder8d = computeProbationNoticePeriod('2026-10-19', '2026-10-23', false);
  assert.equal(noticeUnder8d.employerNoticeDelayLabel.includes('24 heures'), true);

  const noticeUnder1m = computeProbationNoticePeriod('2026-10-01', '2026-10-23', false);
  assert.equal(noticeUnder1m.employerNoticeDelayLabel.includes('48 heures'), true);

  const noticeBetween1And3m = computeProbationNoticePeriod('2026-09-01', '2026-10-23', false);
  assert.equal(noticeBetween1And3m.employerNoticeDelayLabel.includes('2 semaines'), true);

  const parsedEmail = parseRecruitmentEmailPayload({
    senderLine: 'Lucas Garnier <lucas.garnier@mail.fr>',
    subjectLine: 'Candidature Conseiller Commercial Beynost',
    bodyText: 'Bonjour, voici mon CV. Tel: 06 58 41 29 70.',
    attachmentPdf: 'CV_Lucas_Garnier.pdf',
  });
  assert.equal(parsedEmail.firstName, 'Lucas');
  assert.equal(parsedEmail.lastName, 'Garnier');
  assert.equal(parsedEmail.email, 'lucas.garnier@mail.fr');
  assert.equal(parsedEmail.phone, '06 58 41 29 70');
  assert.equal(parsedEmail.clubId, 'beynost');
  assert.equal(parsedEmail.rgpdAutoReplyText.includes('recrutement@c.fitness'), true);

  const contractText = generateOfficialCdiContractText({
    firstName: 'Lucas',
    lastName: 'Garnier',
    email: 'lucas.garnier@mail.fr',
    phone: '06 58 41 29 70',
    jobTitle: 'Conseiller Commercial Fitness',
    clubId: 'carre-de-soie',
    startDate: '2026-10-26',
  });
  assert.equal(contractText.includes('818 651 317 00018'), true);
  assert.equal(contractText.includes('827000002188207761'), true);
  assert.equal(contractText.includes('20 abonnements mensuels'), true);
  assert.equal(
    contractText.includes('TOUTE ACTION COMMERCIALE NON TRACÉE DANS LE CRM C.FITNESS OS EST JURIDIQUEMENT RÉPUTÉE NON RÉALISÉE'),
    true
  );
});

test('Silae payroll calculation, formatters, and CRM guards work accurately', () => {
  const shifts: Shift[] = [
    {
      id: 'sh-1',
      employeeId: 'emp-1',
      clubId: 'carre-de-soie',
      date: '2026-10-25',
      startTime: '09:00',
      endTime: '17:30',
      breakMinutes: 30,
      roleLabel: 'Permanence Dimanche',
      published: true,
    },
  ];
  const rows = computePayrollVariables([baseEmployee], shifts);
  assert.equal(rows[0].sundayHours, 8);
  const csv = generateSilaeCsv(rows, '2026-10');
  assert.equal(csv.includes('CDS_VAULX;2026-10;8.00;0.00;8.00'), true);
  assert.equal(formatPointageType('arrivee'), 'Arrivée');
  assert.equal(formatLeaveStatus('en_attente'), 'En attente de validation');

  const prospects: Prospect[] = [
    {
      id: 'p1',
      firstName: 'Claire',
      lastName: 'Dupont',
      phone: '06 11 22 33 44',
      email: 'claire@mail.fr',
      clubId: 'beynost',
      source: 'Site c.fitness',
      stage: 'Nouveau',
      assignedToId: 'emp-1',
      rgpdConsent: true,
      bloctelListed: true,
      smsStopOptOut: true,
      retryCount: 0,
      goal: 'Remise en forme',
      notes: '',
      createdAt: '2026-10-22',
    },
  ];
  assert.ok(findDuplicateProspect(prospects, '0611223344', 'other@mail.fr'));
  assert.equal(canSendProspectSms(prospects[0]).allowed, false);
  assert.equal(canCallProspectProspection(prospects[0]).allowed, false);
  assert.equal(canAccessFeature('commercial', 'finances_payroll'), false);
  assert.equal(canAccessFeature('admin', 'finances_payroll'), true);
  assert.equal(canAccessFeature('coach', 'inbody_health_data'), true);
  assert.equal(canAccessFeature('commercial', 'inbody_health_data'), false);
  assert.equal(formatClubName('carre-de-soie'), 'Carré de Soie');
  assert.equal(formatClubName('carre-de-soie', true), 'CDS');
  assert.equal(formatClubName('beynost', true), 'BEY');
  assert.equal(isSectionAllowedForRole('governance', 'admin'), true);
  assert.equal(isSectionAllowedForRole('governance', 'commercial'), false);
  assert.equal(isSectionAllowedForRole('crm', 'coach'), false);
});

test('Multi-device backup envelope checksum and power-outage failover merge preserve offline club activity', () => {
  assert.equal(INITIAL_BACKUP_REPLICAS.length, 6);
  const checksumA = computeSnapshotChecksum('{"clubs":2,"members":6}');
  const checksumB = computeSnapshotChecksum('{"clubs":2,"members":6}');
  const checksumC = computeSnapshotChecksum('{"clubs":2,"members":7}');
  assert.equal(checksumA, checksumB);
  assert.notEqual(checksumA, checksumC);
  assert.equal(checksumA.startsWith('CFOS-SHA-'), true);

  const primaryState = {
    heitzMembers: [
      {
        id: 'm-1',
        badgeCode: 'HZ-9012',
        firstName: 'Camille',
        lastName: 'Roux',
        phone: '06 44 11 22 33',
        homeClubId: 'beynost' as const,
        subscriptionName: 'Formule Liberté',
        activeSubscription: true,
        finBalanceEur: -39.9,
        finBalanceState: 0 as const,
        technogymMoves30d: 2400,
        daysSinceLastWorkout: 3,
      },
    ],
    employees: [baseEmployee],
    prospects: [],
    shifts: [],
    timeEntries: [],
    offlinePointageQueue: [],
    accessEvents: [],
    callLogs: [],
    auditLogs: [],
  };

  const envelope = buildBackupEnvelope(
    primaryState,
    'Tablette Kiosque Accueil Beynost',
    'coupure_courant_bascule_active',
    '2026-10-23T14:00:00Z'
  );
  assert.equal(envelope.schemaVersion, 'cfos-replica-v1.2');
  assert.equal(envelope.counts.members, 1);

  // Simulate actions performed on a backup PC/Tablet/Phone during server power outage
  const replicaDuringOutage = {
    ...primaryState,
    heitzMembers: [
      {
        ...primaryState.heitzMembers[0],
        finBalanceEur: 0,
        finBalanceState: 1 as const,
      },
    ],
    offlinePointageQueue: [
      {
        id: 'te-offline-1',
        employeeId: 'emp-1',
        clubId: 'beynost' as const,
        timestamp: '2026-10-23T14:05:00Z',
        type: 'arrivee' as const,
        source: 'tablette_pin' as const,
        syncedFromOffline: true,
      },
    ],
    accessEvents: [
      {
        id: 'acc-offline-1',
        clubId: 'beynost' as const,
        memberId: 'm-1',
        memberName: 'Camille Roux',
        homeClubId: 'beynost' as const,
        timestamp: '2026-10-23T14:06:00Z',
        latencyMs: 12,
        granted: true,
        reason: 'Validé sur appareil de secours',
        smsRelanceSent: false,
        qrTokenGenerated: 'HZ-SEC-01',
      },
    ],
  };

  const merged = mergeFailoverSnapshot(primaryState, replicaDuringOutage);
  assert.equal(merged.stats.addedPunches, 1);
  assert.equal(merged.stats.addedAccessEvents, 1);
  assert.equal(merged.stats.regularisedMembers, 1);
  assert.equal(merged.mergedState.timeEntries.length, 1);
  assert.equal(merged.mergedState.offlinePointageQueue.length, 0);
  assert.equal(merged.mergedState.heitzMembers[0].finBalanceEur, 0);
});

