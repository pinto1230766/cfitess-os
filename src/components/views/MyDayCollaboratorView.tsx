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
  UserPlus,
  PhoneCall,
  QrCode,
  ArrowRight,
} from 'lucide-react';
import { useCfos } from '../../context/CfosContext';
import {
  buildUnifiedPlanningEvents,
  computeNetShiftHours,
  formatClubName,
} from '../../domain/rules';
import type { CollaboratorTask } from '../../types/cfos';

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

  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskCategory, setNewTaskCategory] =
    useState<CollaboratorTask['category']>('Accueil & TPV');

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
  const remainingTasksCount = myTasks.filter((t) => !t.completed).length;

  const myNotifications = collaboratorNotifications.filter(
    (n) => n.employeeId === activeEmployee.id
  );
  const unreadNotifsCount = myNotifications.filter((n) => !n.read).length;

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
    <div className="space-y-6">
      {/* Top Personal Header & Quick Front-Desk Actions */}
      <div className="bg-slate-900 text-white rounded-2xl p-5 sm:p-6 border border-slate-800 shadow-2xs space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-orange-600 text-white font-black text-base flex items-center justify-center shrink-0">
              {activeEmployee.firstName[0]}
              {activeEmployee.lastName[0]}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                <span className="text-orange-400 font-semibold">01. Ma Journée</span>
                <span aria-hidden="true">·</span>
                <span>{formatClubName(activeEmployee.clubId, false)}</span>
                <span aria-hidden="true">·</span>
                <span className="font-mono tabular-nums">
                  {activeEmployee.contractType} {activeEmployee.weeklyContractHours}h/sem
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white mt-1">
                Bonjour {activeEmployee.firstName} {activeEmployee.lastName}
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 mt-0.5">
                {activeEmployee.jobTitle} — Voici votre emploi du temps et vos priorités du jour.
              </p>
            </div>
          </div>

          {/* Single Collaborator Selector */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 flex items-center gap-2.5">
              <UserCheck className="w-4 h-4 text-orange-400 shrink-0" />
              <span className="text-xs text-slate-400">Voir la journée de :</span>
              <select
                value={activeEmployee.id}
                onChange={(e) => setSelectedEmpId(e.target.value)}
                className="bg-transparent text-white text-xs sm:text-sm font-semibold focus:outline-none cursor-pointer"
              >
                {staffList.map((emp) => (
                  <option key={emp.id} value={emp.id} className="text-slate-900">
                    {emp.firstName} {emp.lastName} ({formatClubName(emp.clubId, true)})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* 4 Key Daily Figures (Clean, Large, Readable at a Distance) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-4 border-t border-slate-800">
          <div className="bg-slate-800/70 border border-slate-700/80 rounded-xl p-3.5">
            <div className="text-xs text-slate-400">Tâches à faire aujourd&apos;hui</div>
            <div className="text-lg sm:text-xl font-bold text-orange-400 font-mono tabular-nums mt-1">
              {remainingTasksCount} sur {myTasks.length}
            </div>
          </div>

          <div className="bg-slate-800/70 border border-slate-700/80 rounded-xl p-3.5">
            <div className="text-xs text-slate-400">Rendez-vous &amp; Créneaux</div>
            <div className="text-lg sm:text-xl font-bold text-emerald-400 font-mono tabular-nums mt-1">
              {myEvents.length} programmés
            </div>
          </div>

          <div className="bg-slate-800/70 border border-slate-700/80 rounded-xl p-3.5">
            <div className="text-xs text-slate-400">Heures de la semaine</div>
            <div className="text-lg sm:text-xl font-bold text-white font-mono tabular-nums mt-1">
              {totalWeeklyHours.toFixed(1)} h / {activeEmployee.weeklyContractHours} h
            </div>
          </div>

          <div className="bg-slate-800/70 border border-slate-700/80 rounded-xl p-3.5">
            <div className="text-xs text-slate-400">Congés disponibles</div>
            <div className="text-lg sm:text-xl font-bold text-white font-mono tabular-nums mt-1">
              {activeEmployee.cpBalance} j CP · {activeEmployee.rttBalance} j RTT
            </div>
          </div>
        </div>

        {/* 3 Direct Counter Shortcuts ("Actions Comptoir Accueil en 1 Clic") */}
        <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <span className="text-xs font-semibold text-slate-400">
            Raccourcis rapides comptoir d&apos;accueil :
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 flex-1 max-w-3xl">
            <button
              type="button"
              onClick={() => setActiveSection('crm')}
              className="px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <UserPlus className="w-4 h-4 shrink-0" />
              <span>Nouveau Prospect / Essai QR</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSection('telephony')}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <PhoneCall className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Appels &amp; SMS (04 / 07)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSection('devices')}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <QrCode className="w-4 h-4 text-orange-400 shrink-0" />
              <span>Portillons &amp; Caisse Heitz</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main 2-Column Workspace: Left = Mon Planning du Jour (7 cols) | Right = Mes Tâches & Notifications (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT 7 COLS: Clean Unified Schedule */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-orange-600" />
                <span>Mon Planning &amp; Mes Rendez-vous ({myEvents.length})</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Horaires de présence, séances de coaching Mywellness et rendez-vous d&apos;essai Heitz.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setActiveSection('planning-hr')}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-900 font-semibold text-xs flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              <span>Voir la semaine</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {myEvents.map((ev) => {
              const sourceLabel =
                ev.originSystem === 'cfitness_rh'
                  ? 'Horaire Club'
                  : ev.originSystem === 'mywellness_api'
                  ? 'Coaching & Bilan Mywellness'
                  : ev.originSystem === 'heitz_api'
                  ? 'Rendez-vous Heitz'
                  : 'Vie du Club';

              const sourceTone =
                ev.originSystem === 'cfitness_rh'
                  ? 'text-slate-600'
                  : ev.originSystem === 'mywellness_api'
                  ? 'text-orange-600'
                  : ev.originSystem === 'heitz_api'
                  ? 'text-emerald-700'
                  : 'text-slate-700';

              return (
                <div
                  key={ev.id}
                  className="py-4 first:pt-1 last:pb-1 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="font-mono font-bold text-slate-900 tabular-nums">
                        {ev.startTime} – {ev.endTime}
                      </span>
                      <span aria-hidden="true" className="text-slate-300">
                        ·
                      </span>
                      <span className="text-slate-500">{ev.date}</span>
                      <span aria-hidden="true" className="text-slate-300">
                        ·
                      </span>
                      <span className={`font-semibold ${sourceTone}`}>{sourceLabel}</span>
                    </div>

                    <div className="text-sm sm:text-base font-bold text-slate-900">
                      {ev.title}
                    </div>

                    <div className="text-xs text-slate-600 flex flex-wrap items-center gap-2">
                      <span>{ev.subtitle}</span>
                      {ev.participantName && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span>
                            Adhérent : <strong className="text-slate-900">{ev.participantName}</strong>
                          </span>
                        </>
                      )}
                      {typeof ev.placesMax === 'number' && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="font-mono tabular-nums text-slate-700">
                            Inscrits : {ev.placesTaken ?? 1}/{ev.placesMax}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

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
                      className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-900 font-semibold text-xs flex items-center gap-1.5 self-start sm:self-center shrink-0 cursor-pointer"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-orange-600" />
                      <span>Dossier Mywellness</span>
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT 5 COLS: Tasks & Notifications */}
        <div className="lg:col-span-5 space-y-6">
          {/* Daily Tasks */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-orange-600" />
                  <span>Mes Tâches du Jour ({remainingTasksCount} à faire)</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Cochez chaque action dès qu&apos;elle est terminée.
                </p>
              </div>
            </div>

            <div className="space-y-2.5">
              {myTasks.map((task) => (
                <div
                  key={task.id}
                  onClick={() => toggleCollaboratorTask(task.id)}
                  className={`p-3.5 rounded-xl border text-sm flex items-start gap-3 cursor-pointer transition-colors ${
                    task.completed
                      ? 'bg-slate-50 border-slate-200 text-slate-400 line-through'
                      : 'bg-white border-slate-200 hover:border-orange-300 text-slate-900'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => {}}
                    className="mt-1 w-4 h-4 rounded text-orange-600 cursor-pointer"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold leading-snug">{task.title}</div>
                    <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-slate-500">
                      <span className="font-mono font-semibold tabular-nums">{task.dueTime}</span>
                      <span aria-hidden="true">·</span>
                      <span>{task.category}</span>
                      {task.priority === 'Haute' && !task.completed && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="text-rose-600 font-bold">Prioritaire</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <form
              onSubmit={handleAddTask}
              className="pt-3 border-t border-slate-100 space-y-2.5 text-xs"
            >
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Ajouter une tâche rapide..."
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:border-orange-500"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                >
                  <Plus className="w-4 h-4" />
                  <span>Ajouter</span>
                </button>
              </div>
              <select
                value={newTaskCategory}
                onChange={(e) =>
                  setNewTaskCategory(e.target.value as CollaboratorTask['category'])
                }
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-700"
              >
                <option value="Accueil & TPV">Catégorie : Accueil &amp; Caisse</option>
                <option value="Relance CRM (ex-LEADS)">Catégorie : Relance Prospects</option>
                <option value="Suivi Mywellness">Catégorie : Suivi Sportif &amp; Bilan</option>
                <option value="RH & Administratif">Catégorie : Administratif</option>
              </select>
            </form>
          </div>

          {/* Notifications & Contracts */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Bell className="w-4 h-4 text-orange-600" />
                <span>Messages &amp; Documents ({unreadNotifsCount})</span>
              </h2>
              {pendingDocsCount > 0 ? (
                <button
                  type="button"
                  onClick={() => setActiveSection('ats')}
                  className="px-3 py-1.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-semibold text-xs flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                >
                  <FileSignature className="w-3.5 h-3.5" />
                  <span>{pendingDocsCount} contrat à signer</span>
                </button>
              ) : (
                <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Dossier RH à jour</span>
                </span>
              )}
            </div>

            <div className="space-y-2.5">
              {myNotifications.length === 0 ? (
                <div className="text-xs text-slate-500 py-2">
                  Aucun message en attente.
                </div>
              ) : (
                myNotifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`p-3.5 rounded-xl border text-xs space-y-1.5 ${
                      notif.read
                        ? 'bg-slate-50 border-slate-200 text-slate-600'
                        : 'bg-orange-50/50 border-orange-200 text-slate-900'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-sm">{notif.title}</span>
                      <span className="font-mono text-[11px] text-slate-500 tabular-nums">
                        {notif.createdAt}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">{notif.message}</p>
                    {!notif.read && (
                      <div className="pt-1 flex justify-end">
                        <button
                          type="button"
                          onClick={() => markNotificationRead(notif.id)}
                          className="text-xs font-semibold text-orange-700 hover:text-orange-900 underline cursor-pointer"
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
    </div>
  );
}
