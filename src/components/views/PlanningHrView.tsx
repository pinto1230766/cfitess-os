import React, { useState } from 'react';
import { useCfos } from '../../context/CfosContext';
import {
  FileText,
  Download,
  ShieldCheck,
  AlertTriangle,
  Plus,
  CheckCircle2,
  XCircle,
  FileSignature,
  Scale,
  Eye,
  Trash2,
  Unlock,
  CalendarPlus,
  ChevronLeft,
  ChevronRight,
  Clock,
  Users,
  Coffee,
  Building2,
  Printer,
  Check,
  Sparkles,
  ExternalLink,
  Layers,
  Send,
} from 'lucide-react';
import {
  ClubId,
  LeaveRequest,
  PointageType,
  Shift,
  UnifiedEventCategory,
  UnifiedEventSource,
} from '../../types/cfos';
import {
  CFITNESS_LEGAL_IDENTITY,
  buildSilaeApiPayload,
  buildUnifiedPlanningEvents,
  computePayrollVariables,
  computeProbationNoticePeriod,
  evaluateShiftCompliance,
  formatClubName,
  formatLeaveStatus,
  formatPointageType,
  generateOfficialCdiContractText,
  generateSilaeCsv,
} from '../../domain/rules';
import { ContractPreviewModal } from '../ContractPreviewModal';

function computeNetShiftHours(startTime: string, endTime: string, breakMinutes: number): number {
  const [sh, sm] = startTime.split(':').map(Number);
  const [eh, em] = endTime.split(':').map(Number);
  const totalMinutes = Math.max(0, eh * 60 + em - (sh * 60 + sm) - breakMinutes);
  return Math.round((totalMinutes / 60) * 100) / 100;
}

const WEEK_DATES = [
  { date: '2026-10-19', label: 'Lun. 19 oct.', short: 'Lun 19/10' },
  { date: '2026-10-20', label: 'Mar. 20 oct.', short: 'Mar 20/10' },
  { date: '2026-10-21', label: 'Mer. 21 oct.', short: 'Mer 21/10' },
  { date: '2026-10-22', label: 'Jeu. 22 oct.', short: 'Jeu 22/10' },
  { date: '2026-10-23', label: 'Ven. 23 oct.', short: 'Ven 23/10' },
  { date: '2026-10-24', label: 'Sam. 24 oct.', short: 'Sam 24/10' },
  { date: '2026-10-25', label: 'Dim. 25 oct.', short: 'Dim 25/10' },
];

function getSkelloShiftBlockStyle(roleLabel: string, clubId: ClubId): {
  card: string;
  pill: string;
  tagText: string;
} {
  const lower = roleLabel.toLowerCase();
  if (
    lower.includes('coach') ||
    lower.includes('plateau') ||
    lower.includes('bilan') ||
    lower.includes('cours')
  ) {
    return {
      card: 'bg-emerald-50 border border-emerald-200 text-emerald-950',
      pill: 'bg-emerald-600 text-white',
      tagText: 'Coaching / Plateau',
    };
  }
  if (lower.includes('direction') || lower.includes('pilotage') || lower.includes('audit')) {
    return {
      card: 'bg-slate-100 border border-slate-300 text-slate-900',
      pill: 'bg-slate-800 text-white',
      tagText: 'Direction',
    };
  }
  if (lower.includes('bpjeps') || lower.includes('alternance')) {
    return {
      card: 'bg-sky-50 border border-sky-200 text-sky-950',
      pill: 'bg-sky-600 text-white',
      tagText: 'Alternant BPJEPS',
    };
  }
  return clubId === 'carre-de-soie'
    ? {
        card: 'bg-orange-50 border border-orange-200 text-slate-900',
        pill: 'bg-orange-600 text-white',
        tagText: 'Accueil & Vente',
      }
    : {
        card: 'bg-blue-50 border border-blue-200 text-slate-900',
        pill: 'bg-blue-600 text-white',
        tagText: 'Accueil & Vente',
      };
}

