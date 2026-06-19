import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell
} from 'recharts';
import {
  LogOut, ShoppingCart, Search, Store, LayoutDashboard, TrendingUp, TrendingDown,
  Minus, Package, Bell, X, ChevronRight, MapPin, Filter, Star, Wheat,
  Coffee, Leaf, ChevronDown, Clock, CheckCircle, Truck, Eye, BarChart3,
  DollarSign, ShoppingBag, CalendarDays, ArrowUpRight, Menu, XCircle
} from 'lucide-react';

// ─── TYPES ───
type Tab = 'overview' | 'marketplace' | 'orders' | 'prices' | 'announcements';
type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';

interface Order {
  id: string;
  crop: string;
  seller: string;
  quantity: string;
  totalPrice: string;
  status: OrderStatus;
  date: string;
  region: string;
  emoji: string;
}

interface MarketItem {
  crop: string;
  price: string;
  seller: string;
  region: string;
  stock: string;
  rating: number;
  category: string;
  emoji: string;
  description: string;
}

// ─── MOCK DATA ───
const spendingData = [
  { name: 'Jan', amount: 120000 },
  { name: 'Feb', amount: 185000 },
  { name: 'Mar', amount: 240000 },
  { name: 'Apr', amount: 198000 },
  { name: 'May', amount: 310000 },
  { name: 'Jun', amount: 420000 },
];

const categoryData = [
  { name: 'Grains', value: 45 },
  { name: 'Coffee', value: 25 },
  { name: 'Oil Seeds', value: 18 },
  { name: 'Spices', value: 12 },
];
const PIE_COLORS = ['#2E7D32', '#F4A000', '#4CAF50', '#1B5E20'];

const topSuppliersData = [
  { name: 'Jimma Co-op', volume: 85 },
  { name: 'Hawassa Co-op', volume: 72 },
  { name: 'Adama Union', volume: 65 },
  { name: 'Bahir Dar Co-op', volume: 58 },
  { name: 'Arsi Union', volume: 45 },
];

const marketplaceItems: MarketItem[] = [
  { crop: 'White Teff (Export Grade)', price: '6,200', seller: 'Hawassa Co-op', region: 'SNNPR', stock: '50 Tonnes', rating: 4.8, category: 'Grains', emoji: '🌾', description: 'Premium export-grade white teff, cleaned and sorted. Ideal for injera production and export markets.' },
  { crop: 'Red Teff (Premium)', price: '5,800', seller: 'Adama Farmers Union', region: 'Oromia', stock: '30 Tonnes', rating: 4.6, category: 'Grains', emoji: '🌾', description: 'High-quality red teff with rich mineral content. Traditionally grown in the highlands of Oromia.' },
  { crop: 'Arabica Coffee (Washed)', price: '18,500', seller: 'Jimma Co-op', region: 'Oromia', stock: '20 Tonnes', rating: 4.9, category: 'Coffee', emoji: '☕', description: 'Specialty-grade washed Arabica coffee from Jimma region. Cupping score 85+. Perfect for export.' },
  { crop: 'White Maize', price: '3,200', seller: 'Bahir Dar Coop', region: 'Amhara', stock: '100 Tonnes', rating: 4.4, category: 'Grains', emoji: '🌽', description: 'Bulk white maize suitable for animal feed and flour production. Moisture content below 12.5%.' },
  { crop: 'Sesame Seeds', price: '12,000', seller: 'Humera Traders', region: 'Tigray', stock: '15 Tonnes', rating: 4.7, category: 'Oil Seeds', emoji: '🫘', description: 'Humera-type sesame seeds, known worldwide for their exceptional oil content and nutty flavor.' },
  { crop: 'Wheat (Bread)', price: '4,100', seller: 'Arsi Union', region: 'Oromia', stock: '45 Tonnes', rating: 4.5, category: 'Grains', emoji: '🌾', description: 'Bread wheat variety from Arsi zone. High protein content suitable for bakery products.' },
  { crop: 'Robusta Coffee (Natural)', price: '14,200', seller: 'Teppi Growers', region: 'SNNPR', stock: '12 Tonnes', rating: 4.3, category: 'Coffee', emoji: '☕', description: 'Sun-dried natural process Robusta beans. Bold flavor profile, ideal for espresso blends.' },
  { crop: 'Niger Seed (Noug)', price: '8,500', seller: 'Gojjam Farmers', region: 'Amhara', stock: '25 Tonnes', rating: 4.2, category: 'Oil Seeds', emoji: '🌻', description: 'Organic niger seed for premium cooking oil extraction. High omega-3 fatty acid content.' },
  { crop: 'Black Cumin', price: '22,000', seller: 'Bale Spice Union', region: 'Oromia', stock: '5 Tonnes', rating: 4.9, category: 'Spices', emoji: '🫙', description: 'Rare Ethiopian black cumin (Tikur Azmud). Medicinal grade with intense aroma and flavor.' },
];

