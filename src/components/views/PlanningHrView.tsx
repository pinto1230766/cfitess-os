import React, { useState } from 'react';
import { useCfos } from '../../context/CfosContext';
import {
  FileText,
  Download,
  ShieldCheck,
  AlertTriangle,
  Plus,
  CheckCircle2,
  XCircle,
  FileSignature,
  Scale,
  Eye,
} from 'lucide-react';
import { ClubId, Shift } from '../../types/cfos';
import {
  CFITNESS_LEGAL_IDENTITY,
  computePayrollVariables,
  computeProbationNoticePeriod,
  evaluateShiftCompliance,
  formatClubName,
  formatLeaveStatus,
  formatPointageType,
  generateOfficialCdiContractText,
  generateSilaeCsv,
} from '../../domain/rules';
import { ContractPreviewModal } from '../ContractPreviewModal';

const WEEK_DATES = [
  { date: '2026-10-19', label: 'Lun 19/10' },
  { date: '2026-10-20', label: 'Mar 20/10' },
  { date: '2026-10-21', label: 'Mer 21/10' },
  { date: '2026-10-22', label: 'Jeu 22/10' },
  { date: '2026-10-23', label: 'Ven 23/10' },
  { date: '2026-10-24', label: 'Sam 24/10' },
  { date: '2026-10-25', label: 'Dim 25/10' },
];

