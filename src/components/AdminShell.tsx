import React, { useState } from 'react';
import { useCfos } from '../context/CfosContext';
import {
  LayoutDashboard,
  PhoneCall,
  Users,
  Calendar,
  GraduationCap,
  Briefcase,
  QrCode,
  ShieldCheck,
  Menu,
  X,
  UserCheck,
  Smartphone,
  Tablet,
  RotateCcw,
  LogOut,
  HardDriveDownload,
  ZapOff,
  Sun,
  BrainCircuit,
  Headphones,
  FileSignature,
  ChevronDown,
  ChevronRight,
  Lock,
} from 'lucide-react';
import { AdminSection } from '../types/cfos';
import { isSectionAllowedForRole } from '../domain/rules';
import { DashboardView } from './views/DashboardView';
import { OrchestratorMaintenanceView } from './views/OrchestratorMaintenanceView';
import { MyDayCollaboratorView } from './views/MyDayCollaboratorView';
import { TelephonyView } from './views/TelephonyView';
import { CrmView } from './views/CrmView';
import { PlanningHrView } from './views/PlanningHrView';
import { AcademyView } from './views/AcademyView';
import { AtsView } from './views/AtsView';
import { DevicesHeitzView } from './views/DevicesHeitzView';
import { GovernanceView } from './views/GovernanceView';
import { AuthSwitchModal } from './AuthSwitchModal';
import { MywellnessQuickConnect } from './MywellnessQuickConnect';

interface NavEntry {
  key: string;
  sectionId?: AdminSection;
  shellTarget?: 'employe' | 'telephone' | 'tablette';
  label: string;
  shortLabel: string;
  stepNum?: string;
  icon: React.ComponentType<{ className?: string }>;
}

// PREMIER PLAN : Fonctions directement opérationnelles en club (affichées en priorité)
const PRIMARY_OPERATIONAL_ITEMS: NavEntry[] = [
  {
    key: 'op-my-day',
    sectionId: 'my-day',
    stepNum: '01',
    label: 'Ma Journée',
    shortLabel: 'Ma Journée',
    icon: Sun,
  },
  {
    key: 'op-collaborateur',
    shellTarget: 'employe',
    stepNum: '02',
    label: 'Le Collaborateur (Grille & App)',
    shortLabel: 'Le Collaborateur',
    icon: Smartphone,
  },
  {
    key: 'op-planning',
    sectionId: 'planning-hr',
    stepNum: '03',
    label: 'L’Espace Planning',
    shortLabel: 'Espace Planning',
    icon: Calendar,
  },
  {
    key: 'op-telephony',
    sectionId: 'telephony',
    stepNum: '04',
    label: 'La Téléphonie (12 lignes)',
    shortLabel: 'La Téléphonie',
    icon: PhoneCall,
  },
  {
    key: 'op-webrtc',
    shellTarget: 'telephone',
    stepNum: '05',
    label: 'Le WebRTC (Poste 04/07)',
    shortLabel: 'Le WebRTC',
    icon: Headphones,
  },
  {
    key: 'op-crm',
    sectionId: 'crm',
    stepNum: '06',
    label: 'Le CRM (Prospects & Club)',
    shortLabel: 'Le CRM',
    icon: Users,
  },
  {
    key: 'op-ats',
    sectionId: 'ats',
    stepNum: '07',
    label: 'Les ATS & Signatures (0 €)',
    shortLabel: 'ATS Signatures',
    icon: FileSignature,
  },
  {
    key: 'op-devices',
    sectionId: 'devices',
    stepNum: '08',
    label: 'Matériel Heitz & Checkup',
    shortLabel: 'Heitz & Checkup',
    icon: QrCode,
  },
  {
    key: 'op-kiosk',
    shellTarget: 'tablette',
    stepNum: '09',
    label: 'Tablette Kiosque Badgeuse PIN',
    shortLabel: 'Kiosque PIN',
    icon: Tablet,
  },
];

