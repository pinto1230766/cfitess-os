import React, { useState } from 'react';
import { useCfos } from '../../context/CfosContext';
import {
  PhoneCall,
  Users,
  Calendar,
  ShieldAlert,
  TrendingUp,
  Building2,
  ArrowUpRight,
  Smartphone,
  Tablet,
  CheckCircle2,
  Layers,
  Sun,
  Dumbbell,
  ExternalLink,
  FileSignature,
  BrainCircuit,
  GraduationCap,
  QrCode,
  Sparkles,
  Presentation,
  GitMerge,
  Award,
  Check,
  XCircle,
  ArrowRight,
  Handshake,
  ShieldCheck,
} from 'lucide-react';
import { computeHeitzKpiSummary } from '../../domain/rules';

const SAAS_REPLACED_COMPARISON = [
  {
    tool: 'Ringover Business + Onoff + Surcoûts SIP (12 lignes)',
    annualCostBeforeEur: 8640,
    replacedBy: 'Téléphonie WebRTC 12 lignes + Numéros Fixes 04 & Pool Mobiles 07 OVHcloud',
  },
  {
    tool: 'Skello Premium (2 établissements — Conservons uniquement Silae)',
    annualCostBeforeEur: 4560,
    replacedBy: 'Planning Centralisé 3-en-1 (RH + Mywellness + Heitz) + Badgeuse PIN + Export Silae',
  },
  {
    tool: 'Logiciel LEADS & Licences CRM / SharePoint Terrain',
    annualCostBeforeEur: 2760,
    replacedBy: 'CRM Acquisition (synchronisé portillons Heitz & parrainage) + Espace « Ma Journée »',
  },
  {
    tool: 'Abonnements Signature Électronique Externe (Yousign / DocuSign)',
    annualCostBeforeEur: 2160,
    replacedBy: 'Signature Électronique Interne C.Fitness OS (0 € / signature · OTP SMS + Preuve SHA-256)',
  },
];

const PROJECT_FEATURE_CATALOG = [
  {
    category: '1er Plan · Opérations Quotidiennes en Club (Front-Office)',
    badge: '9 Modules Opérationnels',
    modules: [
      {
        code: '01 · Ma Journée',
        title: 'Cockpit Collaborateur & Raccourcis Comptoir',
        icon: Sparkles,
        features: [
          'Feuille de route individuelle dès la prise de poste (tâches urgentes, RDV du jour, objectifs mensuels d’abonnements).',
          'Pointage d’entrée / pause / sortie horodaté en 1 clic.',
          '3 raccourcis directs d’accueil : Nouveau Prospect / Essai QR, Appels & SMS (04 / 07), Portillons & Caisse Heitz.',
        ],
      },
      {
        code: '02 · Le Collaborateur',
        title: 'Grille d’Exécution Horaire & Application Terrain Mobile',
        icon: Smartphone,
        features: [
          'Grille horaire de la journée tranche par tranche (ouverture club, tour de salle, relances téléphoniques, accueil essais).',
          'Validation en 1 clic des tâches exécutées avec suivi manager en temps réel.',
          'Consultation de ses propres shifts, compteur d’heures et documents RH signés.',
        ],
      },
      {
        code: '03 · L’Espace Planning',
        title: 'Planning Centralisé 3-Sources (RH + Mywellness + Heitz) & Pré-Paie Silae',
        icon: Calendar,
        features: [
          'Fusion sans doublon sur un seul écran : Shifts RH collaborateurs + Cours/Bilans Technogym Mywellness + RDV Heitz.',
          'Contrôle automatique Convention Collective Nationale du Sport (IDCC 2511) et suivi des périodes d’essai.',
          'Export comptable en 1 clic vers Silae Paie (heures travaillées, absences, primes et commissions commerciales).',
        ],
      },
      {
        code: '04 & 05 · Téléphonie & WebRTC',
        title: 'Standard 12 Lignes OVHcloud (04/07), Studio SVI & Supervision',
        icon: PhoneCall,
        features: [
          'Double identité d’appel conforme ARCEP : Lignes fixes 04 + Pool mobiles 07 à fort taux de décroché.',
          'Power-Dialer, Voicemail Drop 1-clic et Boîte SMS Collaborative 07 (avec gestion automatique STOP 36111).',
          'Supervision Manager en direct sur les 12 lignes (Écoute discrète, Chuchotement coach et Intrusion) + Résumé IA.',
        ],
      },
      {
        code: '06 · Le CRM',
        title: 'Acquisition Prospects, Conversion Heitz 1-Clic & Parrainage',
        icon: Users,
        features: [
          'Capture omnicanale avec déduplication automatique et vérification Bloctel / RGPD.',
          'Réservation de séance d’essai synchronisée dans Heitz + envoi SMS du QR Code d’ouverture portillon.',
          'Conversion 1-clic Prospect → Adhérent Heitz + attribution automatique des récompenses de parrainage (+150 pts & 1 mois offert).',
        ],
      },
      {
        code: '07 · Les ATS & Signatures (0 €)',
        title: 'Recrutement Automatisé, Contrats CDI Légaux & Signature SHA-256 Gratuite',
        icon: FileSignature,
        features: [
          'Réception des candidatures sur recrutement@c.fitness avec accusé de réception RGPD.',
          'Générateur automatique du Contrat CDI officiel C.Fitness (IDCC 2511, objectif 20 abonnements/mois).',
          'Signature électronique interne à 0 € et Onboarding en 1 clic (crée salarié + PIN + Shift + Contrat + Académie).',
        ],
      },
      {
        code: '08 · Matériel Heitz & Checkup',
        title: 'Portillons RFID/Bluetooth, Caisse TPV NF525 & Bilans Technogym Checkup',
        icon: QrCode,
        features: [
          'Pilotage en direct des portillons Heitz (Carré de Soie & Beynost), caisse TPV comptoir et programme fidélité/anniversaire.',
          'Bouclier SEPA automatique : blocage du tourniquet si impayé + alerte écran accueil + régularisation CB/SEPA 1-clic.',
          'Synchronisation des 2 stations biométriques Technogym Checkup (Wellness Age™, BIA, 3D) et ouverture directe Mywellness.',
        ],
      },
      {
        code: '09 · Tablette Kiosque Badgeuse PIN',
        title: 'Borne Tactile Murale d’Entrée du Personnel',
        icon: Tablet,
        features: [
          'Interface tactile grand format dédiée au pointage par code PIN personnel à 4 chiffres.',
          'Continuité hors-ligne automatique : aucun pointage perdu même en cas de coupure réseau passagère.',
        ],
      },
    ],
  },
  {
    category: '2e Plan · Pilotage Direction, Orchestration IA & Académie',
    badge: '3 Modules Stratégiques',
    modules: [
      {
        code: 'Pilotage & Dossier Dirigeants',
        title: 'Tableau de Bord Exécutif Bi-Club & Dossier Associés',
        icon: TrendingUp,
        features: [
          'Jauge FMI en direct sur Carré de Soie et Beynost, suivi du Chiffre d’Affaires Heitz, des abonnements et des impayés SEPA.',
          'Dossier complet de présentation aux dirigeants et associés (ROI financier, logiciels remplacés vs partenaires, potentiel de revente).',
        ],
      },
      {
        code: 'Orchestration IA (6 Agents)',
        title: 'Agents IA Métier Spécialisés & Maintenance Prédictive',
        icon: BrainCircuit,
        features: [
          '6 Agents IA dédiés : RH & Conformité IDCC 2511, CRM & Conversion, Recouvrement SEPA, Téléphonie & Résumé d’appel, Maintenance Parc, et Pilotage.',
          'Module de suivi de la maintenance préventive des machines et des stocks de consommables des 2 clubs.',
        ],
      },
      {
        code: 'Académie 3S & Livret BPJEPS',
        title: 'Formation Interne Certifiante & Suivi des Apprentis UC1–UC4',
        icon: GraduationCap,
        features: [
          '11 modules e-learning internes (méthode de vente C.Fitness, accueil, sécurité ERP, téléphonie, hygiène) avec QCM auto-corrigés.',
          'Livret numérique de suivi des apprentis BPJEPS AF (validation des compétences UC1 à UC4 par le tuteur).',
        ],
      },
    ],
  },
];

