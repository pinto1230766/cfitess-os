import React, { useState } from 'react';
import { useCfos } from '../../context/CfosContext';
import {
  QrCode,
  ShieldAlert,
  ShieldCheck,
  Activity,
  Wifi,
  WifiOff,
  Flame,
  Lock,
  Search,
  CreditCard,
  DoorOpen,
  ShoppingBag,
  PauseCircle,
  PlayCircle,
  Plus,
  Monitor,
  UserCheck,
  Barcode,
  Printer,
  ExternalLink,
  Dumbbell,
} from 'lucide-react';
import { AccessEvent, ClubId } from '../../types/cfos';
import {
  canAccessFeature,
  computeInBodySheetMetrics,
  formatClubName,
} from '../../domain/rules';

export function DevicesHeitzView() {
  const {
    clubs,
    clubFilter,
    currentUser,
    heitzMembers,
    accessEvents,
    inBodyScans,
    simulateMemberGateScan,
    triggerManualTurnstileOpen,
    regularizeMemberSepa,
    toggleMemberSubscriptionStatus,
    rewardMemberLoyaltyOrReferral,
    recordQuickTpvSale,
    toggleClubMode,
    addInBodyScan,
    openMywellnessLink,
    setActiveSection,
  } = useCfos();

  const [activeSoftwareTab, setActiveSoftwareTab] = useState<
    'HEITZ_DESKTOP' | 'INBODY_LB120'
  >('HEITZ_DESKTOP');

  const [selectedClubGate, setSelectedClubGate] = useState<ClubId>('carre-de-soie');
  const [selectedMemberId, setSelectedMemberId] = useState<string>(
    heitzMembers[0]?.id || 'hm-1'
  );
  const [heitzStatusFilter, setHeitzStatusFilter] = useState<
    'ALL' | 'OK' | 'IMPAYE' | 'SUSPENDU'
  >('ALL');
  const [lastGateEvent, setLastGateEvent] = useState<AccessEvent | null>(
    accessEvents[0] || null
  );
  const [memberSearch, setMemberSearch] = useState('');
  const [mywellnessToast, setMywellnessToast] = useState<string | null>(null);

  // New InBody Scan Form state
  const [showNewScanForm, setShowNewScanForm] = useState(false);
  const [scanPersonName, setScanPersonName] = useState('Camille Garnier');
  const [scanPersonType, setScanPersonType] = useState<'Adhérent' | 'Prospect'>('Adhérent');
  const [scanClubId, setScanClubId] = useState<ClubId>('carre-de-soie');
  const [scanWeightKg, setScanWeightKg] = useState(64.5);
  const [scanSmmKg, setScanSmmKg] = useState(28.4);
  const [scanPbfPct, setScanPbfPct] = useState(19.2);
  const [scanWaterL, setScanWaterL] = useState(38.6);
  const [scanVisceral, setScanVisceral] = useState(5);
  const [scanCoachNote, setScanCoachNote] = useState(
    'Bilan initial Biocircuit Technogym · Objectif tonification & gain musculaire (+2 kg SMM).'
  );

  const filteredMembers = heitzMembers.filter((m) => {
    if (clubFilter !== 'all' && m.homeClubId !== clubFilter) return false;
    if (heitzStatusFilter === 'OK' && (!m.activeSubscription || m.finBalanceEur < 0)) return false;
    if (heitzStatusFilter === 'IMPAYE' && m.finBalanceEur >= 0) return false;
    if (heitzStatusFilter === 'SUSPENDU' && m.activeSubscription) return false;
    if (!memberSearch.trim()) return true;
    const q = memberSearch.toLowerCase();
    return (
      m.firstName.toLowerCase().includes(q) ||
      m.lastName.toLowerCase().includes(q) ||
      m.badgeCode.toLowerCase().includes(q) ||
      m.phone.toLowerCase().includes(q)
    );
  });

  const selectedMember =
    heitzMembers.find((m) => m.id === selectedMemberId) ||
    filteredMembers[0] ||
    heitzMembers[0];

  const activeGateClub =
    clubs.find((c) => c.id === selectedClubGate) || clubs[0];

  // Strict RGPD Health Data Access Control (§11) centralized via rules.ts
  const canViewHealthData = canAccessFeature(currentUser.role, 'inbody_health_data');

  const handleSimulatePassage = (memberId: string, targetClub: ClubId) => {
    setSelectedMemberId(memberId);
    const ev = simulateMemberGateScan(memberId, targetClub);
    if (ev) {
      setLastGateEvent(ev);
    }
  };

  const handleManualGateOpen = (gateLabel: string, reasonLabel: string) => {
    const ev = triggerManualTurnstileOpen(selectedClubGate, gateLabel, reasonLabel);
    setLastGateEvent(ev);
  };

  const handleCreateInBodyScan = (e: React.FormEvent) => {
    e.preventDefault();
    addInBodyScan({
      personName: scanPersonName.trim() || 'Adhérent C.Fitness',
      personType: scanPersonType,
      clubId: scanClubId,
      date: new Date().toISOString().slice(0, 10),
      deviceModel:
        scanClubId === 'carre-de-soie'
          ? 'Technogym Checkup — Carré de Soie (Mywellness)'
          : 'Technogym Checkup — Beynost (Mywellness)',
      weightKg: Number(scanWeightKg),
      skeletalMuscleMassKg: Number(scanSmmKg),
      bodyFatPercent: Number(scanPbfPct),
      totalBodyWaterL: Number(scanWaterL),
      visceralFatLevel: Number(scanVisceral),
      coachNote: scanCoachNote,
      mywellnessSynced: true,
      wellnessAgeYears: 31,
    });
    setShowNewScanForm(false);
  };

  const handleOpenMywellness = (memberId?: string, memberLabel?: string) => {
    const res = openMywellnessLink({
      mywellnessMemberId: memberId,
      personName: memberLabel,
      clubId: selectedClubGate,
    });
    setMywellnessToast(`${res.label} → ${res.url}`);
  };

  return (
    <div className="space-y-5">
      {/* EN-TÊTE UNIFIÉ C.FITNESS OS — 08. MATÉRIEL HEITZ & TECHNOGYM CHECKUP */}
      <div className="bg-slate-900 text-white rounded-xl p-5 border border-slate-800 shadow-xs space-y-4">
        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="pr-4 border-r border-slate-800">
              <div className="text-[11px] font-bold uppercase tracking-wider text-orange-400">
                08 · Le Matériel Club (1er Plan)
              </div>
              <h2 className="font-black text-lg tracking-tight text-white">
                Portillons Heitz, Caisse TPV &amp; Bilans Technogym Checkup
              </h2>
              <div className="text-xs text-slate-400">
                Contrôle d&apos;accès RFID/Bluetooth, caisse comptoir, fidélité et bilans biométriques Mywellness
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setActiveSoftwareTab('HEITZ_DESKTOP')}
                className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 cursor-pointer transition-colors ${
                  activeSoftwareTab === 'HEITZ_DESKTOP'
                    ? 'bg-orange-600 text-white shadow-2xs'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
                }`}
              >
                <Monitor className="w-4 h-4" />
                <span>1. Portillons, Caisse &amp; Fidélité Heitz</span>
              </button>

              <button
                onClick={() => setActiveSoftwareTab('INBODY_LB120')}
                className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 cursor-pointer transition-colors ${
                  activeSoftwareTab === 'INBODY_LB120'
                    ? 'bg-orange-600 text-white shadow-2xs'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
                }`}
              >
                <Activity className="w-4 h-4" />
                <span>2. Bilans Technogym Checkup &amp; Mywellness</span>
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => toggleClubMode(selectedClubGate, 'degradedMode')}
              className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer border ${
                activeGateClub.degradedMode
                  ? 'bg-amber-600 text-white border-amber-500'
                  : 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700'
              }`}
            >
              {activeGateClub.degradedMode ? (
                <WifiOff className="w-3.5 h-3.5" />
              ) : (
                <Wifi className="w-3.5 h-3.5 text-emerald-400" />
              )}
              {activeGateClub.degradedMode
                ? 'Mode Autonome Actif'
                : 'Réseau Club Nominal'}
            </button>

            <button
              onClick={() => toggleClubMode(selectedClubGate, 'fireAlarmOpen')}
              className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer border ${
                activeGateClub.fireAlarmOpen
                  ? 'bg-rose-600 text-white border-rose-500'
                  : 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700'
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-rose-400" />
              {activeGateClub.fireAlarmOpen
                ? 'Portillons en Libre Passage (SSI)'
                : 'Ouverture Urgence SSI'}
            </button>
          </div>
        </div>
      </div>

      {mywellnessToast && (
        <div className="bg-amber-50 border border-amber-300 text-amber-950 rounded-xl px-4 py-2.5 text-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 font-semibold">
            <Dumbbell className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              Passerelle Technogym Mywellness Cloud active :{' '}
              <span className="font-mono font-bold underline">{mywellnessToast}</span>
            </span>
          </div>
          <button
            onClick={() => setMywellnessToast(null)}
            className="text-xs font-bold underline cursor-pointer shrink-0"
          >
            Fermer
          </button>
        </div>
      )}

      {/* ===================================================================== */}
      {/* WINDOW 1: AUTHENTIC HEITZ SYSTEM DESKTOP CLIENT (Heitz-WS.exe + TPV)  */}
      {/* ===================================================================== */}
      {activeSoftwareTab === 'HEITZ_DESKTOP' && (
        <div className="rounded-xl overflow-hidden border-2 border-[#1E3A5F] shadow-md bg-[#E2E8F0]">
          {/* Windows / Delphi Desktop Title Bar */}
          <div className="bg-gradient-to-r from-[#0F2942] via-[#1E3A5F] to-[#2B4C7E] text-white px-3.5 py-2 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-xs bg-sky-500 text-slate-950 font-black text-[11px] flex items-center justify-center">
                H
              </div>
              <span className="font-bold tracking-wide">
                Heitz System v12.4 — Supervision Accueil, Contrôle d&apos;Accès &amp; Caisse TPV [Connecté : Heitz-WS.exe · 10.10.0.20:8080]
              </span>
            </div>
            <div className="flex items-center gap-3 font-mono text-[11px]">
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                FMI {activeGateClub.name} : {activeGateClub.fmiCurrent}/{activeGateClub.fmiCapacity} présents
              </span>
              <span className="text-sky-200">
                Opérateur : {currentUser.firstName} {currentUser.lastName}
              </span>
            </div>
          </div>

          {/* Classic Windows Menu Strip + Function Keys Toolbar */}
          <div className="bg-[#F1F5F9] border-b border-slate-300 px-3 py-1.5 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-700">
            <div className="flex flex-wrap items-center gap-2 font-semibold">
              <button
                type="button"
                onClick={() => setHeitzStatusFilter('ALL')}
                className="px-2 py-0.5 rounded hover:bg-slate-200 text-[#1E3A5F] font-bold underline cursor-pointer"
              >
                Fichier
              </button>
              <button
                type="button"
                onClick={() => setHeitzStatusFilter('ALL')}
                className={`px-2 py-0.5 rounded cursor-pointer ${
                  heitzStatusFilter === 'ALL'
                    ? 'bg-[#1E3A5F] text-white font-bold'
                    : 'hover:bg-slate-200 text-slate-700'
                }`}
              >
                Fiches Adhérents ({heitzMembers.length})
              </button>
              <button
                type="button"
                onClick={() => handleScanBadge(selectedMember.id)}
                className="px-2 py-0.5 rounded hover:bg-slate-200 text-slate-700 cursor-pointer"
              >
                Contrôle d&apos;Accès Tripodes
              </button>
              <button
                type="button"
                onClick={() => setShowTpvDrawer((prev) => !prev)}
                className={`px-2 py-0.5 rounded cursor-pointer ${
                  showTpvDrawer
                    ? 'bg-emerald-700 text-white font-bold'
                    : 'hover:bg-slate-200 text-slate-700'
                }`}
              >
                Caisse / TPV Comptoir
              </button>
              <button
                type="button"
                onClick={() =>
                  setHeitzStatusFilter((prev) => (prev === 'IMPAYE' ? 'ALL' : 'IMPAYE'))
                }
                className={`px-2 py-0.5 rounded cursor-pointer ${
                  heitzStatusFilter === 'IMPAYE'
                    ? 'bg-rose-600 text-white font-bold'
                    : 'hover:bg-slate-200 text-slate-700'
                }`}
              >
                Prélèvements SEPA (finBalance)
              </button>
              <button
                type="button"
                onClick={() => setActiveSection('dashboard')}
                className="px-2 py-0.5 rounded hover:bg-slate-200 text-slate-700 cursor-pointer"
              >
                Statistiques FMI →
              </button>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500">Club pupitre :</span>
              <button
                onClick={() => setSelectedClubGate('carre-de-soie')}
                className={`px-2 py-0.5 rounded font-bold cursor-pointer ${
                  selectedClubGate === 'carre-de-soie'
                    ? 'bg-[#1E3A5F] text-white'
                    : 'bg-white border border-slate-300 text-slate-700'
                }`}
              >
                Carré de Soie (CDS)
              </button>
              <button
                onClick={() => setSelectedClubGate('beynost')}
                className={`px-2 py-0.5 rounded font-bold cursor-pointer ${
                  selectedClubGate === 'beynost'
                    ? 'bg-[#1E3A5F] text-white'
                    : 'bg-white border border-slate-300 text-slate-700'
                }`}
              >
                Beynost (BEY)
              </button>
            </div>
          </div>

          {/* Heitz Hardware Function Key Shortcut Bar (F5/F6/F7 Turnstile Relays) */}
          <div className="bg-[#1E293B] text-white px-3 py-2 flex flex-wrap items-center justify-between gap-2 border-b border-slate-700 text-xs">
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                onClick={() => handleManualGateOpen('Tripode Entrée 1', 'Ouverture F5 Accueil TPV')}
                className="px-3 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <span className="px-1 py-0.2 rounded bg-black/30 font-mono text-[10px]">F5</span>
                <DoorOpen className="w-3.5 h-3.5" />
                Ouvrir Tripode 1 (500ms)
              </button>
              <button
                onClick={() => handleManualGateOpen('Tripode Entrée 2', 'Ouverture F6 Accueil TPV')}
                className="px-3 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <span className="px-1 py-0.2 rounded bg-black/30 font-mono text-[10px]">F6</span>
                <DoorOpen className="w-3.5 h-3.5" />
                Ouvrir Tripode 2 (500ms)
              </button>
              <button
                onClick={() =>
                  handleManualGateOpen('Portillon PMR / Livraison', 'Ouverture F7 Passage PMR')
                }
                className="px-3 py-1.5 rounded bg-sky-600 hover:bg-sky-500 text-white font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <span className="px-1 py-0.2 rounded bg-black/30 font-mono text-[10px]">F7</span>
                <DoorOpen className="w-3.5 h-3.5" />
                Déverrouiller Portillon PMR
              </button>
            </div>

            <div className="flex items-center gap-2 font-mono text-[11px] text-slate-300">
              <Barcode className="w-4 h-4 text-amber-400" />
              <span>Douchette USB / Lecteur Wiegand 26 bits Prêt (&lt; 50 ms)</span>
            </div>
          </div>

          {/* 3-Column Heitz Desktop Workspace */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-2 p-2">
            {/* LEFT PANE (4 cols): Heitz Member Directory & Barcode Search */}
            <div className="lg:col-span-4 bg-white border border-slate-300 rounded flex flex-col">
              <div className="bg-[#1E3A5F] text-white px-3 py-2 text-xs font-bold flex items-center justify-between">
                <span>Fichier Adhérents Heitz ({filteredMembers.length})</span>
                <span className="font-mono text-[10px] text-sky-200">[F2] Recherche</span>
              </div>

              <div className="p-2.5 border-b border-slate-200 space-y-2 bg-slate-50">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={memberSearch}
                    onChange={(e) => setMemberSearch(e.target.value)}
                    placeholder="Code badge (HZ-...) ou Nom / Prénom..."
                    className="w-full pl-8 pr-3 py-1.5 rounded border border-slate-300 bg-white text-xs focus:outline-none focus:border-[#1E3A5F]"
                  />
                </div>
                <div className="grid grid-cols-4 gap-1 text-[10px] font-bold">
                  {[
                    { id: 'ALL', label: 'Tous' },
                    { id: 'OK', label: 'Actifs (Vert)' },
                    { id: 'IMPAYE', label: 'Impayés SEPA' },
                    { id: 'SUSPENDU', label: 'Gelés' },
                  ].map((st) => (
                    <button
                      key={st.id}
                      onClick={() => setHeitzStatusFilter(st.id as typeof heitzStatusFilter)}
                      className={`py-1 px-1.5 rounded border cursor-pointer ${
                        heitzStatusFilter === st.id
                          ? 'bg-[#1E3A5F] text-white border-[#1E3A5F]'
                          : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      {st.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dense Heitz Member Table List */}
              <div className="divide-y divide-slate-200 text-xs max-h-[520px] overflow-y-auto">
                {filteredMembers.map((m) => {
                  const isSelected = selectedMember?.id === m.id;
                  const statusDot = !m.activeSubscription
                    ? 'bg-amber-500'
                    : m.finBalanceEur < 0
                    ? 'bg-rose-600'
                    : 'bg-emerald-500';
                  return (
                    <div
                      key={m.id}
                      onClick={() => setSelectedMemberId(m.id)}
                      className={`p-2.5 flex items-center justify-between gap-2 cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-sky-50 border-l-4 border-l-[#1E3A5F]'
                          : 'hover:bg-slate-50'
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${statusDot}`} />
                          <span className="font-bold text-slate-900 truncate">
                            {m.lastName.toUpperCase()} {m.firstName}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                          {m.badgeCode} · {m.homeClubId === 'carre-de-soie' ? 'CDS' : 'BEY'} ·{' '}
                          <span
                            className={
                              m.finBalanceEur < 0
                                ? 'text-rose-600 font-bold'
                                : 'text-emerald-700 font-semibold'
                            }
                          >
                            {m.finBalanceEur.toFixed(2)} €
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSimulatePassage(m.id, selectedClubGate);
                        }}
                        className="px-2.5 py-1 rounded bg-[#1E3A5F] hover:bg-[#152C4A] text-white text-[11px] font-bold flex items-center gap-1 shrink-0 cursor-pointer"
                      >
                        <QrCode className="w-3 h-3 text-sky-300" />
                        Badger
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* CENTER PANE (5 cols): Authentic Heitz Member Fiche (Dossier Adhérent) */}
            {selectedMember && (
              <div className="lg:col-span-5 bg-white border border-slate-300 rounded flex flex-col justify-between">
                <div>
                  <div className="bg-[#1E3A5F] text-white px-3 py-2 text-xs font-bold flex items-center justify-between">
                    <span>
                      FICHE ADHÉRENT HEITZ — {selectedMember.lastName.toUpperCase()}{' '}
                      {selectedMember.firstName}
                    </span>
                    <span className="font-mono text-[11px] text-sky-200">
                      Badge RFID : {selectedMember.badgeCode}
                    </span>
                  </div>

                  {/* Giant Heitz Traffic-Light Access Banner */}
                  <div
                    className={`px-4 py-3 text-white font-black text-sm flex items-center justify-between ${
                      !selectedMember.activeSubscription
                        ? 'bg-amber-600'
                        : selectedMember.finBalanceEur < 0
                        ? 'bg-rose-600'
                        : 'bg-emerald-600'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      {!selectedMember.activeSubscription ? (
                        <>
                          <PauseCircle className="w-5 h-5" />
                          CONTRAT SUSPENDU / GEL MÉDICAL
                        </>
                      ) : selectedMember.finBalanceEur < 0 ? (
                        <>
                          <ShieldAlert className="w-5 h-5" />
                          PASSAGE BLOQUÉ — IMPAYÉ SEPA ({selectedMember.finBalanceEur.toFixed(2)} €)
                        </>
                      ) : (
                        <>
                          <ShieldCheck className="w-5 h-5" />
                          PASSAGE AUTORISÉ — SOLDE SEPA À JOUR
                        </>
                      )}
                    </span>
                    <span className="font-mono text-xs bg-black/25 px-2 py-0.5 rounded">
                      finBalanceState={selectedMember.finBalanceState}
                    </span>
                  </div>

                  {/* Member Identity Box with Webcam Photo Frame & Barcode */}
                  <div className="p-3.5 space-y-3 text-xs">
                    <div className="flex items-start gap-3.5 pb-3 border-b border-slate-200">
                      {/* Simulated Heitz Webcam Photo ID Box */}
                      <div className="w-20 h-24 rounded border-2 border-slate-300 bg-slate-100 flex flex-col items-center justify-center shrink-0 text-center p-1">
                        <div className="w-10 h-10 rounded-full bg-[#1E3A5F] text-white font-black text-sm flex items-center justify-center">
                          {selectedMember.firstName[0]}
                          {selectedMember.lastName[0]}
                        </div>
                        <span className="text-[9px] font-mono text-slate-500 mt-1">
                          PHOTO ID OK
                        </span>
                      </div>

                      <div className="flex-1 space-y-1">
                        <div className="text-base font-black text-slate-900">
                          {selectedMember.lastName.toUpperCase()} {selectedMember.firstName}
                        </div>
                        <div className="font-semibold text-[#1E3A5F]">
                          {selectedMember.subscriptionName}
                        </div>
                        <div className="text-slate-600 font-mono text-[11px]">
                          Tél : {selectedMember.phone} · Club Origine :{' '}
                          <span className="font-bold text-slate-900">
                            {formatClubName(selectedMember.homeClubId)}
                          </span>
                        </div>
                        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-100 border border-slate-300 font-mono text-[11px] text-slate-800">
                          <Barcode className="w-3.5 h-3.5 text-slate-600" />
                          <span>Carte RFID / QR : {selectedMember.badgeCode}</span>
                        </div>
                      </div>
                    </div>

                    {/* 4-Box Heitz Technical Grid */}
                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div className="p-2.5 rounded bg-slate-50 border border-slate-200">
                        <div className="text-slate-500 font-semibold">Solde Financier SEPA :</div>
                        <div
                          className={`text-sm font-mono font-black mt-0.5 tabular-nums ${
                            selectedMember.finBalanceEur < 0 ? 'text-rose-600' : 'text-emerald-700'
                          }`}
                        >
                          {selectedMember.finBalanceEur.toFixed(2)} €
                        </div>
                      </div>

                      <div className="p-2.5 rounded bg-slate-50 border border-slate-200">
                        <div className="text-slate-500 font-semibold">Accès Inter-Club (D9) :</div>
                        <div className="font-bold text-slate-900 mt-0.5">
                          Carré de Soie + Beynost (6h-23h)
                        </div>
                      </div>

                      <div className="p-2.5 rounded bg-slate-50 border border-slate-200">
                        <div className="text-slate-500 font-semibold">Assiduité &amp; Rétention :</div>
                        <div className="font-bold text-slate-900 mt-0.5">
                          Dernier passage : il y a {selectedMember.daysSinceLastWorkout}j
                          {selectedMember.daysSinceLastWorkout >= 15 && (
                            <span className="text-rose-600 ml-1">(Alerte &gt;15j)</span>
                          )}
                        </div>
                      </div>

                      <div className="p-2.5 rounded bg-slate-50 border border-slate-200">
                        <div className="text-slate-500 font-semibold">
                          Bilan Technogym Checkup &amp; Mywellness :
                        </div>
                        <div className="font-mono font-bold text-slate-900 mt-0.5 tabular-nums">
                          {selectedMember.technogymMoves30d} MOVEs ·{' '}
                          {selectedMember.technogymCheckupWellnessAge
                            ? `Wellness Age™ ${selectedMember.technogymCheckupWellnessAge} ans`
                            : 'Checkup synchro'}
                          {selectedMember.technogymCheckupScore
                            ? ` · Score Checkup : ${selectedMember.technogymCheckupScore}/100`
                            : ''}
                        </div>
                      </div>
                    </div>

                    {/* Contextual Mywellness Deep-Link Box (Per User Request #3) */}
                    <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div>
                        <div className="text-[11px] font-extrabold text-amber-950 flex items-center gap-1.5">
                          <Dumbbell className="w-3.5 h-3.5 text-amber-600" />
                          <span>Suivi Sportif &amp; Technogym Checkup Intégrés à Mywellness</span>
                        </div>
                        <div className="text-[10px] text-amber-800 mt-0.5">
                          Station Technogym Checkup ({formatClubName(selectedMember.homeClubId, true)}) · Balance BIA &amp; 3D · ID :{' '}
                          <span className="font-mono font-bold">
                            {selectedMember.mywellnessMemberId || 'mw-cloud'}
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          handleOpenMywellness(
                            selectedMember.mywellnessMemberId,
                            `${selectedMember.firstName} ${selectedMember.lastName}`
                          )
                        }
                        className="px-3 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-1.5 shrink-0 cursor-pointer shadow-2xs"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Ouvrir la fiche sportive Mywellness</span>
                      </button>
                    </div>

                    {/* Heitz Loyalty, Referral & Birthday Automation Box (heitzsystem.com/solution/) */}
                    <div className="p-3 rounded-lg bg-sky-50/80 border border-sky-200 space-y-2">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <div className="text-[11px] font-extrabold text-[#1E3A5F]">
                            Programme Fidélité Durable Heitz (Points, Parrainage &amp; Anniversaire)
                          </div>
                          <div className="text-[10px] text-slate-600 mt-0.5">
                            Solde fidélité :{' '}
                            <span className="font-mono font-bold text-[#1E3A5F]">
                              {selectedMember.loyaltyPoints ?? 120} pts
                            </span>{' '}
                            · Parrainages validés :{' '}
                            <span className="font-mono font-bold text-emerald-700">
                              {selectedMember.referralsCount ?? 1} filleul(s)
                            </span>
                            {selectedMember.lastRewardLabel ? (
                              <span className="text-emerald-800 font-semibold">
                                {' '}
                                · {selectedMember.lastRewardLabel}
                              </span>
                            ) : null}
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() =>
                            rewardMemberLoyaltyOrReferral(selectedMember.id, 'parrainage')
                          }
                          className="px-2.5 py-1.5 rounded bg-[#1E3A5F] hover:bg-[#152C4A] text-white font-bold text-[11px] cursor-pointer"
                        >
                          +1 Parrainage (+150 pts &amp; 1 mois offert)
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            rewardMemberLoyaltyOrReferral(selectedMember.id, 'anniversaire')
                          }
                          className="px-2.5 py-1.5 rounded bg-white hover:bg-sky-100 text-[#1E3A5F] border border-sky-300 font-bold text-[11px] cursor-pointer"
                        >
                          Offre Anniversaire (+100 pts &amp; SMS 07)
                        </button>
                      </div>
                    </div>

                    {/* Action Toolbar on Selected Member */}
                    <div className="pt-1 flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => handleSimulatePassage(selectedMember.id, selectedClubGate)}
                        className="flex-1 py-2.5 px-3 rounded bg-[#1E3A5F] hover:bg-[#152C4A] text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <QrCode className="w-4 h-4 text-sky-300" />
                        Simuler Passage RFID/BT Heitz ({selectedClubGate === 'carre-de-soie' ? 'CDS' : 'BEY'})
                      </button>

                      {selectedMember.finBalanceEur < 0 && (
                        <button
                          onClick={() => regularizeMemberSepa(selectedMember.id)}
                          className="py-2.5 px-3 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <CreditCard className="w-4 h-4" />
                          Régulariser CB/SEPA ({Math.abs(selectedMember.finBalanceEur).toFixed(2)} €)
                        </button>
                      )}

                      <button
                        onClick={() => toggleMemberSubscriptionStatus(selectedMember.id)}
                        className="py-2.5 px-3 rounded border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-xs flex items-center gap-1 cursor-pointer"
                      >
                        {selectedMember.activeSubscription ? (
                          <>
                            <PauseCircle className="w-3.5 h-3.5 text-amber-600" />
                            <span>Gel Médical</span>
                          </>
                        ) : (
                          <>
                            <PlayCircle className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Réactiver</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Live Gate Scan Result Footer inside Center Pane */}
                {lastGateEvent && (
                  <div
                    className={`m-3 p-3 rounded border-2 text-xs ${
                      lastGateEvent.granted
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-950'
                        : 'bg-rose-50 border-rose-500 text-rose-950'
                    }`}
                  >
                    <div className="flex items-center justify-between font-bold">
                      <span>
                        Dernier événement portillon : {lastGateEvent.memberName} (
                        {lastGateEvent.granted ? 'AUTORISÉ' : 'BLOQUÉ'})
                      </span>
                      <span className="font-mono text-[11px]">{lastGateEvent.latencyMs} ms</span>
                    </div>
                    <div className="text-[11px] mt-0.5">{lastGateEvent.reason}</div>
                    <div className="font-mono text-[10px] opacity-75 mt-0.5">
                      Trame Wiegand/Heitz : {lastGateEvent.qrTokenGenerated}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* RIGHT PANE (3 cols): Tactile POS Caisse TPV Heitz + Live Turnstile Log */}
            <div className="lg:col-span-3 flex flex-col gap-2">
              {/* Tactile Caisse TPV Comptoir */}
              <div className="bg-white border border-slate-300 rounded overflow-hidden">
                <div className="bg-[#1E3A5F] text-white px-3 py-2 text-xs font-bold flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <ShoppingBag className="w-3.5 h-3.5 text-amber-300" />
                    Pavé Tactile Caisse TPV
                  </span>
                  <span className="font-mono text-[10px] text-sky-200">[F9] TPV</span>
                </div>
                <div className="p-2.5 grid grid-cols-2 gap-1.5 text-xs">
                  {[
                    { label: 'Cadenas Acier', price: 8.0, color: 'bg-amber-50 border-amber-300' },
                    {
                      label: 'Serviette C.Fit',
                      price: 12.0,
                      color: 'bg-sky-50 border-sky-300',
                    },
                    {
                      label: 'Shaker Whey/BCAA',
                      price: 3.5,
                      color: 'bg-emerald-50 border-emerald-300',
                    },
                    {
                      label: 'Séance Jour Invité',
                      price: 15.0,
                      color: 'bg-indigo-50 border-indigo-300',
                    },
                    {
                      label: 'Refection Badge',
                      price: 10.0,
                      color: 'bg-rose-50 border-rose-300',
                    },
                    {
                      label: 'Bilan Checkup Seul',
                      price: 20.0,
                      color: 'bg-purple-50 border-purple-300',
                    },
                  ].map((item) => (
                    <button
                      key={item.label}
                      onClick={() =>
                        recordQuickTpvSale(
                          selectedClubGate,
                          item.label,
                          item.price,
                          selectedMember
                            ? `${selectedMember.firstName} ${selectedMember.lastName}`
                            : undefined
                        )
                      }
                      className={`p-2 rounded border text-left hover:brightness-95 transition-all cursor-pointer ${item.color}`}
                    >
                      <div className="font-bold text-slate-900 text-[11px] leading-tight">
                        {item.label}
                      </div>
                      <div className="font-mono font-black text-xs text-slate-900 mt-1 tabular-nums">
                        {item.price.toFixed(2)} €
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Fil d'eau des passages temps réel */}
              <div className="bg-white border border-slate-300 rounded flex-1 flex flex-col overflow-hidden">
                <div className="bg-slate-800 text-white px-3 py-2 text-xs font-bold">
                  Fil d&apos;Eau Passages Tourniquets ({accessEvents.length})
                </div>
                <div className="p-2 divide-y divide-slate-100 text-[11px] max-h-64 overflow-y-auto">
                  {accessEvents.slice(0, 8).map((ev) => (
                    <div key={ev.id} className="py-1.5 flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <div className="font-bold text-slate-900 truncate">{ev.memberName}</div>
                        <div className="text-[10px] text-slate-500 truncate">
                          {ev.clubId === 'carre-de-soie' ? 'CDS' : 'BEY'} · {ev.reason}
                        </div>
                      </div>
                      <span
                        className={`px-1.5 py-0.5 rounded font-mono text-[10px] font-bold shrink-0 ${
                          ev.granted
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {ev.granted ? 'OK' : 'REFUS'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Official heitzsystem.com/solution/ 6-Pillar Compatibility & Feature Parity Matrix */}
          <div className="m-2 p-4 bg-white border border-slate-300 rounded space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-2.5 border-b border-slate-200">
              <div>
                <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#1E3A5F]">
                  Audit Officiel Constructeur · https://heitzsystem.com/solution/ (+2 000 établissements · 32 ans d&apos;innovation)
                </div>
                <h3 className="text-sm font-black text-slate-900">
                  Matrice de Compatibilité Intégrale des 6 Piliers HEITZ System avec C.Fitness OS (Carré de Soie &amp; Beynost)
                </h3>
              </div>
              <span className="px-2.5 py-1 rounded bg-emerald-100 border border-emerald-300 text-emerald-900 text-[11px] font-bold shrink-0">
                6 / 6 Piliers Heitz 100 % Compatibles &amp; Actifs
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5 text-xs">
              <div className="p-3 rounded border border-slate-200 bg-slate-50/70 flex flex-col justify-between space-y-2">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-[#1E3A5F]">1. Contrôle d&apos;Accès Sécurisé</span>
                    <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono text-[10px] font-bold">
                      100 % OK
                    </span>
                  </div>
                  <p className="text-slate-600 text-[11px]">
                    <strong>Site Heitz :</strong> Badges RFID longue portée, QR codes, biométrie, ouverture mobile smartphone (badge virtuel), obstacles piétons, tripodes, portes PMR &amp; bornes autonomes.
                  </p>
                  <p className="text-slate-800 text-[11px] font-medium">
                    <strong>Dans C.Fitness OS :</strong> Pilotage relais F5/F6 (Tripodes 1 &amp; 2) et F7 (Portillon PMR), lecteurs RFID MIFARE + Bluetooth BLE conservés, génération QR Code essai (<code className="font-mono">/api/passageCode/generate</code>) et mode incendie SSI.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleScanBadge(selectedMember.id)}
                  className="w-full py-1.5 px-2 rounded bg-[#1E3A5F] hover:bg-[#162c49] text-white font-bold text-[11px] cursor-pointer"
                >
                  Tester le passage portillon ({selectedMember.firstName}) →
                </button>
              </div>

              <div className="p-3 rounded border border-slate-200 bg-slate-50/70 flex flex-col justify-between space-y-2">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-[#1E3A5F]">2. Plannings &amp; Anti-Surbooking</span>
                    <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono text-[10px] font-bold">
                      100 % OK
                    </span>
                  </div>
                  <p className="text-slate-600 text-[11px]">
                    <strong>Site Heitz :</strong> Réservation d&apos;espaces, cours collectifs, accès équipements, optimisation du taux d&apos;occupation et limitation du surbooking / files d&apos;attente.
                  </p>
                  <p className="text-slate-800 text-[11px] font-medium">
                    <strong>Dans C.Fitness OS :</strong> Synchronisation bidirectionnelle via <code className="font-mono">/api/planning/browse</code> (<code className="font-mono">bookingQueueStats</code>) et <code className="font-mono">/api/program/makeReservation</code> directement dans « 03 · L&apos;Espace Planning » et « 06 · Le CRM ».
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveSection('planning-hr')}
                  className="w-full py-1.5 px-2 rounded bg-[#1E3A5F] hover:bg-[#162c49] text-white font-bold text-[11px] cursor-pointer"
                >
                  Ouvrir 03 · L&apos;Espace Planning Unifié →
                </button>
              </div>

              <div className="p-3 rounded border border-slate-200 bg-slate-50/70 flex flex-col justify-between space-y-2">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-[#1E3A5F]">3. Caisse NF525, SEPA &amp; EBICS</span>
                    <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono text-[10px] font-bold">
                      100 % OK
                    </span>
                  </div>
                  <p className="text-slate-600 text-[11px]">
                    <strong>Site Heitz :</strong> Logiciel de caisse certifié <strong>NF525</strong>, ventes à l&apos;unité/produits dérivés, abonnements (mois / semaine / 4 semaines), prélèvements <strong>SEPA</strong> et protocole bancaire <strong>EBICS</strong>.
                  </p>
                  <p className="text-slate-800 text-[11px] font-medium">
                    <strong>Dans C.Fitness OS :</strong> Pavé tactile TPV Comptoir [F9], écriture comptable conforme NF525 (<code className="font-mono">/api/financial/addCheckDetail</code> &amp; <code className="font-mono">/api/ticket</code>), contrôle temps réel du solde SEPA/EBICS (<code className="font-mono">finBalance</code>) et régularisation CB/SEPA 1-clic.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowTpvDrawer(true)}
                  className="w-full py-1.5 px-2 rounded bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-[11px] cursor-pointer"
                >
                  Ouvrir Caisse TPV NF525 [F9] →
                </button>
              </div>

              <div className="p-3 rounded border border-slate-200 bg-slate-50/70 flex flex-col justify-between space-y-2">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-[#1E3A5F]">4. Automatisation &amp; Fidélisation</span>
                    <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono text-[10px] font-bold">
                      100 % OK
                    </span>
                  </div>
                  <p className="text-slate-600 text-[11px]">
                    <strong>Site Heitz :</strong> Programme de fidélité (points, parrainage, récompenses, messages d&apos;anniversaire), adhésions en ligne et relance automatique des inactifs au bon moment.
                  </p>
                  <p className="text-slate-800 text-[11px] font-medium">
                    <strong>Dans C.Fitness OS :</strong> Détection automatique des inactifs (&gt;14j / &gt;15j sans passage via <code className="font-mono">/api/userPassages/browse</code>) et déclenchement des campagnes SMS 07 OVHcloud (relance absence, impayé SEPA, parrainage &amp; anniversaire).
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => rewardMemberLoyaltyOrReferral(selectedMember.id, 'parrainage')}
                  className="w-full py-1.5 px-2 rounded bg-[#1E3A5F] hover:bg-[#162c49] text-white font-bold text-[11px] cursor-pointer"
                >
                  Créditer +150 pts Parrainage ({selectedMember.firstName}) →
                </button>
              </div>

              <div className="p-3 rounded border border-slate-200 bg-slate-50/70 flex flex-col justify-between space-y-2">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-[#1E3A5F]">5. Statistiques, FMI &amp; KPI</span>
                    <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono text-[10px] font-bold">
                      100 % OK
                    </span>
                  </div>
                  <p className="text-slate-600 text-[11px]">
                    <strong>Site Heitz :</strong> Suivi de performance en temps réel, fréquentation instantanée, traçabilité comptable complète et indicateurs-clés de rentabilité multi-sites.
                  </p>
                  <p className="text-slate-800 text-[11px] font-medium">
                    <strong>Dans C.Fitness OS :</strong> Connecteur <code className="font-mono">FITNESS KPI</code> actif (<code className="font-mono">GET /api/fmi/date/:date</code>, <code className="font-mono">GET /api/ticket</code>, <code className="font-mono">idCenter 5052 &amp; 5053</code>) alimentant le tableau de bord Bi-Club.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveSection('dashboard')}
                  className="w-full py-1.5 px-2 rounded bg-[#1E3A5F] hover:bg-[#162c49] text-white font-bold text-[11px] cursor-pointer"
                >
                  Voir Tableau de Bord FMI &amp; KPI →
                </button>
              </div>

              <div className="p-3 rounded border border-slate-200 bg-slate-50/70 flex flex-col justify-between space-y-2">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-[#1E3A5F]">6. API Ouvertes &amp; Badge Mobile</span>
                    <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono text-[10px] font-bold">
                      100 % OK
                    </span>
                  </div>
                  <p className="text-slate-600 text-[11px]">
                    <strong>Site Heitz :</strong> « Connectez facilement HEITZ System à vos outils grâce à des API ouvertes sans interrompre votre activité » + carte d&apos;accès digitale smartphone.
                  </p>
                  <p className="text-slate-800 text-[11px] font-medium">
                    <strong>Dans C.Fitness OS :</strong> Authentification officielle <code className="font-mono">POST /api/developer/getToken?v=2</code> (clé générée dans <code className="font-mono">Configuration.exe</code>) + envoi du badge QR Code sur le smartphone du client.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveSection('crm')}
                  className="w-full py-1.5 px-2 rounded bg-[#1E3A5F] hover:bg-[#162c49] text-white font-bold text-[11px] cursor-pointer"
                >
                  Générer un QR Code d&apos;essai dans le CRM →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* WINDOW 2: TECHNOGYM CHECKUP (BALANCE RÉVOLUTIONNAIRE INTÉGRÉE MYWELLNESS) */}
      {/* ===================================================================== */}
      {activeSoftwareTab === 'INBODY_LB120' && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-amber-400/30 text-white rounded-xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <div className="text-[11px] font-mono uppercase tracking-wider text-amber-400 font-bold">
                2× Stations Technogym Checkup (Carré de Soie &amp; Beynost) · Balance BIA Multi-Fréquence &amp; Caméra 3D · Intégrées Nativement à Mywellness
              </div>
              <h2 className="text-lg font-black tracking-tight mt-0.5">
                Bilans Physiques Technogym Checkup (Wellness Age™, Composition Corporelle BIA, Mobilité, Équilibre &amp; Force)
              </h2>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => handleOpenMywellness()}
                className="px-3.5 py-2 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-extrabold flex items-center gap-1.5 shrink-0 cursor-pointer"
              >
                <Dumbbell className="w-4 h-4" />
                <span>Ouvrir Technogym Mywellness Cloud</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
              {canViewHealthData && (
                <button
                  onClick={() => setShowNewScanForm(!showNewScanForm)}
                  className="px-3.5 py-2 rounded-lg bg-white text-slate-900 hover:bg-amber-50 text-xs font-extrabold flex items-center gap-1.5 shrink-0 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  {showNewScanForm ? 'Fermer la saisie' : 'Nouveau Bilan Technogym Checkup'}
                </button>
              )}
            </div>
          </div>

          {!canViewHealthData ? (
            <div className="p-6 rounded-xl bg-white border border-slate-200 flex items-center gap-3 text-xs text-slate-700">
              <Lock className="w-5 h-5 text-amber-600 shrink-0" />
              <div>
                <div className="font-bold text-slate-900">
                  Accès restreint aux données biométriques (Rôle actuel : {currentUser.role})
                </div>
                <p className="text-slate-500 mt-0.5">
                  Conformément au RGPD (§11), les bilans Technogym Checkup (Mywellness) sont réservés aux Coachs, Apprentis BPJEPS et Direction.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {showNewScanForm && (
                <form
                  onSubmit={handleCreateInBodyScan}
                  className="p-4 rounded-xl bg-white border-2 border-slate-900 space-y-3 text-xs"
                >
                  <div className="font-bold text-slate-900">
                    Synchroniser un Bilan Technogym Checkup (Balance Révolutionnaire — Carré de Soie ou Beynost)
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Nom &amp; Prénom
                      </label>
                      <input
                        type="text"
                        required
                        value={scanPersonName}
                        onChange={(e) => setScanPersonName(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-white"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Profil</label>
                      <select
                        value={scanPersonType}
                        onChange={(e) =>
                          setScanPersonType(e.target.value as 'Adhérent' | 'Prospect')
                        }
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-white"
                      >
                        <option value="Adhérent">Adhérent</option>
                        <option value="Prospect">Prospect (Séance Découverte)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Club &amp; Station Technogym Checkup
                      </label>
                      <select
                        value={scanClubId}
                        onChange={(e) => setScanClubId(e.target.value as ClubId)}
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-white"
                      >
                        <option value="carre-de-soie">
                          Carré de Soie (Technogym Checkup · Mywellness)
                        </option>
                        <option value="beynost">
                          Beynost (Technogym Checkup · Mywellness)
                        </option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Poids (kg)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={scanWeightKg}
                        onChange={(e) => setScanWeightKg(Number(e.target.value))}
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-white font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Masse Musculaire SMM (kg)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={scanSmmKg}
                        onChange={(e) => setScanSmmKg(Number(e.target.value))}
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Masse Grasse PBF (%)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={scanPbfPct}
                        onChange={(e) => setScanPbfPct(Number(e.target.value))}
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Eau Corporelle TBW (L)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={scanWaterL}
                        onChange={(e) => setScanWaterL(Number(e.target.value))}
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Graisse Viscérale (1-20)
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={20}
                        value={scanVisceral}
                        onChange={(e) => setScanVisceral(Number(e.target.value))}
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-white font-mono"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    <input
                      type="text"
                      value={scanCoachNote}
                      onChange={(e) => setScanCoachNote(e.target.value)}
                      placeholder="Prescription Coach / Programme Biocircuit Mywellness..."
                      className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold cursor-pointer"
                    >
                      Synchroniser Bilan Technogym Checkup
                    </button>
                  </div>
                </form>
              )}

              {/* Technogym Checkup & Mywellness Assessment Sheets */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {inBodyScans.map((scan) => {
                  const metrics = computeInBodySheetMetrics(scan);
                  const fatMassKg =
                    Math.round(((scan.weightKg * scan.bodyFatPercent) / 100) * 10) / 10;
                  return (
                    <div
                      key={scan.id}
                      className="bg-white rounded-xl border-2 border-slate-300 shadow-sm overflow-hidden text-xs"
                    >
                      {/* Technogym Checkup & Mywellness Header */}
                      <div className="border-b-4 border-amber-400 bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between">
                        <div>
                          <div className="flex items-baseline gap-2">
                            <span className="text-lg font-black tracking-tight text-amber-400">
                              TECHNOGYM CHECKUP™
                            </span>
                            <span className="font-mono font-bold text-[11px] text-slate-300">
                              [{scan.deviceModel}]
                            </span>
                          </div>
                          <div className="text-[11px] font-mono text-slate-300 mt-1">
                            ID : <strong className="text-white">{scan.personName}</strong> (
                            {scan.personType}) | Date : {scan.date} | Club :{' '}
                            {formatClubName(scan.clubId, true)}
                          </div>
                        </div>

                        {/* Top-Right Wellness Age & Score Box */}
                        <div className="flex items-center gap-2">
                          <div className="border border-amber-400/60 rounded-lg px-3 py-1.5 bg-slate-800 text-right">
                            <div className="text-[9px] font-bold uppercase tracking-wider text-amber-400">
                              Wellness Age™
                            </div>
                            <div className="font-mono text-lg font-black text-white tabular-nums">
                              {scan.wellnessAgeYears || 31}{' '}
                              <span className="text-[10px] font-normal text-slate-300">ans</span>
                            </div>
                          </div>
                          <div className="border border-slate-600 rounded-lg px-3 py-1.5 bg-slate-800 text-right">
                            <div className="text-[9px] font-bold uppercase tracking-wider text-emerald-400">
                              Score Checkup
                            </div>
                            <div className="font-mono text-lg font-black text-white tabular-nums">
                              {metrics.inBodyScore}
                              <span className="text-[10px] font-normal text-slate-400"> /100</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="p-5 space-y-4">
                        {/* Block 1: Analyse Muscle-Graisse with Official InBody Ruler (70% - 160%) */}
                        <div className="border border-slate-300 rounded overflow-hidden">
                          <div className="bg-slate-800 text-white px-3 py-1.5 font-bold text-[11px] flex items-center justify-between">
                            <span>Analyse Muscle-Graisse</span>
                            <span className="font-mono text-[10px] text-slate-300">
                              Sous (70-85%) | Normal (85-115%) | Sur (115-160%)
                            </span>
                          </div>

                          <div className="p-3 space-y-2.5 bg-white">
                            {/* Scale Ruler Header */}
                            <div className="grid grid-cols-12 text-[9px] font-mono text-slate-400 border-b border-slate-200 pb-1">
                              <div className="col-span-4 font-sans font-bold text-slate-600">
                                Paramètre
                              </div>
                              <div className="col-span-2 text-center bg-slate-50">Sous</div>
                              <div className="col-span-3 text-center bg-emerald-50/60 text-emerald-800 font-bold">
                                Normal (100%)
                              </div>
                              <div className="col-span-3 text-center bg-slate-50">Sur</div>
                            </div>

                            {/* Row 1: Poids */}
                            <div className="grid grid-cols-12 items-center gap-2">
                              <div className="col-span-4 flex justify-between pr-2">
                                <span className="font-bold text-slate-800">Poids</span>
                                <span className="font-mono font-bold text-slate-900 tabular-nums">
                                  {scan.weightKg} kg
                                </span>
                              </div>
                              <div className="col-span-8 h-3.5 bg-slate-100 rounded-xs relative overflow-hidden border border-slate-200">
                                <div
                                  className="h-full bg-slate-800"
                                  style={{ width: `${metrics.weightBarPct}%` }}
                                />
                              </div>
                            </div>

                            {/* Row 2: SMM (Masse Musculaire Squelettique) */}
                            <div className="grid grid-cols-12 items-center gap-2">
                              <div className="col-span-4 flex justify-between pr-2">
                                <span className="font-bold text-slate-800">SMM (Muscle)</span>
                                <span className="font-mono font-bold text-emerald-700 tabular-nums">
                                  {scan.skeletalMuscleMassKg} kg
                                </span>
                              </div>
                              <div className="col-span-8 h-3.5 bg-slate-100 rounded-xs relative overflow-hidden border border-slate-200">
                                <div
                                  className="h-full bg-[#A6192E]"
                                  style={{ width: `${metrics.smmBarPct}%` }}
                                />
                              </div>
                            </div>

                            {/* Row 3: Masse Grasse */}
                            <div className="grid grid-cols-12 items-center gap-2">
                              <div className="col-span-4 flex justify-between pr-2">
                                <span className="font-bold text-slate-800">Masse Grasse</span>
                                <span className="font-mono font-bold text-slate-900 tabular-nums">
                                  {fatMassKg} kg
                                </span>
                              </div>
                              <div className="col-span-8 h-3.5 bg-slate-100 rounded-xs relative overflow-hidden border border-slate-200">
                                <div
                                  className="h-full bg-slate-600"
                                  style={{ width: `${metrics.pbfBarPct}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Block 2: Analyse de l'Obésité (PGC %) & Masse Maigre Segmentaire (5 zones) */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="border border-slate-300 rounded overflow-hidden">
                            <div className="bg-slate-800 text-white px-3 py-1.5 font-bold text-[11px]">
                              Masse Maigre Segmentaire (5 zones)
                            </div>
                            <div className="p-2.5 grid grid-cols-2 gap-1.5 font-mono text-[11px] tabular-nums">
                              <div className="p-1.5 rounded bg-slate-50 border border-slate-200 flex justify-between">
                                <span className="text-slate-500">Bras G. :</span>
                                <span className="font-bold">
                                  {metrics.segmentalLean.leftArmKg} kg
                                </span>
                              </div>
                              <div className="p-1.5 rounded bg-slate-50 border border-slate-200 flex justify-between">
                                <span className="text-slate-500">Bras D. :</span>
                                <span className="font-bold">
                                  {metrics.segmentalLean.rightArmKg} kg
                                </span>
                              </div>
                              <div className="col-span-2 p-1.5 rounded bg-slate-100 border border-slate-300 flex justify-between">
                                <span className="text-slate-700 font-bold">Tronc Central :</span>
                                <span className="font-black text-slate-900">
                                  {metrics.segmentalLean.trunkKg} kg ({metrics.segmentalLean.balanceStatus})
                                </span>
                              </div>
                              <div className="p-1.5 rounded bg-slate-50 border border-slate-200 flex justify-between">
                                <span className="text-slate-500">Jambe G. :</span>
                                <span className="font-bold">
                                  {metrics.segmentalLean.leftLegKg} kg
                                </span>
                              </div>
                              <div className="p-1.5 rounded bg-slate-50 border border-slate-200 flex justify-between">
                                <span className="text-slate-500">Jambe D. :</span>
                                <span className="font-bold">
                                  {metrics.segmentalLean.rightLegKg} kg
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="border border-slate-300 rounded overflow-hidden">
                            <div className="bg-slate-800 text-white px-3 py-1.5 font-bold text-[11px]">
                              Paramètres BIA &amp; Mobilité Technogym Checkup
                            </div>
                            <div className="p-2.5 space-y-1.5 text-[11px]">
                              <div className="flex justify-between border-b border-slate-100 pb-1">
                                <span className="text-slate-600">PGC (Taux Masse Grasse) :</span>
                                <span className="font-mono font-bold text-slate-900">
                                  {scan.bodyFatPercent} % ({metrics.pbfStatus})
                                </span>
                              </div>
                              <div className="flex justify-between border-b border-slate-100 pb-1">
                                <span className="text-slate-600">Eau Corporelle Totale :</span>
                                <span className="font-mono font-bold">{scan.totalBodyWaterL} L</span>
                              </div>
                              <div className="flex justify-between border-b border-slate-100 pb-1">
                                <span className="text-slate-600">Niveau Graisse Viscérale :</span>
                                <span className="font-mono font-bold">
                                  Niveau {scan.visceralFatLevel} / 20
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-600">Métabolisme Basal (BMR) :</span>
                                <span className="font-mono font-bold text-emerald-700">
                                  {metrics.basalMetabolicRateKcal} kcal/j
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="p-2.5 rounded bg-rose-50/70 border border-rose-200 text-[11px] text-slate-900 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                          <div>
                            <span className="font-bold text-[#A6192E]">
                              Prescription Coach &amp; Mywellness :
                            </span>{' '}
                            {scan.coachNote}
                          </div>
                          <button
                            type="button"
                            onClick={() => handleOpenMywellness(scan.id, scan.personName)}
                            className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-[11px] flex items-center gap-1.5 shrink-0 cursor-pointer"
                          >
                            <Dumbbell className="w-3.5 h-3.5" />
                            <span>Ouvrir fiche Mywellness</span>
                            <ExternalLink className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
