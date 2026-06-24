import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../integrations/supabase/client';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { format } from 'date-fns';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell
} from 'recharts';
import {
  LogOut, Users, LayoutDashboard, Search, Bell, Menu,
  X, ChevronRight, MapPin, ChevronDown, Clock,
  CheckCircle, Eye, BarChart3, FileText, BookOpen, CloudRain,
  UserPlus, UserCheck, MessageSquare, ArrowUpRight, Settings,
  Trash2, Edit3, Phone, Mail, Globe, Award, AlertTriangle,
  ThermometerSun, Droplets, Sun, CloudLightning, Leaf,
  GraduationCap, Send, XCircle, Shield, Star, Languages
} from 'lucide-react';

// ─── TYPES ───
type Tab = 'overview' | 'experts' | 'farmers' | 'requests' | 'reports' | 'analytics' | 'learning' | 'weather' | 'notifications' | 'profile';

interface Expert {
  id: string;
  name: string;
  specialty: string;
  languages: string[];
  zone: string;
  phone: string;
  email: string;
  status: 'active' | 'inactive';
  ticketsResolved: number;
  rating: number;
  avatar: string;
  joinedDate: string;
}

interface Farmer {
  id: string;
  name: string;
  zone: string;
  woreda: string;
  crops: string[];
  phone: string;
  language: string;
  status: 'active' | 'verified' | 'pending';
  farmSize: string;
  joinedDate: string;
}

