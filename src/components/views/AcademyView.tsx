import React, { useState, useEffect } from 'react';
import { useCfos } from '../../context/CfosContext';
import {
  GraduationCap,
  CheckSquare,
  BookOpen,
  CheckCircle2,
  Award,
  BarChart3,
  TrendingUp,
  Users,
  Euro,
  Activity,
  Download,
} from 'lucide-react';

export function AcademyView() {
  const {
    clubFilter,
    currentUser,
    employees,
    trainingModules,
    moduleProgress,
    bpjepsMilestones,
    checklists,
    completeAcademyQuiz,
    toggleBpjepsMilestoneValidation,
    toggleChecklistItem,
    setActiveSection,
    navSubTarget,
  } = useCfos();

  const [viewMode, setViewMode] = useState<'RAPPORTS' | 'ACADEMIE'>(
    navSubTarget === 'academy' ? 'ACADEMIE' : 'RAPPORTS'
  );

  useEffect(() => {
    if (navSubTarget === 'academy') {
      setViewMode('ACADEMIE');
    } else if (navSubTarget === 'rapports') {
      setViewMode('RAPPORTS');
    }
  }, [navSubTarget]);

  const [activeModuleId, setActiveModuleId] = useState<string>(trainingModules[0]?.id || 'mod-1');
  const [selectedOption, setSelectedOption] = useState<number>(0);
  const [quizMessage, setQuizMessage] = useState<{
    passed: boolean;
    text: string;
  } | null>(null);
  const [exportToast, setExportToast] = useState<string | null>(null);

  const selectedModule =
    trainingModules.find((m) => m.id === activeModuleId) || trainingModules[0];

  const filteredChecklist =
    clubFilter === 'all' ? checklists : checklists.filter((c) => c.clubId === clubFilter);

  const handleValidateQuiz = () => {
    if (!selectedModule) return;
    const res = completeAcademyQuiz(currentUser.id, selectedModule.id, selectedOption);
    setQuizMessage({ passed: res.passed, text: res.message });
  };

  return (
    <div className="space-y-6">
      {/* Header C.Fitness OS : Rapports & Académie */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 shadow-2xs flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-violet-600 to-indigo-500 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
            {viewMode === 'RAPPORTS' ? (
              <BarChart3 className="w-5 h-5" />
            ) : (
              <GraduationCap className="w-5 h-5" />
            )}
          </div>
          <div>
            <div className="text-xs font-semibold text-violet-600">
              {viewMode === 'RAPPORTS'
                ? 'Rapports · Analyses Bi-Club, Fréquentation, CA, Abonnements & Qualité'
                : 'Académie · Formation Interne 3S, Livret BPJEPS & Checklists'}
            </div>
            <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 mt-0.5">
              {viewMode === 'RAPPORTS'
                ? 'Rapports & Statistiques Consolidés (C.Fitness Center & C.Fitness Place)'
                : 'Académie Interne C.Fitness, Suivi Apprentis BPJEPS & Checklists'}
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              {viewMode === 'RAPPORTS'
                ? 'Synthèse mensuelle des performances : 1 248 adhérents actifs (+12 %), 102 450 € de CA (+8 %), 78 % de fréquentation et 4,8/5 de satisfaction.'
                : '5 modules officiels conçus par la direction C.Fitness · Livret numérique BPJEPS / CFA avec validation tuteur'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200/80 shrink-0">
          <button
            type="button"
            onClick={() => setViewMode('RAPPORTS')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-2 cursor-pointer transition-colors ${
              viewMode === 'RAPPORTS'
                ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-2xs'
                : 'text-slate-600 hover:bg-white hover:text-slate-900'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>1. Rapports &amp; Statistiques Bi-Club</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('ACADEMIE')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-2 cursor-pointer transition-colors ${
              viewMode === 'ACADEMIE'
                ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-2xs'
                : 'text-slate-600 hover:bg-white hover:text-slate-900'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>2. Académie &amp; Checklists ({trainingModules.length})</span>
          </button>
        </div>
      </div>

      {exportToast && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center justify-between">
          <span>{exportToast}</span>
          <button
            type="button"
            onClick={() => setExportToast(null)}
            className="underline cursor-pointer"
          >
            Fermer
          </button>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODE 1: RAPPORTS & STATISTIQUES BI-CLUB                             */}
      {/* =================================================================== */}
      {viewMode === 'RAPPORTS' && (
        <div className="space-y-6">
          {/* 4 Report Summary Cards matching Homepage */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-2xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-500">Rapport Adhérents Actifs</span>
                <Users className="w-4 h-4 text-violet-600" />
              </div>
              <div className="text-2xl font-black text-slate-900">
                1 248 <span className="text-xs font-bold text-emerald-600">↑ +12%</span>
              </div>
              <div className="text-[11px] text-slate-500">
                Center : 682 (+10%) · Place : 566 (+14%)
              </div>
              <button
                type="button"
                onClick={() => setActiveSection('devices', 'adherents')}
                className="w-full py-1.5 px-2.5 rounded-lg bg-violet-50 hover:bg-violet-100 text-violet-700 font-bold cursor-pointer"
              >
                Ouvrir détail Adhérents →
              </button>
            </div>

            <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-2xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-500">Rapport Financier &amp; CA</span>
                <Euro className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-black text-slate-900">
                102 450 € <span className="text-xs font-bold text-emerald-600">↑ +8%</span>
              </div>
              <div className="text-[11px] text-slate-500">
                Center : 54 230 € · Place : 48 220 €
              </div>
              <button
                type="button"
                onClick={() => setActiveSection('devices', 'finances')}
                className="w-full py-1.5 px-2.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold cursor-pointer"
              >
                Ouvrir détail Finances →
              </button>
            </div>

            <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-2xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-500">Rapport Fréquentation FMI</span>
                <TrendingUp className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-2xl font-black text-slate-900">
                78 % <span className="text-xs font-bold text-emerald-600">↑ +6%</span>
              </div>
              <div className="text-[11px] text-slate-500">
                Center : 76 % (28 cours) · Place : 80 % (32 cours)
              </div>
              <button
                type="button"
                onClick={() => setActiveSection('planning-hr', 'cours-collectifs')}
                className="w-full py-1.5 px-2.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold cursor-pointer"
              >
                Ouvrir Cours collectifs →
              </button>
            </div>

            <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-2xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-500">Économies SaaS &amp; ROI</span>
                <Activity className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-2xl font-black text-slate-900">
                18 120 € <span className="text-xs font-bold text-emerald-600">/ an</span>
              </div>
              <div className="text-[11px] text-slate-500">
                Licences Ringover, Skello, CRM &amp; Yousign économisées
              </div>
              <button
                type="button"
                onClick={() => setActiveSection('dashboard')}
                className="w-full py-1.5 px-2.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold cursor-pointer"
              >
                Voir Dossier ROI →
              </button>
            </div>
          </div>

          {/* Detailed Comparative Reports Table */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xs space-y-4 text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <span className="text-[11px] font-mono uppercase text-violet-600 font-bold">
                  Tableau Comparatif Multi-Sites · Avril 2025
                </span>
                <h2 className="text-base font-extrabold text-slate-900">
                  Comparatif Détaillé : C.Fitness Center (Lyon 3e) vs C.Fitness Place (Lyon 6e)
                </h2>
              </div>
              <button
                type="button"
                onClick={() =>
                  setExportToast(
                    'Rapport mensuel consolidé (PDF / CSV) généré avec succès pour C.Fitness Center et C.Fitness Place.'
                  )
                }
                className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold flex items-center gap-1.5 cursor-pointer self-start"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Exporter les Rapports (CSV / PDF)</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-[11px] font-bold uppercase text-slate-500">
                    <th className="py-2.5 pr-3">Indicateur de Performance</th>
                    <th className="py-2.5 px-3">C.Fitness Center (CDS)</th>
                    <th className="py-2.5 px-3">C.Fitness Place (BEY)</th>
                    <th className="py-2.5 px-3">Total / Moyenne Bi-Club</th>
                    <th className="py-2.5 pl-3">Évolution (30j)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  <tr>
                    <td className="py-2.5 pr-3 font-bold text-slate-900">Adhérents actifs</td>
                    <td className="py-2.5 px-3 font-semibold">682 adhérents</td>
                    <td className="py-2.5 px-3 font-semibold">566 adhérents</td>
                    <td className="py-2.5 px-3 font-black text-violet-700">1 248 adhérents</td>
                    <td className="py-2.5 pl-3 text-emerald-600 font-bold">↑ +12 %</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 pr-3 font-bold text-slate-900">Chiffre d&apos;affaires mensuel</td>
                    <td className="py-2.5 px-3 font-semibold">54 230 €</td>
                    <td className="py-2.5 px-3 font-semibold">48 220 €</td>
                    <td className="py-2.5 px-3 font-black text-emerald-700">102 450 €</td>
                    <td className="py-2.5 pl-3 text-emerald-600 font-bold">↑ +8 %</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 pr-3 font-bold text-slate-900">Taux de fréquentation moyen</td>
                    <td className="py-2.5 px-3 font-semibold">76 %</td>
                    <td className="py-2.5 px-3 font-semibold">80 %</td>
                    <td className="py-2.5 px-3 font-black text-blue-700">78 %</td>
                    <td className="py-2.5 pl-3 text-emerald-600 font-bold">↑ +6 %</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 pr-3 font-bold text-slate-900">Cours collectifs / semaine</td>
                    <td className="py-2.5 px-3 font-semibold">28 cours / sem</td>
                    <td className="py-2.5 px-3 font-semibold">32 cours / sem</td>
                    <td className="py-2.5 px-3 font-black text-slate-900">60 cours / sem</td>
                    <td className="py-2.5 pl-3 text-emerald-600 font-bold">Top: BodyPump (92%)</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 pr-3 font-bold text-slate-900">Répartition Abonnements</td>
                    <td className="py-2.5 px-3 text-slate-600">Annuel 41% · Mensuel 32%</td>
                    <td className="py-2.5 px-3 text-slate-600">Étudiant 12% · Corp. 8%</td>
                    <td className="py-2.5 px-3 font-bold text-slate-900">100 % SEPA EBICS</td>
                    <td className="py-2.5 pl-3 text-rose-600 font-bold">5 impayés (1 250 €)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {quizMessage && (
        <div
          className={`p-4 rounded-2xl border text-xs font-medium flex items-center justify-between ${
            quizMessage.passed
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-amber-50 border-amber-200 text-amber-900'
          }`}
        >
          <span>{quizMessage.text}</span>
          <button
            onClick={() => setQuizMessage(null)}
            className="underline text-xs cursor-pointer"
          >
            Fermer
          </button>
        </div>
      )}

      {/* Two-Column Layout: 5 Academy Modules + Quiz */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: 5 Modules List */}
        <div className="lg:col-span-5 bg-white border border-slate-200/80 rounded-2xl p-5 space-y-3 shadow-2xs">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-violet-600" />
            Parcours d&apos;Intégration C.Fitness (5 Modules)
          </h2>
          <div className="space-y-2">
            {trainingModules.map((mod) => {
              const isCompleted = moduleProgress.some(
                (mp) =>
                  mp.moduleId === mod.id &&
                  mp.employeeId === currentUser.id &&
                  mp.completed
              );
              const totalCert = moduleProgress.filter(
                (mp) => mp.moduleId === mod.id && mp.completed
              ).length;

              return (
                <button
                  key={mod.id}
                  onClick={() => {
                    setActiveModuleId(mod.id);
                    setSelectedOption(mod.quizCorrectIndex);
                    setQuizMessage(null);
                  }}
                  className={`w-full p-3.5 rounded-xl border text-left transition-colors cursor-pointer ${
                    selectedModule?.id === mod.id
                      ? 'border-violet-500 bg-violet-50/40'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span className="font-mono font-bold text-violet-600">{mod.code}</span>
                    <span>
                      {mod.durationMin} min · {totalCert} certifiés
                    </span>
                  </div>
                  <div className="text-xs font-bold text-slate-900 mt-1">{mod.title}</div>
                  <div className="text-[11px] text-slate-600 mt-1 line-clamp-2">
                    {mod.summary}
                  </div>
                  {isCompleted && (
                    <div className="mt-2 text-[11px] font-semibold text-emerald-700 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Certifié par {currentUser.firstName} {currentUser.lastName}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Active Module Detail & Interactive Quiz */}
        <div className="lg:col-span-7 bg-white border border-slate-200/80 rounded-2xl p-5 space-y-5 shadow-2xs">
          {selectedModule && (
            <>
              <div className="border-b border-slate-100 pb-4">
                <div className="text-xs font-mono font-bold text-violet-600">
                  {selectedModule.code} · Auteurs : {selectedModule.authors}
                </div>
                <h2 className="text-lg font-bold text-slate-900 mt-0.5">
                  {selectedModule.title}
                </h2>
                <p className="text-xs text-slate-600 mt-1">{selectedModule.summary}</p>
                <ul className="mt-3 space-y-1 text-xs text-slate-700">
                  {selectedModule.keyPoints.map((pt, idx) => (
                    <li key={idx}>• {pt}</li>
                  ))}
                </ul>
              </div>

              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Quiz de validation des acquis (Seuil requis : 100%)
                </h3>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5 text-xs">
                  <div className="font-bold text-slate-900">
                    Question : {selectedModule.quizQuestion}
                  </div>
                  <div className="space-y-1.5">
                    {selectedModule.quizOptions.map((opt, oIdx) => (
                      <label
                        key={oIdx}
                        className={`flex items-center gap-2.5 p-2.5 rounded-lg border cursor-pointer ${
                          selectedOption === oIdx
                            ? 'border-violet-500 bg-white font-semibold text-slate-900'
                            : 'border-slate-200 bg-white text-slate-700'
                        }`}
                      >
                        <input
                          type="radio"
                          name="quiz-option"
                          checked={selectedOption === oIdx}
                          onChange={() => setSelectedOption(oIdx)}
                        />
                        <span>{opt}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleValidateQuiz}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-semibold flex items-center gap-2 cursor-pointer shadow-2xs"
                >
                  <Award className="w-4 h-4" />
                  Valider le Quiz &amp; Certifier ce module
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Bottom Grid: BPJEPS Apprentice Livret + Daily Club Checklists */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* BPJEPS Livret */}
        <div className="lg:col-span-7 bg-white border border-slate-200/80 rounded-2xl p-5 space-y-4 shadow-2xs">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-emerald-600" />
              Livret d&apos;Alternance BPJEPS AF (UC1 à UC4) — Suivi Tuteur / CFA
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Suivi des compétences terrain et validation par le tuteur référent C.Fitness
            </p>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {bpjepsMilestones.map((uc) => {
              const appEmp = employees.find((e) => e.id === uc.apprenticeId);
              return (
                <div
                  key={uc.id}
                  className="py-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="font-bold text-slate-900">
                      <span className="font-mono text-violet-600">{uc.ucCode}</span> — {uc.title}
                    </div>
                    <div className="text-slate-600">
                      Apprenti :{' '}
                      <span className="font-semibold">
                        {appEmp ? `${appEmp.firstName} ${appEmp.lastName}` : uc.apprenticeId}
                      </span>
                    </div>
                    <div className="text-slate-500 italic">« {uc.monthlyReviewNote} »</div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {uc.tutorValidated ? (
                      <div className="flex items-center gap-2.5">
                        <div className="text-right">
                          <div className="font-bold text-emerald-700">Validé Tuteur</div>
                          <div className="text-[11px] text-slate-500">
                            Par {uc.validatedBy} ({uc.validatedAt})
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => toggleBpjepsMilestoneValidation(uc.id)}
                          className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[11px] cursor-pointer"
                          title="Cliquer pour annuler la validation tuteur et repasser en cours"
                        >
                          Remettre en cours
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => toggleBpjepsMilestoneValidation(uc.id)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold cursor-pointer"
                      >
                        Valider UC (Tuteur)
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Daily Checklists */}
        <div className="lg:col-span-5 bg-white border border-slate-200/80 rounded-2xl p-5 space-y-4 shadow-2xs">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-violet-600" />
              Checklists Opérationnelles Horodatées (M5.4)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Ouverture 6h00 &amp; Fermeture 23h00 sur les 2 clubs
            </p>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {filteredChecklist.map((task) => {
              const completed = Boolean(task.checkedBy);
              return (
                <div
                  key={task.id}
                  onClick={() => toggleChecklistItem(task.id)}
                  className="py-3 flex items-start justify-between gap-3 cursor-pointer hover:bg-slate-50 px-2 rounded-lg"
                >
                  <div className="flex items-start gap-2.5">
                    <input
                      type="checkbox"
                      checked={completed}
                      onChange={() => {}}
                      className="mt-0.5"
                    />
                    <div>
                      <div
                        className={`font-semibold ${
                          completed ? 'line-through text-slate-400' : 'text-slate-900'
                        }`}
                      >
                        {task.label}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Club {task.clubId === 'carre-de-soie' ? 'C.Fitness Center' : 'C.Fitness Place'} ·{' '}
                        {task.shiftType}
                        {completed &&
                          ` · Validé par ${task.checkedBy} à ${task.checkedAt}`}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

