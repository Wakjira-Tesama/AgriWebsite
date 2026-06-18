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