import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../integrations/supabase/client';
import {
  Plus, Trash2, TrendingUp, TrendingDown, Minus,
  LayoutDashboard, Users, Bell, CheckCircle, LogOut,
  Shield, MapPin, Globe, Search, Menu, X, ChevronRight, ChevronDown,
  Settings, ArrowUpRight, Edit3, Eye, UserCheck, UserPlus,
  DollarSign, Activity, AlertTriangle, Crown, Lock,
  ShoppingBag, Mail,
  Megaphone, Zap, Database, Server, Layers
} from 'lucide-react';
import { format } from 'date-fns';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell
} from 'recharts';

// ─── TYPES ───
type Tab = 'overview' | 'regions' | 'buyers' | 'prices' | 'announcements' | 'platform' | 'settings';

interface RegionalManager {
  id: string;
  name: string;
  region: string;
  language: string;
  email: string;
  phone: string;
  status: 'active' | 'suspended' | 'pending';
  farmers: number;
  experts: number;
  performance: number;
  joinedDate: string;
  avatar: string;
}

interface Buyer {
  id: string;
  name: string;
  type: 'wholesale' | 'exporter' | 'processor' | 'retailer';
  location: string;
  status: 'active' | 'suspended' | 'pending' | 'verified';
  totalOrders: number;
  totalSpent: string;
  phone: string;
  email: string;
  joinedDate: string;
  avatar: string;
}

// ─── MOCK DATA ───
const platformGrowthData = [
  { name: 'Jan', users: 2400, transactions: 1200, revenue: 1.2 },
  { name: 'Feb', users: 4200, transactions: 2100, revenue: 2.1 },
  { name: 'Mar', users: 6800, transactions: 3400, revenue: 3.4 },
  { name: 'Apr', users: 9500, transactions: 5200, revenue: 4.8 },
  { name: 'May', users: 13200, transactions: 7800, revenue: 6.5 },
  { name: 'Jun', users: 18500, transactions: 11200, revenue: 9.2 },
];

const revenueByRegionData = [
  { name: 'Oromia', revenue: 3200, transactions: 4500 },
  { name: 'Amhara', revenue: 2400, transactions: 3200 },
  { name: 'SNNPR', revenue: 1800, transactions: 2100 },
  { name: 'Tigray', revenue: 1200, transactions: 1500 },
  { name: 'Sidama', revenue: 900, transactions: 1100 },
  { name: 'Others', revenue: 600, transactions: 800 },
];

const marketShareData = [
  { name: 'Teff', value: 32 },
  { name: 'Coffee', value: 28 },
  { name: 'Maize', value: 18 },
  { name: 'Sesame', value: 12 },
  { name: 'Others', value: 10 },
];
const PIE_COLORS = ['#2E7D32', '#F4A000', '#4CAF50', '#1B5E20', '#64748b'];

const mockRegionalManagers: RegionalManager[] = [
  { id: 'RM001', name: 'Obbo Dassaaleny Fufaa', region: 'Oromia', language: 'Afaan Oromoo', email: 'manager.oromia@agribridge.gov.et', phone: '+251911234567', status: 'active', farmers: 3500, experts: 18, performance: 94, joinedDate: '2025-01-15', avatar: 'DF' },
  { id: 'RM002', name: 'Ato Abebe Kebede', region: 'Amhara', language: 'Amharic', email: 'manager.amhara@agribridge.gov.et', phone: '+251922345678', status: 'active', farmers: 2800, experts: 14, performance: 88, joinedDate: '2025-02-20', avatar: 'AK' },
  { id: 'RM003', name: 'W/ro Selamawit Gebre', region: 'SNNPR', language: 'Multiple', email: 'manager.snnpr@agribridge.gov.et', phone: '+251933456789', status: 'active', farmers: 2100, experts: 12, performance: 91, joinedDate: '2025-03-10', avatar: 'SG' },
  { id: 'RM004', name: 'Ato Gebremariam Tekle', region: 'Tigray', language: 'Tigrinya', email: 'manager.tigray@agribridge.gov.et', phone: '+251944567890', status: 'suspended', farmers: 1500, experts: 8, performance: 72, joinedDate: '2025-04-05', avatar: 'GT' },
  { id: 'RM005', name: 'Ato Hawaz Wondosen', region: 'Sidama', language: 'Sidaamu Afoo', email: 'manager.sidama@agribridge.gov.et', phone: '+251955678901', status: 'active', farmers: 1200, experts: 6, performance: 86, joinedDate: '2025-05-18', avatar: 'HW' },
  { id: 'RM006', name: 'Ato Ahmed Hassan', region: 'Somali', language: 'Somali', email: 'manager.somali@agribridge.gov.et', phone: '+251966789012', status: 'pending', farmers: 0, experts: 0, performance: 0, joinedDate: '2026-06-28', avatar: 'AH' },
  { id: 'RM007', name: 'Ato Musa Ali', region: 'Afar', language: 'Afaraf', email: 'manager.afar@agribridge.gov.et', phone: '+251977890123', status: 'pending', farmers: 0, experts: 0, performance: 0, joinedDate: '2026-06-25', avatar: 'MA' },
];

