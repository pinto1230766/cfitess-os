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
} from 'lucide-react';
import { AdminSection } from '../types/cfos';
import { DashboardView } from './views/DashboardView';
import { TelephonyView } from './views/TelephonyView';
import { CrmView } from './views/CrmView';
import { PlanningHrView } from './views/PlanningHrView';
import { AcademyView } from './views/AcademyView';
import { AtsView } from './views/AtsView';
import { DevicesHeitzView } from './views/DevicesHeitzView';
import { GovernanceView } from './views/GovernanceView';
import { AuthSwitchModal } from './AuthSwitchModal';

const NAV_ITEMS: {
  id: AdminSection;
  label: string;
  shortLabel: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { id: 'dashboard', label: 'Pilotage Bi-Club & ROI', shortLabel: 'Pilotage', icon: LayoutDashboard },
  { id: 'telephony', label: 'Téléphonie 12 Lignes & IA', shortLabel: 'Téléphonie', icon: PhoneCall },
  { id: 'crm', label: 'CRM Prospects & Essais', shortLabel: 'Prospects', icon: Users },
  { id: 'planning-hr', label: 'Planning RH & IDCC 2511', shortLabel: 'Planning RH', icon: Calendar },
  { id: 'academy', label: 'Académie & BPJEPS', shortLabel: 'Académie', icon: GraduationCap },
  { id: 'ats', label: 'Recrutement ATS 1-Clic', shortLabel: 'Recrutement', icon: Briefcase },
  { id: 'devices', label: 'Heitz, SEPA & InBody', shortLabel: 'Heitz/Accès', icon: QrCode },
  { id: 'governance', label: 'Gouvernance & Audit', shortLabel: 'Gouvernance', icon: ShieldCheck },
];