const mockOrders: Order[] = [
  { id: 'ORD-2026-001', crop: 'White Teff (Export Grade)', seller: 'Hawassa Co-op', quantity: '10 Tonnes', totalPrice: '620,000', status: 'delivered', date: '2026-06-01', region: 'SNNPR', emoji: '🌾' },
  { id: 'ORD-2026-002', crop: 'Arabica Coffee (Washed)', seller: 'Jimma Co-op', quantity: '5 Tonnes', totalPrice: '925,000', status: 'shipped', date: '2026-06-15', region: 'Oromia', emoji: '☕' },
  { id: 'ORD-2026-003', crop: 'Sesame Seeds', seller: 'Humera Traders', quantity: '8 Tonnes', totalPrice: '960,000', status: 'confirmed', date: '2026-06-22', region: 'Tigray', emoji: '🫘' },
  { id: 'ORD-2026-004', crop: 'Black Cumin', seller: 'Bale Spice Union', quantity: '2 Tonnes', totalPrice: '440,000', status: 'pending', date: '2026-06-28', region: 'Oromia', emoji: '🫙' },
  { id: 'ORD-2026-005', crop: 'White Maize', seller: 'Bahir Dar Coop', quantity: '20 Tonnes', totalPrice: '640,000', status: 'cancelled', date: '2026-06-10', region: 'Amhara', emoji: '🌽' },
];

