import React from 'react';
import { useCfos } from '../../context/CfosContext';
import {
  ShieldCheck,
  CheckCircle2,
  Lock,
  Server,
  HardDrive,
  FileCheck2,
} from 'lucide-react';
import { BackupFailoverPanel } from '../BackupFailoverPanel';

export function GovernanceView() {
  const { currentUser, goNoGoPhases, auditLogs, signGoNoGoPhase } = useCfos();

  const canSignOff = currentUser.role === 'admin';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-5">
        <div className="text-xs font-semibold uppercase tracking-wider text-orange-600">
          Sections §8, §9 &amp; §11 · Gouvernance par Phases (0 à 12), Sauvegardes 3-2-1 &amp; Audit Immuable
        </div>
        <h1 className="text-lg sm:text-xl font-bold text-slate-900 mt-1">
          Jalons Go / No-Go Signés Direction, Sauvegarde Auto Multi-Appareils &amp; Traçabilité Cryptographique
        </h1>
        <p className="text-xs text-slate-600 mt-1">
          Aucune phase ne peut être ouverte sans validation explicite · Réplication automatique PC / Tablette / Téléphone en cas de coupure courant serveur · Journal d&apos;audit append-only
        </p>
      </div>

      {/* Infrastructure & Backup 3-2-1 Health Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-1.5">
          <div className="font-bold text-slate-900 flex items-center gap-2">
            <Server className="w-4 h-4 text-emerald-600" />
            Serveur Principal Carré de Soie (.10)
          </div>
          <div className="text-slate-600">
            PostgreSQL 16 + Redis 7 + LiveKit WebRTC + faster-whisper GPU local · Uptime 99,98%
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-1.5">
          <div className="font-bold text-slate-900 flex items-center gap-2">
            <HardDrive className="w-4 h-4 text-blue-600" />
            Sauvegardes 3-2-1 &amp; Réplication 6 Appareils
          </div>
          <div className="text-slate-600">
            Miroir temps réel sur 2 PC de secours, 2 Tablettes Kiosques et 2 Smartphones Direction + NAS Beynost
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-1.5">
          <div className="font-bold text-slate-900 flex items-center gap-2">
            <FileCheck2 className="w-4 h-4 text-orange-600" />
            Conformité Légale &amp; RGPD (§11)
          </div>
          <div className="text-slate-600">
            Bandeau vocal RGPD actif · Cloisonnement données santé InBody · Purge auto CV 24 mois
          </div>
        </div>
      </div>

      {/* Multi-Device Automatic Backup & Power Outage Failover Panel */}
      <BackupFailoverPanel />

      {/* Phases 0 to 12 Go / No-Go Gates */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          Matrice des Jalons d&apos;Exécution (Phases 0 à 12 — §9)
        </h2>

        <div className="divide-y divide-slate-100 text-xs">
          {goNoGoPhases.map((gate) => (
            <div
              key={gate.id}
              className="py-3.5 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3"
            >
              <div className="space-y-1">
                <div className="font-bold text-slate-900">
                  <span className="font-mono text-orange-600">{gate.code}</span> —{' '}
                  {gate.title} ({gate.durationLabel})
                </div>
                <div className="text-slate-600">
                  <span className="font-semibold text-slate-800">Livrables :</span>{' '}
                  {gate.deliverables.join(' · ')}
                </div>
                <div className="text-slate-500">
                  <span className="font-semibold text-slate-700">Critère Go/No-Go :</span>{' '}
                  {gate.exitCriteria}
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                {gate.status === 'valide' ? (
                  <div className="text-right">
                    <div className="font-bold text-emerald-700 flex items-center gap-1 justify-end">
                      <CheckCircle2 className="w-4 h-4" />
                      GO VALIDÉ
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Signé par {gate.signedBy} le {gate.signedAt}
                    </div>
                  </div>
                ) : canSignOff ? (
                  <button
                    onClick={() =>
                      signGoNoGoPhase(
                        gate.id,
                        `${currentUser.firstName} ${currentUser.lastName}`
                      )
                    }
                    className="px-3.5 py-2 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-semibold cursor-pointer"
                  >
                    Signer le GO Direction ({gate.code})
                  </button>
                ) : (
                  <span className="text-amber-700 font-semibold">
                    En attente signature Direction (Mario / Daniel)
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Immutable Audit Log */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Lock className="w-4 h-4 text-slate-800" />
            Journal d&apos;Audit Immuable (Append-Only — Aucune suppression autorisée)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Chaque action sensible (connexion, bascule de poste, ouverture manuelle portillon, signature RH, validation paie) est tracée.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-[11px] font-semibold uppercase text-slate-500">
                <th className="py-2 pr-3">Horodatage</th>
                <th className="py-2 px-3">Acteur</th>
                <th className="py-2 px-3">Rôle</th>
                <th className="py-2 px-3">Club</th>
                <th className="py-2 px-3">Action</th>
                <th className="py-2 pl-3">Détails</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {auditLogs.map((log) => (
                <tr key={log.id}>
                  <td className="py-2.5 pr-3 font-mono text-[11px] text-slate-500 tabular-nums whitespace-nowrap">
                    {log.timestamp.slice(0, 16).replace('T', ' ')}
                  </td>
                  <td className="py-2.5 px-3 font-semibold text-slate-900 whitespace-nowrap">
                    {log.actorName}
                  </td>
                  <td className="py-2.5 px-3 text-slate-600">{log.actorRole}</td>
                  <td className="py-2.5 px-3 font-mono text-slate-600">{log.clubId}</td>
                  <td className="py-2.5 px-3 font-mono font-bold text-slate-800 whitespace-nowrap">
                    {log.action}
                  </td>
                  <td className="py-2.5 pl-3 text-slate-600">
                    {log.target} — {log.afterState}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
