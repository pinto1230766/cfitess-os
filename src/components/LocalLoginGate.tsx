import React, { useState } from 'react';
import { useCfos } from '../context/CfosContext';
import {
  ShieldCheck,
  KeyRound,
  Lock,
  Building2,
  Smartphone,
  Tablet,
  PhoneCall,
  LayoutDashboard,
  AlertTriangle,
  Unlock,
  CheckCircle2,
  Server,
  ArrowRight,
} from 'lucide-react';
import { ShellMode } from '../types/cfos';
import { CFITNESS_LEGAL_IDENTITY } from '../domain/rules';

type RoleCategoryFilter = 'TOUS' | 'DIRECTEUR' | 'EMPLOYE' | 'COACH';

export function LocalLoginGate({ children }: { children: React.ReactNode }) {
  const {
    isAuthenticated,
    employees,
    loginWithLocalCredentials,
    unlockEmployeePin,
  } = useCfos();

  const [roleCategory, setRoleCategory] = useState<RoleCategoryFilter>('TOUS');
  const [selectedEmpId, setSelectedEmpId] = useState<string>('emp-mario');
  const [secretInput, setSecretInput] = useState<string>('1010');
  const [totpCode, setTotpCode] = useState<string>('482 910');
  const [targetShell, setTargetShell] = useState<ShellMode>('admin');
  const [errorFeedback, setErrorFeedback] = useState<string | null>(null);

  if (isAuthenticated) {
    return <>{children}</>;
  }

  const nonKioskEmployees = employees.filter((e) => e.role !== 'kiosque');

  const filteredProfiles = nonKioskEmployees.filter((emp) => {
    if (roleCategory === 'DIRECTEUR') {
      return emp.role === 'admin' || emp.role === 'manager';
    }
    if (roleCategory === 'EMPLOYE') {
      return emp.role === 'commercial';
    }
    if (roleCategory === 'COACH') {
      return emp.role === 'coach' || emp.role === 'apprenti';
    }
    return true;
  });

  const selectedEmployee =
    employees.find((e) => e.id === selectedEmpId) || nonKioskEmployees[0];

  const getRoleCategoryBadge = (role: string) => {
    if (role === 'admin' || role === 'manager') {
      return {
        label: 'DIRECTEUR / DIRECTION',
        color: 'bg-orange-600 text-white',
        permissions:
          'Accès complet : Pilotage Bi-Club, Téléphonie 12 lignes (Double écoute), RH & Contrat CDI, ATS, Heitz & Gouvernance.',
      };
    }
    if (role === 'commercial') {
      return {
        label: 'EMPLOYÉ COMMERCIAL',
        color: 'bg-blue-600 text-white',
        permissions:
          'Accès métier : CRM Prospects & Relances (Clause Art. 4 — Obj. 20 abos/mois), Softphone WebRTC 04/07, Planning & Coffre RH.',
      };
    }
    return {
      label: 'COACH SPORTIF / BPJEPS',
      color: 'bg-emerald-600 text-white',
      permissions:
        'Accès plateau & santé : Bilans Biométriques InBody 570/270 (RGPD Art. 9), Technogym Biocircuit, Académie & Livret BPJEPS.',
    };
  };

  const handleSelectProfile = (empId: string) => {
    const emp = employees.find((e) => e.id === empId);
    if (!emp) return;
    setSelectedEmpId(emp.id);
    setSecretInput(emp.pinCode);
    setErrorFeedback(null);
    if (emp.role === 'admin' || emp.role === 'manager') {
      setTargetShell('admin');
    } else if (emp.role === 'commercial') {
      setTargetShell('admin');
    } else if (emp.role === 'coach' || emp.role === 'apprenti') {
      setTargetShell('admin');
    }
  };

  const handleSubmitLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmployee) return;
    const res = loginWithLocalCredentials({
      employeeId: selectedEmployee.id,
      secretOrPin: secretInput,
      preferredShell: targetShell,
    });
    if (!res.ok) {
      setErrorFeedback(res.message);
    }
  };

  const handleQuickRoleLogin = (empId: string, shell?: ShellMode) => {
    const emp = employees.find((e) => e.id === empId);
    if (!emp) return;
    const res = loginWithLocalCredentials({
      employeeId: emp.id,
      secretOrPin: emp.pinCode,
      preferredShell: shell,
    });
    if (!res.ok) {
      setSelectedEmpId(emp.id);
      setErrorFeedback(res.message);
    }
  };

  const handleKeypadDigit = (digit: string) => {
    setErrorFeedback(null);
    setSecretInput((prev) => (prev.length >= 12 ? prev : prev + digit));
  };

  const roleMeta = getRoleCategoryBadge(selectedEmployee.role);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-4 sm:p-6 lg:p-8">
      {/* Top Sovereign Infrastructure Bar */}
      <header className="max-w-6xl w-full mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-600 flex items-center justify-center font-black text-base tracking-tighter text-white shrink-0">
            CF
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-base text-white">C.Fitness OS v1.2</span>
              <span className="px-2 py-0.5 rounded bg-emerald-950 border border-emerald-700 text-emerald-300 font-mono text-[11px] font-semibold">
                100% LOCAL · ZÉRO CLOUD EXTERNE
              </span>
            </div>
            <div className="text-xs text-slate-400">
              {CFITNESS_LEGAL_IDENTITY.raisonSociale} · SIRET {CFITNESS_LEGAL_IDENTITY.siret} · Carré de Soie &amp; Beynost
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-300 font-mono">
          <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 flex items-center gap-1.5">
            <Server className="w-3.5 h-3.5 text-orange-400" />
            Linux Debian 12 · Rust Axum (Argon2id + JWT Local)
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-emerald-400">
            VPN WireGuard &lt; 3 ms
          </span>
        </div>
      </header>

      {/* Main Centered Login Grid */}
      <main className="max-w-6xl w-full mx-auto my-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Role Selector (Directeur, Employé, Coach) */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-5">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-orange-400">
              Module M1 · Contrôle d&apos;Accès Local par Rôle (RBAC)
            </div>
            <h1 className="text-lg sm:text-xl font-bold text-white mt-1">
              1. Choisissez votre profil métier (Directeur, Employé, Coach)
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Authentification hébergée directement sur le serveur local de Carré de Soie (PostgreSQL 16 + hachage Argon2id), sans dépendance Firebase ni cloud tiers.
            </p>
          </div>

          {/* Role Filter Tabs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {(
              [
                { id: 'TOUS', label: 'Tous les profils (7)' },
                { id: 'DIRECTEUR', label: 'Directeur / Manager' },
                { id: 'EMPLOYE', label: 'Employé Commercial' },
                { id: 'COACH', label: 'Coach & BPJEPS' },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setRoleCategory(tab.id)}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                  roleCategory === tab.id
                    ? 'bg-orange-600 text-white'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Profile Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filteredProfiles.map((emp) => {
              const isSelected = emp.id === selectedEmployee.id;
              const badge = getRoleCategoryBadge(emp.role);
              return (
                <div
                  key={emp.id}
                  onClick={() => handleSelectProfile(emp.id)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                    isSelected
                      ? 'border-orange-500 bg-slate-800/90 ring-1 ring-orange-500'
                      : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wide ${badge.color}`}
                      >
                        {badge.label}
                      </span>
                      <span className="font-mono text-[11px] text-slate-400">
                        {emp.clubId === 'carre-de-soie' ? 'Carré de Soie' : 'Beynost'}
                      </span>
                    </div>

                    <div className="mt-2 font-bold text-sm text-white flex items-center justify-between">
                      <span>
                        {emp.firstName} {emp.lastName}
                      </span>
                      <span className="font-mono text-xs text-orange-400">
                        PIN : {emp.pinCode}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">{emp.jobTitle}</div>
                    <div className="text-[11px] font-mono text-slate-500 mt-0.5 truncate">
                      {emp.email}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
                    <span className="text-[11px] text-emerald-400 font-medium">
                      {emp.totpEnabled ? '2FA TOTP Actif' : 'PIN / Mot de passe local'}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleQuickRoleLogin(emp.id);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-orange-600 text-white text-[11px] font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <span>Connexion 1-Clic</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Direct Kiosk / Field Shell Quick Launchers */}
          <div className="pt-3 border-t border-slate-800 space-y-2">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Accès Direct Terminaux Club (Tablette Murale, Smartphone, Softphone) :
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => handleQuickRoleLogin('emp-maxime', 'tablette')}
                className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-emerald-500 text-left flex items-center gap-2.5 cursor-pointer"
              >
                <Tablet className="w-4 h-4 text-emerald-400 shrink-0" />
                <div>
                  <div className="text-xs font-bold text-white">Tablette Kiosque PIN</div>
                  <div className="text-[11px] text-slate-400">Badgeuse murale &amp; Essai</div>
                </div>
              </button>
              <button
                type="button"
                onClick={() => handleQuickRoleLogin('emp-karim', 'employe')}
                className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-orange-500 text-left flex items-center gap-2.5 cursor-pointer"
              >
                <Smartphone className="w-4 h-4 text-orange-400 shrink-0" />
                <div>
                  <div className="text-xs font-bold text-white">App Mobile Coach/Employé</div>
                  <div className="text-[11px] text-slate-400">Planning, Congés &amp; BPJEPS</div>
                </div>
              </button>
              <button
                type="button"
                onClick={() => handleQuickRoleLogin('emp-maxime', 'telephone')}
                className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-blue-500 text-left flex items-center gap-2.5 cursor-pointer"
              >
                <PhoneCall className="w-4 h-4 text-blue-400 shrink-0" />
                <div>
                  <div className="text-xs font-bold text-white">Softphone WebRTC 04/07</div>
                  <div className="text-[11px] text-slate-400">12 lignes &amp; Rotation 07</div>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Local Credential & PIN Verification Form */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-5">
          <div className="flex items-start justify-between gap-2 border-b border-slate-800 pb-4">
            <div>
              <span
                className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-bold uppercase ${roleMeta.color}`}
              >
                {roleMeta.label}
              </span>
              <h2 className="text-base sm:text-lg font-bold text-white mt-1.5">
                {selectedEmployee.firstName} {selectedEmployee.lastName}
              </h2>
              <p className="text-xs text-slate-400">{selectedEmployee.jobTitle}</p>
            </div>
            <div className="text-right font-mono text-xs">
              <div className="text-slate-400">Club :</div>
              <div className="font-bold text-white">
                {selectedEmployee.clubId === 'carre-de-soie' ? 'Carré de Soie' : 'Beynost'}
              </div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 space-y-1">
            <div className="font-semibold text-white flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              Périmètre d&apos;habilitation RBAC :
            </div>
            <p className="text-slate-400 leading-relaxed">{roleMeta.permissions}</p>
          </div>

          <form onSubmit={handleSubmitLogin} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                Identifiant Local (Base PostgreSQL Carré de Soie)
              </label>
              <input
                type="text"
                readOnly
                value={selectedEmployee.email}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-slate-300"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-semibold text-slate-300 flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-orange-400" />
                  Code PIN 4 chiffres ou Mot de passe local
                </label>
                <span className="font-mono text-[11px] text-orange-400">
                  PIN : {selectedEmployee.pinCode} (ou cfitness2026)
                </span>
              </div>
              <input
                type="password"
                value={secretInput}
                onChange={(e) => {
                  setSecretInput(e.target.value);
                  setErrorFeedback(null);
                }}
                placeholder="Saisir le code PIN (ex: 1010) ou mot de passe"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 focus:border-orange-500 font-mono text-sm text-white tracking-widest"
              />
            </div>

            {/* Numeric Touch Keypad for Tablet / Mobile convenience */}
            <div className="grid grid-cols-6 gap-1.5">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'].map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => handleKeypadDigit(d)}
                  className="py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-mono font-bold text-xs cursor-pointer"
                >
                  {d}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setSecretInput(selectedEmployee.pinCode)}
                className="py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-400 font-mono font-bold text-[11px] cursor-pointer"
                title="Pré-remplir le PIN du profil sélectionné"
              >
                Auto
              </button>
              <button
                type="button"
                onClick={() => setSecretInput('')}
                className="py-2 rounded-lg bg-slate-800 hover:bg-rose-900/60 text-rose-300 font-mono font-bold text-[11px] cursor-pointer"
              >
                Effacer
              </button>
            </div>

            {selectedEmployee.totpEnabled && (
              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Double Authentification Direction (TOTP Local RFC 6238)
                </label>
                <input
                  type="text"
                  value={totpCode}
                  onChange={(e) => setTotpCode(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 font-mono text-emerald-400"
                />
              </div>
            )}

            <div>
              <label className="block font-semibold text-slate-300 mb-1.5">
                Interface à ouvrir après connexion :
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(
                  [
                    { id: 'admin', label: 'Poste Complet (PC/Mac/Tablette)', icon: LayoutDashboard },
                    { id: 'employe', label: 'App Mobile Employé / Coach', icon: Smartphone },
                    { id: 'telephone', label: 'Softphone WebRTC 12 Lignes', icon: PhoneCall },
                    { id: 'tablette', label: 'Kiosque Accueil Badgeuse PIN', icon: Tablet },
                  ] as const
                ).map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setTargetShell(item.id)}
                      className={`p-2.5 rounded-xl border text-left flex items-center gap-2 text-[11px] font-semibold cursor-pointer ${
                        targetShell === item.id
                          ? 'border-orange-500 bg-orange-600/20 text-white'
                          : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-white'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                      <span className="truncate">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {errorFeedback && (
              <div className="p-3 rounded-xl bg-rose-950/90 border border-rose-700 text-rose-200 text-xs flex items-center justify-between gap-2">
                <span className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                  {errorFeedback}
                </span>
                {selectedEmployee.pinLocked && (
                  <button
                    type="button"
                    onClick={() => {
                      unlockEmployeePin(selectedEmployee.id);
                      setErrorFeedback(null);
                    }}
                    className="px-2.5 py-1 rounded bg-emerald-600 text-white font-semibold flex items-center gap-1 shrink-0 cursor-pointer"
                  >
                    <Unlock className="w-3 h-3" />
                    Débloquer PIN
                  </button>
                )}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-sm flex items-center justify-center gap-2 cursor-pointer shadow-lg"
            >
              <Lock className="w-4 h-4" />
              Ouvrir la Session Locale ({selectedEmployee.firstName} {selectedEmployee.lastName})
            </button>
          </form>
        </div>
      </main>

      {/* Bottom Legal & Architecture Footer */}
      <footer className="max-w-6xl w-full mx-auto pt-4 border-t border-slate-900 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-[11px] text-slate-500">
        <div className="flex items-center gap-2">
          <Building2 className="w-3.5 h-3.5 text-orange-500" />
          <span>
            {CFITNESS_LEGAL_IDENTITY.siegeSocial} · {CFITNESS_LEGAL_IDENTITY.etablissementSecondaire}
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-emerald-500 font-medium">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Authentification 100% locale (aucun appel Firebase / Google Cloud externe)</span>
        </div>
      </footer>
    </div>
  );
}
