import React, { useState } from 'react';
import {
  Activity,
  CheckCircle2,
  Copy,
  Dumbbell,
  ExternalLink,
  RefreshCw,
  Wifi,
  WifiOff,
} from 'lucide-react';
import { useCfos } from '../context/CfosContext';
import { buildMywellnessContextualUrl, formatClubName } from '../domain/rules';
import type { ClubId } from '../types/cfos';

export interface MywellnessQuickConnectProps {
  variant?: 'card' | 'header' | 'sidebar' | 'compact';
  defaultClubId?: ClubId;
  selectedMemberId?: string;
}

export function MywellnessQuickConnect({
  variant = 'card',
  defaultClubId,
  selectedMemberId,
}: MywellnessQuickConnectProps) {
  const {
    clubs,
    clubFilter,
    currentUser,
    heitzMembers,
    inBodyScans,
    serverPowerStatus,
    openMywellnessLink,
    setActiveSection,
    themeMode,
  } = useCfos();

  const isDark = themeMode === 'dark';

  const effectiveClub: ClubId =
    defaultClubId || (clubFilter === 'beynost' ? 'beynost' : 'carre-de-soie');

  const activeClubObj = clubs.find((c) => c.id === effectiveClub) || clubs[0];

  const [targetMemberId, setTargetMemberId] = useState<string>(
    selectedMemberId || ''
  );
  const [simulatedOffline, setSimulatedOffline] = useState<boolean>(false);
  const [lastLaunchedPortal, setLastLaunchedPortal] = useState<{
    url: string;
    label: string;
    timestamp: string;
  } | null>(null);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [syncPulse, setSyncPulse] = useState(false);
  const [checkupLatencyMs, setCheckupLatencyMs] = useState<{
    cds: number;
    bey: number;
  }>({ cds: 9, bey: 14 });

  // Real-time connection status (Green = connected, Red = disconnected / degraded / outage)
  const isCheckupConnected =
    !simulatedOffline &&
    !activeClubObj?.degradedMode &&
    serverPowerStatus === 'nominal';

  const selectedMember = heitzMembers.find(
    (m) => m.id === targetMemberId || m.mywellnessMemberId === targetMemberId
  );

  const latestScan = inBodyScans[0];

  const previewLink = buildMywellnessContextualUrl({
    mywellnessMemberId: selectedMember?.mywellnessMemberId,
    personName: selectedMember
      ? `${selectedMember.firstName} ${selectedMember.lastName}`
      : undefined,
    clubId: selectedMember?.homeClubId || effectiveClub,
  });

  const handleSingleClickLaunch = () => {
    const res = openMywellnessLink({
      mywellnessMemberId: selectedMember?.mywellnessMemberId,
      personName: selectedMember
        ? `${selectedMember.firstName} ${selectedMember.lastName}`
        : undefined,
      clubId: selectedMember?.homeClubId || effectiveClub,
    });
    setLastLaunchedPortal({
      url: res.url,
      label: res.label,
      timestamp: new Date().toLocaleTimeString('fr-FR'),
    });
    setCopiedUrl(false);
    setActiveSection('devices', 'checkup');
  };

  const handleCopyUrl = async (url: string) => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
        setCopiedUrl(true);
        setTimeout(() => setCopiedUrl(false), 2500);
      }
    } catch {
      // ignore clipboard errors in restricted contexts
    }
  };

  const handleRefreshCheckupStatus = () => {
    setSyncPulse(true);
    setSimulatedOffline(false);
    setCheckupLatencyMs((prev) => ({
      cds: prev.cds === 9 ? 8 : 9,
      bey: prev.bey === 14 ? 12 : 14,
    }));
    setTimeout(() => setSyncPulse(false), 500);
  };

  // 1. AdminShell Left Sidebar Variant
  if (variant === 'sidebar') {
    return (
      <div
        data-testid="mywellness-quick-connect-sidebar"
        className={`mx-3 mb-2 p-3 rounded-2xl border space-y-2.5 text-xs ${
          isDark
            ? 'bg-[#151B2B] border-slate-800 text-slate-200'
            : 'bg-slate-50 border-slate-200/80 text-slate-700'
        }`}
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span
              aria-hidden="true"
              className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                isCheckupConnected
                  ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]'
                  : 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]'
              }`}
            />
            <span className={`font-bold text-[11px] tracking-tight truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Technogym Checkup
            </span>
          </div>
          <button
            type="button"
            onClick={() => setSimulatedOffline((prev) => !prev)}
            title="Basculer l'indicateur de statut Vert (Connecté) / Rouge (Hors ligne)"
            className={`px-2 py-0.5 rounded-md font-mono text-[10px] font-bold cursor-pointer border transition-colors whitespace-nowrap shrink-0 ${
              isCheckupConnected
                ? 'bg-emerald-500/15 text-emerald-500 border-emerald-500/30 hover:bg-emerald-500/25'
                : 'bg-rose-500/20 text-rose-500 border-rose-500/40 hover:bg-rose-500/30'
            }`}
          >
            {isCheckupConnected ? 'Connecté' : 'Hors ligne'}
          </button>
        </div>

        <div className={`text-[11px] font-mono tabular-nums flex items-center justify-between pt-1 border-t ${isDark ? 'border-slate-800 text-slate-400' : 'border-slate-200/70 text-slate-500'}`}>
          <span>CDS {isCheckupConnected ? `${checkupLatencyMs.cds} ms` : 'ERR'}</span>
          <span aria-hidden="true">·</span>
          <span>BEY {isCheckupConnected ? `${checkupLatencyMs.bey} ms` : 'ERR'}</span>
          <span aria-hidden="true">·</span>
          <span
            className={`font-semibold ${
              isCheckupConnected ? 'text-emerald-500' : 'text-rose-500'
            }`}
          >
            {isCheckupConnected ? 'Sync OK' : 'Alerte'}
          </span>
        </div>

        <button
          type="button"
          onClick={handleSingleClickLaunch}
          data-testid="mywellness-sidebar-launch-link"
          className="w-full min-h-[38px] py-2 px-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs whitespace-nowrap"
        >
          <Dumbbell className="w-3.5 h-3.5 shrink-0" />
          <span>Mywellness Cloud</span>
          <ExternalLink className="w-3 h-3 shrink-0" />
        </button>
      </div>
    );
  }

  // 2. AdminShell Sticky Top Header Variant
  if (variant === 'header') {
    return (
      <div
        data-testid="mywellness-quick-connect-header"
        className="flex items-center gap-2"
      >
        <button
          type="button"
          onClick={() => setSimulatedOffline((prev) => !prev)}
          title="Indicateur de statut Technogym Checkup (Vert = Connecté / Rouge = Hors ligne) — Cliquer pour tester"
          data-testid="mywellness-header-status-pill"
          className={`hidden 2xl:flex min-h-[38px] px-3 py-1.5 rounded-xl text-xs font-semibold items-center gap-2 border cursor-pointer transition-colors whitespace-nowrap shrink-0 ${
            isCheckupConnected
              ? isDark
                ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-200'
              : isDark
              ? 'bg-rose-500/15 text-rose-300 border-rose-500/30'
              : 'bg-rose-50 hover:bg-rose-100 text-rose-800 border-rose-200'
          }`}
        >
          <span
            aria-hidden="true"
            className={`w-2.5 h-2.5 rounded-full shrink-0 ${
              isCheckupConnected ? 'bg-emerald-500' : 'bg-rose-600'
            }`}
          />
          {isCheckupConnected ? (
            <Wifi className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
          ) : (
            <WifiOff className="w-3.5 h-3.5 text-rose-500 shrink-0" />
          )}
          <span className="font-mono tabular-nums text-[11px]">
            {isCheckupConnected
              ? `Checkup : Connecté (${checkupLatencyMs.cds} ms)`
              : 'Checkup : Hors ligne'}
          </span>
        </button>

        <button
          type="button"
          onClick={handleSingleClickLaunch}
          data-testid="mywellness-header-launch-link"
          title="Ouvrir le module intégré Technogym Checkup & Mywellness dans C.Fitness OS"
          className={`min-h-[38px] px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all whitespace-nowrap shrink-0 ${
            isDark
              ? 'bg-violet-500/15 hover:bg-violet-500/25 text-violet-300 border-violet-500/30'
              : 'bg-violet-50 hover:bg-violet-100 text-violet-700 border-violet-200/80'
          }`}
        >
          <Dumbbell className="w-3.5 h-3.5 shrink-0" />
          <span>Mywellness</span>
        </button>
      </div>
    );
  }

  // 3. Compact Grid Widget Variant (for EmployeeDashboardGrid / 3-column layouts)
  if (variant === 'compact') {
    return (
      <section
        data-testid="mywellness-quick-connect-compact"
        className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-2xs space-y-3 flex flex-col justify-between"
      >
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-violet-600 to-indigo-500 text-white flex items-center justify-center shrink-0 shadow-2xs">
                <Dumbbell className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <h2 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                  Technogym Checkup &amp; Mywellness
                </h2>
                <div className="text-[11px] text-slate-500 truncate">
                  Bilans corporels &amp; suivi sportif
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSimulatedOffline((prev) => !prev)}
              title="Basculer le statut Vert (Connecté) / Rouge (Hors ligne)"
              className={`px-2 py-1 rounded-lg font-mono text-[10px] font-bold border flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 ${
                isCheckupConnected
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-rose-50 text-rose-700 border-rose-200'
              }`}
            >
              <span
                aria-hidden="true"
                className={`w-2 h-2 rounded-full ${
                  isCheckupConnected ? 'bg-emerald-500' : 'bg-rose-500'
                }`}
              />
              <span>{isCheckupConnected ? 'Connecté' : 'Hors ligne'}</span>
            </button>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            Stations <strong>Technogym Checkup</strong> (C.Fitness Center &amp; Place) synchronisées avec Mywellness Cloud.
          </p>

          <div className="divide-y divide-slate-100 text-xs font-mono tabular-nums">
            <div className="py-1.5 flex items-center justify-between">
              <span className="font-sans text-slate-600">C.Fitness Center (#1)</span>
              <span className={isCheckupConnected ? 'text-emerald-600 font-bold' : 'text-rose-600 font-bold'}>
                {isCheckupConnected ? `Connecté · ${checkupLatencyMs.cds} ms` : 'Hors ligne'}
              </span>
            </div>
            <div className="py-1.5 flex items-center justify-between">
              <span className="font-sans text-slate-600">C.Fitness Place (#2)</span>
              <span className={isCheckupConnected ? 'text-emerald-600 font-bold' : 'text-rose-600 font-bold'}>
                {isCheckupConnected ? `Connecté · ${checkupLatencyMs.bey} ms` : 'Hors ligne'}
              </span>
            </div>
          </div>
        </div>

        <div className="pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={handleSingleClickLaunch}
            className="w-full min-h-[42px] py-2.5 px-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all shadow-2xs whitespace-nowrap"
          >
            <Dumbbell className="w-4 h-4 shrink-0" />
            <span>Ouvrir Bilans Mywellness &amp; Checkup</span>
          </button>
        </div>
      </section>
    );
  }

  // 4. Default Card Variant (C.Fitness OS unified card)
  return (
    <section
      data-testid="mywellness-quick-connect"
      className="bg-white border border-slate-200/80 rounded-2xl shadow-2xs overflow-hidden"
    >
      {/* Top C.Fitness OS Header */}
      <div className="p-5 space-y-4 border-b border-slate-100">
        <div className="flex items-start gap-3.5">
          <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-violet-600 to-indigo-500 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
            <Dumbbell className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500">
              <span className="font-semibold text-violet-600">
                Technogym Checkup &amp; Mywellness Cloud
              </span>
              <span aria-hidden="true">·</span>
              <span>Suivi sportif 100 % unifié</span>
              <span aria-hidden="true">·</span>
              <span>C.Fitness Center &amp; Place</span>
            </div>
            <h2 className="text-base sm:text-lg font-extrabold text-slate-900 leading-snug">
              Passerelle Rapide Mywellness &amp; Statut Technogym Checkup
            </h2>
          </div>
        </div>

        {/* Action Bar: Live Green/Red Connection Indicator + Refresh + Single-Click Internal Module Button */}
        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setSimulatedOffline((prev) => !prev)}
              data-testid="technogym-checkup-status-badge"
              title="Cliquer pour tester le statut Vert (Connecté) ou Rouge (Déconnecté)"
              className={`min-h-[40px] px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 border cursor-pointer transition-colors text-left ${
                isCheckupConnected
                  ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200'
                  : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200'
              }`}
            >
              <span
                aria-hidden="true"
                className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                  isCheckupConnected
                    ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]'
                    : 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]'
                }`}
              />
              {isCheckupConnected ? (
                <Wifi className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              ) : (
                <WifiOff className="w-3.5 h-3.5 text-rose-600 shrink-0" />
              )}
              <span className="font-mono tabular-nums">
                {isCheckupConnected
                  ? `Technogym Checkup : Connecté (${checkupLatencyMs.cds} ms / ${checkupLatencyMs.bey} ms)`
                  : 'Technogym Checkup : Déconnecté'}
              </span>
            </button>

            <button
              type="button"
              onClick={handleRefreshCheckupStatus}
              title="Actualiser la télémétrie Technogym Checkup"
              aria-label="Actualiser la connexion Technogym Checkup"
              className="min-h-[40px] min-w-[40px] p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 border border-slate-200 flex items-center justify-center cursor-pointer transition-colors shrink-0"
            >
              <RefreshCw
                className={`w-4 h-4 ${syncPulse ? 'animate-spin text-violet-600' : ''}`}
              />
            </button>
          </div>

          <button
            type="button"
            data-testid="mywellness-launch-btn"
            onClick={handleSingleClickLaunch}
            className="min-h-[40px] px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-all"
          >
            <Dumbbell className="w-4 h-4 shrink-0" />
            <span>Ouvrir Bilans Mywellness &amp; Checkup</span>
          </button>
        </div>
      </div>


      {/* Body: Two-Club Technogym Checkup Units + Contextual Member Deep-Link */}
      <div className="p-5 space-y-4">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-3.5">
          {/* Station 1: Carré de Soie */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <span
                  aria-hidden="true"
                  className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                    isCheckupConnected ? 'bg-emerald-500' : 'bg-rose-600'
                  }`}
                />
                <span className="text-xs sm:text-sm font-bold text-slate-900">
                  Technogym Checkup #1 — Carré de Soie
                </span>
              </div>

              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-bold tabular-nums border ${
                  isCheckupConnected
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-rose-50 text-rose-700 border-rose-200'
                }`}
              >
                {isCheckupConnected
                  ? `Connecté · ${checkupLatencyMs.cds} ms`
                  : 'Hors ligne'}
              </span>
            </div>

            <div className="pt-2 border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600 font-mono tabular-nums">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="font-sans font-medium text-slate-700">
                  BIA Multi-Fréquence &amp; Caméra 3D
                </span>
                <span aria-hidden="true" className="text-slate-400">·</span>
                <span>IP 10.10.0.55</span>
              </div>
              <span className="text-[11px] font-semibold text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200">
                Wellness Age™ {isCheckupConnected ? 'Actif' : 'Cache local'}
              </span>
            </div>
          </div>

          {/* Station 2: Beynost */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <span
                  aria-hidden="true"
                  className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                    isCheckupConnected ? 'bg-emerald-500' : 'bg-rose-600'
                  }`}
                />
                <span className="text-xs sm:text-sm font-bold text-slate-900">
                  Technogym Checkup #2 — Beynost
                </span>
              </div>

              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-bold tabular-nums border ${
                  isCheckupConnected
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-rose-50 text-rose-700 border-rose-200'
                }`}
              >
                {isCheckupConnected
                  ? `Connecté · ${checkupLatencyMs.bey} ms`
                  : 'Hors ligne'}
              </span>
            </div>

            <div className="pt-2 border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600 font-mono tabular-nums">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="font-sans font-medium text-slate-700">
                  BIA Multi-Fréquence &amp; Caméra 3D
                </span>
                <span aria-hidden="true" className="text-slate-400">·</span>
                <span>IP 10.20.0.55 (VPN 2,4 ms)</span>
              </div>
              <span className="text-[11px] font-semibold text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200">
                Wellness Age™ {isCheckupConnected ? 'Actif' : 'Cache local'}
              </span>
            </div>
          </div>
        </div>

        {/* Contextual Member Selector & Latest Checkup Telemetry */}
        <div className="pt-3 border-t border-slate-100 space-y-3 text-xs">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2.5">
            <label
              htmlFor="mywellness-target-select"
              className="font-semibold text-slate-700 shrink-0"
            >
              Ouverture contextuelle ({currentUser.firstName}) :
            </label>
            <select
              id="mywellness-target-select"
              aria-label="Sélectionner la cible Mywellness"
              value={targetMemberId}
              onChange={(e) => setTargetMemberId(e.target.value)}
              className="w-full sm:flex-1 min-h-[38px] px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 text-xs font-semibold focus:outline-none focus:border-violet-500 cursor-pointer"
            >
              <option value="">
                Portail Général Club ({formatClubName(effectiveClub, false)})
              </option>
              {heitzMembers.map((m) => (
                <option key={m.id} value={m.id}>
                  Fiche Adhérent : {m.firstName} {m.lastName} ({m.mywellnessMemberId || 'mw-cloud'} · Wellness Age™ {m.technogymCheckupWellnessAge || 31} ans)
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 text-slate-600">
            {selectedMember && (
              <div className="flex flex-wrap items-center gap-1.5 font-mono tabular-nums">
                <span>{selectedMember.technogymMoves30d} MOVEs</span>
                <span aria-hidden="true">·</span>
                <span className="font-semibold text-violet-600">
                  Wellness Age™ {selectedMember.technogymCheckupWellnessAge || 31} ans
                </span>
              </div>
            )}

            {latestScan && (
              <div className="flex flex-wrap items-center gap-2 text-slate-600">
                <Activity className="w-4 h-4 text-violet-600 shrink-0" />
                <span>
                  Dernier bilan Checkup :{' '}
                  <strong className="text-slate-900">{latestScan.personName}</strong>
                </span>
                <span aria-hidden="true">·</span>
                <span className="font-mono tabular-nums font-semibold text-slate-900">
                  Wellness Age™ {latestScan.wellnessAgeYears || 31} ans
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Active Portal Launch Confirmation Banner */}
        {lastLaunchedPortal && (
          <div
            data-testid="mywellness-portal-launched-banner"
            className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
          >
            <div className="flex items-start sm:items-center gap-2.5 min-w-0">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5 sm:mt-0" />
              <div className="min-w-0">
                <div className="font-bold text-slate-900 flex flex-wrap items-center gap-2">
                  <span>{lastLaunchedPortal.label}</span>
                  <span aria-hidden="true" className="text-slate-400">·</span>
                  <span className="font-mono tabular-nums text-[11px] text-violet-600 shrink-0">
                    {lastLaunchedPortal.timestamp}
                  </span>
                </div>
                <div className="font-mono text-[11px] text-slate-500 break-all">
                  {lastLaunchedPortal.url}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => handleCopyUrl(lastLaunchedPortal.url)}
                className="min-h-[36px] px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 font-semibold text-xs flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
              >
                <Copy className="w-3.5 h-3.5 text-violet-600" />
                <span>{copiedUrl ? 'Lien copié' : 'Copier l’URL'}</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveSection('devices')}
                className="min-h-[36px] px-3 py-1.5 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold text-xs flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
              >
                <Activity className="w-3.5 h-3.5" />
                <span>Détails Checkup</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export default MywellnessQuickConnect;

