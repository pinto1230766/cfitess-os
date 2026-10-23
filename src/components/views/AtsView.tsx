import React, { useState } from 'react';
import { useCfos } from '../../context/CfosContext';
import {
  UserCheck,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Mail,
  FileText,
  ShieldCheck,
  Send,
  Eye,
} from 'lucide-react';
import { CandidateStage } from '../../types/cfos';
import { CFITNESS_LEGAL_IDENTITY, formatClubName } from '../../domain/rules';
import { ContractPreviewModal } from '../ContractPreviewModal';

const KANBAN_COLUMNS: { stage: CandidateStage; title: string; subtitle: string }[] = [
  {
    stage: 'Reçue',
    title: '1. Reçue',
    subtitle: 'Ingestion auto recrutement@c.fitness + Accusé RGPD',
  },
  {
    stage: 'Examen dirigeants',
    title: '2. Examen Dirigeants (Mario / Daniel)',
    subtitle: 'Revue CV PDF & adéquation 3S',
  },
  {
    stage: 'Entretien club',
    title: '3. Entretien Club',
    subtitle: 'Carré de Soie ou Beynost (Jeu de rôle)',
  },
  {
    stage: 'Retenu',
    title: '4. Retenu (Onboarding 1-Clic)',
    subtitle: 'Génération auto Contrat CDI C.FITNESS',
  },
];

