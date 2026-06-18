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