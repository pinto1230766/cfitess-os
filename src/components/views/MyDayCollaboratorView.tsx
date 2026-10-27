import React, { useState } from 'react';
import {
  Bell,
  Calendar,
  Clock,
  ExternalLink,
  FileSignature,
  Plus,
  UserCheck,
  CheckCircle2,
} from 'lucide-react';
import { useCfos } from '../../context/CfosContext';
import {
  buildUnifiedPlanningEvents,
  computeNetShiftHours,
  formatClubName,
} from '../../domain/rules';
import type { CollaboratorTask } from '../../types/cfos';
import { MywellnessQuickConnect } from '../MywellnessQuickConnect';

export function MyDayCollaboratorView() {
  const {
    currentUser,
    employees,
    shifts,
    unifiedExternalEvents,
    collaboratorTasks,
    collaboratorNotifications,
    hrDocuments,
    toggleCollaboratorTask,
    addCollaboratorTask,
    markNotificationRead,
    openMywellnessLink,
    setActiveSection,
  } = useCfos();

  const staffList = employees.filter((e) => e.role !== 'kiosque');
  const [selectedEmpId, setSelectedEmpId] = useState<string>(
    currentUser.role === 'admin' ? 'emp-maxime' : currentUser.id
  );

  const activeEmployee =
    staffList.find((e) => e.id === selectedEmpId) || staffList[0] || currentUser;

  // Quick Task add state
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskCategory, setNewTaskCategory] =
    useState<CollaboratorTask['category']>('Accueil & TPV');

  // Unified events for this collaborator (RH + Mywellness + Heitz + Internal, deduplicated)
  const allUnifiedEvents = buildUnifiedPlanningEvents(
    shifts,
    unifiedExternalEvents
  );
  const myEvents = allUnifiedEvents.filter(
    (ev) => ev.employeeId === activeEmployee.id
  );

  const myShifts = shifts.filter((s) => s.employeeId === activeEmployee.id);
  const totalWeeklyHours = myShifts.reduce(
    (acc, s) => acc + computeNetShiftHours(s.startTime, s.endTime, s.breakMinutes),
    0
  );

  const myTasks = collaboratorTasks.filter(
    (t) => t.employeeId === activeEmployee.id
  );
  const myNotifications = collaboratorNotifications.filter(
    (n) => n.employeeId === activeEmployee.id
  );
  const myDocuments = hrDocuments.filter(
    (d) => d.employeeId === activeEmployee.id
  );
  const pendingDocsCount = myDocuments.filter(
    (d) => d.signedStatus === 'En attente signature'
  ).length;

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    addCollaboratorTask({
      employeeId: activeEmployee.id,
      clubId: activeEmployee.clubId,
      date: '2026-10-23',
      dueTime: '16:00',
      title: newTaskTitle.trim(),
      category: newTaskCategory,
      priority: 'Normale',
    });
    setNewTaskTitle('');
  };

  return (
    <div className="space-y-5">
      {/* Top Collaborator Personal Space Header (Zero duplicate Mywellness button here) */}
      <div className="bg-[#1B2559] text-white rounded-xl p-5 shadow-xs border border-slate-800">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-[#4318FF] text-white font-black text-base flex items-center justify-center shrink-0 shadow-xs">
              {activeEmployee.firstName[0]}
              {activeEmployee.lastName[0]}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-[#00C48C] text-slate-950 font-black text-[10px] uppercase tracking-wider">
                  01 · MA JOURNÉE EN CLUB
                </span>
                <span className="px-2 py-0.5 rounded bg-white/10 text-sky-200 font-mono text-[10px]">
                  {formatClubName(activeEmployee.clubId, false)}
                </span>
                <span className="px-2 py-0.5 rounded bg-white/10 text-slate-200 font-mono text-[10px]">
                  {activeEmployee.contractType} {activeEmployee.weeklyContractHours}h/sem
                </span>
              </div>
              <h1 className="text-lg font-extrabold tracking-tight mt-1">
                Bonjour {activeEmployee.firstName} {activeEmployee.lastName} — {activeEmployee.jobTitle}
              </h1>
              <p className="text-xs text-slate-300 mt-0.5">
                Votre feuille de route quotidienne : créneaux du jour (RH, Mywellness, Heitz), tâches prioritaires et notifications.
              </p>
            </div>
          </div>

          {/* Single Collaborator Switcher */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="bg-[#2B3674] border border-white/15 rounded-lg px-3 py-2 flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-[#00C48C]" />
              <span className="text-[11px] text-slate-300">Collaborateur :</span>
              <select
                value={activeEmployee.id}
                onChange={(e) => setSelectedEmpId(e.target.value)}
                className="bg-transparent text-white text-xs font-bold focus:outline-none cursor-pointer"
              >
                {staffList.map((emp) => (
                  <option key={emp.id} value={emp.id} className="text-slate-900">
                    {emp.firstName} {emp.lastName} ({emp.role.toUpperCase()} · {formatClubName(emp.clubId, true)})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Bottom 4 KPI Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-white/10 text-xs">
          <div className="bg-white/5 rounded-lg px-3 py-2">
            <div className="text-[10px] text-slate-300 uppercase">Heures Semaine 43</div>
            <div className="font-mono font-bold text-sm text-white mt-0.5 tabular-nums">
              {totalWeeklyHours.toFixed(1)} h / {activeEmployee.weeklyContractHours} h
            </div>
          </div>
          <div className="bg-white/5 rounded-lg px-3 py-2">
            <div className="text-[10px] text-slate-300 uppercase">Créneaux Synchronisés</div>
            <div className="font-mono font-bold text-sm text-[#00C48C] mt-0.5 tabular-nums">
              {myEvents.length} créneau(x)
            </div>
          </div>
          <div className="bg-white/5 rounded-lg px-3 py-2">
            <div className="text-[10px] text-slate-300 uppercase">Solde Congés Acquis</div>
            <div className="font-mono font-bold text-sm text-sky-300 mt-0.5 tabular-nums">
              CP : {activeEmployee.cpBalance} j · RTT : {activeEmployee.rttBalance} j
            </div>
          </div>
          <div className="bg-white/5 rounded-lg px-3 py-2">
            <div className="text-[10px] text-slate-300 uppercase">Tâches du Jour</div>
            <div className="font-mono font-bold text-sm text-amber-300 mt-0.5 tabular-nums">
              {myTasks.filter((t) => !t.completed).length} restante(s) sur {myTasks.length}
            </div>
          </div>
        </div>
      </div>

      {/* Clean 2-Column Workspace: Left = Agenda Unifié (7 cols) | Right = Tâches, Notifications & Technogym Checkup (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* LEFT 7 COLS: Unified Schedule (Horaires RH + Cours Mywellness + RDV Heitz + Interne) */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-2xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#4318FF]">
                Agenda Unifié du Collaborateur
              </div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5 mt-0.5">
                <Calendar className="w-4 h-4 text-[#4318FF]" />
                Mes Horaires RH, Cours Mywellness &amp; RDV Heitz ({myEvents.length})
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setActiveSection('planning-hr')}
              className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs cursor-pointer whitespace-nowrap"
            >
              Ouvrir l’Espace Planning →
            </button>
          </div>

          {/* Stream of Unified Events */}
          <div className="space-y-2.5">
            {myEvents.map((ev) => {
              const sourceBadge =
                ev.originSystem === 'cfitness_rh'
                  ? {
                      label: 'HORAIRE RH C.FITNESS',
                      cls: 'bg-indigo-100 text-indigo-900 border-indigo-300',
                      border: 'border-l-[#4318FF]',
                    }
                  : ev.originSystem === 'mywellness_api'
                  ? {
                      label: 'TECHNOGYM MYWELLNESS',
                      cls: 'bg-amber-100 text-amber-950 border-amber-300',
                      border: 'border-l-amber-500',
                    }
                  : ev.originSystem === 'heitz_api'
                  ? {
                      label: 'RDV HEITZ SYSTEM',
                      cls: 'bg-sky-100 text-sky-950 border-sky-300',
                      border: 'border-l-sky-600',
                    }
                  : {
                      label: 'ÉVÉNEMENT INTERNE',
                      cls: 'bg-emerald-100 text-emerald-950 border-emerald-300',
                      border: 'border-l-emerald-600',
                    };

              return (
                <div
                  key={ev.id}
                  className={`p-3.5 rounded-lg border border-slate-200 border-l-4 ${sourceBadge.border} bg-white hover:bg-slate-50/70 transition-colors text-xs space-y-1.5`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className={`px-2 py-0.5 rounded border text-[10px] font-bold ${sourceBadge.cls}`}>
                      {sourceBadge.label}
                    </span>
                    <span className="font-mono text-xs font-bold text-slate-800 tabular-nums">
                      {ev.date} · {ev.startTime} – {ev.endTime}
                    </span>
                  </div>
                  <div className="font-bold text-slate-900 text-sm">{ev.title}</div>
                  <div className="text-[11px] text-slate-600 flex flex-wrap items-center justify-between gap-2">
                    <span>{ev.subtitle}</span>
                    <div className="flex flex-wrap items-center gap-2 font-mono text-[10px]">
                      {typeof ev.placesMax === 'number' && (
                        <span className="px-2 py-0.5 rounded bg-sky-50 border border-sky-200 text-sky-900 font-semibold">
                          Places {ev.placesTaken ?? 1}/{ev.placesMax} · Attente {ev.bookingQueueCount ?? 0} · Présence {ev.attendanceRatePct ?? 100}%
                        </span>
                      )}
                      <span className="text-slate-400">Réf: {ev.externalSourceId}</span>
                    </div>
                  </div>
                  {ev.participantName && (
                    <div className="pt-1.5 flex items-center justify-between gap-2 border-t border-slate-100">
                      <span className="text-[11px] font-medium text-slate-700">
                        Adhérent / Participant : <strong>{ev.participantName}</strong>
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
                          className="px-2.5 py-1 rounded bg-amber-400/90 hover:bg-amber-400 text-slate-950 font-bold text-[10px] flex items-center gap-1 cursor-pointer whitespace-nowrap"
                        >
                          <ExternalLink className="w-3 h-3" />
                          Fiche adhérent
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT 5 COLS: Tasks + Notifications + Single Mywellness Quick Connect + Link to Signatures */}
        <div className="lg:col-span-5 space-y-5">
          {/* Tasks Card */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3 shadow-2xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                  Feuille de Route Quotidienne
                </div>
                <h2 className="text-sm font-bold text-slate-900">
                  Mes Tâches du Jour ({myTasks.filter((t) => !t.completed).length} à faire)
                </h2>
              </div>
              <Clock className="w-4 h-4 text-slate-400" />
            </div>

            <div className="space-y-2">
              {myTasks.map((task) => (
                <div
                  key={task.id}
                  onClick={() => toggleCollaboratorTask(task.id)}
                  className={`p-2.5 rounded-lg border text-xs flex items-start gap-2.5 cursor-pointer transition-colors ${
                    task.completed
                      ? 'bg-slate-50 border-slate-200 text-slate-400 line-through'
                      : 'bg-white border-slate-200 hover:border-indigo-300 text-slate-900'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => {}}
                    className="mt-0.5 rounded text-[#4318FF] cursor-pointer"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold leading-snug">{task.title}</div>
                    <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-500">
                      <span className="font-mono font-bold">{task.dueTime}</span>
                      <span>·</span>
                      <span>{task.category}</span>
                      {task.priority === 'Haute' && !task.completed && (
                        <span className="px-1.5 py-0.2 rounded bg-rose-100 text-rose-800 font-bold">
                          Prioritaire
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={handleAddTask} className="pt-2 border-t border-slate-100 space-y-2 text-xs">
              <div className="flex gap-1.5">
                <input
                  type="text"
                  placeholder="Nouvelle tâche personnelle..."
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  className="flex-1 px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded-lg bg-[#1B2559] hover:bg-[#2B3674] text-white font-bold flex items-center gap-1 cursor-pointer whitespace-nowrap"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Ajouter
                </button>
              </div>
              <select
                value={newTaskCategory}
                onChange={(e) =>
                  setNewTaskCategory(e.target.value as CollaboratorTask['category'])
                }
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-[11px]"
              >
                <option value="Accueil & TPV">Catégorie : Accueil &amp; TPV</option>
                <option value="Relance CRM (ex-LEADS)">Catégorie : Relance CRM</option>
                <option value="Suivi Mywellness">Catégorie : Suivi Mywellness / Checkup</option>
                <option value="RH & Administratif">Catégorie : RH &amp; Administratif</option>
              </select>
            </form>
          </div>

          {/* Notifications + Single Redirect to ATS Signatures if a contract is pending */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3 shadow-2xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <Bell className="w-4 h-4 text-amber-500" />
                Notifications &amp; Documents ({myNotifications.filter((n) => !n.read).length} non lues)
              </h2>
              {pendingDocsCount > 0 ? (
                <button
                  type="button"
                  onClick={() => setActiveSection('ats')}
                  className="px-2.5 py-1 rounded-lg bg-[#4318FF] hover:bg-[#3611d4] text-white font-bold text-[11px] flex items-center gap-1 cursor-pointer whitespace-nowrap"
                >
                  <FileSignature className="w-3 h-3" />
                  {pendingDocsCount} contrat à signer →
                </button>
              ) : (
                <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Contrats à jour
                </span>
              )}
            </div>

            <div className="space-y-2">
              {myNotifications.length === 0 ? (
                <div className="text-xs text-slate-500 py-2">
                  Aucune notification pour ce collaborateur.
                </div>
              ) : (
                myNotifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`p-3 rounded-lg border text-xs space-y-1.5 ${
                      notif.read
                        ? 'bg-slate-50 border-slate-200 text-slate-600'
                        : 'bg-amber-50/70 border-amber-200 text-slate-900'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold">{notif.title}</span>
                      <span className="font-mono text-[10px] text-slate-500">
                        {notif.createdAt}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600">{notif.message}</p>
                    {!notif.read && (
                      <div className="pt-1 flex justify-end">
                        <button
                          type="button"
                          onClick={() => markNotificationRead(notif.id)}
                          className="text-[11px] font-semibold text-slate-700 hover:text-slate-950 underline cursor-pointer"
                        >
                          Marquer comme lu
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Full-Width Mywellness Quick Connect Component */}
      <MywellnessQuickConnect
        variant="card"
        defaultClubId={activeEmployee.clubId}
      />
    </div>
  );
}
