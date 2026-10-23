import React, { useState } from 'react';
import { useCfos } from '../context/CfosContext';
import { KeyRound, UserCheck, AlertTriangle, Unlock } from 'lucide-react';

export function AuthSwitchModal({ onClose }: { onClose: () => void }) {
  const {
    employees,
    currentUser,
    switchUserSession,
    punchWithPin,
    unlockEmployeePin,
  } = useCfos();

  const [selectedEmpId, setSelectedEmpId] = useState(employees[0]?.id || 'emp-mario');
  const [pinInput, setPinInput] = useState('');
  const [pinFeedback, setPinFeedback] = useState<string | null>(null);

  const targetEmp = employees.find((e) => e.id === selectedEmpId) || employees[0];

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetEmp) return;
    const res = punchWithPin(targetEmp.clubId, targetEmp.id, pinInput, 'arrivee');
    if (!res.ok) {
      setPinFeedback(res.message);
    } else {
      switchUserSession(targetEmp.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-5 sm:p-6 border border-slate-200 shadow-xl space-y-5 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-orange-600">
              Module M1 · Authentification Unifiée &amp; RBAC (6 Rôles)
            </div>
            <h2 className="text-base font-bold text-slate-900 mt-0.5">
              Changer d&apos;Utilisateur ou Tester le Verrouillage PIN
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-xs font-semibold text-slate-500 hover:text-slate-800 cursor-pointer"
          >
            Fermer
          </button>
        </div>

        {/* PIN Login with 5-attempt lockout test */}
        <form
          onSubmit={handlePinSubmit}
          className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 text-xs"
        >
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-900 flex items-center gap-1.5">
              <KeyRound className="w-4 h-4 text-orange-600" />
              Test d&apos;authentification PIN (Verrouillage après 5 échecs)
            </span>
            <span className="text-[11px] text-slate-500 tabular-nums">
              Échecs : {targetEmp?.failedPinAttempts || 0}/5
            </span>
          </div>

          <select
            value={selectedEmpId}
            onChange={(e) => {
              setSelectedEmpId(e.target.value);
              setPinFeedback(null);
            }}
            className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white font-semibold"
          >
            {employees.map((e) => (
              <option key={e.id} value={e.id}>
                {e.firstName} {e.lastName} — PIN attendu : {e.pinCode}
              </option>
            ))}
          </select>

          <div className="flex gap-2">
            <input
              type="password"
              maxLength={4}
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value)}
              placeholder="Saisir code PIN 4 chiffres"
              className="flex-1 px-3 py-2 rounded-lg border border-slate-200 bg-white font-mono text-sm tracking-widest"
            />
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold cursor-pointer"
            >
              Valider PIN
            </button>
          </div>
          {pinFeedback && (
            <div className="text-rose-600 font-semibold flex items-center justify-between gap-2">
              <span className="flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                {pinFeedback}
              </span>
              {targetEmp?.pinLocked && (
                <button
                  type="button"
                  onClick={() => {
                    unlockEmployeePin(targetEmp.id);
                    setPinFeedback('PIN débloqué par Admin/Manager.');
                  }}
                  className="px-2.5 py-1 rounded bg-emerald-600 text-white text-[11px] flex items-center gap-1 shrink-0 cursor-pointer"
                >
                  <Unlock className="w-3 h-3" />
                  Débloquer
                </button>
              )}
            </div>
          )}
        </form>

        {/* Direct Role Switcher for Demo / Audit */}
        <div className="space-y-2">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Sélectionner un profil métier C.Fitness (6 rôles RBAC) :
          </div>
          <div className="space-y-2">
            {employees.map((emp) => {
              const isCurrent = emp.id === currentUser.id;
              return (
                <button
                  key={emp.id}
                  onClick={() => {
                    switchUserSession(emp.id, 'admin');
                    onClose();
                  }}
                  className={`w-full p-3 rounded-xl border text-left flex items-center justify-between text-xs transition-colors cursor-pointer ${
                    isCurrent
                      ? 'border-orange-500 bg-orange-50/40'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div>
                    <div className="font-bold text-slate-900 flex items-center gap-2">
                      <span>
                        {emp.firstName} {emp.lastName}
                      </span>
                      <span className="font-mono text-[11px] text-orange-600">
                        [{emp.role.toUpperCase()}]
                      </span>
                    </div>
                    <div className="text-slate-500 mt-0.5">
                      {emp.jobTitle} · Club {emp.clubId} · PIN :{' '}
                      <span className="font-mono font-semibold">{emp.pinCode}</span>
                    </div>
                  </div>
                  {isCurrent ? (
                    <span className="text-emerald-700 font-bold flex items-center gap-1">
                      <UserCheck className="w-4 h-4" />
                      Actif
                    </span>
                  ) : (
                    <span className="text-slate-600 font-semibold">Basculer</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
