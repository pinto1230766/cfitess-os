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
  Briefcase,
  Plus,
  Star,
  FileSignature,
  Download,
  Lock,
} from 'lucide-react';
import { CandidateStage, ClubId, ContractType, HRDocument } from '../../types/cfos';
import { CFITNESS_LEGAL_IDENTITY, formatClubName } from '../../domain/rules';
import { ContractPreviewModal } from '../ContractPreviewModal';

const KANBAN_COLUMNS: {
  stage: CandidateStage;
  title: string;
  subtitle: string;
  accent: string;
}[] = [
  {
    stage: 'Reçue',
    title: '1. Candidatures Reçues',
    subtitle: 'Ingestion auto recrutement@c.fitness + Accusé RGPD',
    accent: 'border-t-4 border-t-sky-500',
  },
  {
    stage: 'Examen dirigeants',
    title: '2. Présélection Dirigeants',
    subtitle: 'Mario & Daniel Carvalho · Scoring CV PDF',
    accent: 'border-t-4 border-t-indigo-600',
  },
  {
    stage: 'Entretien club',
    title: '3. Entretien en Club',
    subtitle: 'Carré de Soie ou Beynost (Mise en situation)',
    accent: 'border-t-4 border-t-amber-500',
  },
  {
    stage: 'Retenu',
    title: '4. Embauché (Signature Interne 0 €)',
    subtitle: 'Génération auto Contrat CDI 1 823,03 € + Preuve SHA-256',
    accent: 'border-t-4 border-t-emerald-600',
  },
];

function getJobBoardBadgeStyle(channel: string): string {
  const lower = channel.toLowerCase();
  if (lower.includes('indeed')) return 'bg-[#003A9B] text-white';
  if (lower.includes('wttj') || lower.includes('welcome'))
    return 'bg-[#FFCD00] text-slate-950 font-black';
  if (lower.includes('linkedin')) return 'bg-[#0A66C2] text-white';
  if (lower.includes('france travail')) return 'bg-[#1E3A8A] text-white';
  return 'bg-orange-600 text-white';
}

