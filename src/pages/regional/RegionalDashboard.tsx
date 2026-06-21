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