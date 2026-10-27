import React from 'react';
import { useCfos } from '../../context/CfosContext';
import {
  PhoneCall,
  Users,
  Calendar,
  ShieldAlert,
  TrendingUp,
  Building2,
  ArrowUpRight,
  Lock,
  Smartphone,
  Tablet,
  CheckCircle2,
  Layers,
  Sun,
  Dumbbell,
  ExternalLink,
  FileSignature,
  BrainCircuit,
  Wrench,
} from 'lucide-react';
import { LEGACY_SOFTWARE_PARITY_MATRIX, computeHeitzKpiSummary } from '../../domain/rules';
import { AdminSection } from '../../types/cfos';
import { MywellnessQuickConnect } from '../MywellnessQuickConnect';

const SAAS_REPLACED_COMPARISON = [
  {
    tool: 'Ringover Business + Onoff + Surcoûts SIP (12 lignes)',
    annualCostBeforeEur: 8640,
    replacedBy: 'M2 · Téléphonie WebRTC Asterisk + Trunk SIP Fixe 04 OVHcloud + Passerelle 4G Yeastar (07)',
  },
  {
    tool: 'Skello Premium (2 établissements — Conservons uniquement Silae)',
    annualCostBeforeEur: 4560,
    replacedBy: 'M4 · Planning Centralisé Multi-Sources + Badgeuse PIN + Export CSV / API Silae',
  },
  {
    tool: 'Logiciel LEADS & Licences CRM / SharePoint Terrain',
    annualCostBeforeEur: 2760,
    replacedBy: 'M1 & M5 · CRM Acquisition (connecté API Heitz RFID/BT) + Espace « Ma Journée »',
  },
  {
    tool: 'Abonnements Signature Électronique Externe (Yousign / DocuSign)',
    annualCostBeforeEur: 2160,
    replacedBy: 'M6 · Signature Électronique Interne C.Fitness OS (0 € / signature · OTP + Preuve SHA-256)',
  },
];