export function AtsView() {
  const {
    clubFilter,
    candidates,
    hrDocuments,
    moveCandidateStage,
    ingestEmailCandidate,
    runCandidateOnboarding,
  } = useCfos();

  const [simulateRollback, setSimulateRollback] = useState(false);
  const [transactionBanner, setTransactionBanner] = useState<{
    type: 'ok' | 'error';
    title: string;
    details: string;
    contractText?: string;
  } | null>(null);

  const [senderLine, setSenderLine] = useState('Lucas Garnier <lucas.garnier@mail.fr>');
  const [subjectLine, setSubjectLine] = useState(
    'Candidature Conseiller Commercial Fitness - C.Fitness Carré de Soie'
  );
  const [bodyText, setBodyText] = useState(
    'Bonjour Mario et Daniel, je vous adresse ma candidature via la page recrutement c.fitness. Téléphone : 06 58 41 29 70. Expérience de 2 ans en développement commercial fitness.'
  );
  const [attachmentPdf, setAttachmentPdf] = useState('CV_Lucas_Garnier_Commercial_2026.pdf');
  const [lastRgpdAck, setLastRgpdAck] = useState<string | null>(null);
  const [previewContractText, setPreviewContractText] = useState<string | null>(null);

  const filteredCandidates =
    clubFilter === 'all' ? candidates : candidates.filter((c) => c.clubId === clubFilter);

  const handleHireOrRetenu = (candidateId: string) => {
    const res = runCandidateOnboarding({
      candidateId,
      firstShiftDate: '2026-10-26',
      firstShiftStart: '09:00',
      firstShiftEnd: '17:00',
      hourlyRate: CFITNESS_LEGAL_IDENTITY.tauxHoraireBrutEur,
      weeklyHours: CFITNESS_LEGAL_IDENTITY.tempsTravailHebdo,
      simulateMidWayFailure: simulateRollback,
    });

    if (!res.ok) {
      setTransactionBanner({
        type: 'error',
        title: 'Test Phase 6 Validé : Rollback Atomique Exécuté',
        details: res.error || 'Transaction annulée.',
      });
    } else if (res.newEmployee && res.newShift) {
      const generatedContract = res.newDocuments?.find((d) => d.category === 'Contrat');
      setTransactionBanner({
        type: 'ok',
        title: `Onboarding 1-Clic réussi : Contrat CDI C.FITNESS généré pour ${res.newEmployee.firstName} ${res.newEmployee.lastName} !`,
        details: `Contrat CDI Temps Complet (35h / 151,67h · ${CFITNESS_LEGAL_IDENTITY.salaireBrutMensuelEur.toLocaleString('fr-FR')} € brut · IDCC 2511 Gr. 1 · Objectif 20 abonnements/mois · Clause CRM opposable) déposé dans le coffre-fort RH · Code PIN Kiosque : ${res.newEmployee.pinCode}.`,
        contractText: generatedContract?.contractBodyText,
      });
      if (generatedContract?.contractBodyText) {
        setPreviewContractText(generatedContract.contractBodyText);
      }
    }
  };

  const handleStageChange = (candidateId: string, nextStage: CandidateStage) => {
    const autoRes = moveCandidateStage(candidateId, nextStage);
    if (autoRes && autoRes.ok && autoRes.newEmployee) {
      const generatedContract = autoRes.newDocuments?.find((d) => d.category === 'Contrat');
      setTransactionBanner({
        type: 'ok',
        title: `Passage sur « Retenu » : Contrat CDI C.FITNESS pré-rempli généré automatiquement !`,
        details: `Salarié ${autoRes.newEmployee.firstName} ${autoRes.newEmployee.lastName} créé (SIRET ${CFITNESS_LEGAL_IDENTITY.siret} · 1 823,03 € brut · PIN ${autoRes.newEmployee.pinCode}).`,
        contractText: generatedContract?.contractBodyText,
      });
      if (generatedContract?.contractBodyText) {
        setPreviewContractText(generatedContract.contractBodyText);
      }
    }
  };

  const handleIngestEmail = (e: React.FormEvent) => {
    e.preventDefault();
    const { rgpdReply } = ingestEmailCandidate({
      senderLine,
      subjectLine,
      bodyText,
      attachmentPdf,
    });
    setLastRgpdAck(rgpdReply);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-orange-600">
            Module M6 (v1.2) · Flux Recrutement Officiel recrutement@c.fitness &amp; Onboarding 1-Clic
          </div>
          <h1 className="text-lg sm:text-xl font-bold text-slate-900 mt-1">
            Ingestion Email Automatique, Kanban Dirigeants (Mario / Daniel) &amp; Contrat CDI Auto
          </h1>
          <p className="text-xs text-slate-600 mt-1">
            Canal d&apos;entrée officiel : <span className="font-mono font-bold text-slate-900">recrutement@c.fitness</span> (page recrutement du site web c.fitness) · Parsing Nom, Prénom, Tél, Email &amp; CV PDF · Accusé RGPD automatique
          </p>
        </div>

        <label className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-slate-100 border border-slate-200 text-xs font-medium text-slate-700 cursor-pointer shrink-0">
          <input
            type="checkbox"
            checked={simulateRollback}
            onChange={(e) => setSimulateRollback(e.target.checked)}
          />
          <span>Simuler panne Phase 6 (Test Rollback Atomique)</span>
        </label>
      </div>

      {transactionBanner && (
        <div
          className={`p-4 rounded-xl border text-xs space-y-2 ${
            transactionBanner.type === 'error'
              ? 'bg-amber-50 border-amber-300 text-amber-950'
              : 'bg-emerald-50 border-emerald-300 text-emerald-950'
          }`}
        >
          <div className="font-bold flex items-center justify-between gap-2">
            <span className="flex items-center gap-2">
              {transactionBanner.type === 'error' ? (
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              )}
              {transactionBanner.title}
            </span>
            <div className="flex items-center gap-3 shrink-0">
              {transactionBanner.contractText && (
                <button
                  onClick={() => setPreviewContractText(transactionBanner.contractText!)}
                  className="px-2.5 py-1 rounded bg-emerald-700 text-white font-semibold cursor-pointer"
                >
                  Afficher le Contrat CDI généré
                </button>
              )}
              <button
                onClick={() => setTransactionBanner(null)}
                className="underline cursor-pointer"
              >
                Fermer
              </button>
            </div>
          </div>
          <p>{transactionBanner.details}</p>
        </div>
      )}

      {/* Official Email Ingestion Simulator: recrutement@c.fitness */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Mail className="w-4 h-4 text-orange-600" />
              Connecteur IMAP/Webhook : <span className="font-mono text-orange-600">recrutement@c.fitness</span>
            </h2>
            <p className="text-xs text-slate-500">
              Simulez la réception d&apos;une candidature envoyée depuis la page recrutement du site <span className="font-semibold">c.fitness</span> avec extraction automatique du CV en PDF et envoi immédiat de l&apos;accusé RGPD.
            </p>
          </div>
          <span className="text-xs font-mono font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-lg">
            Écoute active : recrutement@c.fitness
          </span>
        </div>

        <form onSubmit={handleIngestEmail} className="grid grid-cols-1 lg:grid-cols-12 gap-3 text-xs">
          <div className="lg:col-span-4 space-y-2">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Expéditeur (Prénom Nom &lt;Email&gt;)
              </label>
              <input
                type="text"
                value={senderLine}
                onChange={(e) => setSenderLine(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 font-mono text-[11px]"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Pièce jointe détectée (CV PDF)
              </label>
              <input
                type="text"
                value={attachmentPdf}
                onChange={(e) => setAttachmentPdf(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 font-mono text-[11px]"
              />
            </div>
          </div>

          <div className="lg:col-span-5 space-y-2">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Objet du mail</label>
              <input
                type="text"
                value={subjectLine}
                onChange={(e) => setSubjectLine(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Corps du message (avec téléphone mobile)
              </label>
              <input
                type="text"
                value={bodyText}
                onChange={(e) => setBodyText(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200"
              />
            </div>
          </div>

          <div className="lg:col-span-3 flex flex-col justify-end">
            <button
              type="submit"
              className="w-full py-2.5 px-4 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Send className="w-4 h-4" />
              Ingérer depuis recrutement@c.fitness
            </button>
          </div>
        </form>

        {lastRgpdAck && (
          <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700 flex items-start justify-between gap-3">
            <div>
              <span className="font-bold text-emerald-700">Accusé de réception RGPD envoyé : </span>
              {lastRgpdAck}
            </div>
            <button
              onClick={() => setLastRgpdAck(null)}
              className="text-slate-400 hover:text-slate-700 underline shrink-0 cursor-pointer"
            >
              Fermer
            </button>
          </div>
        )}
      </div>

      {/* 4-Column ATS Kanban: [Reçue] -> [Examen Dirigeants (Mario / Daniel)] -> [Entretien Club] -> [Retenu] */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {KANBAN_COLUMNS.map((col) => {
          const colCandidates = filteredCandidates.filter((c) => c.stage === col.stage);
          return (
            <div
              key={col.stage}
              className="bg-slate-100/80 border border-slate-200 rounded-xl p-3.5 flex flex-col space-y-3"
            >
              <div className="pb-2.5 border-b border-slate-200/80 flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-xs font-bold text-slate-900">{col.title}</h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">{col.subtitle}</p>
                </div>
                <span className="px-2 py-0.5 rounded bg-white border border-slate-200 text-xs font-mono font-bold text-slate-800">
                  {colCandidates.length}
                </span>
              </div>

              <div className="space-y-3">
                {colCandidates.map((cand) => {
                  const empContract = hrDocuments.find(
                    (d) =>
                      d.employeeId === cand.onboardedEmployeeId &&
                      d.category === 'Contrat' &&
                      d.contractBodyText
                  );
                  return (
                    <div
                      key={cand.id}
                      className="bg-white border border-slate-200 rounded-xl p-4 space-y-3 shadow-2xs"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="text-[10px] font-mono font-semibold text-orange-600">
                            {cand.sourceChannel} · {formatClubName(cand.clubId, true)}
                          </div>
                          <h4 className="text-sm font-bold text-slate-900 mt-0.5">
                            {cand.firstName} {cand.lastName}
                          </h4>
                          <div className="text-[11px] font-medium text-slate-600">
                            Cible : {cand.roleTarget} ({cand.contractTarget} 35h)
                          </div>
                        </div>
                      </div>

                      <div className="text-[11px] font-mono text-slate-700 space-y-1">
                        <div>{cand.phone}</div>
                        <div className="truncate">{cand.email}</div>
                      </div>

                      {cand.cvPdfFileName && (
                        <div className="px-2.5 py-1.5 rounded bg-slate-50 border border-slate-200 flex items-center justify-between text-[11px]">
                          <span className="font-mono text-slate-800 flex items-center gap-1.5 truncate">
                            <FileText className="w-3.5 h-3.5 text-orange-600 shrink-0" />
                            <span className="truncate">{cand.cvPdfFileName}</span>
                          </span>
                          <span className="text-[10px] font-semibold text-emerald-700 shrink-0 ml-1">
                            PDF OK
                          </span>
                        </div>
                      )}

                      {cand.rgpdAckSentAt && (
                        <div className="text-[10px] text-emerald-700 font-medium">
                          ✓ Accusé RGPD envoyé ({cand.rgpdAckSentAt})
                        </div>
                      )}

                      <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/80 text-[11px] text-slate-600">
                        <div className="font-semibold text-slate-800 flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-orange-600" />
                          Parsing &amp; Aide à la décision :
                        </div>
                        <p className="mt-1 leading-snug">{cand.aiDecisionSupportNote}</p>
                      </div>

                      <div className="pt-2 border-t border-slate-100 space-y-2">
                        <label className="block text-[10px] font-semibold uppercase text-slate-400">
                          Déplacer vers l&apos;étape :
                        </label>
                        <select
                          value={cand.stage}
                          onChange={(e) =>
                            handleStageChange(cand.id, e.target.value as CandidateStage)
                          }
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold bg-slate-50 text-slate-800"
                        >
                          <option value="Reçue">1. Reçue</option>
                          <option value="Examen dirigeants">
                            2. Examen Dirigeants (Mario / Daniel)
                          </option>
                          <option value="Entretien club">3. Entretien Club</option>
                          <option value="Retenu">4. Retenu (Génère Contrat CDI)</option>
                        </select>

                        {cand.onboardedEmployeeId ? (
                          <div className="space-y-1.5">
                            <div className="text-[11px] font-bold text-emerald-700 flex items-center gap-1">
                              <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                              Contrat CDI généré &amp; salarié créé
                            </div>
                            {empContract?.contractBodyText && (
                              <button
                                onClick={() => setPreviewContractText(empContract.contractBodyText!)}
                                className="w-full py-1.5 px-2.5 rounded-lg border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 text-[11px] font-semibold flex items-center justify-center gap-1 cursor-pointer"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                Voir Contrat CDI C.FITNESS
                              </button>
                            )}
                          </div>
                        ) : (
                          <button
                            onClick={() => handleHireOrRetenu(cand.id)}
                            className="w-full py-2 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <UserCheck className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                            Passer Retenu &amp; Générer CDI 1-Clic
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Shared Modal Preview for Official C.FITNESS CDI Contract */}
      <ContractPreviewModal
        contractText={previewContractText}
        onClose={() => setPreviewContractText(null)}
      />
    </div>
  );
}