export function PlanningHrView() {
  const {
    clubFilter,
    employees,
    shifts,
    timeEntries,
    leaveRequests,
    hrDocuments,
    addShift,
    decideLeaveRequest,
    signHrDocument,
  } = useCfos();

  const [subTab, setSubTab] = useState<
    'PLANNING' | 'CONTRAT_CDI_LEGAL' | 'POINTAGES' | 'CONGES' | 'COFFRE_RH' | 'SILAE'
  >('PLANNING');

  // Add Shift Form state
  const [empId, setEmpId] = useState(employees[2]?.id || 'emp-maxime');
  const [date, setDate] = useState<string>('2026-10-24');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');
  const [breakMinutes, setBreakMinutes] = useState(60);
  const [shiftClub, setShiftClub] = useState<ClubId>('carre-de-soie');
  const [roleLabel, setRoleLabel] = useState('Accueil & Vente');

  // Contract Generator / Viewer state
  const [selectedContractEmpId, setSelectedContractEmpId] = useState<string>('emp-maxime');
  const [modalContractText, setModalContractText] = useState<string | null>(null);

  const filteredEmployees = employees.filter(
    (e) =>
      e.role !== 'kiosque' &&
      (clubFilter === 'all' ? true : e.clubId === clubFilter)
  );

  const previewShift: Shift = {
    id: 'preview-shift',
    employeeId: empId,
    clubId: shiftClub,
    date,
    startTime,
    endTime,
    breakMinutes,
    roleLabel,
    published: true,
  };

  const allViolations = evaluateShiftCompliance([...shifts, previewShift]);
  const previewViolations = allViolations.filter((v) => v.shiftId === 'preview-shift');
  const existingScheduleViolations = evaluateShiftCompliance(shifts);

  const payrollRows = computePayrollVariables(employees, shifts);
  const silaeCsvText = generateSilaeCsv(payrollRows, '2026-10');

  const selectedContractEmployee =
    employees.find((e) => e.id === selectedContractEmpId) || employees[3] || employees[0];

  const liveContractText = generateOfficialCdiContractText({
    firstName: selectedContractEmployee.firstName,
    lastName: selectedContractEmployee.lastName,
    email: selectedContractEmployee.email,
    phone: selectedContractEmployee.phone,
    jobTitle: selectedContractEmployee.jobTitle,
    clubId: selectedContractEmployee.clubId,
    startDate: selectedContractEmployee.hireDate,
    monthlyGrossEur:
      selectedContractEmployee.monthlyGrossEur ?? CFITNESS_LEGAL_IDENTITY.salaireBrutMensuelEur,
  });

  const handleAddShift = (e: React.FormEvent) => {
    e.preventDefault();
    addShift({
      employeeId: empId,
      clubId: shiftClub,
      date,
      startTime,
      endTime,
      breakMinutes,
      roleLabel,
      published: true,
    });
  };

  const triggerTestViolation = () => {
    setEmpId('emp-karim');
    setDate('2026-10-23');
    setStartTime('06:00');
    setEndTime('19:30');
    setBreakMinutes(15);
  };

  const handleDownloadSilae = () => {
    const blob = new Blob([silaeCsvText], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'EXPORT_PAIE_SILAE_CFITNESS_2026_10.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
            Modules M4 &amp; M4 bis (v1.2) · Modèle Officiel Contrat CDI C.FITNESS &amp; IDCC 2511
          </div>
          <h1 className="text-lg sm:text-xl font-bold text-slate-900 mt-1">
            Planning RH, Contrat CDI Officiel (1 823,03 € brut), Périodes d&apos;Essai &amp; Coffre-Fort
          </h1>
          <p className="text-xs text-slate-600 mt-1">
            SIRET <span className="font-mono font-semibold">{CFITNESS_LEGAL_IDENTITY.siret}</span> · NAF 9313Z · URSSAF 827000002188207761 · APICIL · REPAM · Clause CRM opposable &amp; Objectif 20 abonnements/mois
          </p>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {[
            { id: 'PLANNING', label: 'Planning & IDCC 2511' },
            { id: 'CONTRAT_CDI_LEGAL', label: 'Modèle Contrat CDI & Essai (v1.2)' },
            { id: 'POINTAGES', label: `Pointages (${timeEntries.length})` },
            { id: 'CONGES', label: `Congés (${leaveRequests.length})` },
            { id: 'COFFRE_RH', label: `Coffre-fort RH (${hrDocuments.length})` },
            { id: 'SILAE', label: 'Export Paie Silae' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setSubTab(t.id as typeof subTab)}
              className={`px-3 py-2 rounded-lg text-xs font-semibold cursor-pointer ${
                subTab === t.id
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {existingScheduleViolations.length > 0 && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-300 text-xs text-amber-950 space-y-1">
          <div className="font-bold flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            Alertes Convention Collective du Sport (IDCC 2511) détectées sur le planning :
          </div>
          {existingScheduleViolations.map((v, i) => (
            <div key={i}>• [{v.code}] {v.message}</div>
          ))}
        </div>
      )}

      {subTab === 'PLANNING' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Weekly Schedule Grid */}
          <div className="lg:col-span-8 bg-white border border-slate-200 rounded-xl p-5 overflow-x-auto">
            <h2 className="text-base font-bold text-slate-900 mb-4">
              Grille Hebdomadaire Bi-Club (Semaine du 19 au 25 Octobre 2026)
            </h2>
            <table className="w-full text-left border-collapse min-w-[680px]">
              <thead>
                <tr className="border-b border-slate-200 text-[11px] font-semibold uppercase text-slate-500">
                  <th className="py-2.5 pr-3 w-44">Collaborateur</th>
                  {WEEK_DATES.map((d) => (
                    <th key={d.date} className="py-2.5 px-2">
                      {d.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredEmployees.map((emp) => {
                  const empShifts = shifts.filter((s) => s.employeeId === emp.id);
                  return (
                    <tr key={emp.id}>
                      <td className="py-3 pr-3 align-top">
                        <div className="font-bold text-slate-900">
                          {emp.firstName} {emp.lastName}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {emp.contractType} · {emp.weeklyContractHours}h/sem ·{' '}
                          {emp.clubId === 'carre-de-soie' ? 'CDS' : 'BEY'}
                        </div>
                        {emp.monthlySubscriptionsTarget && (
                          <div className="text-[10px] font-semibold text-orange-600 mt-0.5">
                            Obj. CRM : {emp.monthlySubscriptionsActual ?? 0}/{emp.monthlySubscriptionsTarget} abos
                          </div>
                        )}
                      </td>
                      {WEEK_DATES.map((d) => {
                        const dayShifts = empShifts.filter((s) => s.date === d.date);
                        return (
                          <td key={d.date} className="py-2 px-1.5 align-top">
                            {dayShifts.length === 0 ? (
                              <span className="text-[11px] text-slate-300">Repos</span>
                            ) : (
                              dayShifts.map((s) => (
                                <div
                                  key={s.id}
                                  className={`p-2 rounded-lg border text-[11px] mb-1 ${
                                    s.clubId === 'carre-de-soie'
                                      ? 'bg-orange-50/50 border-orange-200 text-slate-900'
                                      : 'bg-blue-50/50 border-blue-200 text-slate-900'
                                  }`}
                                >
                                  <div className="font-mono font-bold tabular-nums">
                                    {s.startTime}–{s.endTime}
                                  </div>
                                  <div className="text-slate-600 truncate">{s.roleLabel}</div>
                                  <div className="text-[10px] text-slate-400">
                                    {formatClubName(s.clubId, true)} · Pause{' '}
                                    {s.breakMinutes}m
                                  </div>
                                </div>
                              ))
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Shift Creator with Live IDCC 2511 Validator */}
          <div className="lg:col-span-4 bg-white border border-slate-200 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Ajouter un Créneau (Moteur IDCC 2511)
                </h3>
                <p className="text-[11px] text-slate-500">
                  Vérification instantanée avant publication
                </p>
              </div>
              <button
                type="button"
                onClick={triggerTestViolation}
                className="text-[11px] font-semibold text-rose-600 hover:text-rose-700 underline cursor-pointer"
              >
                Simuler infraction
              </button>
            </div>

            <form onSubmit={handleAddShift} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Salarié</label>
                <select
                  value={empId}
                  onChange={(e) => setEmpId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
                >
                  {employees
                    .filter((e) => e.role !== 'kiosque')
                    .map((e) => (
                      <option key={e.id} value={e.id}>
                        {e.firstName} {e.lastName} ({e.contractType} · {e.weeklyContractHours}h)
                      </option>
                    ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Jour</label>
                  <select
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
                  >
                    {WEEK_DATES.map((d) => (
                      <option key={d.date} value={d.date}>
                        {d.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Club d&apos;affectation
                  </label>
                  <select
                    value={shiftClub}
                    onChange={(e) => setShiftClub(e.target.value as ClubId)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
                  >
                    <option value="carre-de-soie">Carré de Soie</option>
                    <option value="beynost">Beynost</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Début</label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-2.5 py-2 rounded-lg border border-slate-200 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Fin</label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full px-2.5 py-2 rounded-lg border border-slate-200 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Pause (min)</label>
                  <input
                    type="number"
                    min={0}
                    max={180}
                    value={breakMinutes}
                    onChange={(e) => setBreakMinutes(Number(e.target.value))}
                    className="w-full px-2.5 py-2 rounded-lg border border-slate-200 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Poste / Mission</label>
                <input
                  type="text"
                  value={roleLabel}
                  onChange={(e) => setRoleLabel(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200"
                />
              </div>

              {/* Live Compliance Box */}
              <div
                className={`p-3 rounded-lg border text-[11px] space-y-1 ${
                  previewViolations.length === 0
                    ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                    : 'bg-rose-50 border-rose-200 text-rose-900'
                }`}
              >
                <div className="font-bold flex items-center gap-1.5">
                  {previewViolations.length === 0 ? (
                    <>
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      Conforme IDCC 2511
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="w-4 h-4 text-rose-600" />
                      Infraction IDCC 2511 détectée
                    </>
                  )}
                </div>
                {previewViolations.map((v, i) => (
                  <div key={i} className="text-rose-800">
                    • {v.message}
                  </div>
                ))}
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Planifier ce créneau
              </button>
            </form>
          </div>
        </div>
      )}

      {subTab === 'CONTRAT_CDI_LEGAL' && (
        <div className="space-y-6">
          {/* Official Legal Identity & Clauses Card */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-5 space-y-4">
              <div className="pb-3 border-b border-slate-100">
                <div className="text-xs font-semibold uppercase text-orange-600">
                  Données Juridiques Réelles C.FITNESS (M4 bis RH)
                </div>
                <h2 className="text-base font-bold text-slate-900 mt-0.5 flex items-center gap-2">
                  <Scale className="w-4 h-4 text-orange-600" />
                  Identité Légale, Caisses &amp; Clauses Opposables
                </h2>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between gap-2 border-b border-slate-100 pb-2">
                  <span className="text-slate-500">Raison Sociale :</span>
                  <span className="font-bold text-slate-900">{CFITNESS_LEGAL_IDENTITY.raisonSociale}</span>
                </div>
                <div className="border-b border-slate-100 pb-2">
                  <div className="text-slate-500">Siège Social :</div>
                  <div className="font-semibold text-slate-900 mt-0.5">
                    {CFITNESS_LEGAL_IDENTITY.siegeSocial}
                  </div>
                </div>
                <div className="border-b border-slate-100 pb-2">
                  <div className="text-slate-500">Établissement secondaire :</div>
                  <div className="font-semibold text-slate-900 mt-0.5">
                    {CFITNESS_LEGAL_IDENTITY.etablissementSecondaire}
                  </div>
                </div>
                <div className="flex justify-between gap-2 border-b border-slate-100 pb-2">
                  <span className="text-slate-500">SIRET &amp; Code NAF :</span>
                  <span className="font-mono font-bold text-slate-900">
                    {CFITNESS_LEGAL_IDENTITY.siret} · {CFITNESS_LEGAL_IDENTITY.codeNaf}
                  </span>
                </div>
                <div className="flex justify-between gap-2 border-b border-slate-100 pb-2">
                  <span className="text-slate-500">URSSAF Rhône-Alpes :</span>
                  <span className="font-mono font-semibold text-slate-900">
                    827000002188207761
                  </span>
                </div>
                <div className="flex justify-between gap-2 border-b border-slate-100 pb-2">
                  <span className="text-slate-500">Retraite &amp; Prévoyance :</span>
                  <span className="font-semibold text-slate-900 text-right">
                    AGIRA Salariés (APICIL) · REPAM Lyon
                  </span>
                </div>
                <div className="flex justify-between gap-2 border-b border-slate-100 pb-2">
                  <span className="text-slate-500">Convention Collective :</span>
                  <span className="font-semibold text-slate-900 text-right">
                    Sport (IDCC 2511) · Employé, Non-cadre, Gr. 1
                  </span>
                </div>
                <div className="flex justify-between gap-2 border-b border-slate-100 pb-2">
                  <span className="text-slate-500">Temps complet &amp; Salaire :</span>
                  <span className="font-mono font-bold text-emerald-700">
                    35,00 h/sem (151,67 h) · 1 823,03 € brut
                  </span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-slate-500">Objectif Commercial :</span>
                  <span className="font-bold text-orange-600">
                    20 abonnements mensuels (Clause CRM opposable)
                  </span>
                </div>
              </div>

              {/* Probation Notice Delays Monitor */}
              <div className="pt-3 border-t border-slate-200 space-y-2.5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Suivi Périodes d&apos;Essai (2 mois renouv. 1 fois) &amp; Délais de Prévenance
                </h3>
                <div className="space-y-2">
                  {filteredEmployees.map((emp) => {
                    const prob = computeProbationNoticePeriod(
                      emp.hireDate,
                      '2026-10-23',
                      emp.probationRenewed
                    );
                    return (
                      <div
                        key={emp.id}
                        className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs flex flex-col gap-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900">
                            {emp.firstName} {emp.lastName}
                          </span>
                          <span className="font-mono text-[11px] text-slate-600">
                            Embauche : {emp.hireDate}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-700">{prob.explanation}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right: Official Contract Generator */}
            <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-5 flex flex-col space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-100">
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    Générateur du Contrat de Travail CDI Officiel C.FITNESS
                  </h2>
                  <p className="text-xs text-slate-500">
                    Intègre la clause opposable de traçabilité CRM C.Fitness OS, l&apos;interdiction du portable personnel et la mention vidéosurveillance.
                  </p>
                </div>
                <select
                  value={selectedContractEmpId}
                  onChange={(e) => setSelectedContractEmpId(e.target.value)}
                  className="px-3 py-2 rounded-lg border border-slate-200 text-xs font-semibold bg-slate-50"
                >
                  {employees
                    .filter((e) => e.role !== 'kiosque')
                    .map((e) => (
                      <option key={e.id} value={e.id}>
                        {e.firstName} {e.lastName} ({e.jobTitle})
                      </option>
                    ))}
                </select>
              </div>

              <pre className="p-4 rounded-xl bg-slate-900 text-slate-100 font-mono text-xs overflow-x-auto whitespace-pre-wrap leading-relaxed max-h-[540px] overflow-y-auto">
                {liveContractText}
              </pre>
            </div>
          </div>
        </div>
      )}

      {subTab === 'POINTAGES' && (
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <h2 className="text-base font-bold text-slate-900 mb-4">
            Journal des Pointages Kiosque Tablette (PIN 4 chiffres)
          </h2>
          <div className="divide-y divide-slate-100 text-xs">
            {timeEntries.map((pt) => {
              const emp = employees.find((e) => e.id === pt.employeeId);
              return (
                <div key={pt.id} className="py-3 flex items-center justify-between gap-4">
                  <div>
                    <span className="font-bold text-slate-900">
                      {emp ? `${emp.firstName} ${emp.lastName}` : pt.employeeId}
                    </span>{' '}
                    ·{' '}
                    <span className="font-semibold text-orange-600">
                      {formatPointageType(pt.type)}
                    </span>
                    <div className="text-slate-500 mt-0.5">
                      Club {formatClubName(pt.clubId)} · Source :{' '}
                      {pt.source}
                    </div>
                  </div>
                  <div className="text-right font-mono tabular-nums">
                    <div className="font-bold text-slate-900">
                      {pt.timestamp.slice(0, 16).replace('T', ' ')}
                    </div>
                    <div className="text-[11px] text-emerald-700">
                      {pt.syncedFromOffline
                        ? 'Resynchronisé depuis file hors-ligne'
                        : 'Synchronisé temps réel'}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {subTab === 'CONGES' && (
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <h2 className="text-base font-bold text-slate-900 mb-4">
            Demandes de Congés, RTT &amp; Absences
          </h2>
          <div className="divide-y divide-slate-100 text-xs">
            {leaveRequests.map((lv) => {
              const emp = employees.find((e) => e.id === lv.employeeId);
              return (
                <div
                  key={lv.id}
                  className="py-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                >
                  <div>
                    <div className="font-bold text-slate-900">
                      {emp ? `${emp.firstName} ${emp.lastName}` : lv.employeeId} ·{' '}
                      <span className="text-orange-600">{lv.type}</span>
                    </div>
                    <div className="text-slate-600 mt-0.5">
                      Du <span className="font-mono font-semibold">{lv.startDate}</span> au{' '}
                      <span className="font-mono font-semibold">{lv.endDate}</span> (
                      {lv.daysCount} jour(s))
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {lv.status === 'en_attente' ? (
                      <>
                        <button
                          onClick={() => decideLeaveRequest(lv.id, 'valide')}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold flex items-center gap-1 cursor-pointer"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Valider
                        </button>
                        <button
                          onClick={() => decideLeaveRequest(lv.id, 'refuse')}
                          className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-semibold flex items-center gap-1 cursor-pointer"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          Refuser
                        </button>
                      </>
                    ) : (
                      <span
                        className={`font-semibold ${
                          lv.status === 'valide' ? 'text-emerald-700' : 'text-rose-600'
                        }`}
                      >
                        Statut : {formatLeaveStatus(lv.status)}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {subTab === 'COFFRE_RH' && (
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <h2 className="text-base font-bold text-slate-900 mb-1">
            Coffre-Fort Numérique Salarié &amp; Signature Électronique Horodatée (M4 bis)
          </h2>
          <p className="text-xs text-slate-500 mb-4">
            Chiffrement AES-256 au repos · Contrats CDI C.FITNESS (IDCC 2511 Gr. 1), DPAE URSSAF 818 651 317 00018 et bulletins de paie.
          </p>
          <div className="divide-y divide-slate-100 text-xs">
            {hrDocuments.map((doc) => {
              const emp = employees.find((e) => e.id === doc.employeeId);
              const isSigned = doc.signedStatus !== 'En attente signature';
              return (
                <div
                  key={doc.id}
                  className="py-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                >
                  <div>
                    <div className="font-bold text-slate-900 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-slate-500" />
                      {doc.title}
                    </div>
                    <div className="text-slate-500 mt-0.5">
                      Salarié :{' '}
                      <span className="font-semibold text-slate-800">
                        {emp ? `${emp.firstName} ${emp.lastName}` : doc.employeeId}
                      </span>{' '}
                      · Catégorie : {doc.category} · Déposé le {doc.uploadedAt}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {doc.contractBodyText && (
                      <button
                        onClick={() => setModalContractText(doc.contractBodyText!)}
                        className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Lire le contrat
                      </button>
                    )}
                    {isSigned ? (
                      <span className="text-emerald-700 font-semibold flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4" />
                        {doc.signedStatus}
                      </span>
                    ) : (
                      <button
                        onClick={() => signHrDocument(doc.id)}
                        className="px-3.5 py-2 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-semibold flex items-center gap-1.5 cursor-pointer"
                      >
                        <FileSignature className="w-4 h-4" />
                        Signer électroniquement (OTP)
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {subTab === 'SILAE' && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Générateur d&apos;Export Comptable &amp; Paie Silae (M4.6)
              </h2>
              <p className="text-xs text-slate-500">
                Calcul automatique des heures normales (base 151,67h / 1 823,03 € brut), heures supplémentaires 25%, majorations dimanche et heures de nuit (&gt;22h).
              </p>
            </div>
            <button
              onClick={handleDownloadSilae}
              className="px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <Download className="w-4 h-4" />
              Télécharger CSV Silae
            </button>
          </div>

          <pre className="p-4 rounded-xl bg-slate-900 text-slate-100 font-mono text-xs overflow-x-auto">
            {silaeCsvText}
          </pre>
        </div>
      )}

      <ContractPreviewModal
        contractText={modalContractText}
        onClose={() => setModalContractText(null)}
      />
    </div>
  );
}
