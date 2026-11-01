import React, { useState } from 'react';
import { useCfos } from '../context/CfosContext';
import {
  Users,
  Calendar,
  GraduationCap,
  Menu,
  X,
  Smartphone,
  Tablet,
  RotateCcw,
  LogOut,
  ZapOff,
  Sun,
  Moon,
  Headphones,
  ChevronDown,
  ChevronRight,
  Lock,
  Home,
  Building2,
  MapPin,
  TrendingUp,
  Activity,
  Euro,
  Wrench,
  Package,
  Megaphone,
  FileText,
  BarChart3,
  Sparkles,
  Settings,
  Search,
  Bell,
  MessageSquare,
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
import { ThemeColorControl } from './ThemeColorControl';

interface VisualNavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
  sectionId?: AdminSection;
  subTarget?: string;
  shellTarget?: 'employe' | 'telephone' | 'tablette';
  badge?: string;
  hasChevron?: boolean;
}

const VISUAL_SIDEBAR_ITEMS: VisualNavItem[] = [
  {
    id: 'nav-adherents',
    label: 'Adhérents',
    icon: Users,
    iconColor: 'text-amber-500',
    sectionId: 'devices',
    subTarget: 'adherents',
    hasChevron: true,
  },
  {
    id: 'nav-crm',
    label: 'CRM & Ventes',
    icon: TrendingUp,
    iconColor: 'text-emerald-500',
    sectionId: 'crm',
    hasChevron: true,
  },
  {
    id: 'nav-planning',
    label: 'Planning',
    icon: Calendar,
    iconColor: 'text-purple-500',
    sectionId: 'planning-hr',
    subTarget: 'planning',
    hasChevron: true,
  },
  {
    id: 'nav-cours',
    label: 'Cours collectifs',
    icon: Activity,
    iconColor: 'text-rose-500',
    sectionId: 'planning-hr',
    subTarget: 'cours-collectifs',
    hasChevron: true,
  },
  {
    id: 'nav-personnel',
    label: 'Personnel',
    icon: Users,
    iconColor: 'text-blue-500',
    sectionId: 'my-day',
    hasChevron: true,
  },
  {
    id: 'nav-finances',
    label: 'Finances',
    icon: Euro,
    iconColor: 'text-amber-500',
    sectionId: 'devices',
    subTarget: 'finances',
    hasChevron: true,
  },
  {
    id: 'nav-maintenance',
    label: 'Maintenance',
    icon: Wrench,
    iconColor: 'text-sky-500',
    sectionId: 'orchestrator',
    subTarget: 'maintenance',
    hasChevron: true,
  },
  {
    id: 'nav-stock',
    label: 'Stock & Achats',
    icon: Package,
    iconColor: 'text-orange-500',
    sectionId: 'orchestrator',
    subTarget: 'stocks',
    hasChevron: true,
  },
  {
    id: 'nav-marketing',
    label: 'Marketing',
    icon: Megaphone,
    iconColor: 'text-pink-500',
    sectionId: 'telephony',
    hasChevron: true,
  },
  {
    id: 'nav-documents',
    label: 'Documents',
    icon: FileText,
    iconColor: 'text-emerald-500',
    sectionId: 'ats',
    subTarget: 'documents',
    hasChevron: true,
  },
  {
    id: 'nav-rapports',
    label: 'Rapports',
    icon: BarChart3,
    iconColor: 'text-indigo-500',
    sectionId: 'academy',
    subTarget: 'rapports',
    hasChevron: true,
  },
  {
    id: 'nav-agents-ia',
    label: 'Agents IA',
    icon: Sparkles,
    iconColor: 'text-violet-500',
    sectionId: 'orchestrator',
    subTarget: 'agents',
    hasChevron: true,
  },
];

