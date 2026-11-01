import React, { useState, useEffect } from 'react';
import {
  Activity,
  AlertTriangle,
  Bot,
  BrainCircuit,
  Calendar,
  CheckCircle2,
  Cpu,
  Database,
  FileCheck2,
  GitBranch,
  Layers,
  Package,
  PhoneCall,
  Play,
  Plus,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  TrendingUp,
  Users,
  Wrench,
  XCircle,
} from 'lucide-react';
import { useCfos } from '../../context/CfosContext';
import { formatClubName } from '../../domain/rules';
import type { AdminSection, ClubId } from '../../types/cfos';

interface AgentDefinition {
  id: string;
  name: string;
  colorHeader: string;
  borderAccent: string;
  badgeBg: string;
  targetSection: AdminSection;
  sourceTools: string[];
  missions: string[];
  autonomyMode: 'validation_humaine' | 'execution_auto_encadree';
  actionsTodayCount: number;
  lastDecisionExample: string;
}

interface OrchestratorDecisionItem {
  id: string;
  timestamp: string;
  triggerEvent: string;
  sourceSystem: string;
  assignedAgent: string;
  agentColor: string;
  proposedAction: string;
  conflictAvoidedNote?: string;
  requiresHumanApproval: boolean;
  status: 'en_attente_validation' | 'execute' | 'bloque_anti_conflit' | 'refuse';
  clubId: ClubId;
}

interface MaintenanceTicket {
  id: string;
  clubId: ClubId;
  equipmentName: string;
  category: 'Technogym / Checkup' | 'Portillons Heitz RFID/BT' | 'CVC / Sauna / Douches' | 'Informatique / VoIP';
  issueDescription: string;
  priority: 'Urgente' | 'Normale' | 'Préventive';
  status: 'Signalé (Agent Maintenance)' | 'Technicien planifié' | 'Résolu';
  supplierName: string;
  estimatedCostEur: number;
  createdAt: string;
}

interface StockConsumableItem {
  id: string;
  clubId: ClubId;
  name: string;
  category: 'Nutrition / Bar' | 'Textile & Accueil' | 'Hygiène & Plateau' | 'Badges & TPV';
  currentQty: number;
  minThreshold: number;
  unit: string;
  supplier: string;
  unitPriceht: number;
  autoOrderPrepared: boolean;
}

const INITIAL_AGENTS: AgentDefinition[] = [
  {
    id: 'agent-rh',
    name: '1. Agent RH & Organisation',
    colorHeader: 'from-blue-700 to-blue-900',
    borderAccent: 'border-blue-500/40',
    badgeBg: 'bg-blue-500/20 text-blue-300',
    targetSection: 'planning-hr',
    sourceTools: ['Planning C.Fitness (ex-Skello)', 'Silae Paie', 'ATS & Contrats'],
    missions: [
      'Optimise les plannings multi-sources (RH, Mywellness, Heitz)',
      'Détecte les sous-effectifs et conflits IDCC 2511 (<11h repos)',
      'Assiste le recrutement et génère les contrats CDI / DPAE',
      'Prépare et vérifie les éléments variables de paie (Silae)',
    ],
    autonomyMode: 'validation_humaine',
    actionsTodayCount: 14,
    lastDecisionExample:
      'Alerte sous-effectif samedi 11h Beynost résolue + Pré-contrôle export Silae Octobre (0 écart).',
  },
  {
    id: 'agent-crm',
    name: '2. Agent CRM & Fidélisation',
    colorHeader: 'from-emerald-700 to-emerald-900',
    borderAccent: 'border-emerald-500/40',
    badgeBg: 'bg-emerald-500/20 text-emerald-300',
    targetSection: 'crm',
    sourceTools: ['API Heitz Passages RFID/BT', 'Technogym Mywellness & Checkup'],
    missions: [
      'Qualifie les prospects entrants en moins de 4 minutes',
      'Analyse la fréquentation réelle aux portillons RFID/Bluetooth Heitz',
      'Détecte les risques de résiliation (>15 jours sans passage)',
      'Prépare les campagnes et relances personnalisées (Wellness Age™)',
    ],
    autonomyMode: 'execution_auto_encadree',
    actionsTodayCount: 28,
    lastDecisionExample:
      'Détection inactivité 20j Nadia Mansouri → Tâche coach créée avec lien direct fiche Mywellness.',
  },
  {
    id: 'agent-recouvrement',
    name: '3. Agent Recouvrement',
    colorHeader: 'from-rose-700 to-rose-900',
    borderAccent: 'border-rose-500/40',
    badgeBg: 'bg-rose-500/20 text-rose-300',
    targetSection: 'devices',
    sourceTools: ['Heitz System (finBalance SEPA)', 'Passerelle SMS 07'],
    missions: [
      'Détecte les impayés SEPA en temps réel (finBalance < 0 €)',
      'Suit les dossiers de régularisation par club',
      'Propose des échéanciers ou liens de régularisation CB/SEPA',
      'Prépare et envoie les relances courtoises (Méthode 3S)',
    ],
    autonomyMode: 'validation_humaine',
    actionsTodayCount: 6,
    lastDecisionExample:
      'Impayé SEPA -39,90 € détecté pour Romain Vasseur → Blocage promo CRM contradictoire + SMS courtois prêt.',
  },
  {
    id: 'agent-telephonie',
    name: '4. Agent Téléphonie IA',
    colorHeader: 'from-purple-700 to-purple-900',
    borderAccent: 'border-purple-500/40',
    badgeBg: 'bg-purple-500/20 text-purple-300',
    targetSection: 'telephony',
    sourceTools: ['Asterisk WebRTC 04 OVHcloud', 'Passerelle 4G Yeastar 07', 'Whisper GPU'],
    missions: [
      'Répond aux appels débordés et qualifie les demandes entrantes',
      'Sélectionne automatiquement la ligne 04 (adhérent) ou 07 (prospect)',
      'Effectue les relances vocales / SMS conformes Bloctel & STOP',
      'Rédige les comptes rendus d’appels automatiquement (Score 3S)',
    ],
    autonomyMode: 'execution_auto_encadree',
    actionsTodayCount: 39,
    lastDecisionExample:
      'Transcription appel Chloé ↔ Sonia Khelifi (Score 91/100) + RDV Bilan Technogym Checkup créé dans Heitz.',
  },
  {
    id: 'agent-maintenance',
    name: '5. Agent Maintenance & Exploitation',
    colorHeader: 'from-amber-600 to-orange-800',
    borderAccent: 'border-amber-500/40',
    badgeBg: 'bg-amber-500/20 text-amber-300',
    targetSection: 'orchestrator',
    sourceTools: ['Télémétrie Technogym / Heitz', 'Stocks & Fournisseurs C.Fitness'],
    missions: [
      'Suit les pannes matériel (machines, portillons, bornes PoE, CVC)',
      'Planifie les interventions techniques sans gêner les heures de pointe',
      'Surveille les consommables (Whey, serviettes, cadenas, hygiène)',
      'Prépare automatiquement les bons de commande fournisseurs',
    ],
    autonomyMode: 'validation_humaine',
    actionsTodayCount: 9,
    lastDecisionExample:
      'Stock Cadenas Acier Beynost sous seuil (4 restants < 10) → Bon de commande 30 unités préparé pour validation.',
  },
  {
    id: 'agent-pilotage',
    name: '6. Agent Pilotage & Intelligence',
    colorHeader: 'from-cyan-600 to-teal-900',
    borderAccent: 'border-cyan-500/40',
    badgeBg: 'bg-cyan-500/20 text-cyan-300',
    targetSection: 'dashboard',
    sourceTools: ['PostgreSQL Unifié', 'Silae', 'Sources Externes & Concurrence'],
    missions: [
      'Analyse la rentabilité consolidée Carré de Soie & Beynost',
      'Suit les KPI (acquisition, transformation, rétention, masse salariale)',
      'Surveille la concurrence locale (Est Lyonnais / Miribel / Vaulx)',
      'Propose des optimisations d’horaires et de campagnes',
    ],
    autonomyMode: 'execution_auto_encadree',
    actionsTodayCount: 18,
    lastDecisionExample:
      'Économie SaaS annuelle consolidée à 18 120 €/an + Hausse de +14 % de rétention grâce aux bilans Technogym Checkup.',
  },
];

