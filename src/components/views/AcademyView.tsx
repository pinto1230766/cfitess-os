import React, { useState } from 'react';
import { useCfos } from '../../context/CfosContext';
import {
  GraduationCap,
  CheckSquare,
  BookOpen,
  CheckCircle2,
  Award,
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
  } = useCfos();

  const [activeModuleId, setActiveModuleId] = useState<string>(trainingModules[0]?.id || 'mod-1');
  const [selectedOption, setSelectedOption] = useState<number>(0);
  const [quizMessage, setQuizMessage] = useState<{
    passed: boolean;
    text: string;
  } | null>(null);

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
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-5">
        <div className="text-xs font-semibold uppercase tracking-wider text-orange-600">
          Module M5 · Remplacement Intégral SharePoint (Décision D6)
        </div>
        <h1 className="text-lg sm:text-xl font-bold text-slate-900 mt-1">
          Académie Interne C.Fitness, Suivi Apprentis BPJEPS &amp; Checklists Terrain
        </h1>
        <p className="text-xs text-slate-600 mt-1">
          5 modules officiels conçus par Mario &amp; Daniel Carvalho · Livret numérique BPJEPS / CFA avec validation tuteur · Checklists ouverture/fermeture horodatées
        </p>
      </div>

      {quizMessage && (
        <div
          className={`p-4 rounded-xl border text-xs font-medium flex items-center justify-between ${
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
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-5 space-y-3">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-orange-600" />
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
                      ? 'border-orange-500 bg-orange-50/40'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span className="font-mono font-bold text-orange-600">{mod.code}</span>
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
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-5 space-y-5">
          {selectedModule && (
            <>
              <div className="border-b border-slate-100 pb-4">
                <div className="text-xs font-mono font-bold text-orange-600">
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
                            ? 'border-orange-500 bg-white font-semibold text-slate-900'
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
                  className="px-4 py-2.5 rounded-lg bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold flex items-center gap-2 cursor-pointer"
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
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-5 space-y-4">
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
                      <span className="font-mono text-orange-600">{uc.ucCode}</span> — {uc.title}
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
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-5 space-y-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-orange-600" />
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
                        Club {task.clubId === 'carre-de-soie' ? 'Carré de Soie' : 'Beynost'} ·{' '}
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