const mockBuyers: Buyer[] = [
  { id: 'B001', name: 'Selam Trading PLC', type: 'wholesale', location: 'Addis Ababa', status: 'verified', totalOrders: 48, totalSpent: '2.4M', phone: '+251911111111', email: 'selam@trading.et', joinedDate: '2025-06-20', avatar: 'ST' },
  { id: 'B002', name: 'Ethiopian Coffee Exporters', type: 'exporter', location: 'Addis Ababa', status: 'verified', totalOrders: 32, totalSpent: '8.2M', phone: '+251922222222', email: 'ece@export.et', joinedDate: '2025-03-15', avatar: 'EC' },
  { id: 'B003', name: 'Hawassa Grain Mill', type: 'processor', location: 'Sidama', status: 'active', totalOrders: 25, totalSpent: '1.8M', phone: '+251933333333', email: 'hawassa@mill.et', joinedDate: '2025-08-10', avatar: 'HG' },
  { id: 'B004', name: 'Bahir Dar Foods PLC', type: 'processor', location: 'Amhara', status: 'active', totalOrders: 19, totalSpent: '920K', phone: '+251944444444', email: 'bd@foods.et', joinedDate: '2025-11-22', avatar: 'BF' },
  { id: 'B005', name: 'Oromia Cooperative Union', type: 'wholesale', location: 'Oromia', status: 'verified', totalOrders: 65, totalSpent: '5.6M', phone: '+251955555555', email: 'ocu@coop.et', joinedDate: '2025-01-08', avatar: 'OC' },
  { id: 'B006', name: 'Tigray Sesame Export', type: 'exporter', location: 'Tigray', status: 'suspended', totalOrders: 12, totalSpent: '1.1M', phone: '+251966666666', email: 'tse@export.et', joinedDate: '2025-09-30', avatar: 'TS' },
  { id: 'B007', name: 'Jimma Coffee Union', type: 'wholesale', location: 'Oromia', status: 'pending', totalOrders: 0, totalSpent: '0', phone: '+251977777777', email: 'jcu@coffee.et', joinedDate: '2026-06-27', avatar: 'JC' },
  { id: 'B008', name: 'Capital Supermarkets', type: 'retailer', location: 'Addis Ababa', status: 'verified', totalOrders: 38, totalSpent: '3.1M', phone: '+251988888888', email: 'capital@super.et', joinedDate: '2025-04-14', avatar: 'CS' },
];