const REPLACED_SOFTWARE_MATRIX = [
  {
    replaced: 'Ringover / Aircall (SaaS Téléphonie)',
    oldCost: '45 € à 65 € HT / mois / utilisateur (~720 € HT/mois pour 12 postes)',
    limitation: 'Coût par licence prohibitif et aucun lien natif avec le solde SEPA Heitz.',
    cfitnessSolution: 'Softphone WebRTC 12 lignes + Trunk Fixe 04 OVHcloud + Pool Mobiles 07 + Résumé IA.',
    newCost: '~14,40 € HT / mois au total (coût télécom OVHcloud pur, 0 € de licence logicielle)',
  },
  {
    replaced: 'Skello / Combo (Planning RH & Badgeuse)',
    oldCost: '90 € à 160 € HT / mois / club (~380 € HT/mois pour 2 clubs)',
    limitation: 'Séparé du planning des cours Technogym et des RDV commerciaux Heitz.',
    cfitnessSolution: 'Espace Planning Unifié 3-en-1 (RH IDCC 2511 + Mywellness + Heitz) + Kiosque Tablette Badgeuse PIN.',
    newCost: '0 € / mois (intégré nativement)',
  },
  {
    replaced: 'Yousign / DocuSign (Signature Électronique)',
    oldCost: '50 € à 180 € HT / mois',
    limitation: 'Obligation de ressaisir les coordonnées du candidat et de payer à chaque contrat.',
    cfitnessSolution: 'Moteur interne de signature électronique SHA-256 avec OTP SMS et génération automatique du CDI.',
    newCost: '0 € / mois (illimité)',
  },
  {
    replaced: 'HubSpot / Pipedrive / Logiciel LEADS (CRM)',
    oldCost: '150 € à 400 € HT / mois',
    limitation: 'Aucune connexion native avec les portillons Heitz pour vérifier la venue réelle en séance d’essai.',
    cfitnessSolution: 'CRM Fitness C.Fitness OS connecté en temps réel aux portillons Heitz (QR Code essai, conversion 1-clic, parrainage).',
    newCost: '0 € / mois (intégré nativement)',
  },
  {
    replaced: 'Outils ATS Recrutement (Flatchr / WelcomeKit)',
    oldCost: '80 € à 200 € HT / mois',
    limitation: 'Déconnecté de la création du salarié dans le planning et de la formation interne.',
    cfitnessSolution: 'ATS intégré branché sur recrutement@c.fitness avec Onboarding en 1 clic.',
    newCost: '0 € / mois (intégré nativement)',
  },
  {
    replaced: 'Google Calendar / WhatsApp / Fichiers Excel épars',
    oldCost: 'Perte de temps estimée à 8h / semaine / manager + perte de prospects',
    limitation: 'Informations éparpillées, aucune traçabilité opposable, risque RGPD sur les téléphones personnels.',
    cfitnessSolution: 'Cockpit unique « Ma Journée » + Grille Collaborateur + Zéro téléphone personnel.',
    newCost: '0 € / mois + Sécurité juridique totale',
  },
];

