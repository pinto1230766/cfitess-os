import React, { useState } from 'react';
import { useCfos } from '../../context/CfosContext';
import {
  Calendar,
  FileText,
  GraduationCap,
  CheckSquare,
  ArrowLeft,
  CheckCircle2,
  Plus,
  FileSignature,
} from 'lucide-react';
import { formatLeaveStatus } from '../../domain/rules';
import { LeaveRequest } from '../../types/cfos';

export function EmployeeMobileShell() {
  const {
    currentUser,
    employees,
    shifts,
    leaveRequests,
    hrDocuments,
    trainingModules,
    moduleProgress,
    bpjepsMilestones,
    checklists,
    setShellMode,
    submitLeaveRequest,
    signHrDocument,
    completeAcademyQuiz,
    toggleChecklistItem,
  } = useCfos();

  const fieldEmployees = employees.filter((e) => e.role !== 'kiosque');

  // If Admin opens the Employee Mobile PWA preview, default to a field employee with shifts & BPJEPS (Lucas or Maxime)
  const [selectedEmpId, setSelectedEmpId] = useState<string>(() => {
    if (currentUser.role === 'admin') {
      return (
        fieldEmployees.find((e) => e.role === 'apprenti')?.id ||
        fieldEmployees.find((e) => e.role === 'commercial')?.id ||
        currentUser.id
      );
    }
    return currentUser.id;
  });

  const activeEmp =
    fieldEmployees.find((e) => e.id === selectedEmpId) || currentUser;

  const [tab, setTab] = useState<
    'PLANNING' | 'CONGES' | 'DOCS' | 'ACADEMIE' | 'CHECKLIST'
  >('PLANNING');
  const [leaveType, setLeaveType] = useState<LeaveRequest['type']>('CP');
  const [startDate, setStartDate] = useState('2025-06-15');
  const [endDate, setEndDate] = useState('2025-06-20');
  const [daysCount, setDaysCount] = useState(5);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const myShifts = shifts.filter((s) => s.employeeId === activeEmp.id);
  const myLeaves = leaveRequests.filter((l) => l.employeeId === activeEmp.id);
  const myDocs = hrDocuments.filter((d) => d.employeeId === activeEmp.id);
  const myChecklist = checklists.filter((c) => c.clubId === activeEmp.clubId);

  const handleLeaveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitLeaveRequest({
      employeeId: activeEmp.id,
      clubId: activeEmp.clubId,
      type: leaveType,
      startDate,
      endDate,
      daysCount,
    });
    setToastMsg('Demande de congés transmise au Manager !');
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-start sm:py-6">
      {/* Mobile Device Container */}
      <div className="w-full max-w-md min-h-screen sm:min-h-[820px] sm:rounded-3xl bg-white sm:border sm:border-slate-300 sm:shadow-xl flex flex-col justify-between overflow-hidden">
        {/* Compact Mobile Top Bar */}
        <header className="bg-slate-900 text-white px-4 py-3 flex items-center justify-between gap-2 shrink-0">
          <button
            onClick={() => setShellMode('admin')}
            className="min-h-[44px] px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-orange-400" />
            <span>Vue Direction</span>
          </button>

          <div className="text-right">
            <select
              aria-label="Choisir le collaborateur"
              value={activeEmp.id}
              onChange={(e) => setSelectedEmpId(e.target.value)}
              className="bg-slate-800 text-white text-xs font-bold px-2.5 py-2 rounded-lg border border-slate-700 min-h-[44px]"
            >
              {fieldEmployees.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.firstName} {e.lastName} (
                  {e.clubId === 'carre-de-soie' ? 'CDS' : 'BEY'})
                </option>
              ))}
            </select>
          </div>
        </header>

        {/* Scrollable Content Canvas */}
        <main className="flex-1 p-4 space-y-4 overflow-y-auto">
          {/* User Identity Strip */}
          <div className="p-3.5 rounded-xl bg-orange-50 border border-orange-200 flex items-center justify-between text-xs">
            <div>
              <div className="font-bold text-slate-900">
                {activeEmp.firstName} {activeEmp.lastName}
              </div>
              <div className="text-slate-600">
                {activeEmp.jobTitle} · {activeEmp.weeklyContractHours}h/sem · CP{' '}
                {activeEmp.cpBalance}j
              </div>
            </div>
            <div className="text-right font-mono">
              <div className="text-[11px] text-slate-500">Code PIN Kiosque</div>
              <div className="font-bold text-orange-700 text-sm">{activeEmp.pinCode}</div>
            </div>
          </div>

          {toastMsg && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-900 flex items-center justify-between">
              <span>{toastMsg}</span>
              <button onClick={() => setToastMsg(null)} className="underline">
                OK
              </button>
            </div>
          )}

          {/* TAB 1: PLANNING */}
          {tab === 'PLANNING' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h1 className="text-base font-bold text-slate-900">
                  Mon Planning de la Semaine
                </h1>
                <span className="text-xs font-semibold text-emerald-700">
                  Conforme IDCC 2511
                </span>
              </div>
              {myShifts.length === 0 ? (
                <div className="p-6 rounded-xl border border-dashed border-slate-300 text-center text-xs text-slate-500">
                  Aucun créneau planifié sur ce profil cette semaine.
                </div>
              ) : (
                myShifts.map((s) => (
                  <div
                    key={s.id}
                    className="p-4 rounded-xl border border-slate-200 bg-white flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-bold text-slate-900">{s.date}</div>
                      <div className="text-slate-600 mt-0.5">
                        {s.roleLabel} · Club{' '}
                        {s.clubId === 'carre-de-soie' ? 'Carré de Soie' : 'Beynost'}
                      </div>
                    </div>
                    <div className="text-right font-mono tabular-nums shrink-0">
                      <div className="font-bold text-sm text-orange-600 whitespace-nowrap">
                        {s.startTime} – {s.endTime}
                      </div>
                      <div className="text-[11px] text-slate-400 whitespace-nowrap">
                        Pause {s.breakMinutes} min
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 2: CONGES */}
          {tab === 'CONGES' && (
            <div className="space-y-4">
              <h1 className="text-base font-bold text-slate-900">
                Poser une Demande d&apos;Absence / Congés
              </h1>
              <form
                onSubmit={handleLeaveSubmit}
                className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 text-xs"
              >
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Type d&apos;absence
                  </label>
                  <select
                    value={leaveType}
                    onChange={(e) => setLeaveType(e.target.value as LeaveRequest['type'])}
                    className="w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-white min-h-[44px]"
                  >
                    <option value="CP">Congés Payés (CP)</option>
                    <option value="RTT">Récupération / RTT</option>
                    <option value="Formation CFA">Semaine École CFA / BPJEPS</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Début</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full px-2.5 py-2 rounded-lg border border-slate-200 bg-white min-h-[44px]"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Fin</label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full px-2.5 py-2 rounded-lg border border-slate-200 bg-white min-h-[44px]"
                    />
                  </div>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Nombre de jours ouvrés
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={30}
                    value={daysCount}
                    onChange={(e) => setDaysCount(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white min-h-[44px]"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full min-h-[46px] rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  Envoyer ma demande
                </button>
              </form>

              <div className="space-y-2">
                <h2 className="text-xs font-bold uppercase text-slate-500">
                  Historique de mes demandes ({myLeaves.length})
                </h2>
                {myLeaves.map((lv) => (
                  <div
                    key={lv.id}
                    className="p-3.5 rounded-xl border border-slate-200 bg-white flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-bold text-slate-900">
                        {lv.type} · {lv.startDate} → {lv.endDate}
                      </div>
                      <div className="text-slate-500">{lv.daysCount} jour(s)</div>
                    </div>
                    <span className="font-bold text-orange-600">
                      {formatLeaveStatus(lv.status)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: COFFRE RH */}
          {tab === 'DOCS' && (
            <div className="space-y-3">
              <h1 className="text-base font-bold text-slate-900">
                Mon Coffre-Fort RH &amp; Signatures
              </h1>
              {myDocs.length === 0 ? (
                <div className="p-6 rounded-xl border border-dashed border-slate-300 text-center text-xs text-slate-500">
                  Aucun document en attente pour ce profil.
                </div>
              ) : (
                myDocs.map((doc) => {
                  const isSigned = doc.signedStatus !== 'En attente signature';
                  return (
                    <div
                      key={doc.id}
                      className="p-4 rounded-xl border border-slate-200 bg-white space-y-3 text-xs"
                    >
                      <div>
                        <div className="font-bold text-slate-900">{doc.title}</div>
                        <div className="text-slate-500 mt-0.5">
                          Catégorie : {doc.category} · Émis le {doc.uploadedAt}
                        </div>
                      </div>
                      {isSigned ? (
                        <div className="text-emerald-700 font-bold flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4" />
                          {doc.signedStatus}
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            signHrDocument(doc.id);
                            setToastMsg('Document signé électroniquement avec horodatage !');
                          }}
                          className="w-full min-h-[44px] rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <FileSignature className="w-4 h-4" />
                          Signer avec code OTP Mobile
                        </button>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* TAB 4: ACADEMIE & BPJEPS */}
          {tab === 'ACADEMIE' && (
            <div className="space-y-4">
              <h1 className="text-base font-bold text-slate-900">
                Académie C.Fitness &amp; Livret BPJEPS
              </h1>
              <div className="space-y-2.5">
                {trainingModules.map((mod) => {
                  const done = moduleProgress.some(
                    (mp) =>
                      mp.moduleId === mod.id &&
                      mp.employeeId === activeEmp.id &&
                      mp.completed
                  );
                  return (
                    <div
                      key={mod.id}
                      className="p-3.5 rounded-xl border border-slate-200 bg-white flex items-center justify-between gap-3 text-xs"
                    >
                      <div>
                        <div className="font-mono font-bold text-orange-600">
                          {mod.code} · {mod.durationMin} min
                        </div>
                        <div className="font-bold text-slate-900">{mod.title}</div>
                      </div>
                      {done ? (
                        <span className="text-emerald-700 font-bold flex items-center gap-1 shrink-0">
                          <CheckCircle2 className="w-4 h-4" />
                          Validé
                        </span>
                      ) : (
                        <button
                          onClick={() => {
                            completeAcademyQuiz(
                              activeEmp.id,
                              mod.id,
                              mod.quizCorrectIndex
                            );
                            setToastMsg(`Module ${mod.code} validé !`);
                          }}
                          className="min-h-[44px] px-3 rounded-lg bg-slate-900 text-white font-semibold shrink-0 cursor-pointer"
                        >
                          Valider Quiz
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="pt-2 space-y-2">
                <h2 className="text-xs font-bold uppercase text-slate-500">
                  Compétences BPJEPS (UC1 à UC4)
                </h2>
                {bpjepsMilestones.map((uc) => (
                  <div
                    key={uc.id}
                    className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs flex items-center justify-between"
                  >
                    <div>
                      <div className="font-bold text-slate-900">
                        {uc.ucCode} — {uc.title}
                      </div>
                      <div className="text-slate-500">{uc.monthlyReviewNote}</div>
                    </div>
                    <span className="font-bold text-emerald-700">
                      {uc.tutorValidated ? 'Validé' : 'En cours'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: CHECKLISTS */}
          {tab === 'CHECKLIST' && (
            <div className="space-y-3">
              <h1 className="text-base font-bold text-slate-900">
                Checklist Terrain Club{' '}
                {activeEmp.clubId === 'carre-de-soie' ? 'Carré de Soie' : 'Beynost'}
              </h1>
              {myChecklist.map((c) => {
                const completed = Boolean(c.checkedBy);
                return (
                  <button
                    key={c.id}
                    onClick={() => toggleChecklistItem(c.id)}
                    className="w-full min-h-[52px] p-3.5 rounded-xl border border-slate-200 bg-white flex items-center justify-between gap-3 text-left text-xs cursor-pointer"
                  >
                    <div>
                      <div
                        className={`font-bold ${
                          completed ? 'line-through text-slate-400' : 'text-slate-900'
                        }`}
                      >
                        {c.label}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {c.shiftType} {completed && `· Validé à ${c.checkedAt}`}
                      </div>
                    </div>
                    <CheckCircle2
                      className={`w-5 h-5 shrink-0 ${
                        completed ? 'text-emerald-600' : 'text-slate-300'
                      }`}
                    />
                  </button>
                );
              })}
            </div>
          )}
        </main>

        {/* Bottom Thumb-Zone Navigation Bar (5 tabs, ≥48px touch targets) */}
        <nav className="bg-white border-t border-slate-200 grid grid-cols-5 px-1 py-1.5 shrink-0">
          {[
            { id: 'PLANNING', label: 'Planning', icon: Calendar },
            { id: 'CONGES', label: 'Congés', icon: Plus },
            { id: 'DOCS', label: 'Coffre RH', icon: FileText },
            { id: 'ACADEMIE', label: 'Académie', icon: GraduationCap },
            { id: 'CHECKLIST', label: 'Checklist', icon: CheckSquare },
          ].map((item) => {
            const Icon = item.icon;
            const active = tab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setTab(item.id as typeof tab)}
                className={`min-h-[48px] flex flex-col items-center justify-center rounded-xl text-[11px] font-semibold cursor-pointer ${
                  active ? 'text-orange-600 bg-orange-50/60' : 'text-slate-500'
                }`}
              >
                <Icon className="w-4 h-4 mb-0.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