interface NumberedNavItem {
  key: string;
  sectionId?: AdminSection;
  subTarget?: string;
  shellTarget?: 'employe' | 'telephone' | 'tablette';
  badgeText: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const NUMBERED_PLAN_ITEMS: NumberedNavItem[] = [
  {
    key: 'borne-mobile',
    shellTarget: 'employe',
    badgeText: 'APP',
    label: 'App Mobile & Tablette',
    icon: Smartphone,
  },
  {
    key: 'borne-softphone',
    shellTarget: 'telephone',
    badgeText: 'VOIP',
    label: 'Softphone WebRTC',
    icon: Headphones,
  },
  {
    key: 'borne-kiosque',
    shellTarget: 'tablette',
    badgeText: 'PIN',
    label: 'Borne Tablette Kiosque',
    icon: Tablet,
  },
  {
    key: 'module-bpjeps',
    sectionId: 'academy',
    subTarget: 'bpjeps',
    badgeText: '3S',
    label: 'Académie & Livret BPJEPS',
    icon: GraduationCap,
  },
];

export function AdminShell() {
  const {
    clubFilter,
    setClubFilter,
    currentUser,
    activeSection,
    navSubTarget,
    setActiveSection,
    isArchitectUnlocked,
    lockArchitectSpace,
    setShellMode,
    logoutSession,
    resetDemoData,
    serverPowerStatus,
    activeFailoverNodeId,
    backupReplicas,
    simulateServerPowerOutage,
    exportDeviceBackupJson,
    themeMode,
    toggleThemeMode,
    heitzMembers,
    prospects,
  } = useCfos();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [clubsExpanded, setClubsExpanded] = useState(true);
  const [numberedPlanExpanded, setNumberedPlanExpanded] = useState(false);
  const [selectedNavId, setSelectedNavId] = useState<string>('nav-dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [selectedDateLabel, setSelectedDateLabel] = useState('Lundi 14 avril 2025');
  const [notifPopoverOpen, setNotifPopoverOpen] = useState(false);

  React.useEffect(() => {
    if (activeSection === 'dashboard') {
      setSelectedNavId('nav-dashboard');
    } else if (activeSection === 'devices') {
      setSelectedNavId(navSubTarget === 'finances' ? 'nav-finances' : 'nav-adherents');
    } else if (activeSection === 'crm') {
      setSelectedNavId('nav-crm');
    } else if (activeSection === 'planning-hr') {
      setSelectedNavId(navSubTarget === 'cours-collectifs' ? 'nav-cours' : 'nav-planning');
    } else if (activeSection === 'my-day') {
      setSelectedNavId('nav-personnel');
    } else if (activeSection === 'orchestrator') {
      if (navSubTarget === 'stocks') setSelectedNavId('nav-stock');
      else if (navSubTarget === 'maintenance') setSelectedNavId('nav-maintenance');
      else setSelectedNavId('nav-agents-ia');
    } else if (activeSection === 'telephony') {
      setSelectedNavId('nav-marketing');
    } else if (activeSection === 'ats') {
      setSelectedNavId('nav-documents');
    } else if (activeSection === 'academy') {
      setSelectedNavId(navSubTarget === 'bpjeps' ? 'module-bpjeps' : 'nav-rapports');
    } else if (activeSection === 'governance') {
      setSelectedNavId('nav-governance');
    }
  }, [activeSection, navSubTarget]);

  const isDark = themeMode === 'dark';
  const isOutage = serverPowerStatus === 'coupure_courant_bascule_active';
  const activeFailoverDevice =
    backupReplicas.find((r) => r.id === activeFailoverNodeId) ?? backupReplicas[0];

  const handleVisualItemClick = (item: VisualNavItem) => {
    setSelectedNavId(item.id);
    if (item.shellTarget) {
      setShellMode(item.shellTarget);
      return;
    }
    if (item.sectionId) {
      setActiveSection(item.sectionId, item.subTarget);
    }
  };

  const handleNumberedItemClick = (item: NumberedNavItem) => {
    setSelectedNavId(item.key);
    if (item.shellTarget) {
      setShellMode(item.shellTarget);
      return;
    }
    if (item.sectionId) {
      setActiveSection(item.sectionId, item.subTarget);
    }
  };

  const handleGovernanceClick = () => {
    setSelectedNavId('nav-governance');
    if (activeSection === 'governance' && isArchitectUnlocked) {
      lockArchitectSpace();
      return;
    }
    setActiveSection('governance');
  };

  // Search results for global search bar
  const normalizedQuery = searchQuery.trim().toLowerCase();
  const matchingMembers = normalizedQuery
    ? heitzMembers
        .filter((m) =>
          `${m.firstName} ${m.lastName} ${m.badgeCode}`.toLowerCase().includes(normalizedQuery)
        )
        .slice(0, 3)
    : [];
  const matchingProspects = normalizedQuery
    ? prospects
        .filter((p) =>
          `${p.firstName} ${p.lastName} ${p.phone}`.toLowerCase().includes(normalizedQuery)
        )
        .slice(0, 3)
    : [];

  return (
    <div
      className={`min-h-screen flex flex-col lg:flex-row overflow-x-hidden transition-colors duration-200 ${
        isDark ? 'bg-[#0B0E17] text-slate-100' : 'bg-[#F6F7FB] text-slate-900'
      }`}
    >
      {/* =====================================================================
          DESKTOP LEFT SIDEBAR (Matches C.Fitness OS Reference Design)
         ===================================================================== */}
      <aside
        className={`hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 z-40 border-r transition-colors duration-200 ${
          isDark
            ? 'bg-[#111522] border-slate-800/80 text-slate-200'
            : 'bg-white border-slate-200/80 text-slate-700'
        }`}
      >
        {/* Brand Header: C.Fitness OS — Deux clubs, une vision */}
        <div className="px-5 py-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-violet-600 via-purple-600 to-blue-500 flex items-center justify-center shadow-sm shrink-0">
            <span className="font-black text-xl text-white tracking-tighter">C</span>
          </div>
          <div className="min-w-0">
            <div
              className={`font-extrabold text-base leading-tight truncate ${
                isDark ? 'text-white' : 'text-slate-900'
              }`}
            >
              C.Fitness OS
            </div>
            <div className="text-[11px] text-slate-400 truncate">Deux clubs, une vision</div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          {/* Primary Active Item: Tableau de bord */}
          <button
            type="button"
            onClick={() => {
              setSelectedNavId('nav-dashboard');
              setActiveSection('dashboard');
            }}
            className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-3 transition-all cursor-pointer ${
              activeSection === 'dashboard' && selectedNavId === 'nav-dashboard'
                ? isDark
                  ? 'bg-violet-600/25 text-violet-300 border border-violet-500/30 shadow-2xs'
                  : 'bg-violet-50 text-violet-600 shadow-2xs'
                : isDark
                ? 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Home
              className={`w-4 h-4 shrink-0 ${
                activeSection === 'dashboard' ? 'text-violet-500' : 'text-violet-400'
              }`}
            />
            <span>Tableau de bord</span>
          </button>

          {/* Expandable Clubs Group: C.Fitness Center & C.Fitness Place */}
          <div className="pt-1">
            <button
              type="button"
              onClick={() => setClubsExpanded((prev) => !prev)}
              className={`w-full px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                isDark
                  ? 'text-slate-300 hover:bg-slate-800/60'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <Building2 className="w-4 h-4 text-blue-500 shrink-0" />
                <span>Clubs</span>
              </div>
              <ChevronDown
                className={`w-3.5 h-3.5 text-slate-400 transition-transform ${
                  clubsExpanded ? '' : '-rotate-90'
                }`}
              />
            </button>

            {clubsExpanded && (
              <div className="mt-1 ml-4 pl-3 border-l border-slate-200 dark:border-slate-800 space-y-1">
                <button
                  type="button"
                  onClick={() => {
                    setClubFilter(clubFilter === 'carre-de-soie' ? 'all' : 'carre-de-soie');
                    setActiveSection('dashboard');
                  }}
                  className={`w-full px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between transition-colors cursor-pointer ${
                    clubFilter === 'carre-de-soie'
                      ? isDark
                        ? 'bg-violet-500/20 text-violet-300 font-semibold'
                        : 'bg-violet-50 text-violet-700 font-semibold'
                      : isDark
                      ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                      : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <MapPin className="w-3.5 h-3.5 text-violet-400 shrink-0" />
                    <span className="truncate">C.Fitness Center</span>
                  </div>
                  <span className="text-[10px] opacity-70">CDS</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setClubFilter(clubFilter === 'beynost' ? 'all' : 'beynost');
                    setActiveSection('dashboard');
                  }}
                  className={`w-full px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between transition-colors cursor-pointer ${
                    clubFilter === 'beynost'
                      ? isDark
                        ? 'bg-blue-500/20 text-blue-300 font-semibold'
                        : 'bg-blue-50 text-blue-700 font-semibold'
                      : isDark
                      ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                      : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    <span className="truncate">C.Fitness Place</span>
                  </div>
                  <span className="text-[10px] opacity-70">BEY</span>
                </button>

                {clubFilter !== 'all' && (
                  <button
                    type="button"
                    onClick={() => setClubFilter('all')}
                    className="w-full px-2.5 py-1 text-[11px] text-violet-500 hover:underline text-left cursor-pointer"
                  >
                    Afficher les 2 clubs
                  </button>
                )}
              </div>
            )}
          </div>

          {/* All Visual Navigation Items from Reference Mockup */}
          <div className="space-y-0.5 pt-1">
            {VISUAL_SIDEBAR_ITEMS.filter((item) =>
              item.sectionId ? isSectionAllowedForRole(item.sectionId, currentUser.role) : true
            ).map((item) => {
              const Icon = item.icon;
              const isSelected =
                selectedNavId === item.id &&
                (item.sectionId ? activeSection === item.sectionId : false);
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleVisualItemClick(item)}
                  className={`w-full px-3.5 py-2 rounded-xl text-xs font-medium flex items-center justify-between transition-colors cursor-pointer ${
                    isSelected
                      ? isDark
                        ? 'bg-violet-600/25 text-violet-300 font-semibold'
                        : 'bg-violet-50 text-violet-600 font-semibold'
                      : isDark
                      ? 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Icon className={`w-4 h-4 shrink-0 ${item.iconColor}`} />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.hasChevron && (
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400/70 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Non-redundant Terminals & Kiosks Accordion */}
          <div
            className={`pt-2 mt-2 border-t ${
              isDark ? 'border-slate-800/80' : 'border-slate-200/80'
            }`}
          >
            <button
              type="button"
              onClick={() => setNumberedPlanExpanded((prev) => !prev)}
              className={`w-full px-3.5 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider flex items-center justify-between cursor-pointer ${
                isDark
                  ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
              }`}
            >
              <span>Bornes &amp; Terminaux ({NUMBERED_PLAN_ITEMS.length})</span>
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform ${
                  numberedPlanExpanded ? '' : '-rotate-90'
                }`}
              />
            </button>

            {numberedPlanExpanded && (
              <div className="mt-1 space-y-0.5">
                {NUMBERED_PLAN_ITEMS.map((item) => {
                  const Icon = item.icon;
                  const active =
                    selectedNavId === item.key &&
                    (item.sectionId ? activeSection === item.sectionId : false);
                  return (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => handleNumberedItemClick(item)}
                      className={`w-full px-3 py-1.5 rounded-lg text-[11px] font-medium flex items-center justify-between gap-2 cursor-pointer ${
                        active
                          ? isDark
                            ? 'bg-violet-500/20 text-violet-300 font-semibold'
                            : 'bg-violet-50 text-violet-700 font-semibold'
                          : isDark
                          ? 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <Icon className="w-3.5 h-3.5 text-violet-500 shrink-0" />
                        <span className="truncate">{item.label}</span>
                      </div>
                      <span className="font-mono text-[10px] opacity-60">{item.badgeText}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </nav>

        {/* Bottom Settings / Mon Espace (PIN 0766) & Session Controls */}
        <div
          className={`p-3 border-t space-y-2 ${
            isDark ? 'border-slate-800/80' : 'border-slate-200/80'
          }`}
        >
          <button
            type="button"
            onClick={handleGovernanceClick}
            className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
              activeSection === 'governance'
                ? 'bg-violet-600 text-white shadow-2xs'
                : isDark
                ? 'text-slate-300 hover:bg-slate-800 hover:text-white'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <Settings className="w-4 h-4 shrink-0 text-slate-400" />
              <span className="truncate">Paramètres · Mon Espace</span>
            </div>
            <span
              className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                isArchitectUnlocked
                  ? 'bg-rose-600 text-white font-bold'
                  : isDark
                  ? 'bg-slate-800 text-slate-400'
                  : 'bg-slate-100 text-slate-500'
              }`}
            >
              {isArchitectUnlocked ? 'VERROUILLER' : 'PIN'}
            </span>
          </button>

          <div className="grid grid-cols-2 gap-1.5">
            <button
              type="button"
              onClick={logoutSession}
              className={`py-1.5 px-2 rounded-lg text-[11px] font-semibold flex items-center justify-center gap-1 cursor-pointer ${
                isDark
                  ? 'bg-slate-800/80 hover:bg-rose-950/60 text-rose-300'
                  : 'bg-slate-100 hover:bg-rose-50 text-rose-600'
              }`}
            >
              <LogOut className="w-3 h-3" />
              <span>Quitter</span>
            </button>
            <button
              type="button"
              onClick={resetDemoData}
              className={`py-1.5 px-2 rounded-lg text-[11px] flex items-center justify-center gap-1 cursor-pointer ${
                isDark
                  ? 'bg-slate-800/80 hover:bg-slate-800 text-slate-300'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset démo</span>
            </button>
          </div>
        </div>
      </aside>

      {/* =====================================================================
          MAIN WORKSPACE CONTAINER
         ===================================================================== */}
      <div className="flex-1 min-w-0 lg:pl-64 flex flex-col min-h-screen">
        {/* Top Sticky Header (Matches C.Fitness OS Reference Mockup) */}
        <header
          className={`sticky top-0 z-30 border-b backdrop-blur transition-colors duration-200 ${
            isDark
              ? 'bg-[#111522]/95 border-slate-800/80'
              : 'bg-white/95 border-slate-200/80'
          }`}
        >
          <div className="px-4 sm:px-6 py-2.5 flex items-center justify-between gap-3">
            {/* Left: Mobile Menu Button + Wide Global Search Bar */}
            <div className="flex items-center gap-3 flex-1 max-w-md xl:max-w-lg">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                aria-label="Ouvrir le menu de navigation"
                className={`lg:hidden min-h-[40px] min-w-[40px] rounded-xl border flex items-center justify-center cursor-pointer shrink-0 ${
                  isDark
                    ? 'border-slate-700 text-slate-200 hover:bg-slate-800'
                    : 'border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <Menu className="w-5 h-5" />
              </button>

              {/* Global Search Input */}
              <div className="relative flex-1 min-w-[220px]">
                <div
                  className={`flex items-center gap-2.5 px-3.5 py-2 rounded-xl border text-xs transition-colors ${
                    isDark
                      ? 'bg-[#1A2033] border-slate-700/80 text-slate-200 focus-within:border-violet-500'
                      : 'bg-slate-100/80 border-slate-200/80 text-slate-700 focus-within:border-violet-500 focus-within:bg-white'
                  }`}
                >
                  <Search className="w-4 h-4 text-slate-400 shrink-0" />
                  <input
                    type="text"
                    value={searchQuery}
                    onFocus={() => setSearchFocused(true)}
                    onBlur={() => setTimeout(() => setSearchFocused(false), 180)}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Rechercher un adhérent, un cours, un document..."
                    className="w-full bg-transparent outline-hidden text-xs placeholder:text-slate-400"
                  />
                  <span
                    className={`hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono shrink-0 ${
                      isDark
                        ? 'bg-slate-800 text-slate-400 border border-slate-700'
                        : 'bg-white text-slate-400 border border-slate-200'
                    }`}
                  >
                    ⌘ K
                  </span>
                </div>

                {/* Instant Search Results Dropdown */}
                {searchFocused && normalizedQuery.length > 0 && (
                  <div
                    className={`absolute left-0 right-0 mt-1.5 rounded-2xl border shadow-xl p-3 z-50 space-y-2 text-xs ${
                      isDark
                        ? 'bg-[#161B2B] border-slate-700 text-slate-200'
                        : 'bg-white border-slate-200 text-slate-800'
                    }`}
                  >
                    <div className="text-[10px] font-bold uppercase text-slate-400">
                      Résultats de recherche rapide
                    </div>
                    {matchingMembers.length === 0 && matchingProspects.length === 0 ? (
                      <div className="text-slate-400 py-2">
                        Aucun adhérent ou prospect trouvé pour « {searchQuery} ».
                      </div>
                    ) : (
                      <>
                        {matchingMembers.map((m) => (
                          <button
                            key={m.id}
                            type="button"
                            onClick={() => {
                              setActiveSection('devices');
                              setSearchQuery('');
                            }}
                            className={`w-full p-2 rounded-xl flex items-center justify-between text-left cursor-pointer ${
                              isDark ? 'hover:bg-slate-800' : 'hover:bg-slate-100'
                            }`}
                          >
                            <div>
                              <span className="font-bold">
                                {m.firstName} {m.lastName}
                              </span>{' '}
                              <span className="text-slate-400">· Adhérent #{m.badgeCode}</span>
                            </div>
                            <span className="text-violet-500 font-semibold">Ouvrir Heitz →</span>
                          </button>
                        ))}
                        {matchingProspects.map((p) => (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => {
                              setActiveSection('crm');
                              setSearchQuery('');
                            }}
                            className={`w-full p-2 rounded-xl flex items-center justify-between text-left cursor-pointer ${
                              isDark ? 'hover:bg-slate-800' : 'hover:bg-slate-100'
                            }`}
                          >
                            <div>
                              <span className="font-bold">
                                {p.firstName} {p.lastName}
                              </span>{' '}
                              <span className="text-slate-400">· Prospect ({p.stage})</span>
                            </div>
                            <span className="text-emerald-500 font-semibold">Ouvrir CRM →</span>
                          </button>
                        ))}
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Right Controls: Date Selector, Light/Dark Toggle, Mobile App Preview, Bell, Chat, User Profile */}
            <div className="flex items-center gap-2.5 shrink-0">
              {/* Date Picker Selector (Lundi 14 avril 2025) */}
              <div className="hidden xl:flex items-center">
                <div
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-medium ${
                    isDark
                      ? 'bg-[#1A2033] border-slate-700/80 text-slate-200'
                      : 'bg-slate-50 border-slate-200 text-slate-700'
                  }`}
                >
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <select
                    aria-label="Sélectionner la date"
                    value={selectedDateLabel}
                    onChange={(e) => setSelectedDateLabel(e.target.value)}
                    className="bg-transparent outline-hidden cursor-pointer text-xs font-medium"
                  >
                    <option value="Lundi 14 avril 2025" className="text-slate-900">
                      Lundi 14 avril 2025
                    </option>
                    <option value="Mardi 15 avril 2025" className="text-slate-900">
                      Mardi 15 avril 2025
                    </option>
                    <option value="Aujourd'hui · Temps réel" className="text-slate-900">
                      Aujourd&apos;hui · Temps réel
                    </option>
                  </select>
                </div>
              </div>

              {/* Night Mode & Display Color Switcher (PC, Tablette & Téléphone) */}
              <ThemeColorControl variant="full" />

              {/* Quick Mobile / Tablet App Preview Button (Image 2) */}
              <button
                type="button"
                onClick={() => setShellMode('employe')}
                title="Ouvrir la vue Mobile & Tablette (Accueil & Planning)"
                className={`hidden sm:flex min-h-[38px] px-3 py-1.5 rounded-xl border text-xs font-semibold items-center gap-1.5 cursor-pointer transition-colors ${
                  isDark
                    ? 'bg-[#1A2033] border-slate-700 text-slate-200 hover:bg-slate-800'
                    : 'bg-violet-50 border-violet-200 text-violet-700 hover:bg-violet-100'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5 text-violet-500" />
                <span className="hidden lg:inline">Vue Mobile &amp; Tablette</span>
              </button>

              {/* Notifications Bell with Badge 3 */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setNotifPopoverOpen((prev) => !prev)}
                  aria-label="Notifications (3)"
                  className={`relative w-9 h-9 rounded-xl border flex items-center justify-center cursor-pointer transition-colors ${
                    isDark
                      ? 'bg-[#1A2033] border-slate-700 text-slate-300 hover:bg-slate-800'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Bell className="w-4 h-4" />
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
                    3
                  </span>
                </button>

                {notifPopoverOpen && (
                  <div
                    className={`absolute right-0 mt-2 w-80 rounded-2xl border shadow-xl p-3.5 z-50 space-y-2.5 text-xs ${
                      isDark
                        ? 'bg-[#161B2B] border-slate-700 text-slate-200'
                        : 'bg-white border-slate-200 text-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between font-bold">
                      <span>Actions importantes (3)</span>
                      <button
                        type="button"
                        onClick={() => setNotifPopoverOpen(false)}
                        className="text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        Fermer
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveSection('devices', 'finances');
                        setNotifPopoverOpen(false);
                      }}
                      className={`w-full p-2.5 rounded-xl text-left flex items-center justify-between cursor-pointer ${
                        isDark ? 'bg-rose-950/40 hover:bg-rose-950/60' : 'bg-rose-50 hover:bg-rose-100'
                      }`}
                    >
                      <div>
                        <div className="font-bold text-rose-500">5 impayés à relancer</div>
                        <div className="text-[11px] opacity-80">Représentent 1 250 €</div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-rose-400" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveSection('ats', 'documents');
                        setNotifPopoverOpen(false);
                      }}
                      className={`w-full p-2.5 rounded-xl text-left flex items-center justify-between cursor-pointer ${
                        isDark
                          ? 'bg-amber-950/40 hover:bg-amber-950/60'
                          : 'bg-amber-50 hover:bg-amber-100'
                      }`}
                    >
                      <div>
                        <div className="font-bold text-amber-500">2 contrats en attente</div>
                        <div className="text-[11px] opacity-80">À valider cette semaine</div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-amber-400" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveSection('orchestrator', 'maintenance');
                        setNotifPopoverOpen(false);
                      }}
                      className={`w-full p-2.5 rounded-xl text-left flex items-center justify-between cursor-pointer ${
                        isDark
                          ? 'bg-emerald-950/40 hover:bg-emerald-950/60'
                          : 'bg-emerald-50 hover:bg-emerald-100'
                      }`}
                    >
                      <div>
                        <div className="font-bold text-emerald-500">Maintenance prévue</div>
                        <div className="text-[11px] opacity-80">CTA Beynost – 15 avril</div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-emerald-400" />
                    </button>
                  </div>
                )}
              </div>

              {/* Chat / Softphone WebRTC Button */}
              <button
                type="button"
                onClick={() => setShellMode('telephone')}
                title="Ouvrir le Softphone WebRTC & Messagerie SMS 07"
                aria-label="Ouvrir la messagerie et le softphone"
                className={`w-9 h-9 rounded-xl border flex items-center justify-center cursor-pointer transition-colors ${
                  isDark
                    ? 'bg-[#1A2033] border-slate-700 text-slate-300 hover:bg-slate-800'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <MessageSquare className="w-4 h-4" />
              </button>

              <MywellnessQuickConnect variant="header" />

              {/* Lock button when Architect Space is unlocked */}
              {activeSection === 'governance' && isArchitectUnlocked && (
                <button
                  type="button"
                  onClick={() => lockArchitectSpace()}
                  className="min-h-[38px] px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer whitespace-nowrap transition-colors bg-rose-600 hover:bg-rose-700 text-white shadow-2xs"
                >
                  <Lock className="w-3.5 h-3.5 shrink-0" />
                  <span>Verrouiller Mon Espace</span>
                </button>
              )}

              {/* User Profile Pill (Thomas CLAUDE / Active User) */}
              <button
                type="button"
                onClick={() => setAuthModalOpen(true)}
                className={`pl-2 pr-3 py-1.5 rounded-xl border flex items-center gap-2.5 cursor-pointer transition-colors ${
                  isDark
                    ? 'bg-[#1A2033] border-slate-700 hover:bg-slate-800 text-white'
                    : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-900'
                }`}
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-violet-600 to-indigo-500 text-white font-bold text-xs flex items-center justify-center shrink-0">
                  {currentUser.id === 'emp-mario'
                    ? 'TC'
                    : `${currentUser.firstName[0]}${currentUser.lastName[0]}`}
                </div>
                <div className="hidden sm:block text-left leading-tight">
                  <div className="text-xs font-bold">
                    {currentUser.id === 'emp-mario'
                      ? 'Thomas CLAUDE'
                      : `${currentUser.firstName} ${currentUser.lastName}`}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {currentUser.id === 'emp-mario' ? 'Directeur Général' : currentUser.jobTitle}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
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
        <main className="flex-1 p-4 sm:p-6 max-w-[1440px] w-full mx-auto">
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
          <div
            className={`relative w-72 max-w-[85vw] h-full flex flex-col justify-between p-4 z-10 overflow-y-auto ${
              isDark ? 'bg-[#111522] text-white' : 'bg-white text-slate-900'
            }`}
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-violet-600 to-blue-500 flex items-center justify-center font-black text-sm text-white">
                    C
                  </div>
                  <div>
                    <div className="font-bold text-sm">C.Fitness OS</div>
                    <div className="text-[10px] text-slate-400">Deux clubs, une vision</div>
                  </div>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  aria-label="Fermer le menu"
                  className="min-h-[40px] min-w-[40px] flex items-center justify-center text-slate-400"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Theme & Display Color Control inside Mobile/Tablet Drawer */}
              <ThemeColorControl variant="inline" />

              {/* Clubs Filter inside Mobile/Tablet Drawer */}
              <div className="grid grid-cols-3 gap-1.5 text-[11px] font-bold">
                <button
                  type="button"
                  onClick={() => {
                    setClubFilter('all');
                    setMobileMenuOpen(false);
                  }}
                  className={`py-1.5 px-2 rounded-lg border cursor-pointer ${
                    clubFilter === 'all'
                      ? 'bg-violet-600 text-white border-violet-600'
                      : isDark
                      ? 'bg-slate-900 border-slate-800 text-slate-300'
                      : 'bg-slate-100 border-slate-200 text-slate-700'
                  }`}
                >
                  2 Clubs
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setClubFilter('carre-de-soie');
                    setMobileMenuOpen(false);
                  }}
                  className={`py-1.5 px-2 rounded-lg border cursor-pointer ${
                    clubFilter === 'carre-de-soie'
                      ? 'bg-violet-600 text-white border-violet-600'
                      : isDark
                      ? 'bg-slate-900 border-slate-800 text-slate-300'
                      : 'bg-slate-100 border-slate-200 text-slate-700'
                  }`}
                >
                  Center
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setClubFilter('beynost');
                    setMobileMenuOpen(false);
                  }}
                  className={`py-1.5 px-2 rounded-lg border cursor-pointer ${
                    clubFilter === 'beynost'
                      ? 'bg-violet-600 text-white border-violet-600'
                      : isDark
                      ? 'bg-slate-900 border-slate-800 text-slate-300'
                      : 'bg-slate-100 border-slate-200 text-slate-700'
                  }`}
                >
                  Place
                </button>
              </div>

              <button
                type="button"
                onClick={() => {
                  setSelectedNavId('nav-dashboard');
                  setActiveSection('dashboard');
                  setMobileMenuOpen(false);
                }}
                className="w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-3 bg-violet-600 text-white cursor-pointer"
              >
                <Home className="w-4 h-4" />
                <span>Tableau de bord</span>
              </button>

              <div className="space-y-1">
                {VISUAL_SIDEBAR_ITEMS.filter((item) =>
                  item.sectionId ? isSectionAllowedForRole(item.sectionId, currentUser.role) : true
                ).map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        handleVisualItemClick(item);
                        setMobileMenuOpen(false);
                      }}
                      className="w-full px-3 py-2 rounded-xl text-xs font-medium flex items-center gap-3 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                    >
                      <Icon className={`w-4 h-4 shrink-0 ${item.iconColor}`} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Bornes & Terminaux in Mobile/Tablet Drawer */}
              <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-1">
                <div className="px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Bornes &amp; Terminaux ({NUMBERED_PLAN_ITEMS.length})
                </div>
                {NUMBERED_PLAN_ITEMS.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => {
                        handleNumberedItemClick(item);
                        setMobileMenuOpen(false);
                      }}
                      className="w-full px-3 py-2 rounded-xl text-xs font-medium flex items-center justify-between hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                    >
                      <span className="flex items-center gap-2.5 truncate">
                        <Icon className="w-4 h-4 text-violet-500 shrink-0" />
                        <span className="truncate">{item.label}</span>
                      </span>
                      <span className="text-[10px] font-mono opacity-60">{item.badgeText}</span>
                    </button>
                  );
                })}
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2">
                <button
                  type="button"
                  onClick={() => {
                    handleGovernanceClick();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between bg-slate-100 dark:bg-slate-800 cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <Settings className="w-4 h-4 text-violet-500" />
                    Paramètres · Mon Espace
                  </span>
                  <span className="text-[10px] font-mono">PIN</span>
                </button>

                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      logoutSession();
                    }}
                    className="py-2 px-2 rounded-lg text-[11px] font-semibold flex items-center justify-center gap-1 bg-rose-500/15 text-rose-500 cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Quitter</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      resetDemoData();
                    }}
                    className="py-2 px-2 rounded-lg text-[11px] font-semibold flex items-center justify-center gap-1 bg-slate-100 dark:bg-slate-800 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset démo</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {authModalOpen && <AuthSwitchModal onClose={() => setAuthModalOpen(false)} />}
    </div>
  );
}