const statusColors: Record<string, { text: string; bg: string }> = {
  active: { text: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200' },
  verified: { text: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200' },
  suspended: { text: 'text-red-700', bg: 'bg-red-50 border-red-200' },
  pending: { text: 'text-amber-700', bg: 'bg-amber-50 border-amber-200' },
};

const buyerTypeColors: Record<string, { text: string; bg: string }> = {
  wholesale: { text: 'text-blue-700', bg: 'bg-blue-50' },
  exporter: { text: 'text-purple-700', bg: 'bg-purple-50' },
  processor: { text: 'text-teal-700', bg: 'bg-teal-50' },
  retailer: { text: 'text-amber-700', bg: 'bg-amber-50' },
};

export default function Dashboard() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [regionFilter, setRegionFilter] = useState('All');
  const [buyerTypeFilter, setBuyerTypeFilter] = useState('All');
  const [showAddManagerModal, setShowAddManagerModal] = useState(false);

  // Market Prices State
  const [newPrice, setNewPrice] = useState({ crop: '', market: '', price: '', unit: '100kg', trend: 'stable' });
  // Announcements State
  const [newAnn, setNewAnn] = useState({ title: '', body: '', type: 'info' });

  // ─── SUPABASE QUERIES ───
  const { data: prices, isLoading: loadingPrices } = useQuery({
    queryKey: ['market_prices'],
    queryFn: async () => {
      const { data, error } = await supabase.from('market_prices').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    }
  });

  const { data: announcements, isLoading: loadingAnns } = useQuery({
    queryKey: ['announcements'],
    queryFn: async () => {
      const { data, error } = await supabase.from('announcements').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    }
  });

  // ─── MUTATIONS ───
  const addPrice = useMutation({
    mutationFn: async (price: any) => {
      const { error } = await supabase.from('market_prices').insert(price);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['market_prices'] });
      setNewPrice({ crop: '', market: '', price: '', unit: '100kg', trend: 'stable' });
    }
  });

  const deletePrice = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('market_prices').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['market_prices'] })
  });

  const addAnn = useMutation({
    mutationFn: async (ann: any) => {
      const { error } = await supabase.from('announcements').insert(ann);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
      setNewAnn({ title: '', body: '', type: 'info' });
    }
  });

  const deleteAnn = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('announcements').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['announcements'] })
  });

  // ─── FILTERS ───
  const filteredManagers = useMemo(() => {
    return mockRegionalManagers.filter(m => {
      const matchesSearch = m.name.toLowerCase().includes(searchQuery.toLowerCase()) || m.region.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRegion = regionFilter === 'All' || m.region === regionFilter;
      return matchesSearch && matchesRegion;
    });
  }, [searchQuery, regionFilter]);

  const filteredBuyers = useMemo(() => {
    return mockBuyers.filter(b => {
      const matchesSearch = b.name.toLowerCase().includes(searchQuery.toLowerCase()) || b.location.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = buyerTypeFilter === 'All' || b.type === buyerTypeFilter;
      return matchesSearch && matchesType;
    });
  }, [searchQuery, buyerTypeFilter]);

  const totalFarmers = mockRegionalManagers.reduce((sum, m) => sum + m.farmers, 0);
  const totalExperts = mockRegionalManagers.reduce((sum, m) => sum + m.experts, 0);
  const activeRegions = mockRegionalManagers.filter(m => m.status === 'active').length;

  // ─── NAV ITEMS ───
  const navItems: { id: Tab; label: string; icon: any; badge?: string }[] = [
    { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'regions', label: 'Regional Managers', icon: Shield },
    { id: 'buyers', label: 'Buyers & Traders', icon: ShoppingBag },
    { id: 'prices', label: 'Market Prices', icon: DollarSign },
    { id: 'announcements', label: 'Announcements', icon: Megaphone },
    { id: 'platform', label: 'Platform Stats', icon: Activity },
    { id: 'settings', label: 'System Settings', icon: Settings },
  ];

  const tabTitles: Record<Tab, { title: string; subtitle: string }> = {
    overview: { title: 'Super Admin Dashboard', subtitle: 'Complete platform overview and management controls' },
    regions: { title: 'Regional Managers', subtitle: 'Manage and monitor all regional agriculture managers' },
    buyers: { title: 'Buyers & Traders', subtitle: 'Manage wholesale buyers, exporters, and processors' },
    prices: { title: 'Market Price Control', subtitle: 'Set and manage commodity prices across all markets' },
    announcements: { title: 'Broadcast Center', subtitle: 'Send platform-wide announcements and alerts' },
    platform: { title: 'Platform Analytics', subtitle: 'System-wide performance metrics and growth data' },
    settings: { title: 'System Settings', subtitle: 'Platform configuration and administration' },
  };

  // ════════════════════════════════════════════
  // OVERVIEW TAB
  // ════════════════════════════════════════════
  const renderOverview = () => (
    <div className="space-y-6">
      {/* Pending alerts */}
      {mockRegionalManagers.some(m => m.status === 'pending') && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-4">
          <div className="p-3 bg-amber-100 rounded-xl text-amber-600"><AlertTriangle size={22} /></div>
          <div className="flex-1">
            <p className="font-bold text-amber-800">{mockRegionalManagers.filter(m => m.status === 'pending').length} Regional Manager Applications Pending</p>
            <p className="text-sm text-amber-600">New regions requesting activation. Review and approve.</p>
          </div>
          <button onClick={() => setActiveTab('regions')} className="px-4 py-2 bg-amber-600 text-white font-bold rounded-xl hover:bg-amber-700 transition-colors text-sm">Review</button>
        </div>
      )}

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {[
          { label: 'Active Regions', value: `${activeRegions}/${mockRegionalManagers.length}`, icon: Shield, change: '2 pending approval', color: 'from-emerald-500 to-green-600' },
          { label: 'Platform Revenue', value: '9.2M ETB', icon: DollarSign, change: '+41.5% this quarter', color: 'from-amber-500 to-orange-500' },
          { label: 'Total Buyers', value: `${mockBuyers.length}`, icon: ShoppingBag, change: `${mockBuyers.filter(b => b.status === 'verified').length} verified`, color: 'from-blue-500 to-indigo-600' },
          { label: 'Total Transactions', value: '11,200', icon: Activity, change: '+35.5% growth', color: 'from-purple-500 to-violet-600' },
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
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-bold font-display">Platform Growth</h3>
              <p className="text-sm text-muted-foreground">Users, transactions & revenue (M ETB)</p>
            </div>
            <span className="text-xs font-bold text-secondary bg-secondary/10 px-3 py-1.5 rounded-full flex items-center gap-1">
              <TrendingUp size={14} /> +41.5%
            </span>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={platformGrowthData}>
                <defs>
                  <linearGradient id="userGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2E7D32" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#2E7D32" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="txGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F4A000" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#F4A000" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 13 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 13 }} />
                <RechartsTooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 10px 30px rgba(0,0,0,0.08)' }} />
                <Area type="monotone" dataKey="users" stroke="#2E7D32" strokeWidth={2.5} fill="url(#userGrad)" name="Users" />
                <Area type="monotone" dataKey="transactions" stroke="#F4A000" strokeWidth={2.5} fill="url(#txGrad)" name="Transactions" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-card rounded-2xl border border-border p-6">
          <h3 className="text-lg font-bold font-display mb-1">Market Share</h3>
          <p className="text-sm text-muted-foreground mb-4">Transaction volume by crop</p>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={marketShareData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={4} dataKey="value" stroke="none">
                  {marketShareData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {marketShareData.map((c, i) => (
              <div key={i} className="flex items-center gap-2 text-sm">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: PIE_COLORS[i] }} />
                <span className="text-muted-foreground">{c.name}</span>
                <span className="font-bold ml-auto">{c.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Regional Performance */}
        <div className="bg-card rounded-2xl border border-border p-6">
          <div className="flex justify-between items-center mb-5">
            <h3 className="text-lg font-bold font-display">Regional Performance</h3>
            <button onClick={() => setActiveTab('regions')} className="text-sm text-primary font-semibold hover:underline flex items-center gap-1">View All <ChevronRight size={16} /></button>
          </div>
          <div className="space-y-3">
            {mockRegionalManagers.filter(m => m.status === 'active').slice(0, 5).map(m => (
              <div key={m.id} className="flex items-center gap-4 p-3.5 rounded-xl bg-muted/40 hover:bg-muted/70 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-sm shrink-0">{m.avatar}</div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-foreground truncate">{m.region}</p>
                  <p className="text-xs text-muted-foreground">{m.farmers.toLocaleString()} farmers • {m.experts} experts</p>
                </div>
                <div className="text-right shrink-0">
                  <p className={`font-bold text-sm ${m.performance >= 90 ? 'text-emerald-600' : m.performance >= 80 ? 'text-amber-600' : 'text-red-600'}`}>{m.performance}%</p>
                  <p className="text-xs text-muted-foreground">score</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Revenue by Region */}
        <div className="bg-card rounded-2xl border border-border p-6">
          <h3 className="text-lg font-bold font-display mb-1">Revenue by Region</h3>
          <p className="text-sm text-muted-foreground mb-6">Monthly revenue in thousands ETB</p>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueByRegionData} layout="vertical" margin={{ left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} width={70} tick={{ fill: '#64748b', fontSize: 12 }} />
                <RechartsTooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }} />
                <Bar dataKey="revenue" fill="#2E7D32" radius={[0, 6, 6, 0]} barSize={20} name="Revenue (K)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );

  // ════════════════════════════════════════════
  // REGIONAL MANAGERS TAB
  // ════════════════════════════════════════════
  const renderRegions = () => (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="flex gap-3 flex-wrap flex-1 w-full md:w-auto">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <input type="text" placeholder="Search managers..." className="w-full pl-10 pr-4 py-2.5 border border-border rounded-xl focus:border-primary outline-none transition-all" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
          </div>
          <div className="relative">
            <select className="pl-3 pr-8 py-2.5 border border-border rounded-xl outline-none appearance-none font-medium cursor-pointer" value={regionFilter} onChange={e => setRegionFilter(e.target.value)}>
              <option value="All">All Regions</option>
              {[...new Set(mockRegionalManagers.map(m => m.region))].map(r => <option key={r} value={r}>{r}</option>)}
            </select>
            <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          </div>
        </div>
        <button onClick={() => setShowAddManagerModal(true)} className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-all shadow-md shadow-primary/20">
          <UserPlus size={18} /> Add Regional Manager
        </button>
      </div>

      {/* Summary Row */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-emerald-700">{mockRegionalManagers.filter(m => m.status === 'active').length}</p>
          <p className="text-sm text-emerald-600 font-medium">Active</p>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-amber-700">{mockRegionalManagers.filter(m => m.status === 'pending').length}</p>
          <p className="text-sm text-amber-600 font-medium">Pending</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-red-700">{mockRegionalManagers.filter(m => m.status === 'suspended').length}</p>
          <p className="text-sm text-red-600 font-medium">Suspended</p>
        </div>
      </div>

      {/* Manager Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {filteredManagers.map(m => {
          const sc = statusColors[m.status];
          return (
            <div key={m.id} className="bg-card rounded-2xl border border-border p-6 hover:shadow-lg transition-all duration-300 group">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#1B5E20] to-primary flex items-center justify-center text-white font-bold text-lg shadow-lg">
                    {m.avatar}
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground text-lg">{m.name}</h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-sm text-muted-foreground flex items-center gap-1"><MapPin size={13} /> {m.region}</span>
                      <span className="text-sm text-muted-foreground flex items-center gap-1"><Globe size={13} /> {m.language}</span>
                    </div>
                  </div>
                </div>
                <span className={`text-xs font-bold px-3 py-1 rounded-full border capitalize ${sc.bg} ${sc.text}`}>
                  {m.status}
                </span>
              </div>

              {/* Stats */}
              {m.status !== 'pending' && (
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="bg-muted/50 rounded-xl p-3 text-center">
                    <p className="text-lg font-bold text-primary">{m.farmers.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground font-medium">Farmers</p>
                  </div>
                  <div className="bg-muted/50 rounded-xl p-3 text-center">
                    <p className="text-lg font-bold text-accent">{m.experts}</p>
                    <p className="text-xs text-muted-foreground font-medium">Experts</p>
                  </div>
                  <div className="bg-muted/50 rounded-xl p-3 text-center">
                    <p className={`text-lg font-bold ${m.performance >= 90 ? 'text-emerald-600' : m.performance >= 80 ? 'text-amber-600' : 'text-red-600'}`}>{m.performance}%</p>
                    <p className="text-xs text-muted-foreground font-medium">Performance</p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                <Mail size={14} /> {m.email}
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-4 border-t border-border/60">
                {m.status === 'pending' ? (
                  <>
                    <button className="flex-1 py-2.5 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-all text-sm flex items-center justify-center gap-1.5">
                      <CheckCircle size={16} /> Approve
                    </button>
                    <button className="py-2.5 px-4 border border-red-200 text-red-600 font-bold rounded-xl hover:bg-red-50 transition-all text-sm">
                      Reject
                    </button>
                  </>
                ) : (
                  <>
                    <button className="flex-1 py-2.5 border border-border font-bold rounded-xl hover:bg-muted transition-all text-sm flex items-center justify-center gap-1.5">
                      <Eye size={16} /> View Dashboard
                    </button>
                    {m.status === 'active' ? (
                      <button className="py-2.5 px-4 border border-red-200 text-red-600 font-bold rounded-xl hover:bg-red-50 transition-all text-sm flex items-center gap-1.5">
                        <Lock size={14} /> Suspend
                      </button>
                    ) : (
                      <button className="py-2.5 px-4 bg-emerald-500 text-white font-bold rounded-xl hover:bg-emerald-600 transition-all text-sm flex items-center gap-1.5">
                        <CheckCircle size={14} /> Activate
                      </button>
                    )}
                    <button className="py-2.5 px-3 border border-border rounded-xl hover:bg-muted transition-all"><Edit3 size={16} className="text-muted-foreground" /></button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  // ════════════════════════════════════════════
  // BUYERS & TRADERS TAB
  // ════════════════════════════════════════════
  const renderBuyers = () => (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="flex gap-3 flex-wrap flex-1 w-full md:w-auto">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <input type="text" placeholder="Search buyers, traders..." className="w-full pl-10 pr-4 py-2.5 border border-border rounded-xl focus:border-primary outline-none transition-all" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
          </div>
          <div className="relative">
            <select className="pl-3 pr-8 py-2.5 border border-border rounded-xl outline-none appearance-none font-medium cursor-pointer" value={buyerTypeFilter} onChange={e => setBuyerTypeFilter(e.target.value)}>
              <option value="All">All Types</option>
              <option value="wholesale">Wholesale</option>
              <option value="exporter">Exporter</option>
              <option value="processor">Processor</option>
              <option value="retailer">Retailer</option>
            </select>
            <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Type summary pills */}
      <div className="flex gap-2 flex-wrap">
        {['All', 'wholesale', 'exporter', 'processor', 'retailer'].map(t => (
          <button key={t} onClick={() => setBuyerTypeFilter(t)}
            className={`px-4 py-2 rounded-full text-sm font-semibold capitalize transition-all ${
              buyerTypeFilter === t ? 'bg-primary text-white shadow-md' : 'bg-card border border-border text-muted-foreground hover:bg-muted'
            }`}>
            {t === 'All' ? `All (${mockBuyers.length})` : `${t} (${mockBuyers.filter(b => b.type === t).length})`}
          </button>
        ))}
      </div>

      {/* Buyers Table */}
      <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-muted/70 border-b border-border">
                <th className="p-4 font-semibold text-muted-foreground text-sm">Company</th>
                <th className="p-4 font-semibold text-muted-foreground text-sm">Type</th>
                <th className="p-4 font-semibold text-muted-foreground text-sm">Location</th>
                <th className="p-4 font-semibold text-muted-foreground text-sm">Orders</th>
                <th className="p-4 font-semibold text-muted-foreground text-sm">Total Spent</th>
                <th className="p-4 font-semibold text-muted-foreground text-sm">Status</th>
                <th className="p-4 font-semibold text-muted-foreground text-sm">Joined</th>
                <th className="p-4 font-semibold text-muted-foreground text-sm text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredBuyers.map(b => {
                const tc = buyerTypeColors[b.type];
                const sc = statusColors[b.status];
                return (
                  <tr key={b.id} className="hover:bg-muted/40 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-accent/10 text-accent flex items-center justify-center font-bold text-sm shrink-0">{b.avatar}</div>
                        <div>
                          <p className="font-semibold text-foreground">{b.name}</p>
                          <p className="text-xs text-muted-foreground">{b.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full capitalize ${tc.bg} ${tc.text}`}>{b.type}</span>
                    </td>
                    <td className="p-4 text-sm text-muted-foreground font-medium">{b.location}</td>
                    <td className="p-4 font-bold text-foreground">{b.totalOrders}</td>
                    <td className="p-4 font-bold text-primary">{b.totalSpent} ETB</td>
                    <td className="p-4">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full border capitalize ${sc.bg} ${sc.text}`}>{b.status}</span>
                    </td>
                    <td className="p-4 text-sm text-muted-foreground">{format(new Date(b.joinedDate), 'MMM d, yyyy')}</td>
                    <td className="p-4 text-right">
                      <div className="flex items-center gap-1.5 justify-end">
                        {b.status === 'pending' ? (
                          <button className="px-3 py-1.5 bg-primary text-white text-xs font-bold rounded-lg hover:bg-primary/90">Verify</button>
                        ) : b.status === 'suspended' ? (
                          <button className="px-3 py-1.5 bg-emerald-500 text-white text-xs font-bold rounded-lg hover:bg-emerald-600">Activate</button>
                        ) : (
                          <button className="px-3 py-1.5 border border-red-200 text-red-600 text-xs font-bold rounded-lg hover:bg-red-50">Suspend</button>
                        )}
                        <button className="p-1.5 rounded-lg border border-border hover:bg-muted"><Edit3 size={14} className="text-muted-foreground" /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // ════════════════════════════════════════════
  // MARKET PRICES TAB (CRUD)
  // ════════════════════════════════════════════
  const renderPrices = () => (
    <div className="space-y-6">
      {/* Info Banner */}
      <div className="bg-gradient-to-r from-primary/10 via-secondary/5 to-accent/10 rounded-2xl border border-primary/20 p-5 flex items-center gap-4">
        <div className="p-3 bg-primary/20 rounded-xl text-primary"><DollarSign size={22} /></div>
        <div>
          <h3 className="font-bold font-display">Market Price Control Center</h3>
          <p className="text-sm text-muted-foreground">Prices you set here are visible to all farmers, buyers, and regional managers across the platform.</p>
        </div>
      </div>

      {/* Add New Price */}
      <div className="bg-card p-6 rounded-2xl shadow-sm border border-border">
        <h2 className="text-lg font-bold font-display mb-4">Set New Market Price</h2>
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <input placeholder="Crop (e.g. Teff)" className="px-4 py-2.5 border border-border rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none md:col-span-2 transition-all" value={newPrice.crop} onChange={e => setNewPrice({ ...newPrice, crop: e.target.value })} />
          <input placeholder="Market (e.g. Addis)" className="px-4 py-2.5 border border-border rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" value={newPrice.market} onChange={e => setNewPrice({ ...newPrice, market: e.target.value })} />
          <input placeholder="Price (ETB)" type="number" className="px-4 py-2.5 border border-border rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" value={newPrice.price} onChange={e => setNewPrice({ ...newPrice, price: e.target.value })} />
          <select className="px-4 py-2.5 border border-border rounded-xl focus:border-primary outline-none transition-all" value={newPrice.trend} onChange={e => setNewPrice({ ...newPrice, trend: e.target.value })}>
            <option value="up">📈 Going Up</option>
            <option value="down">📉 Going Down</option>
            <option value="stable">➡️ Stable</option>
          </select>
          <button onClick={() => addPrice.mutate(newPrice)} disabled={!newPrice.crop || !newPrice.market || !newPrice.price || addPrice.isPending}
            className="bg-primary text-white rounded-xl flex items-center justify-center gap-2 hover:bg-primary/90 disabled:opacity-50 font-bold transition-all shadow-md shadow-primary/20">
            <Plus size={18} /> Publish
          </button>
        </div>
      </div>

      {/* Prices Table */}
      <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-muted/70 border-b border-border">
                <th className="p-4 font-semibold text-muted-foreground text-sm">Crop</th>
                <th className="p-4 font-semibold text-muted-foreground text-sm">Market</th>
                <th className="p-4 font-semibold text-muted-foreground text-sm">Price (ETB)</th>
                <th className="p-4 font-semibold text-muted-foreground text-sm">Trend</th>
                <th className="p-4 font-semibold text-muted-foreground text-sm">Last Updated</th>
                <th className="p-4 font-semibold text-muted-foreground text-sm w-20">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loadingPrices ? (
                <tr><td colSpan={6} className="p-12 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
                    <p className="text-muted-foreground font-medium">Loading prices...</p>
                  </div>
                </td></tr>
              ) : prices && prices.length > 0 ? prices.map((p: any) => (
                <tr key={p.id} className="hover:bg-muted/40 transition-colors">
                  <td className="p-4 font-bold text-foreground">{p.crop}</td>
                  <td className="p-4 text-muted-foreground font-medium">{p.market}</td>
                  <td className="p-4">
                    <span className="font-display font-bold text-primary text-lg">{p.price}</span>
                    <span className="text-sm text-muted-foreground ml-1">/ {p.unit}</span>
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex items-center gap-1.5 text-sm font-bold px-3 py-1 rounded-full ${
                      p.trend === 'up' ? 'bg-red-50 text-red-600' :
                      p.trend === 'down' ? 'bg-emerald-50 text-emerald-600' :
                      'bg-slate-100 text-slate-600'
                    }`}>
                      {p.trend === 'up' ? <TrendingUp size={15} /> : p.trend === 'down' ? <TrendingDown size={15} /> : <Minus size={15} />}
                      {p.trend === 'up' ? 'Rising' : p.trend === 'down' ? 'Falling' : 'Stable'}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-muted-foreground">{format(new Date(p.updated_at), 'MMM d, yyyy • h:mm a')}</td>
                  <td className="p-4">
                    <button onClick={() => deletePrice.mutate(p.id)} className="text-destructive hover:text-destructive/80 p-2 rounded-xl hover:bg-destructive/10 transition-colors">
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan={6} className="p-12 text-center">
                  <span className="text-4xl mb-3 block">💰</span>
                  <p className="font-bold text-foreground">No prices set yet</p>
                  <p className="text-sm text-muted-foreground mt-1">Add your first market price above</p>
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // ════════════════════════════════════════════
  // ANNOUNCEMENTS TAB (CRUD)
  // ════════════════════════════════════════════
  const renderAnnouncements = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-accent/10 via-amber-50 to-orange-50 rounded-2xl border border-accent/20 p-5 flex items-center gap-4">
        <div className="p-3 bg-accent/20 rounded-xl text-accent"><Megaphone size={22} /></div>
        <div>
          <h3 className="font-bold font-display">Platform Broadcast Center</h3>
          <p className="text-sm text-muted-foreground">Messages you send here are visible to all regional managers, buyers, experts, and farmers.</p>
        </div>
      </div>

      {/* Compose */}
      <div className="bg-card p-6 rounded-2xl shadow-sm border border-border">
        <h2 className="text-lg font-bold font-display mb-4">Compose Announcement</h2>
        <div className="space-y-4">
          <input placeholder="Title (e.g. Heavy Rain Expected)" className="w-full px-4 py-3 border border-border rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-lg font-medium" value={newAnn.title} onChange={e => setNewAnn({ ...newAnn, title: e.target.value })} />
          <textarea placeholder="Write the full announcement description..." className="w-full px-4 py-3 border border-border rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none min-h-[120px] transition-all resize-none" value={newAnn.body} onChange={e => setNewAnn({ ...newAnn, body: e.target.value })} />
          <div className="flex items-center gap-4">
            <select className="px-4 py-3 border border-border rounded-xl outline-none transition-all font-medium" value={newAnn.type} onChange={e => setNewAnn({ ...newAnn, type: e.target.value })}>
              <option value="info">ℹ️ General Info</option>
              <option value="weather">🌧 Weather Alert</option>
              <option value="alert">⚠️ Urgent Alert</option>
            </select>
            <button onClick={() => addAnn.mutate(newAnn)} disabled={!newAnn.title || !newAnn.body || addAnn.isPending}
              className="bg-primary text-white rounded-xl flex items-center gap-2 hover:bg-primary/90 px-8 py-3 disabled:opacity-50 font-bold transition-all ml-auto shadow-md shadow-primary/20">
              <Megaphone size={20} /> Broadcast to Platform
            </button>
          </div>
        </div>
      </div>

      {/* List */}
      <div className="space-y-4">
        {loadingAnns ? (
          <div className="flex flex-col items-center gap-3 py-12">
            <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-muted-foreground font-medium">Loading announcements...</p>
          </div>
        ) : announcements && announcements.length > 0 ? announcements.map((a: any) => (
          <div key={a.id} className="bg-card p-6 rounded-2xl shadow-sm border border-border flex gap-5 transition-all hover:shadow-md">
            <div className={`p-4 rounded-2xl h-fit shrink-0 ${
              a.type === 'weather' ? 'bg-blue-50 text-blue-600' :
              a.type === 'alert' ? 'bg-red-50 text-red-600' :
              'bg-primary/10 text-primary'
            }`}><Bell size={24} /></div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1 flex-wrap">
                <span className={`text-xs font-extrabold px-2.5 py-1 rounded-md uppercase tracking-wider ${
                  a.type === 'weather' ? 'bg-blue-100 text-blue-700' :
                  a.type === 'alert' ? 'bg-red-100 text-red-700' :
                  'bg-primary/10 text-primary'
                }`}>{a.type === 'weather' ? '🌧 Weather' : a.type === 'alert' ? '⚠ Alert' : 'ℹ Info'}</span>
                <p className="text-xs text-muted-foreground font-medium">{format(new Date(a.created_at), 'MMM d, yyyy • h:mm a')}</p>
              </div>
              <h3 className="font-bold font-display text-xl text-foreground mt-2">{a.title}</h3>
              <p className="text-foreground/80 mt-2 leading-relaxed">{a.body}</p>
            </div>
            <button onClick={() => deleteAnn.mutate(a.id)} className="text-destructive hover:text-destructive/80 p-3 h-fit rounded-xl hover:bg-destructive/10 transition-colors shrink-0">
              <Trash2 size={20} />
            </button>
          </div>
        )) : (
          <div className="text-center py-16">
            <span className="text-5xl mb-4 block">📢</span>
            <h3 className="text-xl font-bold">No announcements yet</h3>
            <p className="text-muted-foreground mt-2">Compose your first broadcast above</p>
          </div>
        )}
      </div>
    </div>
  );

  // ════════════════════════════════════════════
  // PLATFORM STATS TAB
  // ════════════════════════════════════════════
  const renderPlatform = () => (
    <div className="space-y-6">
      {/* System Health */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {[
          { label: 'Total Farmers', value: totalFarmers.toLocaleString(), icon: Users, desc: `Across ${activeRegions} regions`, color: 'from-emerald-500 to-green-600' },
          { label: 'Total Experts', value: totalExperts.toString(), icon: UserCheck, desc: 'All specialties', color: 'from-blue-500 to-indigo-600' },
          { label: 'Uptime', value: '99.9%', icon: Server, desc: 'Last 30 days', color: 'from-purple-500 to-violet-600' },
          { label: 'API Requests', value: '2.4M', icon: Zap, desc: 'This month', color: 'from-amber-500 to-orange-500' },
        ].map((stat, i) => (
          <div key={i} className="relative overflow-hidden bg-card rounded-2xl border border-border p-6 hover:shadow-lg transition-all duration-300 group">
            <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${stat.color} opacity-[0.08] rounded-bl-[60px] group-hover:opacity-[0.15] transition-opacity`} />