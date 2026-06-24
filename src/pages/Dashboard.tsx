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