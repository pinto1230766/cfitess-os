import React, { useState } from 'react';
import { useCfos } from '../../context/CfosContext';
import {
  UserPlus,
  CheckCircle2,
  AlertTriangle,
  Search,
  ShieldAlert,
  Send,
  LayoutGrid,
  Columns3,
  Table2,
  CalendarPlus,
  BadgeCheck,
  PhoneCall,
  ChevronRight,
  Euro,
  Clock,
  FileText,
  Dumbbell,
  ExternalLink,
} from 'lucide-react';
import { ClubId, Prospect, ProspectStage } from '../../types/cfos';
import { formatClubName } from '../../domain/rules';

const STAGES: ProspectStage[] = [
  'Nouveau',
  'Contacté',
  'Séance planifiée',
  'Venu',
  'Adhérent',
  'Perdu',
];

const CFITNESS_SUBSCRIPTION_FORMULAS = [
  'Formule Premium Bi-Club + Biocircuit (39,90 €/mois)',
  'Formule Classique Bi-Club Accès Libre 6h-23h (29,90 €/mois)',
  'Formule Étudiant / -26 ans Bi-Club (24,90 €/mois)',
];

// Annualized value of a fitness membership (12 months * 39.90€ + 49€ joining fee ~ 528 €)
const DEAL_ANNUAL_VALUE_EUR = 478.8;