const INITIAL_ORCHESTRATOR_DECISIONS: OrchestratorDecisionItem[] = [
  {
    id: 'orch-1',
    timestamp: '16:04:12',
    triggerEvent: 'Passage refusé au lecteur RFID/Bluetooth Heitz CDS (Romain Vasseur · Solde -39,90 €)',
    sourceSystem: 'API Heitz System',
    assignedAgent: 'Agent Recouvrement',
    agentColor: 'text-rose-400',
    proposedAction:
      'Envoyer lien de régularisation SEPA/CB discret par SMS 07 + Notifier l’accueil CDS.',
    conflictAvoidedNote:
      'Action contradictoire évitée : L’Orchestrateur a suspendu la relance promotionnelle « Parrainage » que l’Agent CRM s’apprêtait à envoyer à Romain Vasseur.',
    requiresHumanApproval: true,
    status: 'en_attente_validation',
    clubId: 'carre-de-soie',
  },
  {
    id: 'orch-2',
    timestamp: '15:52:08',
    triggerEvent: 'Seuil de stock critique détecté à Beynost : Cadenas Acier (4 unités restantes < seuil 10)',
    sourceSystem: 'Fournisseurs & Stocks',
    assignedAgent: 'Agent Maintenance & Exploitation',
    agentColor: 'text-amber-400',
    proposedAction:
      'Valider le bon de commande fournisseur #BC-2026-109 (30× Cadenas Acier + 50× Serviettes C.Fitness · 285,00 € HT).',
    requiresHumanApproval: true,
    status: 'en_attente_validation',
    clubId: 'beynost',
  },
  {
    id: 'orch-3',
    timestamp: '15:30:40',
    triggerEvent: 'Bilan Technogym Checkup terminé pour Claire Dubois (Wellness Age™ : 29 ans)',
    sourceSystem: 'Technogym Mywellness Cloud',
    assignedAgent: 'Agent CRM & Fidélisation',
    agentColor: 'text-emerald-400',
    proposedAction:
      'Mise à jour automatique du profil unifié PostgreSQL + Notification félicitations coach Karim.',
    requiresHumanApproval: false,
    status: 'execute',
    clubId: 'carre-de-soie',
  },
  {
    id: 'orch-4',
    timestamp: '14:48:19',
    triggerEvent: 'Pic d’affluence prévu lundi 18h00–20h00 à Carré de Soie (84 adhérents attendus)',
    sourceSystem: 'Agent Pilotage & Intelligence',
    assignedAgent: 'Agent RH & Organisation',
    agentColor: 'text-blue-400',
    proposedAction:
      'Proposer le décalage de 30 min de la pause de Karim Haddad tout en respectant l’IDCC 2511.',
    requiresHumanApproval: true,
    status: 'en_attente_validation',
    clubId: 'carre-de-soie',
  },
];

const INITIAL_MAINTENANCE_TICKETS: MaintenanceTicket[] = [
  {
    id: 'mnt-cta-beynost',
    clubId: 'beynost',
    equipmentName: 'Centrale de Traitement d’Air (CTA Beynost – 15 avril)',
    category: 'CVC / Sauna / Douches',
    issueDescription: 'Maintenance préventive planifiée CTA Beynost (contrôle débit air neuf & remplacement filtres).',
    priority: 'Préventive',
    status: 'Technicien planifié',
    supplierName: 'ClimRhône Maintenance',
    estimatedCostEur: 240,
    createdAt: 'Prévu le 15 avril',
  },
  {
    id: 'mnt-clim-center',
    clubId: 'carre-de-soie',
    equipmentName: 'Climatisation – Espace musculation (Center · 12:30)',
    category: 'CVC / Sauna / Douches',
    issueDescription: 'Intervention maintenance climatisation plateau musculation programmée aujourd’hui à 12h30.',
    priority: 'Urgente',
    status: 'Technicien planifié',
    supplierName: 'ClimRhône Maintenance',
    estimatedCostEur: 150,
    createdAt: 'Aujourd’hui · 12:30',
  },
  {
    id: 'mnt-1',
    clubId: 'carre-de-soie',
    equipmentName: 'Presse à cuisses Biocircuit #3 (Technogym)',
    category: 'Technogym / Checkup',
    issueDescription: 'Calibration servomoteur résistance électronique signalée par télémétrie Mywellness.',
    priority: 'Normale',
    status: 'Technicien planifié',
    supplierName: 'Technogym France SAV',
    estimatedCostEur: 0,
    createdAt: 'Sous contrat garantie',
  },
  {
    id: 'mnt-2',
    clubId: 'beynost',
    equipmentName: 'Lecteur Bluetooth BLE Portillon Entrée Droite (Heitz)',
    category: 'Portillons Heitz RFID/BT',
    issueDescription: 'Mise à jour firmware Bluetooth Low Energy recommandée pour réduire la latence (<15 ms).',
    priority: 'Préventive',
    status: 'Signalé (Agent Maintenance)',
    supplierName: 'Heitz System Support',
    estimatedCostEur: 0,
    createdAt: 'Planifié',
  },
];

const INITIAL_STOCKS: StockConsumableItem[] = [
  {
    id: 'stk-1',
    clubId: 'beynost',
    name: 'Cadenas Acier Haute Sécurité (Vente TPV 8 €)',
    category: 'Badges & TPV',
    currentQty: 4,
    minThreshold: 10,
    unit: 'unités',
    supplier: 'FitSupply Pro Lyon',
    unitPriceht: 3.2,
    autoOrderPrepared: true,
  },
  {
    id: 'stk-2',
    clubId: 'carre-de-soie',
    name: 'Serviettes Microfibres Brodées C.Fitness',
    category: 'Textile & Accueil',
    currentQty: 18,
    minThreshold: 25,
    unit: 'unités',
    supplier: 'FitSupply Pro Lyon',
    unitPriceht: 4.5,
    autoOrderPrepared: true,
  },
  {
    id: 'stk-3',
    clubId: 'carre-de-soie',
    name: 'Cartes / Badges RFID MIFARE Heitz Vierges',
    category: 'Badges & TPV',
    currentQty: 85,
    minThreshold: 30,
    unit: 'badges',
    supplier: 'Heitz System',
    unitPriceht: 1.8,
    autoOrderPrepared: false,
  },
  {
    id: 'stk-4',
    clubId: 'beynost',
    name: 'Spray Désinfectant Virucide Plateau (Bidons 5L)',
    category: 'Hygiène & Plateau',
    currentQty: 9,
    minThreshold: 6,
    unit: 'bidons 5L',
    supplier: 'Hygiène Sport Rhône',
    unitPriceht: 14.9,
    autoOrderPrepared: false,
  },
  {
    id: 'stk-5',
    clubId: 'carre-de-soie',
    name: 'Isolat Whey Native Vanille & Chocolat (Pots 2kg)',
    category: 'Nutrition / Bar',
    currentQty: 14,
    minThreshold: 10,
    unit: 'pots 2kg',
    supplier: 'NutriSport France',
    unitPriceht: 34.0,
    autoOrderPrepared: false,
  },
  {
    id: 'stk-6',
    clubId: 'beynost',
    name: 'Boissons Isotoniques & BCAA Frigo Bar (Packs x24)',
    category: 'Nutrition / Bar',
    currentQty: 11,
    minThreshold: 8,
    unit: 'packs x24',
    supplier: 'NutriSport France',
    unitPriceht: 19.5,
    autoOrderPrepared: false,
  },
];

interface PurchaseOrderItem {
  id: string;
  reference: string;
  clubId: ClubId;
  supplier: string;
  itemsSummary: string;
  amountHtEur: number;
  date: string;
  status: 'Brouillon IA' | 'Commande envoyée' | 'Livré & Réceptionné';
}

const INITIAL_PURCHASE_ORDERS: PurchaseOrderItem[] = [
  {
    id: 'po-1',
    reference: 'BC-2025-0412',
    clubId: 'beynost',
    supplier: 'FitSupply Pro Lyon',
    itemsSummary: '25× Cadenas Acier Haute Sécurité + 30× Serviettes C.Fitness',
    amountHtEur: 215.0,
    date: '14 avril 2025',
    status: 'Brouillon IA',
  },
  {
    id: 'po-2',
    reference: 'BC-2025-0409',
    clubId: 'carre-de-soie',
    supplier: 'NutriSport France',
    itemsSummary: '12× Whey Isolat 2kg + 10× Packs Boissons BCAA Bar',
    amountHtEur: 603.0,
    date: '11 avril 2025',
    status: 'Commande envoyée',
  },
  {
    id: 'po-3',
    reference: 'BC-2025-0402',
    clubId: 'carre-de-soie',
    supplier: 'Heitz System',
    itemsSummary: '100× Badges RFID MIFARE + 10× Rouleaux Thermiques TPV NF525',
    amountHtEur: 198.0,
    date: '04 avril 2025',
    status: 'Livré & Réceptionné',
  },
];

