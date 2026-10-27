import React, { useState, useEffect } from 'react';
import { useCfos } from '../../context/CfosContext';
import {
  ShieldCheck,
  CheckCircle2,
  Lock,
  Server,
  HardDrive,
  FileCheck2,
  Layers,
  Presentation,
  GitMerge,
  Award,
  Check,
  XCircle,
  ArrowRight,
  Building2,
  Cpu,
  PhoneCall,
  Users,
  Calendar,
  FileSignature,
  GraduationCap,
  QrCode,
  Sparkles,
  TrendingUp,
  Handshake,
} from 'lucide-react';
import { BackupFailoverPanel } from '../BackupFailoverPanel';

export type GovernanceTabId =
  | 'features'
  | 'pitch'
  | 'ecosystem'
  | 'differentiation'
  | 'governance';

interface GovernanceViewProps {
  initialTab?: GovernanceTabId;
}

const PROJECT_FEATURE_CATALOG = [
  {
    category: '1er Plan · Opérations Quotidiennes en Club (Front-Office)',
    badge: '7 Modules Prioritaires',
    modules: [
      {
        code: '01 · Ma Journée',
        title: 'Cockpit Collaborateur & Priorités Temps Réel',
        icon: Sparkles,
        features: [
          'Feuille de route individuelle dès la prise de poste (tâches urgentes, RDV du jour, objectifs mensuels d’abonnements).',
          'Pointage d’entrée / pause / sortie horodaté avec calcul automatique des heures nettes.',
          'Alertes prioritaires : impayés SEPA à régulariser à l’accueil, prospects chauds à rappeler sous 15 min, essais du jour.',
          'Accès rapide au Livret BPJEPS (apprentis) ou au suivi des commissions variables (commerciaux).',
        ],
      },
      {
        code: '02 · Le Collaborateur',
        title: 'Grille d’Exécution Horaire & Application Terrain Mobile',
        icon: Users,
        features: [
          'Grille horaire de la journée tranche par tranche (ouverture club, tour de salle, relances téléphoniques, accueil essais).',
          'Validation en 1 clic des tâches exécutées avec traçabilité manager en temps réel.',
          'Consultation de ses propres shifts, compteur d’heures CDD/CDI et solde de congés payés.',
          'Accès direct aux documents RH signés (Contrat CDI C.Fitness, règlement intérieur, chartes).',
        ],
      },
      {
        code: '03 · L’Espace Planning',
        title: 'Planning Centralisé 3-Sources (RH + Mywellness + Heitz) & Pré-Paie Silae',
        icon: Calendar,
        features: [
          'Fusion sans doublon sur un seul écran : Shifts RH collaborateurs + Cours/Bilans Technogym Mywellness + RDV Système Heitz.',
          'Moteur de conformité Convention Collective Nationale du Sport (IDCC 2511) : contrôle repos quotidien (11h), amplitude max et pauses.',
          'Suivi automatisé des périodes d’essai (2 mois renouvelables) et calcul légal des délais de prévenance (24h, 48h, 2 sem., 1 mois).',
          'Export comptable en 1 clic vers Silae Paie : heures travaillées, absences, primes et commissions commerciales paliers.',
        ],
      },
      {
        code: '04 & 05 · Téléphonie & WebRTC',
        title: 'Standard Cloud 12 Lignes OVHcloud (04/07), Studio SVI & Clone Ringover',
        icon: PhoneCall,
        features: [
          'Double identité d’appel certifiée ARCEP (MAN / STIR-SHAKEN) : Lignes fixes 04 (Trunk SIP OVHcloud) + Pool mobiles 07 (4G VoLTE Yeastar TG400).',
          'Power-Dialer anti-spam (rotation intelligente des 07) et Voicemail Drop 1-clic (dépôt de message vocal pré-enregistré sans attendre le bip).',
          'Boîte SMS Collaborative 07 avec conformité légale automatique (mention STOP 36111 et blocage instantané des opt-out).',
          'Supervision Manager temps réel sur les 12 lignes : Écoute discrète, Chuchotement coach (Whisper) et Intrusion à 3 (Barge-in).',
          'Studio SVI visuel (routage horaire, annonces vocales, files d’attente) + Transcription IA locale gratuite (faster-whisper GPU).',
        ],
      },
      {
        code: '06 · Le CRM',
        title: 'Acquisition Prospects, Conversion Heitz 1-Clic & Bouclier Fidélisation',
        icon: Users,
        features: [
          'Capture omnicanale (Web, Meta/Instagram, Walk-in, Appels entrants) avec déduplication automatique téléphone/e-mail.',
          'Garde-fous juridiques natifs : blocage automatique des appels sortants sur numéros inscrits Bloctel et vérification consentement RGPD.',
          'Réservation de séance d’essai synchronisée dans Heitz (/api/program/makeReservation) + envoi SMS du QR Code d’ouverture portillon.',
          'Conversion 1-clic Prospect → Adhérent Heitz : création fiche client, souscription abonnement SEPA, génération ticket encaissement KPI.',
          'Relances automatiques des adhérents absents (> 14j / 30j sans passage portillon) et des rejets de prélèvement SEPA.',
        ],
      },
      {
        code: '07 · Les ATS & Signatures (0 €)',
        title: 'Recrutement Automatisé, Contrats CDI Légaux & Signature SHA-256 Gratuite',
        icon: FileSignature,
        features: [
          'Aspiration et parsing automatique des candidatures reçues sur recrutement@c.fitness avec accusé de réception RGPD immédiat.',
          'Générateur automatique du Contrat CDI officiel C.Fitness (SIRET, URSSAF, APICIL, REPAM, IDCC 2511, objectif 20 abonnements/mois).',
          'Moteur interne de signature électronique probante (scellement cryptographique SHA-256 + OTP SMS) à 0 € (remplace Yousign/DocuSign).',
          'Onboarding transactionnel en 1 clic : crée simultanément le salarié, son code PIN badgeuse, son 1er shift, ses contrats et son parcours Académie.',
        ],
      },
    ],
  },
  {
    category: '2e Plan · Pilotage Direction, IA, Académie, Matériel & Gouvernance',
    badge: '6 Modules Stratégiques',
    modules: [
      {
        code: 'Pilotage Bi-Club',
        title: 'Tableau de Bord Exécutif Carré de Soie & Beynost',
        icon: TrendingUp,
        features: [
          'Jauge FMI (Fréquentation Maximale Instantanée) en direct sur les 2 clubs avec latence VPN WireGuard inter-sites.',
          'Suivi du Chiffre d’Affaires, des nouveaux abonnements du mois, du taux de transformation par commercial et des impayés SEPA.',
          'Vue consolidée multi-établissements ou filtrée par club en 1 clic.',
        ],
      },
      {
        code: 'Orchestration IA',
        title: '6 Agents IA Métier Spécialisés & Maintenance Prédictive',
        icon: Cpu,
        features: [
          'Agent Télécom & Résumé d’appel (analyse de sentiment, objections, score commercial post-appel).',
          'Agent Relance Anti-Churn (détection précoce des adhérents à risque de résiliation selon les passages Heitz).',
          'Agent RH & Conformité IDCC 2511, Agent Recrutement ATS, Agent Tuteur BPJEPS et Agent Audit Sécurité.',
        ],
      },
      {
        code: 'Académie 3S & BPJEPS',
        title: 'Formation Interne Certifiante & Livret d’Apprentissage UC1–UC4',
        icon: GraduationCap,
        features: [
          '11 modules e-learning internes (méthode de vente C.Fitness, accueil, sécurité ERP, téléphonie, hygiène) avec QCM auto-corrigés.',
          'Livret numérique de suivi des apprentis BPJEPS AF (validation des compétences UC1, UC2, UC3, UC4 par le tuteur).',
        ],
      },
      {
        code: 'Matériel Heitz & Checkup',
        title: 'Passerelles Temps Réel Portillons RFID/QR & Technogym Checkup',
        icon: QrCode,
        features: [
          'Monitoring en direct des portillons Heitz (Carré de Soie & Beynost), déclenchement d’ouverture manuelle tracée et mode sécurité incendie.',
          'Bouclier SEPA automatique : blocage du tourniquet si finBalance < 0 € + envoi SMS de régularisation + alerte écran accueil.',
          'Passerelle directe vers les 2 stations biométriques Technogym Checkup (Wellness Age™, BIA multi-fréquence, caméra 3D) et Mywellness Cloud.',
        ],
      },
      {
        code: 'Kiosque Badgeuse PIN',
        title: 'Mode Tablette Murale PoE avec Tolérance aux Pannes Réseau',
        icon: Server,
        features: [
          'Interface tactile grand format dédiée à l’entrée du personnel par code PIN à 4 chiffres (verrouillage sécurité après 5 essais).',
          'File d’attente locale chiffrée (Offline Queue) : aucun pointage perdu même en cas de coupure Internet temporaire.',
        ],
      },
      {
        code: 'Gouvernance & Résilience 3-2-1',
        title: 'Sauvegarde Multi-Appareils, Bascule Électrique < 3s & Audit Immuable',
        icon: ShieldCheck,
        features: [
          'Réplication automatique temps réel (stratégie 3-2-1) sur 6 appareils : Serveur CDS, NAS Beynost, 2 PC secours, 2 Tablettes, 2 Smartphones.',
          'Bascule automatique en moins de 3 secondes en cas de coupure de courant sur le serveur principal.',
          'Journal d’audit cryptographique immuable (Append-Only) et validation par signature Direction des jalons Go/No-Go (Phases 0 à 12).',
        ],
      },
    ],
  },
];