export function CrmView() {
  const {
    clubFilter,
    prospects,
    employees,
    updateProspectStage,
    scheduleProspectTrial,
    convertProspectToMember,
    createProspect,
    sendValidatedProspectSms,
    toggleProspectStopSms,
    placeSimulatedCall,
    openMywellnessLink,
    heitzMembers,
    rewardMemberLoyaltyOrReferral,
  } = useCfos();

  const [viewMode, setViewMode] = useState<'KANBAN' | 'HUBSPOT_360' | 'TABLE'>('KANBAN');
  const [selectedHubspotProspectId, setSelectedHubspotProspectId] = useState<string>(
    prospects[0]?.id || ''
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStageFilter, setSelectedStageFilter] = useState<ProspectStage | 'ALL'>('ALL');
  const [showNewModal, setShowNewModal] = useState(false);
  const [convertingProspect, setConvertingProspect] = useState<Prospect | null>(null);
  const [selectedFormula, setSelectedFormula] = useState<string>(CFITNESS_SUBSCRIPTION_FORMULAS[0]);
  const [sponsorMemberId, setSponsorMemberId] = useState<string>('');
  const [feedbackBanner, setFeedbackBanner] = useState<{
    type: 'ok' | 'warn';
    text: string;
  } | null>(null);

  // New Prospect Form
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [clubId, setClubId] = useState<ClubId>(
    clubFilter === 'beynost' ? 'beynost' : 'carre-de-soie'
  );
  const [source, setSource] = useState<Prospect['source']>('Tablette accueil');
  const [goal, setGoal] = useState('Remise en forme & Biocircuit Technogym');
  const [rgpdConsent, setRgpdConsent] = useState(true);

  const filteredProspects = prospects.filter((p) => {
    if (clubFilter !== 'all' && p.clubId !== clubFilter) return false;
    if (selectedStageFilter !== 'ALL' && p.stage !== selectedStageFilter) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.firstName.toLowerCase().includes(q) ||
      p.lastName.toLowerCase().includes(q) ||
      p.phone.toLowerCase().includes(q) ||
      p.email.toLowerCase().includes(q)
    );
  });

  const selectedHubspotProspect =
    filteredProspects.find((p) => p.id === selectedHubspotProspectId) ||
    filteredProspects[0] ||
    prospects[0];

  const commercials = employees.filter((e) => e.role === 'commercial');

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const res = createProspect({
      firstName,
      lastName,
      phone,
      email: email || 'contact@prospect-cfitness.fr',
      clubId,
      source,
      goal,
      rgpdConsent,
    });

    if (!res.ok) {
      setFeedbackBanner({
        type: 'warn',
        text: res.message,
      });
    } else {
      setFeedbackBanner({
        type: 'ok',
        text: res.message,
      });
      setFirstName('');
      setLastName('');
      setPhone('');
      setEmail('');
      setShowNewModal(false);
    }
  };

  const handleQuickTrialBook = (prospect: Prospect) => {
    const slot =
      prospect.clubId === 'carre-de-soie'
        ? 'Sam. 24/10 à 11h00 (Coach Karim — Carré de Soie)'
        : 'Sam. 24/10 à 14h30 (Coach Sarah — Beynost)';
    scheduleProspectTrial(prospect.id, slot);
    setFeedbackBanner({
      type: 'ok',
      text: `Séance d’essai planifiée pour ${prospect.firstName} ${prospect.lastName} : ${slot}.`,
    });
  };

  const handleConfirmConversion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!convertingProspect) return;
    const res = convertProspectToMember(convertingProspect.id, selectedFormula);
    if (res.ok && sponsorMemberId) {
      rewardMemberLoyaltyOrReferral(
        sponsorMemberId,
        'parrainage',
        `${convertingProspect.firstName} ${convertingProspect.lastName}`
      );
    }
    setFeedbackBanner({
      type: res.ok ? 'ok' : 'warn',
      text: res.message,
    });
    setSponsorMemberId('');
    setConvertingProspect(null);
  };

  const handleQuickCall = (prospect: Prospect) => {
    const res = placeSimulatedCall({
      prospectId: prospect.id,
      clubId: prospect.clubId,
      lineMode: '07',
      outcome: 'Décroché — Qualifié',
      durationSec: 165,
    });
    setFeedbackBanner({
      type: res.ok ? 'ok' : 'warn',
      text: res.message,
    });
  };

  const totalPipelineValueEur = Math.round(filteredProspects.length * DEAL_ANNUAL_VALUE_EUR);

  return (
    <div className="space-y-4">
      {/* ===================================================================== */}
      {/* EN-TÊTE UNIFIÉ C.FITNESS OS — CRM PROSPECTS & ADHÉSIONS               */}
      {/* ===================================================================== */}
      <div className="rounded-xl overflow-hidden border border-slate-200 shadow-xs bg-white">
        <div className="bg-slate-900 text-white px-5 py-4 flex flex-col xl:flex-row xl:items-center xl:justify-between gap-3">
          <div className="flex flex-wrap items-center gap-4">
            <div className="pr-4 border-r border-slate-800">
              <div className="text-[11px] font-bold uppercase tracking-wider text-orange-400">
                06 · Le CRM Prospects &amp; Adhésions
              </div>
              <h2 className="font-black text-lg tracking-tight text-white">
                Pipeline Commercial, Relances &amp; Parrainages
              </h2>
              <div className="text-xs text-slate-400">
                Synchronisé avec les passages portillons Heitz &amp; bilans coach Mywellness
              </div>
            </div>

            {/* Sélecteur de vue */}
            <div className="flex items-center gap-1.5 bg-slate-800 p-1 rounded-lg text-xs">
              <button
                onClick={() => setViewMode('KANBAN')}
                className={`px-3.5 py-2 rounded-md font-bold flex items-center gap-1.5 cursor-pointer transition-colors ${
                  viewMode === 'KANBAN'
                    ? 'bg-orange-600 text-white'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <Columns3 className="w-3.5 h-3.5" />
                Vue Kanban
              </button>
              <button
                onClick={() => setViewMode('HUBSPOT_360')}
                className={`px-3.5 py-2 rounded-md font-bold flex items-center gap-1.5 cursor-pointer transition-colors ${
                  viewMode === 'HUBSPOT_360'
                    ? 'bg-orange-600 text-white'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                Fiche Prospect Détaillée
              </button>
              <button
                onClick={() => setViewMode('TABLE')}
                className={`px-3.5 py-2 rounded-md font-bold flex items-center gap-1.5 cursor-pointer transition-colors ${
                  viewMode === 'TABLE'
                    ? 'bg-orange-600 text-white'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <Table2 className="w-3.5 h-3.5" />
                Liste ({filteredProspects.length})
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="text-right font-mono text-xs hidden sm:block">
              <span className="text-slate-400">Potentiel annuel : </span>
              <span className="font-bold text-emerald-400 tabular-nums">
                {totalPipelineValueEur.toLocaleString('fr-FR')} €
              </span>
              <span className="text-slate-400"> · {filteredProspects.length} dossiers</span>
            </div>

            <button
              onClick={() => setShowNewModal(true)}
              className="px-4 py-2 rounded-lg bg-orange-600 hover:bg-orange-700 text-white text-xs font-extrabold flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <UserPlus className="w-4 h-4" />
              + Nouveau Prospect
            </button>
          </div>
        </div>

        {/* Sub-Toolbar: Commercial Target Progress (Art. 4 CDI) + Search + Stage Chevrons */}
        <div className="bg-slate-50 border-b border-slate-200 px-4 py-2.5 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-bold text-slate-700">
              Objectif Art. 4 CDI (20 abos/mois) :
            </span>
            {commercials.map((com) => {
              const actual = com.monthlySubscriptionsActual ?? 0;
              const target = com.monthlySubscriptionsTarget ?? 20;
              const pct = Math.min(100, Math.round((actual / target) * 100));
              return (
                <div
                  key={com.id}
                  className="px-2.5 py-1 rounded bg-white border border-slate-200 flex items-center gap-2 shadow-2xs"
                >
                  <span className="font-bold text-slate-900">
                    {com.firstName} ({formatClubName(com.clubId, true)})
                  </span>
                  <span className="font-mono font-bold text-[#017737] tabular-nums">
                    {actual}/{target} ({pct}%)
                  </span>
                </div>
              );
            })}
          </div>

          <div className="relative w-full lg:w-72">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filtrer dans Pipedrive / HubSpot..."
              className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-300 bg-white text-xs focus:outline-none focus:border-[#017737]"
            />
          </div>
        </div>

        {/* Pipedrive Connected Stage Arrow Chevron Strip */}
        <div className="bg-white border-b border-slate-200 px-4 py-2 overflow-x-auto">
          <div className="flex items-center min-w-[760px] gap-1">
            <button
              onClick={() => setSelectedStageFilter('ALL')}
              className={`px-3 py-1.5 rounded text-xs font-bold cursor-pointer shrink-0 ${
                selectedStageFilter === 'ALL'
                  ? 'bg-[#1F242D] text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Tout le Pipeline ({prospects.filter((p) => clubFilter === 'all' || p.clubId === clubFilter).length})
            </button>
            {STAGES.map((st, idx) => {
              const count = prospects.filter(
                (p) => (clubFilter === 'all' || p.clubId === clubFilter) && p.stage === st
              ).length;
              const stageEur = Math.round(count * DEAL_ANNUAL_VALUE_EUR);
              const isSelected = selectedStageFilter === st;
              return (
                <button
                  key={st}
                  onClick={() => setSelectedStageFilter(st)}
                  className={`flex-1 py-1.5 px-3 rounded flex items-center justify-between text-left border transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-[#017737] text-white border-[#017737]'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200'
                  }`}
                >
                  <div>
                    <div className="text-[11px] font-extrabold flex items-center gap-1">
                      <span>
                        {idx + 1}. {st}
                      </span>
                    </div>
                    <div
                      className={`text-[10px] font-mono tabular-nums ${
                        isSelected ? 'text-emerald-100' : 'text-slate-500'
                      }`}
                    >
                      {stageEur.toLocaleString('fr-FR')} € · {count} offre(s)
                    </div>
                  </div>
                  <ChevronRight
                    className={`w-3.5 h-3.5 shrink-0 ${
                      isSelected ? 'text-white' : 'text-slate-400'
                    }`}
                  />
                </button>
              );
            })}
          </div>
        </div>

        {feedbackBanner && (
          <div
            className={`px-4 py-2.5 border-b text-xs font-medium flex items-center justify-between gap-3 ${
              feedbackBanner.type === 'warn'
                ? 'bg-amber-50 border-amber-300 text-amber-900'
                : 'bg-emerald-50 border-emerald-300 text-emerald-900'
            }`}
          >
            <div className="flex items-center gap-2">
              {feedbackBanner.type === 'warn' ? (
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              )}
              <span>{feedbackBanner.text}</span>
            </div>
            <button
              onClick={() => setFeedbackBanner(null)}
              className="text-xs underline cursor-pointer shrink-0"
            >
              Fermer
            </button>
          </div>
        )}

        {/* ===================================================================== */}
        {/* VIEW 1: AUTHENTIC PIPEDRIVE DEALS KANBAN BOARD                        */}
        {/* ===================================================================== */}
        {viewMode === 'KANBAN' && (
          <div className="p-4 bg-[#F3F4F6] grid grid-cols-1 md:grid-cols-2 xl:grid-cols-6 gap-3">
            {STAGES.map((stage) => {
              const stageProspects = filteredProspects.filter((p) => p.stage === stage);
              const stageVal = Math.round(stageProspects.length * DEAL_ANNUAL_VALUE_EUR);
              return (
                <div
                  key={stage}
                  className="bg-[#E5E7EB]/80 border border-slate-300/80 rounded-lg p-2.5 flex flex-col space-y-2"
                >
                  {/* Pipedrive Column Header */}
                  <div className="pb-2 border-b border-slate-300">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-slate-900">{stage}</span>
                      <span className="px-1.5 py-0.2 rounded bg-white border border-slate-300 font-mono text-[10px] font-bold text-slate-700 tabular-nums">
                        {stageProspects.length}
                      </span>
                    </div>
                    <div className="text-[10px] font-mono text-slate-600 mt-0.5 tabular-nums">
                      {stageVal.toLocaleString('fr-FR')} € / an
                    </div>
                  </div>

                  {/* Pipedrive Deal Cards */}
                  <div className="space-y-2">
                    {stageProspects.map((prospect) => {
                      const hasScheduledTrial = Boolean(prospect.trialDate);
                      return (
                        <div
                          key={prospect.id}
                          className="bg-white border border-slate-300 hover:border-slate-400 rounded-md p-2.5 space-y-2 text-xs shadow-2xs border-l-4 border-l-[#017737]"
                        >
                          <div className="flex items-start justify-between gap-1.5">
                            <div>
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedHubspotProspectId(prospect.id);
                                  setViewMode('HUBSPOT_360');
                                }}
                                className="font-bold text-slate-900 hover:text-[#017737] text-left cursor-pointer"
                              >
                                {prospect.firstName} {prospect.lastName}
                              </button>
                              <div className="text-[10px] text-slate-500">
                                {formatClubName(prospect.clubId, true)} · {prospect.source}
                              </div>
                            </div>

                            {/* Status indicator dot (no duplicate call button) */}
                            <span
                              title={
                                hasScheduledTrial
                                  ? `Activité planifiée : ${prospect.trialDate}`
                                  : 'À relancer'
                              }
                              className={`w-2.5 h-2.5 rounded-full mt-1 shrink-0 ${
                                hasScheduledTrial ? 'bg-emerald-500' : 'bg-amber-500'
                              }`}
                            />
                          </div>

                          {/* Pipedrive Deal Value + Phone */}
                          <div className="flex items-center justify-between text-[11px] font-mono tabular-nums">
                            <span className="font-bold text-slate-700">39,90 €/m</span>
                            <span className="text-slate-500">{prospect.phone}</span>
                          </div>

                          {prospect.trialDate && (
                            <div className="p-1.5 rounded bg-emerald-50 border border-emerald-200 text-[10px] font-semibold text-emerald-900 space-y-0.5">
                              <div>📅 {prospect.trialDate}</div>
                              {prospect.heitzPassageQrCode && (
                                <div className="font-mono text-[9px] text-emerald-700">
                                  QR Portillon Heitz : {prospect.heitzPassageQrCode}
                                </div>
                              )}
                            </div>
                          )}

                          {prospect.pendingSmsDraft && (
                            <button
                              onClick={() =>
                                sendValidatedProspectSms(prospect.id, prospect.pendingSmsDraft!)
                              }
                              className="w-full py-1 px-2 rounded bg-orange-50 hover:bg-orange-100 border border-orange-200 text-orange-800 text-[10px] font-bold flex items-center justify-center gap-1 cursor-pointer"
                            >
                              <Send className="w-3 h-3" />
                              Valider SMS
                            </button>
                          )}

                          <div className="pt-1.5 border-t border-slate-100 space-y-1.5">
                            <div className="grid grid-cols-2 gap-1">
                              <button
                                onClick={() => handleQuickCall(prospect)}
                                className="py-1 px-1.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-800 text-[10px] font-semibold flex items-center justify-center gap-1 cursor-pointer"
                              >
                                <PhoneCall className="w-3 h-3 text-blue-600" />
                                Appel 07
                              </button>
                              <button
                                onClick={() => handleQuickTrialBook(prospect)}
                                className="py-1 px-1.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-800 text-[10px] font-semibold flex items-center justify-center gap-1 cursor-pointer"
                              >
                                <CalendarPlus className="w-3 h-3 text-[#017737]" />
                                RDV Essai
                              </button>
                            </div>

                            {prospect.stage !== 'Adhérent' && (
                              <button
                                onClick={() => setConvertingProspect(prospect)}
                                className="w-full py-1.5 px-2 rounded bg-[#017737] hover:bg-[#01632d] text-white text-[10px] font-extrabold flex items-center justify-center gap-1 cursor-pointer"
                              >
                                <BadgeCheck className="w-3.5 h-3.5" />
                                GAGNÉ → Créer Adhérent Heitz
                              </button>
                            )}

                            <select
                              value={prospect.stage}
                              onChange={(e) =>
                                updateProspectStage(
                                  prospect.id,
                                  e.target.value as ProspectStage
                                )
                              }
                              className="w-full px-2 py-1 rounded border border-slate-200 text-[10px] font-semibold bg-slate-50 text-slate-700"
                            >
                              {STAGES.map((s) => (
                                <option key={s} value={s}>
                                  Étape : {s}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ===================================================================== */}
        {/* VIEW 2: AUTHENTIC HUBSPOT 3-PANE CONTACT RECORD VIEW                  */}
        {/* ===================================================================== */}
        {viewMode === 'HUBSPOT_360' && selectedHubspotProspect && (
          <div className="bg-[#F5F8FA] p-4 space-y-4">
            {/* Prospect Selector Strip */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {filteredProspects.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setSelectedHubspotProspectId(p.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 border cursor-pointer ${
                    selectedHubspotProspect.id === p.id
                      ? 'bg-[#FF7A59] text-white border-[#FF7A59]'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  {p.firstName} {p.lastName} ({p.stage})
                </button>
              ))}
            </div>

            {/* HubSpot 3-Column CRM Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 text-xs">
              {/* LEFT PANE (3 cols): "À propos de ce contact" (HubSpot Properties) */}
              <div className="lg:col-span-3 bg-white border border-slate-300 rounded-lg p-4 space-y-4">
                <div className="flex items-center gap-3 pb-3 border-b border-slate-200">
                  <div className="w-11 h-11 rounded-full bg-[#FF7A59] text-white font-black text-base flex items-center justify-center shrink-0">
                    {selectedHubspotProspect.firstName[0]}
                    {selectedHubspotProspect.lastName[0]}
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900">
                      {selectedHubspotProspect.firstName} {selectedHubspotProspect.lastName}
                    </h3>
                    <div className="text-[11px] text-slate-500">
                      Club {formatClubName(selectedHubspotProspect.clubId)}
                    </div>
                  </div>
                </div>

                {/* HubSpot Quick Action Circles */}
                <div className="grid grid-cols-3 gap-2 text-center border-b border-slate-200 pb-3">
                  <button
                    onClick={() => handleQuickCall(selectedHubspotProspect)}
                    className="p-2 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 flex flex-col items-center gap-1 cursor-pointer"
                  >
                    <PhoneCall className="w-4 h-4 text-[#00A4BD]" />
                    <span className="font-semibold text-[10px]">Appeler</span>
                  </button>
                  <button
                    onClick={() => handleQuickTrialBook(selectedHubspotProspect)}
                    className="p-2 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 flex flex-col items-center gap-1 cursor-pointer"
                  >
                    <CalendarPlus className="w-4 h-4 text-[#FF7A59]" />
                    <span className="font-semibold text-[10px]">RDV Essai</span>
                  </button>
                  <button
                    onClick={() => setConvertingProspect(selectedHubspotProspect)}
                    className="p-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 flex flex-col items-center gap-1 cursor-pointer"
                  >
                    <BadgeCheck className="w-4 h-4 text-emerald-600" />
                    <span className="font-semibold text-[10px] text-emerald-800">Heitz</span>
                  </button>
                </div>

                {/* HubSpot Property Fields */}
                <div className="space-y-2.5">
                  <div className="font-extrabold uppercase tracking-wider text-[10px] text-slate-500">
                    À propos de ce contact (HubSpot)
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400">Téléphone mobile</div>
                    <div className="font-mono font-bold text-slate-900">
                      {selectedHubspotProspect.phone}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400">Adresse e-mail</div>
                    <div className="font-mono text-slate-800">
                      {selectedHubspotProspect.email}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400">Phase du cycle de vie</div>
                    <select
                      value={selectedHubspotProspect.stage}
                      onChange={(e) =>
                        updateProspectStage(
                          selectedHubspotProspect.id,
                          e.target.value as ProspectStage
                        )
                      }
                      className="mt-0.5 w-full px-2.5 py-1.5 rounded border border-slate-300 font-bold text-slate-900 bg-slate-50"
                    >
                      {STAGES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400">Source d&apos;acquisition</div>
                    <div className="font-semibold text-slate-800">
                      {selectedHubspotProspect.source}
                    </div>
                  </div>
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-slate-600">
                      {selectedHubspotProspect.smsStopOptOut
                        ? 'STOP SMS Actif'
                        : 'Opt-in RGPD Actif'}
                    </span>
                    <button
                      onClick={() => toggleProspectStopSms(selectedHubspotProspect.id)}
                      className="text-[11px] text-[#00A4BD] underline cursor-pointer"
                    >
                      {selectedHubspotProspect.smsStopOptOut ? 'Réactiver' : 'Tester STOP'}
                    </button>
                  </div>
                </div>
              </div>

              {/* CENTER PANE (5 cols): HubSpot Activity Timeline ("Activités, Appels, SMS & Notes") */}
              <div className="lg:col-span-5 bg-white border border-slate-300 rounded-lg p-4 space-y-4">
                <div className="border-b border-slate-200 pb-2.5 flex items-center justify-between">
                  <span className="font-extrabold text-slate-900">
                    Chronologie d&apos;Activité HubSpot (Art. 4 CDI)
                  </span>
                  <span className="px-2 py-0.5 rounded bg-slate-100 font-mono text-[10px] text-slate-600">
                    {selectedHubspotProspect.retryCount} relance(s)
                  </span>
                </div>

                {selectedHubspotProspect.pendingSmsDraft && (
                  <div className="p-3 rounded-lg bg-orange-50 border border-orange-200 space-y-2">
                    <div className="font-bold text-slate-900">
                      SMS transactionnel en attente de validation :
                    </div>
                    <p className="font-mono text-[11px] text-slate-700">
                      {selectedHubspotProspect.pendingSmsDraft}
                    </p>
                    <button
                      onClick={() =>
                        sendValidatedProspectSms(
                          selectedHubspotProspect.id,
                          selectedHubspotProspect.pendingSmsDraft!
                        )
                      }
                      className="w-full py-2 px-3 rounded bg-[#FF7A59] hover:bg-[#e86847] text-white font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      Valider et envoyer le SMS
                    </button>
                  </div>
                )}

                <div className="space-y-3">
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span className="font-bold text-slate-900 flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-[#FF7A59]" />
                        Note &amp; Objectif Découverte
                      </span>
                      <span className="font-mono">{selectedHubspotProspect.createdAt}</span>
                    </div>
                    <div className="font-semibold text-slate-800">
                      Objectif : {selectedHubspotProspect.goal}
                    </div>
                    <div className="text-slate-600">{selectedHubspotProspect.notes}</div>
                  </div>

                  {selectedHubspotProspect.trialDate && (
                    <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 space-y-1">
                      <div className="font-bold text-emerald-900 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-emerald-600" />
                        Séance d&apos;Essai Planifiée (POST /api/planning/book)
                      </div>
                      <div className="text-emerald-800 font-semibold">
                        {selectedHubspotProspect.trialDate}
                      </div>
                      {selectedHubspotProspect.heitzPassageQrCode && (
                        <div className="pt-1 border-t border-emerald-200/80 font-mono text-[11px] text-emerald-900">
                          Ticket QR Portillon Heitz (/api/passageCode/generate) :{' '}
                          <strong>{selectedHubspotProspect.heitzPassageQrCode}</strong>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* RIGHT PANE (4 cols): HubSpot Deals & Direct Heitz Membership Conversion */}
              <div className="lg:col-span-4 bg-white border border-slate-300 rounded-lg p-4 space-y-4">
                <div className="border-b border-slate-200 pb-2.5 font-extrabold text-slate-900">
                  Transaction Associée &amp; Passerelle Heitz System
                </div>

                <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">
                      Abonnement C.Fitness Bi-Club
                    </span>
                    <span className="font-mono font-bold text-[#017737]">39,90 €/mois</span>
                  </div>
                  <div className="text-[11px] text-slate-600">
                    Accès 6h-23h 7j/7 Carré de Soie + Beynost · Bilan Technogym Checkup + Biocircuit inclus.
                  </div>
                  <div className="text-[10px] font-mono text-slate-500">
                    Valeur annuelle : {DEAL_ANNUAL_VALUE_EUR.toFixed(2)} € TTC
                  </div>
                </div>

                {selectedHubspotProspect.stage !== 'Adhérent' ? (
                  <button
                    onClick={() => setConvertingProspect(selectedHubspotProspect)}
                    className="w-full py-3 px-4 rounded-lg bg-[#017737] hover:bg-[#01632d] text-white font-extrabold flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                  >
                    <BadgeCheck className="w-4 h-4" />
                    Convertir en Adhérent Heitz + Mandat SEPA
                  </button>
                ) : (
                  <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 font-bold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    Prospect déjà converti en Adhérent Heitz actif !
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => {
                    const res = openMywellnessLink({
                      mywellnessMemberId: selectedHubspotProspect.id,
                      personName: `${selectedHubspotProspect.firstName} ${selectedHubspotProspect.lastName}`,
                      clubId: selectedHubspotProspect.clubId,
                    });
                    setFeedbackBanner({
                      type: 'ok',
                      text: `Fiche sportive Technogym Mywellness ouverte : ${res.url}`,
                    });
                  }}
                  className="w-full py-2.5 px-3 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Dumbbell className="w-3.5 h-3.5" />
                  <span>Ouvrir la fiche sportive dans Mywellness</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ===================================================================== */}
        {/* VIEW 3: HUBSPOT SPREADSHEET CONTACTS TABLE                            */}
        {/* ===================================================================== */}
        {viewMode === 'TABLE' && (
          <div className="p-4 overflow-x-auto bg-white">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-[11px] font-semibold uppercase text-slate-500">
                  <th className="py-2.5 pr-3">Prospect</th>
                  <th className="py-2.5 px-3">Club &amp; Source</th>
                  <th className="py-2.5 px-3">Téléphone &amp; Email</th>
                  <th className="py-2.5 px-3">Objectif &amp; Séance d&apos;Essai</th>
                  <th className="py-2.5 px-3">Conformité RGPD / Bloctel</th>
                  <th className="py-2.5 px-3">Étape Pipeline</th>
                  <th className="py-2.5 pl-3 text-right">Actions Rapides</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProspects.map((prospect) => (
                  <tr key={prospect.id} className="hover:bg-slate-50/80">
                    <td className="py-3 pr-3 font-bold text-slate-900">
                      {prospect.firstName} {prospect.lastName}
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-semibold text-slate-800">
                        {formatClubName(prospect.clubId)}
                      </span>
                      <div className="text-[11px] text-slate-500">{prospect.source}</div>
                    </td>
                    <td className="py-3 px-3 font-mono text-[11px] tabular-nums">
                      <div className="font-bold text-slate-900">{prospect.phone}</div>
                      <div className="text-slate-500">{prospect.email}</div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="text-slate-800">{prospect.goal}</div>
                      {prospect.trialDate && (
                        <div className="text-[11px] font-semibold text-emerald-700">
                          Essai : {prospect.trialDate}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-3 text-[11px]">
                      {prospect.smsStopOptOut ? (
                        <span className="text-rose-600 font-semibold">STOP SMS actif</span>
                      ) : prospect.bloctelListed ? (
                        <span className="text-amber-700 font-semibold">Liste Bloctel</span>
                      ) : (
                        <span className="text-emerald-700 font-medium">Opt-in RGPD OK</span>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      <select
                        value={prospect.stage}
                        onChange={(e) =>
                          updateProspectStage(prospect.id, e.target.value as ProspectStage)
                        }
                        className="px-2.5 py-1 rounded-lg border border-slate-200 text-xs font-semibold bg-slate-50"
                      >
                        {STAGES.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="py-3 pl-3 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => handleQuickTrialBook(prospect)}
                          className="px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold cursor-pointer"
                        >
                          Planifier Essai
                        </button>
                        {prospect.stage !== 'Adhérent' && (
                          <button
                            onClick={() => setConvertingProspect(prospect)}
                            className="px-2.5 py-1.5 rounded-lg bg-[#017737] hover:bg-[#01632d] text-white font-semibold cursor-pointer"
                          >
                            Souscrire Heitz
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Convert Prospect -> Active Heitz Member + SEPA Mandate RUM */}
      {convertingProspect && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4">
          <form
            onSubmit={handleConfirmConversion}
            className="bg-white rounded-xl max-w-lg w-full p-5 border border-slate-200 shadow-lg space-y-4 text-xs"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <div className="text-[10px] font-bold uppercase text-emerald-700">
                  Souscription Adhérent Heitz System + Mandat SEPA
                </div>
                <h3 className="text-base font-bold text-slate-900 mt-0.5">
                  Transformer {convertingProspect.firstName} {convertingProspect.lastName} en Adhérent
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setConvertingProspect(null)}
                className="text-xs text-slate-500 hover:text-slate-800 cursor-pointer"
              >
                Fermer
              </button>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
              <div>
                <span className="font-semibold text-slate-700">Club de rattachement :</span>{' '}
                <span className="font-bold text-slate-900">
                  {formatClubName(convertingProspect.clubId)} (Circulation Bi-Club D9 incluse)
                </span>
              </div>
              <div>
                <span className="font-semibold text-slate-700">Coordonnées :</span>{' '}
                <span className="font-mono">{convertingProspect.phone}</span> ·{' '}
                {convertingProspect.email}
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Choisir la Formule d&apos;Abonnement C.Fitness :
              </label>
              <select
                value={selectedFormula}
                onChange={(e) => setSelectedFormula(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-white font-semibold"
              >
                {CFITNESS_SUBSCRIPTION_FORMULAS.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Parrain Adhérent Heitz (Optionnel — crédite +150 pts fidélité &amp; 1 mois offert au parrain) :
              </label>
              <select
                value={sponsorMemberId}
                onChange={(e) => setSponsorMemberId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs"
              >
                <option value="">— Aucun parrain (Souscription directe) —</option>
                {heitzMembers.map((hm) => (
                  <option key={hm.id} value={hm.id}>
                    {hm.firstName} {hm.lastName} ({hm.badgeCode} · {formatClubName(hm.homeClubId, true)})
                  </option>
                ))}
              </select>
            </div>

            <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-950 space-y-1">
              <div className="font-bold">Actions automatiques exécutées (1-Clic) :</div>
              <div>
                • Création du Badge RFID/QR dans Heitz System (accès immédiat portillons &lt; 50ms)
              </div>
              <div>• Génération du Mandat de Prélèvement SEPA RUM (`finBalanceState = 1`)</div>
              <div>
                • Validation +1 abonnement sur l&apos;objectif mensuel du commercial (Art. 4 CDI)
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setConvertingProspect(null)}
                className="px-4 py-2 rounded-lg border border-slate-200 font-semibold text-slate-700 cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-[#017737] hover:bg-[#01632d] text-white font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <BadgeCheck className="w-4 h-4" />
                Valider l&apos;Adhésion &amp; Ouvrir Accès Heitz
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal New Prospect */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateSubmit}
            className="bg-white rounded-xl max-w-lg w-full p-5 border border-slate-200 shadow-lg space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                Ajouter une Offre / Prospect Pipedrive (anti-doublon)
              </h3>
              <button
                type="button"
                onClick={() => setShowNewModal(false)}
                className="text-xs text-slate-500 hover:text-slate-800 cursor-pointer"
              >
                Fermer
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Prénom *</label>
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Ex: Camille"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nom *</label>
                <input
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Ex: Garnier"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Téléphone *</label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="06 45 78 12 30"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 font-mono"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="camille@email.fr"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Club C.Fitness</label>
                <select
                  value={clubId}
                  onChange={(e) => setClubId(e.target.value as ClubId)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
                >
                  <option value="carre-de-soie">Carré de Soie (Vaulx-en-Velin)</option>
                  <option value="beynost">Beynost (ZAC des Baterses)</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Source d&apos;acquisition
                </label>
                <select
                  value={source}
                  onChange={(e) => setSource(e.target.value as Prospect['source'])}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
                >
                  <option value="Tablette accueil">Tablette accueil</option>
                  <option value="Site c.fitness">Site c.fitness</option>
                  <option value="Appel entrant">Appel entrant</option>
                  <option value="Parrainage">Parrainage</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Objectif sportif / Motivation
              </label>
              <input
                type="text"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs"
              />
            </div>

            <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={rgpdConsent}
                onChange={(e) => setRgpdConsent(e.target.checked)}
              />
              <span>Consentement explicite RGPD recueilli (SMS &amp; appels C.Fitness)</span>
            </label>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowNewModal(false)}
                className="px-4 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-[#017737] hover:bg-[#01632d] text-white text-xs font-semibold cursor-pointer"
              >
                Enregistrer l&apos;offre
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
