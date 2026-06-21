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