// DEUXIÈME PLAN : Pilotage & Dossier Dirigeants regroupés, Orchestration IA, Académie & Espace Architecte (PIN 0766)
const SECONDARY_BACKOFFICE_ITEMS: NavEntry[] = [
  {
    key: 'sec-dashboard',
    sectionId: 'dashboard',
    stepNum: '10',
    label: 'Pilotage & Dossier Dirigeants',
    shortLabel: 'Pilotage & Dirigeants',
    icon: LayoutDashboard,
  },
  {
    key: 'sec-orchestrator',
    sectionId: 'orchestrator',
    stepNum: '11',
    label: 'Orchestration IA (6 Agents) & Maintenance',
    shortLabel: 'Orchestration IA',
    icon: BrainCircuit,
  },
  {
    key: 'sec-academy',
    sectionId: 'academy',
    stepNum: '12',
    label: 'Académie 3S & Livret BPJEPS',
    shortLabel: 'Académie',
    icon: GraduationCap,
  },
  {
    key: 'sec-governance',
    sectionId: 'governance',
    stepNum: 'PIN',
    label: 'Mon Espace : Serveur & Config',
    shortLabel: 'Mon Espace',
    icon: Lock,
  },
];

const ALL_SECTION_TITLES: Record<AdminSection, { title: string; plan: '1er Plan · Opérations Club' | '2e Plan · Direction & Gouvernance' }> = {
  'my-day': { title: 'Ma Journée & Activité Collaborateur', plan: '1er Plan · Opérations Club' },
  'planning-hr': { title: 'L’Espace Planning Centralisé (RH, Mywellness, Heitz) & Paie Silae', plan: '1er Plan · Opérations Club' },
  telephony: { title: 'La Téléphonie & Supervision WebRTC (OVHcloud 04/07)', plan: '1er Plan · Opérations Club' },
  crm: { title: 'Le CRM Acquisition & Relances Adhérents', plan: '1er Plan · Opérations Club' },
  ats: { title: 'Les ATS Recrutement & Signatures Électroniques (0 €)', plan: '1er Plan · Opérations Club' },
  devices: { title: 'Matériel Club : Portillons Heitz, Caisse TPV & Technogym Checkup', plan: '1er Plan · Opérations Club' },
  dashboard: { title: 'Pilotage Bi-Club, Dossier Dirigeants & Associés', plan: '2e Plan · Direction & Gouvernance' },
  'executive-dossier': { title: 'Pilotage Bi-Club, Dossier Dirigeants & Associés', plan: '2e Plan · Direction & Gouvernance' },
  orchestrator: { title: 'Orchestration IA (6 Agents Métier) & Maintenance', plan: '2e Plan · Direction & Gouvernance' },
  academy: { title: 'Académie 3S & Livret BPJEPS', plan: '2e Plan · Direction & Gouvernance' },
  governance: { title: 'Mon Espace Personnel : Matériel Serveur, Config Club & Mises à Jour', plan: '2e Plan · Direction & Gouvernance' },
};