// ─── HELPERS ───
const statusConfig: Record<OrderStatus, { color: string; bg: string; icon: any; label: string }> = {
  pending: { color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200', icon: Clock, label: 'Pending' },
  confirmed: { color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200', icon: CheckCircle, label: 'Confirmed' },
  shipped: { color: 'text-purple-700', bg: 'bg-purple-50 border-purple-200', icon: Truck, label: 'Shipped' },
  delivered: { color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200', icon: CheckCircle, label: 'Delivered' },
  cancelled: { color: 'text-red-700', bg: 'bg-red-50 border-red-200', icon: XCircle, label: 'Cancelled' },
};

const categoryIcons: Record<string, any> = {
  'Grains': Wheat,
  'Coffee': Coffee,
  'Oil Seeds': Leaf,
  'Spices': Leaf,
  'All': Store,
};

export default function BuyerDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedRegion, setSelectedRegion] = useState('All');
  const [orderFilter, setOrderFilter] = useState<'all' | OrderStatus>('all');
  const [orderModal, setOrderModal] = useState<MarketItem | null>(null);
  const [orderQuantity, setOrderQuantity] = useState('1');
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [detailModal, setDetailModal] = useState<MarketItem | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

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

  // ─── FILTERED MARKETPLACE ───
  const filteredItems = useMemo(() => {
    return marketplaceItems.filter(item => {
      const matchesSearch = item.crop.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.seller.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
      const matchesRegion = selectedRegion === 'All' || item.region === selectedRegion;
      return matchesSearch && matchesCategory && matchesRegion;
    });
  }, [searchQuery, selectedCategory, selectedRegion]);

  // ─── FILTERED ORDERS ───
  const filteredOrders = useMemo(() => {
    if (orderFilter === 'all') return mockOrders;
    return mockOrders.filter(o => o.status === orderFilter);
  }, [orderFilter]);

  const regions = ['All', ...new Set(marketplaceItems.map(i => i.region))];
  const categories = ['All', 'Grains', 'Coffee', 'Oil Seeds', 'Spices'];

  // ─── HANDLE ORDER ───
  const handlePlaceOrder = () => {
    setOrderSuccess(true);
    setTimeout(() => {
      setOrderSuccess(false);
      setOrderModal(null);
      setOrderQuantity('1');
    }, 2500);
  };

  // ─── SIDEBAR NAV ITEMS ───
  const navItems: { id: Tab; label: string; icon: any; badge?: string }[] = [
    { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'marketplace', label: 'Marketplace', icon: Store },
    { id: 'orders', label: 'My Orders', icon: ShoppingCart, badge: `${mockOrders.filter(o => o.status === 'pending' || o.status === 'shipped').length}` },
    { id: 'prices', label: 'Market Prices', icon: BarChart3 },
    { id: 'announcements', label: 'Announcements', icon: Bell, badge: announcements?.length ? `${announcements.length}` : undefined },
  ];

  // ═══════════════════════════════════════════
  // RENDER: OVERVIEW
  // ═══════════════════════════════════════════
  const renderOverview = () => (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {[
          { label: 'Total Spent', value: '1.47M ETB', icon: DollarSign, change: '+22.4%', color: 'from-emerald-500 to-green-600' },
          { label: 'Active Orders', value: '3', icon: ShoppingBag, change: '2 in transit', color: 'from-amber-500 to-orange-500' },
          { label: 'Products Bought', value: '28', icon: Package, change: '+5 this month', color: 'from-blue-500 to-indigo-600' },
          { label: 'Suppliers', value: '12', icon: Store, change: '3 new', color: 'from-purple-500 to-violet-600' },
        ].map((stat, i) => (
          <div key={i} className="relative overflow-hidden bg-card rounded-2xl border border-border p-6 hover:shadow-lg transition-all duration-300 group">
            <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${stat.color} opacity-[0.08] rounded-bl-[60px] group-hover:opacity-[0.15] transition-opacity duration-300`} />
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

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Spending Chart */}
        <div className="lg:col-span-2 bg-card rounded-2xl border border-border p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-bold font-display">Spending Overview</h3>
              <p className="text-sm text-muted-foreground">Monthly purchase volume in ETB</p>
            </div>
            <span className="text-xs font-bold text-secondary bg-secondary/10 px-3 py-1.5 rounded-full flex items-center gap-1">
              <TrendingUp size={14} /> +35.5%
            </span>
          </div>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={spendingData}>
                <defs>
                  <linearGradient id="spendGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2E7D32" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#2E7D32" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 13 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 13 }} tickFormatter={v => `${(v / 1000).toFixed(0)}K`} />
                <RechartsTooltip
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 10px 30px rgba(0,0,0,0.08)' }}
                  formatter={(value: any) => [`${Number(value).toLocaleString()} ETB`, 'Spending']}
                />
                <Area type="monotone" dataKey="amount" stroke="#2E7D32" strokeWidth={3} fill="url(#spendGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="bg-card rounded-2xl border border-border p-6">
          <h3 className="text-lg font-bold font-display mb-2">Purchase Categories</h3>
          <p className="text-sm text-muted-foreground mb-4">Distribution by crop type</p>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={categoryData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={4} dataKey="value" stroke="none">
                  {categoryData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {categoryData.map((cat, i) => (
              <div key={i} className="flex items-center gap-2 text-sm">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: PIE_COLORS[i] }} />
                <span className="text-muted-foreground">{cat.name}</span>
                <span className="font-bold ml-auto">{cat.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Suppliers */}
        <div className="bg-card rounded-2xl border border-border p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold font-display">Top Suppliers</h3>
            <button onClick={() => setActiveTab('marketplace')} className="text-sm text-primary font-semibold hover:underline flex items-center gap-1">
              View All <ChevronRight size={16} />
            </button>
          </div>
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topSuppliersData} layout="vertical" margin={{ left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} width={100} tick={{ fill: '#64748b', fontSize: 12 }} />
                <RechartsTooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }} formatter={(v: any) => [`${v} Tonnes`, 'Volume']} />
                <Bar dataKey="volume" fill="#2E7D32" radius={[0, 6, 6, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-card rounded-2xl border border-border p-6">
          <div className="flex justify-between items-center mb-6">