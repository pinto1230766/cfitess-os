import React, { useState } from 'react';
import {
  Calendar,
  CheckCircle2,
  Clock,
  Dumbbell,
  ExternalLink,
  FileCheck2,
  FileSignature,
  FileText,
  Filter,
  Flame,
  HardDriveDownload,
  Lock,
  Plus,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  UserCheck,
  Wifi,
  WifiOff,
} from 'lucide-react';
import { useCfos } from '../../context/CfosContext';
import {
  buildUnifiedPlanningEvents,
  computeNetShiftHours,
  formatClubName,
} from '../../domain/rules';
import type { CollaboratorTask, Employee, HRDocument } from '../../types/cfos';
import { MywellnessQuickConnect } from '../MywellnessQuickConnect';

interface EmployeeDashboardGridProps {
  activeEmp: Employee;
  onNavigateTab: (tab: 'DASHBOARD' | 'PLANNING' | 'CONGES' | 'DOCS' | 'ACADEMIE' | 'CHECKLIST') => void;
  onOpenSignatureDrawer?: (doc: HRDocument) => void;
}

export function EmployeeDashboardGrid({
  activeEmp,
  onNavigateTab,
}: EmployeeDashboardGridProps) {
  const {
    shifts,
    unifiedExternalEvents,
    collaboratorTasks,
    collaboratorNotifications,
    hrDocuments,
    serverPowerStatus,
    lastBackupChecksum,
    toggleCollaboratorTask,
    addCollaboratorTask,
    markNotificationRead,
    signDocumentWithInternalProof,
    punchWithPin,
    openMywellnessLink,
    exportDeviceBackupJson,
  } = useCfos();

  // Internal states
  const [taskFilter, setTaskFilter] = useState<'ALL' | 'TODO' | 'DONE'>('ALL');
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskCategory, setNewTaskCategory] =
    useState<CollaboratorTask['category']>('Accueil & TPV');
  const [punchFeedback, setPunchFeedback] = useState<string | null>(null);
  const [quickToast, setQuickToast] = useState<string | null>(null);

  // E-Signature Quick Ceremony State
  const [signingDoc, setSigningDoc] = useState<HRDocument | null>(null);
  const [otpCode, setOtpCode] = useState(activeEmp.pinCode.padEnd(6, '42'));
  const [consentApproved, setConsentApproved] = useState(true);
  const [consentPhrase, setConsentPhrase] = useState('Lu et approuvé, bon pour accord');
  const [signingResult, setSigningResult] = useState<{ ok: boolean; msg: string } | null>(null);

  // Aggregated data for this employee
  const allEvents = buildUnifiedPlanningEvents(shifts, unifiedExternalEvents);
  const myEvents = allEvents.filter((ev) => ev.employeeId === activeEmp.id);
  const myShifts = shifts.filter((s) => s.employeeId === activeEmp.id);
  const myTasks = collaboratorTasks.filter((t) => t.employeeId === activeEmp.id);
  const myNotifications = collaboratorNotifications.filter((n) => n.employeeId === activeEmp.id);
  const myDocuments = hrDocuments.filter((d) => d.employeeId === activeEmp.id);

  // Shift & Hours calculations
  const totalWeeklyHours = myShifts.reduce(
    (acc, s) => acc + computeNetShiftHours(s.startTime, s.endTime, s.breakMinutes),
    0
  );

  // Today's shift (defaulting to the first shift of this employee or current day)
  const todayShift = myShifts[0];
  const pendingDocs = myDocuments.filter((d) => d.signedStatus === 'En attente signature');
  const unreadNotifs = myNotifications.filter((n) => !n.read);

  // Task filtering
  const filteredTasks = myTasks.filter((t) => {
    if (taskFilter === 'TODO') return !t.completed;
    if (taskFilter === 'DONE') return t.completed;
    return true;
  });

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    addCollaboratorTask({
      employeeId: activeEmp.id,
      clubId: activeEmp.clubId,
      date: '2026-10-26',
      dueTime: '17:00',
      title: newTaskTitle.trim(),
      category: newTaskCategory,
      priority: 'Normale',
    });
    setNewTaskTitle('');
    setQuickToast('Nouvelle tâche ajoutée à votre feuille de route !');
    setTimeout(() => setQuickToast(null), 3500);
  };

  const handleQuickPunch = (type: 'arrivee' | 'depart' | 'debut_pause' | 'fin_pause') => {
    const res = punchWithPin(activeEmp.clubId, activeEmp.id, activeEmp.pinCode, type);
    setPunchFeedback(res.message);
    setTimeout(() => setPunchFeedback(null), 4500);
  };

  const handleQuickSign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!signingDoc) return;
    const res = signDocumentWithInternalProof({
      docId: signingDoc.id,
      otpInput: otpCode,
      consentChecked: consentApproved,
      consentPhrase,
    });
    setSigningResult({ ok: res.ok, msg: res.message });
    if (res.ok) {
      setQuickToast('Document signé avec preuve juridique scellée (0 €) !');
      setTimeout(() => {
        setSigningDoc(null);
        setSigningResult(null);
      }, 2000);
    }
  };

  const handleDownloadProof = (doc: HRDocument) => {
    if (!doc.signatureProof) return;
    const blob = new Blob([JSON.stringify(doc.signatureProof, null, 2)], {
      type: 'application/json;charset=utf-8;',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `preuve-cfitness-${doc.id}-${doc.signatureProof.proofId}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4 text-slate-900">
      {/* Toast Feedback */}
      {(quickToast || punchFeedback) && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-950 flex items-center justify-between shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{quickToast || punchFeedback}</span>
          </div>
          <button
            onClick={() => {
              setQuickToast(null);
              setPunchFeedback(null);
            }}
            className="text-[11px] underline cursor-pointer"
          >
            Fermer
          </button>
        </div>
      )}

      {/* SKELLO-STYLE HERO BANNER: Today's Shift & Profile Snapshot */}
      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-700/80">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Identity & Shift Status */}
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-orange-600 text-white font-extrabold text-base flex items-center justify-center shrink-0 shadow-xs">
              {activeEmp.firstName[0]}
              {activeEmp.lastName[0]}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-300">
                <span className="font-semibold text-orange-400">TABLEAU DE BORD SKELLO</span>
                <span aria-hidden="true">·</span>
                <span>Semaine 43</span>
                <span aria-hidden="true">·</span>
                <span>{formatClubName(activeEmp.clubId, false)}</span>
              </div>
              <h1 className="text-base sm:text-lg font-extrabold tracking-tight text-white mt-0.5">
                Bonjour, {activeEmp.firstName} {activeEmp.lastName}
              </h1>
              <div className="text-xs text-slate-300 mt-1 flex flex-wrap items-center gap-1.5">
                <span>{activeEmp.jobTitle}</span>
                <span aria-hidden="true">·</span>
                <span>{activeEmp.contractType} ({activeEmp.weeklyContractHours}h/sem)</span>
                <span aria-hidden="true">·</span>
                <span className="text-emerald-400 font-medium">CCN Sport IDCC 2511</span>
              </div>
            </div>
          </div>

          {/* Today's Shift Card inside Header */}
          <div className="bg-white/10 backdrop-blur-xs rounded-xl p-3 border border-white/15 flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="space-y-0.5">
              <div className="text-[10px] uppercase font-bold tracking-wider text-orange-300">
                Mon Shift du Jour
              </div>
              {todayShift ? (
                <div>
                  <div className="text-sm font-black text-white tabular-nums">
                    {todayShift.startTime} – {todayShift.endTime}
                  </div>
                  <div className="text-[11px] text-slate-200">
                    {todayShift.roleLabel} · Pause {todayShift.breakMinutes} min
                  </div>
                </div>
              ) : (
                <div className="text-xs font-bold text-slate-200">
                  Jour de repos / Aucun shift planifié aujourd&apos;hui
                </div>
              )}
            </div>

            {/* Quick Badgeuse Buttons */}
            <div className="flex items-center gap-1.5 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 sm:border-l border-white/15 sm:pl-3">
              <button
                type="button"
                onClick={() => handleQuickPunch('arrivee')}
                className="min-h-[44px] px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors whitespace-nowrap"
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Pointer Arrivée</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickPunch('depart')}
                className="min-h-[44px] px-3 py-1.5 rounded-lg bg-white/15 hover:bg-white/25 text-white font-bold text-xs flex items-center gap-1 cursor-pointer transition-colors whitespace-nowrap"
              >
                <span>Départ</span>
              </button>
            </div>
          </div>
        </div>

        {/* 4-KPI Strip Skello Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 mt-4 pt-3.5 border-t border-white/10 text-xs">
          <div className="bg-white/5 rounded-lg p-2.5">
            <div className="text-[10px] text-slate-300 uppercase">Heures Hebdo Skello</div>
            <div className="font-mono font-bold text-sm text-white mt-0.5 tabular-nums">
              {totalWeeklyHours.toFixed(1)} h / {activeEmp.weeklyContractHours} h
            </div>
            <div className="text-[10px] text-emerald-400 mt-0.5">Quota conforme</div>
          </div>
          <div className="bg-white/5 rounded-lg p-2.5">
            <div className="text-[10px] text-slate-300 uppercase">Créneaux Synchronisés</div>
            <div className="font-mono font-bold text-sm text-orange-300 mt-0.5 tabular-nums">
              {myEvents.length} créneau(x)
            </div>
            <div className="text-[10px] text-slate-300 mt-0.5">RH · Mywellness · Heitz</div>
          </div>
          <div className="bg-white/5 rounded-lg p-2.5">
            <div className="text-[10px] text-slate-300 uppercase">Missions du Jour</div>
            <div className="font-mono font-bold text-sm text-amber-300 mt-0.5 tabular-nums">
              {myTasks.filter((t) => !t.completed).length} à faire / {myTasks.length}
            </div>
            <div className="text-[10px] text-slate-300 mt-0.5">
              {myTasks.filter((t) => t.completed).length} validée(s)
            </div>
          </div>
          <div className="bg-white/5 rounded-lg p-2.5">
            <div className="text-[10px] text-slate-300 uppercase">Soldes Congés Payés</div>
            <div className="font-mono font-bold text-sm text-sky-300 mt-0.5 tabular-nums">
              CP {activeEmp.cpBalance} j · RTT {activeEmp.rttBalance} j
            </div>
            <div className="text-[10px] text-slate-300 mt-0.5">Acquis à ce jour</div>
          </div>
        </div>
      </section>

      {/* SKELLO-STYLE RESPONSIVE WIDGET GRID (1 col mobile, 2 cols tablet, 3 cols desktop) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* WIDGET 1: Mon Planning & Agenda Unifié (Shifts + Mywellness + Heitz) */}
        <section className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs space-y-3 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-700 flex items-center justify-center shrink-0">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-xs sm:text-sm font-bold text-slate-900">
                    Mon Planning &amp; Agenda
                  </h2>
                  <div className="text-[11px] text-slate-500">
                    Horaires RH + Cours Technogym + RDV Heitz
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onNavigateTab('PLANNING')}
                className="text-[11px] font-semibold text-orange-600 hover:text-orange-700 underline cursor-pointer whitespace-nowrap"
              >
                Voir tout →
              </button>
            </div>

            {/* List of Unified Events */}
            <div className="space-y-2 max-h-72 overflow-y-auto pr-0.5">
              {myEvents.length === 0 ? (
                <div className="p-4 rounded-xl border border-dashed border-slate-200 text-center text-xs text-slate-400">
                  Aucun créneau ou cours prévu pour ce collaborateur cette semaine.
                </div>
              ) : (
                myEvents.map((ev) => {
                  const isRh = ev.originSystem === 'cfitness_rh';
                  const isMywellness = ev.originSystem === 'mywellness_api';
                  const isHeitz = ev.originSystem === 'heitz_api';

                  return (
                    <div
                      key={ev.id}
                      className="p-3 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-slate-50 transition-colors text-xs space-y-1.5"
                    >
                      <div className="flex items-center justify-between gap-1.5">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            isRh
                              ? 'bg-indigo-100 text-indigo-900'
                              : isMywellness
                              ? 'bg-amber-100 text-amber-950'
                              : isHeitz
                              ? 'bg-sky-100 text-sky-950'
                              : 'bg-emerald-100 text-emerald-950'
                          }`}
                        >
                          {isRh
                            ? 'HORAIRE RH SKELLO'
                            : isMywellness
                            ? 'COURS MYWELLNESS'
                            : isHeitz
                            ? 'RDV HEITZ'
                            : 'ÉVÉNEMENT INTERNE'}
                        </span>
                        <span className="font-mono font-bold text-slate-800 tabular-nums">
                          {ev.startTime} – {ev.endTime}
                        </span>
                      </div>

                      <div className="font-bold text-slate-900">{ev.title}</div>
                      <div className="text-[11px] text-slate-500 flex items-center justify-between">
                        <span>{ev.subtitle}</span>
                        <span className="font-mono text-[10px] text-slate-400">
                          {formatClubName(ev.clubId, true)}
                        </span>
                      </div>

                      {/* Deep-link to Mywellness for context */}
                      {ev.participantName && (
                        <div className="pt-1 flex items-center justify-between gap-2 border-t border-slate-200">
                          <span className="text-[11px] text-slate-700">
                            Adhérent : <strong>{ev.participantName}</strong>
                          </span>
                          {ev.mywellnessMemberId && (
                            <button
                              type="button"
                              onClick={() =>
                                openMywellnessLink({
                                  mywellnessMemberId: ev.mywellnessMemberId,
                                  personName: ev.participantName,
                                  clubId: ev.clubId,
                                })
                              }
                              className="px-2 py-1 rounded bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-[10px] flex items-center gap-1 cursor-pointer"
                            >
                              <ExternalLink className="w-3 h-3" />
                              Fiche Mywellness
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => onNavigateTab('PLANNING')}
              className="w-full min-h-[44px] py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
            >
              <Calendar className="w-4 h-4 text-orange-400" />
              <span>Consulter le Planning Complet Hebdomadaire</span>
            </button>
          </div>
        </section>

        {/* WIDGET 2: Mes Tâches & Missions du Jour (Skello Shift Checklists) */}
        <section className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs space-y-3 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-xs sm:text-sm font-bold text-slate-900">
                    Mes Tâches &amp; Missions
                  </h2>
                  <div className="text-[11px] text-slate-500">
                    {myTasks.filter((t) => !t.completed).length} restante(s) sur {myTasks.length}
                  </div>
                </div>
              </div>

              {/* Filter Tabs (Skello style) */}
              <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg">
                {(['ALL', 'TODO', 'DONE'] as const).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setTaskFilter(mode)}
                    className={`px-2 py-1 rounded text-[10px] font-bold cursor-pointer transition-colors ${
                      taskFilter === mode
                        ? 'bg-white text-slate-900 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {mode === 'ALL' ? 'Toutes' : mode === 'TODO' ? 'À faire' : 'Faites'}
                  </button>
                ))}
              </div>
            </div>

            {/* Tasks List */}
            <div className="space-y-2 max-h-64 overflow-y-auto pr-0.5">
              {filteredTasks.length === 0 ? (
                <div className="p-4 rounded-xl border border-dashed border-slate-200 text-center text-xs text-slate-400">
                  Aucune tâche dans cette catégorie.
                </div>
              ) : (
                filteredTasks.map((task) => (
                  <div
                    key={task.id}
                    onClick={() => toggleCollaboratorTask(task.id)}
                    className={`p-3 rounded-xl border text-xs flex items-start gap-2.5 cursor-pointer transition-colors ${
                      task.completed
                        ? 'bg-slate-50 border-slate-200 text-slate-400 line-through'
                        : 'bg-white border-slate-200 hover:border-orange-300 text-slate-900'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => {}}
                      className="mt-0.5 rounded text-orange-600 focus:ring-orange-500 cursor-pointer"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold leading-snug">{task.title}</div>
                      <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-500">
                        <span className="font-mono font-bold text-slate-700">{task.dueTime}</span>
                        <span aria-hidden="true">·</span>
                        <span>{task.category}</span>
                        {task.priority === 'Haute' && !task.completed && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="font-bold text-rose-600">Urgent</span>
                          </>
                        )}
                        {task.completed && task.completedAt && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="text-emerald-600">Validé à {task.completedAt}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick Add Task Form */}
          <form onSubmit={handleAddTask} className="pt-2 border-t border-slate-100 space-y-2 text-xs">
            <div className="flex gap-1.5">
              <input
                type="text"
                placeholder="Nouvelle mission..."
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-xs min-h-[40px] focus:outline-none focus:border-orange-500"
              />
              <button
                type="submit"
                className="min-h-[40px] px-3.5 py-1.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs flex items-center gap-1 cursor-pointer transition-colors whitespace-nowrap"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Ajouter</span>
              </button>
            </div>
            <select
              value={newTaskCategory}
              onChange={(e) =>
                setNewTaskCategory(e.target.value as CollaboratorTask['category'])
              }
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-[11px] text-slate-700"
            >
              <option value="Accueil & TPV">Catégorie : Accueil &amp; TPV</option>
              <option value="Relance CRM (ex-LEADS)">Catégorie : Relance CRM / Suivi prospects</option>
              <option value="Suivi Mywellness">Catégorie : Suivi Mywellness / Technogym Checkup</option>
              <option value="RH & Administratif">Catégorie : RH &amp; Administratif</option>
            </select>
          </form>
        </section>

        {/* WIDGET 3: Notifications & Alertes Skello */}
        <section className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs space-y-3 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                  <Flame className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-xs sm:text-sm font-bold text-slate-900">
                    Notifications &amp; Alertes
                  </h2>
                  <div className="text-[11px] text-slate-500">
                    {unreadNotifs.length} nouvelle(s) alerte(s)
                  </div>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-800 text-[10px] font-bold">
                Temps Réel
              </span>
            </div>

            {/* Notifications Feed */}
            <div className="space-y-2 max-h-64 overflow-y-auto pr-0.5">
              {myNotifications.length === 0 ? (
                <div className="p-4 rounded-xl border border-dashed border-slate-200 text-center text-xs text-slate-400">
                  Aucune notification pour l&apos;instant.
                </div>
              ) : (
                myNotifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`p-3 rounded-xl border text-xs space-y-1.5 transition-colors ${
                      notif.read
                        ? 'bg-slate-50 border-slate-200 text-slate-600'
                        : 'bg-amber-50/70 border-amber-300 text-slate-900 shadow-2xs'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-slate-900">{notif.title}</span>
                      <span className="font-mono text-[10px] text-slate-400 shrink-0">
                        {notif.createdAt}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      {notif.message}
                    </p>
                    <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                      {!notif.read ? (
                        <button
                          type="button"
                          onClick={() => markNotificationRead(notif.id)}
                          className="text-[10px] font-semibold text-slate-500 hover:text-slate-800 underline cursor-pointer"
                        >
                          Marquer comme lu
                        </button>
                      ) : (
                        <span className="text-[10px] text-emerald-600 font-medium">✓ Lu</span>
                      )}

                      {/* Smart Context Action */}
                      {notif.type === 'signature_requise' && pendingDocs[0] && (
                        <button
                          type="button"
                          onClick={() => setSigningDoc(pendingDocs[0])}
                          className="px-2.5 py-1 rounded-lg bg-orange-600 hover:bg-orange-500 text-white font-bold text-[10px] flex items-center gap-1 cursor-pointer"
                        >
                          <FileSignature className="w-3 h-3" />
                          Signer maintenant
                        </button>
                      )}
                      {notif.type === 'rh_planning' && (
                        <button
                          type="button"
                          onClick={() => onNavigateTab('PLANNING')}
                          className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-[10px] cursor-pointer"
                        >
                          Voir shift
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => {
                myNotifications.forEach((n) => markNotificationRead(n.id));
                setQuickToast('Toutes les notifications ont été marquées comme lues.');
              }}
              className="w-full min-h-[44px] py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs flex items-center justify-center gap-1 cursor-pointer transition-colors"
            >
              <span>Tout marquer comme lu</span>
            </button>
          </div>
        </section>

        {/* WIDGET 4: Badgeuse Virtuelle & Pointage Rapide (Skello Timeclock) */}
        <section className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs space-y-3 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-xs sm:text-sm font-bold text-slate-900">
                    Badgeuse &amp; Pointage Virtuel
                  </h2>
                  <div className="text-[11px] text-slate-500">
                    Pointage smartphone conforme IDCC 2511
                  </div>
                </div>
              </div>
              <div className="text-right font-mono">
                <span className="text-[10px] text-slate-400">Code PIN</span>
                <div className="font-bold text-orange-600 text-xs">{activeEmp.pinCode}</div>
              </div>
            </div>

            <p className="text-xs text-slate-600">
              Enregistrez vos heures de présence directement depuis votre smartphone. Les pointages sont synchronisés avec la tablette kiosque et préparés pour le futur export des variables de paie Silae.
            </p>

            {/* 4 Interactive Punch Actions */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleQuickPunch('arrivee')}
                className="min-h-[44px] p-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-900 font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
              >
                <Clock className="w-3.5 h-3.5 text-emerald-600" />
                <span>Arrivée</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickPunch('depart')}
                className="min-h-[44px] p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-900 font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
              >
                <Clock className="w-3.5 h-3.5 text-slate-700" />
                <span>Départ</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickPunch('debut_pause')}
                className="min-h-[44px] p-2 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 font-semibold text-[11px] flex items-center justify-center gap-1 cursor-pointer transition-colors"
              >
                <span>Début Pause</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickPunch('fin_pause')}
                className="min-h-[44px] p-2 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 font-semibold text-[11px] flex items-center justify-center gap-1 cursor-pointer transition-colors"
              >
                <span>Fin Pause</span>
              </button>
            </div>
          </div>

          {/* Backup replica link */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Copie de secours hors-ligne</span>
            <button
              type="button"
              onClick={() => {
                exportDeviceBackupJson('replica-tel-mario');
                setQuickToast('Sauvegarde locale (.json) téléchargée avec succès.');
              }}
              className="font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1 cursor-pointer"
            >
              <HardDriveDownload className="w-3.5 h-3.5" />
              <span>Sauvegarder</span>
            </button>
          </div>
        </section>

        {/* WIDGET 5: Mon Coffre RH & Signatures Électroniques (0 €) */}
        <section className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs space-y-3 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                  <FileSignature className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-xs sm:text-sm font-bold text-slate-900">
                    Coffre RH &amp; Signatures
                  </h2>
                  <div className="text-[11px] text-slate-500">
                    {pendingDocs.length > 0
                      ? `${pendingDocs.length} document(s) à signer`
                      : 'Tous les contrats sont scellés'}
                  </div>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 text-[10px] font-bold">
                0 € / SIGNATURE
              </span>
            </div>

            {/* List of pending or signed documents */}
            <div className="space-y-2 max-h-64 overflow-y-auto pr-0.5">
              {myDocuments.length === 0 ? (
                <div className="p-4 rounded-xl border border-dashed border-slate-200 text-center text-xs text-slate-400">
                  Aucun document RH dans votre coffre.
                </div>
              ) : (
                myDocuments.map((doc) => {
                  const isPending = doc.signedStatus === 'En attente signature';
                  return (
                    <div
                      key={doc.id}
                      className={`p-3 rounded-xl border text-xs space-y-2 ${
                        isPending
                          ? 'bg-amber-50/70 border-amber-300'
                          : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1.5">
                        <span className="font-bold text-slate-900">{doc.title}</span>
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold shrink-0 ${
                            isPending
                              ? 'bg-amber-200 text-amber-900'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {doc.signedStatus}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {doc.category} · Déposé le {doc.uploadedAt}
                      </div>

                      {/* Download proof if signed */}
                      {doc.signatureProof && (
                        <div className="flex items-center justify-between pt-1">
                          <span className="text-[10px] font-mono text-emerald-700">
                            Preuve {doc.signatureProof.proofId} (SHA-256)
                          </span>
                          <button
                            type="button"
                            onClick={() => handleDownloadProof(doc)}
                            className="text-[10px] font-bold text-slate-700 underline cursor-pointer"
                          >
                            Certificat (.json)
                          </button>
                        </div>
                      )}

                      {/* Trigger ceremony if pending */}
                      {isPending && (
                        <button
                          type="button"
                          onClick={() => setSigningDoc(doc)}
                          className="w-full min-h-[44px] py-1.5 px-3 rounded-lg bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
                        >
                          <FileSignature className="w-3.5 h-3.5" />
                          <span>Signer depuis mon espace (OTP + Preuve)</span>
                        </button>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => onNavigateTab('DOCS')}
              className="w-full min-h-[44px] py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs flex items-center justify-center gap-1 cursor-pointer transition-colors"
            >
              <span>Ouvrir mon Coffre RH complet</span>
            </button>
          </div>
        </section>

        {/* WIDGET 6: Technogym Checkup & Mywellness Quick Connect */}
        <MywellnessQuickConnect
          variant="compact"
          defaultClubId={activeEmp.clubId}
        />
      </div>

      {/* MODAL / CEREMONY: Electronic Signature Drawer */}
      {signingDoc && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleQuickSign}
            className="w-full max-w-lg bg-slate-900 text-white rounded-2xl border-2 border-orange-500 p-5 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b border-slate-700 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-orange-400" />
                <h3 className="font-bold text-sm text-white">
                  Signature Électronique Interne (0 €)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSigningDoc(null)}
                className="text-xs text-slate-400 hover:text-white underline cursor-pointer"
              >
                Annuler
              </button>
            </div>

            <div className="space-y-1">
              <div className="text-sm font-extrabold text-orange-300">{signingDoc.title}</div>
              <div className="text-xs text-slate-400">
                Catégorie : {signingDoc.category} · Déposé le {signingDoc.uploadedAt}
              </div>
            </div>

            {signingDoc.contractBodyText && (
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-300 max-h-36 overflow-y-auto whitespace-pre-wrap">
                {signingDoc.contractBodyText}
              </div>
            )}

            <div>
              <label className="block text-[11px] uppercase tracking-wider text-slate-300 mb-1">
                1. Code de confirmation OTP (reçu par SMS au {activeEmp.phone})
              </label>
              <input
                type="text"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 font-mono text-base font-bold text-emerald-400 tracking-widest text-center"
              />
            </div>

            <div>
              <label className="block text-[11px] uppercase tracking-wider text-slate-300 mb-1">
                2. Mention de consentement
              </label>
              <input
                type="text"
                value={consentPhrase}
                onChange={(e) => setConsentPhrase(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
              />
            </div>

            <label className="flex items-start gap-2.5 text-xs text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={consentApproved}
                onChange={(e) => setConsentApproved(e.target.checked)}
                className="mt-0.5 rounded text-orange-600 focus:ring-orange-500 cursor-pointer"
              />
              <span>
                Je confirme avoir pris connaissance de l&apos;intégralité du document et accepte sa valeur légale (Art. 1366 &amp; 1367 Code civil).
              </span>
            </label>

            {signingResult && (
              <div
                className={`p-2.5 rounded-xl text-xs font-semibold ${
                  signingResult.ok
                    ? 'bg-emerald-500/20 border border-emerald-500 text-emerald-200'
                    : 'bg-rose-500/20 border border-rose-500 text-rose-200'
                }`}
              >
                {signingResult.msg}
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-700">
              <button
                type="button"
                onClick={() => setSigningDoc(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold cursor-pointer"
              >
                Fermer
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <FileCheck2 className="w-4 h-4" />
                <span>Sceller avec Preuve SHA-256</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
