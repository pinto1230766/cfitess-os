import React, { useState } from 'react';
import {
  Dumbbell,
  X,
  Activity,
  Flame,
  Plus,
  CheckCircle2,
  Sparkles,
  HeartPulse,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';
import { useCfos } from '../context/CfosContext';
import { formatClubName } from '../domain/rules';

interface PrescribedExercise {
  id: string;
  machine: string;
  loadLabel: string;
  setsReps: string;
  coachSetting: string;
  completedToday: boolean;
}

const DEFAULT_EXERCISES: PrescribedExercise[] = [
  {
    id: 'ex-1',
    machine: 'Biocircuit Chest Press (Technogym)',
    loadLabel: '42 kg (Résistance isotonique)',
    setsReps: '3 séries × 12 rép.',
    coachSetting: 'Siège #4 · Amplitude 85 % · Tempo 2-0-2',
    completedToday: true,
  },
  {
    id: 'ex-2',
    machine: 'Biocircuit Leg Press (Technogym)',
    loadLabel: '95 kg (Force concentrique/excentrique)',
    setsReps: '3 séries × 15 rép.',
    coachSetting: 'Dossier #3 · Protection genoux active',
    completedToday: true,
  },
  {
    id: 'ex-3',
    machine: 'Biocircuit Lat Pulldown (Tirage Dos)',
    loadLabel: '45 kg',
    setsReps: '3 séries × 12 rép.',
    coachSetting: 'Siège #5 · Contraction isométrique 1s',
    completedToday: false,
  },
  {
    id: 'ex-4',
    machine: 'Skillrun Unity 7000 — Cardio HIIT',
    loadLabel: 'Vitesse 11.5 km/h · Pente 4 %',
    setsReps: '12 min (Intervalles 45s/15s)',
    coachSetting: 'Zone FC cible : 148–162 bpm (Mywellness Band)',
    completedToday: false,
  },
];

export function MywellnessSportSheetModal() {
  const {
    activeMywellnessModal,
    closeMywellnessModal,
    heitzMembers,
    inBodyScans,
    addInBodyScan,
    setActiveSection,
    themeMode,
  } = useCfos();

  const [exercises, setExercises] = useState<PrescribedExercise[]>(DEFAULT_EXERCISES);
  const [newMachine, setNewMachine] = useState('');
  const [newLoad, setNewLoad] = useState('40 kg');
  const [newSetsReps, setNewSetsReps] = useState('3 séries × 12 rép.');
  const [newSetting, setNewSetting] = useState('Réglage automatique Technogym Key');
  const [bonusMoves, setBonusMoves] = useState(0);
  const [localNotice, setLocalNotice] = useState<string | null>(null);

  if (!activeMywellnessModal) return null;

  const isDark = themeMode === 'dark';

  // Find matching member from Heitz directory or Checkup scans
  const matchedMember =
    heitzMembers.find(
      (m) =>
        (activeMywellnessModal.mywellnessMemberId &&
          (m.mywellnessMemberId === activeMywellnessModal.mywellnessMemberId ||
            m.id === activeMywellnessModal.mywellnessMemberId)) ||
        (activeMywellnessModal.personName &&
          `${m.firstName} ${m.lastName}`.toLowerCase() ===
            activeMywellnessModal.personName.toLowerCase())
    ) || heitzMembers[0];

  const matchedScan =
    inBodyScans.find(
      (s) =>
        (activeMywellnessModal.personName &&
          s.personName.toLowerCase() === activeMywellnessModal.personName.toLowerCase()) ||
        s.id === activeMywellnessModal.mywellnessMemberId ||
        (matchedMember &&
          s.personName.toLowerCase() ===
            `${matchedMember.firstName} ${matchedMember.lastName}`.toLowerCase())
    ) || inBodyScans[0];

  const displayName =
    activeMywellnessModal.personName ||
    (matchedMember ? `${matchedMember.firstName} ${matchedMember.lastName}` : 'Camille Garnier');
  const displayClubId =
    activeMywellnessModal.clubId || matchedMember?.homeClubId || 'carre-de-soie';
  const displayMwId =
    activeMywellnessModal.mywellnessMemberId ||
    matchedMember?.mywellnessMemberId ||
    'mw-cds-101';
  const wellnessAge =
    matchedMember?.technogymCheckupWellnessAge || matchedScan?.wellnessAgeYears || 29;
  const checkupScore = matchedMember?.technogymCheckupScore || 86;
  const totalMoves = (matchedMember?.technogymMoves30d || 8450) + bonusMoves;

  const handleToggleExercise = (id: string) => {
    setExercises((prev) =>
      prev.map((ex) => (ex.id === id ? { ...ex, completedToday: !ex.completedToday } : ex))
    );
  };

  const handleAddExercise = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMachine.trim()) return;
    const added: PrescribedExercise = {
      id: `ex-${Date.now()}`,
      machine: newMachine.trim(),
      loadLabel: newLoad.trim() || '35 kg',
      setsReps: newSetsReps.trim() || '3 × 12 rép.',
      coachSetting: newSetting.trim() || 'Synchronisé Biocircuit',
      completedToday: false,
    };
    setExercises((prev) => [...prev, added]);
    setNewMachine('');
    setLocalNotice(
      `Exercice « ${added.machine} » ajouté au programme Mywellness de ${displayName}.`
    );
  };

  const handleQuickCheckupSync = () => {
    addInBodyScan({
      personName: displayName,
      personType: 'Adhérent',
      clubId: displayClubId,
      date: new Date().toISOString().slice(0, 10),
      deviceModel:
        displayClubId === 'carre-de-soie'
          ? 'Technogym Checkup — Carré de Soie (Mywellness)'
          : 'Technogym Checkup — Beynost (Mywellness)',
      weightKg: matchedScan?.weightKg || 64.5,
      skeletalMuscleMassKg: Number(((matchedScan?.skeletalMuscleMassKg || 28.4) + 0.3).toFixed(1)),
      bodyFatPercent: Number(((matchedScan?.bodyFatPercent || 19.2) - 0.2).toFixed(1)),
      totalBodyWaterL: matchedScan?.totalBodyWaterL || 38.6,
      visceralFatLevel: matchedScan?.visceralFatLevel || 5,
      coachNote: `Bilan Technogym Checkup mis à jour depuis la Fiche Sportive Mywellness (${totalMoves} MOVEs).`,
      mywellnessSynced: true,
      wellnessAgeYears: wellnessAge,
    });
    setLocalNotice(
      `Nouveau bilan Technogym Checkup BIA synchronisé pour ${displayName} (Wellness Age™ ${wellnessAge} ans).`
    );
  };

  const handleOpenFullCheckupTab = () => {
    setActiveSection('devices', 'checkup');
    closeMywellnessModal();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div
        className={`w-full max-w-4xl rounded-3xl border shadow-2xl overflow-hidden my-auto ${
          isDark
            ? 'bg-[#161926] border-slate-800 text-slate-100'
            : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Top Technogym Mywellness Header */}
        <div className="bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 text-slate-950 px-5 py-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-slate-950 text-amber-400 flex items-center justify-center shadow-sm shrink-0">
              <Dumbbell className="w-6 h-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-slate-950 text-amber-300">
                  TECHNOGYM MYWELLNESS &amp; CHECKUP LOCAL
                </span>
                <span className="font-mono text-xs font-bold">ID : {displayMwId}</span>
              </div>
              <h2 className="text-lg sm:text-xl font-black tracking-tight mt-0.5">
                Fiche Sportive &amp; Suivi Biocircuit — {displayName}
              </h2>
              <div className="text-xs font-semibold text-slate-800">
                Club : {formatClubName(displayClubId)} · Clé Technogym &amp; App Mobile Synchronisées
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleOpenFullCheckupTab}
              className="px-3.5 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-amber-300 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Activity className="w-4 h-4" />
              <span>Voir tous les Bilans Checkup</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={closeMywellnessModal}
              aria-label="Fermer la fiche sportive Mywellness"
              className="p-2 rounded-xl bg-slate-950/15 hover:bg-slate-950/25 text-slate-950 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-5 space-y-5 max-h-[80vh] overflow-y-auto text-xs">
          {localNotice && (
            <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-600 dark:text-emerald-300 font-bold flex items-center justify-between gap-2">
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                {localNotice}
              </span>
              <button
                type="button"
                onClick={() => setLocalNotice(null)}
                className="underline text-[11px] cursor-pointer"
              >
                Fermer
              </button>
            </div>
          )}

          {/* 4 Biometric & Sport KPIs */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div
              className={`p-3.5 rounded-2xl border ${
                isDark ? 'bg-[#1E2235] border-slate-800' : 'bg-amber-50/70 border-amber-200'
              }`}
            >
              <div className="text-[11px] font-bold text-amber-600 uppercase">Wellness Age™</div>
              <div className="text-2xl font-black font-mono mt-1">{wellnessAge} ans</div>
              <div className="text-[11px] text-emerald-600 font-semibold mt-0.5">
                -5 ans vs âge chronologique
              </div>
            </div>

            <div
              className={`p-3.5 rounded-2xl border ${
                isDark ? 'bg-[#1E2235] border-slate-800' : 'bg-violet-50/70 border-violet-200'
              }`}
            >
              <div className="text-[11px] font-bold text-violet-600 uppercase">
                Score Technogym Checkup
              </div>
              <div className="text-2xl font-black font-mono mt-1">{checkupScore} / 100</div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                BIA + Mobilité + Équilibre + Force
              </div>
            </div>

            <div
              className={`p-3.5 rounded-2xl border ${
                isDark ? 'bg-[#1E2235] border-slate-800' : 'bg-emerald-50/70 border-emerald-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-emerald-600 uppercase">
                  Volume 30 Jours
                </span>
                <Flame className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-2xl font-black font-mono mt-1">
                {totalMoves.toLocaleString('fr-FR')} MOVEs
              </div>
              <button
                type="button"
                onClick={() => {
                  setBonusMoves((m) => m + 250);
                  setLocalNotice(`+250 MOVEs crédités sur le profil Mywellness de ${displayName}.`);
                }}
                className="mt-1 px-2 py-0.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] cursor-pointer"
              >
                +250 MOVEs (Séance validée)
              </button>
            </div>

            <div
              className={`p-3.5 rounded-2xl border ${
                isDark ? 'bg-[#1E2235] border-slate-800' : 'bg-sky-50/70 border-sky-200'
              }`}
            >
              <div className="text-[11px] font-bold text-sky-600 uppercase">
                Composition Corporelle BIA
              </div>
              <div className="font-mono font-black text-sm mt-1">
                {matchedScan?.weightKg || 64.5} kg · SMM {matchedScan?.skeletalMuscleMassKg || 28.4} kg
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                Masse grasse : {matchedScan?.bodyFatPercent || 19.2} % · Eau :{' '}
                {matchedScan?.totalBodyWaterL || 38.6} L
              </div>
            </div>
          </div>

          {/* Interactive Training Program & Biocircuit Prescription */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            <div
              className={`lg:col-span-7 p-4 rounded-2xl border space-y-3 ${
                isDark ? 'bg-[#1E2235] border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-extrabold text-sm flex items-center gap-1.5">
                    <HeartPulse className="w-4 h-4 text-violet-500" />
                    <span>Programme d&apos;Entraînement Biocircuit &amp; Plateau ({exercises.length})</span>
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Cliquez sur un exercice pour pointer sa réalisation sur la séance du jour.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setLocalNotice(
                      `Programme Biocircuit synchronisé avec la clé Technogym et l'App Mywellness de ${displayName}.`
                    )
                  }
                  className="px-2.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Sync Clé / App</span>
                </button>
              </div>

              <div className="space-y-2">
                {exercises.map((ex) => (
                  <div
                    key={ex.id}
                    onClick={() => handleToggleExercise(ex.id)}
                    className={`p-3 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition-all ${
                      ex.completedToday
                        ? isDark
                          ? 'bg-emerald-950/30 border-emerald-700/60'
                          : 'bg-emerald-50 border-emerald-200'
                        : isDark
                        ? 'bg-[#161926] border-slate-800 hover:border-slate-700'
                        : 'bg-white border-slate-200 hover:border-violet-300'
                    }`}
                  >
                    <div>
                      <div className="font-bold flex items-center gap-2">
                        <span>{ex.machine}</span>
                        <span className="px-2 py-0.5 rounded bg-violet-500/15 text-violet-500 font-mono text-[10px] font-bold">
                          {ex.setsReps}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        Charge : <strong className="text-amber-500">{ex.loadLabel}</strong> ·{' '}
                        {ex.coachSetting}
                      </div>
                    </div>
                    <span
                      className={`px-2.5 py-1 rounded-lg font-bold text-[10px] shrink-0 ${
                        ex.completedToday
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      {ex.completedToday ? '✓ Réalisé' : 'À faire'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column: Add Exercise + Quick Checkup Sync */}
            <div className="lg:col-span-5 space-y-4">
              <form
                onSubmit={handleAddExercise}
                className={`p-4 rounded-2xl border space-y-3 ${
                  isDark ? 'bg-[#1E2235] border-slate-800' : 'bg-white border-slate-200'
                }`}
              >
                <div className="font-extrabold text-sm flex items-center gap-1.5">
                  <Plus className="w-4 h-4 text-violet-500" />
                  <span>Ajouter un exercice au programme</span>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                    Machine Technogym / Exercice *
                  </label>
                  <input
                    type="text"
                    required
                    value={newMachine}
                    onChange={(e) => setNewMachine(e.target.value)}
                    placeholder="Ex: Biocircuit Shoulder Press, Pure Strength..."
                    className={`w-full px-3 py-2 rounded-xl border ${
                      isDark
                        ? 'bg-[#161926] border-slate-700 text-white'
                        : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                      Charge / Vitesse
                    </label>
                    <input
                      type="text"
                      value={newLoad}
                      onChange={(e) => setNewLoad(e.target.value)}
                      className={`w-full px-3 py-2 rounded-xl border font-mono ${
                        isDark
                          ? 'bg-[#161926] border-slate-700 text-white'
                          : 'bg-slate-50 border-slate-200 text-slate-900'
                      }`}
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                      Séries × Répétitions
                    </label>
                    <input
                      type="text"
                      value={newSetsReps}
                      onChange={(e) => setNewSetsReps(e.target.value)}
                      className={`w-full px-3 py-2 rounded-xl border font-mono ${
                        isDark
                          ? 'bg-[#161926] border-slate-700 text-white'
                          : 'bg-slate-50 border-slate-200 text-slate-900'
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                    Consigne Coach / Réglage Biométrique
                  </label>
                  <input
                    type="text"
                    value={newSetting}
                    onChange={(e) => setNewSetting(e.target.value)}
                    className={`w-full px-3 py-2 rounded-xl border ${
                      isDark
                        ? 'bg-[#161926] border-slate-700 text-white'
                        : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Prescrire sur la Fiche Sportive Mywellness</span>
                </button>
              </form>

              <div
                className={`p-4 rounded-2xl border space-y-2.5 ${
                  isDark ? 'bg-[#1E2235] border-slate-800' : 'bg-amber-50/70 border-amber-200'
                }`}
              >
                <div className="font-extrabold text-sm flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>Station Technogym Checkup (Balance BIA &amp; 3D)</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Lancez une synchronisation directe avec la borne Technogym Checkup du club pour archiver l&apos;évolution musculaire de {displayName}.
                </p>
                <button
                  type="button"
                  onClick={handleQuickCheckupSync}
                  className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Activity className="w-4 h-4" />
                  <span>Enregistrer un nouveau Bilan Checkup BIA</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
