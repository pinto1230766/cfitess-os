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
} from 'lucide-react';

const SAAS_REPLACED_COMPARISON = [
  {
    tool: 'Ringover Business + Onoff (12 licences)',
    annualCostBeforeEur: 8640,
    replacedBy: 'M2 · Téléphonie WebRTC SIP.js + Pool 04/07 + Whisper GPU Local',
  },
  {
    tool: 'Skello Premium (2 établissements)',
    annualCostBeforeEur: 4560,
    replacedBy: 'M4 · Planning IDCC 2511 + Badgeuse Kiosque PIN + Export Silae',
  },
  {
    tool: 'Microsoft SharePoint & Licences M365 Terrain',
    annualCostBeforeEur: 2760,
    replacedBy: 'M5 · Académie C.Fitness + Livret BPJEPS + Checklists Club',
  },
  {
    tool: 'ATS Recrutement & Parapheur Signature RH',
    annualCostBeforeEur: 2160,
    replacedBy: 'M6 & M4 bis · Multiposting ATS + Bascule 1-Clic + Coffre-fort RH',
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
    employees,
    callLogs,
    checklists,
    auditLogs,
    setActiveSection,
    setShellMode,
  } = useCfos();

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

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-orange-600">
              C.Fitness Operating System · Production v1.0
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
              Pilotage Unifié Carré de Soie &amp; Beynost
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Connecté en tant que{' '}
              <span className="font-semibold text-slate-900">
                {currentUser.firstName} {currentUser.lastName}
              </span>{' '}
              ({currentUser.jobTitle}) · Circulation bi-club incluse sans supplément (Décision D9)
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setClubFilter('all')}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                clubFilter === 'all'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Tous les clubs (2)
            </button>
            <button
              onClick={() => setClubFilter('carre-de-soie')}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                clubFilter === 'carre-de-soie'
                  ? 'bg-orange-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Carré de Soie (Vaulx-en-Velin)
            </button>
            <button
              onClick={() => setClubFilter('beynost')}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                clubFilter === 'beynost'
                  ? 'bg-orange-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Beynost (ZAC des Baterses)
            </button>
          </div>
        </div>

        {/* Direct Launchers for Field Shells */}
        <div className="mt-5 pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            onClick={() => setShellMode('employe')}
            className="flex items-center justify-between px-4 py-3 rounded-lg border border-slate-200 hover:border-orange-400 hover:bg-orange-50/40 transition-colors text-left cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <Smartphone className="w-5 h-5 text-orange-600 shrink-0" />
              <div>
                <div className="text-xs font-bold text-slate-900 group-hover:text-orange-700">
                  Interface Employé &amp; Apprenti (Mobile)
                </div>
                <div className="text-[11px] text-slate-500">
                  Planning, Congés, Livret BPJEPS &amp; Signature
                </div>
              </div>
            </div>
            <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-orange-600 shrink-0" />
          </button>

          <button
            onClick={() => setShellMode('tablette')}
            className="flex items-center justify-between px-4 py-3 rounded-lg border border-slate-200 hover:border-orange-400 hover:bg-orange-50/40 transition-colors text-left cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <Tablet className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <div className="text-xs font-bold text-slate-900 group-hover:text-emerald-700">
                  Tablette Kiosque (Badgeuse PIN &amp; Accueil)
                </div>
                <div className="text-[11px] text-slate-500">
                  Pointage mural + mode Hors-Ligne + Essai
                </div>
              </div>
            </div>
            <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 shrink-0" />
          </button>

          <button
            onClick={() => setShellMode('telephone')}
            className="flex items-center justify-between px-4 py-3 rounded-lg border border-slate-200 hover:border-orange-400 hover:bg-orange-50/40 transition-colors text-left cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <PhoneCall className="w-5 h-5 text-blue-600 shrink-0" />
              <div>
                <div className="text-xs font-bold text-slate-900 group-hover:text-blue-700">
                  Téléphone Virtuel WebRTC (SIP.js)
                </div>
                <div className="text-[11px] text-slate-500">
                  Hot-desking 1-clic &amp; Rotation 04 / 07
                </div>
              </div>
            </div>
            <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 shrink-0" />
          </button>
        </div>
      </div>

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
            {clubCalls.length} appels journalisés · Rotation 04/07 active
          </div>
        </div>

        <div
          onClick={() => setActiveSection('crm')}
          className="bg-white border border-slate-200 rounded-xl p-5 hover:border-slate-300 transition-colors cursor-pointer"
        >
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <span>Pipeline Prospects &amp; Essais</span>
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
            {scheduledTrialsCount} séances planifiées · {conversionRate}% transfo
          </div>
        </div>

        <div
          onClick={() => setActiveSection('planning-hr')}
          className="bg-white border border-slate-200 rounded-xl p-5 hover:border-slate-300 transition-colors cursor-pointer"
        >
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <span>Planning RH &amp; IDCC 2511</span>
            <Calendar className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-900 tabular-nums">
              {clubShifts.length}
            </span>
            <span className="text-xs font-medium text-emerald-700">créneaux validés</span>
          </div>
          <div className="mt-2 text-xs text-slate-500">
            {employees.length} collaborateurs · Export Silae prêt
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

      {/* Two-Column Detail Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: ROI Annuel & Remplacement SaaS (§10) */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-5 sm:p-6">
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

        {/* Right: Club Operations Status & Journal d'Audit */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-orange-600" />
                État Opérationnel des 2 Clubs
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
                  className="p-3 rounded-lg bg-slate-50 border border-slate-200/80"
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

          <div className="bg-white border border-slate-200 rounded-xl p-5">
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
              {auditLogs.slice(0, 3).map((log) => (
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
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Par {log.actorName} ({log.actorRole})
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
