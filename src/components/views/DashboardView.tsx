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
  Power,
  Euro,
  BarChart3,
  Star,
  MapPin,
  Activity,
  Trophy,
  AlertCircle,
  FileText,
  Wrench,
  ChevronRight,
  MoreVertical,
} from 'lucide-react';
import { NavSection, ShellMode } from '../../types/cfos';
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

const PROJECT_FEATURE_CATALOG: Array<{
  category: string;
  badge: string;
  modules: Array<{
    code: string;
    title: string;
    icon: React.ComponentType<{ className?: string }>;
    targetSection?: NavSection;
    targetShell?: ShellMode;
    actionLabel: string;
    features: string[];
  }>;
}> = [
  {
    category: '1er Plan · Opérations Quotidiennes en Club (Front-Office)',
    badge: '9 Modules Opérationnels',
    modules: [
      {
        code: '01 · Ma Journée',
        title: 'Cockpit Collaborateur & Raccourcis Comptoir',
        icon: Sparkles,
        targetSection: 'my-day',
        actionLabel: 'Ouvrir 01 · Ma Journée',
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
        targetShell: 'employe',
        actionLabel: 'Ouvrir 02 · App Collaborateur',
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
        targetSection: 'planning-hr',
        actionLabel: 'Ouvrir 03 · L’Espace Planning',
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
        targetSection: 'telephony',
        actionLabel: 'Ouvrir 04 · Téléphonie & WebRTC',
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
        targetSection: 'crm',
        actionLabel: 'Ouvrir 06 · Le CRM',
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
        targetSection: 'ats',
        actionLabel: 'Ouvrir 07 · ATS & Signatures',
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
        targetSection: 'devices',
        actionLabel: 'Ouvrir 08 · Matériel Heitz & Checkup',
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
        targetShell: 'tablette',
        actionLabel: 'Ouvrir 09 · Tablette Kiosque PIN',
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
        targetSection: 'dashboard',
        actionLabel: 'Aller à la Synthèse Temps Réel',
        features: [
          'Jauge FMI en direct sur Carré de Soie et Beynost, suivi du Chiffre d’Affaires Heitz, des abonnements et des impayés SEPA.',
          'Dossier complet de présentation aux dirigeants et associés (ROI financier, logiciels remplacés vs partenaires, potentiel de revente).',
        ],
      },
      {
        code: 'Orchestration IA (6 Agents)',
        title: 'Agents IA Métier Spécialisés & Maintenance Prédictive',
        icon: BrainCircuit,
        targetSection: 'orchestrator',
        actionLabel: 'Ouvrir Orchestration IA & Maintenance',
        features: [
          '6 Agents IA dédiés : RH & Conformité IDCC 2511, CRM & Conversion, Recouvrement SEPA, Téléphonie & Résumé d’appel, Maintenance Parc, et Pilotage.',
          'Module de suivi de la maintenance préventive des machines et des stocks de consommables des 2 clubs.',
        ],
      },
      {
        code: 'Académie 3S & Livret BPJEPS',
        title: 'Formation Interne Certifiante & Suivi des Apprentis UC1–UC4',
        icon: GraduationCap,
        targetSection: 'academy',
        actionLabel: 'Ouvrir Académie 3S & Livret BPJEPS',
        features: [
          '11 modules e-learning internes (méthode de vente C.Fitness, accueil, sécurité ERP, téléphonie, hygiène) avec QCM auto-corrigés.',
          'Livret numérique de suivi des apprentis BPJEPS AF (validation des compétences UC1 à UC4 par le tuteur).',
        ],
      },
    ],
  },
];

const REPLACED_SOFTWARE_MATRIX: Array<{
  replaced: string;
  oldCost: string;
  limitation: string;
  cfitnessSolution: string;
  newCost: string;
  targetSection: NavSection;
  targetLabel: string;
}> = [
  {
    replaced: 'Ringover / Aircall (SaaS Téléphonie)',
    oldCost: '45 € à 65 € HT / mois / utilisateur (~720 € HT/mois pour 12 postes)',
    limitation: 'Coût par licence prohibitif et aucun lien natif avec le solde SEPA Heitz.',
    cfitnessSolution: 'Softphone WebRTC 12 lignes + Trunk Fixe 04 OVHcloud + Pool Mobiles 07 + Résumé IA.',
    newCost: '~14,40 € HT / mois au total (coût télécom OVHcloud pur, 0 € de licence logicielle)',
    targetSection: 'telephony',
    targetLabel: 'Tester 04 · Téléphonie',
  },
  {
    replaced: 'Skello / Combo (Planning RH & Badgeuse)',
    oldCost: '90 € à 160 € HT / mois / club (~380 € HT/mois pour 2 clubs)',
    limitation: 'Séparé du planning des cours Technogym et des RDV commerciaux Heitz.',
    cfitnessSolution: 'Espace Planning Unifié 3-en-1 (RH IDCC 2511 + Mywellness + Heitz) + Kiosque Tablette Badgeuse PIN.',
    newCost: '0 € / mois (intégré nativement)',
    targetSection: 'planning-hr',
    targetLabel: 'Tester 03 · Planning RH',
  },
  {
    replaced: 'Yousign / DocuSign (Signature Électronique)',
    oldCost: '50 € à 180 € HT / mois',
    limitation: 'Obligation de ressaisir les coordonnées du candidat et de payer à chaque contrat.',
    cfitnessSolution: 'Moteur interne de signature électronique SHA-256 avec OTP SMS et génération automatique du CDI.',
    newCost: '0 € / mois (illimité)',
    targetSection: 'ats',
    targetLabel: 'Tester 07 · Signatures 0 €',
  },
  {
    replaced: 'HubSpot / Pipedrive / Logiciel LEADS (CRM)',
    oldCost: '150 € à 400 € HT / mois',
    limitation: 'Aucune connexion native avec les portillons Heitz pour vérifier la venue réelle en séance d’essai.',
    cfitnessSolution: 'CRM Fitness C.Fitness OS connecté en temps réel aux portillons Heitz (QR Code essai, conversion 1-clic, parrainage).',
    newCost: '0 € / mois (intégré nativement)',
    targetSection: 'crm',
    targetLabel: 'Tester 06 · Le CRM',
  },
  {
    replaced: 'Outils ATS Recrutement (Flatchr / WelcomeKit)',
    oldCost: '80 € à 200 € HT / mois',
    limitation: 'Déconnecté de la création du salarié dans le planning et de la formation interne.',
    cfitnessSolution: 'ATS intégré branché sur recrutement@c.fitness avec Onboarding en 1 clic.',
    newCost: '0 € / mois (intégré nativement)',
    targetSection: 'ats',
    targetLabel: 'Tester 07 · Recrutement ATS',
  },
  {
    replaced: 'Google Calendar / WhatsApp / Fichiers Excel épars',
    oldCost: 'Perte de temps estimée à 8h / semaine / manager + perte de prospects',
    limitation: 'Informations éparpillées, aucune traçabilité opposable, risque RGPD sur les téléphones personnels.',
    cfitnessSolution: 'Cockpit unique « Ma Journée » + Grille Collaborateur + Zéro téléphone personnel.',
    newCost: '0 € / mois + Sécurité juridique totale',
    targetSection: 'my-day',
    targetLabel: 'Tester 01 · Ma Journée',
  },
];

