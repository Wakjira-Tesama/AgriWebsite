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