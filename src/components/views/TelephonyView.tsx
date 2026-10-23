import React, { useState } from 'react';
import { useCfos } from '../../context/CfosContext';
import {
  PhoneOutgoing,
  Headphones,
  Radio,
  RefreshCw,
  ShieldCheck,
  UserCheck,
  UserX,
  Sparkles,
  Volume2,
} from 'lucide-react';
import { PhoneLine } from '../../types/cfos';

export function TelephonyView() {
  const {
    clubs,
    clubFilter,
    currentUser,
    phoneLines,
    employees,
    callLogs,
    prospects,
    takePhoneLineSession,
    releasePhoneLineSession,
    placeSimulatedCall,
  } = useCfos();

  const [selectedCallId, setSelectedCallId] = useState<string>(callLogs[0]?.id || '');
  const [sviDigit, setSviDigit] = useState<string>('1');
  const [listenModeLineId, setListenModeLineId] = useState<string | null>(null);
  const [whisperModeLineId, setWhisperModeLineId] = useState<string | null>(null);
  const [lineModes, setLineModes] = useState<Record<string, '04' | '07'>>({});
  const [lastDialedMessage, setLastDialedMessage] = useState<string | null>(null);

  const filteredLines =
    clubFilter === 'all' ? phoneLines : phoneLines.filter((l) => l.clubId === clubFilter);
  const filteredCalls =
    clubFilter === 'all' ? callLogs : callLogs.filter((c) => c.clubId === clubFilter);
  const selectedCall =
    filteredCalls.find((c) => c.id === selectedCallId) || filteredCalls[0] || null;

  const canSupervise = currentUser.role === 'admin' || currentUser.role === 'manager';

  const getLineMode = (lineId: string): '04' | '07' => lineModes[lineId] || '07';

  const handleDialSimulation = (line: PhoneLine, outcome: 'RDV Séance fixé' | 'Pas de réponse') => {
    const mode = getLineMode(line.id);
    const clubProspect = prospects.find(
      (p) => p.clubId === line.clubId && !p.bloctelListed
    );
    const res = placeSimulatedCall({
      prospectId: clubProspect?.id,
      clubId: line.clubId,
      lineMode: mode,
      outcome,
      durationSec: outcome === 'RDV Séance fixé' ? 210 : 25,
    });
    if (res.ok) {
      setLastDialedMessage(
        `Appel sortant depuis ${line.label} présenté avec ${res.callerIdUsed} (Mode ${
          mode === '04' ? 'Fixe Local 04' : 'Pool Mobile 07 anti-spam'
        } · ${outcome})`
      );
    }
  };

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
      action: 'Affiche le bouclier SEPA si finBalance < 0 €',
    },
    '3': {
      title: 'Touche 3 — Bilan InBody, suivi Technogym ou cours collectifs',
      route: 'Sonnerie des 2 postes Coachs du club appelé (Plateau musculation & Bureau Bilan)',
      action: 'Ouverture directe du planning coaching & bilans InBody',
    },
    '4': {
      title: 'Touche 4 — Horaires (6h-23h 7j/7), adresse, parking & accès',
      route: 'Annonce vocale studio haute définition + envoi automatique d’un SMS Google Maps / Waze',
      action: 'Zéro interruption de l’équipe en club',
    },
    '0': {
      title: 'Touche 0 — Parler directement à l’accueil du club',
      route: 'Sonnerie générale Accueil + Manager de permanence',
      action: 'Priorité haute en salle',
    },
  };

  return (
    <div className="space-y-6">
      {/* Top Explanation & Quick Test Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-blue-600">
            Module M2 · Remplacement Intégral Ringover (Décisions D2, D3, D4, D5)
          </div>
          <h1 className="text-lg sm:text-xl font-bold text-slate-900 mt-1">
            Centrale Téléphonique WebRTC (12 Lignes) &amp; Rotation Anti-Spam 04 / 07
          </h1>
          <p className="text-xs text-slate-600 mt-1">
            6 lignes Carré de Soie + 6 lignes Beynost (4 commerciaux + 2 coachs/club) · Hot-desking en 1 clic · Transcription IA Whisper locale
          </p>
        </div>

        {lastDialedMessage && (
          <div className="px-3.5 py-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs font-medium text-emerald-900">
            {lastDialedMessage}
          </div>
        )}
      </div>

      {/* 12 Virtual Lines Matrix */}
      <div className="bg-white border border-slate-200 rounded-xl p-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Matrice Temps Réel des Postes ({filteredLines.length} lignes affichées)
            </h2>
            <p className="text-xs text-slate-500">
              Cliquez sur « Prendre mon poste » pour rattacher votre session ou basculez entre Fixe 04 et Mobile 07 avant d&apos;appeler.
            </p>
          </div>
          <div className="text-xs text-slate-500">
            Session :{' '}
            <span className="font-semibold text-slate-800">
              {currentUser.firstName} {currentUser.lastName}
            </span>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredLines.map((line) => {
            const assignedEmp = employees.find((e) => e.id === line.activeAgentId);
            const clubObj = clubs.find((c) => c.id === line.clubId);
            const mode = getLineMode(line.id);
            const isListening = listenModeLineId === line.id;
            const isWhispering = whisperModeLineId === line.id;

            return (
              <div
                key={line.id}
                className={`rounded-xl border p-4 transition-colors ${
                  line.status === 'en_appel'
                    ? 'border-blue-300 bg-blue-50/20'
                    : line.activeAgentId
                    ? 'border-slate-200 bg-white'
                    : 'border-dashed border-slate-300 bg-slate-50/60'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="text-[11px] font-mono font-semibold text-slate-500">
                      Ext. {line.extension} ·{' '}
                      {line.clubId === 'carre-de-soie' ? 'Carré de Soie' : 'Beynost'} ·{' '}
                      {line.lineType === 'commercial' ? 'Commercial' : 'Coach'}
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 mt-0.5">{line.label}</h3>
                  </div>
                  <span
                    className={`text-xs font-semibold ${
                      line.status === 'en_appel'
                        ? 'text-blue-700'
                        : line.activeAgentId
                        ? 'text-emerald-700'
                        : 'text-slate-400'
                    }`}
                  >
                    {line.status === 'en_appel'
                      ? 'En communication'
                      : line.activeAgentId
                      ? 'En ligne (Prêt)'
                      : 'Poste libre'}
                  </span>
                </div>

                {/* Assigned Employee / Hot-Desking */}
                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  {assignedEmp ? (
                    <div className="text-xs">
                      <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                        <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                        {assignedEmp.firstName} {assignedEmp.lastName}
                      </div>
                      <div className="text-[11px] text-slate-500">{assignedEmp.jobTitle}</div>
                    </div>
                  ) : (
                    <div className="text-xs text-slate-400 flex items-center gap-1.5">
                      <UserX className="w-3.5 h-3.5" />
                      Aucun salarié logué
                    </div>
                  )}

                  <div className="flex items-center gap-1.5">
                    {assignedEmp ? (
                      <button
                        onClick={() => releasePhoneLineSession(line.id)}
                        className="px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-rose-50 hover:border-rose-200 hover:text-rose-700 text-xs font-medium text-slate-700 cursor-pointer"
                      >
                        Libérer
                      </button>
                    ) : (
                      <button
                        onClick={() => takePhoneLineSession(line.id)}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium cursor-pointer"
                      >
                        Prendre mon poste
                      </button>
                    )}
                  </div>
                </div>

                {/* Outbound Caller ID Selector (04 vs 07) */}
                {line.lineType === 'commercial' && clubObj && (
                  <div className="mt-3 pt-3 border-t border-slate-100 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 font-medium">Numéro présenté :</span>
                      <span className="font-mono font-semibold text-slate-900 tabular-nums">
                        {mode === '04' ? clubObj.landline : clubObj.mobilePool[0]}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-1.5">
                      {(['04', '07'] as const).map((t) => (
                        <button
                          key={t}
                          onClick={() => setLineModes((prev) => ({ ...prev, [line.id]: t }))}
                          className={`py-1.5 px-2 rounded-lg text-[11px] font-semibold border transition-colors cursor-pointer ${
                            mode === t
                              ? 'bg-orange-600 text-white border-orange-600'
                              : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {t === '04' ? 'Fixe Local (04)' : 'Pool Mobile (07)'}
                        </button>
                      ))}
                    </div>

                    <div className="flex items-center gap-1.5 pt-1">
                      <button
                        onClick={() => handleDialSimulation(line, 'RDV Séance fixé')}
                        className="flex-1 py-1.5 px-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-semibold flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <PhoneOutgoing className="w-3 h-3" />
                        Simuler Appel Qualifié
                      </button>
                      <button
                        onClick={() => handleDialSimulation(line, 'Pas de réponse')}
                        className="flex-1 py-1.5 px-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-800 text-[11px] font-semibold flex items-center justify-center gap-1 cursor-pointer"
                        title="Rotation anti-spam automatique sur le pool 07"
                      >
                        <RefreshCw className="w-3 h-3" />
                        Relance (Rotation 07)
                      </button>
                    </div>
                  </div>
                )}

                {/* Admin Supervision: Double écoute & Chuchotement */}
                {canSupervise && (
                  <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <span className="text-[11px] text-slate-500">Supervision Direction :</span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setListenModeLineId(isListening ? null : line.id)}
                        className={`px-2 py-1 rounded text-[11px] font-medium flex items-center gap-1 cursor-pointer ${
                          isListening
                            ? 'bg-amber-600 text-white'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        <Headphones className="w-3 h-3" />
                        {isListening ? 'Écoute active' : 'Écouter'}
                      </button>
                      <button
                        onClick={() => setWhisperModeLineId(isWhispering ? null : line.id)}
                        className={`px-2 py-1 rounded text-[11px] font-medium flex items-center gap-1 cursor-pointer ${
                          isWhispering
                            ? 'bg-purple-600 text-white'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        <Radio className="w-3 h-3" />
                        {isWhispering ? 'Chuchotement' : 'Chuchoter'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Two-Column Section: Pool 04/07 & SVI Simulator + AI Call Coaching */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Outbound Pool & SVI Simulator */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Pool Numéros Sortants Certifiés STIR/SHAKEN (D5)
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Conformité ARCEP Manifone/Onoff Business : rotation automatique au 2e essai consécutif pour éviter le marquage « Susceptible d&apos;être un spam ».
            </p>
            <div className="mt-3 divide-y divide-slate-100">
              {clubs.map((club) => (
                <div key={club.id} className="py-3 space-y-1.5 text-xs">
                  <div className="font-bold text-slate-900">{club.name}</div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Fixe Local 04 :</span>
                    <span className="font-mono font-bold text-slate-900 tabular-nums">
                      {club.landline}
                    </span>
                  </div>
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-slate-500">Pool Mobiles 07 :</span>
                    <div className="text-right font-mono text-emerald-700 font-semibold tabular-nums">
                      {club.mobilePool.map((num) => (
                        <div key={num}>{num}</div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-orange-600" />
              Simulateur SVI / Accueil Vocal Intelligent (§4 M2.2)
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Testez le routage vocal automatique pour les appels entrants des 2 clubs :
            </p>
            <div className="mt-3 flex gap-2">
              {['1', '2', '3', '4', '0'].map((digit) => (
                <button
                  key={digit}
                  onClick={() => setSviDigit(digit)}
                  className={`w-10 h-10 rounded-lg font-mono font-bold text-sm transition-colors cursor-pointer ${
                    sviDigit === digit
                      ? 'bg-orange-600 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {digit}
                </button>
              ))}
            </div>
            {sviRoutes[sviDigit] && (
              <div className="mt-3 p-3.5 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-1.5">
                <div className="font-bold text-slate-900">{sviRoutes[sviDigit].title}</div>
                <div className="text-slate-600">
                  <span className="font-semibold text-slate-800">Routage :</span>{' '}
                  {sviRoutes[sviDigit].route}
                </div>
                <div className="text-emerald-700 font-medium">
                  <span className="font-semibold">Automatisme :</span>{' '}
                  {sviRoutes[sviDigit].action}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Local Whisper GPU Call Transcripts & Coaching Score */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-5 flex flex-col">
          <div className="pb-4 border-b border-slate-100">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-orange-600" />
              Transcriptions IA Locales (faster-whisper GPU) &amp; Coaching
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              100% traité en local sur le serveur C.Fitness · Zéro coût à la minute · Analyse automatique du script commercial
            </p>
          </div>

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-2">
            {filteredCalls.slice(0, 6).map((call) => (
              <button
                key={call.id}
                onClick={() => setSelectedCallId(call.id)}
                className={`p-3 rounded-lg border text-left transition-colors cursor-pointer ${
                  selectedCall?.id === call.id
                    ? 'border-orange-500 bg-orange-50/40'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span className="font-semibold text-slate-800 truncate">
                    {call.prospectName}
                  </span>
                  <span>{call.clubId === 'carre-de-soie' ? 'CDS' : 'BEY'}</span>
                </div>
                <div className="text-[11px] font-mono text-slate-500 mt-0.5 tabular-nums">
                  {call.direction === 'entrant' ? 'Entrant' : 'Sortant'} · {call.displayedCallerId}
                </div>
                <div className="mt-1.5 flex items-center justify-between text-xs">
                  <span className="font-semibold text-emerald-700">
                    {call.whisperScore ? `Score ${call.whisperScore}/100` : call.outcome}
                  </span>
                  <span className="text-[11px] text-slate-400 tabular-nums">
                    {Math.floor(call.durationSec / 60)}m{call.durationSec % 60}s
                  </span>
                </div>
              </button>
            ))}
          </div>

          {selectedCall && (
            <div className="mt-4 pt-4 border-t border-slate-100 space-y-4 text-xs">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="font-bold text-sm text-slate-900">
                    {selectedCall.prospectName}
                  </span>{' '}
                  <span className="font-mono text-slate-500">
                    ({selectedCall.prospectPhone})
                  </span>
                  <div className="text-slate-500 mt-0.5">
                    Résultat :{' '}
                    <span className="font-semibold text-slate-800">{selectedCall.outcome}</span> ·{' '}
                    Numéro C.Fitness présenté :{' '}
                    <span className="font-mono">{selectedCall.displayedCallerId}</span>
                  </div>
                </div>
                {selectedCall.whisperScore && (
                  <div className="text-right">
                    <div className="text-sm font-bold text-emerald-700">
                      Respect Script C.Fitness : {selectedCall.whisperScore}/100
                    </div>
                  </div>
                )}
              </div>

              {selectedCall.whisperTranscript && (
                <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1.5">
                  <div className="font-semibold text-slate-900">
                    Transcription locale (faster-whisper large-v3-turbo) :
                  </div>
                  <p className="text-slate-700 leading-relaxed italic">
                    « {selectedCall.whisperTranscript} »
                  </p>
                </div>
              )}

              {selectedCall.detectedObjection && (
                <div className="p-3 rounded-lg border border-slate-200">
                  <div className="font-semibold text-slate-900">
                    Objection détectée &amp; traitement :
                  </div>
                  <p className="text-slate-600 mt-1">{selectedCall.detectedObjection}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