export function OrchestratorMaintenanceView() {
  const { clubFilter, heitzMembers, employees, setActiveSection, navSubTarget } = useCfos();

  const [activeTab, setActiveTab] = useState<
    | 'ARCHITECTURE_ORCHESTRATOR'
    | 'MODULE_MAINTENANCE'
    | 'MODULE_STOCKS'
    | 'INFRA_POSTGRES_TEMPORAL'
  >(
    navSubTarget === 'stocks'
      ? 'MODULE_STOCKS'
      : navSubTarget === 'maintenance'
      ? 'MODULE_MAINTENANCE'
      : navSubTarget === 'infra'
      ? 'INFRA_POSTGRES_TEMPORAL'
      : 'ARCHITECTURE_ORCHESTRATOR'
  );

  useEffect(() => {
    if (navSubTarget === 'stocks') {
      setActiveTab('MODULE_STOCKS');
    } else if (navSubTarget === 'maintenance') {
      setActiveTab('MODULE_MAINTENANCE');
    } else if (navSubTarget === 'agents') {
      setActiveTab('ARCHITECTURE_ORCHESTRATOR');
    } else if (navSubTarget === 'infra') {
      setActiveTab('INFRA_POSTGRES_TEMPORAL');
    }
  }, [navSubTarget]);

  const [agents, setAgents] = useState<AgentDefinition[]>(INITIAL_AGENTS);
  const [decisions, setDecisions] = useState<OrchestratorDecisionItem[]>(
    INITIAL_ORCHESTRATOR_DECISIONS
  );
  const [tickets, setTickets] = useState<MaintenanceTicket[]>(
    INITIAL_MAINTENANCE_TICKETS
  );
  const [stocks, setStocks] = useState<StockConsumableItem[]>(INITIAL_STOCKS);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrderItem[]>(
    INITIAL_PURCHASE_ORDERS
  );
  const [showDiagramBlueprint, setShowDiagramBlueprint] = useState<boolean>(false);

  // New stock / purchase order form state
  const [newStockName, setNewStockName] = useState('');
  const [newStockCategory, setNewStockCategory] =
    useState<StockConsumableItem['category']>('Nutrition / Bar');
  const [newStockClub, setNewStockClub] = useState<ClubId>('carre-de-soie');
  const [newStockSupplier, setNewStockSupplier] = useState('FitSupply Pro Lyon');
  const [newStockQty, setNewStockQty] = useState(20);
  const [newStockPrice, setNewStockPrice] = useState(12.5);

  // New maintenance ticket form state
  const [newEquipment, setNewEquipment] = useState('');
  const [newClubId, setNewClubId] = useState<ClubId>('carre-de-soie');
  const [newCategory, setNewCategory] =
    useState<MaintenanceTicket['category']>('Technogym / Checkup');
  const [newPriority, setNewPriority] =
    useState<MaintenanceTicket['priority']>('Normale');
  const [newIssue, setNewIssue] = useState('');

  const handleApproveDecision = (id: string) => {
    setDecisions((prev) =>
      prev.map((d) => (d.id === id ? { ...d, status: 'execute' } : d))
    );
  };

  const handleRejectDecision = (id: string) => {
    setDecisions((prev) =>
      prev.map((d) => (d.id === id ? { ...d, status: 'refuse' } : d))
    );
  };

  const handleToggleAgentAutonomy = (agentId: string) => {
    setAgents((prev) =>
      prev.map((a) =>
        a.id === agentId
          ? {
              ...a,
              autonomyMode:
                a.autonomyMode === 'validation_humaine'
                  ? 'execution_auto_encadree'
                  : 'validation_humaine',
            }
          : a
      )
    );
  };

  const handleSimulateOrchestratorEvent = () => {
    const newDecision: OrchestratorDecisionItem = {
      id: `orch-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString('fr-FR'),
      triggerEvent:
        'Nouveau Lead Web qualifié (Sonia Khelifi) + Disponibilité Station Technogym Checkup Beynost vérifiée',
      sourceSystem: 'Temporal / n8n Workflow #WF-402',
      assignedAgent: 'Agent CRM & Fidélisation + Agent Téléphonie IA',
      agentColor: 'text-emerald-400',
      proposedAction:
        'Verrouiller le créneau Bilan Technogym Checkup dans Heitz Agenda + Envoyer SMS de confirmation avec lien Mywellness.',
      conflictAvoidedNote:
        'Vérification Orchestrateur OK : Aucun appel sortant en doublon sur les 24 dernières heures.',
      requiresHumanApproval: true,
      status: 'en_attente_validation',
      clubId: 'beynost',
    };
    setDecisions((prev) => [newDecision, ...prev]);
  };

  const handleAddTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEquipment.trim()) return;
    const created: MaintenanceTicket = {
      id: `mnt-${Date.now()}`,
      clubId: newClubId,
      equipmentName: newEquipment.trim(),
      category: newCategory,
      issueDescription:
        newIssue.trim() || 'Contrôle demandé par l’équipe club.',
      priority: newPriority,
      status: 'Signalé (Agent Maintenance)',
      supplierName:
        newCategory === 'Technogym / Checkup'
          ? 'Technogym France SAV'
          : newCategory === 'Portillons Heitz RFID/BT'
          ? 'Heitz System Support'
          : 'Prestataire Maintenance Club',
      estimatedCostEur: 0,
      createdAt: new Date().toISOString().slice(0, 10),
    };
    setTickets((prev) => [created, ...prev]);
    setNewEquipment('');
    setNewIssue('');
  };

  const handleAdvanceTicketStatus = (id: string) => {
    setTickets((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        const nextStatus: MaintenanceTicket['status'] =
          t.status === 'Signalé (Agent Maintenance)'
            ? 'Technicien planifié'
            : t.status === 'Technicien planifié'
            ? 'Résolu'
            : 'Signalé (Agent Maintenance)';
        return { ...t, status: nextStatus };
      })
    );
  };

  const handleResetDecision = (id: string) => {
    setDecisions((prev) =>
      prev.map((d) =>
        d.id === id ? { ...d, status: 'en_attente_validation' } : d
      )
    );
  };

  const handleOrderStock = (id: string) => {
    setStocks((prev) =>
      prev.map((s) =>
        s.id === id
          ? {
              ...s,
              currentQty: s.currentQty + 25,
              autoOrderPrepared: false,
            }
          : s
      )
    );
  };

  const handleConsumeStock = (id: string) => {
    setStocks((prev) =>
      prev.map((s) =>
        s.id === id
          ? {
              ...s,
              currentQty: Math.max(1, s.minThreshold - 3),
              autoOrderPrepared: true,
            }
          : s
      )
    );
  };

  const handleCreatePurchaseOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStockName.trim()) return;
    const totalHt = Math.round(newStockQty * newStockPrice * 100) / 100;
    const newPo: PurchaseOrderItem = {
      id: `po-${Date.now()}`,
      reference: `BC-2025-0${Math.floor(420 + Math.random() * 70)}`,
      clubId: newStockClub,
      supplier: newStockSupplier,
      itemsSummary: `${newStockQty}× ${newStockName.trim()}`,
      amountHtEur: totalHt,
      date: "Aujourd'hui",
      status: 'Commande envoyée',
    };
    setPurchaseOrders((prev) => [newPo, ...prev]);

    const newStk: StockConsumableItem = {
      id: `stk-${Date.now()}`,
      clubId: newStockClub,
      name: newStockName.trim(),
      category: newStockCategory,
      currentQty: newStockQty,
      minThreshold: Math.max(5, Math.round(newStockQty * 0.3)),
      unit: 'unités',
      supplier: newStockSupplier,
      unitPriceht: newStockPrice,
      autoOrderPrepared: false,
    };
    setStocks((prev) => [newStk, ...prev]);
    setNewStockName('');
  };

  const handleAdvancePoStatus = (id: string) => {
    setPurchaseOrders((prev) =>
      prev.map((po) => {
        if (po.id !== id) return po;
        const next: PurchaseOrderItem['status'] =
          po.status === 'Brouillon IA'
            ? 'Commande envoyée'
            : 'Livré & Réceptionné';
        return { ...po, status: next };
      })
    );
  };

  const filteredTickets = tickets.filter(
    (t) => clubFilter === 'all' || t.clubId === clubFilter
  );
  const filteredStocks = stocks.filter(
    (s) => clubFilter === 'all' || s.clubId === clubFilter
  );
  const filteredPurchaseOrders = purchaseOrders.filter(
    (po) => clubFilter === 'all' || po.clubId === clubFilter
  );

  const lowStockCount = filteredStocks.filter(
    (s) => s.currentQty < s.minThreshold
  ).length;
  const totalStockValueHt = Math.round(
    filteredStocks.reduce((acc, s) => acc + s.currentQty * s.unitPriceht, 0)
  );

  const pendingApprovalsCount = decisions.filter(
    (d) => d.status === 'en_attente_validation'
  ).length;

  return (
    <div className="space-y-6">
      {/* Dynamic Context Header matching the selected Left Sidebar Item */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-2xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-slate-200/80 pb-4">
          <div className="flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-violet-600 to-indigo-500 text-white flex items-center justify-center shadow-xs shrink-0 mt-0.5">
              {activeTab === 'MODULE_STOCKS' ? (
                <Package className="w-5 h-5" />
              ) : activeTab === 'MODULE_MAINTENANCE' ? (
                <Wrench className="w-5 h-5" />
              ) : (
                <BrainCircuit className="w-5 h-5" />
              )}
            </div>
            <div>
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-violet-50 border border-violet-200 text-violet-700 text-[11px] font-mono font-bold uppercase tracking-wider">
                {activeTab === 'MODULE_STOCKS' && (
                  <span>Stock &amp; Achats · Gestion des Stocks, Consommables &amp; Commandes Fournisseurs</span>
                )}
                {activeTab === 'MODULE_MAINTENANCE' && (
                  <span>Maintenance &amp; Équipements · Parc Technogym, Climatisation CTA &amp; Portillons Heitz</span>
                )}
                {activeTab === 'ARCHITECTURE_ORCHESTRATOR' && (
                  <span>Agents IA · Orchestrateur Central &amp; 6 Agents IA Métier</span>
                )}
                {activeTab === 'INFRA_POSTGRES_TEMPORAL' && (
                  <span>Socle Technique · PostgreSQL 16, Temporal/n8n &amp; Identifiants Unifiés</span>
                )}
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 mt-1.5">
                {activeTab === 'MODULE_STOCKS' && (
                  <>
                    Stock &amp; Achats — <span className="text-violet-600">Inventaire Bi-Club &amp; Fournisseurs</span>
                  </>
                )}
                {activeTab === 'MODULE_MAINTENANCE' && (
                  <>
                    Maintenance — <span className="text-violet-600">Parc Machines, Climatisation CTA &amp; SAV</span>
                  </>
                )}
                {activeTab === 'ARCHITECTURE_ORCHESTRATOR' && (
                  <>
                    Agents IA — <span className="text-violet-600">Orchestrateur Central &amp; 6 Agents Spécialisés</span>
                  </>
                )}
                {activeTab === 'INFRA_POSTGRES_TEMPORAL' && (
                  <>
                    Infrastructure — <span className="text-violet-600">PostgreSQL Unifié &amp; Workflows Temporal</span>
                  </>
                )}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                {activeTab === 'MODULE_STOCKS' &&
                  'Suivi en temps réel des stocks (C.Fitness Center & C.Fitness Place), alertes de seuil bas, réapprovisionnement automatique et bons de commande fournisseurs.'}
                {activeTab === 'MODULE_MAINTENANCE' &&
                  'Pilotage préventif et curatif du parc Technogym Biocircuit/Checkup, des centrales d’air CTA (Beynost & Center) et des portillons RFID/Bluetooth Heitz.'}
                {activeTab === 'ARCHITECTURE_ORCHESTRATOR' &&
                  'Supervision des 6 Agents IA métier (RH, CRM, Recouvrement SEPA, Téléphonie, Maintenance, Pilotage) avec validation humaine en 1 clic.'}
                {activeTab === 'INFRA_POSTGRES_TEMPORAL' &&
                  'Table d’unification sans doublon entre Heitz System, Technogym Mywellness/Checkup et Silae Paie.'}
              </p>
            </div>
          </div>

          {/* Sub-navigation Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200/80 shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab('MODULE_STOCKS')}
              className={`px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors ${
                activeTab === 'MODULE_STOCKS'
                  ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:bg-white hover:text-slate-900'
              }`}
            >
              <Package className="w-3.5 h-3.5" />
              <span>Stock &amp; Achats ({filteredStocks.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('MODULE_MAINTENANCE')}
              className={`px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors ${
                activeTab === 'MODULE_MAINTENANCE'
                  ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:bg-white hover:text-slate-900'
              }`}
            >
              <Wrench className="w-3.5 h-3.5" />
              <span>Maintenance ({filteredTickets.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('ARCHITECTURE_ORCHESTRATOR')}
              className={`px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors ${
                activeTab === 'ARCHITECTURE_ORCHESTRATOR'
                  ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:bg-white hover:text-slate-900'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Agents IA ({pendingApprovalsCount})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('INFRA_POSTGRES_TEMPORAL')}
              className={`px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors ${
                activeTab === 'INFRA_POSTGRES_TEMPORAL'
                  ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:bg-white hover:text-slate-900'
              }`}
            >
              <GitBranch className="w-3.5 h-3.5" />
              <span>Base Unifiée</span>
            </button>
          </div>
        </div>
      </div>

      {/* =================================================================== */}
      {/* TAB 1:LES 4 MODULES MÉTIER + ORCHESTRATEUR CENTRAL + 6 AGENTS IA    */}
      {/* =================================================================== */}
      {activeTab === 'ARCHITECTURE_ORCHESTRATOR' && (
        <div className="space-y-6">
          {/* LAYER 1: LES 4 MODULES MÉTIER (Clickable Direct Navigation) */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <div className="text-[11px] font-mono uppercase tracking-wider text-violet-600 font-bold">
                  Couche 1 du Schéma Directeur · Vos outils de travail au quotidien
                </div>
                <h2 className="text-base sm:text-lg font-extrabold text-slate-900">
                  Les 4 Modules Métier Unifiés de C.Fitness OS
                </h2>
              </div>
              <span className="text-xs font-semibold text-slate-500">
                Cliquez sur un module pour l&apos;ouvrir directement
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 text-xs">
              {/* Module 1: RH & Organisation (Blue) */}
              <div
                onClick={() => setActiveSection('planning-hr')}
                className="rounded-2xl p-4 bg-gradient-to-br from-blue-600 to-blue-800 text-white border border-blue-400/30 shadow-xs cursor-pointer hover:brightness-105 transition-all space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-extrabold text-sm">
                    <Calendar className="w-4 h-4 text-sky-200" />
                    <span>Module RH &amp; Organisation</span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-black/25 font-mono text-[10px]">
                    Ex-Skello
                  </span>
                </div>
                <ul className="space-y-1 text-blue-100 text-[11px] list-disc list-inside">
                  <li>Plannings multi-sources et équipes</li>
                  <li>Congés, absences &amp; badgeuse PIN</li>
                  <li>Contrats CDI, recrutement ATS &amp; signature 0 €</li>
                  <li>Préparation de paie (CSV &amp; API Silae)</li>
                </ul>
              </div>

              {/* Module 2: CRM & Fidélisation (Green) */}
              <div
                onClick={() => setActiveSection('crm')}
                className="rounded-2xl p-4 bg-gradient-to-br from-emerald-600 to-emerald-800 text-white border border-emerald-400/30 shadow-xs cursor-pointer hover:brightness-105 transition-all space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-extrabold text-sm">
                    <Users className="w-4 h-4 text-emerald-200" />
                    <span>Module CRM &amp; Fidélisation</span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-black/25 font-mono text-[10px]">
                    Ex-LEADS
                  </span>
                </div>
                <ul className="space-y-1 text-emerald-100 text-[11px] list-disc list-inside">
                  <li>Prospects et adhérents bi-club</li>
                  <li>Campagnes marketing &amp; SMS STOP</li>
                  <li>Relances &amp; rétention (&gt;15j sans passage)</li>
                  <li>Suivi commercial (Obj. 20 abos/mois)</li>
                </ul>
              </div>

              {/* Module 3: Téléphonie commerciale (Purple) */}
              <div
                onClick={() => setActiveSection('telephony')}
                className="rounded-2xl p-4 bg-gradient-to-br from-violet-600 to-indigo-800 text-white border border-violet-400/30 shadow-xs cursor-pointer hover:brightness-105 transition-all space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-extrabold text-sm">
                    <PhoneCall className="w-4 h-4 text-violet-200" />
                    <span>Module Téléphonie Commerciale</span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-black/25 font-mono text-[10px]">
                    Ex-Ringover
                  </span>
                </div>
                <ul className="space-y-1 text-violet-100 text-[11px] list-disc list-inside">
                  <li>Appels entrants / sortants (04 OVH + 07 SIM)</li>
                  <li>Qualification de leads &amp; Hot Desking</li>
                  <li>Relances automatiques &amp; rotation anti-spam</li>
                  <li>Historique, enregistrements &amp; stats Whisper</li>
                </ul>
              </div>

              {/* Module 4: Maintenance & Gestion générale */}
              <div
                onClick={() => setActiveTab('MODULE_MAINTENANCE')}
                className="rounded-2xl p-4 bg-gradient-to-br from-amber-500 to-orange-700 text-white border border-amber-400/30 shadow-xs cursor-pointer hover:brightness-105 transition-all space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-extrabold text-sm">
                    <Wrench className="w-4 h-4 text-amber-100" />
                    <span>Module Maintenance &amp; Gestion</span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-black/25 font-mono text-[10px]">
                    Exploitation
                  </span>
                </div>
                <ul className="space-y-1 text-amber-50 text-[11px] list-disc list-inside">
                  <li>Équipements Technogym/Heitz &amp; interventions</li>
                  <li>Stocks et consommables (seuils d’alerte)</li>
                  <li>Fournisseurs et bons de commandes</li>
                  <li>Dépenses et procédures ouverture/fermeture</li>
                </ul>
              </div>
            </div>
          </div>

          {/* LAYER 2: ORCHESTRATEUR CENTRAL (Coordination, Contrôle, Anti-Conflit & Validation Humaine) */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 border-b border-slate-200/80 pb-4">
              <div className="flex items-start gap-3.5">
                <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-violet-600 to-indigo-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <BrainCircuit className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[11px] font-mono uppercase tracking-wider text-violet-600 font-bold">
                      Couche 2 · Orchestrateur Central C.Fitness OS
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono text-[10px] font-bold">
                      DÉDOUBLONNAGE &amp; ANTI-CONTRADICTION ACTIFS
                    </span>
                  </div>
                  <h2 className="text-lg font-extrabold text-slate-900 mt-0.5">
                    Coordination, Contrôle Qualité &amp; Validation Humaine (Human-in-the-Loop)
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Analyse les événements de Heitz, Mywellness/Checkup et Silae · Déclenche le bon agent · Évite les actions contradictoires · Demande votre validation humaine avant toute action sensible.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleSimulateOrchestratorEvent}
                data-testid="simulate-orchestrator-event-btn"
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-extrabold text-xs flex items-center gap-2 shrink-0 cursor-pointer shadow-xs"
              >
                <Play className="w-4 h-4" />
                <span>Simuler un Événement Multi-Agents</span>
              </button>
            </div>

            {/* Live Queue of Orchestrator Decisions & Human Approvals */}
            <div className="space-y-2.5 text-xs">
              {decisions.map((item) => (
                <div
                  key={item.id}
                  className={`p-3.5 rounded-xl border flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 ${
                    item.status === 'en_attente_validation'
                      ? 'bg-slate-50 border-amber-300'
                      : item.status === 'execute'
                      ? 'bg-slate-50 border-emerald-300'
                      : 'bg-slate-50 border-slate-200 opacity-75'
                  }`}
                >
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-[11px] text-slate-500">
                        [{item.timestamp}]
                      </span>
                      <span className="px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-800 font-mono text-[10px]">
                        Source : {item.sourceSystem}
                      </span>
                      <span className="font-bold text-violet-600">
                        → {item.assignedAgent}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-violet-50 text-violet-700 text-[10px] font-mono font-bold">
                        {formatClubName(item.clubId, true)}
                      </span>
                    </div>

                    <div className="font-bold text-slate-900">
                      Événement : {item.triggerEvent}
                    </div>
                    <div className="text-slate-600">
                      <strong className="text-violet-600">Action proposée :</strong>{' '}
                      {item.proposedAction}
                    </div>

                    {item.conflictAvoidedNote && (
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-medium">
                        <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                        <span>{item.conflictAvoidedNote}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {item.status === 'en_attente_validation' ? (
                      <>
                        <button
                          type="button"
                          onClick={() => handleApproveDecision(item.id)}
                          className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs flex items-center gap-1.5 cursor-pointer"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Valider &amp; Exécuter</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRejectDecision(item.id)}
                          className="px-3 py-2 rounded-xl bg-white hover:bg-rose-50 text-rose-600 border border-slate-200 font-semibold text-xs flex items-center gap-1 cursor-pointer"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Refuser</span>
                        </button>
                      </>
                    ) : item.status === 'execute' ? (
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold text-[11px] flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Exécuté &amp; Tracé</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => handleResetDecision(item.id)}
                          className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 text-[11px] font-semibold cursor-pointer"
                        >
                          Remettre en attente
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 font-bold text-[11px]">
                          Refusé par l&apos;humain
                        </span>
                        <button
                          type="button"
                          onClick={() => handleResetDecision(item.id)}
                          className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 text-[11px] font-semibold cursor-pointer"
                        >
                          Remettre en attente
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* LAYER 3: LES 6 AGENTS IA MÉTIER */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <div className="text-[11px] font-mono uppercase tracking-wider text-violet-600 font-bold">
                  Couche 3 du Schéma Directeur · Assistants spécialisés gouvernés par permissions
                </div>
                <h2 className="text-base sm:text-lg font-extrabold text-slate-900">
                  Les 6 Agents IA Métier de C.Fitness OS
                </h2>
              </div>
              <span className="text-xs text-slate-500">
                Basculez chaque agent entre « Validation humaine » et « Exécution auto encadrée »
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 text-xs">
              {agents.map((ag) => (
                <div
                  key={ag.id}
                  className="rounded-2xl bg-white border border-slate-200/80 overflow-hidden flex flex-col justify-between shadow-2xs"
                >
                  <div>
                    <div
                      className={`bg-gradient-to-r ${ag.colorHeader} px-4 py-3 text-white flex items-center justify-between gap-2`}
                    >
                      <div className="flex items-center gap-2 font-black text-sm">
                        <Bot className="w-4 h-4 text-white shrink-0" />
                        <span>{ag.name}</span>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-black/30 font-mono text-[10px]">
                        {ag.actionsTodayCount} actions/j
                      </span>
                    </div>

                    <div className="p-4 space-y-3">
                      <div className="flex flex-wrap gap-1">
                        {ag.sourceTools.map((src) => (
                          <span
                            key={src}
                            className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono text-[10px] font-semibold"
                          >
                            {src}
                          </span>
                        ))}
                      </div>

                      <ul className="space-y-1.5 text-slate-700 text-[11px]">
                        {ag.missions.map((m) => (
                          <li key={m} className="flex items-start gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                            <span>{m}</span>
                          </li>
                        ))}
                      </ul>

                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-[11px] text-slate-600">
                        <span className="font-bold text-slate-900">Dernière action : </span>
                        {ag.lastDecisionExample}
                      </div>
                    </div>
                  </div>

                  <div className="px-4 py-3 bg-slate-50 border-t border-slate-200/80 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => handleToggleAgentAutonomy(ag.id)}
                      className={`px-2.5 py-1 rounded-lg font-mono text-[10px] font-bold cursor-pointer border ${
                        ag.autonomyMode === 'validation_humaine'
                          ? 'bg-amber-50 text-amber-800 border-amber-200'
                          : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      }`}
                    >
                      {ag.autonomyMode === 'validation_humaine'
                        ? 'Mode : Validation Humaine'
                        : 'Mode : Auto Encadré'}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (ag.id === 'agent-maintenance') {
                          setActiveTab('MODULE_MAINTENANCE');
                        } else {
                          setActiveSection(ag.targetSection);
                        }
                      }}
                      className="text-[11px] font-bold text-violet-600 hover:text-violet-700 underline cursor-pointer"
                    >
                      Ouvrir le module →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* LAYER 4: DONNÉES ET OUTILS CONNECTÉS (Chaque outil conserve sa source de vérité) */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3 shadow-2xs">
            <div>
              <div className="text-[11px] font-mono uppercase tracking-wider text-emerald-700 font-bold">
                Couche 4 du Schéma Directeur · Chaque outil conserve sa source de vérité
              </div>
              <h2 className="text-base font-extrabold text-slate-900">
                Données et Outils Connectés (Sans Ressaisie ni Duplication)
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 text-xs">
              {[
                {
                  title: 'Heitz System',
                  badge: 'Source de vérité Accès & SEPA',
                  desc: 'Contrôle d’accès RFID/Bluetooth · Passages adhérents · Solde finBalance SEPA & RDV',
                  action: () => setActiveSection('devices'),
                  actionLabel: 'Ouvrir Portillons Heitz →',
                },
                {
                  title: 'Technogym Mywellness',
                  badge: 'Source de vérité Suivi Sportif',
                  desc: 'Programmes Biocircuit · MOVEs · Cours collectifs & ouverture directe 1-clic',
                  action: () => setActiveSection('planning-hr'),
                  actionLabel: 'Ouvrir Planning Unifié →',
                },
                {
                  title: 'Technogym Checkup™',
                  badge: 'Remplace InBody (2 Clubs)',
                  desc: 'Balance BIA révolutionnaire & capteurs 3D intégrés nativement à Mywellness (Wellness Age™)',
                  action: () => setActiveSection('devices'),
                  actionLabel: 'Ouvrir Stations Checkup →',
                },
                {
                  title: 'Silae Paie',
                  badge: 'Source de vérité Paie',
                  desc: 'Transmission des éléments variables de paie RH (Export CSV compatible + API REST)',
                  action: () => setActiveSection('planning-hr'),
                  actionLabel: 'Ouvrir Pré-Paie Silae →',
                },
                {
                  title: 'Outils Téléphonie',
                  badge: '04 OVHcloud + 07 Yeastar 4G',
                  desc: 'Appels entrants/sortants conformes ARCEP · Enregistrements & transcription locale',
                  action: () => setActiveSection('telephony'),
                  actionLabel: 'Ouvrir Téléphonie 04/07 →',
                },
                {
                  title: 'Fournisseurs & Externe',
                  badge: 'Stocks & Veille Marché',
                  desc: 'Commandes consommables, interventions SAV et veille concurrence locale',
                  action: () => setActiveTab('MODULE_MAINTENANCE'),
                  actionLabel: 'Ouvrir Stocks & SAV →',
                },
              ].map((tool) => (
                <div
                  key={tool.title}
                  className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between space-y-2"
                >
                  <div className="space-y-1.5">
                    <div className="font-extrabold text-slate-900">{tool.title}</div>
                    <div className="inline-block px-2 py-0.5 rounded bg-violet-100 text-violet-800 font-mono text-[10px] font-bold">
                      {tool.badge}
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      {tool.desc}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={tool.action}
                    className="w-full py-1.5 px-2 rounded-lg bg-white hover:bg-slate-100 border border-slate-300 text-slate-900 font-bold text-[11px] cursor-pointer text-center"
                  >
                    {tool.actionLabel}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* TAB STOCKS: MODULE STOCK & ACHATS DÉDIÉ (INVENTAIRE & FOURNISSEURS) */}
      {/* =================================================================== */}
      {activeTab === 'MODULE_STOCKS' && (
        <div className="space-y-6">
          {/* 4 Stock & Achats KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-2xs">
              <div className="text-xs font-medium text-slate-500">
                Références en stock (2 clubs)
              </div>
              <div className="text-2xl font-black text-slate-900 mt-1">
                {filteredStocks.length} articles
              </div>
              <div className="text-[11px] text-emerald-600 font-semibold mt-0.5">
                Nutrition, Textile, Badges RFID &amp; Hygiène
              </div>
            </div>

            <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-2xs">
              <div className="text-xs font-medium text-slate-500">
                Alertes Seuil Bas / À commander
              </div>
              <div className="text-2xl font-black text-rose-600 mt-1">
                {lowStockCount} alertes
              </div>
              <div className="text-[11px] text-rose-600 font-semibold mt-0.5">
                Pré-commandes fournisseur prêtes
              </div>
            </div>

            <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-2xs">
              <div className="text-xs font-medium text-slate-500">
                Valeur du Stock en Réserve
              </div>
              <div className="text-2xl font-black text-slate-900 mt-1">
                {totalStockValueHt.toLocaleString('fr-FR')} € HT
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                Valorisation temps réel Center &amp; Place
              </div>
            </div>

            <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-2xs">
              <div className="text-xs font-medium text-slate-500">
                Bons de Commande Fournisseurs
              </div>
              <div className="text-2xl font-black text-violet-600 mt-1">
                {filteredPurchaseOrders.length} commandes
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                FitSupply Pro, NutriSport, Heitz, Hygiène
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left 7 Cols: Inventaire des Stocks & Réapprovisionnement */}
            <div className="lg:col-span-7 bg-white border border-slate-200/80 rounded-2xl p-5 space-y-4 shadow-2xs">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 pb-3">
                <div>
                  <span className="text-[11px] font-mono uppercase text-orange-600 font-bold">
                    Inventaire Temps Réel · C.Fitness Center &amp; C.Fitness Place
                  </span>
                  <h2 className="text-base font-extrabold text-slate-900">
                    État des Stocks, Consommables &amp; Produits Bar / Boutique ({filteredStocks.length})
                  </h2>
                </div>
                <span className="px-2.5 py-1 rounded-lg bg-orange-50 border border-orange-200 text-orange-800 font-bold text-xs">
                  Surveillance Seuils Active
                </span>
              </div>

              <div className="space-y-3 text-xs">
                {filteredStocks.map((s) => {
                  const isLow = s.currentQty < s.minThreshold;
                  const ratio = Math.min(100, Math.round((s.currentQty / (s.minThreshold * 2)) * 100));
                  return (
                    <div
                      key={s.id}
                      className={`p-3.5 rounded-xl border space-y-2.5 ${
                        isLow
                          ? 'bg-rose-50/50 border-rose-300'
                          : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-bold text-slate-900 text-sm">{s.name}</span>
                            <span className="px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-600 text-[10px] font-semibold">
                              {s.category}
                            </span>
                            <span className="px-2 py-0.5 rounded bg-violet-50 text-violet-700 font-mono text-[10px] font-bold">
                              {formatClubName(s.clubId, true)}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            Fournisseur : <strong>{s.supplier}</strong> · Prix d&apos;achat :{' '}
                            <strong>{s.unitPriceht.toFixed(2)} € HT / {s.unit}</strong>
                          </div>
                        </div>
                        <span
                          className={`px-2.5 py-1 rounded-lg font-mono font-bold text-xs shrink-0 ${
                            isLow
                              ? 'bg-rose-600 text-white'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {s.currentQty} {s.unit} (Seuil min: {s.minThreshold})
                        </span>
                      </div>

                      {/* Stock Progress Bar */}
                      <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                        <div
                          style={{ width: `${ratio}%` }}
                          className={`h-full rounded-full ${
                            isLow ? 'bg-rose-500' : 'bg-emerald-500'
                          }`}
                        />
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-2 pt-0.5">
                        {isLow ? (
                          <span className="text-[11px] text-rose-800 font-semibold flex items-center gap-1">
                            <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                            Stock sous le seuil minimum — Réapprovisionnement recommandé (+25 {s.unit})
                          </span>
                        ) : (
                          <span className="text-[11px] text-emerald-800 font-medium">
                            Stock nominal en réserve club
                          </span>
                        )}

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleConsumeStock(s.id)}
                            className="px-2.5 py-1 rounded-lg bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 font-semibold text-[11px] cursor-pointer"
                          >
                            - Sortie stock
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOrderStock(s.id)}
                            className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                          >
                            <ShoppingCart className="w-3.5 h-3.5" />
                            <span>Commander / Réceptionner (+25)</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right 5 Cols: Nouvel Achat / Bon de Commande & Historique Achats */}
            <div className="lg:col-span-5 space-y-5">
              {/* Create Purchase Order Form */}
              <div className="bg-white border border-slate-200/80 rounded-2xl p-5 space-y-4 shadow-2xs">
                <div className="border-b border-slate-100 pb-3">
                  <span className="text-[11px] font-mono uppercase text-violet-600 font-bold">
                    Achats &amp; Approvisionnements
                  </span>
                  <h2 className="text-base font-extrabold text-slate-900">
                    Créer un Bon de Commande Fournisseur
                  </h2>
                </div>

                <form onSubmit={handleCreatePurchaseOrder} className="space-y-3 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Article ou lot à commander
                    </label>
                    <input
                      type="text"
                      required
                      value={newStockName}
                      onChange={(e) => setNewStockName(e.target.value)}
                      placeholder="Ex: Barres Protéinées Chocolat (Boîte x24)..."
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Catégorie d&apos;achat
                      </label>
                      <select
                        value={newStockCategory}
                        onChange={(e) =>
                          setNewStockCategory(e.target.value as StockConsumableItem['category'])
                        }
                        className="w-full px-2.5 py-2 rounded-xl border border-slate-300 bg-white"
                      >
                        <option value="Nutrition / Bar">Nutrition / Bar</option>
                        <option value="Textile & Accueil">Textile &amp; Accueil</option>
                        <option value="Badges & TPV">Badges &amp; TPV</option>
                        <option value="Hygiène & Plateau">Hygiène &amp; Plateau</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Club destinataire
                      </label>
                      <select
                        value={newStockClub}
                        onChange={(e) => setNewStockClub(e.target.value as ClubId)}
                        className="w-full px-2.5 py-2 rounded-xl border border-slate-300 bg-white"
                      >
                        <option value="carre-de-soie">C.Fitness Center (CDS)</option>
                        <option value="beynost">C.Fitness Place (BEY)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2.5">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Fournisseur
                      </label>
                      <select
                        value={newStockSupplier}
                        onChange={(e) => setNewStockSupplier(e.target.value)}
                        className="w-full px-2.5 py-2 rounded-xl border border-slate-300 bg-white"
                      >
                        <option value="FitSupply Pro Lyon">FitSupply Pro Lyon</option>
                        <option value="NutriSport France">NutriSport France</option>
                        <option value="Heitz System">Heitz System</option>
                        <option value="Hygiène Sport Rhône">Hygiène Sport Rhône</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Quantité
                      </label>
                      <input
                        type="number"
                        min={1}
                        value={newStockQty}
                        onChange={(e) => setNewStockQty(Number(e.target.value))}
                        className="w-full px-2.5 py-2 rounded-xl border border-slate-300 bg-white"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Prix unitaire HT (€)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        min={0.5}
                        value={newStockPrice}
                        onChange={(e) => setNewStockPrice(Number(e.target.value))}
                        className="w-full px-2.5 py-2 rounded-xl border border-slate-300 bg-white"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    <span>
                      Émettre le Bon de Commande ({(newStockQty * newStockPrice).toFixed(2)} € HT)
                    </span>
                  </button>
                </form>
              </div>

              {/* Purchase Orders History */}
              <div className="bg-white border border-slate-200/80 rounded-2xl p-5 space-y-3.5 shadow-2xs text-xs">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                  <div>
                    <span className="text-[10px] font-mono uppercase text-emerald-700 font-bold">
                      Suivi des Commandes &amp; Livraisons
                    </span>
                    <h3 className="text-sm font-extrabold text-slate-900">
                      Bons de Commande Fournisseurs ({filteredPurchaseOrders.length})
                    </h3>
                  </div>
                </div>

                <div className="space-y-2.5">
                  {filteredPurchaseOrders.map((po) => (
                    <div
                      key={po.id}
                      className="p-3 rounded-xl border border-slate-200 bg-slate-50/70 space-y-1.5"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono font-bold text-violet-700">
                          {po.reference} · {po.supplier}
                        </span>
                        <span className="font-black text-slate-900">
                          {po.amountHtEur.toFixed(2)} € HT
                        </span>
                      </div>
                      <div className="text-slate-700 font-medium">{po.itemsSummary}</div>
                      <div className="flex items-center justify-between gap-2 pt-1">
                        <span className="text-[11px] text-slate-500">
                          {formatClubName(po.clubId, true)} · {po.date}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                              po.status === 'Livré & Réceptionné'
                                ? 'bg-emerald-100 text-emerald-800'
                                : po.status === 'Commande envoyée'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {po.status}
                          </span>
                          {po.status !== 'Livré & Réceptionné' && (
                            <button
                              type="button"
                              onClick={() => handleAdvancePoStatus(po.id)}
                              className="px-2 py-0.5 rounded bg-violet-600 text-white font-bold text-[10px] cursor-pointer"
                            >
                              {po.status === 'Brouillon IA' ? 'Envoyer' : 'Réceptionner'}
                            </button>
                          )}
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

      {/* =================================================================== */}
      {/* TAB 2: MODULE MAINTENANCE & PARC ÉQUIPEMENTS                        */}
      {/* =================================================================== */}
      {activeTab === 'MODULE_MAINTENANCE' && (
        <div className="space-y-6">
          {/* 4 Maintenance KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-2xs">
              <div className="text-xs font-medium text-slate-500">
                Interventions &amp; Tickets SAV
              </div>
              <div className="text-2xl font-black text-slate-900 mt-1">
                {filteredTickets.length} dossiers
              </div>
              <div className="text-[11px] text-violet-600 font-semibold mt-0.5">
                Dont CTA Beynost (15 avr.) &amp; Clim Center (12:30)
              </div>
            </div>
            <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-2xs">
              <div className="text-xs font-medium text-slate-500">
                Disponibilité Parc Technogym
              </div>
              <div className="text-2xl font-black text-emerald-600 mt-1">98,6 %</div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                Biocircuit, Excite &amp; 2× Stations Checkup
              </div>
            </div>
            <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-2xs">
              <div className="text-xs font-medium text-slate-500">
                Portillons RFID / BLE Heitz
              </div>
              <div className="text-2xl font-black text-sky-600 mt-1">100 % actifs</div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                Latence Wiegand &lt; 18 ms sur les 2 clubs
              </div>
            </div>
            <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-2xs">
              <div className="text-xs font-medium text-slate-500">
                Prochaine Maintenance Prévue
              </div>
              <div className="text-base font-black text-slate-900 mt-1">
                CTA Beynost – 15 avril
              </div>
              <div className="text-[11px] text-emerald-600 font-semibold mt-0.5">
                ClimRhône Maintenance confirmé
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left 8 Cols: Équipements & Interventions SAV */}
            <div className="lg:col-span-8 bg-white border border-slate-200/80 rounded-2xl p-5 space-y-4 shadow-2xs">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 pb-3">
                <div>
                  <span className="text-[11px] font-mono uppercase text-violet-600 font-bold">
                    Maintenance Préventive &amp; Curative · C.Fitness Center &amp; C.Fitness Place
                  </span>
                  <h2 className="text-base font-extrabold text-slate-900">
                    Suivi des Équipements, Climatisation CTA &amp; Interventions ({filteredTickets.length})
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('MODULE_STOCKS')}
                  className="px-3 py-1.5 rounded-xl bg-orange-50 hover:bg-orange-100 border border-orange-200 text-orange-800 font-bold text-xs cursor-pointer"
                >
                  Voir Stock &amp; Achats ({filteredStocks.length}) →
                </button>
              </div>

              {/* Quick Add Ticket Form */}
              <form
                onSubmit={handleAddTicket}
                className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-1 sm:grid-cols-12 gap-2.5 text-xs"
              >
                <div className="sm:col-span-4">
                  <label className="block font-semibold text-slate-700 mb-1">
                    Équipement concerné
                  </label>
                  <input
                    type="text"
                    required
                    value={newEquipment}
                    onChange={(e) => setNewEquipment(e.target.value)}
                    placeholder="Ex: Tapis Technogym Excite #4..."
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white"
                  />
                </div>
                <div className="sm:col-span-3">
                  <label className="block font-semibold text-slate-700 mb-1">
                    Catégorie
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) =>
                      setNewCategory(e.target.value as MaintenanceTicket['category'])
                    }
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white"
                  >
                    <option value="Technogym / Checkup">Technogym / Checkup</option>
                    <option value="Portillons Heitz RFID/BT">Portillons Heitz RFID/BT</option>
                    <option value="CVC / Sauna / Douches">CVC / Sauna / Douches</option>
                    <option value="Informatique / VoIP">Informatique / VoIP</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">Club</label>
                  <select
                    value={newClubId}
                    onChange={(e) => setNewClubId(e.target.value as ClubId)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white"
                  >
                    <option value="carre-de-soie">Center (CDS)</option>
                    <option value="beynost">Place (BEY)</option>
                  </select>
                </div>
                <div className="sm:col-span-3 flex items-end">
                  <button
                    type="submit"
                    className="w-full py-1.5 px-3 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Créer Ticket SAV</span>
                  </button>
                </div>
                <div className="sm:col-span-12">
                  <input
                    type="text"
                    value={newIssue}
                    onChange={(e) => setNewIssue(e.target.value)}
                    placeholder="Description du symptôme ou de l'intervention préventive..."
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white"
                  />
                </div>
              </form>

              {/* Tickets List */}
              <div className="space-y-2.5 text-xs">
                {filteredTickets.map((t) => (
                  <div
                    key={t.id}
                    className="p-3.5 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-slate-900">
                          {t.equipmentName}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono text-[10px]">
                          {formatClubName(t.clubId, true)}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-semibold">
                          {t.category}
                        </span>
                      </div>
                      <p className="text-slate-600">{t.issueDescription}</p>
                      <div className="text-[11px] text-slate-500 font-mono">
                        Prestataire : <strong>{t.supplierName}</strong> · Échéance : {t.createdAt}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className={`px-2.5 py-1 rounded-lg font-bold text-[11px] ${
                          t.status === 'Résolu'
                            ? 'bg-emerald-100 text-emerald-800'
                            : t.status === 'Technicien planifié'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {t.status}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleAdvanceTicketStatus(t.id)}
                        className={`px-2.5 py-1 rounded-lg font-semibold text-[11px] cursor-pointer ${
                          t.status === 'Résolu'
                            ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                            : 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white'
                        }`}
                      >
                        {t.status === 'Résolu' ? 'Réouvrir ticket' : 'Valider étape'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right 4 Cols: Contrats de Maintenance & Prestataires Agréés */}
            <div className="lg:col-span-4 bg-white border border-slate-200/80 rounded-2xl p-5 space-y-4 shadow-2xs text-xs">
              <div className="border-b border-slate-100 pb-3">
                <span className="text-[11px] font-mono uppercase text-emerald-600 font-bold">
                  Contrats SAV &amp; Prestataires Bi-Club
                </span>
                <h2 className="text-base font-extrabold text-slate-900">
                  Échéancier Préventif &amp; Garanties
                </h2>
              </div>

              <div className="space-y-3">
                {[
                  {
                    partner: 'ClimRhône Maintenance (CVC / CTA)',
                    scope: 'Centrales d’Air CTA Beynost & Climatisation Musculation Center',
                    nextDate: '14 & 15 avril 2025',
                    badge: '2 interventions cette semaine',
                  },
                  {
                    partner: 'Technogym France SAV',
                    scope: 'Parc Biocircuit, Cardio Excite & 2× Balances Checkup BIA/3D',
                    nextDate: 'Sous garantie intégrale',
                    badge: 'Télémétrie Mywellness OK',
                  },
                  {
                    partner: 'Heitz System Support',
                    scope: 'Tripodes d’entrée F5/F6, Portillons PMR F7 & Lecteurs RFID/BLE',
                    nextDate: 'Contrôle annuel OK',
                    badge: 'Cache hors-ligne actif',
                  },
                ].map((c) => (
                  <div
                    key={c.partner}
                    className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5"
                  >
                    <div className="font-bold text-slate-900">{c.partner}</div>
                    <p className="text-[11px] text-slate-600">{c.scope}</p>
                    <div className="flex items-center justify-between pt-1">
                      <span className="font-mono text-[10px] text-slate-500">{c.nextDate}</span>
                      <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                        {c.badge}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* TAB 3: INFRASTRUCTURE TECHNIQUE (PostgreSQL, Temporal/n8n, LLM)     */}
      {/* =================================================================== */}
      {activeTab === 'INFRA_POSTGRES_TEMPORAL' && (
        <div className="space-y-6">
          {/* 5 Pillars from Layer 5 of the Director Vision Diagram */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3 text-xs">
            {[
              {
                title: '1. Base Centrale PostgreSQL 16',
                sub: 'Données unifiées & Table de correspondance d’identifiants (Heitz ↔ Mywellness ↔ Silae)',
                badge: 'ACTIF · 10.10.0.10:5432',
              },
              {
                title: '2. Workflows Temporal / n8n',
                sub: 'Automatisations résilientes, reprises sur erreur automatiques et étapes de validation humaine',
                badge: '6 WORKFLOWS ACTIFS',
              },
              {
                title: '3. Passerelle IA (Modèles LLM)',
                sub: 'Service unique gouverné, outils autorisés par rôle (RBAC) et plafond strict de coûts mensuels',
                badge: 'BUDGET MAÎTRISÉ',
              },
              {
                title: '4. Sécurité & Gouvernance',
                sub: 'Permissions par rôle, traçabilité SHA-256 append-only et gestion des consentements RGPD / Bloctel',
                badge: 'RGPD ART. 9 OK',
              },
              {
                title: '5. Observabilité & Supervision',
                sub: 'Suivi temps réel des actions agents, latences VPN WireGuard (2,4 ms), erreurs et ROI',
                badge: 'UPTIME 99,98 %',
              },
            ].map((p) => (
              <div
                key={p.title}
                className="p-4 rounded-2xl bg-white border border-slate-200/80 space-y-2 shadow-2xs"
              >
                <span className="px-2 py-0.5 rounded bg-violet-50 text-violet-700 border border-violet-200 font-mono text-[10px] font-bold">
                  {p.badge}
                </span>
                <div className="font-extrabold text-sm text-slate-900">{p.title}</div>
                <p className="text-[11px] text-slate-600 leading-relaxed">{p.sub}</p>
              </div>
            ))}
          </div>

          {/* PostgreSQL Unified Identity Mapping Table (Correspondance d'identifiants sans duplication) */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-2xs text-xs">
            <div>
              <span className="text-[11px] font-mono uppercase text-sky-700 font-bold">
                Base de Données Centrale PostgreSQL · Table `entity_identity_mapping`
              </span>
              <h2 className="text-base font-extrabold text-slate-900">
                Table d&apos;Unification et de Correspondance d&apos;Identifiants (Zéro Duplication entre Logiciels)
              </h2>
              <p className="text-slate-600 mt-0.5">
                Chaque outil conserve sa source de vérité : PostgreSQL relie proprement l&apos;identifiant Heitz, l&apos;identifiant Technogym Mywellness/Checkup et le dossier CRM/RH.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-[11px] font-bold uppercase text-slate-500">
                    <th className="py-2 pr-3">UUID Central C.Fitness OS</th>
                    <th className="py-2 px-3">Personne &amp; Rôle</th>
                    <th className="py-2 px-3">ID Heitz System (RFID/BT)</th>
                    <th className="py-2 px-3">ID Technogym Mywellness / Checkup</th>
                    <th className="py-2 px-3">Matricule Silae / CRM</th>
                    <th className="py-2 pl-3">État Synchronisation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                  {heitzMembers.map((m, idx) => (
                    <tr key={m.id}>
                      <td className="py-2.5 pr-3 text-slate-900 font-bold">
                        cfos-mem-00{idx + 1}
                      </td>
                      <td className="py-2.5 px-3 font-sans font-bold text-slate-900">
                        {m.firstName} {m.lastName}{' '}
                        <span className="text-[10px] font-normal text-slate-500">
                          (Adhérent {formatClubName(m.homeClubId, true)})
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-sky-700 font-bold">
                        {m.id} ({m.badgeCode})
                      </td>
                      <td className="py-2.5 px-3 text-amber-700 font-bold">
                        {m.mywellnessMemberId || 'mw-cloud'} (Wellness Age™{' '}
                        {m.technogymCheckupWellnessAge || 31}a)
                      </td>
                      <td className="py-2.5 px-3 text-emerald-700">
                        CRM-ACTIF-{idx + 101}
                      </td>
                      <td className="py-2.5 pl-3">
                        <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                          100 % UNIFIÉ
                        </span>
                      </td>
                    </tr>
                  ))}
                  {employees.slice(0, 3).map((emp, idx) => (
                    <tr key={emp.id}>
                      <td className="py-2.5 pr-3 text-slate-900 font-bold">
                        cfos-emp-00{idx + 1}
                      </td>
                      <td className="py-2.5 px-3 font-sans font-bold text-slate-900">
                        {emp.firstName} {emp.lastName}{' '}
                        <span className="text-[10px] font-normal text-slate-500">
                          (Salarié · {emp.jobTitle})
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-sky-700">
                        STAFF-RFID-{emp.pinCode}
                      </td>
                      <td className="py-2.5 px-3 text-amber-700">
                        COACH-MW-{emp.id.toUpperCase()}
                      </td>
                      <td className="py-2.5 px-3 text-purple-700 font-bold">
                        SILAE-MAT-00{idx + 1}
                      </td>
                      <td className="py-2.5 pl-3">
                        <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                          100 % UNIFIÉ
                        </span>
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
