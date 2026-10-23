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
} from 'lucide-react';

export function SoftphoneShell() {
  const {
    clubs,
    currentUser,
    phoneLines,
    prospects,
    takePhoneLineSession,
    releasePhoneLineSession,
    placeSimulatedCall,
    setShellMode,
  } = useCfos();

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

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-start sm:py-6">
      <div className="w-full max-w-md min-h-screen sm:min-h-[820px] sm:rounded-3xl bg-slate-950 sm:border sm:border-slate-800 sm:shadow-2xl flex flex-col justify-between p-4 sm:p-5">
        {/* Top Bar */}
        <header className="flex items-center justify-between pb-3 border-b border-slate-800">
          <button
            onClick={() => setShellMode('admin')}
            className="min-h-[44px] px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-orange-400" />
            <span>Retour Admin</span>
          </button>
          <div className="text-right">
            <div className="text-[11px] font-semibold text-blue-400">
              WebRTC SIP.js · LiveKit SFU
            </div>
            <div className="text-xs font-bold">
              {currentUser.firstName} {currentUser.lastName}
            </div>
          </div>
        </header>

        {/* Line Selector & Hot-Desking */}
        <div className="my-3 space-y-3">
          <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2.5 text-xs">
            <label className="block font-semibold text-slate-400">
              Poste virtuel sélectionné (12 lignes C.Fitness) :
            </label>
            <select
              value={activeLine?.id}
              onChange={(e) => setSelectedLineId(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-semibold min-h-[44px]"
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
                <strong className="text-emerald-400">
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
            <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Numéro sortant affiché :</span>
                <span className="font-mono font-bold text-orange-400 tabular-nums">
                  {lineMode === '04' ? activeClub.landline : activeClub.mobilePool[0]}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {(['04', '07'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setLineMode(t)}
                    className={`min-h-[44px] rounded-xl font-bold text-xs cursor-pointer border ${
                      lineMode === t
                        ? 'bg-orange-600 text-white border-orange-500'
                        : 'bg-slate-950 text-slate-300 border-slate-800'
                    }`}
                  >
                    {t === '04' ? 'Fixe Local 04' : 'Pool Mobile 07'}
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
            className="w-full py-3 px-4 rounded-2xl bg-slate-900 border border-slate-800 text-center font-mono text-xl font-bold tracking-wider text-white"
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
                className="h-12 rounded-xl bg-slate-900 hover:bg-slate-800 font-mono text-base font-bold cursor-pointer"
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
                  className="min-h-[52px] rounded-2xl bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer"
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
      </div>
    </div>
  );
}
