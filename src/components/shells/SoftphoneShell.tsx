import React, { useState } from 'react';
import { useCfos } from '../../context/CfosContext';
import {
  Phone,
  PhoneOff,
  Mic,
  MicOff,
  ArrowLeft,
  UserCheck,
  Sparkles,
  Volume2,
  Server,
  ShieldCheck,
  LayoutGrid,
  Smartphone,
} from 'lucide-react';
import { ThemeColorControl } from '../ThemeColorControl';

export function SoftphoneShell() {
  const {
    clubs,
    currentUser,
    phoneLines,
    prospects,
    sipTrunkProvider,
    takePhoneLineSession,
    releasePhoneLineSession,
    placeSimulatedCall,
    setShellMode,
    setActiveSection,
    themeMode,
  } = useCfos();

  const isDark = themeMode === 'dark';

  const [softphoneTab, setSoftphoneTab] = useState<'DIALER' | 'SVI_STUDIO'>('DIALER');
  const [sviDigit, setSviDigit] = useState<string>('1');
  const [selectedLineId, setSelectedLineId] = useState<string>(
    phoneLines[0]?.id || 'line-cds-com-1'
  );
  const [lineMode, setLineMode] = useState<'04' | '07'>('07');
  const [dialNumber, setDialNumber] = useState(prospects[0]?.phone || '06 74 81 92 03');
  const [inCall, setInCall] = useState(false);
  const [muted, setMuted] = useState(false);
  const [callBanner, setCallBanner] = useState<string | null>(null);

  const activeLine = phoneLines.find((l) => l.id === selectedLineId) || phoneLines[0];
  const activeClub = clubs.find((c) => c.id === activeLine?.clubId) || clubs[0];
  const matchedProspect = prospects.find(
    (p) => p.phone.replace(/\s+/g, '') === dialNumber.replace(/\s+/g, '')
  );

  const sviRoutes: Record<string, { title: string; route: string; action: string }> = {
    '1': {
      title: 'Touche 1 — Réserver une séance découverte ou s’inscrire',
      route:
        'Sonnerie simultanée des 4 postes Commerciaux du club appelé (20s) → Débordement inter-club (Carré de Soie ↔ Beynost)',
      action: 'Si non répondu : création automatique Fiche Prospect + SMS de rappel',
    },
    '2': {
      title: 'Touche 2 — Adhérent : abonnement, badge ou prélèvement',
      route:
        'Postes Commerciaux / Accueil du club avec remontée automatique de la fiche Heitz (solde, validité, dernier passage)',
      action: 'Affiche le bouclier SEPA si finBalanceEur < 0 €',
    },
    '3': {
      title: 'Touche 3 — Bilan Technogym Checkup, suivi Mywellness ou cours collectifs',
      route: 'Sonnerie des 2 postes Coachs du club appelé (Plateau musculation & Espace Checkup)',
      action: 'Ouverture directe du planning coaching & bilans Technogym Checkup',
    },
    '4': {
      title: 'Touche 4 — Horaires (6h-23h 7j/7), adresse, parking & accès',
      route:
        'Annonce vocale studio haute définition + envoi automatique d’un SMS Google Maps / Waze',
      action: 'Zéro interruption de l’équipe en club',
    },
    '0': {
      title: 'Touche 0 — Parler directement à l’accueil du club',
      route: 'Sonnerie générale Accueil + Manager de permanence',
      action: 'Priorité haute en salle',
    },
  };

  const handleStartCall = () => {
    if (!activeLine) return;
    const res = placeSimulatedCall({
      prospectId: matchedProspect?.id,
      customPhone: dialNumber,
      customName: matchedProspect
        ? `${matchedProspect.firstName} ${matchedProspect.lastName}`
        : 'Contact sortant',
      clubId: activeLine.clubId,
      lineMode,
      outcome: 'RDV Séance fixé',
      durationSec: 195,
    });
    setInCall(true);
    setCallBanner(res.message);
  };

  const handleEndCall = () => {
    setInCall(false);
  };

  const openFullRingoverConsole = () => {
    setActiveSection('telephony');
    setShellMode('admin');
  };

  return (
    <div
      className={`min-h-screen cfos-adaptive-shell flex flex-col items-center justify-start sm:py-6 transition-colors duration-200 ${
        isDark
          ? 'cfos-dark bg-[#0F111A] text-white'
          : 'bg-[#EEF0F7] text-slate-900'
      }`}
    >
      <div
        className={`w-full max-w-lg min-h-screen sm:min-h-[820px] sm:rounded-3xl sm:border sm:shadow-2xl flex flex-col justify-between p-4 sm:p-5 space-y-3 ${
          isDark
            ? 'bg-slate-950 sm:border-slate-800 text-white'
            : 'bg-white sm:border-slate-200 text-slate-900'
        }`}
      >
        {/* Top Bar */}
        <header
          className={`space-y-3 pb-3 border-b ${
            isDark ? 'border-slate-800' : 'border-slate-200'
          }`}
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setShellMode('admin')}
                className={`min-h-[40px] px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer border ${
                  isDark
                    ? 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-white'
                    : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-800'
                }`}
              >
                <ArrowLeft className="w-4 h-4 text-violet-400" />
                <span>Admin</span>
              </button>

              <button
                onClick={() => setShellMode('employe')}
                className="min-h-[40px] px-2.5 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>App Mobile</span>
              </button>
            </div>

            <div className="flex items-center gap-1.5">
              <ThemeColorControl variant="compact" />
              <button
                onClick={openFullRingoverConsole}
                className="min-h-[40px] px-3 py-1.5 rounded-xl bg-[#00BFA5]/20 hover:bg-[#00BFA5]/30 border border-[#00BFA5]/40 text-[#00BFA5] text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Console 12 Lignes</span>
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-[11px] font-semibold text-emerald-500">
              WebRTC SIP.js ·{' '}
              {sipTrunkProvider === 'ovhcloud_sip'
                ? 'Trunk SIP OVHcloud (sip.ovh.fr)'
                : 'OVHcloud Mobile 07 & SMS'}
            </span>
            <span className="font-bold">
              {currentUser.firstName} {currentUser.lastName}
            </span>
          </div>

          {/* 2 Prominent Tabs inside Softphone WebRTC : Clavier vs Studio SVI */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              type="button"
              onClick={() => setSoftphoneTab('DIALER')}
              className={`py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer border ${
                softphoneTab === 'DIALER'
                  ? 'bg-violet-600 text-white border-violet-600'
                  : isDark
                  ? 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
                  : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
              }`}
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Poste WebRTC (04/07)</span>
            </button>
            <button
              type="button"
              onClick={() => setSoftphoneTab('SVI_STUDIO')}
              className={`py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer border ${
                softphoneTab === 'SVI_STUDIO'
                  ? 'bg-violet-600 text-white border-violet-600'
                  : isDark
                  ? 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
                  : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
              }`}
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>🎛️ Studio SVI &amp; Passerelles</span>
            </button>
          </div>
        </header>

        {softphoneTab === 'DIALER' ? (
          <>
            {/* Line Selector & Hot-Desking */}
            <div className="my-2 space-y-3">
              <div
                className={`p-3.5 rounded-2xl border space-y-2.5 text-xs ${
                  isDark
                    ? 'bg-slate-900 border-slate-800'
                    : 'bg-slate-50 border-slate-200'
                }`}
              >
                <label className="block font-semibold text-slate-400">
                  Poste virtuel sélectionné (12 lignes C.Fitness) :
                </label>
                <select
                  value={activeLine?.id}
                  onChange={(e) => setSelectedLineId(e.target.value)}
                  className={`w-full px-3 py-2.5 rounded-xl border font-semibold min-h-[44px] ${
                    isDark
                      ? 'bg-slate-950 border-slate-700 text-white'
                      : 'bg-white border-slate-200 text-slate-900'
                  }`}
                >
                  {phoneLines.map((l) => (
                    <option key={l.id} value={l.id}>
                      Ext. {l.extension} — {l.label} (
                      {l.clubId === 'carre-de-soie' ? 'CDS' : 'BEY'})
                    </option>
                  ))}
                </select>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-slate-400">
                    Statut :{' '}
                    <strong className="text-emerald-500">
                      {activeLine?.activeAgentId ? 'Poste actif' : 'Non assigné'}
                    </strong>
                  </span>
                  {activeLine?.activeAgentId === currentUser.id ? (
                    <button
                      onClick={() => releasePhoneLineSession(activeLine.id)}
                      className="px-3 py-1.5 rounded-lg bg-rose-950 text-rose-300 border border-rose-800 font-semibold cursor-pointer"
                    >
                      Quitter mon poste
                    </button>
                  ) : (
                    <button
                      onClick={() => activeLine && takePhoneLineSession(activeLine.id)}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      Prendre mon poste
                    </button>
                  )}
                </div>
              </div>

              {/* 04 vs 07 Selector */}
              {activeLine && activeClub && (
                <div
                  className={`p-3.5 rounded-2xl border space-y-2 text-xs ${
                    isDark
                      ? 'bg-slate-900 border-slate-800'
                      : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Numéro sortant affiché :</span>
                    <span className="font-mono font-bold text-violet-400 tabular-nums">
                      {lineMode === '04' ? activeClub.landline : activeClub.mobilePool[0]}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono">
                    Passerelle :{' '}
                    <span className="text-emerald-500 font-semibold">
                      {lineMode === '04'
                        ? 'Trunk SIP OVHcloud (sip.ovh.fr · STIR/SHAKEN)'
                        : 'Yeastar TG400 4G VoLTE (10.10.0.14 · Carte SIM 07 ARCEP)'}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {(['04', '07'] as const).map((t) => (
                      <button
                        key={t}
                        onClick={() => setLineMode(t)}
                        className={`min-h-[44px] rounded-xl font-bold text-xs cursor-pointer border ${
                          lineMode === t
                            ? 'bg-violet-600 text-white border-violet-500'
                            : isDark
                            ? 'bg-slate-950 text-slate-300 border-slate-800'
                            : 'bg-white text-slate-700 border-slate-200'
                        }`}
                      >
                        {t === '04' ? 'Fixe 04 (SIP OVHcloud)' : 'Mobile 07 (SIM 4G TG400)'}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* CRM Screen-Pop */}
              {matchedProspect && (
                <div className="p-3.5 rounded-2xl bg-blue-950/60 border border-blue-800 text-xs space-y-1">
                  <div className="font-bold text-blue-200 flex items-center justify-between">
                    <span>
                      Fiche CRM : {matchedProspect.firstName} {matchedProspect.lastName}
                    </span>
                    <span className="font-mono">
                      {matchedProspect.clubId === 'carre-de-soie' ? 'CDS' : 'BEY'}
                    </span>
                  </div>
                  <div className="text-blue-300">Objectif : {matchedProspect.goal}</div>
                  <div className="text-[11px] text-blue-400">
                    Source : {matchedProspect.source} · Étape : {matchedProspect.stage}
                  </div>
                </div>
              )}
            </div>

            {/* Number Display & Keypad */}
            <div className="space-y-3">
              <input
                type="text"
                value={dialNumber}
                onChange={(e) => setDialNumber(e.target.value)}
                className={`w-full py-3 px-4 rounded-2xl border text-center font-mono text-xl font-bold tracking-wider ${
                  isDark
                    ? 'bg-slate-900 border-slate-800 text-white'
                    : 'bg-slate-50 border-slate-200 text-slate-900'
                }`}
              />

              {callBanner && (
                <div className="p-3 rounded-xl bg-emerald-950/90 border border-emerald-700 text-[11px] text-emerald-200 font-medium flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{callBanner}</span>
                </div>
              )}

              <div className="grid grid-cols-3 gap-2">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'].map((d) => (
                  <button
                    key={d}
                    onClick={() => setDialNumber((prev) => prev + d)}
                    className={`h-12 rounded-xl font-mono text-base font-bold cursor-pointer ${
                      isDark
                        ? 'bg-slate-900 hover:bg-slate-800 text-white'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-900'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>

              {/* Call Actions */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                {!inCall ? (
                  <button
                    onClick={handleStartCall}
                    className="col-span-2 min-h-[52px] rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Phone className="w-4 h-4" />
                    Appeler (Rotation anti-spam 04/07)
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => setMuted(!muted)}
                      className={`min-h-[52px] rounded-2xl font-bold text-xs flex items-center justify-center gap-2 cursor-pointer ${
                        isDark
                          ? 'bg-slate-800 text-white'
                          : 'bg-slate-200 text-slate-800'
                      }`}
                    >
                      {muted ? (
                        <MicOff className="w-4 h-4 text-rose-400" />
                      ) : (
                        <Mic className="w-4 h-4" />
                      )}
                      {muted ? 'Micro coupé' : 'Couper micro'}
                    </button>
                    <button
                      onClick={handleEndCall}
                      className="min-h-[52px] rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <PhoneOff className="w-4 h-4" />
                      Raccrocher
                    </button>
                  </>
                )}
              </div>
            </div>
          </>
        ) : (
          /* ONGLET STUDIO SVI & PASSERELLES DIRECTEMENT DANS LE WEBRTC */
          <div className="flex-1 space-y-3 text-xs overflow-y-auto py-1">
            <div
              className={`p-3.5 rounded-2xl border space-y-2 ${
                isDark
                  ? 'bg-slate-900 border-slate-800'
                  : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="font-bold text-emerald-500 flex items-center gap-1.5">
                <Volume2 className="w-4 h-4" />
                <span>Studio SVI Ringover / Asterisk — Arbre Vocal Interactif</span>
              </div>
              <p className="text-slate-400 text-[11px]">
                Cliquez sur une touche pour inspecter le routage téléphonique bi-club :
              </p>
              <div className="flex gap-2 pt-1">
                {['1', '2', '3', '4', '0'].map((digit) => (
                  <button
                    key={digit}
                    type="button"
                    onClick={() => setSviDigit(digit)}
                    className={`w-10 h-10 rounded-xl font-mono font-bold text-sm cursor-pointer ${
                      sviDigit === digit
                        ? 'bg-violet-600 text-white'
                        : isDark
                        ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {digit}
                  </button>
                ))}
              </div>
              {sviRoutes[sviDigit] && (
                <div
                  className={`p-3 rounded-xl border space-y-1.5 mt-2 ${
                    isDark
                      ? 'bg-slate-950 border-slate-800'
                      : 'bg-white border-slate-200'
                  }`}
                >
                  <div className="font-bold">{sviRoutes[sviDigit].title}</div>
                  <div className="text-slate-400">
                    <span className="font-semibold">Routage :</span>{' '}
                    {sviRoutes[sviDigit].route}
                  </div>
                  <div className="text-emerald-500">
                    <span className="font-semibold">Action CRM :</span>{' '}
                    {sviRoutes[sviDigit].action}
                  </div>
                </div>
              )}
            </div>

            <div
              className={`p-3.5 rounded-2xl border space-y-2.5 ${
                isDark
                  ? 'bg-slate-900 border-slate-800'
                  : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="font-bold text-violet-400 flex items-center gap-1.5">
                <Server className="w-4 h-4" />
                <span>Les 4 Passerelles Télécom &amp; CTI (Zéro Abonnement Ringover)</span>
              </div>
              <div className="space-y-2 text-[11px]">
                <div
                  className={`p-2.5 rounded-xl border ${
                    isDark
                      ? 'bg-slate-950 border-slate-800'
                      : 'bg-white border-slate-200'
                  }`}
                >
                  <div className="font-bold">
                    1. Passerelle WebRTC Navigateur (SIP.js / WSS)
                  </div>
                  <div className="text-slate-400">
                    Asterisk 20 LTS (:8089/ws) en Opus 48 kHz + SRTP directement dans Chrome.
                  </div>
                </div>
                <div
                  className={`p-2.5 rounded-xl border ${
                    isDark
                      ? 'bg-slate-950 border-slate-800'
                      : 'bg-white border-slate-200'
                  }`}
                >
                  <div className="font-bold">
                    2. Passerelle Fixe 04 (Trunk SIP OVHcloud + STIR/SHAKEN)
                  </div>
                  <div className="text-slate-400">
                    Trunk `sip.ovh.fr` conforme ARCEP n° 2022-1583 pour `04 26 22 55 30` (CDS) et `04 22 91 36 82` (Beynost).
                  </div>
                </div>
                <div
                  className={`p-2.5 rounded-xl border ${
                    isDark
                      ? 'bg-slate-950 border-slate-800'
                      : 'bg-white border-slate-200'
                  }`}
                >
                  <div className="font-bold">
                    3. Passerelle Mobile 07 &amp; SMS (Yeastar TG400 4G VoLTE)
                  </div>
                  <div className="text-slate-400">
                    Passerelle `10.10.0.14` hébergeant les cartes SIM 07 avec rotation anti-spam et STOP SMS 36111.
                  </div>
                </div>
                <div
                  className={`p-2.5 rounded-xl border ${
                    isDark
                      ? 'bg-slate-950 border-slate-800'
                      : 'bg-white border-slate-200'
                  }`}
                >
                  <div className="font-bold">
                    4. Passerelle CTI Screen-Pop CRM &amp; Heitz + IA whisper-rs
                  </div>
                  <div className="text-slate-400">
                    Remontée automatique de fiche Prospect CRM ou Adhérent Heitz (`finBalanceEur`) et transcription locale.
                  </div>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-emerald-950/40 border border-emerald-800/60 flex items-center gap-2 text-[11px] text-emerald-300">
              <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>
                Toutes les passerelles sont actives. Vous pouvez aussi ouvrir la vue complète sur 12 lignes via le bouton en haut à droite.
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