const REPLACED_SOFTWARE_MATRIX = [
  {
    replaced: 'Ringover / Aircall (SaaS Téléphonie)',
    oldCost: '45 € à 65 € HT / mois / utilisateur (~720 € HT/mois pour 12 postes)',
    limitation: 'Coût par licence prohibitif, numéros mobiles virtuels parfois bloqués ou surtaxés, pas de lien natif avec le solde SEPA Heitz.',
    cfitnessSolution: 'Softphone WebRTC 12 lignes + IPBX Asterisk + Trunk SIP OVHcloud (04) + Passerelle 4G VoLTE Yeastar (07) + IA Whisper locale.',
    newCost: '~14,40 € HT / mois au total (coût télécom OVHcloud pur, 0 € de licence logicielle)',
  },
  {
    replaced: 'Skello / Combo (Planning RH & Badgeuse)',
    oldCost: '90 € à 160 € HT / mois / club (~250 € HT/mois pour 2 clubs)',
    limitation: 'Séparé du planning des cours Technogym et des RDV commerciaux Heitz ; les coachs et managers doivent jongler entre 3 plannings.',
    cfitnessSolution: 'Espace Planning Unifié 3-en-1 (RH IDCC 2511 + Mywellness + Heitz) + Kiosque Tablette Badgeuse PIN hors-ligne.',
    newCost: '0 € / mois (intégré nativement)',
  },
  {
    replaced: 'Yousign / DocuSign (Signature Électronique)',
    oldCost: '50 € à 150 € HT / mois (ou facturation à l’enveloppe signée)',
    limitation: 'Obligation de ressaisir les coordonnées du candidat ou de l’adhérent et de payer à chaque contrat.',
    cfitnessSolution: 'Moteur interne de signature électronique SHA-256 avec horodatage, adresse IP, OTP SMS et génération automatique du CDI C.Fitness.',
    newCost: '0 € / mois (illimité)',
  },
  {
    replaced: 'HubSpot / Pipedrive / Leads génériques (CRM)',
    oldCost: '150 € à 400 € HT / mois',
    limitation: 'Aucune connexion native avec les portillons Heitz : impossible de savoir si le prospect est réellement venu faire sa séance d’essai.',
    cfitnessSolution: 'CRM Fitness C.Fitness OS connecté en temps réel aux portillons Heitz (QR Code essai, détection passage, conversion adhérent 1-clic).',
    newCost: '0 € / mois (intégré nativement)',
  },
  {
    replaced: 'Outils ATS Recrutement (Flatchr / WelcomeKit)',
    oldCost: '80 € à 200 € HT / mois',
    limitation: 'Déconnecté de la création du salarié dans le planning et de la formation interne.',
    cfitnessSolution: 'ATS intégré branché sur recrutement@c.fitness avec Onboarding transactionnel en 1 clic (Crée salarié + PIN + Shift + Contrat + Académie).',
    newCost: '0 € / mois (intégré nativement)',
  },
  {
    replaced: 'Google Calendar / WhatsApp / Fichiers Excel épars',
    oldCost: 'Perte de temps estimée à 8h / semaine / manager + perte de prospects',
    limitation: 'Informations éparpillées, aucune traçabilité opposable, risque RGPD majeur sur les téléphones personnels des salariés.',
    cfitnessSolution: 'Cockpit unique « Ma Journée » + Grille Collaborateur + Clause de traçabilité CRM opposable + Zéro téléphone personnel.',
    newCost: '0 € / mois + Sécurité juridique totale',
  },
];

