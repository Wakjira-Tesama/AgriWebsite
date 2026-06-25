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