export function PlanningHrView() {
  const {
    clubFilter,
    setClubFilter,
    employees,
    shifts,
    timeEntries,
    leaveRequests,
    hrDocuments,
    addShift,
    deleteShift,
    punchWithPin,
    decideLeaveRequest,
    submitLeaveRequest,
    signHrDocument,
    unlockEmployeePin,
    unifiedExternalEvents,
    createOrUpdateExternalPlanningEvent,
    deleteExternalPlanningEvent,
    openMywellnessLink,
    setActiveSection,
  } = useCfos();

  const [subTab, setSubTab] = useState<
    'PLANNING' | 'POINTAGES' | 'CONGES' | 'SILAE'
  >('PLANNING');

  // Add Shift Drawer / Form state
  const [showShiftCreator, setShowShiftCreator] = useState<boolean>(false);
  const [showUnifiedEventModal, setShowUnifiedEventModal] = useState<boolean>(false);
  const [sourceFilter, setSourceFilter] = useState<'ALL' | UnifiedEventSource>('ALL');

  // Unified multi-source appointment creation/edit form (Heitz / Mywellness / Internal)
  const [extSourceSystem, setExtSourceSystem] = useState<UnifiedEventSource>('heitz_api');
  const [extCategory, setExtCategory] = useState<UnifiedEventCategory>('RDV Heitz');
  const [extSourceId, setExtSourceId] = useState<string>('HZ-RDV-5509');
  const [extTitle, setExtTitle] = useState<string>('RDV Bilan Technogym Checkup + Séance Découverte');
  const [extParticipant, setExtParticipant] = useState<string>('Amélie Garnier');
  const [extMywellnessId, setExtMywellnessId] = useState<string>('mw-amelie-garnier');
  const [extEmpId, setExtEmpId] = useState<string>('emp-maxime');
  const [extClubId, setExtClubId] = useState<ClubId>('carre-de-soie');
  const [extDate, setExtDate] = useState<string>('2026-10-24');
  const [extStart, setExtStart] = useState<string>('14:00');
  const [extEnd, setExtEnd] = useState<string>('15:00');

  // Silae integration mode (CSV export immediately active + API REST ready for accountant confirmation)
  const [silaeIntegrationMode, setSilaeIntegrationMode] = useState<'EXPORT_CSV' | 'API_REST'>('EXPORT_CSV');

  const [empId, setEmpId] = useState(employees[2]?.id || 'emp-maxime');
  const [date, setDate] = useState<string>('2026-10-24');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');
  const [breakMinutes, setBreakMinutes] = useState(60);
  const [shiftClub, setShiftClub] = useState<ClubId>('carre-de-soie');
  const [roleLabel, setRoleLabel] = useState('Accueil & Vente');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');

  // Skello Badgeuse Simulator state
  const [kioskEmpId, setKioskEmpId] = useState<string>('emp-maxime');
  const [kioskPin, setKioskPin] = useState<string>('3310');
  const [kioskClub, setKioskClub] = useState<ClubId>('carre-de-soie');

  // Leave request creation state (Skello / Lucca style)
  const [leaveEmpId, setLeaveEmpId] = useState('emp-maxime');
  const [leaveType, setLeaveType] = useState<LeaveRequest['type']>('CP');
  const [leaveStart, setLeaveStart] = useState('2026-11-02');
  const [leaveEnd, setLeaveEnd] = useState('2026-11-06');
  const [leaveDays, setLeaveDays] = useState(5);
  const [leaveReason, setLeaveReason] = useState('Congés payés Toussaint');

  // Silae selected employee for live payslip preview
  const [selectedSilaeEmpId, setSelectedSilaeEmpId] = useState<string>('emp-maxime');

  // Contract Generator / Viewer state
  const [selectedContractEmpId, setSelectedContractEmpId] = useState<string>('emp-maxime');
  const [modalContractText, setModalContractText] = useState<string | null>(null);
  const [feedbackBanner, setFeedbackBanner] = useState<string | null>(null);

  const filteredEmployees = employees.filter((e) => {
    if (e.role === 'kiosque') return false;
    if (clubFilter !== 'all' && e.clubId !== clubFilter) return false;
    if (roleFilter !== 'ALL' && e.role !== roleFilter) return false;
    return true;
  });

  const previewShift: Shift = {
    id: 'preview-shift',
    employeeId: empId,
    clubId: shiftClub,
    date,
    startTime,
    endTime,
    breakMinutes,
    roleLabel,
    published: true,
  };

  const allViolations = evaluateShiftCompliance([...shifts, previewShift]);
  const previewViolations = allViolations.filter((v) => v.shiftId === 'preview-shift');
  const existingScheduleViolations = evaluateShiftCompliance(shifts);

  const payrollRows = computePayrollVariables(employees, shifts);
  const silaeCsvText = generateSilaeCsv(payrollRows, '2026-10');
  const silaeApiPayload = buildSilaeApiPayload(payrollRows, '2026-10', 'API_REST_SILAE');
  const allUnifiedEvents = buildUnifiedPlanningEvents(shifts, unifiedExternalEvents);

  const selectedSilaeRow =
    payrollRows.find((r) => r.employeeId === selectedSilaeEmpId) || payrollRows[0];
  const selectedSilaeEmp =
    employees.find((e) => e.id === selectedSilaeRow?.employeeId) || employees[0];

  const selectedContractEmployee =
    employees.find((e) => e.id === selectedContractEmpId) || employees[2] || employees[0];

  const liveContractText = generateOfficialCdiContractText({
    firstName: selectedContractEmployee.firstName,
    lastName: selectedContractEmployee.lastName,
    email: selectedContractEmployee.email,
    phone: selectedContractEmployee.phone,
    jobTitle: selectedContractEmployee.jobTitle,
    clubId: selectedContractEmployee.clubId,
    startDate: selectedContractEmployee.hireDate,
    monthlyGrossEur:
      selectedContractEmployee.monthlyGrossEur ?? CFITNESS_LEGAL_IDENTITY.salaireBrutMensuelEur,
  });

  // Total KPIs for Skello bottom bar
  const totalPlannedHours = filteredEmployees.reduce((sum, emp) => {
    const empShifts = shifts.filter((s) => s.employeeId === emp.id);
    return (
      sum +
      empShifts.reduce(
        (acc, s) => acc + computeNetShiftHours(s.startTime, s.endTime, s.breakMinutes),
        0
      )
    );
  }, 0);

  const totalEstimatedGrossEur = Math.round(totalPlannedHours * 12.02 * 1.42);
  const pendingLeavesCount = leaveRequests.filter((l) => l.status === 'en_attente').length;

  const handleAddShift = (e: React.FormEvent) => {
    e.preventDefault();
    addShift({
      employeeId: empId,
      clubId: shiftClub,
      date,
      startTime,
      endTime,
      breakMinutes,
      roleLabel,
      published: true,
    });
    setFeedbackBanner(
      `Shift ${startTime}–${endTime} (${roleLabel}) publié sur le planning Skello C.Fitness.`
    );
  };

  const handleQuickCellClick = (targetEmpId: string, targetDate: string, defaultClub: ClubId) => {
    setEmpId(targetEmpId);
    setDate(targetDate);
    setShiftClub(defaultClub);
    setShowShiftCreator(true);
  };

  const handleCreateLeave = (e: React.FormEvent) => {
    e.preventDefault();
    const emp = employees.find((item) => item.id === leaveEmpId);
    submitLeaveRequest({
      employeeId: leaveEmpId,
      clubId: emp?.clubId || 'carre-de-soie',
      type: leaveType,
      startDate: leaveStart,
      endDate: leaveEnd,
      daysCount: leaveDays,
    });
    setFeedbackBanner(
      `Demande d'absence Skello (${leaveType} · ${leaveDays}j) enregistrée et soumise à validation.`
    );
  };

  const handleQuickPunch = (type: PointageType) => {
    const res = punchWithPin(kioskClub, kioskEmpId, kioskPin, type);
    setFeedbackBanner(res.message);
  };

  const triggerTestViolation = () => {
    setEmpId('emp-karim');
    setDate('2026-10-23');
    setStartTime('06:00');
    setEndTime('19:30');
    setBreakMinutes(15);
  };

  const handleDownloadSilae = () => {
    const blob = new Blob([silaeCsvText], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'EXPORT_PAIE_SILAE_CFITNESS_2026_10.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      {/* ===================================================================== */}
      {/* EN-TÊTE UNIFIÉ C.FITNESS OS — PLANNING, POINTEUSE & PAIE              */}
      {/* ===================================================================== */}
      <div className="rounded-xl overflow-hidden border border-slate-200 shadow-xs bg-white">
        <div className="bg-slate-900 text-white px-5 py-4 flex flex-col xl:flex-row xl:items-center xl:justify-between gap-3">
          <div className="flex flex-wrap items-center gap-4">
            <div className="pr-4 border-r border-slate-800">
              <div className="text-[11px] font-bold uppercase tracking-wider text-orange-400">
                03 · L’Espace Planning &amp; RH
              </div>
              <h2 className="font-black text-lg tracking-tight text-white">
                Planning Équipes, Pointeuse &amp; Export Paie
              </h2>
              <div className="text-xs text-slate-400">
                Convention Collective Nationale du Sport (IDCC 2511) · SAS C.FITNESS
              </div>
            </div>

            {/* Onglets principaux */}
            <nav className="flex flex-wrap items-center gap-1.5">
              {[
                { id: 'PLANNING', label: '1. Planning Semaine' },
                { id: 'POINTAGES', label: `2. La Pointeuse (${timeEntries.length})` },
                {
                  id: 'CONGES',
                  label: `3. Absences & CP (${leaveRequests.length})`,
                  badge: pendingLeavesCount > 0 ? pendingLeavesCount : undefined,
                },
                { id: 'SILAE', label: '4. Export Paie Silae' },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setSubTab(t.id as typeof subTab)}
                  className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer ${
                    subTab === t.id
                      ? 'bg-orange-600 text-white shadow-2xs'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
                  }`}
                >
                  <span>{t.label}</span>
                  {t.badge !== undefined && (
                    <span className="px-1.5 py-0.5 rounded bg-amber-400 text-slate-950 font-mono text-[10px] font-bold">
                      {t.badge}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setActiveSection('ats')}
              className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              <FileSignature className="w-3.5 h-3.5 text-emerald-400" />
              <span>Contrats &amp; Signatures →</span>
            </button>
          </div>
        </div>

        {/* Skello Sub-Toolbar: Week Date Picker + Role Filters + Legend */}
        <div className="bg-slate-50 border-b border-slate-200 px-4 py-2.5 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            {/* Skello Week Selector */}
            <div className="inline-flex items-center bg-white border border-slate-200 rounded-lg px-2 py-1 shadow-2xs">
              <button
                type="button"
                onClick={() =>
                  setFeedbackBanner('Semaine de référence active : Semaine 43 (19 au 25 oct. 2026)')
                }
                className="p-1 hover:bg-slate-100 rounded text-slate-600 cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <span className="px-3 font-bold text-slate-900 font-mono text-xs">
                Semaine 43 · 19 oct. – 25 oct. 2026
              </span>
              <button
                type="button"
                onClick={() =>
                  setFeedbackBanner('Semaine de référence active : Semaine 43 (19 au 25 oct. 2026)')
                }
                className="p-1 hover:bg-slate-100 rounded text-slate-600 cursor-pointer"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Filter by Role (Skello Position Filter) */}
            <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg p-1">
              {[
                { id: 'ALL', label: 'Toutes les équipes' },
                { id: 'commercial', label: 'Accueil & Vente' },
                { id: 'coach', label: 'Coachs Fitness' },
                { id: 'apprenti', label: 'Alternants BPJEPS' },
                { id: 'admin', label: 'Direction' },
              ].map((rf) => (
                <button
                  key={rf.id}
                  onClick={() => setRoleFilter(rf.id)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-semibold cursor-pointer ${
                    roleFilter === rf.id
                      ? 'bg-[#1B2559] text-white'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {rf.label}
                </button>
              ))}
            </div>
          </div>

          {/* Right Legend & Add Shift Toggle */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="hidden sm:flex items-center gap-2 text-[11px] mr-2">
              <span className="inline-flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-xs bg-orange-500 inline-block" />
                Accueil/Vente CDS
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-xs bg-blue-600 inline-block" />
                Accueil/Vente BEY
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-xs bg-emerald-500 inline-block" />
                Plateau &amp; Checkup
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-xs bg-sky-500 inline-block" />
                Alternant BPJEPS
              </span>
            </div>

            {subTab === 'PLANNING' && (
              <button
                type="button"
                onClick={() => {
                  setShowShiftCreator(!showShiftCreator);
                  setShowUnifiedEventModal(false);
                }}
                className="px-3.5 py-1.5 rounded-lg bg-[#4318FF] hover:bg-[#3611d4] text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer whitespace-nowrap shadow-2xs"
              >
                <Plus className="w-3.5 h-3.5" />
                {showShiftCreator ? 'Fermer l’éditeur' : '+ Planifier un créneau'}
              </button>
            )}
          </div>
        </div>

        {/* Multi-Source Layer Filter Bar (RH + Mywellness + Heitz + Interne without duplication) */}
        {subTab === 'PLANNING' && (
          <div className="bg-indigo-950/95 text-white px-4 py-2 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[10px] font-mono uppercase tracking-wider text-sky-300 mr-1">
                Calques Planning Centralisé (Sans Duplication) :
              </span>
              {[
                { id: 'ALL', label: `Tout afficher (${allUnifiedEvents.length})` },
                { id: 'cfitness_rh', label: `Horaires RH (${shifts.length})` },
                {
                  id: 'mywellness_api',
                  label: `Cours & Checkup Mywellness (${
                    unifiedExternalEvents.filter((e) => e.originSystem === 'mywellness_api').length
                  })`,
                },
                {
                  id: 'heitz_api',
                  label: `RDV Heitz System (${
                    unifiedExternalEvents.filter((e) => e.originSystem === 'heitz_api').length
                  })`,
                },
                {
                  id: 'interne_club',
                  label: `Événements Internes (${
                    unifiedExternalEvents.filter((e) => e.originSystem === 'interne_club').length
                  })`,
                },
              ].map((layer) => (
                <button
                  key={layer.id}
                  type="button"
                  onClick={() => setSourceFilter(layer.id as typeof sourceFilter)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-bold cursor-pointer transition-colors ${
                    sourceFilter === layer.id
                      ? 'bg-[#00C48C] text-slate-950'
                      : 'bg-white/10 text-slate-200 hover:bg-white/20'
                  }`}
                >
                  {layer.label}
                </button>
              ))}
            </div>
            <span className="text-[10px] text-slate-300 font-mono">
              Remplacement Skello · Synchronisation bidirectionnelle API Heitz &amp; Technogym Mywellness
            </span>
          </div>
        )}

        {/* Drawer to Create or Modify a Heitz / Mywellness / Internal Event directly from C.Fitness OS */}
        {subTab === 'PLANNING' && showUnifiedEventModal && (
          <div className="p-4 bg-slate-900 text-white border-b border-slate-700">
            <div className="flex items-center justify-between mb-3">
              <div>
                <span className="text-[10px] font-mono uppercase text-amber-400 font-bold">
                  Écriture Bidirectionnelle API (Zéro Duplication)
                </span>
                <h3 className="text-sm font-bold">
                  Créer ou modifier un RDV Heitz, un Cours/Checkup Mywellness ou un Événement Interne
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowUnifiedEventModal(false)}
                className="text-xs text-slate-300 underline cursor-pointer"
              >
                Fermer
              </button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                createOrUpdateExternalPlanningEvent({
                  externalSourceId: extSourceId.trim() || `EXT-${Date.now()}`,
                  originSystem: extSourceSystem,
                  category: extCategory,
                  title: extTitle,
                  subtitle:
                    extSourceSystem === 'heitz_api'
                      ? 'Synchronisé API Heitz System'
                      : extSourceSystem === 'mywellness_api'
                      ? 'Synchronisé API Technogym Mywellness'
                      : 'Événement Interne C.Fitness OS',
                  clubId: extClubId,
                  employeeId: extEmpId,
                  date: extDate,
                  startTime: extStart,
                  endTime: extEnd,
                  participantName: extParticipant || undefined,
                  mywellnessMemberId: extMywellnessId || undefined,
                  locationLabel: formatClubName(extClubId, false),
                  writableViaApi: true,
                });
                setShowUnifiedEventModal(false);
              }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-2.5 text-xs"
            >
              <div>
                <label className="block text-[10px] text-slate-300 mb-1">Logiciel d&apos;origine</label>
                <select
                  value={extSourceSystem}
                  onChange={(e) => {
                    const val = e.target.value as UnifiedEventSource;
                    setExtSourceSystem(val);
                    if (val === 'heitz_api') {
                      setExtCategory('RDV Heitz');
                      setExtSourceId('HZ-RDV-5509');
                    } else if (val === 'mywellness_api') {
                      setExtCategory('Bilan Technogym Checkup');
                      setExtSourceId('MW-CHK-8810');
                    } else {
                      setExtCategory('Événement Interne');
                      setExtSourceId('INT-EVT-905');
                    }
                  }}
                  className="w-full px-2.5 py-1.5 rounded bg-slate-800 border border-slate-600 text-white"
                >
                  <option value="heitz_api">API Heitz System (RDV)</option>
                  <option value="mywellness_api">API Technogym Mywellness</option>
                  <option value="interne_club">Événement Interne Club</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] text-slate-300 mb-1">ID Externe (Anti-Doublon)</label>
                <input
                  type="text"
                  value={extSourceId}
                  onChange={(e) => setExtSourceId(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded bg-slate-800 border border-slate-600 font-mono text-amber-300"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-[10px] text-slate-300 mb-1">Intitulé du RDV / Cours</label>
                <input
                  type="text"
                  value={extTitle}
                  onChange={(e) => setExtTitle(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded bg-slate-800 border border-slate-600 text-white"
                />
              </div>
              <div>
                <label className="block text-[10px] text-slate-300 mb-1">Collaborateur &amp; Jour</label>
                <div className="flex gap-1">
                  <select
                    value={extEmpId}
                    onChange={(e) => setExtEmpId(e.target.value)}
                    className="w-1/2 px-1.5 py-1.5 rounded bg-slate-800 border border-slate-600 text-white"
                  >
                    {filteredEmployees.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.firstName}
                      </option>
                    ))}
                  </select>
                  <select
                    value={extDate}
                    onChange={(e) => setExtDate(e.target.value)}
                    className="w-1/2 px-1.5 py-1.5 rounded bg-slate-800 border border-slate-600 text-white font-mono"
                  >
                    {WEEK_DATES.map((d) => (
                      <option key={d.date} value={d.date}>
                        {d.short}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex items-end gap-1.5">
                <div className="flex-1">
                  <label className="block text-[10px] text-slate-300 mb-1">Horaire</label>
                  <div className="flex gap-1">
                    <input
                      type="time"
                      value={extStart}
                      onChange={(e) => setExtStart(e.target.value)}
                      className="w-1/2 px-1 py-1.5 rounded bg-slate-800 border border-slate-600 font-mono text-[11px]"
                    />
                    <input
                      type="time"
                      value={extEnd}
                      onChange={(e) => setExtEnd(e.target.value)}
                      className="w-1/2 px-1 py-1.5 rounded bg-slate-800 border border-slate-600 font-mono text-[11px]"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded bg-[#00C48C] hover:bg-[#00b07d] text-slate-950 font-extrabold cursor-pointer shrink-0"
                >
                  Sync API
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Feedback / Alert Banners inside the Skello Workspace */}
        {feedbackBanner && (
          <div className="px-4 py-2.5 bg-emerald-50 border-b border-emerald-200 text-xs text-emerald-950 flex items-center justify-between gap-3">
            <span className="font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              {feedbackBanner}
            </span>
            <button
              onClick={() => setFeedbackBanner(null)}
              className="text-emerald-800 underline font-semibold cursor-pointer"
            >
              Fermer
            </button>
          </div>
        )}

        {existingScheduleViolations.length > 0 && (
          <div className="px-4 py-2.5 bg-amber-50 border-b border-amber-300 text-xs text-amber-950 space-y-1">
            <div className="font-bold flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              Alerte Légale Skello — Convention Collective du Sport (IDCC 2511) :
            </div>
            {existingScheduleViolations.map((v, i) => (
              <div key={i}>
                • [{v.code}] {v.message}
              </div>
            ))}
          </div>
        )}

        {/* ===================================================================== */}
        {/* TAB 1: AUTHENTIC SKELLO WEEKLY PLANNING GRID                          */}
        {/* ===================================================================== */}
        {subTab === 'PLANNING' && (
          <div>
            <div className="grid grid-cols-1 lg:grid-cols-12">
              {/* Left/Center: Authentic Skello Matrix Grid */}
              <div
                className={`${
                  showShiftCreator ? 'lg:col-span-9' : 'lg:col-span-12'
                } overflow-x-auto border-r border-slate-200`}
              >
                <table className="w-full text-left border-collapse min-w-[880px]">
                  <thead>
                    <tr className="bg-slate-100/90 border-b border-slate-200 text-[11px] text-slate-600">
                      <th className="py-3 px-3.5 w-60 border-r border-slate-200 font-bold uppercase tracking-wider text-slate-700">
                        <div className="flex items-center justify-between">
                          <span>Salariés ({filteredEmployees.length})</span>
                          <span className="font-mono text-[10px] text-slate-500">Contrat 35h</span>
                        </div>
                      </th>
                      {WEEK_DATES.map((d) => {
                        const dayShifts = shifts.filter(
                          (s) =>
                            s.date === d.date &&
                            filteredEmployees.some((e) => e.id === s.employeeId)
                        );
                        const dayHours = dayShifts.reduce(
                          (acc, s) =>
                            acc + computeNetShiftHours(s.startTime, s.endTime, s.breakMinutes),
                          0
                        );
                        return (
                          <th
                            key={d.date}
                            className="py-2.5 px-2 border-r border-slate-200 last:border-r-0 min-w-[118px]"
                          >
                            <div className="font-bold text-slate-900">{d.label}</div>
                            <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 mt-0.5 tabular-nums">
                              <span>{dayShifts.length} shifts</span>
                              <span className="font-semibold text-slate-700">
                                {dayHours.toFixed(1)}h
                              </span>
                            </div>
                          </th>
                        );
                      })}
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-200 text-xs">
                    {filteredEmployees.map((emp) => {
                      const empShifts = shifts.filter((s) => s.employeeId === emp.id);
                      const plannedHours = empShifts.reduce(
                        (acc, s) =>
                          acc + computeNetShiftHours(s.startTime, s.endTime, s.breakMinutes),
                        0
                      );
                      const hoursDelta =
                        Math.round((plannedHours - emp.weeklyContractHours) * 10) / 10;
                      const initials = `${emp.firstName[0] || ''}${emp.lastName[0] || ''}`;

                      return (
                        <tr key={emp.id} className="hover:bg-slate-50/60 transition-colors">
                          {/* Skello Employee Cell with Avatar, Contract Pill & Counters */}
                          <td className="p-3 align-top border-r border-slate-200 bg-white">
                            <div className="flex items-start gap-2.5">
                              <div className="w-8 h-8 rounded-full bg-[#1B2559] text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                                {initials}
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="font-bold text-slate-900 truncate">
                                  {emp.firstName} {emp.lastName}
                                </div>
                                <div className="text-[11px] text-slate-500 truncate">
                                  {emp.jobTitle}
                                </div>

                                {/* Skello Contract & Club Badges */}
                                <div className="mt-1.5 flex flex-wrap items-center gap-1">
                                  <span className="px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-800 border border-indigo-200 font-semibold text-[10px]">
                                    {emp.contractType} {emp.weeklyContractHours}h
                                  </span>
                                  <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-mono text-[10px]">
                                    {emp.clubId === 'carre-de-soie' ? 'CDS' : 'BEY'}
                                  </span>
                                </div>

                                {/* Skello Hours & Leave Counter Bar */}
                                <div className="mt-2 pt-1.5 border-t border-slate-100 flex items-center justify-between text-[10px] font-mono tabular-nums">
                                  <span
                                    className={`px-1.5 py-0.5 rounded font-bold ${
                                      hoursDelta > 0
                                        ? 'bg-amber-100 text-amber-900'
                                        : hoursDelta === 0
                                        ? 'bg-emerald-100 text-emerald-900'
                                        : 'bg-slate-100 text-slate-700'
                                    }`}
                                  >
                                    ⏱ {plannedHours.toFixed(1)}h / {emp.weeklyContractHours}h
                                    {hoursDelta > 0 ? ` (+${hoursDelta}h)` : ''}
                                  </span>
                                  <span className="text-slate-500">
                                    CP {emp.cpBalance}j · RTT {emp.rttBalance}j
                                  </span>
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* 7 Day Cells (Showing both RH Shifts + Mywellness Courses/Checkup + Heitz RDVs + Internal Events) */}
                          {WEEK_DATES.map((d) => {
                            const showRhShifts =
                              sourceFilter === 'ALL' || sourceFilter === 'cfitness_rh';
                            const dayShifts = showRhShifts
                              ? empShifts.filter((s) => s.date === d.date)
                              : [];
                            const dayExternalEvents = unifiedExternalEvents.filter(
                              (ev) =>
                                ev.employeeId === emp.id &&
                                ev.date === d.date &&
                                (sourceFilter === 'ALL' || ev.originSystem === sourceFilter)
                            );
                            const empLeave = leaveRequests.find(
                              (lv) =>
                                lv.employeeId === emp.id &&
                                lv.status === 'valide' &&
                                d.date >= lv.startDate &&
                                d.date <= lv.endDate
                            );

                            return (
                              <td
                                key={d.date}
                                className="p-1.5 align-top border-r border-slate-200 last:border-r-0 bg-slate-50/20"
                              >
                                {empLeave ? (
                                  <div className="p-2 rounded-md bg-purple-50 border border-purple-200 border-l-4 border-l-purple-500 text-[11px] text-purple-900">
                                    <div className="font-bold">🏖 Absence {empLeave.type}</div>
                                    <div className="text-[10px] text-purple-700">
                                      Validé · Journée entière
                                    </div>
                                  </div>
                                ) : dayShifts.length === 0 && dayExternalEvents.length === 0 ? (
                                  <button
                                    type="button"
                                    onClick={() => handleQuickCellClick(emp.id, d.date, emp.clubId)}
                                    className="w-full h-16 rounded-md border border-dashed border-transparent hover:border-slate-300 hover:bg-white text-slate-300 hover:text-slate-600 flex flex-col items-center justify-center gap-0.5 transition-all cursor-pointer group"
                                    title="Cliquer pour planifier un créneau sur ce jour"
                                  >
                                    <span className="text-[10px] font-medium group-hover:hidden">
                                      Repos
                                    </span>
                                    <span className="hidden group-hover:inline-flex items-center gap-1 text-[10px] font-semibold text-[#4318FF]">
                                      <Plus className="w-3 h-3" /> Shift
                                    </span>
                                  </button>
                                ) : (
                                  <div className="space-y-1.5">
                                    {dayShifts.map((s) => {
                                      const st = getSkelloShiftBlockStyle(s.roleLabel, s.clubId);
                                      const netH = computeNetShiftHours(
                                        s.startTime,
                                        s.endTime,
                                        s.breakMinutes
                                      );
                                      return (
                                        <div
                                          key={s.id}
                                          className={`p-2 rounded-md text-[11px] shadow-2xs transition-transform ${st.card}`}
                                        >
                                          <div className="flex items-center justify-between gap-1">
                                            <span className="font-mono font-extrabold text-xs tabular-nums">
                                              {s.startTime} - {s.endTime}
                                            </span>
                                            <button
                                              type="button"
                                              onClick={() => deleteShift(s.id)}
                                              title="Supprimer ce shift RH"
                                              className="text-slate-400 hover:text-rose-600 cursor-pointer p-0.5"
                                            >
                                              <Trash2 className="w-3 h-3" />
                                            </button>
                                          </div>

                                          <div className="mt-1">
                                            <span
                                              className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wide ${st.pill}`}
                                            >
                                              {st.tagText}
                                            </span>
                                          </div>

                                          <div className="font-medium text-[10px] truncate mt-1 opacity-90">
                                            {s.roleLabel}
                                          </div>

                                          <div className="mt-1 pt-1 border-t border-black/5 flex items-center justify-between text-[10px] font-mono opacity-80 tabular-nums">
                                            <span className="inline-flex items-center gap-0.5">
                                              <Coffee className="w-2.5 h-2.5" />
                                              {s.breakMinutes}m
                                            </span>
                                            <span className="font-bold">
                                              {netH}h ({s.clubId === 'carre-de-soie' ? 'CDS' : 'BEY'})
                                            </span>
                                          </div>
                                        </div>
                                      );
                                    })}

                                    {/* Synchronized Mywellness Courses / Checkup, Heitz RDVs & Internal Events */}
                                    {dayExternalEvents.map((ev) => {
                                      const badgeStyle =
                                        ev.originSystem === 'mywellness_api'
                                          ? 'bg-amber-950 text-amber-200 border-l-4 border-l-amber-400'
                                          : ev.originSystem === 'heitz_api'
                                          ? 'bg-sky-950 text-sky-100 border-l-4 border-l-sky-400'
                                          : 'bg-slate-800 text-slate-100 border-l-4 border-l-emerald-400';
                                      return (
                                        <div
                                          key={ev.id}
                                          className={`p-2 rounded-md text-[10px] shadow-2xs space-y-1 ${badgeStyle}`}
                                        >
                                          <div className="flex items-center justify-between gap-1">
                                            <span className="font-mono font-bold text-white">
                                              {ev.startTime} - {ev.endTime}
                                            </span>
                                            <button
                                              type="button"
                                              onClick={() => deleteExternalPlanningEvent(ev.id)}
                                              className="text-slate-400 hover:text-rose-300 cursor-pointer"
                                              title="Retirer du planning"
                                            >
                                              <Trash2 className="w-2.5 h-2.5" />
                                            </button>
                                          </div>
                                          <div className="flex items-center justify-between gap-1">
                                            <span className="px-1.5 py-0.2 rounded bg-white/15 text-[8px] font-black uppercase">
                                              {ev.originSystem === 'mywellness_api'
                                                ? 'MYWELLNESS'
                                                : ev.originSystem === 'heitz_api'
                                                ? 'RDV HEITZ'
                                                : 'INTERNE'}
                                            </span>
                                            <span className="font-mono text-[8px] opacity-75">
                                              {ev.externalSourceId}
                                            </span>
                                          </div>
                                          <div className="font-bold text-white leading-tight">
                                            {ev.title}
                                          </div>
                                          {ev.mywellnessMemberId && (
                                            <button
                                              type="button"
                                              onClick={() =>
                                                openMywellnessLink({
                                                  mywellnessMemberId: ev.mywellnessMemberId,
                                                  personName: ev.participantName,
                                                  clubId: ev.clubId,
                                                })
                                              }
                                              className="w-full mt-1 py-0.5 px-1.5 rounded bg-amber-400 text-slate-950 font-bold text-[9px] flex items-center justify-center gap-1 cursor-pointer"
                                            >
                                              <ExternalLink className="w-2.5 h-2.5" />
                                              Ouvrir Mywellness
                                            </button>
                                          )}
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Right Drawer: Skello Shift Creator + IDCC 2511 Live Legal Engine */}
              {showShiftCreator && (
                <div className="lg:col-span-3 bg-slate-50/70 p-4 space-y-4">
                  <div className="space-y-2 border-b border-slate-200 pb-2.5">
                    <div className="flex items-center justify-between">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-[#4318FF]">
                        Planification Unifiée
                      </div>
                      <button
                        type="button"
                        onClick={triggerTestViolation}
                        className="text-[10px] font-semibold text-rose-600 hover:text-rose-700 underline cursor-pointer"
                      >
                        Simuler dépassement &gt;10h
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-1 p-0.5 rounded-lg bg-slate-200/80 text-[11px]">
                      <button
                        type="button"
                        onClick={() => setShowUnifiedEventModal(false)}
                        className="py-1 px-2 rounded-md bg-white text-slate-900 font-bold shadow-2xs cursor-pointer"
                      >
                        Horaire RH
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowUnifiedEventModal(true);
                          setShowShiftCreator(false);
                        }}
                        className="py-1 px-2 rounded-md text-slate-600 hover:text-slate-900 font-semibold cursor-pointer"
                      >
                        RDV Heitz / Mywellness
                      </button>
                    </div>
                  </div>

                  <form onSubmit={handleAddShift} className="space-y-3 text-xs">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Salarié</label>
                      <select
                        value={empId}
                        onChange={(e) => setEmpId(e.target.value)}
                        className="w-full px-2.5 py-2 rounded-lg border border-slate-200 bg-white font-medium"
                      >
                        {employees
                          .filter((e) => e.role !== 'kiosque')
                          .map((e) => (
                            <option key={e.id} value={e.id}>
                              {e.firstName} {e.lastName} ({e.contractType} · {e.weeklyContractHours}h)
                            </option>
                          ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Jour</label>
                        <select
                          value={date}
                          onChange={(e) => setDate(e.target.value)}
                          className="w-full px-2.5 py-2 rounded-lg border border-slate-200 bg-white"
                        >
                          {WEEK_DATES.map((d) => (
                            <option key={d.date} value={d.date}>
                              {d.short}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">
                          Établissement
                        </label>
                        <select
                          value={shiftClub}
                          onChange={(e) => setShiftClub(e.target.value as ClubId)}
                          className="w-full px-2.5 py-2 rounded-lg border border-slate-200 bg-white"
                        >
                          <option value="carre-de-soie">Carré de Soie</option>
                          <option value="beynost">Beynost</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Début</label>
                        <input
                          type="time"
                          value={startTime}
                          onChange={(e) => setStartTime(e.target.value)}
                          className="w-full px-2 py-1.5 rounded-lg border border-slate-200 bg-white font-mono"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Fin</label>
                        <input
                          type="time"
                          value={endTime}
                          onChange={(e) => setEndTime(e.target.value)}
                          className="w-full px-2 py-1.5 rounded-lg border border-slate-200 bg-white font-mono"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Pause (m)</label>
                        <input
                          type="number"
                          min={0}
                          max={180}
                          value={breakMinutes}
                          onChange={(e) => setBreakMinutes(Number(e.target.value))}
                          className="w-full px-2 py-1.5 rounded-lg border border-slate-200 bg-white font-mono"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Poste Skello (Étiquette Couleur)
                      </label>
                      <select
                        value={roleLabel}
                        onChange={(e) => setRoleLabel(e.target.value)}
                        className="w-full px-2.5 py-2 rounded-lg border border-slate-200 bg-white"
                      >
                        <option value="Accueil & Vente">Accueil &amp; Vente (Commercial)</option>
                        <option value="Relances CRM & Accueil">Relances CRM &amp; Accueil</option>
                        <option value="Plateau & Bilans Technogym Checkup">
                          Plateau &amp; Bilans Technogym Checkup (Coach)
                        </option>
                        <option value="Cours Collectifs & Suivi">
                          Cours Collectifs &amp; Suivi (Coach)
                        </option>
                        <option value="Plateau Musculation (Alternance BPJEPS)">
                          Plateau Musculation (Alternance BPJEPS)
                        </option>
                        <option value="Direction & Pilotage">Direction &amp; Pilotage</option>
                      </select>
                    </div>

                    {/* Live IDCC 2511 Validation Box */}
                    <div
                      className={`p-3 rounded-lg border text-[11px] space-y-1 ${
                        previewViolations.length === 0
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                          : 'bg-rose-50 border-rose-300 text-rose-950'
                      }`}
                    >
                      <div className="font-bold flex items-center gap-1.5">
                        {previewViolations.length === 0 ? (
                          <>
                            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                            <span>Shift conforme IDCC 2511 (Sport)</span>
                          </>
                        ) : (
                          <>
                            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                            <span>Alerte Convention du Sport IDCC 2511</span>
                          </>
                        )}
                      </div>
                      {previewViolations.length === 0 ? (
                        <div className="text-[10px] text-emerald-800">
                          Durée nette :{' '}
                          <span className="font-mono font-bold">
                            {computeNetShiftHours(startTime, endTime, breakMinutes)}h
                          </span>{' '}
                          · Amplitude &le; 12h · Pause respectée.
                        </div>
                      ) : (
                        previewViolations.map((v, i) => (
                          <div key={i} className="text-rose-800">
                            • {v.message}
                          </div>
                        ))
                      )}
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 rounded-lg bg-[#4318FF] hover:bg-[#3611d4] text-white font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                    >
                      <Plus className="w-4 h-4" />
                      Ajouter au planning Skello
                    </button>
                  </form>
                </div>
              )}
            </div>

            {/* Authentic Skello Bottom Sticky KPI Footer ("Indicateurs de pilotage") */}
            <div className="bg-[#1B2559] text-white px-4 py-3 border-t border-slate-300 flex flex-wrap items-center justify-between gap-4 text-xs">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-white/10 font-mono text-[10px] uppercase tracking-wider text-sky-300">
                  Indicateurs Skello Semaine 43
                </span>
                <span className="text-slate-300 hidden sm:inline">
                  Synthèse temps réel des heures planifiées et masse salariale chargée
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-5 font-mono tabular-nums">
                <div>
                  <span className="text-slate-400 text-[11px]">Heures planifiées : </span>
                  <span className="font-bold text-white">{totalPlannedHours.toFixed(1)} h</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[11px]">Coût chargé estimé : </span>
                  <span className="font-bold text-emerald-400">
                    {totalEstimatedGrossEur.toLocaleString('fr-FR')} €
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 text-[11px]">Taux Horaire Gr. 1 : </span>
                  <span className="font-bold text-white">12,02 € brut/h</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[11px]">Conformité IDCC 2511 : </span>
                  <span
                    className={`font-bold ${
                      existingScheduleViolations.length === 0
                        ? 'text-emerald-400'
                        : 'text-amber-400'
                    }`}
                  >
                    {existingScheduleViolations.length === 0
                      ? '100% Conforme'
                      : `${existingScheduleViolations.length} alerte(s)`}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ===================================================================== */}
        {/* TAB 2: LA POINTEUSE SKELLO (Badgeuse iPad PIN + Feuille d'Émargement) */}
        {/* ===================================================================== */}
        {subTab === 'POINTAGES' && (
          <div className="p-5 grid grid-cols-1 lg:grid-cols-12 gap-6 bg-slate-50/50">
            {/* Left: Authentic Skello Tablet Timeclock Simulator ("La Pointeuse Skello") */}
            <div className="lg:col-span-5 bg-[#1B2559] text-white rounded-2xl p-5 shadow-md flex flex-col justify-between space-y-4 border-4 border-slate-800">
              <div className="flex items-center justify-between border-b border-white/15 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-[#00C48C] text-slate-950 font-black flex items-center justify-center text-sm">
                    S
                  </div>
                  <div>
                    <div className="text-xs font-extrabold tracking-wide">
                      LA POINTEUSE SKELLO
                    </div>
                    <div className="text-[10px] text-slate-300">
                      Borne Tactile PoE RJ45 · Anti-Bruteforce 3 essais
                    </div>
                  </div>
                </div>
                <span className="font-mono text-sm font-bold text-[#00C48C] tabular-nums">
                  {new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] text-slate-300 mb-1">
                      Borne d&apos;accueil
                    </label>
                    <select
                      value={kioskClub}
                      onChange={(e) => setKioskClub(e.target.value as ClubId)}
                      className="w-full px-2.5 py-2 rounded-lg bg-[#2B3674] border border-white/15 text-white font-semibold"
                    >
                      <option value="carre-de-soie">Carré de Soie</option>
                      <option value="beynost">Beynost</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-300 mb-1">Collaborateur</label>
                    <select
                      value={kioskEmpId}
                      onChange={(e) => {
                        const target = employees.find((emp) => emp.id === e.target.value);
                        setKioskEmpId(e.target.value);
                        if (target) setKioskPin(target.pinCode);
                      }}
                      className="w-full px-2.5 py-2 rounded-lg bg-[#2B3674] border border-white/15 text-white font-semibold"
                    >
                      {filteredEmployees.map((e) => (
                        <option key={e.id} value={e.id}>
                          {e.firstName} {e.lastName}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] text-slate-300 mb-1">
                    Code PIN personnel (4 chiffres)
                  </label>
                  <input
                    type="text"
                    maxLength={4}
                    value={kioskPin}
                    onChange={(e) => setKioskPin(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950/60 border border-white/20 text-center font-mono text-lg font-black tracking-[0.5em] text-[#00C48C]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => handleQuickPunch('arrivee')}
                    className="py-2.5 px-3 rounded-xl bg-[#00C48C] hover:bg-[#00b07d] text-slate-950 font-extrabold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Clock className="w-3.5 h-3.5" />
                    Pointer Arrivée
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickPunch('debut_pause')}
                    className="py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Coffee className="w-3.5 h-3.5" />
                    Début Pause
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickPunch('fin_pause')}
                    className="py-2.5 px-3 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Clock className="w-3.5 h-3.5" />
                    Fin de Pause
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickPunch('depart')}
                    className="py-2.5 px-3 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Pointer Départ
                  </button>
                </div>
              </div>

              {/* Manager PIN Reset Strip */}
              <div className="pt-3 border-t border-white/15 space-y-2">
                <div className="text-[11px] font-bold text-slate-300">
                  Codes PIN Collaborateurs &amp; Déverrouillage Manager :
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-40 overflow-y-auto pr-1">
                  {filteredEmployees.map((emp) => (
                    <div
                      key={emp.id}
                      className="px-2.5 py-1.5 rounded-lg bg-[#2B3674] flex items-center justify-between text-[11px]"
                    >
                      <div>
                        <div className="font-bold text-white truncate">
                          {emp.firstName} {emp.lastName[0]}.
                        </div>
                        <div className="font-mono text-[10px] text-slate-300">
                          PIN: {emp.pinCode} ({emp.failedPinAttempts}/5)
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          unlockEmployeePin(emp.id);
                          setFeedbackBanner(
                            `PIN Kiosque réinitialisé pour ${emp.firstName} ${emp.lastName}.`
                          );
                        }}
                        className="px-2 py-1 rounded bg-white/10 hover:bg-white/20 text-[#00C48C] font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        <Unlock className="w-3 h-3" />
                        Reset
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Skello Feuille d'Émargement (Planifié vs Réel Pointé) */}
            <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    Feuille d&apos;Émargement Skello — Heures Planifiées vs Pointées
                  </h2>
                  <p className="text-xs text-slate-500">
                    Comparaison automatique entre le shift prévu sur Skello et l&apos;horodatage PIN sur la tablette d&apos;accueil.
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
                  {timeEntries.length} pointages horodatés
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-[11px] font-bold uppercase text-slate-500">
                      <th className="py-2.5 pr-3">Salarié</th>
                      <th className="py-2.5 px-3">Établissement</th>
                      <th className="py-2.5 px-3">Action Badgeuse</th>
                      <th className="py-2.5 px-3">Horodatage Pointé</th>
                      <th className="py-2.5 pl-3 text-right">Statut Synchro</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {timeEntries.map((pt) => {
                      const emp = employees.find((e) => e.id === pt.employeeId);
                      return (
                        <tr key={pt.id} className="hover:bg-slate-50">
                          <td className="py-2.5 pr-3 font-bold text-slate-900">
                            {emp ? `${emp.firstName} ${emp.lastName}` : pt.employeeId}
                          </td>
                          <td className="py-2.5 px-3 text-slate-600">
                            {formatClubName(pt.clubId, true)}
                          </td>
                          <td className="py-2.5 px-3">
                            <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-900 font-semibold text-[11px]">
                              {formatPointageType(pt.type)}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 font-mono font-bold text-slate-900 tabular-nums">
                            {pt.timestamp.slice(0, 16).replace('T', ' ')}
                          </td>
                          <td className="py-2.5 pl-3 text-right">
                            <span className="text-[11px] font-semibold text-emerald-700">
                              {pt.syncedFromOffline ? 'Resynchronisé (IndexedDB)' : 'Temps réel OK'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ===================================================================== */}
        {/* TAB 3: DEMANDES D'ABSENCES & COMPTEURS CP/RTT (Style Skello RH)       */}
        {/* ===================================================================== */}
        {subTab === 'CONGES' && (
          <div className="p-5 grid grid-cols-1 lg:grid-cols-12 gap-6 bg-slate-50/50">
            <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-5">
              <h2 className="text-base font-bold text-slate-900 mb-4">
                Validation des Demandes d&apos;Absence Skello (CP, RTT, Maladie, CFA BPJEPS)
              </h2>
              <div className="divide-y divide-slate-100 text-xs">
                {leaveRequests.map((lv) => {
                  const emp = employees.find((e) => e.id === lv.employeeId);
                  return (
                    <div
                      key={lv.id}
                      className="py-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                    >
                      <div>
                        <div className="font-bold text-slate-900">
                          {emp ? `${emp.firstName} ${emp.lastName}` : lv.employeeId} ·{' '}
                          <span className="text-[#4318FF]">{lv.type}</span>
                        </div>
                        <div className="text-slate-600 mt-0.5">
                          Du <span className="font-mono font-semibold">{lv.startDate}</span> au{' '}
                          <span className="font-mono font-semibold">{lv.endDate}</span> (
                          {lv.daysCount} jour(s)) · Club {formatClubName(lv.clubId, true)}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {lv.status === 'en_attente' ? (
                          <>
                            <button
                              onClick={() => decideLeaveRequest(lv.id, 'valide')}
                              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold flex items-center gap-1 cursor-pointer"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Valider
                            </button>
                            <button
                              onClick={() => decideLeaveRequest(lv.id, 'refuse')}
                              className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-semibold flex items-center gap-1 cursor-pointer"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              Refuser
                            </button>
                          </>
                        ) : (
                          <span
                            className={`font-semibold ${
                              lv.status === 'valide' ? 'text-emerald-700' : 'text-rose-600'
                            }`}
                          >
                            Statut : {formatLeaveStatus(lv.status)}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-5 space-y-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <CalendarPlus className="w-4 h-4 text-[#4318FF]" />
                Poser une Absence sur le Planning Skello
              </h3>
              <form onSubmit={handleCreateLeave} className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Salarié</label>
                  <select
                    value={leaveEmpId}
                    onChange={(e) => setLeaveEmpId(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
                  >
                    {filteredEmployees.map((e) => (
                      <option key={e.id} value={e.id}>
                        {e.firstName} {e.lastName} (CP: {e.cpBalance}j · RTT: {e.rttBalance}j)
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Motif d&apos;absence
                    </label>
                    <select
                      value={leaveType}
                      onChange={(e) => setLeaveType(e.target.value as LeaveRequest['type'])}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
                    >
                      <option value="CP">Congés Payés (CP)</option>
                      <option value="RTT">RTT</option>
                      <option value="Maladie">Arrêt Maladie</option>
                      <option value="Formation CFA">Formation CFA (BPJEPS)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Jours ouvrés</label>
                    <input
                      type="number"
                      min={1}
                      max={30}
                      value={leaveDays}
                      onChange={(e) => setLeaveDays(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 font-mono"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Date début</label>
                    <input
                      type="date"
                      value={leaveStart}
                      onChange={(e) => setLeaveStart(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Date fin</label>
                    <input
                      type="date"
                      value={leaveEnd}
                      onChange={(e) => setLeaveEnd(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 font-mono"
                    />
                  </div>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Commentaire RH</label>
                  <input
                    type="text"
                    value={leaveReason}
                    onChange={(e) => setLeaveReason(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-lg bg-[#1B2559] hover:bg-[#2B3674] text-white font-semibold cursor-pointer"
                >
                  Enregistrer l&apos;absence sur Skello
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ===================================================================== */}
        {/* TAB 4: AUTHENTIC SILAE PAYROLL MATRIX & BULLETIN PREVIEW              */}
        {/* ===================================================================== */}
        {subTab === 'SILAE' && (
          <div className="bg-slate-100 p-4 space-y-4">
            {/* Authentic Silae Enterprise Header */}
            <div className="bg-[#0F4C5C] text-white rounded-lg px-4 py-3 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="px-2.5 py-1 rounded bg-white text-[#0F4C5C] font-black text-xs tracking-wider">
                  SILAE PAIE (CONSERVÉ)
                </div>
                <div>
                  <div className="text-xs font-bold">
                    Dossier #081865 — SAS C.FITNESS · SIRET {CFITNESS_LEGAL_IDENTITY.siret} · IDCC 2511 (Sport)
                  </div>
                  <div className="text-[11px] text-teal-100">
                    Transmission des Éléments Variables (EV) depuis le module RH C.Fitness OS (remplaçant Skello) : Export CSV compatible actif + Connecteur API REST prêt pour l&apos;expert-comptable.
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <div className="inline-flex items-center bg-white/10 p-0.5 rounded-lg text-xs">
                  <button
                    type="button"
                    onClick={() => setSilaeIntegrationMode('EXPORT_CSV')}
                    className={`px-2.5 py-1 rounded-md font-bold cursor-pointer ${
                      silaeIntegrationMode === 'EXPORT_CSV'
                        ? 'bg-white text-[#0F4C5C]'
                        : 'text-white hover:bg-white/10'
                    }`}
                  >
                    Format .CSV
                  </button>
                  <button
                    type="button"
                    onClick={() => setSilaeIntegrationMode('API_REST')}
                    className={`px-2.5 py-1 rounded-md font-bold cursor-pointer ${
                      silaeIntegrationMode === 'API_REST'
                        ? 'bg-white text-[#0F4C5C]'
                        : 'text-white hover:bg-white/10'
                    }`}
                  >
                    Flux API REST
                  </button>
                </div>
                <button
                  onClick={handleDownloadSilae}
                  className="px-3.5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-extrabold flex items-center gap-1.5 cursor-pointer shrink-0 whitespace-nowrap"
                >
                  <Download className="w-4 h-4" />
                  Exporter vers Silae (.CSV)
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              {/* Left 7 cols: Silae Accounting Matrix (Grille EV) */}
              <div className="lg:col-span-7 bg-white border border-slate-300 rounded-lg overflow-hidden">
                <div className="bg-slate-800 text-white px-3.5 py-2 text-xs font-bold flex items-center justify-between">
                  <span>Matrice des Variables de Paie Silae (Remplacement direct de l&apos;export Skello)</span>
                  <span className="font-mono text-[11px] text-teal-300">Base 151,67h / mois</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-100 border-b border-slate-300 text-[10px] font-bold uppercase text-slate-600">
                        <th className="py-2.5 px-3">Matricule / Salarié</th>
                        <th className="py-2.5 px-2 text-right">H. Planifiées</th>
                        <th className="py-2.5 px-2 text-right">HS 25% (Rub. 110)</th>
                        <th className="py-2.5 px-2 text-right">Dimanche (IDCC)</th>
                        <th className="py-2.5 px-3 text-right">Brut Estimé</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 font-mono text-[11px] tabular-nums">
                      {payrollRows.map((r) => {
                        const isSelected = selectedSilaeRow?.employeeId === r.employeeId;
                        const empObj = employees.find((e) => e.id === r.employeeId);
                        return (
                          <tr
                            key={r.employeeId}
                            onClick={() => setSelectedSilaeEmpId(r.employeeId)}
                            className={`cursor-pointer transition-colors ${
                              isSelected ? 'bg-teal-50/90 font-bold' : 'hover:bg-slate-50'
                            }`}
                          >
                            <td className="py-2.5 px-3 font-sans">
                              <div className="font-bold text-slate-900 flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                                <span className="font-mono text-[10px] text-slate-500">
                                  {r.matricule}
                                </span>
                                <span>{r.fullName}</span>
                              </div>
                              <div className="text-[10px] text-slate-500">
                                {empObj ? `${empObj.contractType} · ${empObj.jobTitle}` : 'CDI'}
                              </div>
                            </td>
                            <td className="py-2.5 px-2 text-right text-slate-800">
                              {r.normalHours} h
                            </td>
                            <td className="py-2.5 px-2 text-right text-amber-700 font-bold">
                              +{r.overtime25Hours} h
                            </td>
                            <td className="py-2.5 px-2 text-right text-indigo-700">
                              {r.sundayHours} h
                            </td>
                            <td className="py-2.5 px-3 text-right font-bold text-emerald-800">
                              {(1823.03 + r.grossVariableEstimateEur).toFixed(2)} €
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="p-3 bg-slate-900 text-slate-200 font-mono text-[11px] border-t border-slate-700">
                  <div className="text-[10px] uppercase text-teal-400 font-bold mb-1">
                    {silaeIntegrationMode === 'EXPORT_CSV'
                      ? 'Mode 1 (Actif) — Fichier .CSV Compatible Silae (Format identique à Skello) :'
                      : 'Mode 2 (Prêt Expert-Comptable) — Requête JSON API REST Silae (POST /v1/dossiers/081865/elements-variables) :'}
                  </div>
                  <pre className="overflow-x-auto whitespace-pre text-[10px] leading-relaxed max-h-40">
                    {silaeIntegrationMode === 'EXPORT_CSV'
                      ? silaeCsvText
                      : JSON.stringify(silaeApiPayload, null, 2)}
                  </pre>
                </div>
              </div>

              {/* Right 5 cols: Live Silae Bulletin de Paie Clarifié Preview */}
              {selectedSilaeRow && (
                <div className="lg:col-span-5 bg-white border border-slate-300 rounded-lg p-4 space-y-3 text-xs font-mono">
                  <div className="border-b-2 border-slate-900 pb-2 flex items-start justify-between">
                    <div>
                      <div className="font-black text-sm text-slate-900">
                        BULLETIN DE PAIE — SILAE
                      </div>
                      <div className="text-[10px] text-slate-600">
                        Employeur : SAS C.FITNESS · SIRET {CFITNESS_LEGAL_IDENTITY.siret}
                      </div>
                      <div className="text-[10px] text-slate-600">
                        URSSAF Rhône-Alpes : 827000002188207761 · Conv. Sport IDCC 2511
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-slate-900 text-white text-[10px] font-bold">
                      10 / 2026
                    </span>
                  </div>

                  <div className="p-2.5 rounded bg-slate-50 border border-slate-200 text-[11px] space-y-0.5 font-sans">
                    <div className="font-bold text-slate-900">
                      Salarié : {selectedSilaeRow.fullName} ({selectedSilaeRow.matricule})
                    </div>
                    <div className="text-slate-600">
                      Emploi : {selectedSilaeEmp?.jobTitle || 'Conseiller Sportif'} · Classification : Employé Gr. 1
                    </div>
                    <div className="text-slate-600">
                      Horaire mensuel contractuel : 151,67 h (35h/sem) · Taux : 12,02 €/h
                    </div>
                  </div>

                  <table className="w-full text-[11px] border-collapse">
                    <thead>
                      <tr className="border-b border-slate-300 text-slate-500 text-[10px]">
                        <th className="py-1 text-left">Rubrique Silae</th>
                        <th className="py-1 text-right">Base</th>
                        <th className="py-1 text-right">Taux</th>
                        <th className="py-1 text-right">Montant Brut</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 tabular-nums">
                      <tr>
                        <td className="py-1.5">0100 — Salaire de base mensuel</td>
                        <td className="py-1.5 text-right">151,67</td>
                        <td className="py-1.5 text-right">12,0200</td>
                        <td className="py-1.5 text-right font-bold">1 823,03 €</td>
                      </tr>
                      <tr>
                        <td className="py-1.5">0110 — Heures supp. majorées 25%</td>
                        <td className="py-1.5 text-right">{selectedSilaeRow.overtime25Hours}</td>
                        <td className="py-1.5 text-right">15,0250</td>
                        <td className="py-1.5 text-right">
                          {(selectedSilaeRow.overtime25Hours * 15.025).toFixed(2)} €
                        </td>
                      </tr>
                      <tr>
                        <td className="py-1.5">0240 — Majoration Dimanche IDCC 2511</td>
                        <td className="py-1.5 text-right">{selectedSilaeRow.sundayHours}</td>
                        <td className="py-1.5 text-right">6,0100</td>
                        <td className="py-1.5 text-right">
                          {(selectedSilaeRow.sundayHours * 6.01).toFixed(2)} €
                        </td>
                      </tr>
                      <tr className="bg-slate-50 font-bold">
                        <td className="py-2" colSpan={3}>
                          TOTAL BRUT MENSUEL
                        </td>
                        <td className="py-2 text-right text-emerald-700">
                          {(1823.03 + selectedSilaeRow.grossVariableEstimateEur).toFixed(2)} €
                        </td>
                      </tr>
                      <tr>
                        <td className="py-1.5 text-slate-500" colSpan={3}>
                          Cotisations sociales (URSSAF / APICIL / Prévoyance ~22%)
                        </td>
                        <td className="py-1.5 text-right text-slate-600">
                          -{((1823.03 + selectedSilaeRow.grossVariableEstimateEur) * 0.22).toFixed(2)} €
                        </td>
                      </tr>
                      <tr className="border-t-2 border-slate-900 font-black text-xs">
                        <td className="py-2" colSpan={3}>
                          NET À PAYER AVANT IMPÔT (Virement SEPA)
                        </td>
                        <td className="py-2 text-right text-slate-900">
                          {((1823.03 + selectedSilaeRow.grossVariableEstimateEur) * 0.78).toFixed(2)} €
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modal Preview for Official C.FITNESS CDI Contract */}
      <ContractPreviewModal
        contractText={modalContractText}
        onClose={() => setModalContractText(null)}
      />
    </div>
  );
}

