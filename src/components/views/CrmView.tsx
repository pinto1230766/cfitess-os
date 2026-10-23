import React, { useState } from 'react';
import { useCfos } from '../../context/CfosContext';
import {
  UserPlus,
  CheckCircle2,
  AlertTriangle,
  Search,
  ShieldAlert,
  Send,
} from 'lucide-react';
import { ClubId, Prospect, ProspectStage } from '../../types/cfos';

const STAGES: ProspectStage[] = [
  'Nouveau',
  'Contacté',
  'Séance planifiée',
  'Venu',
  'Adhérent',
  'Perdu',
];

export function CrmView() {
  const {
    clubFilter,
    prospects,
    updateProspectStage,
    createProspect,
    sendValidatedProspectSms,
    toggleProspectStopSms,
  } = useCfos();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStageFilter, setSelectedStageFilter] = useState<ProspectStage | 'ALL'>('ALL');
  const [showNewModal, setShowNewModal] = useState(false);
  const [feedbackBanner, setFeedbackBanner] = useState<{
    type: 'ok' | 'warn';
    text: string;
  } | null>(null);

  // New Prospect Form
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [clubId, setClubId] = useState<ClubId>(
    clubFilter === 'beynost' ? 'beynost' : 'carre-de-soie'
  );
  const [source, setSource] = useState<Prospect['source']>('Tablette accueil');
  const [goal, setGoal] = useState('Remise en forme & Biocircuit Technogym');
  const [rgpdConsent, setRgpdConsent] = useState(true);

  const filteredProspects = prospects.filter((p) => {
    if (clubFilter !== 'all' && p.clubId !== clubFilter) return false;
    if (selectedStageFilter !== 'ALL' && p.stage !== selectedStageFilter) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.firstName.toLowerCase().includes(q) ||
      p.lastName.toLowerCase().includes(q) ||
      p.phone.toLowerCase().includes(q) ||
      p.email.toLowerCase().includes(q)
    );
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const res = createProspect({
      firstName,
      lastName,
      phone,
      email: email || 'contact@prospect-cfitness.fr',
      clubId,
      source,
      goal,
      rgpdConsent,
    });

    if (!res.ok) {
      setFeedbackBanner({
        type: 'warn',
        text: res.message,
      });
    } else {
      setFeedbackBanner({
        type: 'ok',
        text: res.message,
      });
      setFirstName('');
      setLastName('');
      setPhone('');
      setEmail('');
      setShowNewModal(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-orange-600">
            Module M3 · Pipeline Commercial &amp; Conformité Bloctel / RGPD
          </div>
          <h1 className="text-lg sm:text-xl font-bold text-slate-900 mt-1">
            CRM Prospects, Séances d&apos;Essai &amp; Relances Automatisées
          </h1>
          <p className="text-xs text-slate-600 mt-1">
            Détection automatique des doublons téléphone/email · Respect strict du STOP SMS et de la liste Bloctel · Brouillons SMS validés humainement
          </p>
        </div>

        <button
          onClick={() => setShowNewModal(true)}
          className="px-4 py-2.5 rounded-lg bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold flex items-center gap-2 shrink-0 cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          Nouveau Prospect / Essai
        </button>
      </div>

      {feedbackBanner && (
        <div
          className={`p-4 rounded-xl border text-xs font-medium flex items-center justify-between gap-3 ${
            feedbackBanner.type === 'warn'
              ? 'bg-amber-50 border-amber-300 text-amber-900'
              : 'bg-emerald-50 border-emerald-300 text-emerald-900'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedbackBanner.type === 'warn' ? (
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            )}
            <span>{feedbackBanner.text}</span>
          </div>
          <button
            onClick={() => setFeedbackBanner(null)}
            className="text-xs underline cursor-pointer shrink-0"
          >
            Fermer
          </button>
        </div>
      )}

      {/* Stage Counters + Search */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setSelectedStageFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
              selectedStageFilter === 'ALL'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Tous (
            {prospects.filter((p) => clubFilter === 'all' || p.clubId === clubFilter).length})
          </button>
          {STAGES.map((st) => {
            const count = prospects.filter(
              (p) => (clubFilter === 'all' || p.clubId === clubFilter) && p.stage === st
            ).length;
            return (
              <button
                key={st}
                onClick={() => setSelectedStageFilter(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                  selectedStageFilter === st
                    ? 'bg-orange-600 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {st} ({count})
              </button>
            );
          })}
        </div>

        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher par nom, prénom, téléphone (06/07) ou email..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 text-xs focus:outline-none focus:border-orange-500"
          />
        </div>
      </div>

      {/* Prospects Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredProspects.map((prospect) => (
          <div
            key={prospect.id}
            className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="text-[11px] font-semibold text-slate-500">
                    Club {prospect.clubId === 'carre-de-soie' ? 'Carré de Soie' : 'Beynost'} ·{' '}
                    {prospect.source}
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mt-0.5">
                    {prospect.firstName} {prospect.lastName}
                  </h3>
                </div>
                <span className="text-xs font-bold text-orange-600">
                  {prospect.stage}
                </span>
              </div>

              <div className="mt-2 text-xs text-slate-600 space-y-1">
                <div className="font-mono text-slate-800">
                  {prospect.phone} · {prospect.email}
                </div>
                <div>
                  <span className="font-semibold text-slate-800">Objectif :</span> {prospect.goal}
                </div>
                {prospect.trialDate && (
                  <div className="text-emerald-700 font-medium">
                    Séance d&apos;essai : {prospect.trialDate}
                  </div>
                )}
                <div className="text-slate-500 italic">« {prospect.notes} »</div>
              </div>

              {prospect.pendingSmsDraft && (
                <div className="mt-3 p-3 rounded-lg bg-orange-50/70 border border-orange-200 space-y-2 text-xs">
                  <div className="font-semibold text-slate-900">
                    Brouillon SMS en attente de validation :
                  </div>
                  <p className="font-mono text-[11px] text-slate-700">
                    {prospect.pendingSmsDraft}
                  </p>
                  <button
                    onClick={() =>
                      sendValidatedProspectSms(prospect.id, prospect.pendingSmsDraft!)
                    }
                    className="w-full py-1.5 px-3 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Valider &amp; Envoyer ce SMS
                  </button>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 space-y-3">
              {/* Stage Progression Selector */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                  Étape du pipeline :
                </label>
                <select
                  value={prospect.stage}
                  onChange={(e) =>
                    updateProspectStage(prospect.id, e.target.value as ProspectStage)
                  }
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-800 bg-slate-50 focus:outline-none focus:border-orange-500"
                >
                  {STAGES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              {/* Bloctel / STOP SMS Guard */}
              <div className="flex items-center justify-between text-[11px] pt-1">
                <div className="text-slate-500">
                  {prospect.smsStopOptOut ? (
                    <span className="text-rose-600 font-semibold flex items-center gap-1">
                      <ShieldAlert className="w-3.5 h-3.5" />
                      STOP SMS actif (Bloqué)
                    </span>
                  ) : prospect.bloctelListed ? (
                    <span className="text-amber-700 font-semibold">
                      Inscrit liste Bloctel
                    </span>
                  ) : (
                    <span className="text-emerald-700 font-medium">
                      Opt-in RGPD actif · Non inscrit Bloctel
                    </span>
                  )}
                </div>
                <button
                  onClick={() => toggleProspectStopSms(prospect.id)}
                  className="text-slate-600 hover:text-slate-900 underline cursor-pointer"
                >
                  {prospect.smsStopOptOut ? 'Réactiver Opt-in' : 'Simuler STOP SMS'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal New Prospect */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateSubmit}
            className="bg-white rounded-xl max-w-lg w-full p-5 border border-slate-200 shadow-lg space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                Ajouter un Prospect (avec contrôle anti-doublon)
              </h3>
              <button
                type="button"
                onClick={() => setShowNewModal(false)}
                className="text-xs text-slate-500 hover:text-slate-800 cursor-pointer"
              >
                Fermer
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Prénom *</label>
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Ex: Camille"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nom *</label>
                <input
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Ex: Garnier"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Téléphone *
                </label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="06 45 78 12 30"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 font-mono"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="camille@email.fr"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Club C.Fitness</label>
                <select
                  value={clubId}
                  onChange={(e) => setClubId(e.target.value as ClubId)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
                >
                  <option value="carre-de-soie">Carré de Soie (Vaulx-en-Velin)</option>
                  <option value="beynost">Beynost (ZAC des Baterses)</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Source d&apos;acquisition
                </label>
                <select
                  value={source}
                  onChange={(e) => setSource(e.target.value as Prospect['source'])}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
                >
                  <option value="Tablette accueil">Tablette accueil</option>
                  <option value="Site c.fitness">Site c.fitness</option>
                  <option value="Appel entrant">Appel entrant</option>
                  <option value="Parrainage">Parrainage</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Objectif sportif / Motivation
              </label>
              <input
                type="text"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs"
              />
            </div>

            <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={rgpdConsent}
                onChange={(e) => setRgpdConsent(e.target.checked)}
              />
              <span>Consentement explicite RGPD recueilli (SMS &amp; appels C.Fitness)</span>
            </label>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowNewModal(false)}
                className="px-4 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold cursor-pointer"
              >
                Enregistrer le prospect
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