const PARTNER_SYSTEMS_IN_HARMONY = [
  {
    system: '1. Système Heitz (Portillons, SEPA, Caisse NF525 & Fidélité)',
    role: 'Cœur Adhérents, Prélèvements SEPA/EBICS, Caisse KPI & Contrôle d’Accès Portillons (RFID / Bluetooth / QR)',
    whyKept: 'Heitz est la référence métier certifiée NF525 pour la gestion bancaire SEPA et pilote déjà les lecteurs RFID/Bluetooth installés dans les clubs.',
    howItWorksTogether: [
      'Sens C.Fitness → Heitz : Lorsqu’un commercial réserve un essai ou convertit un prospect dans le CRM, C.Fitness OS crée automatiquement la fiche dans Heitz, génère le QR Code portillon et enregistre le ticket KPI.',
      'Sens Heitz → C.Fitness : Chaque passage au tourniquet ou rejet SEPA remonte instantanément dans C.Fitness OS pour bloquer le portillon, alerter l’accueil et déclencher un SMS de régularisation.',
      'Fidélité & Parrainage : attribution en 1 clic des points de fidélité, mois offerts parrains et offres d’anniversaire.',
    ],
  },
  {
    system: '2. Technogym Mywellness Cloud & 2× Stations Technogym Checkup',
    role: 'Suivi Sportif Plateau, Programmes d’Entraînement, Cours Collectifs & Bilans Biométriques 3D / BIA',
    whyKept: 'L’écosystème Technogym (Mywellness + balances révolutionnaires Checkup) offre une expérience sportive mondiale irremplaçable aux adhérents.',
    howItWorksTogether: [
      'Aucune double saisie : C.Fitness OS synchronise les créneaux de bilans et de cours Mywellness directement dans « L’Espace Planning » centralisé.',
      'Passerelle contextuelle 1-clic : Depuis la fiche d’un adhérent ou le planning coach, un bouton ouvre directement son dossier biométrique Technogym Checkup (Wellness Age™, masse musculaire, mobilité).',
    ],
  },
  {
    system: '3. Silae Paie (Cabinet Comptable & Social)',
    role: 'Édition Officielle des Bulletins de Paie & Déclarations Sociales (DSN / URSSAF)',
    whyKept: 'Le cabinet comptable utilise Silae pour garantir la conformité légale des fiches de paie et des déclarations URSSAF.',
    howItWorksTogether: [
      'C.Fitness OS agit comme le moteur de pré-paie automatisé en amont de Silae.',
      'Les pointages de la badgeuse PIN, les heures supplémentaires, les congés validés et les commissions commerciales sont consolidés automatiquement.',
      'En fin de mois, la Direction génère en 1 clic le fichier d’export normé prêt à être importé dans Silae par le cabinet comptable.',
    ],
  },
  {
    system: '4. OVHcloud Télécom (Lignes Fixes 04 & Pool Mobiles 07)',
    role: 'Infrastructure Opérateur Télécom Pure (Voix Fixe, Voix Mobile & SMS)',
    whyKept: 'Indispensable pour acheminer les appels sur le réseau téléphonique public français en respectant strictement la réglementation ARCEP.',
    howItWorksTogether: [
      'C.Fitness OS fournit toute l’interface logicielle (WebRTC, Studio SVI, Power-Dialer, écoute manager, enregistrement, transcription IA).',
      'OVHcloud ne facture plus que la consommation télécom pure (~1,20 € HT/mois/ligne fixe), supprimant 100 % des licences logicielles par poste.',
    ],
  },
];

const COMPETITIVE_ADVANTAGES = [
  {
    criterion: '1. Coût de Licence par Utilisateur (Scalabilité)',
    marketStandard: 'Facturation au poste sur chaque outil (Ringover + Skello + CRM + Yousign = 150 € à 250 € HT / mois par nouveau salarié).',
    cfitnessAdvantage: '0 € de coût logiciel par utilisateur supplémentaire. Que le club ait 5, 25 ou 100 collaborateurs, le coût logiciel reste nul.',
    resaleProof: 'Permet de revendre la solution à d’autres clubs sous forme de licence forfaitaire très rentable tout en leur faisant économiser 70 % de leurs frais SaaS.',
  },
  {
    criterion: '2. Boucle Fermée CRM ↔ Portillon Heitz ↔ Banque SEPA',
    marketStandard: 'Le CRM commercial ne sait pas qui franchit le tourniquet ni qui est en impayé SEPA.',
    cfitnessAdvantage: 'Connexion native bidirectionnelle à Heitz : QR Code d’essai généré par SMS, validation automatique de présence au passage du portillon, et blocage + relance immédiate sur impayé SEPA.',
    resaleProof: 'Tous les clubs équipés de Heitz en France (+2 000 établissements) cherchent cette surcouche moderne tout-en-un.',
  },
  {
    criterion: '3. Règles Métier Fitness & Droit Social Français Natifs',
    marketStandard: 'Logiciels généralistes étrangers (HubSpot, Pipedrive) qui ignorent la Convention Collective du Sport (IDCC 2511) et le diplôme BPJEPS.',
    cfitnessAdvantage: 'Conçu sur-mesure pour le fitness français : contrôle automatique IDCC 2511, génération du CDI officiel, suivi périodes d’essai, et livret pédagogique BPJEPS UC1–UC4 intégré.',
    resaleProof: 'Argument décisif pour les dirigeants de clubs et franchisés : conformité inspection du travail et OPCO clé en main dès le premier jour.',
  },
  {
    criterion: '4. Téléphonie 04/07 Conforme ARCEP + IA Vocale à 0 €',
    marketStandard: 'Les solutions Cloud facturent l’option « IA Transcription & Résumé » entre 29 € et 49 € HT/mois/poste.',
    cfitnessAdvantage: 'Double identité d’appel 04 et 07 à fort taux de décroché + Transcription & Coaching IA sans abonnement externe.',
    resaleProof: 'Taux de décroché prospect doublé grâce aux vrais numéros 07 locaux et analyse IA 100 % privée.',
  },
  {
    criterion: '5. Continuité d’Exploitation Garantie',
    marketStandard: '100 % dépendant d’Internet : si la fibre du club coupe, plus de CRM, plus de planning, plus de badgeuse.',
    cfitnessAdvantage: 'Autonomie locale : les portillons Heitz, la badgeuse PIN et le CRM continuent de fonctionner sans perte même en cas de coupure Internet.',
    resaleProof: 'Garantie « Zéro Fermeture de Club » qui rassure immédiatement les investisseurs et associés multi-sites.',
  },
  {
    criterion: '6. Architecture Multi-Clubs & Marque Blanche (White-Label Ready)',
    marketStandard: 'Outils cloisonnés par société nécessitant de se déconnecter/reconnecter pour voir un autre établissement.',
    cfitnessAdvantage: 'Nativement Multi-Clubs (éprouvé sur Carré de Soie + Beynost) avec droits d’accès par rôle (Dirigeant, Associé, Manager, Commercial, Coach).',
    resaleProof: 'Prêt à accueillir un 3e, 4e ou 10e club associé ou franchisé en moins de 48h.',
  },
];