export function AtsView() {
  const {
    clubFilter,
    candidates,
    jobOffers,
    hrDocuments,
    signDocumentWithInternalProof,
    moveCandidateStage,
    ingestEmailCandidate,
    createJobOffer,
    runCandidateOnboarding,
  } = useCfos();

  const [atsMode, setAtsMode] = useState<'FLATCHR_KANBAN' | 'YOUSIGN_PARAPHEUR'>('FLATCHR_KANBAN');
  const [otpInputByDoc, setOtpInputByDoc] = useState<Record<string, string>>({});
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

  // Multiposting Job Offer Form (Style Flatchr / Workable)
  const [offerTitle, setOfferTitle] = useState('Conseiller Commercial Fitness (H/F) - 35h');
  const [offerClub, setOfferClub] = useState<ClubId>('carre-de-soie');
  const [offerContract, setOfferContract] = useState<ContractType>('CDI');

  const filteredCandidates =
    clubFilter === 'all' ? candidates : candidates.filter((c) => c.clubId === clubFilter);
  const filteredOffers =
    clubFilter === 'all' ? jobOffers : jobOffers.filter((o) => o.clubId === clubFilter);

  const contractDocs = hrDocuments.filter(
    (d) => d.category === 'Contrat' || d.category === 'Avenant'
  );

  const handleDownloadProofJson = (doc: HRDocument) => {
    if (!doc.signatureProof) return;
    const blob = new Blob([JSON.stringify(doc.signatureProof, null, 2)], {
      type: 'application/json;charset=utf-8;',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `preuve-signature-cfitness-${doc.signatureProof.proofId}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCreateOffer = (e: React.FormEvent) => {
    e.preventDefault();
    createJobOffer({
      title: offerTitle,
      clubId: offerClub,
      contractType: offerContract,
      weeklyHours: 35,
      hourlyRate: CFITNESS_LEGAL_IDENTITY.tauxHoraireBrutEur,
      channels: ['Site Web c.fitness', 'Indeed', 'France Travail', 'Welcome to the Jungle'],
    });
    setTransactionBanner({
      type: 'ok',
      title: `Offre d'emploi multipostée via Flatchr : ${offerTitle}`,
      details: `Diffusée simultanément sur Indeed, Welcome to the Jungle, France Travail et Site Web c.fitness (${formatClubName(
        offerClub
      )}).`,
    });
  };

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
        title: `Onboarding 1-Clic réussi : Contrat CDI C.FITNESS généré dans le Parapheur Interne (0 € / signature) pour ${res.newEmployee.firstName} ${res.newEmployee.lastName} !`,
        details: `Contrat CDI Temps Complet (35h / 151,67h · ${CFITNESS_LEGAL_IDENTITY.salaireBrutMensuelEur.toLocaleString(
          'fr-FR'
        )} € brut · IDCC 2511 Gr. 1 · Objectif 20 abonnements/mois · Clause CRM opposable) prêt à signer depuis l'espace personnel « Ma Journée » · Code PIN Kiosque : ${
          res.newEmployee.pinCode
        }.`,
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
    <div className="space-y-5">
      <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-2xs bg-white">
        {/* Clean Unified C.Fitness OS Header */}
        <div className="bg-slate-900 text-white px-5 py-4 flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4">
            <div>
              <div className="text-xs font-semibold text-orange-400">
                07. Recrutement &amp; Contrats RH
              </div>
              <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white mt-0.5">
                Candidatures, Embauche 1-Clic &amp; Signature Électronique (0 €)
              </h1>
            </div>

            {/* Mode Switcher */}
            <div className="flex items-center gap-1.5 bg-slate-800 p-1 rounded-xl text-xs border border-slate-700">
              <button
                onClick={() => setAtsMode('FLATCHR_KANBAN')}
                className={`px-3.5 py-2 rounded-lg font-semibold flex items-center gap-2 cursor-pointer transition-colors ${
                  atsMode === 'FLATCHR_KANBAN'
                    ? 'bg-orange-600 text-white'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <Briefcase className="w-4 h-4" />
                <span>1. Suivi des Candidats ({filteredCandidates.length})</span>
              </button>
              <button
                onClick={() => setAtsMode('YOUSIGN_PARAPHEUR')}
                className={`px-3.5 py-2 rounded-lg font-semibold flex items-center gap-2 cursor-pointer transition-colors ${
                  atsMode === 'YOUSIGN_PARAPHEUR'
                    ? 'bg-orange-600 text-white'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <FileSignature className="w-4 h-4" />
                <span>2. Contrats à Signer ({contractDocs.length})</span>
              </button>
            </div>
          </div>

          <label className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-300 cursor-pointer shrink-0">
            <input
              type="checkbox"
              checked={simulateRollback}
              onChange={(e) => setSimulateRollback(e.target.checked)}
            />
            <span>Mode test sécurité transactionnelle</span>
          </label>
        </div>

        {transactionBanner && (
          <div
            className={`px-4 py-3 border-b text-xs space-y-1.5 ${
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
                    Ouvrir le Contrat CDI
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

        {/* ===================================================================== */}
        {/* MODE 1: FLATCHR MULTIPOSTING & CANDIDATE KANBAN                       */}
        {/* ===================================================================== */}
        {atsMode === 'FLATCHR_KANBAN' && (
          <div className="p-4 space-y-4 bg-slate-50">
            {/* Multiposting Job Offers Strip with Brand Job-Board Pills */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 pb-3 border-b border-slate-100">
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600">
                  <span className="font-bold text-slate-900">
                    Offres d&apos;emploi actives ({filteredOffers.length})
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>Diffusion automatique : Indeed, Welcome to the Jungle, France Travail, LinkedIn &amp; recrutement@c.fitness</span>
                </div>

                <form
                  onSubmit={handleCreateOffer}
                  className="flex flex-wrap items-center gap-2 text-xs"
                >
                  <input
                    type="text"
                    value={offerTitle}
                    onChange={(e) => setOfferTitle(e.target.value)}
                    placeholder="Intitulé du poste..."
                    className="px-3 py-2 rounded-xl border border-slate-200 w-56 bg-white"
                  />
                  <select
                    value={offerClub}
                    onChange={(e) => setOfferClub(e.target.value as ClubId)}
                    className="px-3 py-2 rounded-xl border border-slate-200 bg-white"
                  >
                    <option value="carre-de-soie">Carré de Soie</option>
                    <option value="beynost">Beynost</option>
                  </select>
                  <select
                    value={offerContract}
                    onChange={(e) => setOfferContract(e.target.value as ContractType)}
                    className="px-3 py-2 rounded-xl border border-slate-200 bg-white"
                  >
                    <option value="CDI">CDI 35h</option>
                    <option value="Apprentissage">Alternance BPJEPS</option>
                  </select>
                  <button
                    type="submit"
                    className="px-3.5 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-semibold flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Publier l&apos;offre</span>
                  </button>
                </form>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                {filteredOffers.map((offer) => (
                  <div
                    key={offer.id}
                    className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex flex-col justify-between gap-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="font-bold text-slate-900">{offer.title}</div>
                        <div className="text-[11px] text-slate-500">
                          {formatClubName(offer.clubId)} · {offer.contractType} ({offer.weeklyHours}
                          h/sem)
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                        En ligne
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {offer.channels.map((ch) => (
                        <span
                          key={ch}
                          className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${getJobBoardBadgeStyle(
                            ch
                          )}`}
                        >
                          {ch}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 4-Column Flatchr Candidate Kanban Board */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3.5">
              {KANBAN_COLUMNS.map((col) => {
                const colCandidates = filteredCandidates.filter((c) => c.stage === col.stage);
                return (
                  <div
                    key={col.stage}
                    className={`bg-slate-200/70 border border-slate-300 rounded-xl p-3 flex flex-col space-y-3 ${col.accent}`}
                  >
                    <div className="pb-2 border-b border-slate-300 flex items-start justify-between gap-2">
                      <div>
                        <h3 className="text-xs font-extrabold text-slate-900">{col.title}</h3>
                        <p className="text-[10px] text-slate-600 mt-0.5">{col.subtitle}</p>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-white border border-slate-300 text-xs font-mono font-bold text-slate-800">
                        {colCandidates.length}
                      </span>
                    </div>

                    <div className="space-y-2.5">
                      {colCandidates.map((cand) => {
                        const empContract = hrDocuments.find(
                          (d) =>
                            d.employeeId === cand.onboardedEmployeeId &&
                            d.category === 'Contrat' &&
                            d.contractBodyText
                        );
                        const initials = `${cand.firstName[0] || ''}${cand.lastName[0] || ''}`;

                        return (
                          <div
                            key={cand.id}
                            className="bg-white border border-slate-200 rounded-xl p-3.5 space-y-2.5 shadow-2xs text-xs"
                          >
                            {/* Candidate Header with Avatar, Source Pill & Flatchr Star Rating */}
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-full bg-[#1E3A8A] text-white font-bold text-xs flex items-center justify-center shrink-0">
                                  {initials}
                                </div>
                                <div>
                                  <h4 className="font-bold text-slate-900">
                                    {cand.firstName} {cand.lastName}
                                  </h4>
                                  <div className="text-[10px] text-slate-500">
                                    {cand.roleTarget} · {formatClubName(cand.clubId, true)}
                                  </div>
                                </div>
                              </div>
                              <span
                                className={`px-1.5 py-0.5 rounded text-[9px] font-bold shrink-0 ${getJobBoardBadgeStyle(
                                  cand.sourceChannel
                                )}`}
                              >
                                {cand.sourceChannel}
                              </span>
                            </div>

                            {/* Flatchr 5-Star Evaluation Strip */}
                            <div className="flex items-center justify-between text-[11px] bg-slate-50 px-2.5 py-1 rounded border border-slate-100">
                              <div className="flex items-center gap-0.5 text-amber-400">
                                <Star className="w-3.5 h-3.5 fill-current" />
                                <Star className="w-3.5 h-3.5 fill-current" />
                                <Star className="w-3.5 h-3.5 fill-current" />
                                <Star className="w-3.5 h-3.5 fill-current" />
                                <Star className="w-3.5 h-3.5 text-slate-300" />
                              </div>
                              <span className="font-mono text-[10px] text-slate-600">
                                {cand.phone}
                              </span>
                            </div>

                            {cand.cvPdfFileName && (
                              <div className="px-2.5 py-1.5 rounded bg-blue-50/60 border border-blue-200 flex items-center justify-between text-[11px]">
                                <span className="font-mono text-slate-800 flex items-center gap-1.5 truncate">
                                  <FileText className="w-3.5 h-3.5 text-[#1E3A8A] shrink-0" />
                                  <span className="truncate">{cand.cvPdfFileName}</span>
                                </span>
                                <span className="text-[10px] font-bold text-emerald-700 shrink-0 ml-1">
                                  CV PDF
                                </span>
                              </div>
                            )}

                            <p className="text-[11px] text-slate-600 leading-snug bg-slate-50 p-2 rounded border border-slate-100">
                              {cand.aiDecisionSupportNote}
                            </p>

                            <div className="pt-2 border-t border-slate-100 space-y-2">
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
                                      onClick={() =>
                                        setPreviewContractText(empContract.contractBodyText!)
                                      }
                                      className="w-full py-1.5 px-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold flex items-center justify-center gap-1 cursor-pointer"
                                    >
                                      <FileSignature className="w-3.5 h-3.5" />
                                      Ouvrir Contrat (Signature Interne 0 €)
                                    </button>
                                  )}
                                </div>
                              ) : (
                                <button
                                  onClick={() => handleHireOrRetenu(cand.id)}
                                  className="w-full py-2 px-3 rounded-lg bg-[#1E3A8A] hover:bg-[#172e6e] text-white text-[11px] font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                                >
                                  <UserCheck className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
                                  Embaucher &amp; Générer CDI (Signature 0 €)
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

            {/* Email Ingestion Webhook Simulator: recrutement@c.fitness */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-2 border-b border-slate-100">
                <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-[#1E3A8A]" />
                  Connecteur Email Automatique Flatchr :{' '}
                  <span className="font-mono text-orange-600">recrutement@c.fitness</span>
                </div>
                <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded">
                  Parsing CV PDF + Réponse RGPD auto
                </span>
              </div>

              <form
                onSubmit={handleIngestEmail}
                className="grid grid-cols-1 lg:grid-cols-12 gap-3 text-xs"
              >
                <div className="lg:col-span-3">
                  <input
                    type="text"
                    value={senderLine}
                    onChange={(e) => setSenderLine(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 font-mono text-[11px]"
                    placeholder="Expéditeur"
                  />
                </div>
                <div className="lg:col-span-3">
                  <input
                    type="text"
                    value={attachmentPdf}
                    onChange={(e) => setAttachmentPdf(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 font-mono text-[11px]"
                    placeholder="Fichier CV PDF"
                  />
                </div>
                <div className="lg:col-span-3">
                  <input
                    type="text"
                    value={bodyText}
                    onChange={(e) => setBodyText(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200"
                    placeholder="Message..."
                  />
                </div>
                <div className="lg:col-span-3">
                  <button
                    type="submit"
                    className="w-full py-2 px-3 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Simuler Réception CV
                  </button>
                </div>
              </form>

              {lastRgpdAck && (
                <div className="p-2.5 rounded bg-emerald-50 border border-emerald-200 text-xs text-emerald-950">
                  <strong>Accusé RGPD envoyé :</strong> {lastRgpdAck}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ===================================================================== */}
        {/* MODE 2: INTERNAL C.FITNESS OS ELECTRONIC SIGNATURE ENGINE (0 €)       */}
        {/* ===================================================================== */}
        {atsMode === 'YOUSIGN_PARAPHEUR' && (
          <div className="p-5 bg-slate-100 space-y-4">
            <div className="bg-emerald-900 text-white rounded-xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <div className="text-[10px] font-mono uppercase tracking-wider text-emerald-300">
                  Moteur de Signature Électronique Interne C.Fitness OS · 0 € / signature · Sans Abonnement Externe
                </div>
                <h2 className="text-base font-black mt-0.5">
                  Parapheur Interne Contrats CDI &amp; Avenants SAS C.FITNESS (Art. 1366 &amp; 1367 Code civil + eIDAS)
                </h2>
                <p className="text-xs text-emerald-100 mt-1">
                  Vérification d&apos;identité par code OTP, recueil du consentement explicite, horodatage UTC et conservation du fichier de preuve cryptographique SHA-256.
                </p>
              </div>
              <span className="px-3 py-1 rounded-full bg-emerald-400 text-slate-950 text-xs font-extrabold shrink-0">
                0 € / Signature · Valeur Probante
              </span>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {contractDocs.map((doc) => {
                const isSigned = doc.signedStatus !== 'En attente signature';
                const otpVal = otpInputByDoc[doc.id] ?? '482915';
                return (
                  <div
                    key={doc.id}
                    className="bg-white border-2 border-slate-300 rounded-xl overflow-hidden shadow-xs"
                  >
                    <div className="bg-slate-800 text-white px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs">
                      <span className="font-bold flex items-center gap-2">
                        <FileSignature className="w-4 h-4 text-emerald-400" />
                        <span>
                          [{doc.category.toUpperCase()}] {doc.title}
                        </span>
                      </span>
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2.5 py-0.5 rounded font-bold text-[11px] ${
                            isSigned
                              ? 'bg-emerald-500 text-slate-950'
                              : 'bg-amber-400 text-slate-950'
                          }`}
                        >
                          {doc.signedStatus}
                        </span>
                        {isSigned && doc.signatureProof && (
                          <button
                            onClick={() => handleDownloadProofJson(doc)}
                            className="px-2.5 py-1 rounded bg-white/15 hover:bg-white/25 text-white text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                          >
                            <Download className="w-3 h-3" />
                            Preuve .json (SHA-256)
                          </button>
                        )}
                      </div>
                    </div>

                    {doc.contractBodyText && (
                      <div className="p-4 grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
                        <pre className="lg:col-span-7 p-4 rounded-lg bg-slate-50 border border-slate-200 font-mono text-[11px] text-slate-800 whitespace-pre-wrap max-h-72 overflow-y-auto leading-relaxed">
                          {doc.contractBodyText}
                        </pre>

                        {/* Internal C.Fitness OS Legal Electronic Signature Proof Box */}
                        <div className="lg:col-span-5 p-4 rounded-xl border-2 border-dashed border-emerald-500 bg-emerald-50/50 space-y-2.5 text-xs">
                          <div className="text-[10px] font-mono uppercase font-bold text-emerald-800 flex items-center gap-1.5">
                            <Lock className="w-3.5 h-3.5 text-emerald-700" />
                            <span>Scellé Cryptographique Interne C.Fitness OS (0 €)</span>
                          </div>
                          <div className="font-bold text-slate-900">
                            Mention légale : « Lu et approuvé, bon pour accord »
                          </div>
                          <div className="p-3 rounded bg-white border border-emerald-300 font-mono text-[11px] text-emerald-950 space-y-1">
                            <div>Employeur : SAS C.FITNESS ({CFITNESS_LEGAL_IDENTITY.siret})</div>
                            <div>Statut : {doc.signedStatus}</div>
                            {doc.signatureProof ? (
                              <>
                                <div>Certificat : {doc.signatureProof.proofId}</div>
                                <div>Horodatage UTC : {doc.signatureProof.signedAtIso}</div>
                                <div>OTP vérifié : {doc.signatureProof.otpCodeVerified}</div>
                                <div className="truncate">
                                  SHA-256 : {doc.signatureProof.documentSha256}
                                </div>
                              </>
                            ) : (
                              <div>
                                En attente de validation OTP collaborateur (Espace « Ma Journée » ou ci-dessous)
                              </div>
                            )}
                          </div>

                          {!isSigned && (
                            <div className="space-y-2 pt-1">
                              <div className="flex items-center gap-2">
                                <input
                                  type="text"
                                  maxLength={6}
                                  value={otpVal}
                                  onChange={(e) =>
                                    setOtpInputByDoc({
                                      ...otpInputByDoc,
                                      [doc.id]: e.target.value,
                                    })
                                  }
                                  placeholder="Code OTP 6 chiffres"
                                  className="w-36 px-2.5 py-1.5 rounded border border-emerald-400 bg-white font-mono font-bold text-xs"
                                />
                                <span className="text-[10px] text-slate-600">
                                  Code identité OTP + Consentement
                                </span>
                              </div>
                              <button
                                onClick={() =>
                                  signDocumentWithInternalProof({
                                    docId: doc.id,
                                    otpInput: otpVal,
                                    consentChecked: true,
                                    consentPhrase:
                                      'Lu et approuvé, bon pour accord sur le contrat/avenant SAS C.FITNESS',
                                  })
                                }
                                className="w-full py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                              >
                                <FileSignature className="w-4 h-4" />
                                Signer &amp; Générer Preuve SHA-256 (0 €)
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Shared Modal Preview for Official C.FITNESS CDI Contract */}
      <ContractPreviewModal
        contractText={previewContractText}
        onClose={() => setPreviewContractText(null)}
      />
    </div>
  );
}
