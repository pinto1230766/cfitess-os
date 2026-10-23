import React, { useState } from 'react';
import { useCfos } from '../../context/CfosContext';
import {
  Wifi,
  WifiOff,
  RefreshCw,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Delete,
  UserPlus,
  Clock,
} from 'lucide-react';
import { ClubId, PointageType } from '../../types/cfos';
import { formatPointageType } from '../../domain/rules';

export function KioskTabletShell() {
  const {
    employees,
    timeEntries,
    offlinePointageQueue,
    kioskOfflineMode,
    punchWithPin,
    toggleKioskOfflineMode,
    createProspect,
    setShellMode,
  } = useCfos();

  const [kioskClub, setKioskClub] = useState<ClubId>('carre-de-soie');
  const [selectedEmpId, setSelectedEmpId] = useState<string>(
    employees.find((e) => e.role !== 'kiosque')?.id || 'emp-maxime'
  );
  const [mode, setMode] = useState<'BADGEUSE_PIN' | 'VISITEUR_ESSAI'>('BADGEUSE_PIN');
  const [pin, setPin] = useState('');
  const [pointageType, setPointageType] = useState<PointageType>('arrivee');
  const [statusMessage, setStatusMessage] = useState<{
    type: 'ok' | 'error';
    text: string;
  } | null>(null);

  // Visitor trial form
  const [vFirstName, setVFirstName] = useState('');
  const [vLastName, setVLastName] = useState('');
  const [vPhone, setVPhone] = useState('');
  const [vGoal, setVGoal] = useState('Séance découverte Musculation & Biocircuit');

  const appendDigit = (d: string) => {
    if (pin.length < 4) setPin((prev) => prev + d);
  };

  const handlePinSubmit = () => {
    const res = punchWithPin(kioskClub, selectedEmpId, pin, pointageType);
    if (!res.ok) {
      setStatusMessage({ type: 'error', text: res.message });
    } else {
      setStatusMessage({ type: 'ok', text: res.message });
      setPin('');
    }
  };

  const handleVisitorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const res = createProspect({
      firstName: vFirstName,
      lastName: vLastName,
      phone: vPhone,
      email: `${vFirstName.toLowerCase()}@visiteur-kiosque.fr`,
      clubId: kioskClub,
      source: 'Tablette accueil',
      goal: vGoal,
      rgpdConsent: true,
    });

    if (!res.ok) {
      setStatusMessage({
        type: 'error',
        text: res.message,
      });
    } else {
      setStatusMessage({
        type: 'ok',
        text: `Bienvenue chez C.Fitness ${vFirstName} ! Votre séance découverte est enregistrée, un coach vient vous accueillir.`,
      });
      setVFirstName('');
      setVLastName('');
      setVPhone('');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col justify-between p-4 sm:p-6">
      {/* Top Kiosk Bar */}
      <header className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShellMode('admin')}
            className="min-h-[44px] px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-orange-400" />
            <span>Quitter Mode Kiosque</span>
          </button>
          <div>
            <div className="text-xs font-bold text-orange-400 uppercase tracking-wider">
              Borne Tactile Murale C.Fitness (§7.3 Shell #3)
            </div>
            <div className="text-sm font-bold">
              Club :{' '}
              {kioskClub === 'carre-de-soie'
                ? 'Carré de Soie (Vaulx-en-Velin)'
                : 'Beynost (ZAC des Baterses)'}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() =>
              setKioskClub(kioskClub === 'carre-de-soie' ? 'beynost' : 'carre-de-soie')
            }
            className="min-h-[44px] px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold cursor-pointer"
          >
            Changer de club ({kioskClub === 'carre-de-soie' ? 'CDS' : 'BEY'})
          </button>

          <button
            onClick={() => toggleKioskOfflineMode(!kioskOfflineMode)}
            className={`min-h-[44px] px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer ${
              kioskOfflineMode
                ? 'bg-amber-600 text-white'
                : 'bg-emerald-900/60 text-emerald-300 border border-emerald-700/50'
            }`}
          >
            {kioskOfflineMode ? (
              <WifiOff className="w-4 h-4" />
            ) : (
              <Wifi className="w-4 h-4" />
            )}
            {kioskOfflineMode ? 'Mode Hors-Ligne (IndexedDB)' : 'Réseau En Ligne'}
          </button>

          {offlinePointageQueue.length > 0 && (
            <button
              onClick={() => {
                toggleKioskOfflineMode(false);
                setStatusMessage({
                  type: 'ok',
                  text: `${offlinePointageQueue.length} pointage(s) hors-ligne re-synchronisés avec succès !`,
                });
              }}
              className="min-h-[44px] px-3 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              Synchroniser ({offlinePointageQueue.length})
            </button>
          )}
        </div>
      </header>

      {/* Mode Switcher */}
      <div className="my-4 flex justify-center gap-3">
        <button
          onClick={() => {
            setMode('BADGEUSE_PIN');
            setStatusMessage(null);
          }}
          className={`min-h-[48px] px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 cursor-pointer ${
            mode === 'BADGEUSE_PIN'
              ? 'bg-orange-600 text-white'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
        >
          <Clock className="w-4 h-4" />
          Badgeuse Salariés &amp; Coachs (PIN)
        </button>
        <button
          onClick={() => {
            setMode('VISITEUR_ESSAI');
            setStatusMessage(null);
          }}
          className={`min-h-[48px] px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 cursor-pointer ${
            mode === 'VISITEUR_ESSAI'
              ? 'bg-orange-600 text-white'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
        >
          <UserPlus className="w-4 h-4" />
          Borne Accueil Visiteur / Séance d&apos;Essai
        </button>
      </div>

      {/* Main Kiosk Center */}
      <main className="flex-1 flex items-center justify-center">
        {mode === 'BADGEUSE_PIN' ? (
          <div className="w-full max-w-2xl grid grid-cols-1 md:grid-cols-12 gap-6 bg-slate-800/90 border border-slate-700 rounded-3xl p-6">
            {/* Left: Collaborator & Action Type */}
            <div className="md:col-span-5 flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="text-xs font-bold uppercase text-slate-400">
                  1. Sélectionner votre nom
                </div>
                <select
                  value={selectedEmpId}
                  onChange={(e) => {
                    setSelectedEmpId(e.target.value);
                    setStatusMessage(null);
                  }}
                  className="w-full min-h-[46px] px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-bold"
                >
                  {employees
                    .filter((e) => e.role !== 'kiosque')
                    .map((e) => (
                      <option key={e.id} value={e.id}>
                        {e.firstName} {e.lastName} (PIN démo : {e.pinCode})
                      </option>
                    ))}
                </select>
              </div>

              <div className="space-y-2">
                <div className="text-xs font-bold uppercase text-slate-400">
                  2. Choisir le type de pointage
                </div>
                {(
                  [
                    { id: 'arrivee', label: 'Arrivée prise de poste' },
                    { id: 'debut_pause', label: 'Début de pause' },
                    { id: 'fin_pause', label: 'Fin de pause' },
                    { id: 'depart', label: 'Départ fin de service' },
                  ] as const
                ).map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setPointageType(item.id)}
                    className={`w-full min-h-[46px] px-3.5 py-2 rounded-xl text-left text-xs font-bold transition-colors cursor-pointer ${
                      pointageType === item.id
                        ? 'bg-orange-600 text-white'
                        : 'bg-slate-900/70 text-slate-300 hover:bg-slate-900'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Right: Tactile 4-Digit Keypad */}
            <div className="md:col-span-7 flex flex-col justify-between space-y-4">
              <div>
                <div className="text-xs font-bold uppercase text-slate-400 mb-2">
                  3. Composer votre code PIN (4 chiffres)
                </div>
                <div className="h-14 rounded-2xl bg-slate-950 border border-slate-700 flex items-center justify-center font-mono text-2xl tracking-[0.6em] text-orange-400">
                  {pin.padEnd(4, '•')}
                </div>
              </div>

              {statusMessage && (
                <div
                  className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                    statusMessage.type === 'ok'
                      ? 'bg-emerald-950/90 border border-emerald-700 text-emerald-200'
                      : 'bg-rose-950/90 border border-rose-700 text-rose-200'
                  }`}
                >
                  {statusMessage.type === 'ok' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                  )}
                  <span>{statusMessage.text}</span>
                </div>
              )}

              <div className="grid grid-cols-3 gap-2.5">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                  <button
                    key={digit}
                    onClick={() => appendDigit(digit)}
                    className="h-14 rounded-2xl bg-slate-900 hover:bg-slate-700 active:scale-95 text-lg font-mono font-bold transition-transform cursor-pointer"
                  >
                    {digit}
                  </button>
                ))}
                <button
                  onClick={() => setPin('')}
                  className="h-14 rounded-2xl bg-slate-900 hover:bg-rose-900/50 text-xs font-bold text-rose-300 flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Delete className="w-4 h-4" />
                  Effacer
                </button>
                <button
                  onClick={() => appendDigit('0')}
                  className="h-14 rounded-2xl bg-slate-900 hover:bg-slate-700 active:scale-95 text-lg font-mono font-bold transition-transform cursor-pointer"
                >
                  0
                </button>
                <button
                  onClick={handlePinSubmit}
                  className="h-14 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-xs sm:text-sm font-bold text-white cursor-pointer"
                >
                  VALIDER
                </button>
              </div>
            </div>
          </div>
        ) : (
          <form
            onSubmit={handleVisitorSubmit}
            className="w-full max-w-lg bg-slate-800/90 border border-slate-700 rounded-3xl p-6 space-y-4"
          >
            <div>
              <h2 className="text-lg font-bold text-white">
                Bienvenue chez C.Fitness{' '}
                {kioskClub === 'carre-de-soie' ? 'Carré de Soie' : 'Beynost'} !
              </h2>
              <p className="text-xs text-slate-300 mt-0.5">
                Enregistrez-vous en 15 secondes pour votre séance d&apos;essai ou votre rendez-vous découverte.
              </p>
            </div>

            {statusMessage && (
              <div className="p-3.5 rounded-xl bg-emerald-950 border border-emerald-700 text-xs text-emerald-200 font-semibold">
                {statusMessage.text}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Prénom *</label>
                <input
                  type="text"
                  required
                  value={vFirstName}
                  onChange={(e) => setVFirstName(e.target.value)}
                  placeholder="Votre prénom"
                  className="w-full px-3.5 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Nom *</label>
                <input
                  type="text"
                  required
                  value={vLastName}
                  onChange={(e) => setVLastName(e.target.value)}
                  placeholder="Votre nom"
                  className="w-full px-3.5 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white"
                />
              </div>
            </div>

            <div className="text-xs">
              <label className="block font-semibold text-slate-300 mb-1">
                Téléphone mobile (06 / 07) *
              </label>
              <input
                type="text"
                required
                value={vPhone}
                onChange={(e) => setVPhone(e.target.value)}
                placeholder="06 12 34 56 78"
                className="w-full px-3.5 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono"
              />
            </div>

            <div className="text-xs">
              <label className="block font-semibold text-slate-300 mb-1">
                Votre objectif aujourd&apos;hui
              </label>
              <select
                value={vGoal}
                onChange={(e) => setVGoal(e.target.value)}
                className="w-full px-3.5 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white"
              >
                <option value="Séance découverte Musculation & Biocircuit">
                  Séance découverte Musculation &amp; Biocircuit Technogym
                </option>
                <option value="Cours Collectifs & Cardio">Cours Collectifs &amp; Cardio</option>
                <option value="Bilan InBody & Coaching personnalisé">
                  Bilan InBody &amp; Coaching personnalisé
                </option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full min-h-[52px] rounded-2xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-sm cursor-pointer"
            >
              Valider mon arrivée à l&apos;accueil
            </button>
          </form>
        )}
      </main>

      {/* Footer Recent Pointages */}
      <footer className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
        <div>
          Derniers pointages enregistrés :{' '}
          {timeEntries.slice(0, 3).map((p) => {
            const emp = employees.find((e) => e.id === p.employeeId);
            return (
              <span key={p.id} className="mr-3 text-slate-300">
                {emp ? `${emp.firstName} ${emp.lastName}` : p.employeeId} (
                {formatPointageType(p.type)})
              </span>
            );
          })}
        </div>
        <div className="font-mono text-[11px]">Kiosque C.Fitness OS v1.0 · Auto-Reset 3s</div>
      </footer>
    </div>
  );
}