const PARTNER_SYSTEMS_IN_HARMONY = [
  {
    system: '1. Système Heitz v16 (Heitz-WS.exe & SQL)',
    role: 'Cœur Adhérents, Prélèvements SEPA, Caisse KPI & Contrôle d’Accès Portillons (RFID / Bluetooth / QR)',
    whyKept: 'Heitz est la référence métier pour la gestion bancaire SEPA et pilote déjà les lecteurs RFID/Bluetooth installés dans les clubs.',
    howItWorksTogether: [
      'Authentification sécurisée via /api/developer/getToken et échange JSON temps réel (< 50 ms sur LAN/VPN).',
      'Sens C.Fitness → Heitz : Lorsqu’un commercial réserve un essai ou convertit un prospect dans le CRM, C.Fitness OS crée automatiquement la fiche dans Heitz (/api/client/add), génère le QR Code portillon (/api/passageCode/generate) et enregistre le ticket KPI (/api/financial/addCheckDetail).',
      'Sens Heitz → C.Fitness : Chaque passage au tourniquet ou rejet SEPA (finBalance < 0 €) remonte instantanément dans C.Fitness OS pour bloquer le portillon, alerter l’accueil et déclencher un SMS de régularisation.',
    ],
  },
  {
    system: '2. Technogym Mywellness Cloud & 2× Stations Technogym Checkup',
    role: 'Suivi Sportif Plateau, Programmes d’Entraînement, Cours Collectifs & Bilans Biométriques 3D / BIA',
    whyKept: 'L’écosystème Technogym (Mywellness + balances révolutionnaires Checkup) offre une expérience sportive mondiale irremplaçable aux adhérents.',
    howItWorksTogether: [
      'Aucune double saisie : C.Fitness OS ne cherche pas à recréer les programmes de musculation ; il synchronise les créneaux de bilans et de cours Mywellness directement dans « L’Espace Planning » centralisé.',
      'Passerelle contextuelle 1-clic (Deep-Link) : Depuis la fiche d’un adhérent ou le planning coach dans C.Fitness OS, un bouton ouvre directement son dossier biométrique Technogym Checkup (Wellness Age™, masse musculaire, mobilité).',
      'Cloisonnement RGPD Art. 9 : Les données médicales/biométriques restent protégées et accessibles uniquement aux Coachs diplômés et à la Direction.',
    ],
  },
  {
    system: '3. Silae Paie (Cabinet Comptable & Social)',
    role: 'Édition Officielle des Bulletins de Paie & Déclarations Sociales (DSN / URSSAF)',
    whyKept: 'Le cabinet comptable utilise Silae pour garantir la conformité légale des fiches de paie et des déclarations URSSAF.',
    howItWorksTogether: [
      'C.Fitness OS agit comme le moteur de pré-paie automatisé en amont de Silae.',
      'Les pointages de la badgeuse PIN, les heures supplémentaires, les congés validés et les commissions commerciales paliers (issues des ventes tracées dans le CRM/Heitz) sont consolidés automatiquement.',
      'En fin de mois, la Direction génère en 1 clic le fichier d’export normé prêt à être importé dans Silae par le cabinet comptable (zéro ressaisie manuelle, zéro erreur de calcul).',
    ],
  },
  {
    system: '4. OVHcloud Télécom (Trunk SIP Fixe 04) & Passerelle 4G Yeastar TG400 (SIM 07)',
    role: 'Infrastructure Opérateur Télécom Pure (Voix Fixe, Voix Mobile & SMS)',
    whyKept: 'Indispensable pour acheminer les appels sur le réseau téléphonique public français en respectant strictement la réglementation ARCEP.',
    howItWorksTogether: [
      'C.Fitness OS embarque toute l’intelligence logicielle (interface WebRTC, Studio SVI, Power-Dialer, écoute manager, enregistrement, transcription IA Whisper).',
      'OVHcloud ne fournit plus que le « tuyau » opérateur nu au tarif de gros (~1,20 € HT/mois/ligne), tandis que la passerelle Yeastar TG400 loge les cartes SIM 07 sur le réseau local pour des appels et SMS mobiles au taux de décroché maximal.',
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
    marketStandard: 'Le CRM commercial ne sait pas qui franchit le tourniquet ni qui est en impayé SEPA. Beaucoup de prospects « fantômes » et d’accès non payés.',
    cfitnessAdvantage: 'Connexion native bidirectionnelle à Heitz-WS : QR Code d’essai généré par SMS, validation automatique de présence au passage du portillon, et blocage + relance immédiate sur impayé SEPA.',
    resaleProof: 'Tous les clubs équipés de Heitz en France (~1 500+ salles) souffrent des limites de l’interface native Heitz et cherchent exactement cette surcouche moderne.',
  },
  {
    criterion: '3. Règles Métier Fitness & Droit Social Français Natifs',
    marketStandard: 'Logiciels généralistes étrangers (HubSpot, Pipedrive) qui ignorent la Convention Collective du Sport (IDCC 2511) et le diplôme BPJEPS.',
    cfitnessAdvantage: 'Conçu sur-mesure pour le fitness français : contrôle automatique IDCC 2511, génération du CDI officiel, suivi périodes d’essai, et livret pédagogique BPJEPS UC1–UC4 intégré.',
    resaleProof: 'Argument décisif pour les dirigeants de clubs et franchisés : conformité inspection du travail et OPCO clé en main dès le premier jour.',
  },
  {
    criterion: '4. Téléphonie 04/07 Conforme ARCEP + IA Vocale Locale à 0 €',
    marketStandard: 'Les solutions Cloud facturent l’option « IA Transcription & Résumé » entre 29 € et 49 € HT/mois/poste et bloquent souvent l’affichage des numéros mobiles.',
    cfitnessAdvantage: 'Architecture hybride Trunk SIP 04 OVHcloud + Passerelle 4G VoLTE 07 physique + Transcription & Coaching IA exécutés localement sur GPU (faster-whisper) sans abonnement externe.',
    resaleProof: 'Taux de décroché prospect doublé grâce aux vrais numéros 07 locaux et analyse IA 100 % souveraine (aucune donnée vocale envoyée aux GAFAM).',
  },
  {
    criterion: '5. Continuité d’Exploitation en Cas de Coupure Internet ou Courant',
    marketStandard: '100 % dépendant du Cloud : si la fibre du club coupe, plus de CRM, plus de planning, plus de badgeuse.',
    cfitnessAdvantage: 'Architecture locale résiliente avec réplication automatique 3-2-1 sur 6 appareils (PC, Tablettes, Smartphones) et bascule en moins de 3 secondes + cache autonome portillons.',
    resaleProof: 'Garantie industrielle « Zéro Fermeture de Club » qui rassure immédiatement les investisseurs et associés multi-sites.',
  },
  {
    criterion: '6. Architecture Multi-Clubs & Marque Blanche (White-Label Ready)',
    marketStandard: 'Outils cloisonnés par société nécessitant de se déconnecter/reconnecter pour voir un autre établissement.',
    cfitnessAdvantage: 'Nativement Multi-Sociétés / Multi-Clubs (éprouvé sur Carré de Soie + Beynost via VPN WireGuard) avec RBAC granulaire (Dirigeant, Associé, Manager, Commercial, Coach).',
    resaleProof: 'Prêt à accueillir un 3e, 4e ou 10e club en moins de 48h par simple ajout d’un nœud club dans la configuration.',
  },
];

export function GovernanceView({ initialTab = 'governance' }: GovernanceViewProps) {
  const { currentUser, goNoGoPhases, auditLogs, signGoNoGoPhase } = useCfos();
  const [activeTab, setActiveTab] = useState<GovernanceTabId>(initialTab);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  const canSignOff = currentUser.role === 'admin';

  return (
    <div className="space-y-6">
      {/* Executive Header */}
      <div className="bg-slate-900 text-white border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-orange-500/20 border border-orange-500/30 text-orange-300 text-[11px] font-bold uppercase tracking-wider">
              2e Plan · Direction, Associés, Architecture &amp; Gouvernance
            </div>
            <h1 className="text-lg sm:text-2xl font-black tracking-tight text-white">
              Dossier Stratégique Dirigeants &amp; Associés · Gouvernance C.Fitness OS
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-3xl">
              Retrouvez ici le catalogue intégral des fonctionnalités du projet, le plan de présentation pour les dirigeants et futurs associés, l&apos;explication simple de l&apos;écosystème (logiciels remplacés vs partenaires en accord), nos avantages concurrentiels pour la revente, ainsi que l&apos;audit RGPD et les jalons Go/No-Go.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2.5 shrink-0 text-xs">
            <div className="bg-slate-800/90 border border-slate-700 rounded-xl p-3">
              <div className="text-slate-400 text-[11px]">Économie SaaS Estimée</div>
              <div className="text-base sm:text-lg font-black text-emerald-400">
                ~16 800 € HT / an
              </div>
              <div className="text-[10px] text-slate-400">Sur 2 clubs (0 € / licence poste)</div>
            </div>
            <div className="bg-slate-800/90 border border-slate-700 rounded-xl p-3">
              <div className="text-slate-400 text-[11px]">Architecture Multi-Clubs</div>
              <div className="text-base sm:text-lg font-black text-orange-400">
                Prête à Revendre
              </div>
              <div className="text-[10px] text-slate-400">Intégration en 4 semaines</div>
            </div>
          </div>
        </div>

        {/* 5-Tab Navigation Bar */}
        <div className="mt-5 pt-4 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
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
              <div className="text-[10px] uppercase opacity-80">Onglet 1</div>
              <div className="truncate">Toutes les Fonctionnalités</div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('pitch')}
            className={`px-3.5 py-2.5 rounded-xl text-left text-xs font-bold flex items-center gap-2.5 transition-all cursor-pointer ${
              activeTab === 'pitch'
                ? 'bg-orange-600 text-white shadow-xs'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-700/70'
            }`}
          >
            <Presentation className="w-4 h-4 shrink-0" />
            <div className="min-w-0">
              <div className="text-[10px] uppercase opacity-80">Onglet 2</div>
              <div className="truncate">Plan Dirigeants &amp; Associés</div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('ecosystem')}
            className={`px-3.5 py-2.5 rounded-xl text-left text-xs font-bold flex items-center gap-2.5 transition-all cursor-pointer ${
              activeTab === 'ecosystem'
                ? 'bg-orange-600 text-white shadow-xs'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-700/70'
            }`}
          >
            <GitMerge className="w-4 h-4 shrink-0" />
            <div className="min-w-0">
              <div className="text-[10px] uppercase opacity-80">Onglet 3</div>
              <div className="truncate">Remplacés vs Partenaires</div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('differentiation')}
            className={`px-3.5 py-2.5 rounded-xl text-left text-xs font-bold flex items-center gap-2.5 transition-all cursor-pointer ${
              activeTab === 'differentiation'
                ? 'bg-orange-600 text-white shadow-xs'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-700/70'
            }`}
          >
            <Award className="w-4 h-4 shrink-0" />
            <div className="min-w-0">
              <div className="text-[10px] uppercase opacity-80">Onglet 4</div>
              <div className="truncate">Différences &amp; Revente</div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('governance')}
            className={`px-3.5 py-2.5 rounded-xl text-left text-xs font-bold flex items-center gap-2.5 transition-all cursor-pointer ${
              activeTab === 'governance'
                ? 'bg-orange-600 text-white shadow-xs'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-700/70'
            }`}
          >
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <div className="min-w-0">
              <div className="text-[10px] uppercase opacity-80">Onglet 5</div>
              <div className="truncate">Gouvernance, 3-2-1 &amp; RGPD</div>
            </div>
          </button>
        </div>
      </div>

      {/* =====================================================================
          ONGLET 1 : CATALOGUE COMPLET DE TOUTES LES FONCTIONNALITÉS DU PROJET
         ===================================================================== */}
      {activeTab === 'features' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-orange-600">
                Onglet 1 · Inventaire Fonctionnel Exhaustif (100 % du Périmètre)
              </div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 mt-0.5">
                Toutes les fonctionnalités embarquées dans C.Fitness OS (1er Plan Opérationnel &amp; 2e Plan Direction)
              </h2>
              <p className="text-xs text-slate-600 mt-1">
                L&apos;application est structurée en deux niveaux de lecture pour éviter toute surcharge visuelle aux équipes terrain tout en offrant une profondeur complète à la Direction.
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0 text-xs">
              <span className="px-3 py-1.5 rounded-xl bg-orange-50 text-orange-700 font-bold border border-orange-200">
                13 Briques Métier Actives
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
                            Opérationnel
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
          ONGLET 2 : PLAN DE PRÉSENTATION AUX DIRIGEANTS & ASSOCIÉS
         ===================================================================== */}
      {activeTab === 'pitch' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-2">
            <div className="text-xs font-bold uppercase tracking-wider text-orange-600">
              Onglet 2 · Trame Officielle de Présentation Exécutive (Dirigeants &amp; Associés)
            </div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              Plan directeur pour présenter C.Fitness OS aux dirigeants réceptionnant le logiciel et aux associés souhaitant l&apos;intégrer dans leurs structures existantes
            </h2>
            <p className="text-xs text-slate-600">
              Ce plan en 5 étapes est conçu pour une réunion de 20 minutes avec des décideurs : il va droit au but (rentabilité, simplicité opérationnelle, intégration sans coupure d&apos;exploitation dans un club déjà ouvert).
            </p>
          </div>

          {/* 5-Step Executive Pitch */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
            {[
              {
                step: 'ÉTAPE 1 · LE CONSTAT',
                duration: '3 min',
                title: 'Pourquoi les clubs perdent du temps et de l’argent aujourd’hui',
                points: [
                  'Empilement de 6 à 7 abonnements logiciels coûteux (Ringover, Skello, Yousign, CRM, Excel) qui ne communiquent pas entre eux.',
                  'Perte de prospects : aucun lien entre un appel téléphonique, la prise de RDV et le passage réel au tourniquet Heitz.',
                  'Risque social & RGPD : utilisation des téléphones portables personnels des commerciaux/coachs et ressaisie manuelle des variables de paie.',
                ],
              },
              {
                step: 'ÉTAPE 2 · LA SOLUTION',
                duration: '5 min',
                title: 'Un seul système d’exploitation pensé par et pour des exploitants de clubs',
                points: [
                  'Démonstration en direct du 1er Plan Opérationnel : Ma Journée → Planning 3-en-1 → Téléphonie 04/07 → CRM → ATS & Signatures.',
                  'Règle d’or : 1 seule action = mise à jour partout (Ex: convertir un prospect crée l’adhérent Heitz + ouvre le portillon + crédite la prime commerciale).',
                  'Zéro remplacement brutal du matériel : on garde Heitz (portillons/SEPA) et Technogym Mywellness (plateau/Checkup) et on les pilote.',
                ],
              },
              {
                step: 'ÉTAPE 3 · L’INTÉGRATION',
                duration: '4 min',
                title: 'Comment intégrer C.Fitness OS dans une structure existante sans coupure',
                points: [
                  'Semaine 1 : Connexion passive en lecture sur le serveur Heitz existant (récupération membres, SEPA, passages) et Technogym Mywellness.',
                  'Semaine 2 : Activation de la Téléphonie OVHcloud 04/07, du Studio SVI et du CRM (arrêt immédiat des abonnements Ringover/CRM).',
                  'Semaine 3 : Bascule du Planning RH IDCC 2511, de la tablette badgeuse PIN PoE et de la signature électronique 0 € (arrêt de Skello/Yousign).',
                  'Semaine 4 : Ouverture du Cockpit Direction Bi-Club/Multi-Clubs et premier export automatisé vers Silae Paie.',
                ],
              },
              {
                step: 'ÉTAPE 4 · LE ROI FINANCIER',
                duration: '4 min',
                title: 'Rentabilité immédiate dès le 1er mois d’exploitation',
                points: [
                  'Économie directe : ~700 € à 1 400 € HT / mois d’abonnements SaaS supprimés par structure.',
                  'Gain de Chiffre d’Affaires : +25 % de transformation sur les essais grâce au QR Code SMS Heitz et aux relances automatiques 07.',
                  'Récupération de trésorerie : le Bouclier SEPA bloque poliment au portillon les rejets de prélèvement et déclenche le paiement immédiat.',
                ],
              },
              {
                step: 'ÉTAPE 5 · LES ASSOCIÉS',
                duration: '4 min',
                title: 'Gouvernance transparente & croissance multi-structures',
                points: [
                  'Chaque associé ou directeur dispose d’un accès temps réel aux indicateurs consolidés (CA, FMI, nouveaux contrats, masse salariale).',
                  'Journal d’audit cryptographique infalsifiable : chaque ouverture manuelle de portillon, remise ou modification de contrat est tracée.',
                  'Intégration d’un nouveau club associé en 48h grâce à l’architecture VPN WireGuard et au modèle multi-établissements natif.',
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

          {/* Integration Blueprint for Existing Structures */}
          <div className="bg-slate-900 text-white rounded-2xl p-5 sm:p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <div className="text-xs font-bold uppercase text-orange-400">
                  Garantie pour les Associés &amp; Structures Déjà en Exploitation
                </div>
                <h3 className="text-base font-bold text-white mt-0.5">
                  Pourquoi un club déjà ouvert peut adopter C.Fitness OS sans aucun risque opérationnel ?
                </h3>
              </div>
              <span className="px-3 py-1 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold self-start">
                Zéro interruption des portillons ni des prélèvements SEPA
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="bg-slate-800/90 border border-slate-700 rounded-xl p-4 space-y-1.5">
                <div className="font-bold text-orange-300 flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  1. Conservation du matériel existant
                </div>
                <p className="text-slate-300 leading-relaxed">
                  Pas besoin de changer les tourniquets, les lecteurs RFID/Bluetooth Heitz ni les machines Technogym. C.Fitness OS vient se brancher par-dessus via leurs API officielles locales et Cloud.
                </p>
              </div>

              <div className="bg-slate-800/90 border border-slate-700 rounded-xl p-4 space-y-1.5">
                <div className="font-bold text-emerald-300 flex items-center gap-2">
                  <Handshake className="w-4 h-4" />
                  2. Adoption immédiate par les équipes
                </div>
                <p className="text-slate-300 leading-relaxed">
                  Au lieu de former un nouveau commercial ou coach sur 5 logiciels différents, il n&apos;apprend qu&apos;un seul écran (« Ma Journée » &amp; « Le Collaborateur ») avec ses tâches guidées heure par heure.
                </p>
              </div>

              <div className="bg-slate-800/90 border border-slate-700 rounded-xl p-4 space-y-1.5">
                <div className="font-bold text-blue-300 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4" />
                  3. Transparence financière pour les associés
                </div>
                <p className="text-slate-300 leading-relaxed">
                  Chaque euro encaissé, chaque abonnement signé et chaque heure travaillée est relié à une preuve vérifiable (ticket KPI Heitz, contrat signé SHA-256, pointage PIN horodaté).
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          ONGLET 3 : FONCTIONNEMENT SIMPLE, LOGICIELS REMPLACÉS VS PARTENAIRES
         ===================================================================== */}
      {activeTab === 'ecosystem' && (
        <div className="space-y-6">
          {/* Brief & Simple Explanation of How C.Fitness OS Works */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-orange-600">
                Onglet 3 · Architecture Expliquée Simplement
              </div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 mt-0.5">
                Comment fonctionne C.Fitness OS en 3 phrases simples ?
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                <div className="font-mono font-bold text-orange-600 uppercase">
                  1. L&apos;Écran Unique des Équipes
                </div>
                <div className="font-bold text-slate-900 text-sm">
                  Tout le quotidien du club au même endroit
                </div>
                <p className="text-slate-600 leading-relaxed">
                  Les commerciaux, coachs et managers se connectent à une seule application pour pointer, voir leur planning, appeler en 04/07, relancer les prospects par SMS, faire signer les contrats et suivre leur journée.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                <div className="font-mono font-bold text-emerald-600 uppercase">
                  2. Le Cerveau Central &amp; Les Passerelles
                </div>
                <div className="font-bold text-slate-900 text-sm">
                  Il dialogue en direct avec vos équipements
                </div>
                <p className="text-slate-600 leading-relaxed">
                  En arrière-plan, C.Fitness OS parle automatiquement en temps réel avec le serveur <strong>Heitz</strong> (portillons &amp; SEPA), avec <strong>Technogym Mywellness</strong> (bilans Checkup &amp; cours), avec <strong>OVHcloud</strong> (téléphonie) et avec <strong>Silae</strong> (paie).
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                <div className="font-mono font-bold text-blue-600 uppercase">
                  3. La Sécurité &amp; Continuité Automatique
                </div>
                <div className="font-bold text-slate-900 text-sm">
                  Zéro ressaisie, zéro perte de données
                </div>
                <p className="text-slate-600 leading-relaxed">
                  Toutes les actions sont tracées juridiquement et sauvegardées en continu sur 6 appareils (PC, tablettes, smartphones). Même si le serveur principal s&apos;éteint, les clubs continuent de tourner.
                </p>
              </div>
            </div>
          </div>

          {/* Part A: Software Replaced by C.Fitness OS */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <XCircle className="w-5 h-5 text-rose-600" />
                  A. Quels sont les 6 logiciels que C.Fitness OS REMPLACE intégralement ?
                </h3>
                <p className="text-xs text-slate-600 mt-0.5">
                  Ces abonnements mensuels externes sont supprimés car leurs fonctions sont désormais natives et supérieures dans C.Fitness OS.
                </p>
              </div>
              <span className="px-3 py-1 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold shrink-0">
                6 Abonnements SaaS Supprimés
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-[11px] font-bold uppercase text-slate-500 bg-slate-50">
                    <th className="py-2.5 px-3">Logiciel Remplacé</th>
                    <th className="py-2.5 px-3">Ancien Coût Moyen</th>
                    <th className="py-2.5 px-3">Problème de l&apos;ancien outil</th>
                    <th className="py-2.5 px-3">Module C.Fitness OS qui le remplace</th>
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

          {/* Part B: Software & Hardware with which C.Fitness OS works in harmony */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  B. Avec quels logiciels et équipements C.Fitness OS TRAVAILLE EN ACCORD PARFAIT ?
                </h3>
                <p className="text-xs text-slate-600 mt-0.5">
                  Nous ne réinventons pas la roue là où vos équipements excellent déjà : C.Fitness OS les orchestre en temps réel sans double saisie.
                </p>
              </div>
              <span className="px-3 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold shrink-0">
                4 Partenaires Techniques Conservés &amp; Synchronisés
              </span>
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
                      En Accord
                    </span>
                  </div>

                  <div className="text-xs text-slate-700 bg-white p-2.5 rounded-lg border border-slate-200/80">
                    <span className="font-bold text-slate-900">Pourquoi on le garde : </span>
                    {partner.whyKept}
                  </div>

                  <div className="space-y-1.5 pt-1">
                    <div className="text-[11px] font-bold uppercase text-slate-500">
                      Comment ils fonctionnent en accord au quotidien :
                    </div>
                    <ul className="space-y-1.5 text-xs text-slate-600">
                      {partner.howItWorksTogether.map((line, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{line}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          ONGLET 4 : DIFFÉRENCES MAJEURES & POTENTIEL DE REVENTE PARTENAIRES
         ===================================================================== */}
      {activeTab === 'differentiation' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-2">
            <div className="text-xs font-bold uppercase tracking-wider text-orange-600">
              Onglet 4 · Avantages Concurrentiels &amp; Commercialisation B2B
            </div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              Quelles sont les différences décisives apportées par notre solution qui prouvent que nous sommes à la hauteur pour l&apos;intégrer et la revendre à d&apos;autres partenaires ?
            </h2>
            <p className="text-xs text-slate-600">
              Sur le marché du fitness, les clubs ont le choix entre un ERP historique vieillissant (bon pour les tourniquets/SEPA mais faible sur le CRM/Téléphonie/RH) et une multitude de SaaS généralistes hors de prix. C.Fitness OS est le seul système qui réunit le meilleur des deux mondes.
            </p>
          </div>

          {/* 6 Competitive Differentiators Table / Cards */}
          <div className="grid grid-cols-1 gap-4">
            {COMPETITIVE_ADVANTAGES.map((item) => (
              <div
                key={item.criterion}
                className="bg-white border border-slate-200 rounded-2xl p-5 grid grid-cols-1 lg:grid-cols-12 gap-4 items-center shadow-2xs"
              >
                <div className="lg:col-span-3 space-y-1">
                  <div className="text-xs font-extrabold text-slate-900">
                    {item.criterion}
                  </div>
                  <span className="inline-block px-2 py-0.5 rounded bg-orange-50 text-orange-700 border border-orange-200 text-[10px] font-bold">
                    Différenciateur Clé
                  </span>
                </div>

                <div className="lg:col-span-3 bg-rose-50/60 border border-rose-200/70 rounded-xl p-3 text-xs space-y-1">
                  <div className="font-bold text-rose-800 text-[11px] uppercase">
                    Ce qui se fait ailleurs (Marché actuel)
                  </div>
                  <p className="text-slate-700">{item.marketStandard}</p>
                </div>

                <div className="lg:col-span-3 bg-emerald-50/70 border border-emerald-200 rounded-xl p-3 text-xs space-y-1">
                  <div className="font-bold text-emerald-800 text-[11px] uppercase">
                    L&apos;Avantage Exclusif C.Fitness OS
                  </div>
                  <p className="text-slate-800 font-medium">{item.cfitnessAdvantage}</p>
                </div>

                <div className="lg:col-span-3 bg-slate-900 text-white rounded-xl p-3 text-xs space-y-1">
                  <div className="font-bold text-orange-400 text-[11px] uppercase">
                    Preuve pour Intégration &amp; Revente
                  </div>
                  <p className="text-slate-200">{item.resaleProof}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Commercialization & White-Label Packaging Plan */}
          <div className="bg-slate-900 text-white rounded-2xl p-5 sm:p-6 space-y-4">
            <div>
              <div className="text-xs font-bold uppercase text-orange-400">
                Modèle de Déploiement &amp; Revente Partenaires (Licence / Franchise / Groupement)
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white mt-0.5">
                3 Formules prêtes pour intégrer ou commercialiser la solution auprès d&apos;autres clubs partenaires
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 space-y-2">
                <div className="text-orange-400 font-mono font-bold uppercase text-[11px]">
                  Formule 1 · Club Associé / Croissance Interne
                </div>
                <div className="text-sm font-bold text-white">
                  Intégration dans un nouveau club du groupe
                </div>
                <p className="text-slate-300 leading-relaxed">
                  Branchement direct sur le cluster C.Fitness OS via tunnel VPN WireGuard. Partage du pool téléphonique, de l&apos;Académie 3S et du cockpit de direction consolidé en moins de 48 heures.
                </p>
              </div>

              <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 space-y-2">
                <div className="text-emerald-400 font-mono font-bold uppercase text-[11px]">
                  Formule 2 · Licence Partenaire (Clé en Main)
                </div>
                <div className="text-sm font-bold text-white">
                  Revente aux clubs équipés Heitz &amp; Technogym
                </div>
                <p className="text-slate-300 leading-relaxed">
                  Déploiement de la surcouche C.Fitness OS chez un confrère indépendant : il conserve son serveur Heitz et ses machines Technogym, mais remplace d&apos;un coup Ringover, Skello, Yousign et son CRM tout en divisant sa facture par 3.
                </p>
              </div>

              <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 space-y-2">
                <div className="text-blue-400 font-mono font-bold uppercase text-[11px]">
                  Formule 3 · Marque Blanche (White-Label SaaS)
                </div>
                <div className="text-sm font-bold text-white">
                  Commercialisation aux réseaux de franchises
                </div>
                <p className="text-slate-300 leading-relaxed">
                  Personnalisation du logo, des couleurs, des scripts d&apos;appels, des modules Académie et du modèle de contrat CDI selon l&apos;enseigne cliente, avec redevance mensuelle par club.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          ONGLET 5 : GOUVERNANCE TECHNIQUE, SAUVEGARDES 3-2-1 & AUDIT RGPD
         ===================================================================== */}
      {activeTab === 'governance' && (
        <div className="space-y-6">
          {/* Infrastructure & Backup 3-2-1 Health Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-1.5">
              <div className="font-bold text-slate-900 flex items-center gap-2">
                <Server className="w-4 h-4 text-emerald-600" />
                Serveur Principal Carré de Soie (.10)
              </div>
              <div className="text-slate-600">
                PostgreSQL 16 + Redis 7 + LiveKit WebRTC + faster-whisper GPU local · Uptime 99,98%
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-1.5">
              <div className="font-bold text-slate-900 flex items-center gap-2">
                <HardDrive className="w-4 h-4 text-blue-600" />
                Sauvegardes 3-2-1 &amp; Réplication 6 Appareils
              </div>
              <div className="text-slate-600">
                Miroir temps réel sur 2 PC de secours, 2 Tablettes Kiosques et 2 Smartphones Direction + NAS Beynost
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-1.5">
              <div className="font-bold text-slate-900 flex items-center gap-2">
                <FileCheck2 className="w-4 h-4 text-orange-600" />
                Conformité Légale &amp; RGPD (§11)
              </div>
              <div className="text-slate-600">
                Bandeau vocal RGPD actif · Cloisonnement données santé Technogym Checkup / Mywellness · Purge auto CV 24 mois
              </div>
            </div>
          </div>

          {/* Multi-Device Automatic Backup & Power Outage Failover Panel */}
          <BackupFailoverPanel />

          {/* Phases 0 to 12 Go / No-Go Gates */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Matrice des Jalons d&apos;Exécution (Phases 0 à 12 — §9)
            </h2>

            <div className="divide-y divide-slate-100 text-xs">
              {goNoGoPhases.map((gate) => (
                <div
                  key={gate.id}
                  className="py-3.5 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="font-bold text-slate-900">
                      <span className="font-mono text-orange-600">{gate.code}</span> —{' '}
                      {gate.title} ({gate.durationLabel})
                    </div>
                    <div className="text-slate-600">
                      <span className="font-semibold text-slate-800">Livrables :</span>{' '}
                      {gate.deliverables.join(' · ')}
                    </div>
                    <div className="text-slate-500">
                      <span className="font-semibold text-slate-700">Critère Go/No-Go :</span>{' '}
                      {gate.exitCriteria}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {gate.status === 'valide' ? (
                      <div className="text-right">
                        <div className="font-bold text-emerald-700 flex items-center gap-1 justify-end">
                          <CheckCircle2 className="w-4 h-4" />
                          GO VALIDÉ
                        </div>
                        <div className="text-[11px] text-slate-500">
                          Signé par {gate.signedBy} le {gate.signedAt}
                        </div>
                      </div>
                    ) : canSignOff ? (
                      <button
                        onClick={() =>
                          signGoNoGoPhase(
                            gate.id,
                            `${currentUser.firstName} ${currentUser.lastName}`
                          )
                        }
                        className="px-3.5 py-2 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-semibold cursor-pointer"
                      >
                        Signer le GO Direction ({gate.code})
                      </button>
                    ) : (
                      <span className="text-amber-700 font-semibold">
                        En attente signature Direction (Mario / Daniel)
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Immutable Audit Log */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Lock className="w-4 h-4 text-slate-800" />
                Journal d&apos;Audit Immuable (Append-Only — Aucune suppression autorisée)
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Chaque action sensible (connexion, bascule de poste, ouverture manuelle portillon, signature RH, validation paie) est tracée.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-[11px] font-semibold uppercase text-slate-500">
                    <th className="py-2 pr-3">Horodatage</th>
                    <th className="py-2 px-3">Acteur</th>
                    <th className="py-2 px-3">Rôle</th>
                    <th className="py-2 px-3">Club</th>
                    <th className="py-2 px-3">Action</th>
                    <th className="py-2 pl-3">Détails</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {auditLogs.map((log) => (
                    <tr key={log.id}>
                      <td className="py-2.5 pr-3 font-mono text-[11px] text-slate-500 tabular-nums whitespace-nowrap">
                        {log.timestamp.slice(0, 16).replace('T', ' ')}
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-slate-900 whitespace-nowrap">
                        {log.actorName}
                      </td>
                      <td className="py-2.5 px-3 text-slate-600">{log.actorRole}</td>
                      <td className="py-2.5 px-3 font-mono text-slate-600">{log.clubId}</td>
                      <td className="py-2.5 px-3 font-mono font-bold text-slate-800 whitespace-nowrap">
                        {log.action}
                      </td>
                      <td className="py-2.5 pl-3 text-slate-600">
                        {log.target} — {log.afterState}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