const PARTNER_SYSTEMS_IN_HARMONY: Array<{
  id: string;
  system: string;
  role: string;
  whyKept: string;
  howItWorksTogether: string[];
  targetSection: NavSection;
  targetLabel: string;
}> = [
  {
    id: 'part-heitz',
    system: '1. Système Heitz (Portillons, SEPA, Caisse NF525 & Fidélité)',
    role: 'Cœur Adhérents, Prélèvements SEPA/EBICS, Caisse KPI & Contrôle d’Accès Portillons (RFID / Bluetooth / QR)',
    whyKept: 'Heitz est la référence métier certifiée NF525 pour la gestion bancaire SEPA et pilote déjà les lecteurs RFID/Bluetooth installés dans les clubs.',
    howItWorksTogether: [
      'Sens C.Fitness → Heitz : Lorsqu’un commercial réserve un essai ou convertit un prospect dans le CRM, C.Fitness OS crée automatiquement la fiche dans Heitz, génère le QR Code portillon et enregistre le ticket KPI.',
      'Sens Heitz → C.Fitness : Chaque passage au tourniquet ou rejet SEPA remonte instantanément dans C.Fitness OS pour bloquer le portillon, alerter l’accueil et déclencher un SMS de régularisation.',
      'Fidélité & Parrainage : attribution en 1 clic des points de fidélité, mois offerts parrains et offres d’anniversaire.',
    ],
    targetSection: 'devices',
    targetLabel: 'Ouvrir 08 · Portillons & Caisse Heitz',
  },
  {
    id: 'part-technogym',
    system: '2. Technogym Mywellness Cloud & 2× Stations Technogym Checkup',
    role: 'Suivi Sportif Plateau, Programmes d’Entraînement, Cours Collectifs & Bilans Biométriques 3D / BIA',
    whyKept: 'L’écosystème Technogym (Mywellness + balances révolutionnaires Checkup) offre une expérience sportive mondiale irremplaçable aux adhérents.',
    howItWorksTogether: [
      'Aucune double saisie : C.Fitness OS synchronise les créneaux de bilans et de cours Mywellness directement dans « L’Espace Planning » centralisé.',
      'Passerelle contextuelle 1-clic : Depuis la fiche d’un adhérent ou le planning coach, un bouton ouvre directement son dossier biométrique Technogym Checkup (Wellness Age™, masse musculaire, mobilité).',
    ],
    targetSection: 'devices',
    targetLabel: 'Ouvrir 08 · Stations Technogym Checkup',
  },
  {
    id: 'part-silae',
    system: '3. Silae Paie (Cabinet Comptable & Social)',
    role: 'Édition Officielle des Bulletins de Paie & Déclarations Sociales (DSN / URSSAF)',
    whyKept: 'Le cabinet comptable utilise Silae pour garantir la conformité légale des fiches de paie et des déclarations URSSAF.',
    howItWorksTogether: [
      'C.Fitness OS agit comme le moteur de pré-paie automatisé en amont de Silae.',
      'Les pointages de la badgeuse PIN, les heures supplémentaires, les congés validés et les commissions commerciales sont consolidés automatiquement.',
      'En fin de mois, la Direction génère en 1 clic le fichier d’export normé prêt à être importé dans Silae par le cabinet comptable.',
    ],
    targetSection: 'planning-hr',
    targetLabel: 'Ouvrir 03 · Pré-Paie & Export Silae',
  },
  {
    id: 'part-ovh',
    system: '4. OVHcloud Télécom (Lignes Fixes 04 & Pool Mobiles 07)',
    role: 'Infrastructure Opérateur Télécom Pure (Voix Fixe, Voix Mobile & SMS)',
    whyKept: 'Indispensable pour acheminer les appels sur le réseau téléphonique public français en respectant strictement la réglementation ARCEP.',
    howItWorksTogether: [
      'C.Fitness OS fournit toute l’interface logicielle (WebRTC, Studio SVI, Power-Dialer, écoute manager, enregistrement, transcription IA).',
      'OVHcloud ne facture plus que la consommation télécom pure (~1,20 € HT/mois/ligne fixe), supprimant 100 % des licences logicielles par poste.',
    ],
    targetSection: 'telephony',
    targetLabel: 'Ouvrir 04 · Téléphonie OVHcloud 04/07',
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
  | 'overview'
  | 'synthese'
  | 'features'
  | 'pitch_roi'
  | 'ecosystem_resale';

export function DashboardView() {
  const {
    clubs,
    clubFilter,
    setClubFilter,
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
    themeMode,
  } = useCfos();

  const [activeTab, setActiveTab] = useState<ExecutiveDashboardTab>('overview');
  const [periodFilter, setPeriodFilter] = useState<'7d' | '30d' | '90d'>('30d');
  const [subClubFilter, setSubClubFilter] = useState<'all' | 'center' | 'place'>('all');
  const [hoveredChartIdx, setHoveredChartIdx] = useState<number>(3);
  const [enabledModules, setEnabledModules] = useState<Record<string, boolean>>({});
  const [partnerSyncMap, setPartnerSyncMap] = useState<Record<string, boolean>>({
    'part-heitz': true,
    'part-technogym': true,
    'part-silae': true,
    'part-ovh': true,
  });

  const isDark = themeMode === 'dark';

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

  // Dynamic values based on clubFilter and periodFilter
  const multiplier = periodFilter === '7d' ? 0.25 : periodFilter === '90d' ? 2.9 : 1;
  const totalActiveMembers =
    clubFilter === 'carre-de-soie' ? 682 : clubFilter === 'beynost' ? 566 : 1248;
  const baseRevenue =
    clubFilter === 'carre-de-soie' ? 54230 : clubFilter === 'beynost' ? 48220 : 102450;
  const displayedRevenue = Math.round(baseRevenue * multiplier);
  const attendanceRate =
    clubFilter === 'carre-de-soie' ? 76 : clubFilter === 'beynost' ? 80 : 78;

  const chartPoints = [
    { label: '15 mars', dateFull: 'Sam. 15 mars', center: 120, place: 95, total: 215 },
    { label: '22 mars', dateFull: 'Sam. 22 mars', center: 145, place: 118, total: 263 },
    { label: '29 mars', dateFull: 'Sam. 29 mars', center: 162, place: 132, total: 294 },
    { label: '2 avr.', dateFull: 'Mer. 2 avr.', center: 168, place: 144, total: 312 },
    { label: '5 avr.', dateFull: 'Sam. 5 avr.', center: 154, place: 126, total: 280 },
    { label: '12 avr.', dateFull: 'Sam. 12 avr.', center: 182, place: 158, total: 340 },
  ];
  const activePoint = chartPoints[hoveredChartIdx] ?? chartPoints[3];

  return (
    <div className="space-y-6">
      {/* =====================================================================
          BARRE DE SÉLECTION DES VUES DU TABLEAU DE BORD & DOSSIER DIRIGEANTS
         ===================================================================== */}
      <div
        className={`rounded-2xl border p-2 flex flex-wrap items-center justify-between gap-2 transition-colors ${
          isDark
            ? 'bg-[#131826] border-slate-800/90 text-slate-200'
            : 'bg-white border-slate-200/80 text-slate-700 shadow-2xs'
        }`}
      >
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'overview'
                ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-xs'
                : isDark
                ? 'text-slate-300 hover:bg-slate-800'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Vue d&apos;ensemble (C.Fitness OS)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('synthese')}
            className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'synthese'
                ? 'bg-violet-600 text-white shadow-xs'
                : isDark
                ? 'text-slate-300 hover:bg-slate-800'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>1. Pilotage Heitz &amp; FMI</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('features')}
            className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'features'
                ? 'bg-violet-600 text-white shadow-xs'
                : isDark
                ? 'text-slate-300 hover:bg-slate-800'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>2. Catalogue des Fonctions</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('pitch_roi')}
            className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'pitch_roi'
                ? 'bg-violet-600 text-white shadow-xs'
                : isDark
                ? 'text-slate-300 hover:bg-slate-800'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Presentation className="w-3.5 h-3.5" />
            <span>3. Dossier Dirigeants &amp; ROI</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('ecosystem_resale')}
            className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'ecosystem_resale'
                ? 'bg-violet-600 text-white shadow-xs'
                : isDark
                ? 'text-slate-300 hover:bg-slate-800'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <GitMerge className="w-3.5 h-3.5" />
            <span>4. Écosystème &amp; Revente</span>
          </button>
        </div>

        <button
          type="button"
          onClick={() => setShellMode('employe')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer ${
            isDark
              ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30 hover:bg-violet-500/30'
              : 'bg-violet-50 text-violet-700 border border-violet-200 hover:bg-violet-100'
          }`}
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>Ouvrir Vue Tablette &amp; Mobile</span>
        </button>
      </div>

      {/* =====================================================================
          VOLET 0 (PAR DÉFAUT) : TABLEAU DE BORD VISUEL C.FITNESS OS
          ("Bonjour Thomas ! 👋 — Voici la vue d'ensemble de vos deux clubs aujourd'hui.")
         ===================================================================== */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
          {/* LEFT MAIN COLUMN (9 cols on xl) */}
          <div className="xl:col-span-9 space-y-5">
            {/* Greeting Row + Period Dropdown */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h1
                  className={`text-2xl sm:text-3xl font-extrabold tracking-tight flex items-center gap-2 ${
                    isDark ? 'text-white' : 'text-slate-900'
                  }`}
                >
                  <span>
                    Bonjour{' '}
                    {currentUser.id === 'emp-mario' ? 'Thomas' : currentUser.firstName} !
                  </span>
                  <span aria-hidden="true">👋</span>
                </h1>
                <p className={`text-xs sm:text-sm mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Voici la vue d&apos;ensemble de vos deux clubs aujourd&apos;hui.
                </p>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto">
                <select
                  aria-label="Sélectionner la période"
                  value={periodFilter}
                  onChange={(e) => setPeriodFilter(e.target.value as '7d' | '30d' | '90d')}
                  className={`px-3.5 py-2 rounded-xl border text-xs font-semibold outline-hidden cursor-pointer ${
                    isDark
                      ? 'bg-[#131826] border-slate-800 text-slate-200'
                      : 'bg-white border-slate-200 text-slate-700 shadow-2xs'
                  }`}
                >
                  <option value="30d">30 derniers jours</option>
                  <option value="7d">7 derniers jours</option>
                  <option value="90d">Ce trimestre (90 j)</option>
                </select>
              </div>
            </div>

            {/* ROW 1: 4 SIGNATURE KPI CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* KPI 1: Adhérents actifs */}
              <div
                onClick={() => setActiveSection('devices', 'adherents')}
                className={`rounded-2xl border p-4 cursor-pointer transition-all hover:scale-[1.01] ${
                  isDark
                    ? 'bg-[#131826] border-slate-800/90 hover:border-violet-500/40'
                    : 'bg-white border-slate-200/80 shadow-2xs hover:border-violet-300'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-violet-600 to-purple-400 text-white flex items-center justify-center shadow-sm shrink-0">
                      <Users className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <div className={`text-xs font-medium truncate ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        Adhérents actifs
                      </div>
                      <div className="flex items-baseline gap-1.5 mt-0.5 whitespace-nowrap">
                        <span
                          className={`text-xl xl:text-2xl font-black tabular-nums ${
                            isDark ? 'text-white' : 'text-slate-900'
                          }`}
                        >
                          {totalActiveMembers.toLocaleString('fr-FR')}
                        </span>
                        <span className="text-[11px] font-bold text-emerald-500">↑ +12%</span>
                      </div>
                      <div className="text-[10px] text-slate-400">vs mois dernier</div>
                    </div>
                  </div>
                  <MoreVertical className="w-4 h-4 text-slate-400 shrink-0" />
                </div>
                <div className="mt-2.5 flex items-end justify-end gap-1 h-6">
                  {[30, 42, 38, 55, 64, 72, 85, 100].map((h, i) => (
                    <div
                      key={i}
                      style={{ height: `${h}%` }}
                      className="w-1.5 rounded-t bg-gradient-to-t from-violet-600/40 to-violet-500"
                    />
                  ))}
                </div>
              </div>

              {/* KPI 2: Chiffre d'affaires (mois) */}
              <div
                onClick={() => setActiveSection('devices', 'finances')}
                className={`rounded-2xl border p-4 cursor-pointer transition-all hover:scale-[1.01] ${
                  isDark
                    ? 'bg-[#131826] border-slate-800/90 hover:border-emerald-500/40'
                    : 'bg-white border-slate-200/80 shadow-2xs hover:border-emerald-300'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-400 text-white flex items-center justify-center shadow-sm shrink-0">
                      <Euro className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <div className={`text-xs font-medium truncate ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        Chiffre d&apos;affaires (mois)
                      </div>
                      <div className="flex items-baseline gap-1.5 mt-0.5 whitespace-nowrap">
                        <span
                          className={`text-lg xl:text-xl font-black tabular-nums ${
                            isDark ? 'text-white' : 'text-slate-900'
                          }`}
                        >
                          {displayedRevenue.toLocaleString('fr-FR')} €
                        </span>
                        <span className="text-[11px] font-bold text-emerald-500">↑ +8%</span>
                      </div>
                      <div className="text-[10px] text-slate-400">vs mois dernier</div>
                    </div>
                  </div>
                  <MoreVertical className="w-4 h-4 text-slate-400 shrink-0" />
                </div>
                <div className="mt-2.5 flex items-end justify-end gap-1 h-6">
                  {[35, 45, 50, 48, 66, 78, 88, 100].map((h, i) => (
                    <div
                      key={i}
                      style={{ height: `${h}%` }}
                      className="w-1.5 rounded-t bg-gradient-to-t from-emerald-600/40 to-emerald-400"
                    />
                  ))}
                </div>
              </div>

              {/* KPI 3: Taux de fréquentation */}
              <div
                onClick={() => setActiveSection('planning-hr', 'planning')}
                className={`rounded-2xl border p-4 cursor-pointer transition-all hover:scale-[1.01] ${
                  isDark
                    ? 'bg-[#131826] border-slate-800/90 hover:border-blue-500/40'
                    : 'bg-white border-slate-200/80 shadow-2xs hover:border-blue-300'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-blue-600 to-sky-400 text-white flex items-center justify-center shadow-sm shrink-0">
                      <BarChart3 className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <div className={`text-xs font-medium truncate ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        Taux de fréquentation
                      </div>
                      <div className="flex items-baseline gap-1.5 mt-0.5 whitespace-nowrap">
                        <span
                          className={`text-xl xl:text-2xl font-black tabular-nums ${
                            isDark ? 'text-white' : 'text-slate-900'
                          }`}
                        >
                          {attendanceRate} %
                        </span>
                        <span className="text-[11px] font-bold text-emerald-500">↑ +6%</span>
                      </div>
                      <div className="text-[10px] text-slate-400">Capacité FMI temps réel</div>
                    </div>
                  </div>
                  <MoreVertical className="w-4 h-4 text-slate-400 shrink-0" />
                </div>
                <div className="mt-2.5 flex items-end justify-end gap-1 h-6">
                  {[28, 38, 46, 58, 65, 74, 86, 100].map((h, i) => (
                    <div
                      key={i}
                      style={{ height: `${h}%` }}
                      className="w-1.5 rounded-t bg-gradient-to-t from-blue-600/40 to-blue-400"
                    />
                  ))}
                </div>
              </div>

              {/* KPI 4: Satisfaction adhérents */}
              <div
                onClick={() => setActiveSection('crm')}
                className={`rounded-2xl border p-4 cursor-pointer transition-all hover:scale-[1.01] ${
                  isDark
                    ? 'bg-[#131826] border-slate-800/90 hover:border-amber-500/40'
                    : 'bg-white border-slate-200/80 shadow-2xs hover:border-amber-300'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-400 text-white flex items-center justify-center shadow-sm shrink-0">
                      <Star className="w-5 h-5 fill-white" />
                    </div>
                    <div className="min-w-0">
                      <div className={`text-xs font-medium truncate ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        Satisfaction adhérents
                      </div>
                      <div className="flex items-baseline gap-1.5 mt-0.5 whitespace-nowrap">
                        <span
                          className={`text-xl xl:text-2xl font-black tabular-nums ${
                            isDark ? 'text-white' : 'text-slate-900'
                          }`}
                        >
                          4,8 / 5
                        </span>
                        <span className="text-[11px] font-bold text-emerald-500">↑ +0,2</span>
                      </div>
                      <div className="text-[10px] text-slate-400">Avis vérifiés bi-club</div>
                    </div>
                  </div>
                  <MoreVertical className="w-4 h-4 text-slate-400 shrink-0" />
                </div>
                <div className="mt-2.5 flex items-end justify-end gap-1 h-6">
                  {[40, 48, 55, 62, 70, 80, 90, 100].map((h, i) => (
                    <div
                      key={i}
                      style={{ height: `${h}%` }}
                      className="w-1.5 rounded-t bg-gradient-to-t from-amber-500/40 to-amber-400"
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* ROW 2: 2 CLUB OVERVIEW CARDS SIDE-BY-SIDE (C.Fitness Center & C.Fitness Place) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Club Card 1: C.Fitness Center (Carré de Soie / Lyon) */}
              <div
                onClick={() =>
                  setClubFilter(clubFilter === 'carre-de-soie' ? 'all' : 'carre-de-soie')
                }
                className={`rounded-2xl border p-4 cursor-pointer transition-all ${
                  clubFilter === 'carre-de-soie'
                    ? 'ring-2 ring-violet-500'
                    : ''
                } ${
                  isDark
                    ? 'bg-[#131826] border-slate-800/90 hover:border-violet-500/40'
                    : 'bg-white border-slate-200/80 shadow-2xs hover:border-violet-300'
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3.5 min-w-0">
                    {/* Stylized Gym Interior Visual Thumbnail */}
                    <div className="w-24 h-14 rounded-xl bg-gradient-to-br from-slate-800 via-zinc-700 to-amber-900/80 relative overflow-hidden shrink-0 border border-white/10 flex items-end p-1.5">
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(251,191,36,0.35),transparent_60%)]" />
                      <Dumbbell className="w-5 h-5 text-amber-300/90 relative z-10" />
                      <span className="text-[9px] font-black text-white/90 ml-1 relative z-10 tracking-tight">
                        CENTER
                      </span>
                    </div>
                    <div className="min-w-0">
                      <h2
                        className={`text-base font-extrabold truncate ${
                          isDark ? 'text-white' : 'text-slate-900'
                        }`}
                      >
                        C.Fitness Center
                      </h2>
                      <div className="flex items-center gap-1 text-xs text-slate-400 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">Lyon 3e · Carré de Soie</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                        isDark
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}
                    >
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      Ouvert
                    </span>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </div>
                </div>

                {/* 4 Club Metrics Row */}
                <div
                  className={`mt-4 pt-3.5 border-t grid grid-cols-2 sm:grid-cols-4 gap-2 ${
                    isDark ? 'border-slate-800/80' : 'border-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-violet-500/15 text-violet-500 flex items-center justify-center shrink-0">
                      <Users className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-baseline gap-1 whitespace-nowrap">
                        <span className={`text-xs font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
                          682
                        </span>
                        <span className="text-[10px] font-bold text-emerald-500">↑ +10%</span>
                      </div>
                      <div className="text-[10px] text-slate-400 truncate">adhérents actifs</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-amber-500/15 text-amber-500 flex items-center justify-center shrink-0">
                      <Euro className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-baseline gap-1 whitespace-nowrap">
                        <span className={`text-xs font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
                          54 230 €
                        </span>
                        <span className="text-[10px] font-bold text-emerald-500">↑ +7%</span>
                      </div>
                      <div className="text-[10px] text-slate-400 truncate">CA (mois)</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-blue-500/15 text-blue-500 flex items-center justify-center shrink-0">
                      <Activity className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-baseline gap-1 whitespace-nowrap">
                        <span className={`text-xs font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
                          76 %
                        </span>
                        <span className="text-[10px] font-bold text-emerald-500">↑ +5%</span>
                      </div>
                      <div className="text-[10px] text-slate-400 truncate">fréquentation</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-pink-500/15 text-pink-500 flex items-center justify-center shrink-0">
                      <Calendar className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-baseline gap-1 whitespace-nowrap">
                        <span className={`text-xs font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
                          28
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 truncate">cours / semaine</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Club Card 2: C.Fitness Place (Beynost / Lyon) */}
              <div
                onClick={() => setClubFilter(clubFilter === 'beynost' ? 'all' : 'beynost')}
                className={`rounded-2xl border p-4 cursor-pointer transition-all ${
                  clubFilter === 'beynost' ? 'ring-2 ring-blue-500' : ''
                } ${
                  isDark
                    ? 'bg-[#131826] border-slate-800/90 hover:border-blue-500/40'
                    : 'bg-white border-slate-200/80 shadow-2xs hover:border-blue-300'
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3.5 min-w-0">
                    {/* Stylized Gym Interior Visual Thumbnail */}
                    <div className="w-24 h-14 rounded-xl bg-gradient-to-br from-slate-800 via-indigo-900 to-sky-700 relative overflow-hidden shrink-0 border border-white/10 flex items-end p-1.5">
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,0.35),transparent_60%)]" />
                      <Dumbbell className="w-5 h-5 text-sky-300/90 relative z-10" />
                      <span className="text-[9px] font-black text-white/90 ml-1 relative z-10 tracking-tight">
                        PLACE
                      </span>
                    </div>
                    <div className="min-w-0">
                      <h2
                        className={`text-base font-extrabold truncate ${
                          isDark ? 'text-white' : 'text-slate-900'
                        }`}
                      >
                        C.Fitness Place
                      </h2>
                      <div className="flex items-center gap-1 text-xs text-slate-400 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">Lyon 6e · Beynost ZAC</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                        isDark
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}
                    >
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      Ouvert
                    </span>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </div>
                </div>

                {/* 4 Club Metrics Row */}
                <div
                  className={`mt-4 pt-3.5 border-t grid grid-cols-2 sm:grid-cols-4 gap-2 ${
                    isDark ? 'border-slate-800/80' : 'border-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-violet-500/15 text-violet-500 flex items-center justify-center shrink-0">
                      <Users className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-baseline gap-1 whitespace-nowrap">
                        <span className={`text-xs font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
                          566
                        </span>
                        <span className="text-[10px] font-bold text-emerald-500">↑ +14%</span>
                      </div>
                      <div className="text-[10px] text-slate-400 truncate">adhérents actifs</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-amber-500/15 text-amber-500 flex items-center justify-center shrink-0">
                      <Euro className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-baseline gap-1 whitespace-nowrap">
                        <span className={`text-xs font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
                          48 220 €
                        </span>
                        <span className="text-[10px] font-bold text-emerald-500">↑ +9%</span>
                      </div>
                      <div className="text-[10px] text-slate-400 truncate">CA (mois)</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-blue-500/15 text-blue-500 flex items-center justify-center shrink-0">
                      <Activity className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-baseline gap-1 whitespace-nowrap">
                        <span className={`text-xs font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
                          80 %
                        </span>
                        <span className="text-[10px] font-bold text-emerald-500">↑ +7%</span>
                      </div>
                      <div className="text-[10px] text-slate-400 truncate">fréquentation</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-pink-500/15 text-pink-500 flex items-center justify-center shrink-0">
                      <Calendar className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-baseline gap-1 whitespace-nowrap">
                        <span className={`text-xs font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
                          32
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 truncate">cours / semaine</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ACTIVE CLUB FOCUS BANNER WHEN A SPECIFIC CLUB IS SELECTED */}
            {clubFilter !== 'all' && (
              <div
                className={`rounded-2xl border p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 ${
                  isDark
                    ? 'bg-violet-950/30 border-violet-500/40 text-slate-100'
                    : 'bg-violet-50/80 border-violet-200 text-slate-900'
                }`}
              >
                <div className="space-y-0.5">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-violet-500">
                    Focus Club Actif · Filtrage appliqué sur tous les modules
                  </div>
                  <div className="text-sm font-extrabold">
                    {clubFilter === 'carre-de-soie'
                      ? 'C.Fitness Center (Lyon 3e · Carré de Soie) — 682 adhérents · 54 230 € CA · 28 cours/sem'
                      : 'C.Fitness Place (Lyon 6e · Beynost ZAC) — 566 adhérents · 48 220 € CA · 32 cours/sem'}
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2 shrink-0 text-xs">
                  <button
                    type="button"
                    onClick={() => setActiveSection('devices', 'adherents')}
                    className="px-2.5 py-1.5 rounded-xl bg-violet-600 text-white font-bold cursor-pointer"
                  >
                    Adhérents du club →
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveSection('planning-hr', 'cours-collectifs')}
                    className="px-2.5 py-1.5 rounded-xl bg-white text-slate-800 border border-slate-200 font-bold cursor-pointer"
                  >
                    Cours collectifs →
                  </button>
                  <button
                    type="button"
                    onClick={() => setClubFilter('all')}
                    className="px-2.5 py-1.5 rounded-xl bg-slate-200/80 text-slate-700 font-semibold cursor-pointer"
                  >
                    Voir les 2 clubs
                  </button>
                </div>
              </div>
            )}

            {/* ROW 3: 3 ANALYTICS CARDS (Fréquentation des clubs, Répartition des abonnements, Top 5 des cours collectifs) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              {/* Analytics 1: Fréquentation des clubs (4 cols) */}
              <div
                className={`lg:col-span-4 rounded-2xl border p-4 flex flex-col justify-between ${
                  isDark
                    ? 'bg-[#131826] border-slate-800/90'
                    : 'bg-white border-slate-200/80 shadow-2xs'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-violet-500/15 text-violet-500 flex items-center justify-center">
                        <TrendingUp className="w-3.5 h-3.5" />
                      </div>
                      <h3 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        Fréquentation des clubs
                      </h3>
                    </div>
                    <span
                      className={`text-[11px] px-2.5 py-1 rounded-lg border ${
                        isDark
                          ? 'bg-slate-800/80 border-slate-700 text-slate-300'
                          : 'bg-slate-50 border-slate-200 text-slate-600'
                      }`}
                    >
                      30 derniers jours ⌄
                    </span>
                  </div>

                  {/* Legend */}
                  <div className="flex flex-wrap items-center gap-3 mt-2.5 text-[11px] text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-violet-500" />
                      C.Fitness Center
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-blue-500" />
                      C.Fitness Place
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-indigo-400" />
                      Total
                    </span>
                  </div>
                </div>

                {/* SVG Line Chart + Interactive Tooltip */}
                <div className="relative mt-4 pt-2">
                  {/* Floating Tooltip Card (Mer. 2 avr. — Total 312 / Center 168 / Place 144) */}
                  <div
                    className={`absolute right-4 top-0 z-10 rounded-xl border p-2.5 text-[11px] shadow-md ${
                      isDark
                        ? 'bg-[#1B2236] border-slate-700 text-slate-200'
                        : 'bg-white border-slate-200 text-slate-700'
                    }`}
                  >
                    <div className="font-bold mb-1">{activePoint.dateFull}</div>
                    <div className="flex items-center justify-between gap-4">
                      <span className="flex items-center gap-1 text-indigo-400">● Total</span>
                      <span className="font-bold tabular-nums">{activePoint.total}</span>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <span className="flex items-center gap-1 text-violet-500">● Center</span>
                      <span className="font-bold tabular-nums">{activePoint.center}</span>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <span className="flex items-center gap-1 text-blue-500">● Place</span>
                      <span className="font-bold tabular-nums">{activePoint.place}</span>
                    </div>
                  </div>

                  <svg viewBox="0 0 360 150" className="w-full h-36 overflow-visible">
                    {/* Horizontal grid lines */}
                    {[25, 55, 85, 115].map((y, idx) => (
                      <g key={y}>
                        <line
                          x1="28"
                          y1={y}
                          x2="350"
                          y2={y}
                          stroke={isDark ? '#1E293B' : '#F1F5F9'}
                          strokeWidth="1"
                        />
                        <text
                          x="0"
                          y={y + 3}
                          fontSize="9"
                          fill="#94A3B8"
                        >
                          {(4 - idx) * 100}
                        </text>
                      </g>
                    ))}

                    {/* Total Line (Indigo/Slate) */}
                    <polyline
                      fill="none"
                      stroke="#818CF8"
                      strokeWidth="2"
                      points="35,75 95,58 155,44 215,38 275,52 335,28"
                    />
                    {/* Center Line (Purple) */}
                    <polyline
                      fill="none"
                      stroke="#8B5CF6"
                      strokeWidth="2.5"
                      points="35,98 95,86 155,74 215,68 275,78 335,62"
                    />
                    {/* Place Line (Blue) */}
                    <polyline
                      fill="none"
                      stroke="#3B82F6"
                      strokeWidth="2.5"
                      points="35,112 95,100 155,89 215,84 275,93 335,76"
                    />

                    {/* Interactive data points */}
                    {[35, 95, 155, 215, 275, 335].map((x, idx) => (
                      <g
                        key={x}
                        onClick={() => setHoveredChartIdx(idx)}
                        className="cursor-pointer"
                      >
                        <circle
                          cx={x}
                          cy={[75, 58, 44, 38, 52, 28][idx]}
                          r={hoveredChartIdx === idx ? 5 : 3}
                          fill="#818CF8"
                        />
                        <circle
                          cx={x}
                          cy={[98, 86, 74, 68, 78, 62][idx]}
                          r={hoveredChartIdx === idx ? 5 : 3}
                          fill="#8B5CF6"
                        />
                        <circle
                          cx={x}
                          cy={[112, 100, 89, 84, 93, 76][idx]}
                          r={hoveredChartIdx === idx ? 5 : 3}
                          fill="#3B82F6"
                        />
                      </g>
                    ))}
                  </svg>

                  {/* X-Axis Labels */}
                  <div className="flex items-center justify-between pl-7 pr-2 text-[10px] text-slate-400">
                    {chartPoints.map((pt, idx) => (
                      <button
                        key={pt.label}
                        type="button"
                        onClick={() => setHoveredChartIdx(idx)}
                        className={`cursor-pointer ${
                          hoveredChartIdx === idx ? 'font-bold text-violet-500' : ''
                        }`}
                      >
                        {pt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Analytics 2: Répartition des abonnements (4 cols) */}
              <div
                className={`lg:col-span-4 rounded-2xl border p-4 flex flex-col justify-between ${
                  isDark
                    ? 'bg-[#131826] border-slate-800/90'
                    : 'bg-white border-slate-200/80 shadow-2xs'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <h3 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    Répartition des abonnements
                  </h3>
                  <select
                    aria-label="Filtrer les abonnements par club"
                    value={subClubFilter}
                    onChange={(e) =>
                      setSubClubFilter(e.target.value as 'all' | 'center' | 'place')
                    }
                    className={`text-[10px] px-2 py-1 rounded-lg border outline-hidden cursor-pointer ${
                      isDark
                        ? 'bg-slate-800 border-slate-700 text-slate-300'
                        : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    <option value="all">Tous les clubs</option>
                    <option value="center">Center</option>
                    <option value="place">Place</option>
                  </select>
                </div>

                {/* Donut Chart + Legend */}
                <div className="my-3 flex flex-col xl:flex-row items-center gap-3">
                  <div className="relative w-28 h-28 shrink-0 flex items-center justify-center">
                    <svg viewBox="0 0 36 36" className="w-28 h-28 -rotate-90">
                      <circle
                        cx="18"
                        cy="18"
                        r="14"
                        fill="transparent"
                        stroke={isDark ? '#1E293B' : '#F1F5F9'}
                        strokeWidth="4.5"
                      />
                      {/* Annuel 41% (Blue/Cyan) */}
                      <circle
                        cx="18"
                        cy="18"
                        r="14"
                        fill="transparent"
                        stroke="#3B82F6"
                        strokeWidth="4.5"
                        strokeDasharray="36 64"
                        strokeDashoffset="0"
                      />
                      {/* Mensuel 32% (Purple) */}
                      <circle
                        cx="18"
                        cy="18"
                        r="14"
                        fill="transparent"
                        stroke="#8B5CF6"
                        strokeWidth="4.5"
                        strokeDasharray="28 72"
                        strokeDashoffset="-36"
                      />
                      {/* Étudiant 12% (Emerald) */}
                      <circle
                        cx="18"
                        cy="18"
                        r="14"
                        fill="transparent"
                        stroke="#10B981"
                        strokeWidth="4.5"
                        strokeDasharray="11 89"
                        strokeDashoffset="-64"
                      />
                      {/* Corporate 8% + Autres 7% */}
                      <circle
                        cx="18"
                        cy="18"
                        r="14"
                        fill="transparent"
                        stroke="#F59E0B"
                        strokeWidth="4.5"
                        strokeDasharray="13 87"
                        strokeDashoffset="-75"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                      <span
                        className={`text-base font-black leading-none ${
                          isDark ? 'text-white' : 'text-slate-900'
                        }`}
                      >
                        {subClubFilter === 'center'
                          ? '682'
                          : subClubFilter === 'place'
                          ? '566'
                          : '1 248'}
                      </span>
                      <span className="text-[9px] text-slate-400 mt-0.5">adhérents actifs</span>
                    </div>
                  </div>

                  <div className="w-full space-y-1.5 text-[11px]">
                    {[
                      { label: 'Mensuel', pct: '32%', count: 399, dot: 'bg-violet-500' },
                      { label: 'Annuel', pct: '41%', count: 512, dot: 'bg-blue-500' },
                      { label: 'Étudiant', pct: '12%', count: 150, dot: 'bg-emerald-500' },
                      { label: 'Corporate', pct: '8%', count: 100, dot: 'bg-amber-500' },
                      { label: 'Autres', pct: '7%', count: 87, dot: 'bg-pink-500' },
                    ].map((row) => (
                      <div
                        key={row.label}
                        onClick={() => setActiveSection('devices', 'adherents')}
                        className="flex items-center justify-between gap-1 cursor-pointer hover:opacity-80"
                      >
                        <span className="flex items-center gap-1.5 truncate text-slate-400">
                          <span className={`w-2 h-2 rounded-full ${row.dot} shrink-0`} />
                          <span className={isDark ? 'text-slate-300' : 'text-slate-700'}>
                            {row.label}
                          </span>
                        </span>
                        <div className="flex items-center gap-2 shrink-0 tabular-nums">
                          <span className="font-bold">{row.pct}</span>
                          <span className="text-slate-400 w-7 text-right">{row.count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Analytics 3: Top 5 des cours collectifs (4 cols) */}
              <div
                className={`lg:col-span-4 rounded-2xl border p-4 flex flex-col justify-between ${
                  isDark
                    ? 'bg-[#131826] border-slate-800/90'
                    : 'bg-white border-slate-200/80 shadow-2xs'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-amber-500 shrink-0" />
                    <h3 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      Top 5 des cours collectifs
                    </h3>
                  </div>
                  <span
                    className={`text-[10px] px-2 py-1 rounded-lg border ${
                      isDark
                        ? 'bg-slate-800 border-slate-700 text-slate-300'
                        : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    Tous les clubs ⌄
                  </span>
                </div>

                <div className="mt-3 space-y-2.5">
                  {[
                    {
                      rank: 1,
                      name: 'BodyPump',
                      pct: 92,
                      barColor: 'from-rose-500 to-pink-500',
                      badgeBg: 'bg-rose-500/15 text-rose-500',
                    },
                    {
                      rank: 2,
                      name: 'Yoga',
                      pct: 88,
                      barColor: 'from-amber-500 to-orange-400',
                      badgeBg: 'bg-amber-500/15 text-amber-500',
                    },
                    {
                      rank: 3,
                      name: 'HIIT',
                      pct: 86,
                      barColor: 'from-emerald-500 to-teal-400',
                      badgeBg: 'bg-emerald-500/15 text-emerald-500',
                    },
                    {
                      rank: 4,
                      name: 'Pilates',
                      pct: 81,
                      barColor: 'from-violet-500 to-purple-500',
                      badgeBg: 'bg-violet-500/15 text-violet-500',
                    },
                    {
                      rank: 5,
                      name: 'Cycling',
                      pct: 78,
                      barColor: 'from-sky-500 to-blue-500',
                      badgeBg: 'bg-sky-500/15 text-sky-500',
                    },
                  ].map((course) => (
                    <div
                      key={course.name}
                      onClick={() => setActiveSection('planning-hr', 'cours-collectifs')}
                      className="flex items-center gap-2.5 text-xs cursor-pointer group"
                    >
                      <span className="w-4 text-[11px] font-bold text-slate-400">
                        {course.rank}
                      </span>
                      <div
                        className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-[11px] shrink-0 ${course.badgeBg}`}
                      >
                        <Activity className="w-3.5 h-3.5" />
                      </div>
                      <span
                        className={`w-20 font-semibold truncate group-hover:text-violet-500 ${
                          isDark ? 'text-slate-200' : 'text-slate-800'
                        }`}
                      >
                        {course.name}
                      </span>
                      <div
                        className={`flex-1 h-2 rounded-full overflow-hidden ${
                          isDark ? 'bg-slate-800' : 'bg-slate-100'
                        }`}
                      >
                        <div
                          style={{ width: `${course.pct}%` }}
                          className={`h-full rounded-full bg-gradient-to-r ${course.barColor}`}
                        />
                      </div>
                      <span
                        className={`w-9 text-right font-bold tabular-nums ${
                          isDark ? 'text-white' : 'text-slate-900'
                        }`}
                      >
                        {course.pct}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT SIDEBAR COLUMN (3 cols on xl): Actions importantes & Activités du jour */}
          <div className="xl:col-span-3 space-y-5">
            {/* Card 1: Actions importantes (3) */}
            <div
              className={`rounded-2xl border p-4 space-y-3 ${
                isDark
                  ? 'bg-[#131826] border-slate-800/90'
                  : 'bg-white border-slate-200/80 shadow-2xs'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-violet-500/15 text-violet-500 flex items-center justify-center">
                    <AlertCircle className="w-3.5 h-3.5" />
                  </div>
                  <h3 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    Actions importantes
                  </h3>
                </div>
                <span className="w-5 h-5 rounded-full bg-rose-500 text-white text-[11px] font-bold flex items-center justify-center">
                  3
                </span>
              </div>

              <div className="space-y-2.5">
                {/* Action 1: 5 impayés à relancer */}
                <button
                  type="button"
                  onClick={() => setActiveSection('devices', 'finances')}
                  className={`w-full p-3 rounded-xl border text-left flex items-center justify-between gap-2 transition-colors cursor-pointer ${
                    isDark
                      ? 'bg-[#191F31] border-slate-800 hover:border-rose-500/50'
                      : 'bg-rose-50/50 border-rose-100 hover:bg-rose-50'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-rose-500/15 text-rose-500 flex items-center justify-center shrink-0">
                      <AlertCircle className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div
                        className={`text-xs font-bold truncate ${
                          isDark ? 'text-white' : 'text-slate-900'
                        }`}
                      >
                        5 impayés à relancer
                      </div>
                      <div className="text-[11px] text-slate-400 truncate">
                        Représentent 1 250 €
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                </button>

                {/* Action 2: 2 contrats en attente */}
                <button
                  type="button"
                  onClick={() => setActiveSection('ats', 'documents')}
                  className={`w-full p-3 rounded-xl border text-left flex items-center justify-between gap-2 transition-colors cursor-pointer ${
                    isDark
                      ? 'bg-[#191F31] border-slate-800 hover:border-amber-500/50'
                      : 'bg-amber-50/50 border-amber-100 hover:bg-amber-50'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-500 flex items-center justify-center shrink-0">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div
                        className={`text-xs font-bold truncate ${
                          isDark ? 'text-white' : 'text-slate-900'
                        }`}
                      >
                        2 contrats en attente
                      </div>
                      <div className="text-[11px] text-slate-400 truncate">
                        À valider cette semaine
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                </button>

                {/* Action 3: Maintenance prévue */}
                <button
                  type="button"
                  onClick={() => setActiveSection('orchestrator', 'maintenance')}
                  className={`w-full p-3 rounded-xl border text-left flex items-center justify-between gap-2 transition-colors cursor-pointer ${
                    isDark
                      ? 'bg-[#191F31] border-slate-800 hover:border-emerald-500/50'
                      : 'bg-emerald-50/50 border-emerald-100 hover:bg-emerald-50'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div
                        className={`text-xs font-bold truncate ${
                          isDark ? 'text-white' : 'text-slate-900'
                        }`}
                      >
                        Maintenance prévue
                      </div>
                      <div className="text-[11px] text-slate-400 truncate">
                        CTA Beynost – 15 avril
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                </button>
              </div>
            </div>

            {/* Card 2: Activités du jour */}
            <div
              className={`rounded-2xl border p-4 space-y-3.5 ${
                isDark
                  ? 'bg-[#131826] border-slate-800/90'
                  : 'bg-white border-slate-200/80 shadow-2xs'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-rose-500/15 text-rose-500 flex items-center justify-center">
                    <Calendar className="w-3.5 h-3.5" />
                  </div>
                  <h3 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    Activités du jour
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveSection('planning-hr', 'planning')}
                  className="text-xs font-semibold text-violet-500 hover:underline cursor-pointer"
                >
                  Voir tout
                </button>
              </div>

              <div className="space-y-3">
                {[
                  {
                    time: '08:00',
                    title: 'Cours BodyPump',
                    sub: '24 / 30 participants',
                    club: 'Center',
                    clubStyle: isDark
                      ? 'bg-violet-500/20 text-violet-300'
                      : 'bg-violet-50 text-violet-700',
                    iconBg: 'bg-violet-600 text-white',
                    target: 'planning-hr' as NavSection,
                    subTarget: 'cours-collectifs',
                  },
                  {
                    time: '10:00',
                    title: 'Rendez-vous commercial',
                    sub: 'Visite club – Prospect',
                    club: 'Place',
                    clubStyle: isDark
                      ? 'bg-blue-500/20 text-blue-300'
                      : 'bg-blue-50 text-blue-700',
                    iconBg: 'bg-blue-600 text-white',
                    target: 'crm' as NavSection,
                    subTarget: undefined,
                  },
                  {
                    time: '12:30',
                    title: 'Intervention maintenance',
                    sub: 'Climatisation – Espace musculation',
                    club: 'Center',
                    clubStyle: isDark
                      ? 'bg-violet-500/20 text-violet-300'
                      : 'bg-violet-50 text-violet-700',
                    iconBg: 'bg-emerald-500 text-white',
                    target: 'orchestrator' as NavSection,
                    subTarget: 'maintenance',
                  },
                  {
                    time: '18:00',
                    title: 'Cours Yoga',
                    sub: '28 / 30 participants',
                    club: 'Place',
                    clubStyle: isDark
                      ? 'bg-blue-500/20 text-blue-300'
                      : 'bg-blue-50 text-blue-700',
                    iconBg: 'bg-purple-600 text-white',
                    target: 'planning-hr' as NavSection,
                    subTarget: 'cours-collectifs',
                  },
                ].map((act) => (
                  <div
                    key={`${act.time}-${act.title}`}
                    onClick={() => setActiveSection(act.target, act.subTarget)}
                    className="flex items-start gap-2.5 text-xs cursor-pointer group"
                  >
                    <span className="w-10 pt-1 text-[11px] font-mono text-slate-400 shrink-0">
                      {act.time}
                    </span>
                    <div
                      className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ${act.iconBg}`}
                    >
                      <Activity className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div
                        className={`font-bold truncate group-hover:text-violet-500 ${
                          isDark ? 'text-slate-100' : 'text-slate-900'
                        }`}
                      >
                        {act.title}
                      </div>
                      <div className="text-[11px] text-slate-400 truncate">{act.sub}</div>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold shrink-0 ${act.clubStyle}`}
                    >
                      {act.club}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          VOLET 1 : PILOTAGE OPÉRATIONNEL & KPIS BI-CLUB
         ===================================================================== */}
      {activeTab === 'synthese' && (
        <div className="space-y-5">
          {/* 4 Grands Compteurs Clés */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <div
              onClick={() => setActiveSection('telephony')}
              className="bg-white border border-slate-200/80 rounded-2xl p-5 hover:border-violet-300 transition-colors cursor-pointer shadow-2xs"
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
              className="bg-white border border-slate-200/80 rounded-2xl p-5 hover:border-violet-300 transition-colors cursor-pointer shadow-2xs"
            >
              <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
                <span>Pipeline CRM &amp; Essais</span>
                <Users className="w-4 h-4 text-violet-600" />
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl font-black text-slate-900 tabular-nums">
                  {clubProspects.length}
                </span>
                <span className="text-xs font-bold text-violet-600">
                  dont {newLeadsCount} nouveaux
                </span>
              </div>
              <div className="mt-2 text-xs text-slate-500">
                {scheduledTrialsCount} séances planifiées · {conversionRate}% de transformation
              </div>
            </div>

            <div
              onClick={() => setActiveSection('planning-hr')}
              className="bg-white border border-slate-200/80 rounded-2xl p-5 hover:border-violet-300 transition-colors cursor-pointer shadow-2xs"
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
              className="bg-white border border-slate-200/80 rounded-2xl p-5 hover:border-violet-300 transition-colors cursor-pointer shadow-2xs"
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
            <div className="lg:col-span-6 bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-violet-600" />
                  État en Direct des 2 Établissements C.FITNESS
                </h2>
                <button
                  onClick={() => setActiveSection('academy')}
                  className="text-xs font-bold text-violet-600 hover:text-violet-700 cursor-pointer"
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

            <div className="lg:col-span-6 bg-white border border-slate-200/80 rounded-2xl p-5 space-y-3 shadow-2xs">
              <div className="pb-2 border-b border-slate-100">
                <div className="text-[11px] font-bold uppercase tracking-wider text-violet-600">
                  Accès Rapide aux Postes du Club (1er Plan)
                </div>
                <h2 className="text-sm font-bold text-slate-900 mt-0.5">
                  Basculer en 1 clic vers les écrans terrain
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <button
                  onClick={() => setActiveSection('my-day')}
                  className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-violet-500 hover:bg-violet-50/40 transition-colors text-left cursor-pointer"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Sun className="w-4 h-4 text-violet-600 shrink-0" />
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-900 truncate">01 · Ma Journée</div>
                      <div className="text-[11px] text-slate-500 truncate">Priorités &amp; Comptoir</div>
                    </div>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-slate-400 shrink-0" />
                </button>

                <button
                  onClick={() => setActiveSection('devices')}
                  className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-violet-500 hover:bg-violet-50/40 transition-colors text-left cursor-pointer"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <QrCode className="w-4 h-4 text-violet-600 shrink-0" />
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-900 truncate">08 · Matériel Heitz &amp; Checkup</div>
                      <div className="text-[11px] text-slate-500 truncate">Portillons, Caisse &amp; Bilans</div>
                    </div>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-slate-400 shrink-0" />
                </button>

                <button
                  onClick={() => setShellMode('telephone')}
                  className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-violet-500 hover:bg-violet-50/40 transition-colors text-left cursor-pointer"
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
                  className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-violet-500 hover:bg-violet-50/40 transition-colors text-left cursor-pointer"
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
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 space-y-4 shadow-2xs">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-violet-600">
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
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4 shadow-2xs">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-violet-600">
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
              <span className="px-3 py-1.5 rounded-xl bg-violet-50 text-violet-700 font-bold border border-violet-200">
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
                <span className="px-2.5 py-1 rounded-lg bg-violet-600 text-white text-[11px] font-bold">
                  {group.badge}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {group.modules.map((mod) => {
                  const Icon = mod.icon;
                  const isModEnabled = enabledModules[mod.code] ?? true;
                  return (
                    <div
                      key={mod.code}
                      className={`bg-white border rounded-2xl p-5 space-y-3 flex flex-col justify-between shadow-2xs transition-colors ${
                        isModEnabled ? 'border-slate-200/80' : 'border-amber-300 bg-amber-50/20'
                      }`}
                    >
                      <div className="space-y-2.5">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-xl bg-violet-50 border border-violet-200 text-violet-600 flex items-center justify-center shrink-0">
                              <Icon className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="text-[11px] font-mono font-bold text-violet-600 uppercase">
                                {mod.code}
                              </div>
                              <div className="text-sm font-bold text-slate-900">
                                {mod.title}
                              </div>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              setEnabledModules((prev) => ({
                                ...prev,
                                [mod.code]: !isModEnabled,
                              }))
                            }
                            className={`px-2.5 py-1 rounded-md text-[10px] font-bold flex items-center gap-1 shrink-0 cursor-pointer transition-colors ${
                              isModEnabled
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                                : 'bg-amber-100 text-amber-800 border border-amber-300 hover:bg-amber-200'
                            }`}
                            title="Cliquer pour activer ou mettre en pause ce module en démonstration"
                          >
                            <Power className="w-3 h-3" />
                            <span>{isModEnabled ? 'Actif' : 'En pause'}</span>
                          </button>
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

                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                        <span className="text-[11px] text-slate-500 font-medium">
                          Accès direct pour démonstration :
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            if (mod.targetShell) {
                              setShellMode(mod.targetShell);
                            } else if (mod.targetSection) {
                              if (mod.targetSection === 'dashboard') {
                                setActiveTab('synthese');
                              } else {
                                setActiveSection(mod.targetSection);
                              }
                            }
                          }}
                          className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                        >
                          <span>{mod.actionLabel}</span>
                          <ArrowRight className="w-3.5 h-3.5 text-violet-200" />
                        </button>
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
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 space-y-2 shadow-2xs">
            <div className="text-xs font-bold uppercase tracking-wider text-violet-600">
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
                className="bg-white border border-slate-200/80 rounded-2xl p-4 flex flex-col justify-between space-y-3 shadow-2xs"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-violet-50 text-violet-700 border border-violet-200">
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
                        <ArrowRight className="w-3.5 h-3.5 text-violet-600 shrink-0 mt-0.5" />
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>

          {/* Tableau des Économies Directes */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 shadow-2xs">
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
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 space-y-4 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <div className="text-xs font-bold uppercase text-violet-600">
                  Garantie d&apos;Exploitation pour les Dirigeants &amp; Associés
                </div>
                <h3 className="text-base font-bold text-slate-900 mt-0.5">
                  Pourquoi un club déjà ouvert adopte C.Fitness OS sans aucun risque opérationnel ?
                </h3>
              </div>
              <span className="px-3 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold self-start">
                Zéro coupure des portillons ni des prélèvements SEPA
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 space-y-1.5">
                <div className="font-bold text-violet-700 flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  1. Conservation du matériel existant
                </div>
                <p className="text-slate-600 leading-relaxed">
                  Aucun changement de tourniquets, de lecteurs RFID/Bluetooth Heitz ni de machines Technogym. C.Fitness OS s&apos;y connecte directement.
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 space-y-1.5">
                <div className="font-bold text-emerald-700 flex items-center gap-2">
                  <Handshake className="w-4 h-4" />
                  2. Prise en main immédiate par l&apos;équipe
                </div>
                <p className="text-slate-600 leading-relaxed">
                  Au lieu de former un nouveau collaborateur sur 5 outils différents, il dispose d&apos;un seul écran unifié avec ses priorités guidées heure par heure.
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 space-y-1.5">
                <div className="font-bold text-blue-700 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4" />
                  3. Transparence totale pour les associés
                </div>
                <p className="text-slate-600 leading-relaxed">
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
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 space-y-4 shadow-2xs">
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
                    <th className="py-2.5 px-3 text-right">Démonstration</th>
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
                      <td className="py-3 px-3 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => setActiveSection(row.targetSection)}
                          className="px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-bold text-[11px] inline-flex items-center gap-1 cursor-pointer"
                        >
                          <span>{row.targetLabel}</span>
                          <ArrowRight className="w-3 h-3 text-violet-200" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Part B: Partner Systems Kept */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 space-y-4 shadow-2xs">
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
                  className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-extrabold text-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Dumbbell className="w-3.5 h-3.5" />
                  <span>Ouvrir Mywellness</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {PARTNER_SYSTEMS_IN_HARMONY.map((partner) => {
                const isPartnerActive = partnerSyncMap[partner.id] ?? true;
                return (
                  <div
                    key={partner.system}
                    className={`border rounded-xl p-4 space-y-2.5 flex flex-col justify-between transition-colors ${
                      isPartnerActive
                        ? 'border-slate-200 bg-slate-50/40'
                        : 'border-amber-300 bg-amber-50/20'
                    }`}
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="text-sm font-extrabold text-slate-900">
                            {partner.system}
                          </div>
                          <div className="text-xs font-semibold text-violet-600">
                            Rôle : {partner.role}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            setPartnerSyncMap((prev) => ({
                              ...prev,
                              [partner.id]: !isPartnerActive,
                            }))
                          }
                          className={`px-2.5 py-1 rounded text-[10px] font-bold shrink-0 flex items-center gap-1 cursor-pointer transition-colors ${
                            isPartnerActive
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                              : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                          }`}
                        >
                          <Power className="w-3 h-3" />
                          <span>
                            {isPartnerActive ? 'Conservé & Synchronisé' : 'Synchro en Pause'}
                          </span>
                        </button>
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

                    <div className="pt-3 border-t border-slate-200/80 flex items-center justify-end">
                      <button
                        type="button"
                        onClick={() => setActiveSection(partner.targetSection)}
                        className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                      >
                        <span>{partner.targetLabel}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-violet-200" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Part C: Competitive Differentiation & B2B Resale */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 space-y-4 shadow-2xs">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-violet-600 flex items-center gap-1.5">
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
                  <div className="lg:col-span-3 bg-violet-50 border border-violet-200 rounded-lg p-2.5 text-xs">
                    <div className="font-bold text-violet-700 text-[10px] uppercase">Potentiel Revente</div>
                    <p className="text-slate-800 font-medium mt-0.5">{item.resaleProof}</p>
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
