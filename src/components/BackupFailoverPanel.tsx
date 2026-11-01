import React, { useRef, useState } from 'react';
import { useCfos } from '../context/CfosContext';
import {
  HardDriveDownload,
  Upload,
  RefreshCw,
  Laptop,
  Tablet,
  Smartphone,
  Zap,
  ZapOff,
  CheckCircle2,
  ShieldAlert,
  Database,
} from 'lucide-react';
import { BackupDeviceType } from '../types/cfos';
import { formatClubName } from '../domain/rules';

function DeviceIcon({ type }: { type: BackupDeviceType }) {
  if (type === 'pc_secours') {
    return <Laptop className="w-4 h-4 text-blue-600 shrink-0" />;
  }
  if (type === 'tablette_kiosque') {
    return <Tablet className="w-4 h-4 text-emerald-600 shrink-0" />;
  }
  return <Smartphone className="w-4 h-4 text-violet-600 shrink-0" />;
}

function formatDeviceBadge(type: BackupDeviceType): string {
  switch (type) {
    case 'pc_secours':
      return 'PC de Secours';
    case 'tablette_kiosque':
      return 'Tablette Kiosque';
    case 'smartphone_pwa':
      return 'Téléphone PWA 5G';
  }
}

export function BackupFailoverPanel() {
  const {
    serverPowerStatus,
    activeFailoverNodeId,
    backupReplicas,
    lastAutoBackupAt,
    lastBackupChecksum,
    heitzMembers,
    employees,
    prospects,
    shifts,
    offlinePointageQueue,
    syncAllDeviceReplicasNow,
    toggleReplicaAutoSync,
    simulateServerPowerOutage,
    exportDeviceBackupJson,
    importAndMergeDeviceBackup,
  } = useCfos();

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedFailoverId, setSelectedFailoverId] = useState<string>(activeFailoverNodeId);
  const [feedback, setFeedback] = useState<{ tone: 'ok' | 'warn'; text: string } | null>(null);

  const isOutage = serverPowerStatus === 'coupure_courant_bascule_active';
  const activeReplica =
    backupReplicas.find((r) => r.id === activeFailoverNodeId) ?? backupReplicas[0];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        const res = importAndMergeDeviceBackup(reader.result);
        setFeedback({ tone: res.ok ? 'ok' : 'warn', text: res.message });
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-5 space-y-5 shadow-2xs">
      {/* Top Banner & Emergency Outage Simulator */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-violet-600">
              Continuité d&apos;Activité Hors-Serveur (PRA / PCA Multi-Appareils)
            </span>
            <span
              className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold ${
                isOutage
                  ? 'bg-amber-100 text-amber-900 border border-amber-300'
                  : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              }`}
            >
              {isOutage
                ? `MODE SECOURS ACTIF SUR : ${activeReplica.deviceName}`
                : '6 APPAREILS SYNCHRONISÉS EN TEMPS RÉEL (PC · TABLETTES · TÉLÉPHONES)'}
            </span>
          </div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
            <Database className="w-5 h-5 text-violet-600 shrink-0" />
            Sauvegarde Automatique Multi-Appareils (PC, Tablette, Téléphone) &amp; Relais Coupure de Courant
          </h2>
          <p className="text-xs text-slate-600">
            En cas de coupure électrique ou de panne du serveur principal de Carré de Soie (<span className="font-mono">10.10.0.10</span>), les données des 2 clubs sont automatiquement répliquées en local (IndexedDB + cache PWA + fichier <span className="font-mono">.cfos-backup.json</span>) sur les autres PC, Tablettes Kiosques et Smartphones de la direction pour continuer à faire tourner Carré de Soie et Beynost sans interruption.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={() => syncAllDeviceReplicasNow()}
            className="px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 text-blue-600" />
            Forcer Réplication (6 appareils)
          </button>

          <button
            onClick={() => exportDeviceBackupJson()}
            className="px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <HardDriveDownload className="w-3.5 h-3.5 text-white" />
            Sauvegarder sur cet appareil (.json)
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            onChange={handleFileUpload}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-3.5 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5 text-emerald-600" />
            Restaurer / Fusionner une sauvegarde
          </button>
        </div>
      </div>

      {/* Live Failover Switch Bar */}
      <div
        className={`p-4 rounded-xl border flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 text-xs ${
          isOutage
            ? 'bg-amber-50 border-amber-300 text-amber-950'
            : 'bg-slate-50 border-slate-200 text-slate-800'
        }`}
      >
        <div className="space-y-1">
          <div className="font-bold text-sm flex items-center gap-2">
            {isOutage ? (
              <ZapOff className="w-4 h-4 text-amber-700 shrink-0" />
            ) : (
              <Zap className="w-4 h-4 text-emerald-600 shrink-0" />
            )}
            <span>
              {isOutage
                ? `Coupure Serveur Active — Les 2 clubs tournent actuellement sur : ${activeReplica.deviceName}`
                : 'Alimentation & Serveur Principal Linux Debian 12 (10.10.0.10) Nominaux'}
            </span>
          </div>
          <div className="text-slate-600">
            Dernière sauvegarde automatique :{' '}
            <span className="font-mono font-semibold text-slate-900">
              {lastAutoBackupAt.slice(0, 19).replace('T', ' ')}
            </span>{' '}
            · Empreinte d&apos;intégrité :{' '}
            <span className="font-mono font-semibold text-violet-600">{lastBackupChecksum}</span> ·{' '}
            <span className="font-semibold">
              {heitzMembers.length} adhérents Heitz, {employees.length} salariés (PIN),{' '}
              {prospects.length} prospects, {shifts.length} shifts
            </span>
            {offlinePointageQueue.length > 0 && (
              <span className="ml-2 font-bold text-amber-800">
                ({offlinePointageQueue.length} pointage(s) en file de secours prêts à resynchroniser)
              </span>
            )}
          </div>
        </div>


        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <select
            aria-label="Choisir l'appareil de secours"
            value={selectedFailoverId}
            onChange={(e) => setSelectedFailoverId(e.target.value)}
            className="px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-900 text-xs font-semibold min-h-[40px]"
          >
            {backupReplicas.map((node) => (
              <option key={node.id} value={node.id}>
                Relais : {node.deviceName}
              </option>
            ))}
          </select>

          {!isOutage ? (
            <button
              onClick={() => simulateServerPowerOutage(true, selectedFailoverId)}
              className="px-3.5 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold flex items-center gap-1.5 cursor-pointer min-h-[40px]"
            >
              <ZapOff className="w-3.5 h-3.5" />
              Simuler Coupure Courant Serveur → Basculer sur cet appareil
            </button>
          ) : (
            <button
              onClick={() => simulateServerPowerOutage(false)}
              className="px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center gap-1.5 cursor-pointer min-h-[40px]"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Rétablir Serveur Principal &amp; Fusionner l&apos;Activité Secours
            </button>
          )}
        </div>
      </div>

      {feedback && (
        <div
          className={`p-3.5 rounded-xl border text-xs font-semibold flex items-center justify-between gap-2 ${
            feedback.tone === 'ok'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-rose-50 border-rose-200 text-rose-900'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.tone === 'ok' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{feedback.text}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="underline text-[11px] cursor-pointer"
          >
            Fermer
          </button>
        </div>
      )}

      {/* Grid of 6 Secondary Backup Devices (2 PCs, 2 Tablets, 2 Phones) */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 text-xs">
        {backupReplicas.map((replica) => {
          const isCurrentFailover = isOutage && replica.id === activeFailoverNodeId;
          return (
            <div
              key={replica.id}
              className={`p-4 rounded-xl border flex flex-col justify-between space-y-3 ${
                isCurrentFailover
                  ? 'bg-amber-50/60 border-amber-400 ring-2 ring-amber-300'
                  : 'bg-white border-slate-200'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <DeviceIcon type={replica.deviceType} />
                    <div>
                      <div className="font-bold text-slate-900 leading-snug">
                        {replica.deviceName}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {formatDeviceBadge(replica.deviceType)} ·{' '}
                        {formatClubName(replica.clubId, false)}
                      </div>
                    </div>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase shrink-0 ${
                      isCurrentFailover
                        ? 'bg-amber-600 text-white'
                        : replica.autoSyncEnabled
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {isCurrentFailover
                      ? 'Relais Actif'
                      : replica.autoSyncEnabled
                      ? 'Auto-Sync ON'
                      : 'Manuel'}
                  </span>
                </div>

                <div className="text-[11px] text-slate-600 space-y-0.5 pt-1 border-t border-slate-100">
                  <div>
                    <span className="font-semibold text-slate-800">Cible :</span>{' '}
                    <span className="font-mono">{replica.ipOrHolder}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-800">Stockage :</span>{' '}
                    {replica.storageEngine}
                  </div>
                  <div>
                    <span className="font-semibold text-slate-800">Données répliquées :</span>{' '}
                    {replica.recordsMirrored.members} adhérents Heitz ·{' '}
                    {replica.recordsMirrored.employees} salariés PIN ·{' '}
                    {replica.recordsMirrored.prospects} prospects ·{' '}
                    {replica.recordsMirrored.shifts} shifts
                  </div>
                  <div className="flex items-center justify-between pt-1 text-[10px] text-slate-500 font-mono">
                    <span>Sync: {replica.lastSyncedAt.slice(11, 19)}</span>
                    <span>
                      {replica.lastChecksum} ({replica.snapshotSizeKb} Ko)
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-1.5">
                <button
                  onClick={() => toggleReplicaAutoSync(replica.id)}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold cursor-pointer"
                >
                  {replica.autoSyncEnabled ? 'Désactiver Auto' : 'Activer Auto'}
                </button>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      setSelectedFailoverId(replica.id);
                      simulateServerPowerOutage(true, replica.id);
                    }}
                    className="px-2.5 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 text-[11px] font-semibold cursor-pointer"
                  >
                    Basculer dessus
                  </button>
                  <button
                    onClick={() => exportDeviceBackupJson(replica.id)}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <HardDriveDownload className="w-3 h-3 text-orange-400" />
                    Copie .json
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