export type ExecutiveDashboardTab =
  | 'synthese'
  | 'features'
  | 'pitch_roi'
  | 'ecosystem_resale';

export function DashboardView() {
  const {
    clubs,
    clubFilter,
    currentUser,
    prospects,
    phoneLines,
    shifts,
    heitzMembers,
    heitzKpiTickets,
    accessEvents,
    callLogs,
    checklists,
    sipTrunkProvider,
    setActiveSection,
    setShellMode,
    openMywellnessLink,
  } = useCfos();

  const [activeTab, setActiveTab] = useState<ExecutiveDashboardTab>('synthese');

  const filterByClub = <T extends { clubId: string }>(items: T[]) =>
    clubFilter === 'all' ? items : items.filter((item) => item.clubId === clubFilter);

  const clubProspects = filterByClub(prospects);
  const clubLines = filterByClub(phoneLines);
  const clubShifts = filterByClub(shifts);
  const clubMembers = heitzMembers.filter((m) =>
    clubFilter === 'all' ? true : m.homeClubId === clubFilter
  );
  const clubCalls = filterByClub(callLogs);
  const clubChecklists = filterByClub(checklists);

  const newLeadsCount = clubProspects.filter((p) => p.stage === 'Nouveau').length;
  const scheduledTrialsCount = clubProspects.filter((p) => p.stage === 'Séance planifiée').length;
  const convertedCount = clubProspects.filter((p) => p.stage === 'Adhérent').length;
  const conversionRate =
    clubProspects.length > 0 ? Math.round((convertedCount / clubProspects.length) * 100) : 0;

  const activeLinesCount = clubLines.filter((l) => l.activeAgentId !== null).length;
  const unpaidCount = clubMembers.filter((m) => m.finBalanceEur < 0).length;
  const inactiveCount = clubMembers.filter((m) => m.daysSinceLastWorkout >= 15).length;
  const completedChecklistCount = clubChecklists.filter((c) => Boolean(c.checkedBy)).length;

  const totalAnnualSavings = SAAS_REPLACED_COMPARISON.reduce(
    (sum, item) => sum + item.annualCostBeforeEur,
    0
  );

  const heitzKpi = computeHeitzKpiSummary(heitzKpiTickets, clubFilter);
  const clubPassages = filterByClub(accessEvents);

  return (
    <div className="space-y-6">
      {/* EN-TÊTE UNIFIÉ C.FITNESS OS — PILOTAGE BI-CLUB & DOSSIER DIRIGEANTS / ASSOCIÉS */}
      <div className="bg-slate-900 text-white border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-orange-500/20 border border-orange-500/30 text-orange-300 text-[11px] font-bold uppercase tracking-wider">
              2e Plan · Direction, Associés &amp; Pilotage Bi-Club
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              Pilotage Bi-Club (Carré de Soie &amp; Beynost) &amp; Dossier Dirigeants / Associés
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-3xl">
              Vue exécutive regroupant le pilotage opérationnel en temps réel des 2 établissements, le catalogue complet des fonctionnalités, le plan de présentation &amp; ROI pour les dirigeants/associés, ainsi que l&apos;écosystème des logiciels remplacés vs partenaires.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <div className="bg-slate-800/90 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs">
              <div className="text-slate-400 text-[11px]">Économies SaaS Directes</div>
              <div className="text-base font-black text-emerald-400 tabular-nums">
                {totalAnnualSavings.toLocaleString('fr-FR')} € HT / an
              </div>
            </div>
            <button
              type="button"
              onClick={() => setActiveSection('my-day')}
              className="px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-extrabold transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap shadow-xs"
            >
              <Sun className="w-4 h-4" />
              <span>← Retour 1er Plan (Ma Journée)</span>
            </button>
          </div>
        </div>

        {/* Barre des 4 onglets Direction & Associés */}
        <div className="pt-4 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('synthese')}
            className={`px-3.5 py-2.5 rounded-xl text-left text-xs font-bold flex items-center gap-2.5 transition-all cursor-pointer ${
              activeTab === 'synthese'
                ? 'bg-orange-600 text-white shadow-xs'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-700/70'
            }`}
          >
            <TrendingUp className="w-4 h-4 shrink-0" />
            <div className="min-w-0">
              <div className="text-[10px] uppercase opacity-80">Volet 1</div>
              <div className="truncate">Pilotage &amp; KPIs Bi-Club</div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('features')}
            className={`px-3.5 py-2.5 rounded-xl text-left text-xs font-bold flex items-center gap-2.5 transition-all cursor-pointer ${
              activeTab === 'features'
                ? 'bg-orange-600 text-white shadow-xs'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-700/70'
            }`}
          >
            <Layers className="w-4 h-4 shrink-0" />
            <div className="min-w-0">
              <div className="text-[10px] uppercase opacity-80">Volet 2</div>
              <div className="truncate">Toutes les Fonctionnalités</div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('pitch_roi')}
            className={`px-3.5 py-2.5 rounded-xl text-left text-xs font-bold flex items-center gap-2.5 transition-all cursor-pointer ${
              activeTab === 'pitch_roi'
                ? 'bg-orange-600 text-white shadow-xs'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-700/70'
            }`}
          >
            <Presentation className="w-4 h-4 shrink-0" />
            <div className="min-w-0">
              <div className="text-[10px] uppercase opacity-80">Volet 3</div>
              <div className="truncate">Plan Dirigeants, Associés &amp; ROI</div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('ecosystem_resale')}
            className={`px-3.5 py-2.5 rounded-xl text-left text-xs font-bold flex items-center gap-2.5 transition-all cursor-pointer ${
              activeTab === 'ecosystem_resale'
                ? 'bg-orange-600 text-white shadow-xs'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-700/70'
            }`}
          >
            <GitMerge className="w-4 h-4 shrink-0" />
            <div className="min-w-0">
              <div className="text-[10px] uppercase opacity-80">Volet 4</div>
              <div className="truncate">Remplacés vs Partenaires &amp; Revente</div>
            </div>
          </button>
        </div>
      </div>

      {/* =====================================================================
          VOLET 1 : PILOTAGE OPÉRATIONNEL & KPIS BI-CLUB
         ===================================================================== */}
      {activeTab === 'synthese' && (
        <div className="space-y-5">
          {/* 4 Grands Compteurs Clés */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <div
              onClick={() => setActiveSection('telephony')}
              className="bg-white border border-slate-200 rounded-xl p-5 hover:border-slate-300 transition-colors cursor-pointer shadow-2xs"
            >
              <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
                <span>Téléphonie &amp; Postes (12 lignes)</span>
                <PhoneCall className="w-4 h-4 text-blue-600" />
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl font-black text-slate-900 tabular-nums">
                  {activeLinesCount} / {clubLines.length}
                </span>
                <span className="text-xs font-bold text-emerald-700">postes actifs</span>
              </div>
              <div className="mt-2 text-xs text-slate-500">
                {clubCalls.length} appels tracés ·{' '}
                {sipTrunkProvider === 'ovhcloud_sip' ? 'OVHcloud Fixe 04 & Mobile 07' : 'Pool 07'}
              </div>
            </div>

            <div
              onClick={() => setActiveSection('crm')}
              className="bg-white border border-slate-200 rounded-xl p-5 hover:border-slate-300 transition-colors cursor-pointer shadow-2xs"
            >
              <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
                <span>Pipeline CRM &amp; Essais</span>
                <Users className="w-4 h-4 text-orange-600" />
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl font-black text-slate-900 tabular-nums">
                  {clubProspects.length}
                </span>
                <span className="text-xs font-bold text-orange-600">
                  dont {newLeadsCount} nouveaux
                </span>
              </div>
              <div className="mt-2 text-xs text-slate-500">
                {scheduledTrialsCount} séances planifiées · {conversionRate}% de transformation
              </div>
            </div>

            <div
              onClick={() => setActiveSection('planning-hr')}
              className="bg-white border border-slate-200 rounded-xl p-5 hover:border-slate-300 transition-colors cursor-pointer shadow-2xs"
            >
              <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
                <span>Planning RH &amp; Paie Silae</span>
                <Calendar className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl font-black text-slate-900 tabular-nums">
                  {clubShifts.length}
                </span>
                <span className="text-xs font-bold text-emerald-700">créneaux validés</span>
              </div>
              <div className="mt-2 text-xs text-slate-500">
                Convention Sport IDCC 2511 · Export Silae prêt
              </div>
            </div>

            <div
              onClick={() => setActiveSection('devices')}
              className="bg-white border border-slate-200 rounded-xl p-5 hover:border-slate-300 transition-colors cursor-pointer shadow-2xs"
            >
              <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
                <span>Portillons Heitz &amp; Bouclier SEPA</span>
                <ShieldAlert className="w-4 h-4 text-rose-600" />
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl font-black text-slate-900 tabular-nums">
                  {unpaidCount}
                </span>
                <span className="text-xs font-bold text-rose-600">impayés bloqués</span>
              </div>
              <div className="mt-2 text-xs text-slate-500">
                {inactiveCount} alertes rétention &gt;15j · Ouverture QR &amp; RFID
              </div>
            </div>
          </div>

          {/* État des 2 Clubs + Accès Directs 1er Plan */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            <div className="lg:col-span-6 bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-orange-600" />
                  État en Direct des 2 Établissements C.FITNESS
                </h2>
                <button
                  onClick={() => setActiveSection('academy')}
                  className="text-xs font-bold text-orange-600 hover:text-orange-700 cursor-pointer"
                >
                  Checklists ({completedChecklistCount}/{clubChecklists.length})
                </button>
              </div>

              <div className="mt-3 space-y-3 text-xs">
                {clubs.map((club) => (
                  <div
                    key={club.id}
                    className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80"
                  >
                    <div className="flex items-center justify-between font-bold text-slate-900 text-sm">
                      <span>
                        {club.name} ({club.city})
                      </span>
                      <span className="text-emerald-700 font-extrabold tabular-nums">
                        Affluence FMI : {club.fmiCurrent} / {club.fmiCapacity}
                      </span>
                    </div>
                    <div className="text-slate-600 mt-1">
                      {club.address} · Accueil : {club.landline}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-6 bg-white border border-slate-200 rounded-xl p-5 space-y-3 shadow-2xs">
              <div className="pb-2 border-b border-slate-100">
                <div className="text-[11px] font-bold uppercase tracking-wider text-orange-600">
                  Accès Rapide aux Postes du Club (1er Plan)
                </div>
                <h2 className="text-sm font-bold text-slate-900 mt-0.5">
                  Basculer en 1 clic vers les écrans terrain
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <button
                  onClick={() => setActiveSection('my-day')}
                  className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-orange-500 hover:bg-orange-50/40 transition-colors text-left cursor-pointer"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Sun className="w-4 h-4 text-orange-600 shrink-0" />
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-900 truncate">01 · Ma Journée</div>
                      <div className="text-[11px] text-slate-500 truncate">Priorités &amp; Comptoir</div>
                    </div>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-slate-400 shrink-0" />
                </button>

                <button
                  onClick={() => setActiveSection('devices')}
                  className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-orange-500 hover:bg-orange-50/40 transition-colors text-left cursor-pointer"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <QrCode className="w-4 h-4 text-orange-600 shrink-0" />
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-900 truncate">08 · Matériel Heitz &amp; Checkup</div>
                      <div className="text-[11px] text-slate-500 truncate">Portillons, Caisse &amp; Bilans</div>
                    </div>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-slate-400 shrink-0" />
                </button>

                <button
                  onClick={() => setShellMode('telephone')}
                  className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-orange-500 hover:bg-orange-50/40 transition-colors text-left cursor-pointer"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <PhoneCall className="w-4 h-4 text-blue-600 shrink-0" />
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-900 truncate">05 · Le WebRTC (04/07)</div>
                      <div className="text-[11px] text-slate-500 truncate">Softphone 12 lignes</div>
                    </div>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-slate-400 shrink-0" />
                </button>

                <button
                  onClick={() => setShellMode('tablette')}
                  className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-orange-500 hover:bg-orange-50/40 transition-colors text-left cursor-pointer"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Tablet className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-900 truncate">09 · Tablette Kiosque PIN</div>
                      <div className="text-[11px] text-slate-500 truncate">Badgeuse murale d&apos;entrée</div>
                    </div>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-slate-400 shrink-0" />
                </button>
              </div>
            </div>
          </div>

          {/* Synthèse Chiffre d'Affaires Heitz & Primes Vendeurs Silae */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-2xs">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-orange-600">
                  Suivi Financier &amp; Commercial Consolidé (Heitz ↔ Silae)
                </div>
                <h2 className="text-sm sm:text-base font-bold text-slate-900 mt-0.5">
                  Chiffre d&apos;Affaires Encaissé, Ventilation par Moyen de Paiement &amp; Primes Vendeurs
                </h2>
              </div>
              <span className="px-3 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 font-mono text-xs font-bold">
                {heitzKpi.ticketsCount} encaissements · {heitzKpi.totalRevenueTtcEur.toFixed(2)} € TTC
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 text-xs">
              <div className="lg:col-span-5 p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="font-bold text-slate-900">
                  Ventilation du Chiffre d&apos;Affaires
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                    <div className="text-[10px] text-slate-500 uppercase font-semibold">
                      Abonnements Club
                    </div>
                    <div className="text-base font-extrabold text-slate-900 font-mono tabular-nums mt-0.5">
                      {heitzKpi.subscriptionsRevenueEur.toFixed(2)} €
                    </div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                    <div className="text-[10px] text-slate-500 uppercase font-semibold">
                      Boutique &amp; Caisse TPV
                    </div>
                    <div className="text-base font-extrabold text-slate-900 font-mono tabular-nums mt-0.5">
                      {heitzKpi.tpvArticlesRevenueEur.toFixed(2)} €
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-slate-200/80">
                  {heitzKpi.byPaymentMethod.map((pm) => (
                    <div
                      key={pm.method}
                      className="flex items-center justify-between font-mono text-[11px]"
                    >
                      <span className="text-slate-700 font-semibold">
                        {pm.method} ({pm.count})
                      </span>
                      <span className="font-bold text-slate-900 tabular-nums">
                        {pm.totalEur.toFixed(2)} €
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="lg:col-span-7 p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-bold text-slate-900">
                    Performance Vendeurs &amp; Commissions Silae
                  </span>
                  <span className="px-2.5 py-0.5 rounded bg-emerald-100 text-emerald-900 font-mono text-[11px] font-bold">
                    Total Primes : +{heitzKpi.totalSilaeCommissionsEur.toFixed(2)} € · {clubPassages.length} passages portillons
                  </span>
                </div>

                <div className="space-y-2">
                  {heitzKpi.byEmployeeSeller.map((seller) => (
                    <div
                      key={seller.employeeId}
                      className="p-2.5 rounded-lg bg-white border border-slate-200 flex flex-wrap items-center justify-between gap-2"
                    >
                      <div>
                        <div className="font-bold text-slate-900">{seller.sellerName}</div>
                        <div className="text-[11px] text-slate-500">
                          {seller.subscriptionsSold} abonnement(s) signé(s) · {seller.ticketsCount} encaissement(s)
                        </div>
                      </div>
                      <div className="text-right font-mono tabular-nums">
                        <div className="font-bold text-slate-900">
                          CA : {seller.revenueTtcEur.toFixed(2)} €
                        </div>
                        <div className="text-[11px] font-semibold text-emerald-700">
                          Prime Silae : +{seller.silaeCommissionEur.toFixed(2)} €
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          VOLET 2 : TOUTES LES FONCTIONNALITÉS DU PROJET
         ===================================================================== */}
      {activeTab === 'features' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4 shadow-2xs">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-orange-600">
                Volet 2 · Catalogue Fonctionnel Complet
              </div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 mt-0.5">
                Toutes les fonctionnalités embarquées dans C.Fitness OS (1er Plan Club &amp; 2e Plan Direction)
              </h2>
              <p className="text-xs text-slate-600 mt-1">
                Les 9 outils quotidiens du club sont accessibles directement au 1er Plan, tandis que le pilotage stratégique, l&apos;IA et l&apos;Académie sont regroupés au 2e Plan.
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0 text-xs">
              <span className="px-3 py-1.5 rounded-xl bg-orange-50 text-orange-700 font-bold border border-orange-200">
                9 Modules au 1er Plan
              </span>
              <span className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                Bi-Club Natif
              </span>
            </div>
          </div>

          {PROJECT_FEATURE_CATALOG.map((group) => (
            <div key={group.category} className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <h3 className="text-sm sm:text-base font-extrabold text-slate-900">
                  {group.category}
                </h3>
                <span className="px-2.5 py-1 rounded-lg bg-slate-900 text-white text-[11px] font-bold">
                  {group.badge}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {group.modules.map((mod) => {
                  const Icon = mod.icon;
                  return (
                    <div
                      key={mod.code}
                      className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3 flex flex-col justify-between shadow-2xs"
                    >
                      <div className="space-y-2.5">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-xl bg-orange-50 border border-orange-200 text-orange-600 flex items-center justify-center shrink-0">
                              <Icon className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="text-[11px] font-mono font-bold text-orange-600 uppercase">
                                {mod.code}
                              </div>
                              <div className="text-sm font-bold text-slate-900">
                                {mod.title}
                              </div>
                            </div>
                          </div>
                          <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold shrink-0">
                            Actif
                          </span>
                        </div>

                        <ul className="space-y-1.5 text-xs text-slate-600 pt-1">
                          {mod.features.map((feat, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                              <span>{feat}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* =====================================================================
          VOLET 3 : PLAN DE PRÉSENTATION DIRIGEANTS, ASSOCIÉS & ROI FINANCIER
         ===================================================================== */}
      {activeTab === 'pitch_roi' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-2 shadow-2xs">
            <div className="text-xs font-bold uppercase tracking-wider text-orange-600">
              Volet 3 · Présentation Exécutive &amp; Rentabilité (Dirigeants &amp; Associés)
            </div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              Plan en 5 étapes pour présenter C.Fitness OS aux dirigeants et aux associés souhaitant l&apos;intégrer dans leurs structures existantes
            </h2>
            <p className="text-xs text-slate-600">
              Synthèse orientée résultats financiers, simplicité quotidienne pour les équipes et intégration sans aucune interruption dans un club déjà ouvert.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
            {[
              {
                step: 'ÉTAPE 1 · LE CONSTAT',
                duration: '3 min',
                title: 'Pourquoi les clubs perdent du temps et de la marge aujourd’hui',
                points: [
                  'Empilement de 6 abonnements logiciels coûteux (Ringover, Skello, Yousign, CRM, Excel) qui ne communiquent pas entre eux.',
                  'Perte de prospects : aucun lien entre un appel téléphonique, la prise de RDV et le passage réel au tourniquet Heitz.',
                  'Risque social & RGPD : utilisation des téléphones personnels des salariés et ressaisie manuelle de la paie.',
                ],
              },
              {
                step: 'ÉTAPE 2 · LA SOLUTION',
                duration: '5 min',
                title: 'Un seul système d’exploitation pensé pour les exploitants de clubs',
                points: [
                  'Tout le quotidien dans le 1er Plan : Ma Journée → Planning → Téléphonie 04/07 → CRM → Contrats → Portillons Heitz & Checkup → Badgeuse PIN.',
                  '1 seule action = mise à jour partout (convertir un prospect crée l’adhérent Heitz + ouvre le portillon + calcule la prime).',
                  'On conserve le matériel existant (tourniquets Heitz et machines Technogym) et on les pilote.',
                ],
              },
              {
                step: 'ÉTAPE 3 · L’INTÉGRATION',
                duration: '4 min',
                title: 'Déploiement en douceur dans une structure existante sans coupure',
                points: [
                  'Semaine 1 : Synchronisation avec Heitz et Technogym Mywellness sans perturber l’accueil.',
                  'Semaine 2 : Mise en service de la Téléphonie 04/07 et du CRM (arrêt des abonnements Ringover/CRM).',
                  'Semaine 3 : Activation du Planning RH IDCC 2511, de la Tablette Badgeuse PIN et des signatures à 0 € (arrêt de Skello/Yousign).',
                  'Semaine 4 : Ouverture du Pilotage Direction Multi-Clubs et premier export automatisé Silae.',
                ],
              },
              {
                step: 'ÉTAPE 4 · LE ROI FINANCIER',
                duration: '4 min',
                title: 'Rentabilité immédiate dès le 1er mois d’exploitation',
                points: [
                  'Économie directe : 18 120 € HT / an d’abonnements SaaS supprimés sur les 2 clubs (soit 54 360 € sur 3 ans).',
                  'Hausse du Chiffre d’Affaires : +25 % de transformation sur les essais grâce au QR Code SMS Heitz et aux relances 07.',
                  'Protection de trésorerie : le Bouclier SEPA bloque au portillon les rejets de prélèvement et permet l’encaissement immédiat.',
                ],
              },
              {
                step: 'ÉTAPE 5 · LES ASSOCIÉS',
                duration: '4 min',
                title: 'Transparence financière & croissance multi-structures',
                points: [
                  'Chaque dirigeant ou associé suit en direct les indicateurs consolidés (CA, FMI, nouveaux contrats, primes).',
                  'Traçabilité complète : chaque ouverture manuelle de portillon, contrat signé ou encaissement est horodaté.',
                  'Prêt à intégrer un nouveau club associé ou franchisé en 48 heures.',
                ],
              },
            ].map((item) => (
              <div
                key={item.step}
                className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col justify-between space-y-3 shadow-2xs"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-orange-100 text-orange-800">
                      {item.step}
                    </span>
                    <span className="text-[11px] font-mono text-slate-500">
                      {item.duration}
                    </span>
                  </div>
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                    {item.title}
                  </h3>
                  <ul className="space-y-2 text-xs text-slate-600 pt-1">
                    {item.points.map((pt, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <ArrowRight className="w-3.5 h-3.5 text-orange-600 shrink-0 mt-0.5" />
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>

          {/* Tableau des Économies Directes */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                  Bilan des Économies Annuelles Directes sur les Abonnements Remplacés
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Suppression définitive des facturations mensuelles par utilisateur sur Carré de Soie &amp; Beynost
                </p>
              </div>
              <div className="text-left sm:text-right shrink-0">
                <div className="text-lg font-black text-emerald-700 tabular-nums whitespace-nowrap">
                  {totalAnnualSavings.toLocaleString('fr-FR')}&nbsp;€ HT{' '}
                  <span className="text-xs font-normal text-slate-500 whitespace-nowrap">
                    / an économisés
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 whitespace-nowrap">
                  Soit {(totalAnnualSavings * 3).toLocaleString('fr-FR')}&nbsp;€ HT d&apos;économie sur 3 ans
                </div>
              </div>
            </div>

            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-[11px] font-semibold uppercase text-slate-500">
                    <th className="py-2.5 pr-3">Ancien abonnement supprimé</th>
                    <th className="py-2.5 px-3">Coût annuel économisé</th>
                    <th className="py-2.5 pl-3">Solution native C.Fitness OS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {SAAS_REPLACED_COMPARISON.map((item, idx) => (
                    <tr key={idx}>
                      <td className="py-2.5 pr-3 font-semibold text-slate-900">{item.tool}</td>
                      <td className="py-2.5 px-3 text-rose-600 line-through font-mono tabular-nums whitespace-nowrap">
                        {item.annualCostBeforeEur.toLocaleString('fr-FR')}&nbsp;€ / an
                      </td>
                      <td className="py-2.5 pl-3 font-semibold text-emerald-700">
                        {item.replacedBy}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Garantie pour les Associés */}
          <div className="bg-slate-900 text-white rounded-2xl p-5 sm:p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <div className="text-xs font-bold uppercase text-orange-400">
                  Garantie d&apos;Exploitation pour les Dirigeants &amp; Associés
                </div>
                <h3 className="text-base font-bold text-white mt-0.5">
                  Pourquoi un club déjà ouvert adopte C.Fitness OS sans aucun risque opérationnel ?
                </h3>
              </div>
              <span className="px-3 py-1 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold self-start">
                Zéro coupure des portillons ni des prélèvements SEPA
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="bg-slate-800/90 border border-slate-700 rounded-xl p-4 space-y-1.5">
                <div className="font-bold text-orange-300 flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  1. Conservation du matériel existant
                </div>
                <p className="text-slate-300 leading-relaxed">
                  Aucun changement de tourniquets, de lecteurs RFID/Bluetooth Heitz ni de machines Technogym. C.Fitness OS s&apos;y connecte directement.
                </p>
              </div>

              <div className="bg-slate-800/90 border border-slate-700 rounded-xl p-4 space-y-1.5">
                <div className="font-bold text-emerald-300 flex items-center gap-2">
                  <Handshake className="w-4 h-4" />
                  2. Prise en main immédiate par l&apos;équipe
                </div>
                <p className="text-slate-300 leading-relaxed">
                  Au lieu de former un nouveau collaborateur sur 5 outils différents, il dispose d&apos;un seul écran unifié avec ses priorités guidées heure par heure.
                </p>
              </div>

              <div className="bg-slate-800/90 border border-slate-700 rounded-xl p-4 space-y-1.5">
                <div className="font-bold text-blue-300 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4" />
                  3. Transparence totale pour les associés
                </div>
                <p className="text-slate-300 leading-relaxed">
                  Chaque encaissement, chaque abonnement signé et chaque heure travaillée est justifié par une preuve vérifiable (ticket Heitz, contrat signé, pointage PIN).
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          VOLET 4 : LOGICIELS REMPLACÉS VS PARTENAIRES & POTENTIEL DE REVENTE
         ===================================================================== */}
      {activeTab === 'ecosystem_resale' && (
        <div className="space-y-6">
          {/* Part A: Software Replaced */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <XCircle className="w-5 h-5 text-rose-600" />
                  A. Les 6 abonnements logiciels que C.Fitness OS REMPLACE intégralement
                </h3>
                <p className="text-xs text-slate-600 mt-0.5">
                  Ces outils tiers sont supprimés car leurs fonctions sont désormais natives dans C.Fitness OS.
                </p>
              </div>
              <span className="px-3 py-1 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold shrink-0">
                6 Abonnements Supprimés
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-[11px] font-bold uppercase text-slate-500 bg-slate-50">
                    <th className="py-2.5 px-3">Logiciel Remplacé</th>
                    <th className="py-2.5 px-3">Ancien Coût Moyen</th>
                    <th className="py-2.5 px-3">Limite de l&apos;ancien outil</th>
                    <th className="py-2.5 px-3">Module C.Fitness OS</th>
                    <th className="py-2.5 px-3">Nouveau Coût</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {REPLACED_SOFTWARE_MATRIX.map((row) => (
                    <tr key={row.replaced} className="hover:bg-slate-50/70">
                      <td className="py-3 px-3 font-bold text-slate-900">{row.replaced}</td>
                      <td className="py-3 px-3 font-mono text-rose-700 font-semibold">
                        {row.oldCost}
                      </td>
                      <td className="py-3 px-3 text-slate-600">{row.limitation}</td>
                      <td className="py-3 px-3 font-semibold text-slate-800">
                        {row.cfitnessSolution}
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-emerald-700">
                        {row.newCost}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Part B: Partner Systems Kept */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  B. Les 4 partenaires majeurs avec lesquels C.Fitness OS TRAVAILLE EN ACCORD PARFAIT
                </h3>
                <p className="text-xs text-slate-600 mt-0.5">
                  Nous conservons les piliers matériels, sportifs et comptables du club et les pilotons sans double saisie.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openMywellnessLink({})}
                  className="px-3 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Dumbbell className="w-3.5 h-3.5" />
                  <span>Ouvrir Mywellness</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {PARTNER_SYSTEMS_IN_HARMONY.map((partner) => (
                <div
                  key={partner.system}
                  className="border border-slate-200 rounded-xl p-4 space-y-2.5 bg-slate-50/40"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="text-sm font-extrabold text-slate-900">
                        {partner.system}
                      </div>
                      <div className="text-xs font-semibold text-orange-600">
                        Rôle : {partner.role}
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold shrink-0">
                      Conservé &amp; Synchronisé
                    </span>
                  </div>

                  <div className="text-xs text-slate-700 bg-white p-2.5 rounded-lg border border-slate-200/80">
                    <span className="font-bold text-slate-900">Pourquoi on le garde : </span>
                    {partner.whyKept}
                  </div>

                  <ul className="space-y-1.5 text-xs text-slate-600 pt-1">
                    {partner.howItWorksTogether.map((line, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{line}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Part C: Competitive Differentiation & B2B Resale */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-2xs">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-orange-600 flex items-center gap-1.5">
                  <Award className="w-4 h-4" />
                  <span>C. Différences Décisives &amp; Potentiel de Revente à d&apos;autres Clubs Partenaires</span>
                </div>
                <h3 className="text-base font-bold text-slate-900 mt-0.5">
                  Pourquoi C.Fitness OS est prêt à être commercialisé auprès d&apos;autres clubs et réseaux de franchises
                </h3>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {COMPETITIVE_ADVANTAGES.map((item) => (
                <div
                  key={item.criterion}
                  className="border border-slate-200 rounded-xl p-4 grid grid-cols-1 lg:grid-cols-12 gap-3 items-center"
                >
                  <div className="lg:col-span-3">
                    <div className="text-xs font-extrabold text-slate-900">{item.criterion}</div>
                  </div>
                  <div className="lg:col-span-3 bg-rose-50/60 border border-rose-200/70 rounded-lg p-2.5 text-xs">
                    <div className="font-bold text-rose-800 text-[10px] uppercase">Marché actuel</div>
                    <p className="text-slate-700 mt-0.5">{item.marketStandard}</p>
                  </div>
                  <div className="lg:col-span-3 bg-emerald-50/70 border border-emerald-200 rounded-lg p-2.5 text-xs">
                    <div className="font-bold text-emerald-800 text-[10px] uppercase">Avantage C.Fitness OS</div>
                    <p className="text-slate-800 font-medium mt-0.5">{item.cfitnessAdvantage}</p>
                  </div>
                  <div className="lg:col-span-3 bg-slate-900 text-white rounded-lg p-2.5 text-xs">
                    <div className="font-bold text-orange-400 text-[10px] uppercase">Potentiel Revente</div>
                    <p className="text-slate-200 mt-0.5">{item.resaleProof}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
