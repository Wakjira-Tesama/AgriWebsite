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