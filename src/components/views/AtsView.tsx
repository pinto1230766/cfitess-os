import React, { useState } from 'react';
import { useCfos } from '../../context/CfosContext';
import {
  UserCheck,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Share2,
  ShieldCheck,
} from 'lucide-react';
import { CandidateStage } from '../../types/cfos';

export function AtsView() {
  const {
    clubFilter,
    candidates,
    moveCandidateStage,
    runCandidateOnboarding,
  } = useCfos();

  const [simulateRollback, setSimulateRollback] = useState(false);
  const [transactionBanner, setTransactionBanner] = useState<{
    type: 'ok' | 'error';
    title: string;
    details: string;
  } | null>(null);

  const filteredCandidates =
    clubFilter === 'all' ? candidates : candidates.filter((c) => c.clubId === clubFilter);

  const handleHireClick = (candidateId: string) => {
    const res = runCandidateOnboarding({
      candidateId,
      firstShiftDate: '2026-10-24',
      firstShiftStart: '09:00',
      firstShiftEnd: '17:00',
      hourlyRate: 13.5,
      weeklyHours: 35,
      simulateMidWayFailure: simulateRollback,
    });

    if (!res.ok) {
      setTransactionBanner({
        type: 'error',
        title: 'Test Phase 6 Validé : Rollback Atomique Exécuté',
        details: res.error || 'Transaction annulée.',
      });
    } else if (res.newEmployee && res.newShift) {
      setTransactionBanner({
        type: 'ok',
        title: `Bascule 1-Clic réussie : ${res.newEmployee.firstName} ${res.newEmployee.lastName} est maintenant opérationnel !`,
        details: `Profil salarié créé (${res.newEmployee.email}) · Code PIN Kiosque généré (${res.newEmployee.pinCode}) · 1er créneau planning créé (${res.newShift.date} ${res.newShift.startTime}-${res.newShift.endTime}) · Contrat & Pré-DPAE déposés dans le coffre-fort RH · Parcours Académie assigné (${res.newModuleProgress?.length || 0} modules).`,
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-orange-600">
            Module M6 · Recrutement ATS &amp; Bascule Atomique en 1 Clic (Décision D8)
          </div>
          <h1 className="text-lg sm:text-xl font-bold text-slate-900 mt-1">
            Multiposting Offres, Kanban Candidats &amp; Onboarding Transactionnel
          </h1>
          <p className="text-xs text-slate-600 mt-1">
            Diffusion simultanée Indeed, WTTJ, LinkedIn, France Travail &amp; JobTeaser · L&apos;IA assiste le tri sans jamais rejeter automatiquement un candidat (§11)
          </p>
        </div>

        <label className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-slate-100 border border-slate-200 text-xs font-medium text-slate-700 cursor-pointer shrink-0">
          <input
            type="checkbox"
            checked={simulateRollback}
            onChange={(e) => setSimulateRollback(e.target.checked)}
          />
          <span>Simuler panne Phase 6 (Test Rollback Atomique)</span>
        </label>
      </div>

      {transactionBanner && (
        <div
          className={`p-4 rounded-xl border text-xs space-y-1 ${
            transactionBanner.type === 'error'
              ? 'bg-amber-50 border-amber-300 text-amber-950'
              : 'bg-emerald-50 border-emerald-300 text-emerald-950'
          }`}
        >
          <div className="font-bold flex items-center justify-between">
            <span className="flex items-center gap-2">
              {transactionBanner.type === 'error' ? (
                <AlertTriangle className="w-4 h-4 text-amber-600" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              )}
              {transactionBanner.title}
            </span>
            <button
              onClick={() => setTransactionBanner(null)}
              className="underline cursor-pointer"
            >
              Fermer
            </button>
          </div>
          <p>{transactionBanner.details}</p>
        </div>
      )}

      {/* Multiposting Active Channels Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="font-semibold text-slate-800 flex items-center gap-2">
          <Share2 className="w-4 h-4 text-orange-600" />
          Canaux de multidiffusion connectés :
        </div>
        <div className="text-slate-600 font-medium">
          Indeed Sponsorisé · Welcome to the Jungle · LinkedIn Jobs · France Travail · JobTeaser (Écoles BPJEPS/CFA) · Site carrière c.fitness
        </div>
      </div>

      {/* Candidates Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredCandidates.map((cand) => (
          <div
            key={cand.id}
            className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="text-[11px] font-semibold text-slate-500">
                    Club {cand.clubId === 'carre-de-soie' ? 'Carré de Soie' : 'Beynost'} · Source :{' '}
                    {cand.sourceChannel}
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mt-0.5">
                    {cand.firstName} {cand.lastName}
                  </h3>
                  <div className="text-xs font-semibold text-orange-600">
                    Cible : {cand.roleTarget} ({cand.contractTarget})
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold text-emerald-700">
                    {cand.stage}
                  </div>
                  <div className="text-[11px] text-slate-400">Aide à la décision</div>
                </div>
              </div>

              <div className="mt-3 text-xs text-slate-600 space-y-1.5">
                <div className="font-mono text-slate-700">
                  {cand.phone} · {cand.email}
                </div>
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-orange-600" />
                    Synthèse IA &amp; Points clés :
                  </div>
                  <p className="text-slate-600 mt-1">{cand.aiDecisionSupportNote}</p>
                </div>
                <div className="text-slate-500">
                  <span className="font-semibold text-slate-700">Parcours :</span>{' '}
                  {cand.experienceSummary}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <select
                value={cand.stage}
                onChange={(e) =>
                  moveCandidateStage(cand.id, e.target.value as CandidateStage)
                }
                className="px-3 py-2 rounded-lg border border-slate-200 text-xs font-semibold bg-slate-50 text-slate-800"
              >
                <option value="Reçue">1. Reçue</option>
                <option value="Examen dirigeants">2. Examen dirigeants</option>
                <option value="Entretien club">3. Entretien club</option>
                <option value="Retenu">4. Retenu</option>
              </select>

              {cand.onboardedEmployeeId ? (
                <span className="text-xs font-bold text-emerald-700 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" />
                  Déjà basculé dans l&apos;équipe RH
                </span>
              ) : (
                <button
                  onClick={() => handleHireClick(cand.id)}
                  className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <UserCheck className="w-4 h-4 text-orange-400" />
                  Embaucher en 1 Clic (Transaction Atomique)
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