export function AdminShell() {
  const {
    clubFilter,
    setClubFilter,
    currentUser,
    activeSection,
    setActiveSection,
    isArchitectUnlocked,
    lockArchitectSpace,
    setShellMode,
    logoutSession,
    resetDemoData,
    serverPowerStatus,
    activeFailoverNodeId,
    backupReplicas,
    lastBackupChecksum,
    simulateServerPowerOutage,
    exportDeviceBackupJson,
  } = useCfos();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const isSecondarySectionActive = ['dashboard', 'orchestrator', 'academy', 'executive-dossier', 'governance'].includes(
    activeSection
  );
  // Toujours ouvert par défaut pour que le 2e Plan et l'onglet personnel soient immédiatement visibles
  const [secondaryPlanExpanded, setSecondaryPlanExpanded] = useState<boolean>(true);

  const showSecondaryMenu = secondaryPlanExpanded || isSecondarySectionActive;

  const isOutage = serverPowerStatus === 'coupure_courant_bascule_active';
  const activeFailoverDevice =
    backupReplicas.find((r) => r.id === activeFailoverNodeId) ?? backupReplicas[0];

  const filterAllowed = (items: NavEntry[]) =>
    items.filter((item) => {
      if (item.sectionId === 'governance') return true;
      return item.sectionId ? isSectionAllowedForRole(item.sectionId, currentUser.role) : true;
    });

  const visiblePrimaryItems = filterAllowed(PRIMARY_OPERATIONAL_ITEMS);
  const visibleSecondaryItems = filterAllowed(SECONDARY_BACKOFFICE_ITEMS);

  const handleNavClick = (item: NavEntry) => {
    if (item.shellTarget) {
      setShellMode(item.shellTarget);
      return;
    }
    if (item.sectionId === 'governance' && activeSection === 'governance' && isArchitectUnlocked) {
      lockArchitectSpace();
      return;
    }
    if (item.sectionId) {
      setActiveSection(item.sectionId);
    }
  };

  const currentHeaderMeta = ALL_SECTION_TITLES[activeSection];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col lg:flex-row overflow-x-hidden">
      {/* Desktop Left Sidebar */}
      <aside className="hidden lg:flex lg:w-72 lg:flex-col lg:fixed lg:inset-y-0 bg-slate-900 text-white border-r border-slate-800 z-40">
        {/* Brand Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between gap-2">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-orange-600 flex items-center justify-center font-black text-sm tracking-tighter text-white shrink-0">
              CF
            </div>
            <div className="min-w-0">
              <div className="font-bold text-sm leading-tight truncate">C.Fitness OS</div>
              <div className="text-[11px] text-slate-400 truncate">Carré de Soie · Beynost</div>
            </div>
          </div>
        </div>

        {/* Navigation Links Split into 1er Plan (Prioritaire) & 2e Plan (Secondaire) */}
        <nav className="flex-1 p-3 space-y-3 overflow-y-auto">
          {/* 1ER PLAN : OPÉRATIONS CLUB AU QUOTIDIEN */}
          <div className="space-y-1">
            <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-orange-400 flex items-center justify-between">
              <span>1er Plan · Opérations Club</span>
              <span className="text-slate-500 font-mono">Priorité</span>
            </div>

            {visiblePrimaryItems.map((item) => {
              const Icon = item.icon;
              const active = item.sectionId ? activeSection === item.sectionId : false;
              return (
                <button
                  key={item.key}
                  onClick={() => handleNavClick(item)}
                  className={`w-full px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between gap-2 transition-colors cursor-pointer ${
                    active
                      ? 'bg-orange-600 text-white shadow-2xs'
                      : 'text-slate-200 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon
                      className={`w-4 h-4 shrink-0 ${
                        active ? 'text-white' : 'text-orange-400'
                      }`}
                    />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.stepNum && (
                    <span
                      className={`font-mono text-[10px] shrink-0 ${
                        active ? 'text-orange-100' : 'text-slate-500'
                      }`}
                    >
                      {item.stepNum}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* 2E PLAN : PILOTAGE, ORCHESTRATION IA, ACADÉMIE & MON ESPACE (PIN 0766) */}
          <div className="pt-2.5 border-t border-slate-800/90 space-y-1">
            <button
              type="button"
              onClick={() => setSecondaryPlanExpanded((prev) => !prev)}
              className="w-full px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider text-slate-400 hover:text-white hover:bg-slate-800/60 flex items-center justify-between cursor-pointer transition-colors"
            >
              <span>2e Plan · Direction &amp; Mon Espace</span>
              {showSecondaryMenu ? (
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              )}
            </button>

            {showSecondaryMenu && (
              <div className="space-y-1 pt-1">
                {visibleSecondaryItems.map((item) => {
                  const Icon = item.icon;
                  const active = item.sectionId ? activeSection === item.sectionId : false;
                  const isArchitectPinTab = item.sectionId === 'governance';
                  return (
                    <button
                      key={item.key}
                      onClick={() => handleNavClick(item)}
                      className={`w-full px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between gap-2 transition-colors cursor-pointer ${
                        active
                          ? 'bg-orange-600 text-white shadow-2xs'
                          : isArchitectPinTab
                          ? 'bg-orange-500/15 text-orange-300 border border-orange-500/40 hover:bg-orange-500/25 hover:text-white'
                          : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Icon
                          className={`w-4 h-4 shrink-0 ${
                            active
                              ? 'text-white'
                              : isArchitectPinTab
                              ? 'text-orange-400'
                              : 'text-slate-400'
                          }`}
                        />
                        <span className="truncate">{item.label}</span>
                      </div>
                      {item.stepNum && (
                        <span
                          className={`font-mono text-[10px] shrink-0 px-1.5 py-0.5 rounded ${
                            isArchitectPinTab && isArchitectUnlocked
                              ? 'bg-rose-600 text-white font-bold'
                              : active
                              ? 'bg-orange-700 text-white'
                              : isArchitectPinTab
                              ? 'bg-orange-500/30 text-orange-200 font-bold'
                              : 'text-slate-500'
                          }`}
                        >
                          {isArchitectPinTab && isArchitectUnlocked ? 'VERROUILLER' : item.stepNum}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </nav>

        {/* User Footer */}
        <div className="p-3 border-t border-slate-800 space-y-2">
          <button
            onClick={() => setAuthModalOpen(true)}
            className="w-full p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-left text-xs flex items-center justify-between cursor-pointer"
          >
            <div className="truncate pr-2">
              <div className="font-bold text-white truncate">
                {currentUser.firstName} {currentUser.lastName}
              </div>
              <div className="text-[11px] text-orange-400 font-mono">
                Rôle : {currentUser.role}
              </div>
            </div>
            <UserCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          </button>
          <div className="grid grid-cols-2 gap-1.5">
            <button
              onClick={logoutSession}
              className="py-1.5 px-2 rounded-lg bg-slate-800 hover:bg-rose-900/60 text-[11px] text-rose-300 font-semibold flex items-center justify-center gap-1 cursor-pointer"
            >
              <LogOut className="w-3 h-3" />
              Verrouiller
            </button>
            <button
              onClick={resetDemoData}
              className="py-1.5 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-300 flex items-center justify-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              Reset démo
            </button>
          </div>
        </div>
      </aside>

      {/* Main Workspace Container (min-w-0 prevents wide tables from overflowing flex container) */}
      <div className="flex-1 min-w-0 lg:pl-72 flex flex-col min-h-screen">
        {/* Single Top Sticky Header (No duplicate horizontal nav bar) */}
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-slate-200">
          <div className="px-4 sm:px-6 py-2.5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <button
                onClick={() => setMobileMenuOpen(true)}
                aria-label="Ouvrir le menu de navigation"
                className="lg:hidden min-h-[44px] min-w-[44px] rounded-xl border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-100 cursor-pointer shrink-0"
              >
                <Menu className="w-5 h-5" />
              </button>
              <div className="min-w-0">
                <div className="flex items-center gap-2 text-[11px] text-slate-500">
                  <span
                    className={`font-semibold ${
                      isSecondarySectionActive ? 'text-slate-600' : 'text-orange-600'
                    }`}
                  >
                    {currentHeaderMeta.plan}
                  </span>
                </div>
                <div className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                  {currentHeaderMeta.title}
                </div>
              </div>
            </div>

            {/* Right Global Controls: Single Club Filter + Direct PIN Space Button + Mywellness Quick Connect + Profile */}
            <div className="flex items-center gap-2 shrink-0">
              {/* Global Club Scope Selector (Single place for the whole app) */}
              <div className="hidden xl:flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200 text-xs">
                {(
                  [
                    { id: 'all', label: 'Tous les clubs (2)' },
                    { id: 'carre-de-soie', label: 'Carré de Soie' },
                    { id: 'beynost', label: 'Beynost' },
                  ] as const
                ).map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setClubFilter(c.id)}
                    className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-colors cursor-pointer whitespace-nowrap ${
                      clubFilter === c.id
                        ? 'bg-slate-900 text-white shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>

              {activeSection === 'governance' && isArchitectUnlocked ? (
                <button
                  type="button"
                  onClick={() => lockArchitectSpace()}
                  className="min-h-[38px] px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer whitespace-nowrap transition-colors bg-rose-600 hover:bg-rose-700 text-white shadow-2xs"
                >
                  <Lock className="w-3.5 h-3.5 shrink-0" />
                  <span>Verrouiller Mon Espace</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setActiveSection('governance')}
                  className={`min-h-[38px] px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer whitespace-nowrap transition-colors ${
                    activeSection === 'governance'
                      ? 'bg-orange-600 text-white shadow-2xs'
                      : 'bg-orange-50 hover:bg-orange-100 text-orange-800 border border-orange-300'
                  }`}
                >
                  <Lock className="w-3.5 h-3.5 shrink-0" />
                  <span>Mon Espace Config</span>
                </button>
              )}

              <MywellnessQuickConnect variant="header" />

              <button
                onClick={() => setAuthModalOpen(true)}
                className="min-h-[38px] px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-2 cursor-pointer whitespace-nowrap"
              >
                <UserCheck className="w-3.5 h-3.5 text-orange-400" />
                <span className="hidden sm:inline">
                  {currentUser.firstName} {currentUser.lastName}
                </span>
              </button>
            </div>
          </div>
        </header>

        {/* Emergency Power Outage / Server Failure Continuity Banner */}
        {isOutage && (
          <div className="bg-amber-600 text-white px-4 sm:px-6 py-2.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 font-semibold">
              <ZapOff className="w-4 h-4 shrink-0" />
              <span>
                COUPURE SERVEUR PRINCIPAL DÉTECTÉE — Les 2 clubs fonctionnent en autonomie sur{' '}
                <span className="underline font-bold">{activeFailoverDevice.deviceName}</span>{' '}
                (Tourniquets Heitz sur cache local, Badgeuse PIN &amp; CRM sauvegardés sans perte).
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => exportDeviceBackupJson(activeFailoverDevice.id)}
                className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold cursor-pointer whitespace-nowrap"
              >
                Télécharger copie .json
              </button>
              <button
                onClick={() => simulateServerPowerOutage(false)}
                className="px-2.5 py-1 rounded-lg bg-white text-amber-900 font-bold hover:bg-amber-50 cursor-pointer whitespace-nowrap"
              >
                Rétablir Serveur &amp; Resynchroniser
              </button>
            </div>
          </div>
        )}

        {/* Active View Content */}
        <main className="flex-1 p-4 sm:p-6 max-w-7xl w-full mx-auto">
          {activeSection === 'my-day' && <MyDayCollaboratorView />}
          {activeSection === 'planning-hr' && <PlanningHrView />}
          {activeSection === 'telephony' && <TelephonyView />}
          {activeSection === 'crm' && <CrmView />}
          {activeSection === 'ats' && <AtsView />}
          {activeSection === 'devices' && <DevicesHeitzView />}
          {(activeSection === 'dashboard' || activeSection === 'executive-dossier') && (
            <DashboardView />
          )}
          {activeSection === 'orchestrator' && <OrchestratorMaintenanceView />}
          {activeSection === 'academy' && <AcademyView />}
          {activeSection === 'governance' && <GovernanceView />}
        </main>
      </div>

      {/* Mobile & Tablet Off-Canvas Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/60"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative w-72 max-w-[85vw] bg-slate-900 text-white h-full flex flex-col justify-between p-4 z-10 overflow-y-auto">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-orange-600 flex items-center justify-center font-black text-xs">
                    CF
                  </div>
                  <span className="font-bold text-sm">C.Fitness OS</span>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  aria-label="Fermer le menu"
                  className="min-h-[44px] min-w-[44px] flex items-center justify-center text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Club Filter inside Drawer */}
              <div className="space-y-1">
                <div className="text-[10px] font-bold uppercase text-slate-400 px-2">
                  Périmètre Club
                </div>
                <div className="grid grid-cols-3 gap-1">
                  {(
                    [
                      { id: 'all', label: 'Tous' },
                      { id: 'carre-de-soie', label: 'CDS' },
                      { id: 'beynost', label: 'BEY' },
                    ] as const
                  ).map((c) => (
                    <button
                      key={c.id}
                      onClick={() => setClubFilter(c.id)}
                      className={`py-2 rounded-lg text-xs font-bold ${
                        clubFilter === c.id
                          ? 'bg-orange-600 text-white'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 1er Plan Mobile */}
              <div className="space-y-1">
                <div className="text-[10px] font-bold uppercase text-orange-400 px-2">
                  1er Plan · Opérations Club
                </div>
                {visiblePrimaryItems.map((item) => {
                  const Icon = item.icon;
                  const active = item.sectionId ? activeSection === item.sectionId : false;
                  return (
                    <button
                      key={item.key}
                      onClick={() => {
                        handleNavClick(item);
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full min-h-[44px] px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-3 ${
                        active
                          ? 'bg-orange-600 text-white'
                          : 'text-slate-200 hover:bg-slate-800'
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* 2e Plan Mobile */}
              <div className="pt-3 border-t border-slate-800 space-y-1">
                <div className="text-[10px] font-bold uppercase text-slate-400 px-2">
                  2e Plan · Pilotage, IA &amp; Gouvernance
                </div>
                {visibleSecondaryItems.map((item) => {
                  const Icon = item.icon;
                  const active = item.sectionId ? activeSection === item.sectionId : false;
                  return (
                    <button
                      key={item.key}
                      onClick={() => {
                        handleNavClick(item);
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full min-h-[44px] px-3 py-2 rounded-xl text-xs font-medium flex items-center gap-3 ${
                        active
                          ? 'bg-slate-800 text-orange-400 font-semibold'
                          : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {authModalOpen && <AuthSwitchModal onClose={() => setAuthModalOpen(false)} />}
    </div>
  );
}
