import React, { useState } from 'react';
import { useCfos } from '../../context/CfosContext';
import {
  Calendar,
  FileText,
  GraduationCap,
  CheckSquare,
  ArrowLeft,
  CheckCircle2,
  Plus,
  FileSignature,
  LayoutDashboard,
  Smartphone,
  Tablet,
  Maximize2,
  Home,
  Users,
  MoreHorizontal,
  Bell,
  Search,
  SlidersHorizontal,
  Euro,
  BarChart3,
  Star,
  Activity,
  Building2,
  TrendingUp,
  Wrench,
  Package,
  Megaphone,
  Sparkles,
  Settings,
  Clock,
  DoorOpen,
  CreditCard,
  PhoneCall,
  UserPlus,
  ShoppingBag,
} from 'lucide-react';
import { formatLeaveStatus } from '../../domain/rules';
import { AdminSection, ClubId, LeaveRequest, PointageType } from '../../types/cfos';
import { EmployeeDashboardGrid } from '../views/EmployeeDashboardGrid';
import { ThemeColorControl } from '../ThemeColorControl';
import { DashboardView } from '../views/DashboardView';
import { DevicesHeitzView } from '../views/DevicesHeitzView';
import { CrmView } from '../views/CrmView';
import { PlanningHrView } from '../views/PlanningHrView';
import { MyDayCollaboratorView } from '../views/MyDayCollaboratorView';
import { OrchestratorMaintenanceView } from '../views/OrchestratorMaintenanceView';
import { TelephonyView } from '../views/TelephonyView';
import { AtsView } from '../views/AtsView';
import { AcademyView } from '../views/AcademyView';
import { GovernanceView } from '../views/GovernanceView';

interface MobileCourseSlot {
  id: string;
  time: string;
  title: string;
  room: string;
  enrolled: number;
  capacity: number;
  colorLight: string;
  colorDark: string;
  borderAccent: string;
  coachName: string;
}

const INITIAL_MOBILE_COURSES: MobileCourseSlot[] = [
  {
    id: 'mc-1',
    time: '09:00',
    title: 'BodyBalance',
    room: 'Salle 1',
    enrolled: 28,
    capacity: 30,
    colorLight: 'bg-emerald-50 text-emerald-950',
    colorDark: 'bg-emerald-950/50 text-emerald-100',
    borderAccent: 'border-l-4 border-l-emerald-500',
    coachName: 'Sarah M.',
  },
  {
    id: 'mc-2',
    time: '10:00',
    title: 'RPM',
    room: 'Salle 2',
    enrolled: 24,
    capacity: 30,
    colorLight: 'bg-sky-50 text-sky-950',
    colorDark: 'bg-sky-950/50 text-sky-100',
    borderAccent: 'border-l-4 border-l-sky-500',
    coachName: 'Karim B.',
  },
  {
    id: 'mc-3',
    time: '11:00',
    title: 'CAF',
    room: 'Salle 1',
    enrolled: 18,
    capacity: 25,
    colorLight: 'bg-amber-50 text-amber-950',
    colorDark: 'bg-amber-950/50 text-amber-100',
    borderAccent: 'border-l-4 border-l-amber-500',
    coachName: 'Sarah M.',
  },
  {
    id: 'mc-4',
    time: '12:30',
    title: 'Yoga',
    room: 'Salle 2',
    enrolled: 20,
    capacity: 25,
    colorLight: 'bg-purple-50 text-purple-950',
    colorDark: 'bg-purple-950/50 text-purple-100',
    borderAccent: 'border-l-4 border-l-purple-500',
    coachName: 'Léa T.',
  },
  {
    id: 'mc-5',
    time: '17:00',
    title: 'GRIT',
    room: 'Salle 1',
    enrolled: 16,
    capacity: 20,
    colorLight: 'bg-pink-50 text-pink-950',
    colorDark: 'bg-pink-950/50 text-pink-100',
    borderAccent: 'border-l-4 border-l-pink-500',
    coachName: 'Karim B.',
  },
  {
    id: 'mc-6',
    time: '18:00',
    title: 'BodyPump',
    room: 'Salle 1',
    enrolled: 28,
    capacity: 30,
    colorLight: 'bg-rose-50 text-rose-950',
    colorDark: 'bg-rose-950/50 text-rose-100',
    borderAccent: 'border-l-4 border-l-rose-500',
    coachName: 'Sarah M.',
  },
  {
    id: 'mc-7',
    time: '19:00',
    title: 'Cycling',
    room: 'Salle 2',
    enrolled: 22,
    capacity: 30,
    colorLight: 'bg-indigo-50 text-indigo-950',
    colorDark: 'bg-indigo-950/50 text-indigo-100',
    borderAccent: 'border-l-4 border-l-indigo-500',
    coachName: 'Karim B.',
  },
];

type PhoneScreenTab = 'accueil' | 'planning' | 'adherents' | 'plus';