interface FarmerRequest {
  id: string;
  farmerId: string;
  farmerName: string;
  zone: string;
  title: string;
  description: string;
  category: string;
  language: string;
  status: 'open' | 'assigned' | 'resolved';
  assignedExpert?: string;
  createdAt: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

interface LearningContent {
  id: string;
  title: string;
  type: 'video' | 'article' | 'guide';
  language: string;
  author: string;
  status: 'pending' | 'approved' | 'rejected';
  category: string;
  submittedAt: string;
}

// ─── REGION CONFIG ───
const regionConfig: Record<string, { name: string; language: string; flag: string; zones: string[] }> = {
  oromia: { name: 'Oromia', language: 'Afaan Oromoo', flag: '🟢', zones: ['West Shewa', 'East Shewa', 'Arsi', 'Bale', 'Jimma', 'Wellega', 'Hararghe', 'Borena', 'Guji', 'Illubabor'] },
  amhara: { name: 'Amhara', language: 'Amharic', flag: '🔵', zones: ['North Gondar', 'South Gondar', 'North Wollo', 'South Wollo', 'East Gojjam', 'West Gojjam', 'Awi', 'North Shewa'] },
  snnpr: { name: 'SNNPR', language: 'Multiple', flag: '🟡', zones: ['Sidama', 'Gedeo', 'Wolayta', 'Gurage', 'Hadiya', 'Kembata', 'Dawuro', 'Gamo'] },
  tigray: { name: 'Tigray', language: 'Tigrinya', flag: '🔴', zones: ['Central', 'Eastern', 'North Western', 'Southern', 'Western', 'Mekelle'] },
  sidama: { name: 'Sidama', language: 'Sidaamu Afoo', flag: '🟠', zones: ['Hawassa', 'Dale', 'Shebedino', 'Boricha', 'Malga', 'Arbegona'] },
  somali: { name: 'Somali', language: 'Somali', flag: '🔵', zones: ['Jigjiga', 'Shinile', 'Liben', 'Afder', 'Gode', 'Korahe'] },
  afar: { name: 'Afar', language: 'Afaraf', flag: '🟤', zones: ['Zone 1', 'Zone 2', 'Zone 3', 'Zone 4', 'Zone 5'] },
};

// ─── MOCK DATA ───
const getMockExperts = (region: string): Expert[] => {
  const cfg = regionConfig[region] || regionConfig.oromia;
  const zones = cfg.zones;
  return [
    { id: 'E001', name: region === 'oromia' ? 'Dr. Chaltu Abera' : region === 'amhara' ? 'Dr. Yonas Alemu' : 'Dr. Kebede Getachew', specialty: 'Crop Disease', languages: [cfg.language, 'English'], zone: zones[0], phone: '+251911234567', email: 'expert1@agribridge.et', status: 'active', ticketsResolved: 145, rating: 4.8, avatar: 'CA', joinedDate: '2025-03-15' },
    { id: 'E002', name: region === 'oromia' ? 'Obbo Daadhii Tasfaa' : region === 'amhara' ? 'Ato Bekele Tadesse' : 'Ato Mekonnen Haile', specialty: 'Soil Science', languages: [cfg.language], zone: zones[1], phone: '+251922345678', email: 'expert2@agribridge.et', status: 'active', ticketsResolved: 98, rating: 4.5, avatar: 'DT', joinedDate: '2025-06-20' },
    { id: 'E003', name: region === 'oromia' ? 'Aadde Biiftu Lammii' : region === 'amhara' ? 'W/ro Tigist Bekele' : 'W/ro Selamawit Gebre', specialty: 'Livestock', languages: [cfg.language, 'Amharic'], zone: zones[2], phone: '+251933456789', email: 'expert3@agribridge.et', status: 'active', ticketsResolved: 72, rating: 4.6, avatar: 'BL', joinedDate: '2025-09-10' },
    { id: 'E004', name: region === 'oromia' ? 'Dr. Gammachuu Baqqalaa' : region === 'amhara' ? 'Dr. Abebaw Mulatu' : 'Dr. Tesfaye Abebe', specialty: 'Agronomy', languages: [cfg.language, 'English', 'Amharic'], zone: zones[3] || zones[0], phone: '+251944567890', email: 'expert4@agribridge.et', status: 'inactive', ticketsResolved: 210, rating: 4.9, avatar: 'GB', joinedDate: '2024-11-05' },
    { id: 'E005', name: region === 'oromia' ? 'Obbo Tashoomaa Guutaa' : region === 'amhara' ? 'Ato Dereje Feyissa' : 'Ato Solomon Desta', specialty: 'Irrigation', languages: [cfg.language], zone: zones[4] || zones[1], phone: '+251955678901', email: 'expert5@agribridge.et', status: 'active', ticketsResolved: 56, rating: 4.3, avatar: 'TG', joinedDate: '2026-01-18' },
  ];
};

const getMockFarmers = (region: string): Farmer[] => {
  const cfg = regionConfig[region] || regionConfig.oromia;
  const zones = cfg.zones;
  return [
    { id: 'F001', name: region === 'oromia' ? 'Abbaa Bokkuu Hundee' : 'Abebe Kebede', zone: zones[0], woreda: 'Ambo', crops: ['Teff', 'Wheat'], phone: '+251911111111', language: cfg.language, status: 'verified', farmSize: '2.5 ha', joinedDate: '2025-01-10' },
    { id: 'F002', name: region === 'oromia' ? 'Aadde Caaltuu Dabalaa' : 'Almaz Tadesse', zone: zones[1], woreda: 'Adama', crops: ['Maize', 'Sorghum'], phone: '+251922222222', language: cfg.language, status: 'active', farmSize: '1.8 ha', joinedDate: '2025-03-22' },
    { id: 'F003', name: region === 'oromia' ? 'Obbo Fayyisaa Galaan' : 'Ato Girma Tesfaye', zone: zones[2], woreda: 'Asella', crops: ['Barley', 'Teff'], phone: '+251933333333', language: cfg.language, status: 'verified', farmSize: '3.2 ha', joinedDate: '2025-05-15' },
    { id: 'F004', name: region === 'oromia' ? 'Aadde Lalistu Guddataa' : 'W/ro Hiwot Alemu', zone: zones[0], woreda: 'Holeta', crops: ['Vegetables', 'Potato'], phone: '+251944444444', language: cfg.language, status: 'pending', farmSize: '0.5 ha', joinedDate: '2026-06-01' },
    { id: 'F005', name: region === 'oromia' ? 'Obbo Gammadaa Bultii' : 'Ato Kassahun Worku', zone: zones[3] || zones[0], woreda: 'Robe', crops: ['Coffee'], phone: '+251955555555', language: cfg.language, status: 'verified', farmSize: '4.0 ha', joinedDate: '2025-08-30' },
    { id: 'F006', name: region === 'oromia' ? 'Abbaa Gadaa Turaa' : 'Ato Lemma Megersa', zone: zones[1], woreda: 'Bishoftu', crops: ['Teff', 'Chickpea'], phone: '+251966666666', language: cfg.language, status: 'active', farmSize: '2.0 ha', joinedDate: '2025-11-12' },
    { id: 'F007', name: region === 'oromia' ? 'Aadde Urjii Baatii' : 'W/ro Meseret Gebre', zone: zones[4] || zones[0], woreda: 'Jimma', crops: ['Coffee', 'Spices'], phone: '+251977777777', language: cfg.language, status: 'verified', farmSize: '5.5 ha', joinedDate: '2025-02-14' },
    { id: 'F008', name: region === 'oromia' ? 'Obbo Hundumaa Tolasaa' : 'Ato Negash Tefera', zone: zones[2], woreda: 'Nekemte', crops: ['Maize', 'Niger Seed'], phone: '+251988888888', language: cfg.language, status: 'active', farmSize: '3.0 ha', joinedDate: '2025-07-19' },
  ];
};

const getMockRequests = (region: string): FarmerRequest[] => {
  const cfg = regionConfig[region] || regionConfig.oromia;
  return [
    { id: 'REQ-001', farmerId: 'F001', farmerName: region === 'oromia' ? 'Abbaa Bokkuu Hundee' : 'Abebe Kebede', zone: cfg.zones[0], title: region === 'oromia' ? 'Baalli qamadii koo boorateera' : 'My wheat leaves are yellowing', description: 'The lower leaves of my wheat field are turning yellow despite recent fertilizer application. Need expert advice.', category: 'Crop Disease', language: cfg.language, status: 'open', createdAt: '2026-06-28T10:30:00', priority: 'high' },
    { id: 'REQ-002', farmerId: 'F002', farmerName: region === 'oromia' ? 'Aadde Caaltuu Dabalaa' : 'Almaz Tadesse', zone: cfg.zones[1], title: region === 'oromia' ? 'Bishaan jallisii ga\'aa hin qabu' : 'Insufficient irrigation water', description: 'My irrigation canal is not receiving enough water for my maize field during the critical growth stage.', category: 'Irrigation', language: cfg.language, status: 'assigned', assignedExpert: 'E005', createdAt: '2026-06-27T08:15:00', priority: 'urgent' },
    { id: 'REQ-003', farmerId: 'F005', farmerName: region === 'oromia' ? 'Obbo Gammadaa Bultii' : 'Ato Kassahun Worku', zone: cfg.zones[3] || cfg.zones[0], title: region === 'oromia' ? 'Dhibeen bunaa (CBD) mul\'ateera' : 'Coffee Berry Disease spotted', description: 'Dark spots appearing on coffee berries. Need immediate identification and treatment recommendation.', category: 'Crop Disease', language: cfg.language, status: 'open', createdAt: '2026-06-28T14:00:00', priority: 'urgent' },
    { id: 'REQ-004', farmerId: 'F003', farmerName: region === 'oromia' ? 'Obbo Fayyisaa Galaan' : 'Ato Girma Tesfaye', zone: cfg.zones[2], title: region === 'oromia' ? 'Biyyeen lafa koo qoratamuu qaba' : 'Soil testing needed', description: 'I want to get my soil tested before the next planting season. Which nutrients should I focus on?', category: 'Soil Science', language: cfg.language, status: 'resolved', assignedExpert: 'E002', createdAt: '2026-06-25T09:00:00', priority: 'medium' },
    { id: 'REQ-005', farmerId: 'F007', farmerName: region === 'oromia' ? 'Aadde Urjii Baatii' : 'W/ro Meseret Gebre', zone: cfg.zones[4] || cfg.zones[0], title: region === 'oromia' ? 'Yeroo xaa\'oo itti fayyadamuuf gaarii' : 'Best time for fertilizer', description: 'When is the optimal time to apply DAP fertilizer for teff in my area?', category: 'Agronomy', language: cfg.language, status: 'assigned', assignedExpert: 'E004', createdAt: '2026-06-26T11:45:00', priority: 'low' },
    { id: 'REQ-006', farmerId: 'F006', farmerName: region === 'oromia' ? 'Abbaa Gadaa Turaa' : 'Ato Lemma Megersa', zone: cfg.zones[1], title: region === 'oromia' ? 'Beelladni koo dhukkubsateera' : 'My livestock is sick', description: 'Two of my cattle are showing signs of illness - loss of appetite and lethargy. Need veterinary advice.', category: 'Livestock', language: cfg.language, status: 'open', createdAt: '2026-06-29T07:30:00', priority: 'high' },
  ];
};

const mockLearning: LearningContent[] = [
  { id: 'L001', title: 'Modern Teff Farming Techniques', type: 'video', language: 'Afaan Oromoo', author: 'Dr. Chaltu Abera', status: 'pending', category: 'Crop Production', submittedAt: '2026-06-25' },
  { id: 'L002', title: 'Soil Conservation Methods', type: 'guide', language: 'Amharic', author: 'Obbo Daadhii Tasfaa', status: 'approved', category: 'Soil Management', submittedAt: '2026-06-20' },
  { id: 'L003', title: 'Coffee Processing Best Practices', type: 'article', language: 'Afaan Oromoo', author: 'Dr. Gammachuu Baqqalaa', status: 'pending', category: 'Post-Harvest', submittedAt: '2026-06-27' },
  { id: 'L004', title: 'Irrigation Scheduling Guide', type: 'guide', language: 'English', author: 'Obbo Tashoomaa Guutaa', status: 'approved', category: 'Irrigation', submittedAt: '2026-06-18' },
  { id: 'L005', title: 'Pest Control Without Chemicals', type: 'video', language: 'Afaan Oromoo', author: 'Aadde Biiftu Lammii', status: 'rejected', category: 'Pest Management', submittedAt: '2026-06-22' },
];

const farmerGrowthData = [
  { name: 'Jan', farmers: 1200, experts: 8 },
  { name: 'Feb', farmers: 1450, experts: 10 },
  { name: 'Mar', farmers: 1800, experts: 12 },
  { name: 'Apr', farmers: 2300, experts: 14 },
  { name: 'May', farmers: 2900, experts: 16 },
  { name: 'Jun', farmers: 3500, experts: 18 },
];

const cropDistribution = [
  { name: 'Teff', value: 35 },
  { name: 'Coffee', value: 25 },
  { name: 'Maize', value: 20 },
  { name: 'Wheat', value: 12 },
  { name: 'Other', value: 8 },
];
const PIE_COLORS = ['#2E7D32', '#F4A000', '#4CAF50', '#1B5E20', '#64748b'];

const requestsByCategoryData = [
  { name: 'Crop Disease', count: 42 },
  { name: 'Soil Science', count: 28 },
  { name: 'Irrigation', count: 22 },
  { name: 'Livestock', count: 18 },
  { name: 'Agronomy', count: 15 },
];

const weatherData = [
  { zone: 'West Shewa', temp: 24, humidity: 65, rainfall: 85, condition: 'Rainy', icon: CloudRain, alert: null },
  { zone: 'East Shewa', temp: 28, humidity: 45, rainfall: 20, condition: 'Sunny', icon: Sun, alert: null },
  { zone: 'Arsi', temp: 18, humidity: 80, rainfall: 120, condition: 'Heavy Rain', icon: CloudLightning, alert: 'Flood Warning' },
  { zone: 'Jimma', temp: 22, humidity: 72, rainfall: 95, condition: 'Rainy', icon: CloudRain, alert: null },
  { zone: 'Wellega', temp: 26, humidity: 55, rainfall: 40, condition: 'Partly Cloudy', icon: Sun, alert: null },
  { zone: 'Borena', temp: 32, humidity: 25, rainfall: 5, condition: 'Hot & Dry', icon: ThermometerSun, alert: 'Drought Warning' },
];

// ─── HELPERS ───
const priorityConfig = {
  low: { color: 'text-slate-600', bg: 'bg-slate-50 border-slate-200' },
  medium: { color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200' },
  high: { color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200' },
  urgent: { color: 'text-red-600', bg: 'bg-red-50 border-red-200' },
};

const requestStatusConfig = {
  open: { color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200', label: 'Open' },
  assigned: { color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200', label: 'Assigned' },
  resolved: { color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200', label: 'Resolved' },
};


export default function RegionalDashboard() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const region = searchParams.get('region') || 'oromia';
  const cfg = regionConfig[region] || regionConfig.oromia;

  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddExpert, setShowAddExpert] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState<FarmerRequest | null>(null);
  const [zoneFilter, setZoneFilter] = useState('All');
  const [expertForm, setExpertForm] = useState({ name: '', specialty: '', phone: '', email: '', zone: cfg.zones[0], languages: [cfg.language] });

  // Supabase queries
  const { data: announcements } = useQuery({
    queryKey: ['announcements'],
    queryFn: async () => {
      const { data, error } = await supabase.from('announcements').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    }
  });

  const experts = getMockExperts(region);
  const farmers = getMockFarmers(region);
  const requests = getMockRequests(region);

  // Filter logic
  const filteredExperts = useMemo(() => {
    return experts.filter(e => {
      const matchesSearch = e.name.toLowerCase().includes(searchQuery.toLowerCase()) || e.specialty.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesZone = zoneFilter === 'All' || e.zone === zoneFilter;
      return matchesSearch && matchesZone;
    });
  }, [searchQuery, zoneFilter, experts]);

  const filteredFarmers = useMemo(() => {
    return farmers.filter(f => {
      const matchesSearch = f.name.toLowerCase().includes(searchQuery.toLowerCase()) || f.crops.some(c => c.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesZone = zoneFilter === 'All' || f.zone === zoneFilter;
      return matchesSearch && matchesZone;
    });
  }, [searchQuery, zoneFilter, farmers]);

  // Stats
  const openRequests = requests.filter(r => r.status === 'open').length;
  const urgentRequests = requests.filter(r => r.priority === 'urgent').length;

  // ─── SIDEBAR NAV ───
  const navItems: { id: Tab; label: string; icon: any; badge?: string }[] = [
    { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'experts', label: 'Experts', icon: UserCheck },
    { id: 'farmers', label: 'Farmers', icon: Users },
    { id: 'requests', label: 'Requests', icon: MessageSquare, badge: `${openRequests}` },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'learning', label: 'Learning', icon: BookOpen, badge: `${mockLearning.filter(l => l.status === 'pending').length}` },
    { id: 'weather', label: 'Weather', icon: CloudRain },
    { id: 'notifications', label: 'Notifications', icon: Bell, badge: announcements?.length ? `${announcements.length}` : undefined },
    { id: 'profile', label: 'Profile', icon: Settings },
  ];

  const tabTitles: Record<Tab, { title: string; subtitle: string }> = {
    overview: { title: `${cfg.name} Region Dashboard`, subtitle: `Regional agriculture management overview` },
    experts: { title: 'Expert Management', subtitle: `Manage agricultural experts in ${cfg.name} region` },
    farmers: { title: 'Farmer Registry', subtitle: `All registered farmers in ${cfg.name}` },
    requests: { title: 'Farmer Requests', subtitle: 'Review and assign farmer inquiries to experts' },
    reports: { title: 'Regional Reports', subtitle: 'Generate and view agricultural reports' },
    analytics: { title: 'Analytics & Insights', subtitle: `Data-driven insights for ${cfg.name} region` },
    learning: { title: 'Learning Content', subtitle: 'Review and approve educational materials' },
    weather: { title: 'Weather Intelligence', subtitle: `Zone-by-zone weather data for ${cfg.name}` },
    notifications: { title: 'Notifications', subtitle: 'Platform alerts and announcements' },
    profile: { title: 'Profile & Settings', subtitle: 'Manage your regional manager account' },
  };

  // ════════════════════════════════
  // OVERVIEW
  // ════════════════════════════════
  const renderOverview = () => (
    <div className="space-y-6">
      {/* Alert Banner */}
      {urgentRequests > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center gap-4">
          <div className="p-3 bg-red-100 rounded-xl text-red-600"><AlertTriangle size={22} /></div>
          <div className="flex-1">
            <p className="font-bold text-red-800">{urgentRequests} Urgent Request{urgentRequests > 1 ? 's' : ''} Pending</p>
            <p className="text-sm text-red-600">Farmers need immediate assistance. Please review and assign experts.</p>
          </div>
          <button onClick={() => setActiveTab('requests')} className="px-4 py-2 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-colors text-sm">
            Review Now
          </button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {[
          { label: 'Total Farmers', value: '3,500', icon: Users, change: '+320 this month', color: 'from-emerald-500 to-green-600' },
          { label: 'Active Experts', value: `${experts.filter(e => e.status === 'active').length}`, icon: UserCheck, change: `${cfg.zones.length} zones covered`, color: 'from-blue-500 to-indigo-600' },
          { label: 'Open Requests', value: `${openRequests}`, icon: MessageSquare, change: `${urgentRequests} urgent`, color: 'from-amber-500 to-orange-500' },
          { label: 'Resolved (Monthly)', value: '142', icon: CheckCircle, change: '92% satisfaction', color: 'from-purple-500 to-violet-600' },
        ].map((stat, i) => (
          <div key={i} className="relative overflow-hidden bg-card rounded-2xl border border-border p-6 hover:shadow-lg transition-all duration-300 group">
            <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${stat.color} opacity-[0.08] rounded-bl-[60px] group-hover:opacity-[0.15] transition-opacity`} />
            <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${stat.color} text-white mb-4 shadow-lg`}>
              <stat.icon size={22} />
            </div>
            <p className="text-sm text-muted-foreground font-medium">{stat.label}</p>
            <h3 className="text-2xl font-display font-bold text-foreground mt-1">{stat.value}</h3>
            <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
              <ArrowUpRight size={14} className="text-secondary" /> {stat.change}
            </p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-card rounded-2xl border border-border p-6">
          <h3 className="text-lg font-bold font-display mb-1">Farmer & Expert Growth</h3>
          <p className="text-sm text-muted-foreground mb-6">Monthly registration trends in {cfg.name}</p>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={farmerGrowthData}>
                <defs>
                  <linearGradient id="farmGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2E7D32" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#2E7D32" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 13 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 13 }} />
                <RechartsTooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 10px 30px rgba(0,0,0,0.08)' }} />
                <Area type="monotone" dataKey="farmers" stroke="#2E7D32" strokeWidth={3} fill="url(#farmGrad)" name="Farmers" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-card rounded-2xl border border-border p-6">
          <h3 className="text-lg font-bold font-display mb-1">Crop Distribution</h3>
          <p className="text-sm text-muted-foreground mb-4">What farmers are growing</p>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={cropDistribution} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={4} dataKey="value" stroke="none">
                  {cropDistribution.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {cropDistribution.map((c, i) => (
              <div key={i} className="flex items-center gap-2 text-sm">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: PIE_COLORS[i] }} />
                <span className="text-muted-foreground">{c.name}</span>
                <span className="font-bold ml-auto">{c.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Requests + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-2xl border border-border p-6">
          <div className="flex justify-between items-center mb-5">
            <h3 className="text-lg font-bold font-display">Recent Farmer Requests</h3>
            <button onClick={() => setActiveTab('requests')} className="text-sm text-primary font-semibold hover:underline flex items-center gap-1">View All <ChevronRight size={16} /></button>
          </div>
          <div className="space-y-3">
            {requests.slice(0, 4).map(req => {
              const sc = requestStatusConfig[req.status];
              const pc = priorityConfig[req.priority];
              return (
                <div key={req.id} className="flex items-start gap-3 p-3.5 rounded-xl bg-muted/40 hover:bg-muted/70 transition-colors">
                  <div className={`p-2 rounded-lg shrink-0 ${pc.bg} border`}><MessageSquare size={16} className={pc.color} /></div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-foreground truncate">{req.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{req.farmerName} • {req.zone}</p>
                  </div>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full border shrink-0 ${sc.bg} ${sc.color}`}>{sc.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-card rounded-2xl border border-border p-6">
          <h3 className="text-lg font-bold font-display mb-5">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Add Expert', icon: UserPlus, onClick: () => { setActiveTab('experts'); setShowAddExpert(true); }, color: 'bg-primary hover:bg-primary/90 text-white' },
              { label: 'View Requests', icon: MessageSquare, onClick: () => setActiveTab('requests'), color: 'bg-amber-500 hover:bg-amber-600 text-white' },
              { label: 'Weather Report', icon: CloudRain, onClick: () => setActiveTab('weather'), color: 'bg-blue-500 hover:bg-blue-600 text-white' },
              { label: 'Review Learning', icon: BookOpen, onClick: () => setActiveTab('learning'), color: 'bg-purple-500 hover:bg-purple-600 text-white' },
              { label: 'Farmer Stats', icon: BarChart3, onClick: () => setActiveTab('analytics'), color: 'bg-emerald-500 hover:bg-emerald-600 text-white' },
              { label: 'Generate Report', icon: FileText, onClick: () => setActiveTab('reports'), color: 'bg-indigo-500 hover:bg-indigo-600 text-white' },
            ].map((action, i) => (
              <button key={i} onClick={action.onClick} className={`flex items-center gap-3 p-4 rounded-xl font-semibold transition-all shadow-sm hover:shadow-md active:scale-[0.97] ${action.color}`}>
                <action.icon size={20} />
                <span className="text-sm">{action.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // ════════════════════════════════
  // EXPERTS
  // ════════════════════════════════
  const renderExperts = () => (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="flex gap-3 flex-wrap flex-1 w-full md:w-auto">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <input type="text" placeholder="Search experts..." className="w-full pl-10 pr-4 py-2.5 border border-border rounded-xl focus:border-primary outline-none transition-all" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
          </div>
          <div className="relative">
            <select className="pl-3 pr-8 py-2.5 border border-border rounded-xl focus:border-primary outline-none appearance-none font-medium cursor-pointer" value={zoneFilter} onChange={e => setZoneFilter(e.target.value)}>
              <option value="All">All Zones</option>
              {cfg.zones.map(z => <option key={z} value={z}>{z}</option>)}
            </select>
            <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          </div>
        </div>
        <button onClick={() => setShowAddExpert(true)} className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-all shadow-md shadow-primary/20 active:scale-[0.97]">
          <UserPlus size={18} /> Add New Expert
        </button>
      </div>

      {/* Expert Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filteredExperts.map(expert => (
          <div key={expert.id} className="bg-card rounded-2xl border border-border p-6 hover:shadow-lg transition-all duration-300 group">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold shadow-lg">
                  {expert.avatar}
                </div>
                <div>
                  <h3 className="font-bold text-foreground">{expert.name}</h3>
                  <p className="text-sm text-muted-foreground">{expert.specialty}</p>
                </div>
              </div>
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${expert.status === 'active' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-slate-100 text-slate-500 border border-slate-200'}`}>
                {expert.status === 'active' ? '● Active' : '○ Inactive'}
              </span>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin size={14} /> <span>{expert.zone}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Languages size={14} /> <span>{expert.languages.join(', ')}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Phone size={14} /> <span>{expert.phone}</span>
              </div>
            </div>

            <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/60">
              <div className="flex items-center gap-3">
                <div className="text-center">
                  <p className="text-lg font-bold text-primary">{expert.ticketsResolved}</p>
                  <p className="text-xs text-muted-foreground">Resolved</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-amber-500 flex items-center gap-1"><Star size={14} className="fill-amber-500" />{expert.rating}</p>
                  <p className="text-xs text-muted-foreground">Rating</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="p-2 rounded-xl border border-border hover:bg-muted transition-colors" title="Edit">
                  <Edit3 size={16} className="text-muted-foreground" />
                </button>
                <button className="p-2 rounded-xl border border-border hover:bg-red-50 hover:border-red-200 transition-colors" title="Remove">
                  <Trash2 size={16} className="text-red-400" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredExperts.length === 0 && (
        <div className="text-center py-16">
          <span className="text-5xl mb-4 block">👨‍🌾</span>
          <h3 className="text-xl font-bold">No experts found</h3>
          <p className="text-muted-foreground mt-2">Try adjusting your search or add new experts</p>
        </div>
      )}
    </div>
  );

  // ════════════════════════════════
  // FARMERS
  // ════════════════════════════════
  const renderFarmers = () => (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="flex gap-3 flex-wrap flex-1 w-full md:w-auto">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <input type="text" placeholder="Search farmers, crops..." className="w-full pl-10 pr-4 py-2.5 border border-border rounded-xl focus:border-primary outline-none transition-all" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
          </div>
          <div className="relative">
            <select className="pl-3 pr-8 py-2.5 border border-border rounded-xl focus:border-primary outline-none appearance-none font-medium cursor-pointer" value={zoneFilter} onChange={e => setZoneFilter(e.target.value)}>
              <option value="All">All Zones</option>
              {cfg.zones.map(z => <option key={z} value={z}>{z}</option>)}
            </select>
            <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          </div>
        </div>
        <p className="text-sm text-muted-foreground">Showing <span className="font-bold text-foreground">{filteredFarmers.length}</span> farmers</p>
      </div>

      <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-muted/70 border-b border-border">
                <th className="p-4 font-semibold text-muted-foreground text-sm">Farmer</th>
                <th className="p-4 font-semibold text-muted-foreground text-sm">Zone / Woreda</th>
                <th className="p-4 font-semibold text-muted-foreground text-sm">Crops</th>
                <th className="p-4 font-semibold text-muted-foreground text-sm">Farm Size</th>
                <th className="p-4 font-semibold text-muted-foreground text-sm">Language</th>
                <th className="p-4 font-semibold text-muted-foreground text-sm">Status</th>
                <th className="p-4 font-semibold text-muted-foreground text-sm">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredFarmers.map(f => (
                <tr key={f.id} className="hover:bg-muted/40 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                        {f.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{f.name}</p>
                        <p className="text-xs text-muted-foreground">{f.phone}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <p className="text-sm font-medium text-foreground">{f.zone}</p>
                    <p className="text-xs text-muted-foreground">{f.woreda}</p>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-1 flex-wrap">
                      {f.crops.map(c => (
                        <span key={c} className="text-xs font-semibold bg-primary/10 text-primary px-2 py-0.5 rounded-full">{c}</span>
                      ))}
                    </div>
                  </td>
                  <td className="p-4 text-sm font-medium text-foreground">{f.farmSize}</td>
                  <td className="p-4">
                    <span className="text-xs font-medium bg-accent/10 text-accent px-2 py-1 rounded-full flex items-center gap-1 w-fit">
                      <Globe size={12} /> {f.language}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full capitalize ${
                      f.status === 'verified' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' :
                      f.status === 'active' ? 'bg-blue-50 text-blue-600 border border-blue-200' :
                      'bg-amber-50 text-amber-600 border border-amber-200'
                    }`}>{f.status === 'verified' && '✓ '}{f.status}</span>
                  </td>
                  <td className="p-4 text-sm text-muted-foreground">{format(new Date(f.joinedDate), 'MMM d, yyyy')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // ════════════════════════════════
  // REQUESTS
  // ════════════════════════════════
  const renderRequests = () => (
    <div className="space-y-6">
      {/* Request Filter Pills */}
      <div className="flex gap-2 flex-wrap">
        {['all', 'open', 'assigned', 'resolved'].map(status => (
          <button key={status} className={`px-4 py-2 rounded-full text-sm font-semibold capitalize transition-all ${
            zoneFilter === status || (status === 'all' && zoneFilter === 'All')
              ? 'bg-primary text-white shadow-md' : 'bg-card border border-border text-muted-foreground hover:bg-muted'
          }`} onClick={() => setZoneFilter(status === 'all' ? 'All' : status)}>
            {status === 'all' ? `All Requests (${requests.length})` : `${status} (${requests.filter(r => r.status === status).length})`}
          </button>
        ))}
      </div>

      {/* Request Cards */}
      <div className="space-y-4">
        {requests.filter(r => zoneFilter === 'All' || r.status === zoneFilter).map(req => {
          const sc = requestStatusConfig[req.status];
          const pc = priorityConfig[req.priority];
          return (
            <div key={req.id} className="bg-card rounded-2xl border border-border p-6 hover:shadow-lg transition-all duration-300">
              <div className="flex flex-col md:flex-row md:items-start gap-5">
                <div className={`p-3 rounded-xl shrink-0 ${pc.bg} border`}>
                  <MessageSquare size={22} className={pc.color} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h3 className="font-bold text-foreground text-lg">{req.title}</h3>
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${sc.bg} ${sc.color}`}>{sc.label}</span>
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full border uppercase ${pc.bg} ${pc.color}`}>{req.priority}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{req.description}</p>
                  <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground flex-wrap">
                    <span className="flex items-center gap-1"><Users size={13} /> {req.farmerName}</span>
                    <span className="flex items-center gap-1"><MapPin size={13} /> {req.zone}</span>
                    <span className="flex items-center gap-1"><Globe size={13} /> {req.language}</span>
                    <span className="flex items-center gap-1"><Clock size={13} /> {format(new Date(req.createdAt), 'MMM d, h:mm a')}</span>
                    <span className="flex items-center gap-1"><Leaf size={13} /> {req.category}</span>
                  </div>
                  {req.assignedExpert && (
                    <div className="mt-3 flex items-center gap-2 text-sm">
                      <UserCheck size={15} className="text-primary" />
                      <span className="font-semibold text-primary">Assigned to: {experts.find(e => e.id === req.assignedExpert)?.name || req.assignedExpert}</span>
                    </div>
                  )}
                </div>
                <div className="flex gap-2 shrink-0">
                  {req.status === 'open' && (
                    <button onClick={() => setShowAssignModal(req)} className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-all shadow-md text-sm active:scale-[0.97]">
                      <Send size={16} /> Assign Expert
                    </button>
                  )}
                  {req.status === 'assigned' && (
                    <button className="flex items-center gap-2 px-4 py-2.5 border border-border text-foreground font-bold rounded-xl hover:bg-muted transition-all text-sm">
                      <Eye size={16} /> View Thread
                    </button>
                  )}
                  {req.status === 'resolved' && (
                    <span className="flex items-center gap-2 px-4 py-2.5 text-emerald-600 font-bold text-sm">
                      <CheckCircle size={16} /> Complete
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  // ════════════════════════════════
  // REPORTS
  // ════════════════════════════════
  const renderReports = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {[
          { title: 'Monthly Farmer Report', desc: 'Summary of farmer registrations, activity, and crop production', icon: Users, color: 'from-emerald-500 to-green-600', date: 'June 2026' },
          { title: 'Expert Performance', desc: 'Expert response times, satisfaction ratings, and ticket resolution', icon: UserCheck, color: 'from-blue-500 to-indigo-600', date: 'June 2026' },
          { title: 'Crop Production Forecast', desc: 'Estimated yields by zone based on weather and planting data', icon: Leaf, color: 'from-amber-500 to-orange-500', date: 'Q2 2026' },
          { title: 'Weather Impact Analysis', desc: 'How recent weather patterns affected agricultural output', icon: CloudRain, color: 'from-purple-500 to-violet-600', date: 'June 2026' },
          { title: 'Market Price Trends', desc: 'Regional commodity price movements and market analysis', icon: BarChart3, color: 'from-pink-500 to-rose-600', date: 'June 2026' },
          { title: 'Annual Regional Review', desc: 'Comprehensive yearly report of all agricultural activities', icon: FileText, color: 'from-teal-500 to-cyan-600', date: '2025-2026' },
        ].map((report, i) => (
          <div key={i} className="bg-card rounded-2xl border border-border p-6 hover:shadow-lg transition-all duration-300 group cursor-pointer">
            <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${report.color} text-white mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
              <report.icon size={22} />
            </div>
            <h3 className="font-bold text-foreground text-lg">{report.title}</h3>
            <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{report.desc}</p>
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/60">
              <span className="text-xs text-muted-foreground font-medium">{report.date}</span>
              <button className="text-sm text-primary font-semibold hover:underline flex items-center gap-1">
                Generate <ChevronRight size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // ════════════════════════════════
  // ANALYTICS
  // ════════════════════════════════
  const renderAnalytics = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-2xl border border-border p-6">
          <h3 className="text-lg font-bold font-display mb-1">Requests by Category</h3>
          <p className="text-sm text-muted-foreground mb-6">Distribution of farmer inquiries</p>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={requestsByCategoryData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <RechartsTooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }} />
                <Bar dataKey="count" fill="#2E7D32" radius={[6, 6, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-card rounded-2xl border border-border p-6">
          <h3 className="text-lg font-bold font-display mb-1">Expert Response Time</h3>
          <p className="text-sm text-muted-foreground mb-6">Average time to first response</p>
          <div className="space-y-4">
            {experts.filter(e => e.status === 'active').map(expert => (
              <div key={expert.id} className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-sm shrink-0">{expert.avatar}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-1">
                    <p className="font-semibold text-sm text-foreground truncate">{expert.name}</p>
                    <span className="text-xs font-bold text-primary">{Math.floor(Math.random() * 4) + 1}h avg</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-primary to-secondary rounded-full" style={{ width: `${60 + Math.random() * 35}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-card rounded-2xl border border-border p-6">
        <h3 className="text-lg font-bold font-display mb-1">Zone-wise Farmer Distribution</h3>
        <p className="text-sm text-muted-foreground mb-6">Number of registered farmers per zone</p>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={cfg.zones.slice(0, 8).map(z => ({ zone: z, farmers: Math.floor(200 + Math.random() * 600) }))} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
              <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
              <YAxis dataKey="zone" type="category" axisLine={false} tickLine={false} width={120} tick={{ fill: '#64748b', fontSize: 12 }} />
              <RechartsTooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }} />
              <Bar dataKey="farmers" fill="#F4A000" radius={[0, 6, 6, 0]} barSize={22} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );

  // ════════════════════════════════
  // LEARNING
  // ════════════════════════════════
  const renderLearning = () => (
    <div className="space-y-6">
      <div className="flex gap-2 flex-wrap">
        {['all', 'pending', 'approved', 'rejected'].map(s => (
          <button key={s} className={`px-4 py-2 rounded-full text-sm font-semibold capitalize transition-all ${s === 'all' ? 'bg-primary text-white shadow-md' : 'bg-card border border-border text-muted-foreground hover:bg-muted'}`}>
            {s === 'all' ? `All (${mockLearning.length})` : `${s} (${mockLearning.filter(l => l.status === s).length})`}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {mockLearning.map(item => (
          <div key={item.id} className="bg-card rounded-2xl border border-border p-6 hover:shadow-lg transition-all duration-300">
            <div className="flex flex-col md:flex-row md:items-center gap-5">
              <div className={`p-3 rounded-xl shrink-0 ${item.type === 'video' ? 'bg-red-50 text-red-500' : item.type === 'article' ? 'bg-blue-50 text-blue-500' : 'bg-emerald-50 text-emerald-500'}`}>
                {item.type === 'video' ? <Eye size={22} /> : item.type === 'article' ? <FileText size={22} /> : <BookOpen size={22} />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-bold text-foreground">{item.title}</h3>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full border capitalize ${
                    item.status === 'pending' ? 'bg-amber-50 text-amber-600 border-amber-200' :
                    item.status === 'approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
                    'bg-red-50 text-red-600 border-red-200'
                  }`}>{item.status}</span>
                </div>
                <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground flex-wrap">
                  <span className="flex items-center gap-1"><GraduationCap size={14} /> {item.author}</span>
                  <span className="flex items-center gap-1"><Globe size={14} /> {item.language}</span>
                  <span className="flex items-center gap-1"><Leaf size={14} /> {item.category}</span>
                  <span className="flex items-center gap-1"><Clock size={14} /> {format(new Date(item.submittedAt), 'MMM d, yyyy')}</span>
                </div>
              </div>
              {item.status === 'pending' && (
                <div className="flex gap-2 shrink-0">
                  <button className="px-4 py-2 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-all text-sm flex items-center gap-1.5">
                    <CheckCircle size={16} /> Approve
                  </button>
                  <button className="px-4 py-2 border border-red-200 text-red-600 font-bold rounded-xl hover:bg-red-50 transition-all text-sm flex items-center gap-1.5">
                    <XCircle size={16} /> Reject
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // ════════════════════════════════
  // WEATHER
  // ════════════════════════════════
  const renderWeather = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-500/10 via-cyan-50 to-sky-50 rounded-2xl border border-blue-200 p-6 flex items-center gap-4">
        <div className="p-3 bg-blue-100 rounded-xl text-blue-600"><CloudRain size={24} /></div>
        <div>
          <h3 className="font-bold font-display text-lg">Regional Weather Intelligence</h3>
          <p className="text-sm text-muted-foreground">Live weather data across {cfg.name} zones — Updated every 3 hours</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {weatherData.map((w, i) => {
          const WeatherIcon = w.icon;
          return (
            <div key={i} className={`bg-card rounded-2xl border p-6 hover:shadow-lg transition-all duration-300 ${w.alert ? 'border-red-200' : 'border-border'}`}>
              {w.alert && (
                <div className="flex items-center gap-2 text-red-600 bg-red-50 rounded-xl px-3 py-2 mb-4 text-sm font-bold">
                  <AlertTriangle size={16} /> {w.alert}
                </div>
              )}
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-bold text-foreground">{w.zone}</h3>
                  <p className="text-sm text-muted-foreground">{w.condition}</p>
                </div>
                <WeatherIcon size={36} className="text-blue-500" />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-muted/50 rounded-xl p-3 text-center">
                  <ThermometerSun size={18} className="text-amber-500 mx-auto mb-1" />
                  <p className="text-lg font-bold">{w.temp}°C</p>
                  <p className="text-xs text-muted-foreground">Temp</p>
                </div>
                <div className="bg-muted/50 rounded-xl p-3 text-center">
                  <Droplets size={18} className="text-blue-500 mx-auto mb-1" />
                  <p className="text-lg font-bold">{w.humidity}%</p>
                  <p className="text-xs text-muted-foreground">Humidity</p>
                </div>
                <div className="bg-muted/50 rounded-xl p-3 text-center">
                  <CloudRain size={18} className="text-cyan-500 mx-auto mb-1" />
                  <p className="text-lg font-bold">{w.rainfall}mm</p>
                  <p className="text-xs text-muted-foreground">Rain</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  // ════════════════════════════════
  // NOTIFICATIONS
  // ════════════════════════════════
  const renderNotifications = () => (
    <div className="space-y-5">
      {announcements && announcements.length > 0 ? announcements.map((a: any) => (
        <div key={a.id} className="bg-card p-6 rounded-2xl border border-border hover:shadow-lg transition-all duration-300">
          <div className="flex gap-5">
            <div className={`p-4 rounded-2xl h-fit shrink-0 ${
              a.type === 'weather' ? 'bg-blue-50 text-blue-600' :
              a.type === 'alert' ? 'bg-red-50 text-red-600' :
              'bg-primary/10 text-primary'
            }`}><Bell size={24} /></div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2 flex-wrap">
                <span className={`text-xs font-extrabold px-2.5 py-1 rounded-md uppercase tracking-wider ${
                  a.type === 'weather' ? 'bg-blue-100 text-blue-700' :
                  a.type === 'alert' ? 'bg-red-100 text-red-700' :
                  'bg-primary/10 text-primary'
                }`}>{a.type === 'weather' ? '🌧 Weather' : a.type === 'alert' ? '⚠ Alert' : 'ℹ Info'}</span>
                <p className="text-xs text-muted-foreground">{format(new Date(a.created_at), 'MMM d, yyyy • h:mm a')}</p>
              </div>
              <h3 className="font-bold font-display text-xl">{a.title}</h3>
              <p className="text-foreground/80 mt-2 leading-relaxed">{a.body}</p>
            </div>
          </div>
        </div>
      )) : (
        <div className="text-center py-16">
          <span className="text-5xl mb-4 block">🔔</span>
          <h3 className="text-xl font-bold">No notifications</h3>
          <p className="text-muted-foreground mt-2">You're all caught up!</p>
        </div>
      )}
    </div>
  );

  // ════════════════════════════════
  // PROFILE
  // ════════════════════════════════
  const renderProfile = () => (
    <div className="max-w-2xl space-y-6">
      <div className="bg-card rounded-2xl border border-border p-8">
        <div className="flex items-center gap-5 mb-8">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-2xl shadow-xl">RM</div>
          <div>
            <h3 className="text-2xl font-display font-bold text-foreground">Regional Manager</h3>
            <p className="text-muted-foreground">{cfg.name} Region • <span className="text-primary font-semibold">{cfg.language}</span></p>
            <span className="inline-flex items-center gap-1.5 mt-1 text-sm text-emerald-600 font-semibold"><Shield size={14} /> Verified Government Official</span>
          </div>
        </div>

        <div className="space-y-5">
          {[
            { label: 'Full Name', value: region === 'oromia' ? 'Obbo Dassaaleny Fufaa' : 'Ato Abebe Kebede', icon: Users },
            { label: 'Email', value: `manager.${region}@agribridge.gov.et`, icon: Mail },
            { label: 'Phone', value: '+251 911 234 567', icon: Phone },
            { label: 'Region', value: cfg.name, icon: MapPin },
            { label: 'Primary Language', value: cfg.language, icon: Globe },
            { label: 'Zones Managed', value: cfg.zones.length.toString(), icon: MapPin },
            { label: 'Role', value: 'Regional Agriculture Manager', icon: Award },
          ].map((field, i) => (
            <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-muted/40">
              <field.icon size={18} className="text-muted-foreground shrink-0" />
              <div className="flex-1">
                <p className="text-xs text-muted-foreground font-medium">{field.label}</p>
                <p className="font-semibold text-foreground">{field.value}</p>
              </div>
            </div>
          ))}
        </div>

        <button className="w-full mt-6 py-3 border border-border rounded-xl font-bold text-foreground hover:bg-muted transition-colors flex items-center justify-center gap-2">
          <Edit3 size={18} /> Edit Profile
        </button>
      </div>
    </div>
  );

  // ═══════════════════════════════════════
  // MAIN LAYOUT
  // ═══════════════════════════════════════
  return (
    <div className="min-h-screen bg-background flex">
      {/* Mobile Overlay */}
      {sidebarOpen && <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* SIDEBAR */}
      <aside className={`
        fixed lg:sticky top-0 left-0 z-50 lg:z-auto
        w-72 lg:w-[280px] bg-card border-r border-border shrink-0 flex flex-col h-screen
        transform transition-transform duration-300 ease-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Header */}
        <div className="p-5 border-b border-border">