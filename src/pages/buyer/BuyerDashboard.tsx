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
            <h3 className="text-lg font-bold font-display">Recent Orders</h3>
            <button onClick={() => setActiveTab('orders')} className="text-sm text-primary font-semibold hover:underline flex items-center gap-1">
              View All <ChevronRight size={16} />
            </button>
          </div>
          <div className="space-y-3">
            {mockOrders.slice(0, 4).map((order) => {
              const sc = statusConfig[order.status];
              return (
                <div key={order.id} className="flex items-center gap-4 p-3.5 rounded-xl bg-muted/40 hover:bg-muted/70 transition-colors">
                  <span className="text-2xl">{order.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-foreground truncate">{order.crop}</p>
                    <p className="text-xs text-muted-foreground">{order.quantity} • {order.seller}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-bold text-sm">{order.totalPrice} ETB</p>
                    <span className={`inline-flex items-center gap-1 text-xs font-bold ${sc.color}`}>
                      <sc.icon size={12} /> {sc.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );

  // ═══════════════════════════════════════════
  // RENDER: MARKETPLACE
  // ═══════════════════════════════════════════
  const renderMarketplace = () => (
    <div className="space-y-6">
      {/* Search & Filters */}
      <div className="bg-card rounded-2xl border border-border p-5">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <input
              type="text"
              placeholder="Search crops, sellers..."
              className="w-full pl-11 pr-4 py-3 border border-border rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all bg-background text-foreground"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-3 flex-wrap">
            <div className="relative">
              <Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              <select
                className="pl-9 pr-8 py-3 border border-border rounded-xl focus:border-primary outline-none appearance-none bg-background text-foreground font-medium cursor-pointer"
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
              >
                {categories.map(c => <option key={c} value={c}>{c === 'All' ? 'All Categories' : c}</option>)}
              </select>
              <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            </div>
            <div className="relative">
              <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              <select
                className="pl-9 pr-8 py-3 border border-border rounded-xl focus:border-primary outline-none appearance-none bg-background text-foreground font-medium cursor-pointer"
                value={selectedRegion}
                onChange={e => setSelectedRegion(e.target.value)}
              >
                {regions.map(r => <option key={r} value={r}>{r === 'All' ? 'All Regions' : r}</option>)}
              </select>
              <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            </div>
          </div>
        </div>
        {/* Category Pills */}
        <div className="flex gap-2 mt-4 flex-wrap">
          {categories.map(cat => {
            const Icon = categoryIcons[cat] || Store;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                  selectedCategory === cat
                    ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground'
                }`}
              >
                <Icon size={15} /> {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Results Count */}
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">
          Showing <span className="font-bold text-foreground">{filteredItems.length}</span> products
        </p>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredItems.map((item, i) => (
          <div
            key={i}
            className="bg-card rounded-2xl border border-border overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
          >
            {/* Card Image Area */}
            <div className="relative h-44 bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 flex items-center justify-center overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.03] to-transparent group-hover:from-primary/[0.08] transition-all duration-500" />
              <span className="text-6xl transform group-hover:scale-110 transition-transform duration-500">{item.emoji}</span>
              {/* Rating Badge */}
              <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full px-2.5 py-1 flex items-center gap-1 shadow-sm">
                <Star size={13} className="text-amber-500 fill-amber-500" />
                <span className="text-xs font-bold text-foreground">{item.rating}</span>
              </div>
              {/* Category Badge */}
              <div className="absolute top-3 left-3 bg-primary/90 text-white text-xs font-bold px-3 py-1 rounded-full backdrop-blur-sm">
                {item.category}
              </div>
            </div>

            {/* Card Body */}
            <div className="p-5">
              <h3 className="font-bold text-lg text-foreground leading-tight">{item.crop}</h3>
              <div className="flex items-center gap-1.5 mt-1.5 text-sm text-muted-foreground">
                <MapPin size={13} />
                <span>{item.seller} • {item.region}</span>
              </div>

              <div className="flex items-baseline gap-1 mt-3">
                <span className="text-2xl font-display font-bold text-primary">{item.price}</span>
                <span className="text-sm text-muted-foreground font-medium">ETB / 100kg</span>
              </div>

              <div className="flex justify-between items-center mt-4 pt-4 border-t border-border/60">
                <span className="text-sm font-semibold text-secondary bg-secondary/10 px-3 py-1 rounded-full">
                  📦 {item.stock}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setDetailModal(item)}
                    className="p-2.5 border border-border rounded-xl hover:bg-muted transition-colors"
                    title="View Details"
                  >
                    <Eye size={16} className="text-muted-foreground" />
                  </button>
                  <button
                    onClick={() => { setOrderModal(item); setOrderQuantity('1'); }}
                    className="px-5 py-2.5 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition-all shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 active:scale-95"
                  >
                    Order Now
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-16">
          <span className="text-5xl mb-4 block">🔍</span>
          <h3 className="text-xl font-bold text-foreground">No products found</h3>
          <p className="text-muted-foreground mt-2">Try adjusting your search or filter criteria</p>
          <button onClick={() => { setSearchQuery(''); setSelectedCategory('All'); setSelectedRegion('All'); }}
            className="mt-4 px-6 py-2.5 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90">
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );

  // ═══════════════════════════════════════════
  // RENDER: ORDERS
  // ═══════════════════════════════════════════
  const renderOrders = () => (
    <div className="space-y-6">
      {/* Order Status Filters */}
      <div className="flex gap-2 flex-wrap">
        {(['all', 'pending', 'confirmed', 'shipped', 'delivered', 'cancelled'] as const).map(status => (
          <button
            key={status}
            onClick={() => setOrderFilter(status)}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 capitalize ${
              orderFilter === status
                ? 'bg-primary text-primary-foreground shadow-md'
                : 'bg-card border border-border text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
          >
            {status === 'all' ? 'All Orders' : status}
            {status === 'all' && <span className="ml-1.5 bg-white/20 px-1.5 py-0.5 rounded-full text-xs">{mockOrders.length}</span>}
          </button>
        ))}
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.map((order) => {
          const sc = statusConfig[order.status];
          const StatusIcon = sc.icon;
          return (
            <div key={order.id} className="bg-card rounded-2xl border border-border p-6 hover:shadow-lg transition-all duration-300">
              <div className="flex flex-col md:flex-row md:items-center gap-5">
                {/* Icon + Info */}
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center text-3xl shrink-0">
                    {order.emoji}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-foreground">{order.crop}</h3>
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${sc.bg} ${sc.color}`}>
                        <StatusIcon size={13} /> {sc.label}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {order.seller} • <MapPin size={12} className="inline" /> {order.region}
                    </p>
                  </div>
                </div>

                {/* Order Details */}
                <div className="flex items-center gap-8 flex-wrap">
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground font-medium">Order ID</p>
                    <p className="font-mono font-bold text-sm text-foreground">{order.id}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground font-medium">Quantity</p>
                    <p className="font-bold text-sm text-foreground">{order.quantity}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground font-medium">Total</p>
                    <p className="font-bold text-sm text-primary">{order.totalPrice} ETB</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground font-medium">Date</p>
                    <p className="font-bold text-sm text-foreground flex items-center gap-1">
                      <CalendarDays size={13} /> {format(new Date(order.date), 'MMM d, yyyy')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Progress Bar for shipped/confirmed */}
              {(order.status === 'shipped' || order.status === 'confirmed') && (
                <div className="mt-5 pt-5 border-t border-border/60">
                  <div className="flex items-center gap-2 mb-2">
                    <Truck size={16} className="text-primary" />
                    <span className="text-sm font-semibold text-foreground">Order Progress</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {['Placed', 'Confirmed', 'Shipped', 'Delivered'].map((step, idx) => {
                      const progress = order.status === 'confirmed' ? 2 : 3;
                      const isActive = idx < progress;
                      return (
                        <div key={step} className="flex-1 flex flex-col items-center gap-1.5">
                          <div className={`h-1.5 w-full rounded-full ${isActive ? 'bg-primary' : 'bg-border'}`} />
                          <span className={`text-xs font-medium ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>{step}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filteredOrders.length === 0 && (
        <div className="text-center py-16">
          <span className="text-5xl mb-4 block">📋</span>
          <h3 className="text-xl font-bold text-foreground">No orders found</h3>
          <p className="text-muted-foreground mt-2">No orders match the selected filter</p>
        </div>
      )}
    </div>
  );

  // ═══════════════════════════════════════════
  // RENDER: MARKET PRICES (from Supabase)
  // ═══════════════════════════════════════════
  const renderPrices = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-primary/10 via-secondary/5 to-accent/10 rounded-2xl border border-primary/20 p-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2.5 bg-primary/20 rounded-xl text-primary"><BarChart3 size={22} /></div>
          <div>
            <h3 className="font-bold font-display text-lg">Live Market Intelligence</h3>
            <p className="text-sm text-muted-foreground">Real-time commodity prices updated by AgriBridge platform</p>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-muted/70 border-b border-border">
                <th className="p-4 font-semibold text-muted-foreground text-sm">Crop</th>
                <th className="p-4 font-semibold text-muted-foreground text-sm">Market</th>
                <th className="p-4 font-semibold text-muted-foreground text-sm">Price (ETB)</th>
                <th className="p-4 font-semibold text-muted-foreground text-sm">Trend</th>
                <th className="p-4 font-semibold text-muted-foreground text-sm">Updated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loadingPrices ? (
                <tr><td colSpan={5} className="p-12 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
                    <p className="text-muted-foreground font-medium">Loading market prices...</p>
                  </div>
                </td></tr>
              ) : prices && prices.length > 0 ? prices.map((p: any) => (
                <tr key={p.id} className="hover:bg-muted/40 transition-colors">
                  <td className="p-4">
                    <span className="font-bold text-foreground">{p.crop}</span>
                  </td>
                  <td className="p-4 text-muted-foreground font-medium">{p.market}</td>
                  <td className="p-4">
                    <span className="font-display font-bold text-primary text-lg">{p.price}</span>
                    <span className="text-sm text-muted-foreground ml-1">/ {p.unit}</span>
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex items-center gap-1.5 text-sm font-bold px-3 py-1 rounded-full ${