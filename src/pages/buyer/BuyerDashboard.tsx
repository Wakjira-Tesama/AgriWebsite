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