export function DashboardView() {
  const {
    clubs,
    clubFilter,
    setClubFilter,
    currentUser,
    prospects,
    phoneLines,
    shifts,
    heitzMembers,
    heitzKpiTickets,
    accessEvents,
    callLogs,
    checklists,
    auditLogs,
    sipTrunkProvider,
    setActiveSection,
    setShellMode,
    openMywellnessLink,
  } = useCfos();

  const [pilotageTab, setPilotageTab] = React.useState<'synthese' | 'parite_roi' | 'architecture_ia'>('synthese');

  const filterByClub = <T extends { clubId: string }>(items: T[]) =>
    clubFilter === 'all' ? items : items.filter((item) => item.clubId === clubFilter);

  const clubProspects = filterByClub(prospects);
  const clubLines = filterByClub(phoneLines);
  const clubShifts = filterByClub(shifts);
  const clubMembers = heitzMembers.filter((m) =>
    clubFilter === 'all' ? true : m.homeClubId === clubFilter
  );
  const clubCalls = filterByClub(callLogs);
  const clubChecklists = filterByClub(checklists);

  const newLeadsCount = clubProspects.filter((p) => p.stage === 'Nouveau').length;
  const scheduledTrialsCount = clubProspects.filter((p) => p.stage === 'Séance planifiée').length;
  const convertedCount = clubProspects.filter((p) => p.stage === 'Adhérent').length;
  const conversionRate =
    clubProspects.length > 0 ? Math.round((convertedCount / clubProspects.length) * 100) : 0;

  const activeLinesCount = clubLines.filter((l) => l.activeAgentId !== null).length;
  const unpaidCount = clubMembers.filter((m) => m.finBalanceEur < 0).length;
  const inactiveCount = clubMembers.filter((m) => m.daysSinceLastWorkout >= 15).length;
  const completedChecklistCount = clubChecklists.filter((c) => Boolean(c.checkedBy)).length;

  const totalAnnualSavings = SAAS_REPLACED_COMPARISON.reduce(
    (sum, item) => sum + item.annualCostBeforeEur,
    0
  );

  const heitzKpi = computeHeitzKpiSummary(heitzKpiTickets, clubFilter);
  const clubPassages = filterByClub(accessEvents);

  return (
    <div className="space-y-5">
      {/* Header Banner (2e Plan · Pilotage Bi-Club) */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded bg-slate-900 text-amber-300 text-[10px] font-mono font-bold uppercase tracking-wider">
              <span>2e PLAN · PILOTAGE &amp; DIRECTION BI-CLUB</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1.5">
              Pilotage Unifié Carré de Soie (2 Rue Jacquard) &amp; Beynost (ZAC des Baterses)
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Connecté en tant que{' '}
              <span className="font-semibold text-slate-900">
                {currentUser.firstName} {currentUser.lastName}
              </span>{' '}
              ({currentUser.jobTitle}) · Retour rapide vers le 1er Plan Opérationnel Club à tout moment.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveSection('my-day')}
              className="px-3.5 py-2 rounded-lg bg-[#00C48C] hover:bg-[#00b07d] text-slate-950 text-xs font-extrabold transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap"
            >
              <Sun className="w-3.5 h-3.5" />
              <span>← Retour 1er Plan (Ma Journée)</span>
            </button>
          </div>
        </div>

        {/* Clean 3-Tab Switcher to avoid stacking everything on one page */}
        <div className="mt-5 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => setPilotageTab('synthese')}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${
                pilotageTab === 'synthese'
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              1. Synthèse Opérationnelle des 2 Clubs
            </button>
            <button
              type="button"
              onClick={() => setPilotageTab('parite_roi')}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${
                pilotageTab === 'parite_roi'
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              2. Parité Logiciels (6/6) &amp; Économies SaaS (18 120 €/an)
            </button>
            <button
              type="button"
              onClick={() => setPilotageTab('architecture_ia')}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${
                pilotageTab === 'architecture_ia'
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              3. Architecture Cible, Technogym Checkup &amp; Audit
            </button>
          </div>

          <div className="text-[11px] text-slate-500 font-mono">
            Navigation structurée en 3 volets · Zéro surcharge visuelle
          </div>
        </div>
      </div>

      {/* TAB 1: SYNTHÈSE OPÉRATIONNELLE DES 2 CLUBS */}
      {pilotageTab === 'synthese' && (
        <div className="space-y-5">
          {/* Primary KPI Grid (4 cards max in row, max 3 data points per card) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <div
              onClick={() => setActiveSection('telephony')}
              className="bg-white border border-slate-200 rounded-xl p-5 hover:border-slate-300 transition-colors cursor-pointer"
            >
              <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <span>Téléphonie &amp; Postes (12 lignes)</span>
                <PhoneCall className="w-4 h-4 text-blue-600" />
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl font-bold text-slate-900 tabular-nums">
                  {activeLinesCount} / {clubLines.length}
                </span>
                <span className="text-xs font-medium text-emerald-700">postes actifs</span>
              </div>
              <div className="mt-2 text-xs text-slate-500">
                {clubCalls.length} appels tracés · Trunk{' '}
                {sipTrunkProvider === 'ovhcloud_sip' ? 'OVHcloud SIP (04/07)' : 'OVHcloud Mobile 07'}
              </div>
            </div>

            <div
              onClick={() => setActiveSection('crm')}
              className="bg-white border border-slate-200 rounded-xl p-5 hover:border-slate-300 transition-colors cursor-pointer"
            >
              <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <span>Pipeline CRM (Clause Art. 4)</span>
                <Users className="w-4 h-4 text-orange-600" />
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl font-bold text-slate-900 tabular-nums">
                  {clubProspects.length}
                </span>
                <span className="text-xs font-medium text-orange-600">
                  dont {newLeadsCount} nouveaux
                </span>
              </div>
              <div className="mt-2 text-xs text-slate-500">
                {scheduledTrialsCount} séances · Obj. 20 abos/mois ({conversionRate}% transfo)
              </div>
            </div>

            <div
              onClick={() => setActiveSection('planning-hr')}
              className="bg-white border border-slate-200 rounded-xl p-5 hover:border-slate-300 transition-colors cursor-pointer"
            >
              <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <span>RH &amp; Contrat CDI IDCC 2511</span>
                <Calendar className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl font-bold text-slate-900 tabular-nums">
                  {clubShifts.length}
                </span>
                <span className="text-xs font-medium text-emerald-700">créneaux validés</span>
              </div>
              <div className="mt-2 text-xs text-slate-500">
                1 823,03 € brut (151,67h) · Export Silae prêt
              </div>
            </div>

            <div
              onClick={() => setActiveSection('devices')}
              className="bg-white border border-slate-200 rounded-xl p-5 hover:border-slate-300 transition-colors cursor-pointer"
            >
              <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <span>Passerelle Heitz &amp; Bouclier SEPA</span>
                <ShieldAlert className="w-4 h-4 text-rose-600" />
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl font-bold text-slate-900 tabular-nums">
                  {unpaidCount}
                </span>
                <span className="text-xs font-medium text-rose-600">impayés bloqués</span>
              </div>
              <div className="mt-2 text-xs text-slate-500">
                {inactiveCount} alertes rétention &gt;15j · Latence QR &lt; 50ms
              </div>
            </div>
          </div>

          {/* Two-Column Club Status + Direct Launchers */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            <div className="lg:col-span-6 bg-white border border-slate-200 rounded-xl p-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-orange-600" />
                  État Opérationnel des 2 Établissements C.FITNESS
                </h2>
                <button
                  onClick={() => setActiveSection('academy')}
                  className="text-xs font-semibold text-orange-600 hover:text-orange-700 cursor-pointer"
                >
                  Checklists ({completedChecklistCount}/{clubChecklists.length})
                </button>
              </div>

              <div className="mt-3 space-y-3 text-xs">
                {clubs.map((club) => (
                  <div
                    key={club.id}
                    className="p-3.5 rounded-lg bg-slate-50 border border-slate-200/80"
                  >
                    <div className="flex items-center justify-between font-bold text-slate-900">
                      <span>
                        {club.name} ({club.city})
                      </span>
                      <span className="text-emerald-700 font-semibold tabular-nums">
                        FMI {club.fmiCurrent}/{club.fmiCapacity}
                      </span>
                    </div>
                    <div className="text-slate-600 mt-1">
                      {club.address} · Fixe {club.landline} · VPN {club.wireguardLatencyMs} ms
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-6 bg-white border border-slate-200 rounded-xl p-5 space-y-3">
              <div className="pb-2 border-b border-slate-100">
                <div className="text-[10px] font-mono uppercase tracking-wider text-emerald-700 font-bold">
                  Accès Direct aux Interfaces Terrain (1er Plan)
                </div>
                <h2 className="text-sm font-bold text-slate-900 mt-0.5">
                  Basculer vers les postes opérationnels du club
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <button
                  onClick={() => setActiveSection('my-day')}
                  className="flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/40 transition-colors text-left cursor-pointer"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Sun className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-900 truncate">1. Ma Journée</div>
                      <div className="text-[11px] text-slate-500 truncate">Agenda &amp; Tâches</div>
                    </div>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-slate-400 shrink-0" />
                </button>

                <button
                  onClick={() => setShellMode('employe')}
                  className="flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:border-orange-500 hover:bg-orange-50/40 transition-colors text-left cursor-pointer"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Smartphone className="w-4 h-4 text-orange-600 shrink-0" />
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-900 truncate">2. Le Collaborateur</div>
                      <div className="text-[11px] text-slate-500 truncate">Grille Mobile Skello</div>
                    </div>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-slate-400 shrink-0" />
                </button>

                <button
                  onClick={() => setShellMode('telephone')}
                  className="flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:border-blue-500 hover:bg-blue-50/40 transition-colors text-left cursor-pointer"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <PhoneCall className="w-4 h-4 text-blue-600 shrink-0" />
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-900 truncate">5. Le WebRTC (04/07)</div>
                      <div className="text-[11px] text-slate-500 truncate">Poste OVHcloud SIP</div>
                    </div>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-slate-400 shrink-0" />
                </button>

                <button
                  onClick={() => setShellMode('tablette')}
                  className="flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/40 transition-colors text-left cursor-pointer"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Tablet className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-900 truncate">Tablette Kiosque PIN</div>
                      <div className="text-[11px] text-slate-500 truncate">Badgeuse murale PoE</div>
                    </div>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-slate-400 shrink-0" />
                </button>
              </div>
            </div>
          </div>

          {/* Official Heitz System — FITNESS KPI (2sA35D6jFP) & HZ.WS (SVfMUAnB) Panel */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <div className="text-[10px] font-mono uppercase tracking-wider text-sky-700 font-bold">
                  Documentation Officielle Heitz System · FITNESS KPI (2sA35D6jFP) &amp; HZ.WS (SVfMUAnB)
                </div>
                <h2 className="text-sm sm:text-base font-bold text-slate-900 mt-0.5">
                  Revenus TPV (/api/ticket), Moyens de Paiement (/api/paymentMethod), Passages (/userPassages/browse) &amp; Primes Vendeurs Silae (/api/employee/list)
                </h2>
              </div>
              <span className="px-3 py-1 rounded-full bg-sky-50 border border-sky-200 text-sky-900 font-mono text-xs font-bold">
                {heitzKpi.ticketsCount} tickets KPI · {heitzKpi.totalRevenueTtcEur.toFixed(2)} € TTC
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 text-xs">
              {/* 03 @revenues: /api/ticket + /api/paymentMethod/list */}
              <div className="lg:col-span-5 p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">
                    03 @revenues · Ventilation /api/ticket &amp; /paymentMethod
                  </span>
                  <span className="font-mono text-[11px] text-emerald-700 font-bold">
                    ticketState=1
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                    <div className="text-[10px] text-slate-500 uppercase font-semibold">
                      Abonnements (Cat. 2)
                    </div>
                    <div className="text-base font-extrabold text-slate-900 font-mono tabular-nums mt-0.5">
                      {heitzKpi.subscriptionsRevenueEur.toFixed(2)} €
                    </div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                    <div className="text-[10px] text-slate-500 uppercase font-semibold">
                      Articles &amp; Pass TPV (Cat. 8)
                    </div>
                    <div className="text-base font-extrabold text-slate-900 font-mono tabular-nums mt-0.5">
                      {heitzKpi.tpvArticlesRevenueEur.toFixed(2)} €
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5 pt-1 border-t border-slate-200/80">
                  {heitzKpi.byPaymentMethod.map((pm) => (
                    <div
                      key={pm.method}
                      className="flex items-center justify-between font-mono text-[11px]"
                    >
                      <span className="text-slate-700 font-semibold">
                        {pm.method} ({pm.count})
                      </span>
                      <span className="font-bold text-slate-900 tabular-nums">
                        {pm.totalEur.toFixed(2)} €
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 06 @employees: /api/employee/list <-> idEmpSeller <-> Silae Commissions */}
              <div className="lg:col-span-7 p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-bold text-slate-900">
                    06 @employees (/api/employee/list) &amp; 05 @access_control (/userPassages/browse)
                  </span>
                  <span className="px-2.5 py-0.5 rounded bg-emerald-100 text-emerald-900 font-mono text-[11px] font-bold">
                    Primes Silae : +{heitzKpi.totalSilaeCommissionsEur.toFixed(2)} € · {clubPassages.length} passages tracés
                  </span>
                </div>

                <div className="space-y-2">
                  {heitzKpi.byEmployeeSeller.map((seller) => (
                    <div
                      key={seller.employeeId}
                      className="p-2.5 rounded-lg bg-white border border-slate-200 flex flex-wrap items-center justify-between gap-2"
                    >
                      <div>
                        <div className="font-bold text-slate-900">
                          {seller.sellerName}{' '}
                          <span className="font-mono text-[10px] text-slate-500">
                            (idEmpSeller #{seller.heitzEmployeeId})
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {seller.subscriptionsSold} abonnement(s) ACCESS · {seller.ticketsCount} ticket(s) Heitz
                        </div>
                      </div>
                      <div className="text-right font-mono tabular-nums">
                        <div className="font-bold text-slate-900">
                          CA : {seller.revenueTtcEur.toFixed(2)} €
                        </div>
                        <div className="text-[11px] font-semibold text-emerald-700">
                          Prime Silae : +{seller.silaeCommissionEur.toFixed(2)} €
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PARITÉ LOGICIELS (6/6) & ÉCONOMIES SAAS */}
      {pilotageTab === 'parite_roi' && (
        <div className="space-y-6">
          {/* 100% Legacy Software Visual & Functional Parity Matrix */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2 pb-4 border-b border-slate-100">
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
                  Vérification Parité Fonctionnelle 100 % &amp; Repères Ergonomiques Collaborateurs
                </div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900 mt-0.5 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-orange-600" />
                  Conformité Visuelle &amp; Fonctionnelle avec les Logiciels Actuels du Club
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Chaque brique de C.Fitness OS conserve les repères visuels exacts des logiciels utilisés quotidiennement par l&apos;équipe (Heitz TPV, Ringover, HubSpot/Pipedrive, Skello/Silae, Technogym Checkup &amp; Mywellness, Flatchr/Signature Interne).
                </p>
              </div>
              <span className="px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold shrink-0">
                6 / 6 Logiciels Répliqués à 100 %
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {LEGACY_SOFTWARE_PARITY_MATRIX.map((entry, index) => {
                const headerStyles = [
                  {
                    bg: 'bg-[#1E3A5F]',
                    badge: 'bg-sky-400 text-slate-950',
                    mark: 'H',
                    btn: 'bg-[#1E3A5F] hover:bg-[#152C4A]',
                  },
                  {
                    bg: 'bg-[#141B2D]',
                    badge: 'bg-[#00BFA5] text-slate-950',
                    mark: 'R',
                    btn: 'bg-[#141B2D] hover:bg-slate-800',
                  },
                  {
                    bg: 'bg-[#1F242D]',
                    badge: 'bg-[#017737] text-white',
                    mark: 'p',
                    btn: 'bg-[#017737] hover:bg-[#01632d]',
                  },
                  {
                    bg: 'bg-[#1B2559]',
                    badge: 'bg-[#4318FF] text-white',
                    mark: 'S',
                    btn: 'bg-[#1B2559] hover:bg-[#2B3674]',
                  },
                  {
                    bg: 'bg-[#A6192E]',
                    badge: 'bg-white text-[#A6192E]',
                    mark: 'TC',
                    btn: 'bg-[#A6192E] hover:bg-[#8a1426]',
                  },
                  {
                    bg: 'bg-[#1E3A8A]',
                    badge: 'bg-emerald-400 text-slate-950',
                    mark: 'F',
                    btn: 'bg-[#1E3A8A] hover:bg-[#172e6e]',
                  },
                ][index % 6];

                return (
                  <div
                    key={entry.id}
                    className="rounded-xl border border-slate-300 overflow-hidden flex flex-col justify-between bg-white shadow-2xs hover:border-slate-400 transition-colors"
                  >
                    <div>
                      <div
                        className={`${headerStyles.bg} text-white px-4 py-3 flex items-center justify-between gap-2`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div
                            className={`w-7 h-7 rounded-lg font-black text-xs flex items-center justify-center shrink-0 ${headerStyles.badge}`}
                          >
                            {headerStyles.mark}
                          </div>
                          <div className="min-w-0">
                            <div className="text-[10px] font-mono uppercase opacity-80 truncate">
                              {entry.cfosModuleTitle}
                            </div>
                            <h3 className="text-xs font-extrabold truncate">
                              {entry.legacySoftwareName}
                            </h3>
                          </div>
                        </div>
                        <span className="px-2 py-0.5 rounded bg-white/15 text-white text-[10px] font-mono font-bold shrink-0">
                          {entry.parityScorePct}% Fidèle
                        </span>
                      </div>

                      <div className="p-4 space-y-3">
                        <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-[11px] text-slate-600 space-y-1">
                          <div>
                            <span className="font-semibold text-slate-900">Interface reproduite : </span>
                            {entry.visualCloneDescription}
                          </div>
                          <div className="text-emerald-800 font-semibold">
                            {entry.collaboratorRoutinePreserved}
                          </div>
                        </div>

                        <ul className="space-y-1 text-[11px] text-slate-700">
                          {entry.featuresImplemented.map((fn, i) => (
                            <li key={i} className="flex items-start gap-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                              <span>{fn}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="p-3 pt-0">
                      <button
                        onClick={() => setActiveSection(entry.cfosModuleSection as AdminSection)}
                        className={`w-full py-2 px-3 rounded-lg text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer ${headerStyles.btn}`}
                      >
                        <span>Ouvrir l&apos;interface {entry.legacySoftwareName.split(' ')[0]}</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ROI Annuel & Remplacement SaaS (§10) */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                  Économies Directes &amp; Souveraineté (§10)
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Remplacement intégral de Ringover, Skello, SharePoint et des doublons SaaS sur les 2 clubs
                </p>
              </div>
              <div className="text-left sm:text-right shrink-0">
                <div className="text-lg font-bold text-emerald-700 tabular-nums whitespace-nowrap">
                  {totalAnnualSavings.toLocaleString('fr-FR')}&nbsp;€{' '}
                  <span className="text-xs font-normal text-slate-500 whitespace-nowrap">
                    / an économisés
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 whitespace-nowrap">
                  Soit {(totalAnnualSavings * 3).toLocaleString('fr-FR')}&nbsp;€ sur 3 ans
                </div>
              </div>
            </div>

            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-[11px] font-semibold uppercase text-slate-500">
                    <th className="py-2.5 pr-3">Outil remplacé</th>
                    <th className="py-2.5 px-3">Coût annuel avant</th>
                    <th className="py-2.5 pl-3">Brique C.Fitness OS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {SAAS_REPLACED_COMPARISON.map((item, idx) => (
                    <tr key={idx}>
                      <td className="py-2.5 pr-3 font-semibold text-slate-900">{item.tool}</td>
                      <td className="py-2.5 px-3 text-slate-500 line-through tabular-nums whitespace-nowrap">
                        {item.annualCostBeforeEur.toLocaleString('fr-FR')}&nbsp;€ / an
                      </td>
                      <td className="py-2.5 pl-3 font-medium text-emerald-700">
                        {item.replacedBy}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: ARCHITECTURE CIBLE, TECHNOGYM CHECKUP & AUDIT */}
      {pilotageTab === 'architecture_ia' && (
        <div className="space-y-5">
          {/* Mywellness Quick Connect & Technogym Checkup Live Status Card */}
          <MywellnessQuickConnect variant="card" />

          {/* Director Vision Architecture Banner: Orchestrateur Central + 6 Agents IA + 4e Module Maintenance */}
          <div className="bg-[#071126] text-white rounded-xl p-5 border border-sky-500/40 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 shadow-xs">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-sky-500/20 border border-sky-400/30 text-sky-300 text-[10px] font-mono font-bold uppercase tracking-wider">
                <BrainCircuit className="w-3.5 h-3.5 text-sky-400" />
                <span>Vision Dirigeant C.Fitness OS · Schéma Directeur Intégré</span>
              </div>
              <h2 className="text-base sm:text-lg font-extrabold text-white">
                Orchestrateur Central, 6 Agents IA Métier &amp; 4e Module Maintenance / Gestion Générale
              </h2>
              <p className="text-xs text-slate-300 max-w-3xl">
                Retrouvez l&apos;intégralité de votre architecture cible : <strong>Orchestrateur Central</strong> (avec anti-contradiction et validation humaine 1-clic), <strong>les 6 Agents IA spécialisés</strong> (RH, CRM, Recouvrement, Téléphonie, Maintenance, Pilotage), le <strong>Module Maintenance &amp; Stocks</strong> et la table d&apos;identifiants unifiés <strong>PostgreSQL / Temporal</strong>.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setActiveSection('orchestrator')}
                data-testid="open-orchestrator-vision-btn"
                className="px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-black text-xs flex items-center gap-2 cursor-pointer shadow-xs"
              >
                <BrainCircuit className="w-4 h-4 shrink-0" />
                <span>Ouvrir l&apos;Orchestrateur &amp; les 6 Agents IA</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveSection('orchestrator')}
                className="px-3.5 py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-400/30 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Wrench className="w-4 h-4 shrink-0" />
                <span>Module Maintenance &amp; Stocks</span>
              </button>
            </div>
          </div>

          {/* Strategic Architecture Decision Banner + Audit Log */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            <div className="lg:col-span-7 bg-slate-900 text-white rounded-xl p-5 border border-slate-800 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-400 font-bold">
                  Briques Conservées à Long Terme &amp; Interfacées par API
                </span>
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold text-[10px]">
                  Zéro Redéveloppement Inutile
                </span>
              </div>
              <ul className="space-y-2 text-slate-200">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>Silae (Paie conservée) :</strong> Alimenté par notre module RH via{' '}
                    <strong>Export .CSV compatible immédiat</strong> +{' '}
                    <strong>Connecteur API REST Silae</strong>.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>Heitz System &amp; Lecteurs RFID/Bluetooth :</strong> Contrôle d&apos;accès existant conservé · C.Fitness OS exploite l&apos;<strong>API Heitz</strong> pour les passages adhérents, impayés SEPA et RDV CRM.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>Technogym Mywellness + 2× Stations Technogym Checkup :</strong> Intégrées nativement à Mywellness pour 100 % du suivi sportif.
                  </span>
                </li>
              </ul>
              <div className="pt-2 flex flex-wrap gap-2">
                <button
                  onClick={() => openMywellnessLink({})}
                  className="px-3 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-[11px] flex items-center gap-1.5 cursor-pointer"
                >
                  <Dumbbell className="w-3.5 h-3.5" />
                  <span>Ouvrir Technogym Mywellness Cloud</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
                <button
                  onClick={() => setActiveSection('devices')}
                  className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-semibold text-[11px] cursor-pointer"
                >
                  Voir API Heitz &amp; Technogym Checkup
                </button>
              </div>
            </div>

            <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-slate-700" />
                  Journal d&apos;Audit Immuable (Append-Only)
                </h2>
                <button
                  onClick={() => setActiveSection('governance')}
                  className="text-xs font-semibold text-orange-600 hover:text-orange-700 cursor-pointer"
                >
                  Voir tout ({auditLogs.length})
                </button>
              </div>
              <div className="mt-3 space-y-2.5">
                {auditLogs.slice(0, 4).map((log) => (
                  <div
                    key={log.id}
                    className="text-xs border-b border-slate-100 last:border-0 pb-2 last:pb-0"
                  >
                    <div className="flex items-center justify-between text-slate-500">
                      <span className="font-mono text-[11px] font-semibold text-slate-800">
                        {log.action}
                      </span>
                      <span className="tabular-nums text-[11px]">
                        {log.timestamp.slice(0, 16).replace('T', ' ')}
                      </span>
                    </div>
                    <div className="text-slate-600 mt-0.5">
                      {log.target} — {log.afterState}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