export function AdminShell() {
  const {
    clubFilter,
    setClubFilter,
    currentUser,
    activeSection,
    setActiveSection,
    setShellMode,
    resetDemoData,
  } = useCfos();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col lg:flex-row">
      {/* Desktop Left Sidebar */}
      <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 bg-slate-900 text-white border-r border-slate-800">
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-800 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-orange-600 flex items-center justify-center font-black text-sm tracking-tighter text-white shrink-0">
            CF
          </div>
          <div>
            <div className="font-bold text-sm leading-tight">C.Fitness OS</div>
            <div className="text-[11px] text-slate-400">Carré de Soie · Beynost</div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Modules Opérationnels
          </div>
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`w-full px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-3 transition-colors cursor-pointer ${
                  active
                    ? 'bg-orange-600 text-white'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}

          {/* Field Shells Switcher (§7.3) */}
          <div className="pt-4 mt-4 border-t border-slate-800">
            <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Interfaces Terrain (§7.3)
            </div>
            <button
              onClick={() => setShellMode('employe')}
              className="w-full px-3 py-2 rounded-xl text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white flex items-center gap-2.5 cursor-pointer"
            >
              <Smartphone className="w-4 h-4 text-orange-400 shrink-0" />
              <span>2. App Mobile Employé</span>
            </button>
            <button
              onClick={() => setShellMode('tablette')}
              className="w-full px-3 py-2 rounded-xl text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white flex items-center gap-2.5 cursor-pointer"
            >
              <Tablet className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>3. Tablette Kiosque PIN</span>
            </button>
            <button
              onClick={() => setShellMode('telephone')}
              className="w-full px-3 py-2 rounded-xl text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white flex items-center gap-2.5 cursor-pointer"
            >
              <PhoneCall className="w-4 h-4 text-blue-400 shrink-0" />
              <span>4. Téléphone Virtuel 04/07</span>
            </button>
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
              <div className="text-[11px] text-orange-400 uppercase font-mono">
                Rôle : {currentUser.role}
              </div>
            </div>
            <UserCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          </button>
          <button
            onClick={resetDemoData}
            className="w-full py-1.5 text-[11px] text-slate-400 hover:text-slate-200 flex items-center justify-center gap-1 cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            Réinitialiser les données démo
          </button>
        </div>
      </aside>

      {/* Main Workspace Container */}
      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen">
        {/* Top Sticky Header */}
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-slate-200 px-4 sm:px-6 py-2.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Ouvrir le menu de navigation"
              className="lg:hidden min-h-[44px] min-w-[44px] rounded-xl border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-100 cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <div className="text-xs sm:text-sm font-bold text-slate-900">
                {NAV_ITEMS.find((n) => n.id === activeSection)?.label}
              </div>
              <div className="text-[11px] text-slate-500 hidden sm:block">
                Périmètre actif :{' '}
                {clubFilter === 'all'
                  ? 'Consolidé 2 Clubs (Carré de Soie + Beynost)'
                  : clubFilter === 'carre-de-soie'
                  ? 'C.Fitness Carré de Soie (Vaulx-en-Velin)'
                  : 'C.Fitness Beynost (ZAC des Baterses)'}
              </div>
            </div>
          </div>

          {/* Right Quick Actions: Shell Switchers & Role Modal */}
          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
              <button
                onClick={() => setShellMode('employe')}
                className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:bg-white cursor-pointer"
              >
                PWA Employé
              </button>
              <button
                onClick={() => setShellMode('tablette')}
                className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:bg-white cursor-pointer"
              >
                Tablette Kiosque
              </button>
              <button
                onClick={() => setShellMode('telephone')}
                className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:bg-white cursor-pointer"
              >
                Téléphone 04/07
              </button>
            </div>

            <button
              onClick={() => setAuthModalOpen(true)}
              className="min-h-[44px] px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-2 cursor-pointer"
            >
              <UserCheck className="w-3.5 h-3.5 text-orange-400" />
              <span className="hidden sm:inline">
                {currentUser.firstName} {currentUser.lastName}
              </span>
              <span className="font-mono text-[11px] text-orange-300">
                ({currentUser.role})
              </span>
            </button>
          </div>
        </header>

        {/* Active View Content */}
        <main className="flex-1 p-4 sm:p-6 max-w-7xl w-full mx-auto">
          {activeSection === 'dashboard' && <DashboardView />}
          {activeSection === 'telephony' && <TelephonyView />}
          {activeSection === 'crm' && <CrmView />}
          {activeSection === 'planning-hr' && <PlanningHrView />}
          {activeSection === 'academy' && <AcademyView />}
          {activeSection === 'ats' && <AtsView />}
          {activeSection === 'devices' && <DevicesHeitzView />}
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

              <div className="space-y-1">
                <div className="text-[10px] font-bold uppercase text-slate-400 px-2">
                  Modules Direction &amp; Managers
                </div>
                {NAV_ITEMS.map((item) => {
                  const Icon = item.icon;
                  const active = activeSection === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveSection(item.id);
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full min-h-[44px] px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-3 ${
                        active
                          ? 'bg-orange-600 text-white'
                          : 'text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>

              <div className="pt-3 border-t border-slate-800 space-y-1">
                <div className="text-[10px] font-bold uppercase text-slate-400 px-2">
                  Basculer d&apos;Interface Terrain (§7.3)
                </div>
                <button
                  onClick={() => {
                    setShellMode('employe');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full min-h-[44px] px-3 py-2 rounded-xl text-xs font-semibold text-slate-200 hover:bg-slate-800 flex items-center gap-2.5"
                >
                  <Smartphone className="w-4 h-4 text-orange-400" />
                  <span>App Mobile Employé / Apprenti</span>
                </button>
                <button
                  onClick={() => {
                    setShellMode('tablette');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full min-h-[44px] px-3 py-2 rounded-xl text-xs font-semibold text-slate-200 hover:bg-slate-800 flex items-center gap-2.5"
                >
                  <Tablet className="w-4 h-4 text-emerald-400" />
                  <span>Tablette Kiosque Badgeuse PIN</span>
                </button>
                <button
                  onClick={() => {
                    setShellMode('telephone');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full min-h-[44px] px-3 py-2 rounded-xl text-xs font-semibold text-slate-200 hover:bg-slate-800 flex items-center gap-2.5"
                >
                  <PhoneCall className="w-4 h-4 text-blue-400" />
                  <span>Téléphone Virtuel WebRTC 04/07</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {authModalOpen && <AuthSwitchModal onClose={() => setAuthModalOpen(false)} />}
    </div>
  );
}
