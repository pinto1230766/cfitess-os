import React, { useState } from 'react';
import { useCfos } from '../../context/CfosContext';
import {
  PhoneOutgoing,
  PhoneIncoming,
  Headphones,
  Radio,
  ShieldCheck,
  UserCheck,
  UserX,
  Sparkles,
  Volume2,
  Server,
  Mic,
  MicOff,
  PauseCircle,
  PhoneForwarded,
  PhoneOff,
  Zap,
  Phone,
  Delete,
  CheckCircle2,
  MessageSquare,
  Tag,
  Voicemail,
  Users,
  Send,
  PhoneCall,
} from 'lucide-react';
import { CallLog, PhoneLine } from '../../types/cfos';
import { formatClubName, resolveTelecomOutboundRoute } from '../../domain/rules';

const KEYPAD_KEYS = [
  { digit: '1', sub: 'مه' },
  { digit: '2', sub: 'ABC' },
  { digit: '3', sub: 'DEF' },
  { digit: '4', sub: 'GHI' },
  { digit: '5', sub: 'JKL' },
  { digit: '6', sub: 'MNO' },
  { digit: '7', sub: 'PQRS' },
  { digit: '8', sub: 'TUV' },
  { digit: '9', sub: 'WXYZ' },
  { digit: '*', sub: '' },
  { digit: '0', sub: '+' },
  { digit: '#', sub: '' },
];

const RINGOVER_CALL_TAGS = [
  'RDV Séance fixé',
  'Prospect Chaud',
  'Hésite tarif',
  'À relancer J+1',
  'Voicemail Drop Studio',
  'Adhérent Heitz SAV',
];