export function EmployeeMobileShell() {
  const {
    currentUser,
    employees,
    shifts,
    leaveRequests,
    hrDocuments,
    trainingModules,
    moduleProgress,
    checklists,
    heitzMembers,
    heitzKpiTickets,
    prospects,
    clubFilter,
    setClubFilter,
    activeSection,
    navSubTarget,
    setActiveSection,
    setShellMode,
    submitLeaveRequest,
    signDocumentWithInternalProof,
    completeAcademyQuiz,
    toggleChecklistItem,
    punchWithPin,
    simulateMemberGateScan,
    triggerManualTurnstileOpen,
    regularizeMemberSepa,
    recordQuickTpvSale,
    openMywellnessLink,
    createProspect,
    themeMode,
  } = useCfos();

  const fieldEmployees = employees.filter((e) => e.role !== 'kiosque');
  const isDark = themeMode === 'dark';

  const [selectedEmpId, setSelectedEmpId] = useState<string>(() => {
    if (currentUser.role === 'admin') {
      return (
        fieldEmployees.find((e) => e.role === 'apprenti')?.id ||
        fieldEmployees.find((e) => e.role === 'commercial')?.id ||
        currentUser.id
      );
    }
    return currentUser.id;
  });

  const activeEmp =
    fieldEmployees.find((e) => e.id === selectedEmpId) || currentUser;

  // 3 Modes: 'cfitness_mobile_duo' (Smartphones) | 'cfitness_tablet' (Tablette iPad complète) | 'hr_collaborator' (Grille RH)
  const [displayMode, setDisplayMode] = useState<
    'cfitness_mobile_duo' | 'cfitness_tablet' | 'hr_collaborator'
  >('cfitness_mobile_duo');

  // Independent active tab on Phone 1 and Phone 2 so every bottom-bar button works!
  const [phone1Tab, setPhone1Tab] = useState<PhoneScreenTab>('accueil');
  const [phone2Tab, setPhone2Tab] = useState<PhoneScreenTab>('planning');

  // Mobile App states
  const [mobileClub, setMobileClub] = useState<'center' | 'place'>('center');
  const [chartRange, setChartRange] = useState<'7j' | '30j'>('7j');
  const [phoneNotifOpen, setPhoneNotifOpen] = useState(false);
  const [planningSubTab, setPlanningSubTab] = useState<'cours' | 'equipe' | 'salles'>('cours');
  const [selectedDayNum, setSelectedDayNum] = useState<number>(14);
  const [mobileCourses, setMobileCourses] = useState<MobileCourseSlot[]>(INITIAL_MOBILE_COURSES);
  const [newCourseTitle, setNewCourseTitle] = useState('');
  const [showAddCourseForm, setShowAddCourseForm] = useState(false);
  const [courseSearchOpen, setCourseSearchOpen] = useState(false);
  const [courseSearchQuery, setCourseSearchQuery] = useState('');
  const [roomFilter, setRoomFilter] = useState<'ALL' | 'Salle 1' | 'Salle 2'>('ALL');
  const [memberSearchMobile, setMemberSearchMobile] = useState('');
  const [memberFilterMobile, setMemberFilterMobile] = useState<'ALL' | 'IMPAYE'>('ALL');
  const [mobileFeedback, setMobileFeedback] = useState<string | null>(null);

  // Quick Prospect creation on mobile
  const [quickProspectName, setQuickProspectName] = useState('');
  const [quickProspectPhone, setQuickProspectPhone] = useState('');

  // HR Collaborator tabs
  const [tab, setTab] = useState<
    'DASHBOARD' | 'PLANNING' | 'CONGES' | 'DOCS' | 'ACADEMIE' | 'CHECKLIST'
  >('DASHBOARD');
  const [viewLayout, setViewLayout] = useState<'mobile' | 'wide'>('wide');

  const [leaveType, setLeaveType] = useState<LeaveRequest['type']>('CP');
  const [startDate, setStartDate] = useState('2025-06-15');
  const [endDate, setEndDate] = useState('2025-06-20');
  const [daysCount, setDaysCount] = useState(5);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const myShifts = shifts.filter((s) => s.employeeId === activeEmp.id);
  const myLeaves = leaveRequests.filter((l) => l.employeeId === activeEmp.id);
  const myDocs = hrDocuments.filter((d) => d.employeeId === activeEmp.id);
  const myChecklist = checklists.filter((c) => c.clubId === activeEmp.clubId);

  const activeClubId: ClubId = mobileClub === 'center' ? 'carre-de-soie' : 'beynost';

  const triggerMobileNotice = (msg: string) => {
    setMobileFeedback(msg);
    setTimeout(() => setMobileFeedback(null), 4000);
  };

  const handleLeaveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitLeaveRequest({
      employeeId: activeEmp.id,
      clubId: activeEmp.clubId,
      type: leaveType,
      startDate,
      endDate,
      daysCount,
    });
    setToastMsg('Demande de congés transmise au Manager !');
    triggerMobileNotice('Demande de congés enregistrée avec succès.');
  };

  const handleAddMobileCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCourseTitle.trim()) return;
    setMobileCourses((prev) => [
      ...prev,
      {
        id: `mc-${Date.now()}`,
        time: '20:00',
        title: newCourseTitle.trim(),
        room: 'Salle 1',
        enrolled: 15,
        capacity: 25,
        colorLight: 'bg-violet-50 text-violet-950',
        colorDark: 'bg-violet-950/50 text-violet-100',
        borderAccent: 'border-l-4 border-l-violet-500',
        coachName: activeEmp.firstName,
      },
    ]);
    triggerMobileNotice(`Cours « ${newCourseTitle.trim()} » ajouté à 20:00 (Salle 1).`);
    setNewCourseTitle('');
    setShowAddCourseForm(false);
  };

  const handleIncrementCourseParticipant = (courseId: string) => {
    setMobileCourses((prev) =>
      prev.map((c) =>
        c.id === courseId && c.enrolled < c.capacity
          ? { ...c, enrolled: c.enrolled + 1 }
          : c
      )
    );
    triggerMobileNotice('Participant inscrit au cours collectif (+1 place validée).');
  };

  const handleMobilePunch = (type: PointageType) => {
    const res = punchWithPin(activeEmp.clubId, activeEmp.id, activeEmp.pinCode, type);
    triggerMobileNotice(res.message);
  };

  const handleQuickCreateProspectMobile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickProspectName.trim() || !quickProspectPhone.trim()) return;
    const parts = quickProspectName.trim().split(/\s+/);
    const firstName = parts[0] || 'Prospect';
    const lastName = parts.slice(1).join(' ') || 'Mobile';
    const res = createProspect({
      firstName,
      lastName,
      phone: quickProspectPhone.trim(),
      email: `${firstName.toLowerCase()}@cfitness-mobile.fr`,
      clubId: activeClubId,
      source: 'Tablette accueil',
      goal: 'Séance découverte & Biocircuit',
      rgpdConsent: true,
    });
    triggerMobileNotice(res.message);
    if (res.ok) {
      setQuickProspectName('');
      setQuickProspectPhone('');
    }
  };

  const openAdminModule = (section: AdminSection, sub?: string) => {
    setActiveSection(section, sub);
    setShellMode('admin');
  };

  const filteredMobileCourses = mobileCourses.filter((slot) => {
    if (roomFilter !== 'ALL' && slot.room !== roomFilter) return false;
    if (
      courseSearchQuery.trim() &&
      !`${slot.title} ${slot.room} ${slot.coachName}`
        .toLowerCase()
        .includes(courseSearchQuery.trim().toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const filteredMobileMembers = heitzMembers.filter((m) => {
    if (memberFilterMobile === 'IMPAYE' && m.finBalanceEur >= 0) return false;
    if (
      memberSearchMobile.trim() &&
      !`${m.firstName} ${m.lastName} ${m.badgeCode}`
        .toLowerCase()
        .includes(memberSearchMobile.trim().toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  // Reusable renderer for any Phone Screen ('accueil' | 'planning' | 'adherents' | 'plus')
  const renderPhoneContent = (
    activePhoneTab: PhoneScreenTab,
    setPhoneTab: (next: PhoneScreenTab) => void
  ) => {
    if (activePhoneTab === 'accueil') {
      return (
        <div className="p-4 space-y-3.5 flex-1 overflow-y-auto">
          {/* Top Brand Row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-violet-600 to-blue-500 flex items-center justify-center text-white font-black text-xs">
                C
              </div>
              <span className="font-extrabold text-sm">C.Fitness OS</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPhoneNotifOpen((prev) => !prev)}
                aria-label="Notifications mobile (3)"
                className="relative p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <Bell className="w-4 h-4 text-slate-400" />
                <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center">
                  3
                </span>
              </button>
              <button
                type="button"
                onClick={() => setPhoneTab('plus')}
                title="Profil & Tous les modules"
                className="w-7 h-7 rounded-full bg-gradient-to-tr from-violet-600 to-indigo-500 text-white text-[10px] font-bold flex items-center justify-center cursor-pointer"
              >
                TC
              </button>
            </div>
          </div>

          {phoneNotifOpen && (
            <div
              className={`p-2.5 rounded-2xl border text-[11px] space-y-1.5 ${
                isDark
                  ? 'bg-[#171C2E] border-slate-700 text-slate-200'
                  : 'bg-slate-50 border-slate-200 text-slate-800'
              }`}
            >
              <div className="font-bold flex items-center justify-between">
                <span>Actions rapides (3)</span>
                <button
                  type="button"
                  onClick={() => setPhoneNotifOpen(false)}
                  className="text-[10px] text-violet-500 font-bold cursor-pointer"
                >
                  Fermer
                </button>
              </div>
              <button
                type="button"
                onClick={() => {
                  setMemberFilterMobile('IMPAYE');
                  setPhoneTab('adherents');
                  setPhoneNotifOpen(false);
                }}
                className="w-full p-1.5 rounded-lg bg-rose-500/10 text-rose-500 font-semibold text-left flex justify-between items-center cursor-pointer"
              >
                <span>5 impayés SEPA à relancer (1 250 €)</span>
                <span>→</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setDisplayMode('hr_collaborator');
                  setTab('DOCS');
                  setPhoneNotifOpen(false);
                }}
                className="w-full p-1.5 rounded-lg bg-amber-500/10 text-amber-500 font-semibold text-left flex justify-between items-center cursor-pointer"
              >
                <span>2 contrats RH en attente de signature</span>
                <span>→</span>
              </button>
              <button
                type="button"
                onClick={() => openAdminModule('orchestrator', 'maintenance')}
                className="w-full p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500 font-semibold text-left flex justify-between items-center cursor-pointer"
              >
                <span>Maintenance prévue : CTA Beynost</span>
                <span>→</span>
              </button>
            </div>
          )}

          {/* Greeting */}
          <div>
            <h2 className="text-xl font-extrabold flex items-center gap-1.5">
              <span>Bonjour Thomas !</span>
              <span aria-hidden="true">👋</span>
            </h2>
            <p className="text-xs text-slate-400">
              Lundi {selectedDayNum} avril 2025 ·{' '}
              {mobileClub === 'center' ? 'C.Fitness Center' : 'C.Fitness Place'}
            </p>
          </div>

          {/* Segmented Pill Toggle: Center | Place */}
          <div
            className={`grid grid-cols-2 p-1 rounded-full text-xs font-bold ${
              isDark ? 'bg-[#1B2135]' : 'bg-slate-100'
            }`}
          >
            <button
              type="button"
              onClick={() => setMobileClub('center')}
              className={`py-1.5 rounded-full transition-colors cursor-pointer ${
                mobileClub === 'center'
                  ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-xs'
                  : 'text-slate-400'
              }`}
            >
              Center
            </button>
            <button
              type="button"
              onClick={() => setMobileClub('place')}
              className={`py-1.5 rounded-full transition-colors cursor-pointer ${
                mobileClub === 'place'
                  ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-xs'
                  : 'text-slate-400'
              }`}
            >
              Place
            </button>
          </div>

          {/* 4 Interactive KPI Cards */}
          <div className="grid grid-cols-4 gap-2">
            <button
              type="button"
              onClick={() => setPhoneTab('adherents')}
              className={`p-2 rounded-2xl border text-center cursor-pointer transition-transform active:scale-95 ${
                isDark
                  ? 'bg-[#171C2E] border-slate-800 hover:border-violet-500/50'
                  : 'bg-slate-50/80 border-slate-200/70 hover:border-violet-400'
              }`}
            >
              <div className="w-7 h-7 mx-auto rounded-full bg-violet-500 text-white flex items-center justify-center mb-1">
                <Users className="w-3.5 h-3.5" />
              </div>
              <div className="text-xs font-black tabular-nums">
                {mobileClub === 'center' ? '1 248' : '566'}
              </div>
              <div className="text-[9px] text-slate-400 truncate">Adhérents</div>
            </button>

            <button
              type="button"
              onClick={() => openAdminModule('devices', 'finances')}
              className={`p-2 rounded-2xl border text-center cursor-pointer transition-transform active:scale-95 ${
                isDark
                  ? 'bg-[#171C2E] border-slate-800 hover:border-emerald-500/50'
                  : 'bg-slate-50/80 border-slate-200/70 hover:border-emerald-400'
              }`}
            >
              <div className="w-7 h-7 mx-auto rounded-full bg-emerald-500 text-white flex items-center justify-center mb-1">
                <Euro className="w-3.5 h-3.5" />
              </div>
              <div className="text-xs font-black tabular-nums">
                {mobileClub === 'center' ? '102 K€' : '48 K€'}
              </div>
              <div className="text-[9px] text-slate-400 truncate">CA (mois)</div>
            </button>

            <button
              type="button"
              onClick={() => setChartRange((prev) => (prev === '7j' ? '30j' : '7j'))}
              className={`p-2 rounded-2xl border text-center cursor-pointer transition-transform active:scale-95 ${
                isDark
                  ? 'bg-[#171C2E] border-slate-800 hover:border-blue-500/50'
                  : 'bg-slate-50/80 border-slate-200/70 hover:border-blue-400'
              }`}
            >
              <div className="w-7 h-7 mx-auto rounded-full bg-blue-500 text-white flex items-center justify-center mb-1">
                <BarChart3 className="w-3.5 h-3.5" />
              </div>
              <div className="text-xs font-black tabular-nums">
                {mobileClub === 'center' ? '78 %' : '80 %'}
              </div>
              <div className="text-[9px] text-slate-400 truncate">Fréquentation</div>
            </button>

            <button
              type="button"
              onClick={() => openAdminModule('academy', 'rapports')}
              className={`p-2 rounded-2xl border text-center cursor-pointer transition-transform active:scale-95 ${
                isDark
                  ? 'bg-[#171C2E] border-slate-800 hover:border-amber-500/50'
                  : 'bg-slate-50/80 border-slate-200/70 hover:border-amber-400'
              }`}
            >
              <div className="w-7 h-7 mx-auto rounded-full bg-amber-500 text-white flex items-center justify-center mb-1">
                <Star className="w-3.5 h-3.5 fill-white" />
              </div>
              <div className="text-xs font-black tabular-nums">4,8</div>
              <div className="text-[9px] text-slate-400 truncate">Satisfaction</div>
            </button>
          </div>

          {/* Fréquentation (7 jours / 30 jours) Interactive Mini Chart */}
          <div
            className={`p-3 rounded-2xl border ${
              isDark ? 'bg-[#171C2E] border-slate-800' : 'bg-slate-50/60 border-slate-200/70'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold">Fréquentation ({chartRange})</span>
              <button
                type="button"
                onClick={() => setChartRange((prev) => (prev === '7j' ? '30j' : '7j'))}
                className="text-[10px] text-violet-500 font-bold px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700 cursor-pointer"
              >
                {chartRange === '7j' ? '7 jours ⌄' : '30 jours ⌄'}
              </button>
            </div>
            <svg viewBox="0 0 260 65" className="w-full h-14">
              <polyline
                fill="none"
                stroke="#8B5CF6"
                strokeWidth="2.5"
                points={
                  chartRange === '7j'
                    ? '10,45 50,38 90,42 130,30 170,34 210,20 250,24'
                    : '10,50 50,32 90,28 130,36 170,18 210,25 250,14'
                }
              />
              <polyline
                fill="none"
                stroke="#3B82F6"
                strokeWidth="2"
                points={
                  chartRange === '7j'
                    ? '10,52 50,46 90,49 130,40 170,43 210,32 250,35'
                    : '10,55 50,42 90,39 130,44 170,29 210,34 250,24'
                }
              />
            </svg>
            <div className="flex justify-between text-[9px] text-slate-400 px-1">
              {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((d, i) => (
                <span key={i}>{d}</span>
              ))}
            </div>
          </div>

          {/* Activités du jour (Interactive) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold">Activités du jour</span>
              <button
                type="button"
                onClick={() => setPhoneTab('planning')}
                className="text-[11px] font-semibold text-violet-500 hover:underline cursor-pointer"
              >
                Voir tout
              </button>
            </div>

            {[
              {
                time: '08:00',
                title: 'BodyPump',
                sub: '24 / 30 participants',
                club: 'Center',
                iconBg: 'bg-violet-600',
                action: () => setPhoneTab('planning'),
              },
              {
                time: '10:00',
                title: 'Rendez-vous commercial',
                sub: 'Visite club - Prospect',
                club: 'Place',
                iconBg: 'bg-blue-600',
                action: () => openAdminModule('crm'),
              },
              {
                time: '12:30',
                title: 'Maintenance',
                sub: 'Climatisation - Espace...',
                club: 'Center',
                iconBg: 'bg-emerald-500',
                action: () => openAdminModule('orchestrator', 'maintenance'),
              },
            ].map((item) => (
              <button
                key={item.time}
                type="button"
                onClick={item.action}
                className={`w-full p-1.5 rounded-xl flex items-center gap-2.5 text-xs text-left cursor-pointer transition-colors ${
                  isDark ? 'hover:bg-slate-800/70' : 'hover:bg-slate-100'
                }`}
              >
                <span className="w-9 text-[10px] font-mono text-slate-400">{item.time}</span>
                <div
                  className={`w-7 h-7 rounded-xl ${item.iconBg} text-white flex items-center justify-center shrink-0`}
                >
                  <Activity className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold truncate">{item.title}</div>
                  <div className="text-[10px] text-slate-400 truncate">{item.sub}</div>
                </div>
                <span
                  className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                    item.club === 'Center'
                      ? 'bg-violet-500/15 text-violet-500'
                      : 'bg-blue-500/15 text-blue-500'
                  }`}
                >
                  {item.club}
                </span>
              </button>
            ))}
          </div>
        </div>
      );
    }

    if (activePhoneTab === 'planning') {
      return (
        <div className="p-4 space-y-3 flex-1 overflow-y-auto relative">
          {/* Header: Planning + Search + Filter */}
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-extrabold">Planning</h2>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setCourseSearchOpen((prev) => !prev)}
                aria-label="Rechercher dans le planning"
                className={`p-1.5 rounded-lg cursor-pointer ${
                  courseSearchOpen
                    ? 'bg-violet-600 text-white'
                    : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Search className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() =>
                  setRoomFilter((prev) =>
                    prev === 'ALL' ? 'Salle 1' : prev === 'Salle 1' ? 'Salle 2' : 'ALL'
                  )
                }
                aria-label="Filtrer par salle"
                title="Filtrer par salle (Toutes / Salle 1 / Salle 2)"
                className={`px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer ${
                  roomFilter !== 'ALL'
                    ? 'bg-violet-600 text-white'
                    : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                {roomFilter !== 'ALL' && <span>{roomFilter}</span>}
              </button>
            </div>
          </div>

          {courseSearchOpen && (
            <input
              type="text"
              value={courseSearchQuery}
              onChange={(e) => setCourseSearchQuery(e.target.value)}
              placeholder="Filtrer cours, salle ou coach..."
              className={`w-full px-3 py-1.5 rounded-xl border text-xs outline-hidden ${
                isDark
                  ? 'bg-[#171C2E] border-slate-700 text-white'
                  : 'bg-slate-50 border-slate-200 text-slate-900'
              }`}
            />
          )}

          {/* Segmented Tabs: Cours | Équipe | Salles */}
          <div
            className={`grid grid-cols-3 p-1 rounded-full text-xs font-bold ${
              isDark ? 'bg-[#1B2135]' : 'bg-slate-100'
            }`}
          >
            {(
              [
                { id: 'cours', label: 'Cours' },
                { id: 'equipe', label: 'Équipe' },
                { id: 'salles', label: 'Salles' },
              ] as const
            ).map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setPlanningSubTab(t.id)}
                className={`py-1.5 rounded-full transition-colors cursor-pointer ${
                  planningSubTab === t.id
                    ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-xs'
                    : 'text-slate-400'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Horizontal Week Day Selector (L 14 -> D 20) */}
          <div className="grid grid-cols-7 gap-1 text-center pt-0.5">
            {[
              { letter: 'L', num: 14 },
              { letter: 'M', num: 15 },
              { letter: 'M', num: 16 },
              { letter: 'J', num: 17 },
              { letter: 'V', num: 18 },
              { letter: 'S', num: 19 },
              { letter: 'D', num: 20 },
            ].map((d) => {
              const active = selectedDayNum === d.num;
              return (
                <button
                  key={d.num}
                  type="button"
                  onClick={() => setSelectedDayNum(d.num)}
                  className="flex flex-col items-center gap-1 cursor-pointer"
                >
                  <span className="text-[10px] text-slate-400 font-medium">{d.letter}</span>
                  <span
                    className={`w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center transition-colors ${
                      active
                        ? 'bg-violet-600 text-white shadow-xs'
                        : isDark
                        ? 'text-slate-200 hover:bg-slate-800'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {d.num}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Optional Add Course Form */}
          {showAddCourseForm && (
            <form
              onSubmit={handleAddMobileCourse}
              className={`p-2.5 rounded-xl border flex items-center gap-2 ${
                isDark ? 'bg-slate-900 border-slate-700' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <input
                type="text"
                value={newCourseTitle}
                onChange={(e) => setNewCourseTitle(e.target.value)}
                placeholder="Nom du cours (ex: Pilates)..."
                className="flex-1 bg-transparent text-xs outline-hidden"
              />
              <button
                type="submit"
                className="px-2.5 py-1 rounded-lg bg-violet-600 text-white text-xs font-bold cursor-pointer"
              >
                Ajouter
              </button>
            </form>
          )}

          {/* SUB-TAB 1: COURS COLLECTIFS */}
          {planningSubTab === 'cours' && (
            <div className="space-y-2 pt-1 max-h-[380px] overflow-y-auto pr-1">
              {filteredMobileCourses.map((slot) => (
                <div key={slot.id} className="flex items-center gap-2.5 text-xs">
                  <span className="w-10 text-[11px] font-mono text-slate-400 shrink-0">
                    {slot.time}
                  </span>
                  <div
                    className={`flex-1 px-3 py-2 rounded-xl flex items-center justify-between gap-2 ${slot.borderAccent} ${
                      isDark ? slot.colorDark : slot.colorLight
                    }`}
                  >
                    <div>
                      <div className="font-bold text-xs">{slot.title}</div>
                      <div className="text-[10px] opacity-75">
                        {slot.room} • {slot.enrolled} / {slot.capacity} ({slot.coachName})
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleIncrementCourseParticipant(slot.id)}
                      title="Inscrire +1 participant"
                      className="px-2 py-1 rounded-lg bg-black/10 dark:bg-white/10 hover:bg-black/20 text-[10px] font-bold cursor-pointer shrink-0"
                    >
                      +1 inscrit
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* SUB-TAB 2: ÉQUIPE & SHIFTS RH */}
          {planningSubTab === 'equipe' && (
            <div className="space-y-2 pt-1 max-h-[380px] overflow-y-auto pr-1">
              <div className="flex items-center justify-between text-[11px] text-slate-400 pb-1">
                <span>Shifts Équipe ({shifts.length} créneaux)</span>
                <button
                  type="button"
                  onClick={() => handleMobilePunch('arrivee')}
                  className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-500 font-bold cursor-pointer"
                >
                  Pointer Arrivée
                </button>
              </div>
              {shifts.slice(0, 6).map((s) => {
                const emp = employees.find((e) => e.id === s.employeeId);
                return (
                  <div
                    key={s.id}
                    className={`p-2.5 rounded-xl border text-xs flex items-center justify-between ${
                      isDark
                        ? 'bg-[#171C2E] border-slate-800 text-slate-200'
                        : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                  >
                    <div>
                      <div className="font-bold">
                        {emp ? `${emp.firstName} ${emp.lastName}` : s.employeeId}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {s.roleLabel} · {s.clubId === 'carre-de-soie' ? 'Center' : 'Place'}
                      </div>
                    </div>
                    <span className="font-mono font-bold text-violet-500 text-[11px]">
                      {s.startTime}–{s.endTime}
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          {/* SUB-TAB 3: SALLES & PLATEAUX */}
          {planningSubTab === 'salles' && (
            <div className="space-y-2.5 pt-1 max-h-[380px] overflow-y-auto pr-1 text-xs">
              {[
                {
                  name: 'Salle 1 — Studio Cours Collectifs',
                  occ: '28 / 30 pers.',
                  pct: 93,
                  temp: '19,5 °C · CTA OK',
                },
                {
                  name: 'Salle 2 — Cycling & HIIT',
                  occ: '24 / 30 vélos',
                  pct: 80,
                  temp: '18,8 °C · CTA OK',
                },
                {
                  name: 'Plateau Biocircuit Technogym',
                  occ: '14 / 18 postes',
                  pct: 78,
                  temp: '20,2 °C · Connecté',
                },
                {
                  name: 'Box Technogym Checkup BIA',
                  occ: '1 / 2 cabines',
                  pct: 50,
                  temp: 'Sync Mywellness 9 ms',
                },
              ].map((room) => (
                <div
                  key={room.name}
                  className={`p-3 rounded-xl border space-y-1.5 ${
                    isDark ? 'bg-[#171C2E] border-slate-800' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between font-bold">
                    <span>{room.name}</span>
                    <span className="text-violet-500 font-mono text-[11px]">{room.occ}</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-violet-600 rounded-full"
                      style={{ width: `${room.pct}%` }}
                    />
                  </div>
                  <div className="text-[10px] text-slate-400 flex justify-between">
                    <span>Occupation : {room.pct} %</span>
                    <span>{room.temp}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Floating + Button */}
          <button
            type="button"
            onClick={() => {
              setPlanningSubTab('cours');
              setShowAddCourseForm((prev) => !prev);
            }}
            aria-label="Ajouter un créneau au planning"
            className="absolute bottom-4 right-4 w-10 h-10 rounded-full bg-gradient-to-tr from-violet-600 to-indigo-500 text-white shadow-lg flex items-center justify-center cursor-pointer hover:scale-105 transition-transform"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      );
    }

    if (activePhoneTab === 'adherents') {
      return (
        <div className="p-4 space-y-3 flex-1 overflow-y-auto text-xs">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-extrabold">Adhérents &amp; Accès</h2>
            <span className="px-2 py-0.5 rounded-full bg-violet-500/15 text-violet-500 font-bold text-[10px]">
              {heitzMembers.length} fiches Heitz
            </span>
          </div>

          {/* Quick Turnstile Remote Control on Phone */}
          <div className="grid grid-cols-3 gap-1.5">
            {(['Tripode 1', 'Tripode 2', 'Porte PMR'] as const).map((gate) => (
              <button
                key={gate}
                type="button"
                onClick={() => {
                  triggerManualTurnstileOpen(activeClubId, gate, 'Ouverture mobile');
                  triggerMobileNotice(`${gate} ouvert (impulsion 500 ms).`);
                }}
                className="py-1.5 px-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] flex items-center justify-center gap-1 cursor-pointer"
              >
                <DoorOpen className="w-3 h-3" />
                <span>{gate}</span>
              </button>
            ))}
          </div>

          {/* Search & SEPA Filter */}
          <div className="flex gap-1.5">
            <input
              type="text"
              value={memberSearchMobile}
              onChange={(e) => setMemberSearchMobile(e.target.value)}
              placeholder="Rechercher nom ou badge HZ..."
              className={`flex-1 px-2.5 py-1.5 rounded-xl border text-xs outline-hidden ${
                isDark
                  ? 'bg-[#171C2E] border-slate-700 text-white'
                  : 'bg-slate-50 border-slate-200 text-slate-900'
              }`}
            />
            <button
              type="button"
              onClick={() =>
                setMemberFilterMobile((prev) => (prev === 'ALL' ? 'IMPAYE' : 'ALL'))
              }
              className={`px-2.5 py-1.5 rounded-xl font-bold text-[10px] cursor-pointer border ${
                memberFilterMobile === 'IMPAYE'
                  ? 'bg-rose-600 text-white border-rose-600'
                  : isDark
                  ? 'bg-slate-800 border-slate-700 text-slate-300'
                  : 'bg-slate-100 border-slate-200 text-slate-700'
              }`}
            >
              {memberFilterMobile === 'IMPAYE' ? 'Impayés SEPA' : 'Tous'}
            </button>
          </div>

          {/* Member Cards */}
          <div className="space-y-2 max-h-[360px] overflow-y-auto pr-0.5">
            {filteredMobileMembers.map((m) => {
              const hasDebt = m.finBalanceEur < 0;
              return (
                <div
                  key={m.id}
                  className={`p-2.5 rounded-xl border space-y-2 ${
                    isDark ? 'bg-[#171C2E] border-slate-800' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <div className="font-bold">
                        {m.firstName} {m.lastName}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        #{m.badgeCode} · {m.homeClubId === 'carre-de-soie' ? 'Center' : 'Place'}
                      </div>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        hasDebt
                          ? 'bg-rose-500/20 text-rose-500'
                          : 'bg-emerald-500/20 text-emerald-500'
                      }`}
                    >
                      {hasDebt ? `${m.finBalanceEur.toFixed(2)} €` : 'SEPA OK'}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        const ev = simulateMemberGateScan(m.id, activeClubId);
                        triggerMobileNotice(
                          ev?.granted
                            ? `Passage autorisé pour ${m.firstName} ${m.lastName}.`
                            : `Passage refusé (${m.firstName}) : impayé SEPA.`
                        );
                      }}
                      className="flex-1 py-1 px-2 rounded-lg bg-violet-600 text-white font-bold text-[10px] cursor-pointer"
                    >
                      Tester Badge
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        openMywellnessLink({
                          mywellnessMemberId: m.mywellnessMemberId,
                          personName: `${m.firstName} ${m.lastName}`,
                          clubId: m.homeClubId,
                        })
                      }
                      className="flex-1 py-1 px-2 rounded-lg bg-amber-500 text-slate-950 font-bold text-[10px] cursor-pointer"
                    >
                      Mywellness
                    </button>
                    {hasDebt && (
                      <button
                        type="button"
                        onClick={() => {
                          regularizeMemberSepa(m.id);
                          triggerMobileNotice(
                            `Impayé SEPA régularisé pour ${m.firstName} ${m.lastName} !`
                          );
                        }}
                        className="flex-1 py-1 px-2 rounded-lg bg-emerald-600 text-white font-bold text-[10px] cursor-pointer"
                      >
                        Régulariser CB
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    // Tab 4: 'plus' (Tous les Modules & Actions Terrain sur Téléphone)
    return (
      <div className="p-4 space-y-3 flex-1 overflow-y-auto text-xs">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-extrabold">Tous les Modules &amp; Actions</h2>
          <span className="text-[10px] font-mono text-violet-500 font-bold">
            PIN : {activeEmp.pinCode}
          </span>
        </div>

        {/* 1. Badgeuse PIN Rapide */}
        <div
          className={`p-2.5 rounded-2xl border space-y-2 ${
            isDark ? 'bg-[#171C2E] border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}
        >
          <div className="font-bold text-[11px] flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-emerald-500" />
              Pointage Rapide ({activeEmp.firstName})
            </span>
            <button
              type="button"
              onClick={() => setShellMode('tablette')}
              className="text-[10px] text-violet-500 underline cursor-pointer"
            >
              Kiosque PIN →
            </button>
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            <button
              type="button"
              onClick={() => handleMobilePunch('arrivee')}
              className="py-1.5 px-2 rounded-lg bg-emerald-600 text-white font-bold text-[11px] cursor-pointer"
            >
              Arrivée
            </button>
            <button
              type="button"
              onClick={() => handleMobilePunch('depart')}
              className="py-1.5 px-2 rounded-lg bg-slate-700 text-white font-bold text-[11px] cursor-pointer"
            >
              Départ
            </button>
          </div>
        </div>

        {/* 2. Vente Flash Caisse TPV */}
        <div
          className={`p-2.5 rounded-2xl border space-y-2 ${
            isDark ? 'bg-[#171C2E] border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}
        >
          <div className="font-bold text-[11px] flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <ShoppingBag className="w-3.5 h-3.5 text-amber-500" />
              <span>Encaissement TPV Express</span>
            </span>
            <span className="font-mono text-[10px] text-emerald-500">
              {heitzKpiTickets.length} tickets
            </span>
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            {[
              { label: 'Cadenas Acier', price: 8 },
              { label: 'Serviette C.Fit', price: 12 },
              { label: 'Shaker Whey', price: 3.5 },
              { label: 'Séance Invité', price: 15 },
            ].map((it) => (
              <button
                key={it.label}
                type="button"
                onClick={() => {
                  recordQuickTpvSale(activeClubId, it.label, it.price);
                  triggerMobileNotice(`+1 ${it.label} (${it.price} €) encaissé sur TPV.`);
                }}
                className={`py-1.5 px-2 rounded-lg border text-left text-[10px] font-bold cursor-pointer ${
                  isDark
                    ? 'bg-slate-900 border-slate-700 text-slate-200 hover:border-emerald-500'
                    : 'bg-white border-slate-200 text-slate-800 hover:border-emerald-500'
                }`}
              >
                + {it.label} · {it.price} €
              </button>
            ))}
          </div>
          <div className="pt-1 border-t border-slate-200 dark:border-slate-800 space-y-0.5 text-[10px]">
            {heitzKpiTickets.slice(0, 2).map((tk) => (
              <div key={tk.id} className="flex items-center justify-between text-slate-400">
                <span className="truncate">{tk.articleName.replace(/^0\d - /, '')}</span>
                <span className="font-mono font-bold text-emerald-500">
                  {tk.amountTtcEur.toFixed(2)} €
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 3. Ajout rapide Prospect CRM */}
        <form
          onSubmit={handleQuickCreateProspectMobile}
          className={`p-2.5 rounded-2xl border space-y-2 ${
            isDark ? 'bg-[#171C2E] border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}
        >
          <div className="font-bold text-[11px] flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <UserPlus className="w-3.5 h-3.5 text-violet-500" />
              Nouveau Prospect CRM ({prospects.length})
            </span>
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            <input
              type="text"
              value={quickProspectName}
              onChange={(e) => setQuickProspectName(e.target.value)}
              placeholder="Nom Prénom"
              className="px-2 py-1 rounded-lg border border-slate-300 dark:border-slate-700 text-[11px]"
            />
            <input
              type="text"
              value={quickProspectPhone}
              onChange={(e) => setQuickProspectPhone(e.target.value)}
              placeholder="06 12 34 56 78"
              className="px-2 py-1 rounded-lg border border-slate-300 dark:border-slate-700 text-[11px]"
            />
          </div>
          <button
            type="submit"
            className="w-full py-1.5 rounded-lg bg-violet-600 text-white font-bold text-[11px] cursor-pointer"
          >
            Ajouter au Pipeline CRM
          </button>
        </form>

        {/* 4. Grille d'accès direct à tous les modules C.Fitness OS */}
        <div className="space-y-1.5">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Accès direct aux modules complets
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            {[
              { label: 'Tableau de bord', action: () => openAdminModule('dashboard') },
              { label: 'CRM & Ventes', action: () => openAdminModule('crm') },
              { label: 'Finances & SEPA', action: () => openAdminModule('devices', 'finances') },
              { label: 'Bilans Checkup', action: () => openAdminModule('devices', 'checkup') },
              { label: 'Softphone 04/07', action: () => setShellMode('telephone') },
              { label: 'Borne Kiosque PIN', action: () => setShellMode('tablette') },
              {
                label: 'Maintenance & IoT',
                action: () => openAdminModule('orchestrator', 'maintenance'),
              },
              {
                label: 'Stock & Achats',
                action: () => openAdminModule('orchestrator', 'stocks'),
              },
              { label: 'Documents & ATS', action: () => openAdminModule('ats', 'documents') },
              {
                label: 'Rapports & BPJEPS',
                action: () => openAdminModule('academy', 'rapports'),
              },
              { label: 'Congés & Coffre RH', action: () => setDisplayMode('hr_collaborator') },
              { label: 'Mon Espace (PIN)', action: () => openAdminModule('governance') },
            ].map((m) => (
              <button
                key={m.label}
                type="button"
                onClick={m.action}
                className={`p-2 rounded-xl border text-left font-bold text-[11px] cursor-pointer transition-colors ${
                  isDark
                    ? 'bg-[#171C2E] border-slate-800 hover:border-violet-500 text-slate-200'
                    : 'bg-slate-50 border-slate-200 hover:border-violet-500 text-slate-800'
                }`}
              >
                {m.label} →
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Reusable bottom navigation bar for each Smartphone
  const renderPhoneBottomBar = (
    activePhoneTab: PhoneScreenTab,
    setPhoneTab: (next: PhoneScreenTab) => void
  ) => (
    <div
      className={`px-3 py-2 border-t grid grid-cols-4 text-center text-[10px] font-semibold ${
        isDark ? 'bg-[#151A2A] border-slate-800' : 'bg-white border-slate-100'
      }`}
    >
      {(
        [
          { id: 'accueil', label: 'Accueil', icon: Home },
          { id: 'planning', label: 'Planning', icon: Calendar },
          { id: 'adherents', label: 'Adhérents', icon: Users },
          { id: 'plus', label: 'Plus', icon: MoreHorizontal },
        ] as const
      ).map((nav) => {
        const Icon = nav.icon;
        const active = activePhoneTab === nav.id;
        return (
          <button
            key={nav.id}
            type="button"
            onClick={() => setPhoneTab(nav.id)}
            className={`flex flex-col items-center py-0.5 rounded-lg cursor-pointer transition-colors ${
              active
                ? 'text-violet-500 font-bold'
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
            }`}
          >
            <Icon className="w-4 h-4 mb-0.5" />
            <span>{nav.label}</span>
          </button>
        );
      })}
    </div>
  );

  return (
    <div
      className={`cfos-adaptive-shell min-h-screen flex flex-col items-center justify-start py-4 px-3 sm:px-6 transition-colors duration-200 ${
        isDark ? 'bg-[#0B0E17] text-slate-100' : 'bg-[#EEF0F7] text-slate-900'
      }`}
    >
      {/* Top Control Header (PC, Tablette & Téléphone) */}
      <div
        className={`w-full max-w-6xl mb-4 rounded-2xl border p-3 flex flex-wrap items-center justify-between gap-3 shadow-xs ${
          isDark
            ? 'bg-[#131826] border-slate-800 text-white'
            : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setShellMode('admin')}
            className="min-h-[40px] px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Retour Poste PC</span>
          </button>

          {/* 3-Way Device Switcher: Téléphones | Tablette iPad | Espace RH Collaborateur */}
          <div
            className={`flex flex-wrap items-center p-1 rounded-xl border text-xs ${
              isDark ? 'bg-[#0B0E17] border-slate-800' : 'bg-slate-100 border-slate-200'
            }`}
          >
            <button
              type="button"
              onClick={() => setDisplayMode('cfitness_mobile_duo')}
              className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 cursor-pointer transition-colors ${
                displayMode === 'cfitness_mobile_duo'
                  ? 'bg-violet-600 text-white shadow-2xs'
                  : isDark
                  ? 'text-slate-400 hover:text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Mode Téléphone</span>
            </button>
            <button
              type="button"
              onClick={() => setDisplayMode('cfitness_tablet')}
              className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 cursor-pointer transition-colors ${
                displayMode === 'cfitness_tablet'
                  ? 'bg-violet-600 text-white shadow-2xs'
                  : isDark
                  ? 'text-slate-400 hover:text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Tablet className="w-3.5 h-3.5" />
              <span>Mode Tablette (iPad)</span>
            </button>
            <button
              type="button"
              onClick={() => setDisplayMode('hr_collaborator')}
              className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 cursor-pointer transition-colors ${
                displayMode === 'hr_collaborator'
                  ? 'bg-violet-600 text-white shadow-2xs'
                  : isDark
                  ? 'text-slate-400 hover:text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>Espace RH &amp; Congés</span>
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Night Mode & Display Color Switcher on Mobile/Tablet Shell */}
          <ThemeColorControl variant="full" />

          <select
            aria-label="Choisir le collaborateur"
            value={activeEmp.id}
            onChange={(e) => setSelectedEmpId(e.target.value)}
            className={`text-xs font-bold px-3 py-2 rounded-xl border min-h-[38px] cursor-pointer ${
              isDark
                ? 'bg-[#1A2033] border-slate-700 text-white'
                : 'bg-slate-50 border-slate-200 text-slate-900'
            }`}
          >
            {fieldEmployees.map((e) => (
              <option key={e.id} value={e.id}>
                {e.firstName} {e.lastName} ({e.clubId === 'carre-de-soie' ? 'Center' : 'Place'})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Feedback Banner */}
      {mobileFeedback && (
        <div className="w-full max-w-5xl mb-4 p-3 rounded-2xl bg-emerald-600 text-white text-xs font-bold flex items-center justify-between shadow-md">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            {mobileFeedback}
          </span>
          <button
            type="button"
            onClick={() => setMobileFeedback(null)}
            className="underline text-[11px] cursor-pointer"
          >
            Fermer
          </button>
        </div>
      )}

      {/* =====================================================================
          MODE 1 : TÉLÉPHONES INTERACTIFS C.FITNESS OS
          Chaque téléphone dispose des 4 onglets actifs : Accueil, Planning, Adhérents, Plus
         ===================================================================== */}
      {displayMode === 'cfitness_mobile_duo' && (
        <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-6 items-start justify-items-center pb-8">
          {/* SMARTPHONE 1 */}
          <div
            className={`w-full max-w-[385px] min-h-[690px] rounded-[38px] border-[6px] shadow-2xl overflow-hidden flex flex-col justify-between transition-colors ${
              isDark
                ? 'bg-[#111522] border-slate-800 text-white'
                : 'bg-white border-slate-800 text-slate-900'
            }`}
          >
            {/* Status Bar + Compact Theme/Color Button inside Phone */}
            <div className="px-5 pt-3 pb-1.5 flex items-center justify-between text-[11px] font-bold">
              <span className="opacity-80">9:41</span>
              <ThemeColorControl variant="compact" />
              <span className="opacity-80">5G · 100%</span>
            </div>

            {renderPhoneContent(phone1Tab, setPhone1Tab)}
            {renderPhoneBottomBar(phone1Tab, setPhone1Tab)}
          </div>

          {/* SMARTPHONE 2 */}
          <div
            className={`w-full max-w-[385px] min-h-[690px] rounded-[38px] border-[6px] shadow-2xl overflow-hidden flex flex-col justify-between relative transition-colors ${
              isDark
                ? 'bg-[#111522] border-slate-800 text-white'
                : 'bg-white border-slate-800 text-slate-900'
            }`}
          >
            {/* Status Bar + Compact Theme/Color Button inside Phone */}
            <div className="px-5 pt-3 pb-1.5 flex items-center justify-between text-[11px] font-bold">
              <span className="opacity-80">9:41</span>
              <ThemeColorControl variant="compact" />
              <span className="opacity-80">5G · 100%</span>
            </div>

            {renderPhoneContent(phone2Tab, setPhone2Tab)}
            {renderPhoneBottomBar(phone2Tab, setPhone2Tab)}
          </div>
        </div>
      )}

      {/* =====================================================================
          MODE 2 : TABLETTE IPAD INTERACTIVE (TOUS LES MODULES ACTIFS)
          Correspond à la Tablette de la 2e image de référence avec barre latérale
         ===================================================================== */}
      {displayMode === 'cfitness_tablet' && (
        <div
          className={`w-full max-w-6xl rounded-[32px] border-[8px] shadow-2xl overflow-hidden flex flex-col transition-colors ${
            isDark
              ? 'bg-[#0B0E17] border-slate-800 text-slate-100'
              : 'bg-[#F6F7FB] border-slate-800 text-slate-900'
          }`}
        >
          {/* iPad Status Bar */}
          <div
            className={`px-6 py-2 border-b flex items-center justify-between text-xs font-bold ${
              isDark ? 'bg-[#111522] border-slate-800' : 'bg-white border-slate-200'
            }`}
          >
            <span>9:41 · Lun. 14 avr. · iPad Pro C.Fitness OS</span>
            <div className="flex items-center gap-3">
              <ThemeColorControl variant="compact" />
              <button
                type="button"
                onClick={() => setShellMode('tablette')}
                className="px-2.5 py-1 rounded-lg bg-violet-600 text-white text-[11px] font-bold cursor-pointer"
              >
                Ouvrir Borne Kiosque PIN
              </button>
              <button
                type="button"
                onClick={() => setShellMode('telephone')}
                className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white text-[11px] font-bold flex items-center gap-1 cursor-pointer"
              >
                <PhoneCall className="w-3 h-3" />
                <span>Softphone</span>
              </button>
            </div>
          </div>

          <div className="flex flex-col md:flex-row min-h-[720px]">
            {/* Tablet Left Navigation Sidebar */}
            <aside
              className={`w-full md:w-56 border-b md:border-b-0 md:border-r p-3 flex flex-col justify-between shrink-0 ${
                isDark ? 'bg-[#111522] border-slate-800' : 'bg-white border-slate-200'
              }`}
            >
              <div className="space-y-1">
                <div className="px-2 py-2 flex items-center gap-2.5 mb-1">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-violet-600 to-blue-500 flex items-center justify-center font-black text-white text-sm">
                    C
                  </div>
                  <div>
                    <div className="font-extrabold text-xs">C.Fitness OS</div>
                    <div className="text-[10px] text-slate-400">Tablette Bi-Club</div>
                  </div>
                </div>

                {/* Club Filter on Tablet */}
                <div className="grid grid-cols-3 gap-1 pb-2">
                  {(
                    [
                      { id: 'all', label: '2 Clubs' },
                      { id: 'carre-de-soie', label: 'Center' },
                      { id: 'beynost', label: 'Place' },
                    ] as const
                  ).map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setClubFilter(c.id)}
                      className={`py-1 rounded-lg text-[10px] font-bold cursor-pointer ${
                        clubFilter === c.id
                          ? 'bg-violet-600 text-white'
                          : isDark
                          ? 'bg-slate-800 text-slate-300'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>

                {[
                  {
                    id: 'dashboard',
                    sub: undefined,
                    label: 'Tableau de bord',
                    icon: Home,
                  },
                  {
                    id: 'devices',
                    sub: 'adherents',
                    label: 'Adhérents & Accès',
                    icon: Users,
                  },
                  { id: 'crm', sub: undefined, label: 'CRM & Ventes', icon: TrendingUp },
                  {
                    id: 'planning-hr',
                    sub: 'planning',
                    label: 'Planning RH',
                    icon: Calendar,
                  },
                  {
                    id: 'planning-hr',
                    sub: 'cours-collectifs',
                    label: 'Cours collectifs',
                    icon: Activity,
                  },
                  { id: 'my-day', sub: undefined, label: 'Personnel', icon: Users },
                  {
                    id: 'devices',
                    sub: 'finances',
                    label: 'Finances & SEPA',
                    icon: Euro,
                  },
                  {
                    id: 'orchestrator',
                    sub: 'maintenance',
                    label: 'Maintenance',
                    icon: Wrench,
                  },
                  {
                    id: 'orchestrator',
                    sub: 'stocks',
                    label: 'Stock & Achats',
                    icon: Package,
                  },
                  { id: 'telephony', sub: undefined, label: 'Marketing', icon: Megaphone },
                  { id: 'ats', sub: 'documents', label: 'Documents', icon: FileText },
                  { id: 'academy', sub: 'rapports', label: 'Rapports', icon: BarChart3 },
                  {
                    id: 'orchestrator',
                    sub: 'agents',
                    label: 'Agents IA',
                    icon: Sparkles,
                  },
                  {
                    id: 'governance',
                    sub: undefined,
                    label: 'Paramètres · Mon Espace',
                    icon: Settings,
                  },
                ].map((item) => {
                  const Icon = item.icon;
                  const isSelected =
                    activeSection === item.id &&
                    (item.sub ? navSubTarget === item.sub : !navSubTarget);
                  return (
                    <button
                      key={`${item.id}-${item.sub || 'main'}`}
                      type="button"
                      onClick={() => setActiveSection(item.id as AdminSection, item.sub)}
                      className={`w-full px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2.5 cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-violet-600 text-white'
                          : isDark
                          ? 'text-slate-300 hover:bg-slate-800'
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{item.label}</span>
                    </button>
                  );
                })}
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-violet-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                  TC
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold truncate">Thomas CLAUDE</div>
                  <div className="text-[10px] text-slate-400 truncate">Directeur Général</div>
                </div>
              </div>
            </aside>

            {/* Tablet Main Active Module Content */}
            <main className="flex-1 p-4 overflow-y-auto max-h-[760px]">
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
        </div>
      )}

      {/* =====================================================================
          MODE 3 : ESPACE RH COLLABORATEUR & GRILLE SKELLO (6 ONGLETS)
         ===================================================================== */}
      {displayMode === 'hr_collaborator' && (
        <div
          className={`w-full ${
            viewLayout === 'mobile' ? 'max-w-md' : 'max-w-5xl'
          } min-h-[760px] rounded-3xl border shadow-xl flex flex-col justify-between overflow-hidden transition-all duration-200 ${
            isDark
              ? 'bg-[#131826] text-slate-100 border-slate-800'
              : 'bg-white text-slate-900 border-slate-300'
          }`}
        >
          <div className="bg-slate-900 text-white px-4 py-2.5 flex items-center justify-between text-xs">
            <span className="font-bold">
              Espace Collaborateur : {activeEmp.firstName} {activeEmp.lastName} (PIN :{' '}
              {activeEmp.pinCode})
            </span>
            <button
              type="button"
              onClick={() => setViewLayout((prev) => (prev === 'mobile' ? 'wide' : 'mobile'))}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 cursor-pointer"
            >
              {viewLayout === 'mobile' ? 'Passer en Grille Large' : 'Passer en Format Téléphone'}
            </button>
          </div>

          <main className="flex-1 p-4 sm:p-5 space-y-4 overflow-y-auto">
            {toastMsg && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-900 flex items-center justify-between">
                <span>{toastMsg}</span>
                <button onClick={() => setToastMsg(null)} className="underline cursor-pointer">
                  OK
                </button>
              </div>
            )}

            {tab === 'DASHBOARD' && (
              <EmployeeDashboardGrid
                activeEmp={activeEmp}
                onNavigateTab={(targetTab) => setTab(targetTab)}
              />
            )}

            {tab === 'PLANNING' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-base font-bold text-slate-900">
                      Mon Planning de la Semaine
                    </h1>
                    <p className="text-xs text-slate-500">
                      Horaires prévisionnels conformes IDCC 2511
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setTab('DASHBOARD')}
                    className="text-xs font-semibold text-violet-600 underline cursor-pointer"
                  >
                    ← Retour Dashboard
                  </button>
                </div>

                {myShifts.map((s) => (
                  <div
                    key={s.id}
                    className="p-4 rounded-xl border border-slate-200 bg-white flex items-center justify-between text-xs shadow-2xs"
                  >
                    <div>
                      <div className="font-bold text-slate-900">{s.date}</div>
                      <div className="text-slate-600 mt-0.5">
                        {s.roleLabel} · Club{' '}
                        {s.clubId === 'carre-de-soie' ? 'Carré de Soie' : 'Beynost'}
                      </div>
                    </div>
                    <div className="text-right font-mono tabular-nums shrink-0">
                      <div className="font-bold text-sm text-violet-600">
                        {s.startTime} – {s.endTime}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Pause {s.breakMinutes} min
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {tab === 'CONGES' && (
              <div className="space-y-4">
                <form
                  onSubmit={handleLeaveSubmit}
                  className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 text-xs"
                >
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Type d&apos;absence
                    </label>
                    <select
                      value={leaveType}
                      onChange={(e) => setLeaveType(e.target.value as LeaveRequest['type'])}
                      className="w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-white min-h-[44px]"
                    >
                      <option value="CP">Congés Payés (CP)</option>
                      <option value="RTT">Récupération / RTT</option>
                      <option value="Formation CFA">Semaine École CFA / BPJEPS</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Début</label>
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full px-2.5 py-2 rounded-lg border border-slate-200 bg-white min-h-[44px]"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Fin</label>
                      <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full px-2.5 py-2 rounded-lg border border-slate-200 bg-white min-h-[44px]"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Nombre de jours ouvrés
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={30}
                      value={daysCount}
                      onChange={(e) => setDaysCount(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white min-h-[44px]"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full min-h-[46px] rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    Envoyer ma demande
                  </button>
                </form>

                <div className="space-y-2">
                  {myLeaves.map((lv) => (
                    <div
                      key={lv.id}
                      className="p-3.5 rounded-xl border border-slate-200 bg-white flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-bold text-slate-900">
                          {lv.type} · {lv.startDate} → {lv.endDate}
                        </div>
                        <div className="text-slate-500">{lv.daysCount} jour(s)</div>
                      </div>
                      <span className="font-bold text-violet-600">
                        {formatLeaveStatus(lv.status)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {tab === 'DOCS' && (
              <div className="space-y-3">
                {myDocs.map((doc) => {
                  const isSigned = doc.signedStatus !== 'En attente signature';
                  return (
                    <div
                      key={doc.id}
                      className="p-4 rounded-xl border border-slate-200 bg-white space-y-3 text-xs"
                    >
                      <div>
                        <div className="font-bold text-slate-900">{doc.title}</div>
                        <div className="text-slate-500 mt-0.5">
                          Catégorie : {doc.category} · Émis le {doc.uploadedAt}
                        </div>
                      </div>
                      {isSigned ? (
                        <div className="text-emerald-700 font-bold flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>{doc.signedStatus}</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            signDocumentWithInternalProof({
                              docId: doc.id,
                              otpInput: activeEmp.pinCode.padEnd(6, '42'),
                              consentChecked: true,
                              consentPhrase:
                                'Lu et approuvé, bon pour accord depuis mon espace personnel C.Fitness OS',
                            });
                            setToastMsg('Signé avec preuve SHA-256 (0 €) !');
                          }}
                          className="w-full min-h-[44px] rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <FileSignature className="w-4 h-4" />
                          Signer (OTP + Preuve SHA-256 · 0 €)
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {tab === 'ACADEMIE' && (
              <div className="space-y-2.5">
                {trainingModules.map((mod) => {
                  const done = moduleProgress.some(
                    (mp) =>
                      mp.moduleId === mod.id &&
                      mp.employeeId === activeEmp.id &&
                      mp.completed
                  );
                  return (
                    <div
                      key={mod.id}
                      className="p-3.5 rounded-xl border border-slate-200 bg-white flex items-center justify-between gap-3 text-xs"
                    >
                      <div>
                        <div className="font-mono font-bold text-violet-600">
                          {mod.code} · {mod.durationMin} min
                        </div>
                        <div className="font-bold text-slate-900">{mod.title}</div>
                      </div>
                      {done ? (
                        <span className="text-emerald-700 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4" />
                          Validé
                        </span>
                      ) : (
                        <button
                          onClick={() => {
                            completeAcademyQuiz(activeEmp.id, mod.id, mod.quizCorrectIndex);
                            setToastMsg(`Module ${mod.code} validé !`);
                          }}
                          className="min-h-[40px] px-3 rounded-lg bg-violet-600 text-white font-semibold cursor-pointer"
                        >
                          Valider Quiz
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {tab === 'CHECKLIST' && (
              <div className="space-y-2.5">
                {myChecklist.map((c) => {
                  const completed = Boolean(c.checkedBy);
                  return (
                    <button
                      key={c.id}
                      onClick={() => toggleChecklistItem(c.id)}
                      className="w-full p-3.5 rounded-xl border border-slate-200 bg-white flex items-center justify-between gap-3 text-left text-xs cursor-pointer"
                    >
                      <div>
                        <div
                          className={`font-bold ${
                            completed ? 'line-through text-slate-400' : 'text-slate-900'
                          }`}
                        >
                          {c.label}
                        </div>
                        <div className="text-[11px] text-slate-500">{c.shiftType}</div>
                      </div>
                      <CheckCircle2
                        className={`w-5 h-5 ${
                          completed ? 'text-emerald-600' : 'text-slate-300'
                        }`}
                      />
                    </button>
                  );
                })}
              </div>
            )}
          </main>

          <nav
            className={`border-t grid grid-cols-6 px-1 py-1.5 shrink-0 ${
              isDark ? 'bg-[#111522] border-slate-800' : 'bg-white border-slate-200'
            }`}
          >
            {[
              { id: 'DASHBOARD', label: 'Dashboard', icon: LayoutDashboard },
              { id: 'PLANNING', label: 'Planning', icon: Calendar },
              { id: 'CONGES', label: 'Congés', icon: Plus },
              { id: 'DOCS', label: 'Coffre RH', icon: FileText },
              { id: 'ACADEMIE', label: 'Académie', icon: GraduationCap },
              { id: 'CHECKLIST', label: 'Checklist', icon: CheckSquare },
            ].map((item) => {
              const Icon = item.icon;
              const active = tab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setTab(item.id as typeof tab)}
                  className={`min-h-[48px] flex flex-col items-center justify-center rounded-xl text-[10px] font-semibold cursor-pointer ${
                    active ? 'text-violet-600 bg-violet-50 font-bold' : 'text-slate-500'
                  }`}
                >
                  <Icon className="w-4 h-4 mb-0.5" />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      )}
    </div>
  );
}
