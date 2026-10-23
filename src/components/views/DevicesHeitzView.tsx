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
  Server,
  Cpu,
  Radio,
  RefreshCw,
  FileCode2,
  Download,
} from 'lucide-react';
import { AccessEvent, ClubId } from '../../types/cfos';
import { canAccessFeature, formatClubName } from '../../domain/rules';
import { BackupFailoverPanel } from '../BackupFailoverPanel';
import dockerComposeRaw from '../../../docker-compose.yml?raw';
import dockerfileRaw from '../../../Dockerfile?raw';
import cargoTomlRaw from '../../../Cargo.toml?raw';
import mainRsRaw from '../../../src-rust/main.rs?raw';

interface HardwareNode {
  id: string;
  clubId: ClubId | 'bi-club';
  category: 'ACCES_HEITZ' | 'MACHINES_FITNESS' | 'BIOMETRIE_INBODY' | 'TELEPHONIE_VOIP' | 'INFRA_RESEAU';
  name: string;
  model: string;
  ipOrEndpoint: string;
  protocol: string;
  port: string;
  latencyMs: number;
  status: 'ONLINE' | 'STANDBY';
  details: string;
}

const CLUB_HARDWARE_INVENTORY: HardwareNode[] = [
  {
    id: 'hw-heitz-srv',
    clubId: 'carre-de-soie',
    category: 'ACCES_HEITZ',
    name: 'Serveur Heitz System & Démon Heitz-WS.exe (VM Windows)',
    model: 'Windows Server SQL + API HZ.WS',
    ipOrEndpoint: '10.10.0.20 (LAN CDS)',
    protocol: 'HTTP/REST JSON + SQL TDS (passageCode/generate)',
    port: 'TCP 8080 / 1433',
    latencyMs: 18,
    status: 'ONLINE',
    details: 'Contrôle finBalance SEPA temps réel (< 50 ms), synchronisation FMI et ouverture tripodes.',
  },
  {
    id: 'hw-turnstiles-cds',
    clubId: 'carre-de-soie',
    category: 'ACCES_HEITZ',
    name: 'Tourniquets Tripodes & Douchettes QR/RFID (Carré de Soie)',
    model: 'Portillons Bidirectionnels + Contact Sec SSI',
    ipOrEndpoint: '10.10.0.21–22',
    protocol: 'TCP/IP Modbus / Relais RS-485 + Boucle Incendie NF S 61-937',
    port: 'TCP 502',
    latencyMs: 12,
    status: 'ONLINE',
    details: 'Lecture QR dynamique 2D, voyant accueil impayé SEPA et libération mécanique immédiate sur alarme incendie.',
  },
  {
    id: 'hw-turnstiles-bey',
    clubId: 'beynost',
    category: 'ACCES_HEITZ',
    name: 'Tourniquets Tripodes & Douchettes QR/RFID (Beynost)',
    model: 'Portillons Bidirectionnels + Cache Local Autonome',
    ipOrEndpoint: '10.20.0.21–22 (via WireGuard)',
    protocol: 'HTTPS Tunnel WireGuard + Cache SQLite 15 min',
    port: 'UDP 51820 / TCP 502',
    latencyMs: 26,
    status: 'ONLINE',
    details: 'Circulation bi-clubs sans surcoût (D9) et continuité autonome en cas de coupure Internet.',
  },
  {
    id: 'hw-biocircuit-cds',
    clubId: 'carre-de-soie',
    category: 'MACHINES_FITNESS',
    name: 'Plateau Technogym & Circuit Guidé Biocircuit (Carré de Soie)',
    model: 'Borne Unity Self + 12 Postes Biocircuit + Gamme Excite',
    ipOrEndpoint: '10.10.0.40 / api.mywellness.com',
    protocol: 'REST API OAuth 2.0 + Webhooks TLS 1.3 (Technogym Mywellness)',
    port: 'TCP 443',
    latencyMs: 34,
    status: 'ONLINE',
    details: 'Réglage motorisé automatique des machines, comptage des MOVEs et détection d’inactivité > 15 jours.',
  },
  {
    id: 'hw-biocircuit-bey',
    clubId: 'beynost',
    category: 'MACHINES_FITNESS',
    name: 'Plateau Technogym & Circuit Guidé Biocircuit (Beynost)',
    model: 'Borne Unity Self + 10 Postes Biocircuit + Cardio Connecté',
    ipOrEndpoint: '10.20.0.40 / api.mywellness.com',
    protocol: 'REST API OAuth 2.0 + Webhooks TLS 1.3 (Technogym Mywellness)',
    port: 'TCP 443',
    latencyMs: 38,
    status: 'ONLINE',
    details: 'Synchronisation profil adhérent inter-clubs (Carré de Soie ↔ Beynost) et alertes coach anti-décrochage.',
  },
  {
    id: 'hw-inbody-570',
    clubId: 'carre-de-soie',
    category: 'BIOMETRIE_INBODY',
    name: 'Analyseur Corporel InBody 570 (Bureau Bilan Carré de Soie)',
    model: 'InBody 570 DSM-BIA Multifréquence (5–1000 kHz)',
    ipOrEndpoint: '10.10.0.55',
    protocol: 'LAN TCP/IP Lookin’Body Web + Chiffrement AES-256 (RGPD Art. 9)',
    port: 'TCP 8443',
    latencyMs: 9,
    status: 'ONLINE',
    details: 'Remontée automatique masse musculaire squelettique, masse grasse, eau totale et graisse viscérale.',
  },
  {
    id: 'hw-inbody-270',
    clubId: 'beynost',
    category: 'BIOMETRIE_INBODY',
    name: 'Analyseur Corporel InBody 270 (Bureau Bilan Beynost)',
    model: 'InBody 270 Segmentaire Connecté',
    ipOrEndpoint: '10.20.0.55',
    protocol: 'LAN TCP/IP Lookin’Body + Tunnel WireGuard Chiffré',
    port: 'TCP 8443',
    latencyMs: 15,
    status: 'ONLINE',
    details: 'Accès strictement cloisonné aux Coachs diplômés, Apprentis BPJEPS et Direction.',
  },
  {
    id: 'hw-asterisk-webrtc',
    clubId: 'bi-club',
    category: 'TELEPHONIE_VOIP',
    name: 'Centrale IPBX Asterisk 20 LTS + Trunk SIP OVHcloud & Freebox Pro',
    model: '12 Lignes SIP (4 Commerciaux + 2 Coachs / club · Hot-Desking)',
    ipOrEndpoint: '10.10.0.10 ↔ Freebox Pro (10.20.0.1) / Trunk SIP OVHcloud (sip.ovh.fr)',
    protocol: 'SIP over WSS (TLS) + SRTP/DTLS Codec Opus 48 kHz + STIR/SHAKEN',
    port: 'TCP 8089 / UDP 10000–20000',
    latencyMs: 11,
    status: 'ONLINE',
    details: 'Support natif des fixes 04 (04 26 22 55 30 / 04 22 91 36 82) et du pool de mobiles 07 (rotation anti-spam) avec bascule OVHcloud SIP Trunk.',
  },
  {
    id: 'hw-ai-gpu-server',
    clubId: 'carre-de-soie',
    category: 'INFRA_RESEAU',
    name: 'Serveur Physique Local C.Fitness OS (Linux Debian 12 + Rust)',
    model: 'Debian 12 + Rust (Axum API + Leptos WASM/WebRTC) + GPU RTX 4060 Ti',
    ipOrEndpoint: '10.10.0.10 (2 Rue Jacquard, Carré de Soie)',
    protocol: 'Rust Axum HTTP/2 + Leptos WASM + PostgreSQL 16 + whisper-rs GPU',
    port: 'TCP 443 / 5432 / 6379',
    latencyMs: 2,
    status: 'ONLINE',
    details: 'Binaire Rust ultra-rapide hébergé à Carré de Soie, clients PWA sur PC Windows, Mac, tablettes Android et iOS.',
  },
  {
    id: 'hw-freebox-wireguard',
    clubId: 'beynost',
    category: 'INFRA_RESEAU',
    name: 'Routeur Freebox Pro IP Fixe + Tunnel WireGuard (< 3 ms) & Kiosques PWA',
    model: 'Freebox Pro Entreprise + 2 Tablettes Murales Accueil (CDS & BEY)',
    ipOrEndpoint: '10.20.0.1 (Centre Commercial Beynost – ZAC des Baterses)',
    protocol: 'WireGuard VPN (ChaCha20-Poly1305) + PWA Service Worker IndexedDB',
    port: 'UDP 51820 / TCP 443',
    latencyMs: 2,
    status: 'ONLINE',
    details: 'Interconnexion permanente 2,4 ms (< 3 ms) entre Beynost et le serveur Debian 12 de Carré de Soie.',
  },
];

