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
  CheckCircle2,
} from 'lucide-react';
import { AccessEvent, ClubId } from '../../types/cfos';

export function DevicesHeitzView() {
  const {
    clubs,
    clubFilter,
    currentUser,
    heitzMembers,
    inBodyScans,
    simulateMemberGateScan,
    regularizeMemberSepa,
    toggleClubMode,
  } = useCfos();

  const [selectedClubGate, setSelectedClubGate] = useState<ClubId>('carre-de-soie');
  const [lastGateEvent, setLastGateEvent] = useState<AccessEvent | null>(null);

  const filteredMembers =
    clubFilter === 'all'
      ? heitzMembers
      : heitzMembers.filter((m) => m.homeClubId === clubFilter);

  const activeGateClub =
    clubs.find((c) => c.id === selectedClubGate) || clubs[0];

  // Strict RGPD Health Data Access Control (§11)
  const canViewHealthData =
    currentUser.role === 'admin' ||
    currentUser.role === 'manager' ||
    currentUser.role === 'coach' ||
    currentUser.role === 'apprenti';

  const handleSimulatePassage = (memberId: string, targetClub: ClubId) => {
    const ev = simulateMemberGateScan(memberId, targetClub);
    if (ev) {
      setLastGateEvent(ev);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Global Safety Controls */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-rose-600">
            Modules M7 &amp; M8 · Passerelle Heitz-WS.exe, InBody &amp; Technogym (Décision D9)
          </div>
          <h1 className="text-lg sm:text-xl font-bold text-slate-900 mt-1">
            Contrôle d&apos;Accès Tourniquets (&lt;50ms), Bouclier Impayés SEPA &amp; Bilans InBody
          </h1>
          <p className="text-xs text-slate-600 mt-1">
            Circulation libre Carré de Soie ↔ Beynost sans supplément (D9) · Blocage automatique si solde Heitz &lt; 0 € · Priorité absolue sécurité incendie
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => toggleClubMode(selectedClubGate, 'degradedMode')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer border ${
              activeGateClub.degradedMode
                ? 'bg-amber-600 text-white border-amber-600'
                : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
            }`}
          >
            {activeGateClub.degradedMode ? (
              <WifiOff className="w-4 h-4" />
            ) : (
              <Wifi className="w-4 h-4" />
            )}
            {activeGateClub.degradedMode
              ? 'Mode Dégradé VPN Actif (Cache 15m)'
              : 'Tunnel VPN Nominal (18ms)'}
          </button>

          <button
            onClick={() => toggleClubMode(selectedClubGate, 'fireAlarmOpen')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer border ${
              activeGateClub.fireAlarmOpen
                ? 'bg-rose-600 text-white border-rose-600'
                : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
            }`}
          >
            <Flame className="w-4 h-4" />
            {activeGateClub.fireAlarmOpen
              ? 'Évacuation Incendie (Portillons Libres)'
              : 'Tester Coupure Sécurité Incendie'}
          </button>
        </div>
      </div>

      {/* Live Turnstile & QR Code Simulator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Adhérents Heitz System &amp; Simulateur de Passage Tourniquet
              </h2>
              <p className="text-xs text-slate-500">
                Testez l&apos;appel <span className="font-mono">passageCode/generate</span> sur Carré de Soie ou Beynost :
              </p>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-slate-500">Portillon testé :</span>
              <button
                onClick={() => setSelectedClubGate('carre-de-soie')}
                className={`px-2.5 py-1 rounded text-xs font-semibold cursor-pointer ${
                  selectedClubGate === 'carre-de-soie'
                    ? 'bg-orange-600 text-white'
                    : 'bg-slate-100 text-slate-700'
                }`}
              >
                Carré de Soie
              </button>
              <button
                onClick={() => setSelectedClubGate('beynost')}
                className={`px-2.5 py-1 rounded text-xs font-semibold cursor-pointer ${
                  selectedClubGate === 'beynost'
                    ? 'bg-orange-600 text-white'
                    : 'bg-slate-100 text-slate-700'
                }`}
              >
                Beynost
              </button>
            </div>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {filteredMembers.map((member) => (
              <div
                key={member.id}
                className="py-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900">
                      {member.firstName} {member.lastName}
                    </span>
                    <span className="font-mono text-[11px] text-slate-500">
                      ({member.badgeCode} · Club d&apos;origine{' '}
                      {member.homeClubId === 'carre-de-soie' ? 'CDS' : 'BEY'})
                    </span>
                  </div>
                  <div className="text-slate-600">
                    {member.subscriptionName} · {member.technogymMoves30d} MOVEs Technogym (30j)
                    {member.daysSinceLastWorkout >= 15 && (
                      <span className="text-amber-700 font-semibold">
                        {' '}
                        · Inactif depuis {member.daysSinceLastWorkout} j (Alerte Rétention)
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`font-mono font-bold tabular-nums ${
                        member.finBalanceEur < 0 ? 'text-rose-600' : 'text-emerald-700'
                      }`}
                    >
                      Solde finBalance : {member.finBalanceEur.toFixed(2)} €
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleSimulatePassage(member.id, selectedClubGate)}
                    className="px-3 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold flex items-center gap-1.5 cursor-pointer"
                  >
                    <QrCode className="w-3.5 h-3.5 text-orange-400" />
                    Scanner au portillon (
                    {selectedClubGate === 'carre-de-soie' ? 'CDS' : 'BEY'})
                  </button>

                  {member.finBalanceEur < 0 && (
                    <button
                      onClick={() => regularizeMemberSepa(member.id)}
                      className="px-3 py-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 font-semibold flex items-center gap-1.5 cursor-pointer"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Régulariser SEPA
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Real-time Turnstile Response Panel */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between space-y-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Réponse Temps Réel <span className="font-mono text-sm">Heitz-WS.exe</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Affiche le jeton QR dynamique, la latence SQL et l&apos;alerte pupitre d&apos;accueil.
            </p>
          </div>

          {lastGateEvent ? (
            <div
              className={`p-4 rounded-xl border space-y-3 text-xs ${
                lastGateEvent.granted
                  ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950'
                  : 'bg-rose-50 border-rose-300 text-rose-950'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm flex items-center gap-2">
                  {lastGateEvent.granted ? (
                    <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  ) : (
                    <ShieldAlert className="w-5 h-5 text-rose-600" />
                  )}
                  {lastGateEvent.granted
                    ? 'OUVERTURE PORTILLON AUTORISÉE'
                    : 'OUVERTURE BLOQUÉE — ALERTE ACCUEIL'}
                </span>
                <span className="font-mono font-bold tabular-nums">
                  {lastGateEvent.latencyMs} ms
                </span>
              </div>

              <div className="space-y-1">
                <div>
                  <span className="font-semibold">Adhérent :</span>{' '}
                  {lastGateEvent.memberName} (Club d&apos;origine :{' '}
                  {lastGateEvent.homeClubId} → Portillon : {lastGateEvent.clubId})
                </div>
                <div>
                  <span className="font-semibold">Détail :</span> {lastGateEvent.reason}
                </div>
              </div>

              {lastGateEvent.qrTokenGenerated && (
                <div className="p-3 rounded-lg bg-white border border-slate-200 flex items-center gap-4">
                  <svg
                    viewBox="0 0 64 64"
                    className="w-16 h-16 shrink-0 text-slate-900"
                    fill="currentColor"
                  >
                    <rect x="4" y="4" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="4" />
                    <rect x="10" y="10" width="6" height="6" />
                    <rect x="42" y="4" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="4" />
                    <rect x="48" y="10" width="6" height="6" />
                    <rect x="4" y="42" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="4" />
                    <rect x="10" y="48" width="6" height="6" />
                    <rect x="28" y="8" width="6" height="6" />
                    <rect x="28" y="20" width="6" height="12" />
                    <rect x="20" y="28" width="18" height="6" />
                    <rect x="42" y="28" width="6" height="12" />
                    <rect x="28" y="44" width="12" height="6" />
                    <rect x="46" y="46" width="12" height="12" />
                  </svg>
                  <div className="font-mono text-[11px] break-all">
                    <div className="font-bold text-slate-900">Jeton passageCode/generate :</div>
                    <div className="text-slate-600 mt-0.5">
                      {lastGateEvent.qrTokenGenerated}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-6 rounded-xl border border-dashed border-slate-300 text-center text-xs text-slate-500">
              Cliquez sur « Scanner au portillon » en face d&apos;un adhérent pour tester le passage temps réel ou le bouclier anti-impayés SEPA.
            </div>
          )}

          <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 text-[11px] text-slate-600">
            <span className="font-bold text-slate-800">Règle D9 vérifiée :</span> Tout adhérent C.Fitness actif à Carré de Soie peut franchir les portillons de Beynost (et inversement) sans surcoût ni blocage inter-clubs.
          </div>
        </div>
      </div>

      {/* InBody 270 / 570 Biometric Section with RGPD Role Protection */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-600" />
              Bilans Biométriques InBody 270 / 570 &amp; Suivi Technogym Mywellness (M7)
            </h2>
            <p className="text-xs text-slate-500">
              Données de santé protégées (RGPD Art. 9) : consultation réservée aux Coachs diplômés, Apprentis BPJEPS et Direction.
            </p>
          </div>
        </div>

        {!canViewHealthData ? (
          <div className="p-6 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-3 text-xs text-slate-700">
            <Lock className="w-5 h-5 text-rose-600 shrink-0" />
            <div>
              <div className="font-bold text-slate-900">
                Accès restreint aux données biométriques (Rôle actuel : {currentUser.role})
              </div>
              <p className="text-slate-500 mt-0.5">
                Conformément au RGPD (§11), les résultats détaillés InBody sont masqués pour les profils non habilités.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {inBodyScans.map((scan) => (
              <div
                key={scan.id}
                className="p-4 rounded-xl border border-slate-200 space-y-3 text-xs"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-bold text-sm text-slate-900">{scan.personName}</span>
                    <div className="text-slate-500">
                      Bilan du {scan.date} · Appareil : {scan.deviceModel}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-bold text-emerald-700">
                      {scan.personType}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-2 pt-2 border-t border-slate-100 text-center">
                  <div className="p-2 rounded bg-slate-50">
                    <div className="text-[11px] text-slate-500">Poids</div>
                    <div className="font-bold text-slate-900 tabular-nums">
                      {scan.weightKg} kg
                    </div>
                  </div>
                  <div className="p-2 rounded bg-slate-50">
                    <div className="text-[11px] text-slate-500">Muscle squelet.</div>
                    <div className="font-bold text-emerald-700 tabular-nums">
                      {scan.skeletalMuscleMassKg} kg
                    </div>
                  </div>
                  <div className="p-2 rounded bg-slate-50">
                    <div className="text-[11px] text-slate-500">Masse grasse</div>
                    <div className="font-bold text-slate-900 tabular-nums">
                      {scan.bodyFatPercent}%
                    </div>
                  </div>
                  <div className="p-2 rounded bg-slate-50">
                    <div className="text-[11px] text-slate-500">Graisse visc.</div>
                    <div className="font-bold text-slate-900 tabular-nums">
                      Niv. {scan.visceralFatLevel}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