export function TelephonyView() {
  const {
    clubs,
    clubFilter,
    currentUser,
    phoneLines,
    employees,
    callLogs,
    prospects,
    heitzMembers,
    sipTrunkProvider,
    setSipTrunkProvider,
    takePhoneLineSession,
    releasePhoneLineSession,
    placeSimulatedCall,
    qualifyRingoverCall,
    sendValidatedProspectSms,
  } = useCfos();

  const [ringoverTab, setRingoverTab] = useState<
    'ALL_CALLS' | 'POWER_DIALER' | 'SMS_OMNICANAL' | 'LIVE_LINES' | 'SVI_STUDIO'
  >('ALL_CALLS');

  const [selectedCallId, setSelectedCallId] = useState<string>(callLogs[0]?.id || '');
  const [sviDigit, setSviDigit] = useState<string>('1');
  const [listenModeLineId, setListenModeLineId] = useState<string | null>(null);
  const [whisperModeLineId, setWhisperModeLineId] = useState<string | null>(null);
  const [bargeInLineId, setBargeInLineId] = useState<string | null>(null);
  const [lineModes, setLineModes] = useState<Record<string, '04' | '07'>>({});
  const [lastDialedMessage, setLastDialedMessage] = useState<string | null>(null);

  // After-Call Work (Qualification Ringover : Tags + Note CRM)
  const [qualifyOutcome, setQualifyOutcome] = useState<CallLog['outcome']>('RDV Séance fixé');
  const [qualifyTags, setQualifyTags] = useState<string[]>(['RDV Séance fixé', 'Prospect Chaud']);
  const [qualifyNote, setQualifyNote] = useState<string>('');

  // SMS Collaboratif 07 state
  const [selectedSmsProspectId, setSelectedSmsProspectId] = useState<string>(
    prospects[0]?.id || ''
  );
  const [smsBodyText, setSmsBodyText] = useState<string>(
    'Bonjour, suite à notre échange chez C.Fitness, votre séance découverte est confirmée ! Présentez votre QR Code à l’accueil. STOP au 36111.'
  );

  // Ringover Docked Dialer Keypad state
  const [dialerNumber, setDialerNumber] = useState<string>('06 14 82 99 31');
  const [dialerMode, setDialerMode] = useState<'07' | '04'>('07');
  const [dialerClubId, setDialerClubId] = useState<'carre-de-soie' | 'beynost'>('carre-de-soie');

  // Active Call Control state (Ringover WebRTC Dialer)
  const [activeCallState, setActiveCallState] = useState<{
    prospectName: string;
    prospectPhone: string;
    clubId: 'carre-de-soie' | 'beynost';
    lineLabel: string;
    callerId: string;
    isMuted: boolean;
    isOnHold: boolean;
    transferredTo?: string;
  } | null>({
    prospectName: 'Sonia Benali',
    prospectPhone: '06 14 82 99 31',
    clubId: 'carre-de-soie',
    lineLabel: 'Poste Commercial #2 (Carré de Soie)',
    callerId: '07 56 88 41 12',
    isMuted: false,
    isOnHold: false,
  });

  const filteredLines =
    clubFilter === 'all' ? phoneLines : phoneLines.filter((l) => l.clubId === clubFilter);
  const filteredCalls =
    clubFilter === 'all' ? callLogs : callLogs.filter((c) => c.clubId === clubFilter);
  const selectedCall =
    filteredCalls.find((c) => c.id === selectedCallId) || filteredCalls[0] || null;

  const powerDialerQueue = prospects
    .filter(
      (p) =>
        !p.bloctelListed &&
        (p.stage === 'Nouveau' || p.stage === 'Contacté' || p.stage === 'Séance planifiée') &&
        (clubFilter === 'all' ? true : p.clubId === clubFilter)
    )
    .slice(0, 8);

  const smsEligibleProspects = prospects.filter((p) =>
    clubFilter === 'all' ? true : p.clubId === clubFilter
  );
  const selectedSmsProspect =
    smsEligibleProspects.find((p) => p.id === selectedSmsProspectId) ||
    smsEligibleProspects[0] ||
    null;

  // CTI Screen-Pop : Remontée automatique de fiche CRM ou Adhérent Heitz selon le numéro du Dialer
  const normalizedDialerPhone = dialerNumber.replace(/\s+/g, '');
  const screenPopProspect = prospects.find(
    (p) => p.phone.replace(/\s+/g, '') === normalizedDialerPhone
  );
  const screenPopHeitzMember = heitzMembers.find(
    (m) =>
      screenPopProspect &&
      m.firstName.toLowerCase() === screenPopProspect.firstName.toLowerCase() &&
      m.lastName.toLowerCase() === screenPopProspect.lastName.toLowerCase()
  ) || heitzMembers[0];

  const canSupervise = currentUser.role === 'admin' || currentUser.role === 'manager';

  const getLineMode = (lineId: string): '04' | '07' => lineModes[lineId] || '07';

  const toggleQualifyTag = (tag: string) => {
    setQualifyTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleDialFromSoftphone = (outcome: 'RDV Séance fixé' | 'Décroché — Qualifié') => {
    const matchedProspect = prospects.find(
      (p) => p.phone.replace(/\s+/g, '') === dialerNumber.replace(/\s+/g, '')
    );
    const res = placeSimulatedCall({
      prospectId: matchedProspect?.id,
      customPhone: dialerNumber,
      customName: matchedProspect
        ? `${matchedProspect.firstName} ${matchedProspect.lastName}`
        : 'Contact Ringover',
      clubId: dialerClubId,
      lineMode: dialerMode,
      outcome,
      durationSec: 190,
    });
    if (res.ok) {
      setActiveCallState({
        prospectName: matchedProspect
          ? `${matchedProspect.firstName} ${matchedProspect.lastName}`
          : 'Contact Externe',
        prospectPhone: dialerNumber,
        clubId: dialerClubId,
        lineLabel:
          dialerClubId === 'carre-de-soie'
            ? 'Softphone Ringover CDS'
            : 'Softphone Ringover Beynost',
        callerId: res.callerIdUsed || '07 56 88 41 12',
        isMuted: false,
        isOnHold: false,
      });
      setLastDialedMessage(
        `Appel Ringover WebRTC lancé vers ${dialerNumber} (présenté : ${res.callerIdUsed}) → ${outcome}`
      );
    }
  };

  const handleDialSimulation = (line: PhoneLine, outcome: 'RDV Séance fixé' | 'Pas de réponse') => {
    const mode = getLineMode(line.id);
    const routeInfo = resolveTelecomOutboundRoute(mode, sipTrunkProvider);
    const clubProspect = prospects.find((p) => p.clubId === line.clubId && !p.bloctelListed);
    const res = placeSimulatedCall({
      prospectId: clubProspect?.id,
      clubId: line.clubId,
      lineMode: mode,
      outcome,
      durationSec: outcome === 'RDV Séance fixé' ? 210 : 25,
    });
    if (res.ok) {
      setActiveCallState({
        prospectName: clubProspect
          ? `${clubProspect.firstName} ${clubProspect.lastName}`
          : 'Prospect C.Fitness',
        prospectPhone: clubProspect?.phone || '06 41 22 89 10',
        clubId: line.clubId,
        lineLabel: line.label,
        callerId: res.callerIdUsed || '07 56 88 41 12',
        isMuted: false,
        isOnHold: false,
      });
      setLastDialedMessage(
        `Appel sortant conforme ARCEP via ${routeInfo.hardwareGateway} depuis ${line.label} présenté avec ${res.callerIdUsed} (${outcome} · Tracé CRM Art. 4)`
      );
    }
  };

  const handlePowerDialProspect = (
    prospectId: string,
    mode: '04' | '07',
    outcome: 'RDV Séance fixé' | 'Messagerie',
    voicemailDropped = false
  ) => {
    const p = prospects.find((pr) => pr.id === prospectId);
    if (!p) return;
    setDialerNumber(p.phone);
    setDialerMode(mode);
    setDialerClubId(p.clubId);
    const res = placeSimulatedCall({
      prospectId: p.id,
      clubId: p.clubId,
      lineMode: mode,
      outcome,
      durationSec: voicemailDropped ? 8 : outcome === 'RDV Séance fixé' ? 195 : 30,
      voicemailDropped,
    });
    if (res.ok) {
      setActiveCallState({
        prospectName: `${p.firstName} ${p.lastName}`,
        prospectPhone: p.phone,
        clubId: p.clubId,
        lineLabel: p.clubId === 'carre-de-soie' ? 'Power-Dialer CDS' : 'Power-Dialer Beynost',
        callerId: res.callerIdUsed || '07 56 88 41 12',
        isMuted: false,
        isOnHold: false,
      });
      setLastDialedMessage(
        voicemailDropped
          ? `Voicemail Drop Studio Ringover déposé en 1 clic sur le répondeur de ${p.firstName} ${p.lastName} (${p.phone}) via ${res.callerIdUsed}`
          : `Click-to-Call Power-Dialer Ringover vers ${p.firstName} ${p.lastName} (${p.phone}) avec numéro présenté ${res.callerIdUsed} → ${outcome}`
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

  return (
    <div className="space-y-4">
      {/* ===================================================================== */}
      {/* EN-TÊTE UNIFIÉ C.FITNESS OS — TÉLÉPHONIE WEBRTC 04/07 & SMS           */}
      {/* ===================================================================== */}
      <div className="rounded-2xl overflow-hidden border border-slate-200/80 shadow-2xs bg-white">
        {/* C.Fitness OS Top Header Bar */}
        <div className="bg-white px-5 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200/80">
          {/* Brand Identity */}
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-violet-600 to-indigo-500 text-white font-black text-base flex items-center justify-center shadow-xs shrink-0">
              <PhoneCall className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-violet-600">
                  04 · La Téléphonie &amp; Campagnes SMS
                </span>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-violet-50 text-violet-700 border border-violet-200">
                  WebRTC SIP.js
                </span>
              </div>
              <h2 className="font-extrabold text-lg tracking-tight text-slate-900">
                Téléphonie Commerciale Bi-Club (Fixes 04 &amp; Mobiles 07)
              </h2>
              <div className="text-xs text-slate-500">
                OVHcloud Télécom &amp; Passerelle Yeastar 4G · 12 Lignes Bi-Club en Remplacement Ringover
              </div>
            </div>
          </div>

          {/* Right SIP Trunk Switcher (100% OVHcloud) */}
          <div className="flex flex-wrap items-center gap-2 shrink-0 text-xs">
            <button
              onClick={() => setSipTrunkProvider('ovhcloud_sip')}
              className={`px-3.5 py-2 rounded-xl font-bold border cursor-pointer transition-colors ${
                sipTrunkProvider === 'ovhcloud_sip'
                  ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white border-violet-600 shadow-2xs'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              Trunk SIP OVHcloud (Fixes 04)
            </button>
            <button
              onClick={() => setSipTrunkProvider('ovhcloud_mobile_07')}
              className={`px-3.5 py-2 rounded-xl font-bold border cursor-pointer transition-colors ${
                sipTrunkProvider === 'ovhcloud_mobile_07'
                  ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white border-violet-600 shadow-2xs'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              OVHcloud Mobile 07 &amp; SMS
            </button>
          </div>
        </div>

        {/* Dedicated Prominent 5-Tab Bar */}
        <div className="bg-slate-50 px-4 py-3 border-b border-slate-200/80">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
            {[
              {
                id: 'ALL_CALLS',
                num: '1',
                label: `Journal & Qualification (${filteredCalls.length})`,
              },
              {
                id: 'POWER_DIALER',
                num: '2',
                label: `Power-Dialer & Voicemail (${powerDialerQueue.length})`,
              },
              {
                id: 'SMS_OMNICANAL',
                num: '3',
                label: `SMS Collaboratifs 07 (${smsEligibleProspects.length})`,
              },
              {
                id: 'LIVE_LINES',
                num: '4',
                label: `Supervision (${filteredLines.length} lignes)`,
              },
              {
                id: 'SVI_STUDIO',
                num: '5',
                label: 'Studio SVI & 5 Passerelles',
              },
            ].map((t) => {
              const isActive = ringoverTab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setRingoverTab(t.id as typeof ringoverTab)}
                  className={`px-3 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer border ${
                    isActive
                      ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white border-violet-600 shadow-2xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <span
                    className={`w-5 h-5 rounded-full text-[10px] font-mono font-black flex items-center justify-center shrink-0 ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-violet-50 text-violet-700'
                    }`}
                  >
                    {t.num}
                  </span>
                  <span className="truncate">{t.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {lastDialedMessage && (
          <div className="px-4 py-2.5 bg-emerald-50 border-b border-emerald-200 text-xs text-emerald-950 flex items-center justify-between gap-2">
            <span className="font-semibold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              {lastDialedMessage}
            </span>
            <button
              onClick={() => setLastDialedMessage(null)}
              className="text-emerald-800 underline font-semibold cursor-pointer"
            >
              Fermer
            </button>
          </div>
        )}

        {/* Main Ringover Split Layout: Left Content (8 cols) + Right Docked Ringover WebRTC Dialer (4 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12">
          {/* LEFT WORKSPACE (8 cols) */}
          <div className="lg:col-span-8 p-5 border-r border-slate-200 space-y-5 bg-slate-50/40">
            {/* TAB 1: JOURNAL D'APPELS, TRANSCRIPTIONS WHISPER & QUALIFICATION AFTER-CALL WORK */}
            {ringoverTab === 'ALL_CALLS' && (
              <div className="space-y-4">
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    Historique des Appels Ringover, Qualification Tags &amp; Transcriptions IA (whisper-rs)
                  </h2>
                  <p className="text-xs text-slate-500">
                    Chaque appel entrant ou sortant est horodaté, qualifié par Tags et rattaché automatiquement à la fiche prospect CRM (Art. 4 CDI).
                  </p>
                </div>

                {/* Call Log List (Exact Ringover Call Feed) */}
                <div className="bg-white border border-slate-200/80 rounded-2xl divide-y divide-slate-100 text-xs shadow-2xs">
                  {filteredCalls.map((call) => {
                    const isSelected = selectedCall?.id === call.id;
                    return (
                      <div
                        key={call.id}
                        onClick={() => {
                          setSelectedCallId(call.id);
                          setQualifyOutcome(call.outcome);
                          setQualifyTags(call.ringoverTags || [call.outcome]);
                          setQualifyNote(call.callNote || '');
                        }}
                        className={`p-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 cursor-pointer transition-colors ${
                          isSelected
                            ? 'bg-violet-50/70 border-l-4 border-l-violet-600'
                            : 'hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                              call.direction === 'entrant'
                                ? 'bg-sky-100 text-sky-700'
                                : 'bg-violet-100 text-violet-700'
                            }`}
                          >
                            {call.direction === 'entrant' ? (
                              <PhoneIncoming className="w-4 h-4" />
                            ) : (
                              <PhoneOutgoing className="w-4 h-4" />
                            )}
                          </div>
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-bold text-slate-900 text-sm">
                                {call.prospectName}
                              </span>
                              <span className="font-mono text-slate-500 tabular-nums">
                                {call.prospectPhone}
                              </span>
                              <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold text-[10px]">
                                {call.outcome}
                              </span>
                              {call.voicemailDropped && (
                                <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-800 border border-indigo-200 font-semibold text-[10px]">
                                  Voicemail Drop 1-clic
                                </span>
                              )}
                              {call.ringoverTags?.map((t) => (
                                <span
                                  key={t}
                                  className="px-1.5 py-0.5 rounded bg-violet-50 text-violet-800 border border-violet-200 text-[10px] font-semibold"
                                >
                                  #{t}
                                </span>
                              ))}
                            </div>
                            <div className="text-[11px] text-slate-500 mt-0.5 font-mono tabular-nums">
                              Présenté : {call.displayedCallerId} (Mode {call.lineMode}) · Club{' '}
                              {formatClubName(call.clubId, true)} · Durée{' '}
                              {Math.floor(call.durationSec / 60)}m{call.durationSec % 60}s
                            </div>
                            {call.callNote && (
                              <div className="text-[11px] text-slate-700 mt-1 italic">
                                Note CRM : « {call.callNote} »
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {call.whisperScore && (
                            <span className="px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 font-mono font-bold text-[11px]">
                              IA Script : {call.whisperScore}/100
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDialerNumber(call.prospectPhone);
                            }}
                            className="px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-[11px] cursor-pointer"
                          >
                            Charger dans le Dialer
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Selected Call Whisper Transcript + Ringover After-Call Work (Tags & Note CRM) */}
                {selectedCall && (
                  <div className="bg-white border border-slate-200/80 rounded-2xl p-4 space-y-4 text-xs shadow-2xs">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                      <div className="font-bold text-slate-900 flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-violet-600" />
                        <span>
                          Analyse Vocale Whisper GPU &amp; Qualification Ringover —{' '}
                          {selectedCall.prospectName}
                        </span>
                      </div>
                      <span className="font-mono text-[11px] text-slate-500">
                        {selectedCall.timestamp.slice(0, 16).replace('T', ' ')}
                      </span>
                    </div>

                    {selectedCall.whisperTranscript ? (
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 italic text-slate-700 leading-relaxed">
                        « {selectedCall.whisperTranscript} »
                      </div>
                    ) : (
                      <div className="text-slate-500">
                        Pas de transcription sur cet appel court (Messagerie / Non répondu).
                      </div>
                    )}

                    {selectedCall.detectedObjection && (
                      <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-950">
                        <span className="font-bold">Objection détectée :</span>{' '}
                        {selectedCall.detectedObjection}
                      </div>
                    )}

                    {/* Ringover Official After-Call Work (ACW) Qualification Block */}
                    <div className="pt-3 border-t border-slate-200 space-y-3">
                      <div className="font-bold text-slate-900 flex items-center gap-1.5">
                        <Tag className="w-3.5 h-3.5 text-violet-600" />
                        Qualification After-Call Work (Tags Ringover &amp; Synchronisation Note CRM)
                      </div>

                      <div className="flex flex-wrap items-center gap-1.5">
                        {RINGOVER_CALL_TAGS.map((tag) => {
                          const active = qualifyTags.includes(tag);
                          return (
                            <button
                              key={tag}
                              type="button"
                              onClick={() => toggleQualifyTag(tag)}
                              className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border cursor-pointer transition-colors ${
                                active
                                  ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white border-transparent font-bold'
                                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                              }`}
                            >
                              #{tag}
                            </button>
                          );
                        })}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <select
                          value={qualifyOutcome}
                          onChange={(e) =>
                            setQualifyOutcome(e.target.value as CallLog['outcome'])
                          }
                          className="border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 bg-white"
                        >
                          <option value="RDV Séance fixé">Statut : RDV Séance fixé</option>
                          <option value="Décroché — Qualifié">Statut : Décroché — Qualifié</option>
                          <option value="Adhésion conclue">Statut : Adhésion conclue</option>
                          <option value="Messagerie">Statut : Messagerie</option>
                          <option value="Pas de réponse">Statut : Pas de réponse</option>
                        </select>

                        <input
                          type="text"
                          value={qualifyNote}
                          onChange={(e) => setQualifyNote(e.target.value)}
                          placeholder="Note d’appel synchronisée dans la fiche prospect CRM..."
                          className="sm:col-span-2 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 bg-white"
                        />
                      </div>

                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={() =>
                            qualifyRingoverCall({
                              callId: selectedCall.id,
                              outcome: qualifyOutcome,
                              ringoverTags: qualifyTags,
                              callNote: qualifyNote,
                            })
                          }
                          className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-xs cursor-pointer"
                        >
                          Enregistrer Qualification &amp; Synchroniser Fiche CRM
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: POWER-DIALER CLICK-TO-CALL + VOICEMAIL DROP 1-CLIC */}
            {ringoverTab === 'POWER_DIALER' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <Zap className="w-4 h-4 text-violet-600" />
                      Campagne Power-Dialer Ringover (Click-to-Call, Rotation 07 &amp; Voicemail Drop 1-Clic)
                    </h2>
                    <p className="text-xs text-slate-500">
                      Enchaînement automatique des prospects hors liste Bloctel avec dépôt de messagerie vocale Studio en 1 clic si répondeur.
                    </p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-violet-50 text-violet-900 border border-violet-200 text-xs font-bold">
                    {powerDialerQueue.length} prospects en file
                  </span>
                </div>

                <div className="bg-white border border-slate-200/80 rounded-2xl divide-y divide-slate-100 text-xs shadow-2xs">
                  {powerDialerQueue.map((p) => (
                    <div
                      key={p.id}
                      className="p-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                    >
                      <div>
                        <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                          <span>
                            {p.firstName} {p.lastName}
                          </span>
                          <span className="font-mono text-xs text-slate-600">{p.phone}</span>
                          <span className="px-2 py-0.5 rounded bg-slate-100 text-[10px] font-semibold text-slate-700">
                            {formatClubName(p.clubId, true)} · {p.stage}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          Objectif : {p.goal} · Tentatives : {p.retryCount} · Dernier 07 présenté :{' '}
                          {p.lastOutbound07Used || 'Aucun'}
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                        <button
                          onClick={() =>
                            handlePowerDialProspect(p.id, '07', 'RDV Séance fixé', false)
                          }
                          className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                        >
                          <PhoneOutgoing className="w-3.5 h-3.5" />
                          Appeler (07)
                        </button>
                        <button
                          onClick={() => handlePowerDialProspect(p.id, '07', 'Messagerie', true)}
                          className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                          title="Déposer le message vocal studio C.Fitness pré-enregistré sans attendre le bip"
                        >
                          <Voicemail className="w-3.5 h-3.5 text-violet-600" />
                          Voicemail Drop 1-clic
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 3: SMS COLLABORATIFS 07 & TEMPLATES OMNICANAL */}
            {ringoverTab === 'SMS_OMNICANAL' && (
              <div className="space-y-4">
                <div>
                  <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-violet-600" />
                    Boîte SMS Collaborative 07 Ringover (Passerelle GSM 4G VoLTE &amp; STOP 36111)
                  </h2>
                  <p className="text-xs text-slate-500">
                    Envoi de SMS commerciaux ou transactionnels depuis le pool 07 du club avec modèles pré-remplis et contrôle RGPD / STOP automatique.
                  </p>
                </div>

                <div className="bg-white border border-slate-200/80 rounded-2xl p-4 space-y-4 text-xs shadow-2xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        Destinataire Prospect CRM :
                      </label>
                      <select
                        value={selectedSmsProspect?.id || ''}
                        onChange={(e) => setSelectedSmsProspectId(e.target.value)}
                        className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 bg-white"
                      >
                        {smsEligibleProspects.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.firstName} {p.lastName} ({p.phone}) —{' '}
                            {formatClubName(p.clubId, true)} [{p.stage}]
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        Modèles SMS 1-Clic Ringover :
                      </label>
                      <div className="flex flex-wrap gap-1.5">
                        <button
                          type="button"
                          onClick={() =>
                            setSmsBodyText(
                              `Bonjour ${selectedSmsProspect?.firstName || ''}, votre séance d’essai chez C.Fitness (${formatClubName(selectedSmsProspect?.clubId || 'carre-de-soie', true)}) est confirmée ! Code portillon Heitz : ${selectedSmsProspect?.heitzPassageQrCode || 'HZ-PASS-5052'}. STOP au 36111.`
                            )
                          }
                          className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold cursor-pointer"
                        >
                          Confirmation RDV + QR Heitz
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setSmsBodyText(
                              `Bonjour ${selectedSmsProspect?.firstName || ''}, je viens de vous laisser un message vocal au sujet de votre séance découverte offerte chez C.Fitness. Quel créneau vous conviendrait cette semaine ? STOP au 36111.`
                            )
                          }
                          className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold cursor-pointer"
                        >
                          Relance après Voicemail
                        </button>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Message SMS (expédié via le pool 07 du club) :
                    </label>
                    <textarea
                      rows={3}
                      value={smsBodyText}
                      onChange={(e) => setSmsBodyText(e.target.value)}
                      className="w-full border border-slate-200 rounded-xl p-3 text-xs text-slate-900 bg-slate-50"
                    />
                  </div>

                  {selectedSmsProspect && (
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pt-2 border-t border-slate-100">
                      <div className="text-[11px] text-slate-600">
                        Statut conformité :{' '}
                        <span className="font-bold text-slate-900">
                          RGPD {selectedSmsProspect.rgpdConsent ? 'Validé' : 'Manquant'} · STOP SMS{' '}
                          {selectedSmsProspect.smsStopOptOut ? 'Bloqué (Opt-out)' : 'Autorisé'}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const res = sendValidatedProspectSms(
                            selectedSmsProspect.id,
                            smsBodyText
                          );
                          if (res.ok) {
                            setLastDialedMessage(
                              `SMS 07 envoyé via passerelle GSM 4G Yeastar TG400 à ${selectedSmsProspect.firstName} ${selectedSmsProspect.lastName} (${selectedSmsProspect.phone})`
                            );
                          }
                        }}
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer self-end"
                      >
                        <Send className="w-3.5 h-3.5" />
                        Envoyer le SMS (07)
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 4: SUPERVISION LIVE DES 12 POSTES BI-CLUB */}
            {ringoverTab === 'LIVE_LINES' && (
              <div className="space-y-4">
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    Supervision Temps Réel des 12 Lignes SIP Bi-Club (Hot-Desking, Double Écoute, Chuchotement &amp; Intrusion)
                  </h2>
                  <p className="text-xs text-slate-500">
                    6 lignes Carré de Soie (`04 26 22 55 30`) + 6 lignes Beynost (`04 22 91 36 82`) · Prise de poste 1-clic.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {filteredLines.map((line) => {
                    const assignedEmp = employees.find((e) => e.id === line.activeAgentId);
                    const clubObj = clubs.find((c) => c.id === line.clubId);
                    const mode = getLineMode(line.id);
                    const isListening = listenModeLineId === line.id;
                    const isWhispering = whisperModeLineId === line.id;
                    const isBarging = bargeInLineId === line.id;

                    return (
                      <div
                        key={line.id}
                        className="bg-white border border-slate-200/80 rounded-2xl p-3.5 space-y-3 text-xs shadow-2xs"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="font-mono text-[10px] font-bold text-slate-500">
                              Ext. {line.extension} · {formatClubName(line.clubId, true)}
                            </div>
                            <div className="font-bold text-slate-900 text-sm">{line.label}</div>
                          </div>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              line.activeAgentId
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-slate-100 text-slate-500'
                            }`}
                          >
                            {line.activeAgentId ? 'En ligne' : 'Poste libre'}
                          </span>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                          {assignedEmp ? (
                            <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                              <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                              {assignedEmp.firstName} {assignedEmp.lastName}
                            </div>
                          ) : (
                            <div className="text-slate-400 flex items-center gap-1.5">
                              <UserX className="w-3.5 h-3.5" />
                              Non attribué
                            </div>
                          )}

                          {assignedEmp ? (
                            <button
                              onClick={() => releasePhoneLineSession(line.id)}
                              className="px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-rose-50 text-slate-700 font-semibold cursor-pointer"
                            >
                              Libérer
                            </button>
                          ) : (
                            <button
                              onClick={() => takePhoneLineSession(line.id)}
                              className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold cursor-pointer"
                            >
                              Prendre mon poste
                            </button>
                          )}
                        </div>

                        {line.lineType === 'commercial' && clubObj && (
                          <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                            <span className="text-[11px] text-slate-500 font-mono">
                              Sortie : {mode === '04' ? 'Fixe 04 (OVH)' : 'Mobile 07 (OVH)'}
                            </span>
                            <button
                              onClick={() => handleDialSimulation(line, 'RDV Séance fixé')}
                              className="py-1.5 px-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-[11px] cursor-pointer whitespace-nowrap"
                            >
                              Simuler un appel sortant
                            </button>
                          </div>
                        )}

                        {canSupervise && (
                          <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-1">
                            <span className="text-[10px] text-slate-500">Supervision :</span>
                            <div className="flex flex-wrap gap-1">
                              <button
                                onClick={() => setListenModeLineId(isListening ? null : line.id)}
                                className={`px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer ${
                                  isListening
                                    ? 'bg-amber-500 text-slate-950'
                                    : 'bg-slate-100 text-slate-700'
                                }`}
                              >
                                <Headphones className="w-3 h-3" />
                                Écouter
                              </button>
                              <button
                                onClick={() => setWhisperModeLineId(isWhispering ? null : line.id)}
                                className={`px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer ${
                                  isWhispering
                                    ? 'bg-violet-600 text-white'
                                    : 'bg-slate-100 text-slate-700'
                                }`}
                              >
                                <Radio className="w-3 h-3" />
                                Chuchoter
                              </button>
                              <button
                                onClick={() => setBargeInLineId(isBarging ? null : line.id)}
                                className={`px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer ${
                                  isBarging
                                    ? 'bg-rose-600 text-white'
                                    : 'bg-slate-100 text-slate-700'
                                }`}
                                title="Intrusion à 3 dans la conversation (Manager + Commercial + Prospect)"
                              >
                                <Users className="w-3 h-3" />
                                Intervenir
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 5: STUDIO SVI & LES 5 PASSERELLES TÉLÉCOM / WEBHOOKS RINGOVER */}
            {ringoverTab === 'SVI_STUDIO' && (
              <div className="space-y-4">
                <div className="bg-white border border-slate-200/80 rounded-2xl p-4 space-y-2 text-xs shadow-2xs">
                  <div className="font-bold text-slate-900 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    Conformité ARCEP n° 2022-1583 : Trunk SIP OVHcloud (Fixes 04) + Passerelle 4G Yeastar TG400 (SIM 07)
                  </div>
                  <p className="text-slate-600 leading-relaxed">
                    En France, aucun Trunk SIP fixe n&apos;est autorisé à présenter un Caller ID mobile 06/07. L&apos;IPBX Asterisk route automatiquement les appels <span className="font-mono font-bold">04</span> sur <span className="font-mono font-bold">sip.ovh.fr</span> et les appels <span className="font-mono font-bold">07 / SMS STOP</span> sur la passerelle GSM 4G VoLTE Yeastar TG400 (`10.10.0.14`).
                  </p>
                </div>

                <div className="bg-white border border-slate-200/80 rounded-2xl p-4 space-y-3 shadow-2xs">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Volume2 className="w-4 h-4 text-violet-600" />
                    Studio SVI Ringover / Asterisk — Arbre Vocal Interactif
                  </h3>
                  <div className="flex gap-2">
                    {['1', '2', '3', '4', '0'].map((digit) => (
                      <button
                        key={digit}
                        onClick={() => setSviDigit(digit)}
                        className={`w-10 h-10 rounded-xl font-mono font-bold text-sm cursor-pointer ${
                          sviDigit === digit
                            ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {digit}
                      </button>
                    ))}
                  </div>
                  {sviRoutes[sviDigit] && (
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
                      <div className="font-bold text-slate-900">{sviRoutes[sviDigit].title}</div>
                      <div className="text-slate-600">
                        <span className="font-semibold text-slate-800">Routage :</span>{' '}
                        {sviRoutes[sviDigit].route}
                      </div>
                      <div className="text-emerald-700 font-medium">
                        <span className="font-semibold">Action CRM :</span>{' '}
                        {sviRoutes[sviDigit].action}
                      </div>
                    </div>
                  )}
                </div>

                {/* Architecture des 5 Passerelles Télécom & API remplaçant l'abonnement Ringover */}
                <div className="bg-white border border-slate-200/80 rounded-2xl p-4 space-y-3 text-xs shadow-2xs">
                  <div className="font-bold text-slate-900 flex items-center gap-2">
                    <Server className="w-4 h-4 text-violet-600" />
                    Matrice des 5 Passerelles Télécom &amp; Webhooks CTI intégrées (Zéro Abonnement Ringover)
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                      <div className="font-bold text-slate-900">
                        1. Passerelle WebRTC Navigateur (SIP.js / WSS)
                      </div>
                      <div className="text-slate-600">
                        Connexion directe du navigateur au serveur local <span className="font-mono">Asterisk 20 LTS (:8089/ws)</span> en Opus 48 kHz + SRTP sans logiciel tiers à installer.
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                      <div className="font-bold text-slate-900">
                        2. Passerelle Fixe 04 (Trunk SIP OVHcloud)
                      </div>
                      <div className="text-slate-600">
                        Trunk <span className="font-mono">sip.ovh.fr</span> avec signature <span className="font-mono">STIR/SHAKEN MAN</span> (ARCEP n° 2022-1583) pour `04 26 22 55 30` (CDS) et `04 22 91 36 82` (Beynost).
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                      <div className="font-bold text-slate-900">
                        3. Passerelle Mobile 07 &amp; SMS (Yeastar TG400 4G VoLTE)
                      </div>
                      <div className="text-slate-600">
                        Passerelle matérielle <span className="font-mono">10.10.0.14</span> hébergeant les cartes SIM 07 des 2 clubs avec rotation anti-spam et API HTTP SMS locale (STOP 36111).
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                      <div className="font-bold text-slate-900">
                        4. Passerelle CTI Screen-Pop CRM &amp; Heitz (AMI + HZ.WS)
                      </div>
                      <div className="text-slate-600">
                        Webhooks temps réel (<span className="font-mono">call.ringing</span>, <span className="font-mono">call.hangup</span>) affichant la fiche Prospect CRM ou Adhérent Heitz (<span className="font-mono">finBalance</span> SEPA) + Transcription IA <span className="font-mono">whisper-rs</span>.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT DOCKED C.FITNESS OS WEBRTC DIALER (4 cols) */}
          <div className="lg:col-span-4 bg-white p-5 flex flex-col justify-between space-y-4">
            {/* Dialer Top Status Header */}
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                  <span className="text-xs font-extrabold tracking-wide text-slate-900">DIALER RINGOVER WebRTC</span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-violet-50 border border-violet-200 font-mono text-[10px] font-bold text-violet-700">
                  Opus 48kHz · TLS
                </span>
              </div>

              {/* Caller ID Selection Pill (07 vs 04) */}
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 space-y-2 text-xs">
                <div className="flex items-center justify-between text-[11px] text-slate-600">
                  <span>Numéro C.Fitness présenté :</span>
                  <select
                    value={dialerClubId}
                    onChange={(e) =>
                      setDialerClubId(e.target.value as 'carre-de-soie' | 'beynost')
                    }
                    className="bg-transparent font-bold text-violet-600 focus:outline-none cursor-pointer"
                  >
                    <option value="carre-de-soie" className="text-slate-900">
                      Carré de Soie
                    </option>
                    <option value="beynost" className="text-slate-900">
                      Beynost
                    </option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setDialerMode('07')}
                    className={`py-1.5 px-2 rounded-xl font-mono text-[11px] font-bold cursor-pointer transition-colors ${
                      dialerMode === '07'
                        ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white'
                        : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    📱 Mobile 07 (SIM 4G)
                  </button>
                  <button
                    type="button"
                    onClick={() => setDialerMode('04')}
                    className={`py-1.5 px-2 rounded-xl font-mono text-[11px] font-bold cursor-pointer transition-colors ${
                      dialerMode === '04'
                        ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white'
                        : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    ☎️ Fixe 04 (OVH SIP)
                  </button>
                </div>
              </div>

              {/* CTI Screen-Pop CRM / Heitz Fiche Temps Réel */}
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-[11px] space-y-1">
                <div className="flex items-center justify-between text-violet-600 font-bold">
                  <span>CTI Screen-Pop (CRM &amp; Heitz)</span>
                  <span className="font-mono text-[10px]">
                    {screenPopProspect ? `Stage : ${screenPopProspect.stage}` : 'Adhérent Heitz'}
                  </span>
                </div>
                {screenPopProspect ? (
                  <div className="text-slate-600">
                    <span className="font-bold text-slate-900">
                      {screenPopProspect.firstName} {screenPopProspect.lastName}
                    </span>{' '}
                    · Objectif : {screenPopProspect.goal}
                    {screenPopProspect.heitzPassageQrCode && (
                      <span className="block text-[10px] font-mono text-emerald-700 font-bold">
                        QR Portillon Heitz : {screenPopProspect.heitzPassageQrCode}
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="text-slate-600">
                    <span className="font-bold text-slate-900">
                      {screenPopHeitzMember.firstName} {screenPopHeitzMember.lastName}
                    </span>{' '}
                    · Badge <span className="font-mono">{screenPopHeitzMember.badgeCode}</span> ·
                    Solde SEPA :{' '}
                    <span
                      className={
                        screenPopHeitzMember.finBalanceEur < 0
                          ? 'text-rose-600 font-bold'
                          : 'text-emerald-700 font-bold'
                      }
                    >
                      {screenPopHeitzMember.finBalanceEur.toFixed(2)} €
                    </span>
                  </div>
                )}
              </div>

              {/* Active Call Screen Banner inside the Ringover Dialer */}
              {activeCallState && (
                <div className="p-3.5 rounded-2xl bg-violet-50 border border-violet-200 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="text-[10px] font-mono uppercase text-violet-700 font-bold">
                        {activeCallState.isOnHold ? 'Appel en attente' : 'Appel en cours · 01:42'}
                      </div>
                      <div className="text-sm font-black text-slate-900 mt-0.5">
                        {activeCallState.prospectName}
                      </div>
                      <div className="text-xs font-mono text-slate-600 tabular-nums">
                        {activeCallState.prospectPhone}
                      </div>
                      {activeCallState.transferredTo && (
                        <div className="text-[10px] text-amber-700 font-semibold mt-0.5">
                          → Transféré : {activeCallState.transferredTo}
                        </div>
                      )}
                    </div>
                    <span className="px-2 py-0.5 rounded-lg bg-white border border-violet-200 text-violet-700 font-mono text-[10px] font-bold">
                      {activeCallState.callerId}
                    </span>
                  </div>

                  {/* Round Ringover In-Call Action Buttons */}
                  <div className="grid grid-cols-4 gap-1.5 text-[10px]">
                    <button
                      onClick={() =>
                        setActiveCallState((prev) =>
                          prev ? { ...prev, isMuted: !prev.isMuted } : null
                        )
                      }
                      className={`p-2 rounded-xl flex flex-col items-center gap-1 cursor-pointer ${
                        activeCallState.isMuted
                          ? 'bg-amber-500 text-slate-950 font-bold'
                          : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {activeCallState.isMuted ? (
                        <MicOff className="w-3.5 h-3.5" />
                      ) : (
                        <Mic className="w-3.5 h-3.5" />
                      )}
                      <span>{activeCallState.isMuted ? 'Muet' : 'Micro'}</span>
                    </button>

                    <button
                      onClick={() =>
                        setActiveCallState((prev) =>
                          prev ? { ...prev, isOnHold: !prev.isOnHold } : null
                        )
                      }
                      className={`p-2 rounded-xl flex flex-col items-center gap-1 cursor-pointer ${
                        activeCallState.isOnHold
                          ? 'bg-sky-500 text-slate-950 font-bold'
                          : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <PauseCircle className="w-3.5 h-3.5" />
                      <span>Attente</span>
                    </button>

                    <button
                      onClick={() =>
                        setActiveCallState((prev) =>
                          prev
                            ? {
                                ...prev,
                                transferredTo:
                                  prev.clubId === 'carre-de-soie'
                                    ? 'Beynost (Ext. 201)'
                                    : 'Carré de Soie (Ext. 101)',
                              }
                            : null
                        )
                      }
                      className="p-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 flex flex-col items-center gap-1 cursor-pointer"
                    >
                      <PhoneForwarded className="w-3.5 h-3.5 text-violet-600" />
                      <span>Transfert</span>
                    </button>

                    <button
                      onClick={() => setActiveCallState(null)}
                      className="p-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold flex flex-col items-center gap-1 cursor-pointer"
                    >
                      <PhoneOff className="w-3.5 h-3.5" />
                      <span>Couper</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Dialer Number Display Input */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2.5 flex items-center justify-between">
                <input
                  type="text"
                  value={dialerNumber}
                  onChange={(e) => setDialerNumber(e.target.value)}
                  className="bg-transparent font-mono text-lg font-extrabold text-slate-900 tracking-wider w-full focus:outline-none tabular-nums"
                />
                <button
                  type="button"
                  onClick={() => setDialerNumber((prev) => prev.slice(0, -1))}
                  className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
                  title="Effacer"
                >
                  <Delete className="w-4 h-4" />
                </button>
              </div>

              {/* 12-Key Keypad */}
              <div className="grid grid-cols-3 gap-2">
                {KEYPAD_KEYS.map((k) => (
                  <button
                    key={k.digit}
                    type="button"
                    onClick={() => setDialerNumber((prev) => `${prev}${k.digit}`)}
                    className="py-2.5 rounded-2xl bg-slate-50 hover:bg-violet-50 border border-slate-200 flex flex-col items-center justify-center transition-colors cursor-pointer"
                  >
                    <span className="font-mono font-extrabold text-base text-slate-900 leading-none">
                      {k.digit}
                    </span>
                    <span className="font-mono text-[9px] text-slate-400 tracking-widest mt-0.5 h-2.5">
                      {k.sub}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Bottom Call Trigger Button */}
            <div className="pt-2 space-y-2">
              <button
                type="button"
                onClick={() => handleDialFromSoftphone('RDV Séance fixé')}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                <Phone className="w-4 h-4 fill-current" />
                Appeler ({dialerMode === '07' ? 'Pool 07 SIM 4G' : 'Fixe 04 OVH'})
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