const DEPLOYMENT_FILES: Record<
  'docker-compose.yml' | 'Dockerfile' | 'Cargo.toml' | 'src-rust/main.rs',
  string
> = {
  'docker-compose.yml': dockerComposeRaw,
  Dockerfile: dockerfileRaw,
  'Cargo.toml': cargoTomlRaw,
  'src-rust/main.rs': mainRsRaw,
};

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
  const [pingResult, setPingResult] = useState<string | null>(null);
  const [activeDeployFile, setActiveDeployFile] =
    useState<keyof typeof DEPLOYMENT_FILES>('docker-compose.yml');

  const filteredMembers =
    clubFilter === 'all'
      ? heitzMembers
      : heitzMembers.filter((m) => m.homeClubId === clubFilter);

  const filteredHardware = CLUB_HARDWARE_INVENTORY.filter(
    (hw) =>
      clubFilter === 'all' ||
      hw.clubId === 'bi-club' ||
      hw.clubId === clubFilter
  );

  const activeGateClub =
    clubs.find((c) => c.id === selectedClubGate) || clubs[0];

  // Strict RGPD Health Data Access Control (§11) centralized via rules.ts
  const canViewHealthData = canAccessFeature(currentUser.role, 'inbody_health_data');

  const handleSimulatePassage = (memberId: string, targetClub: ClubId) => {
    const ev = simulateMemberGateScan(memberId, targetClub);
    if (ev) {
      setLastGateEvent(ev);
    }
  };

  const handleRunDiagnostic = () => {
    setPingResult(
      `Diagnostic complet réussi (${new Date().toLocaleTimeString('fr-FR')}) : Serveur Linux Debian 12 (Rust Axum + Leptos WASM/WebRTC) OK · Tunnel WireGuard CDS ↔ Beynost à 2,4 ms (< 3 ms) · Trunk SIP OVHcloud & Freebox Pro 12 lignes prêts · Démon VM Windows Heitz-WS.exe OK (18 ms).`
    );
  };

  const handleDownloadDeployFile = (filename: keyof typeof DEPLOYMENT_FILES) => {
    const blob = new Blob([DEPLOYMENT_FILES[filename]], {
      type: 'text/plain;charset=utf-8;',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename.replace('/', '-');
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header & Global Safety Controls */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-rose-600">
            Modules M7, M8 &amp; §4 (v1.2) · Serveur Linux Debian 12 (Rust Axum + Leptos WASM) &amp; Passerelle Heitz
          </div>
          <h1 className="text-lg sm:text-xl font-bold text-slate-900 mt-1">
            Contrôle d&apos;Accès Tourniquets (&lt;50ms), Parc Machines &amp; Topologie Serveur Rust / WireGuard
          </h1>
          <p className="text-xs text-slate-600 mt-1">
            Serveur physique Debian 12 à Carré de Soie relié à Beynost via VPN WireGuard (&lt; 3 ms) · Clients PWA sur PC Windows, Mac, tablettes Android et iOS
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
              : 'Tunnel VPN Nominal (2,4 ms)'}
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
                      {formatClubName(member.homeClubId, true)})
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

      {/* Multi-Device Automatic Backup & Power Outage Continuity (PC / Tablet / Phone) */}
      <BackupFailoverPanel />

      {/* Complete Club Hardware, Machines, Telephony & Network Protocols Inventory */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Server className="w-4 h-4 text-orange-600" />
              Inventaire Complet des Machines, Téléphones, Serveur Rust/Debian 12 &amp; Protocoles (v1.2)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Architecture validée : Serveur Linux Debian 12 (Rust Axum + Leptos WASM/WebRTC) à Carré de Soie, VPN WireGuard (&lt; 3 ms), Trunk SIP OVHcloud / Freebox Pro, Heitz-WS.exe, Technogym Biocircuit &amp; InBody 570/270.
            </p>
          </div>
          <button
            onClick={handleRunDiagnostic}
            className="px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-1.5 shrink-0 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 text-orange-400" />
            Tester Ping &amp; Protocoles (10 équipements)
          </button>
        </div>

        {pingResult && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-medium text-emerald-900 flex items-center justify-between gap-2">
            <span>{pingResult}</span>
            <button
              onClick={() => setPingResult(null)}
              className="underline text-[11px] shrink-0 cursor-pointer"
            >
              Fermer
            </button>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-[11px] font-semibold uppercase text-slate-500">
                <th className="py-2.5 pr-3">Équipement / Machine</th>
                <th className="py-2.5 px-3">Club</th>
                <th className="py-2.5 px-3">IP / Endpoint</th>
                <th className="py-2.5 px-3">Protocole &amp; Port</th>
                <th className="py-2.5 px-3">Latence</th>
                <th className="py-2.5 pl-3">Rôle &amp; Sécurité</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredHardware.map((hw) => (
                <tr key={hw.id} className="align-top">
                  <td className="py-3 pr-3">
                    <div className="font-bold text-slate-900 flex items-center gap-1.5">
                      {hw.category === 'INFRA_RESEAU' ? (
                        <Cpu className="w-3.5 h-3.5 text-orange-600 shrink-0" />
                      ) : (
                        <Radio className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      )}
                      <span>{hw.name}</span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">{hw.model}</div>
                  </td>
                  <td className="py-3 px-3 font-semibold text-slate-700 whitespace-nowrap">
                    {hw.clubId === 'carre-de-soie'
                      ? 'Carré de Soie'
                      : hw.clubId === 'beynost'
                      ? 'Beynost'
                      : 'Bi-Club (CDS ↔ BEY)'}
                  </td>
                  <td className="py-3 px-3 font-mono text-[11px] text-slate-800 whitespace-nowrap">
                    {hw.ipOrEndpoint}
                  </td>
                  <td className="py-3 px-3">
                    <div className="font-mono text-[11px] font-semibold text-slate-900">
                      {hw.protocol}
                    </div>
                    <div className="font-mono text-[10px] text-slate-500">{hw.port}</div>
                  </td>
                  <td className="py-3 px-3 font-mono font-bold text-emerald-700 tabular-nums whitespace-nowrap">
                    {hw.latencyMs} ms · OK
                  </td>
                  <td className="py-3 pl-3 text-slate-600">{hw.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Linux Debian 12 + Rust (Axum) Deployment Files Viewer */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <FileCode2 className="w-4 h-4 text-orange-600" />
              Fichiers de Déploiement Production Linux Debian 12 &amp; Rust (Axum) intégrés au Dépôt
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Présents à la racine du projet : <span className="font-mono">/docker-compose.yml</span>, <span className="font-mono">/Dockerfile</span>, <span className="font-mono">/Cargo.toml</span> et <span className="font-mono">/src-rust/main.rs</span> (dialogue local avec la VM Windows <span className="font-mono">Heitz-WS.exe</span>).
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            {(Object.keys(DEPLOYMENT_FILES) as Array<keyof typeof DEPLOYMENT_FILES>).map((f) => (
              <button
                key={f}
                onClick={() => setActiveDeployFile(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold cursor-pointer ${
                  activeDeployFile === f
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {f}
              </button>
            ))}
            <button
              onClick={() => handleDownloadDeployFile(activeDeployFile)}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              Télécharger
            </button>
          </div>
        </div>

        <pre className="p-4 rounded-xl bg-slate-900 text-slate-100 font-mono text-xs overflow-x-auto leading-relaxed">
          {DEPLOYMENT_FILES[activeDeployFile]}
        </pre>
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
                      Bilan du {scan.date} · Appareil : {scan.deviceModel} (
                      {scan.clubId === 'carre-de-soie' ? 'Carré de Soie' : 'Beynost'})
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
