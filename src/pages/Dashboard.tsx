import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../integrations/supabase/client';
import { 
  Plus, Trash2, TrendingUp, TrendingDown, Minus, 
  LayoutDashboard, Users, Store, Bell, FileText, CheckCircle, LogOut
} from 'lucide-react';
import { format } from 'date-fns';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, Legend
} from 'recharts';

// --- MOCK DATA FOR CHARTS ---
const userGrowthData = [
  { name: 'Jan', farmers: 400, buyers: 240, experts: 20 },
  { name: 'Feb', farmers: 800, buyers: 350, experts: 45 },
  { name: 'Mar', farmers: 1200, buyers: 500, experts: 60 },
  { name: 'Apr', farmers: 2100, buyers: 800, experts: 85 },
  { name: 'May', farmers: 3500, buyers: 1200, experts: 110 },
  { name: 'Jun', farmers: 5200, buyers: 1800, experts: 140 },
];

const cropVolumeData = [
  { name: 'Teff', volume: 4000 },
  { name: 'Maize', volume: 3000 },
  { name: 'Coffee', volume: 2000 },
  { name: 'Wheat', volume: 2780 },
  { name: 'Sorghum', volume: 1890 },
];

const regionalData = [
  { name: 'Oromia', value: 4500 },
  { name: 'Amhara', value: 3200 },
  { name: 'SNNPR', value: 2100 },
  { name: 'Sidama', value: 1500 },
];
const COLORS = ['#2E7D32', '#4CAF50', '#F4A000', '#2D2D2D'];

// --- MOCK USERS FOR VERIFICATION ---
const mockUsers = [
  { id: '1', name: 'Abebe Kebede', role: 'farmer', location: 'Oromia', status: 'verified', joined: '2026-01-15' },
  { id: '2', name: 'Selam Trading PLC', role: 'buyer', location: 'Addis Ababa', status: 'pending', joined: '2026-06-20' },
  { id: '3', name: 'Dr. Yonas Alemu', role: 'expert', location: 'Amhara', status: 'pending', joined: '2026-06-25' },
  { id: '4', name: 'Hawassa Co-op', role: 'buyer', location: 'Sidama', status: 'verified', joined: '2026-03-10' },
  { id: '5', name: 'Tigist Bekele', role: 'farmer', location: 'SNNPR', status: 'verified', joined: '2026-02-28' },
];

export default function Dashboard() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'prices' | 'announcements'>('overview');
  
  // Market Prices State
  const [newPrice, setNewPrice] = useState({ crop: '', market: '', price: '', unit: '100kg', trend: 'stable' });
  
  // Announcements State
  const [newAnn, setNewAnn] = useState({ title: '', body: '', type: 'info' });

  // Queries
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

  // Mutations
  const addPrice = useMutation({
    mutationFn: async (price: any) => {
      const { error } = await supabase.from('market_prices').insert(price);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['market_prices'] });
      setNewPrice({ crop: '', market: '', price: '', unit: '100kg', trend: 'stable' });
    }
  });

  const deletePrice = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('market_prices').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['market_prices'] })
  });

  const addAnn = useMutation({
    mutationFn: async (ann: any) => {
      const { error } = await supabase.from('announcements').insert(ann);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
      setNewAnn({ title: '', body: '', type: 'info' });
    }
  });

  const deleteAnn = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('announcements').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['announcements'] })
  });

  const renderOverview = () => (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Top Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-card p-6 rounded-2xl shadow-sm border border-border">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-muted-foreground font-medium">Total Users</p>
              <h3 className="text-3xl font-display font-bold text-foreground mt-2">12,450</h3>
            </div>
            <div className="p-3 bg-primary/10 rounded-xl text-primary"><Users size={24} /></div>
          </div>
          <p className="text-sm text-secondary font-medium mt-4 flex items-center gap-1">
            <TrendingUp size={16} /> +15.3% this month
          </p>
        </div>
        
        <div className="bg-card p-6 rounded-2xl shadow-sm border border-border">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-muted-foreground font-medium">Market Transactions</p>
              <h3 className="text-3xl font-display font-bold text-foreground mt-2">8,210</h3>
            </div>
            <div className="p-3 bg-accent/10 rounded-xl text-accent"><Store size={24} /></div>
          </div>
          <p className="text-sm text-secondary font-medium mt-4 flex items-center gap-1">
            <TrendingUp size={16} /> +8.2% this month
          </p>
        </div>

        <div className="bg-card p-6 rounded-2xl shadow-sm border border-border">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-muted-foreground font-medium">Revenue (ETB)</p>
              <h3 className="text-3xl font-display font-bold text-foreground mt-2">4.2M</h3>
            </div>
            <div className="p-3 bg-secondary/10 rounded-xl text-secondary"><FileText size={24} /></div>
          </div>
          <p className="text-sm text-secondary font-medium mt-4 flex items-center gap-1">
            <TrendingUp size={16} /> +22.4% this month
          </p>
        </div>

        <div className="bg-card p-6 rounded-2xl shadow-sm border border-border">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-muted-foreground font-medium">Pending Approvals</p>
              <h3 className="text-3xl font-display font-bold text-foreground mt-2">42</h3>
            </div>
            <div className="p-3 bg-destructive/10 rounded-xl text-destructive"><CheckCircle size={24} /></div>
          </div>
          <p className="text-sm text-muted-foreground font-medium mt-4">
            Buyers & Experts
          </p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card p-6 rounded-2xl shadow-sm border border-border">
          <h3 className="text-lg font-bold font-display mb-6">User Growth Overview</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={userGrowthData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <RechartsTooltip />
                <Area type="monotone" dataKey="farmers" stackId="1" stroke="#2E7D32" fill="#2E7D32" fillOpacity={0.8} name="Farmers" />
                <Area type="monotone" dataKey="buyers" stackId="1" stroke="#F4A000" fill="#F4A000" fillOpacity={0.8} name="Buyers" />
                <Area type="monotone" dataKey="experts" stackId="1" stroke="#4CAF50" fill="#4CAF50" fillOpacity={0.8} name="Experts" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-card p-6 rounded-2xl shadow-sm border border-border">
          <h3 className="text-lg font-bold font-display mb-6">Top Crops by Volume (Tonnes)</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cropVolumeData} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                <XAxis type="number" axisLine={false} tickLine={false} />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} />
                <RechartsTooltip />
                <Bar dataKey="volume" fill="#2E7D32" radius={[0, 4, 4, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-card p-6 rounded-2xl shadow-sm border border-border lg:col-span-1">
          <h3 className="text-lg font-bold font-display mb-6">User Distribution by Region</h3>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={regionalData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {regionalData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-card p-6 rounded-2xl shadow-sm border border-border lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold font-display">Recent Advisory Requests</h3>
            <button className="text-primary text-sm font-semibold hover:underline">View All</button>
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-muted/50 rounded-xl">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-accent/20 text-accent flex items-center justify-center font-bold">
                    FA
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Maize leaves turning yellow</p>
                    <p className="text-sm text-muted-foreground">Requested by Abebe - 2 hours ago</p>
                  </div>
                </div>
                <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-bold rounded-full">Pending Expert</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderUsers = () => (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold font-display">Users & Verifications</h2>
        <div className="flex gap-2">
          <input type="text" placeholder="Search users..." className="px-4 py-2 border border-border rounded-lg outline-none focus:border-primary" />
          <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-semibold">Filter</button>
        </div>
      </div>
      
      <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-muted border-b border-border">
              <th className="p-4 font-semibold text-muted-foreground text-sm">Name / Entity</th>
              <th className="p-4 font-semibold text-muted-foreground text-sm">Role</th>
              <th className="p-4 font-semibold text-muted-foreground text-sm">Location</th>
              <th className="p-4 font-semibold text-muted-foreground text-sm">Joined</th>
              <th className="p-4 font-semibold text-muted-foreground text-sm">Status</th>
              <th className="p-4 font-semibold text-muted-foreground text-sm text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {mockUsers.map(u => (
              <tr key={u.id} className="hover:bg-muted/50 transition-colors">
                <td className="p-4 font-medium text-foreground">{u.name}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 text-xs font-bold rounded-full capitalize ${
                    u.role === 'farmer' ? 'bg-secondary/20 text-secondary' : 
                    u.role === 'buyer' ? 'bg-accent/20 text-accent' : 
                    'bg-primary/20 text-primary'
                  }`}>
                    {u.role}
                  </span>
                </td>
                <td className="p-4 text-muted-foreground text-sm">{u.location}</td>
                <td className="p-4 text-muted-foreground text-sm">{format(new Date(u.joined), 'MMM d, yyyy')}</td>
                <td className="p-4">
                  <span className={`flex items-center gap-1.5 text-sm font-semibold ${
                    u.status === 'verified' ? 'text-secondary' : 'text-accent'
                  }`}>
                    {u.status === 'verified' ? <CheckCircle size={16} /> : <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />}
                    <span className="capitalize">{u.status}</span>
                  </span>
                </td>
                <td className="p-4 text-right">
                  {u.status === 'pending' ? (
                    <button className="px-3 py-1.5 bg-primary text-primary-foreground text-xs font-bold rounded-lg hover:bg-primary/90">
                      Verify Now
                    </button>
                  ) : (
                    <button className="px-3 py-1.5 border border-border text-foreground text-xs font-bold rounded-lg hover:bg-muted">
                      Manage
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderPrices = () => (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="bg-card p-6 rounded-2xl shadow-sm border border-border">
        <h2 className="text-lg font-bold font-display mb-4">Add New Market Price</h2>
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <input 
            placeholder="Crop (e.g. Teff)" 
            className="px-4 py-2.5 border border-border rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none md:col-span-2 transition-all"
            value={newPrice.crop}
            onChange={e => setNewPrice({...newPrice, crop: e.target.value})}
          />
          <input 
            placeholder="Market (e.g. Addis)" 
            className="px-4 py-2.5 border border-border rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
            value={newPrice.market}
            onChange={e => setNewPrice({...newPrice, market: e.target.value})}
          />
          <input 
            placeholder="Price (ETB)" 
            type="number"
            className="px-4 py-2.5 border border-border rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
            value={newPrice.price}
            onChange={e => setNewPrice({...newPrice, price: e.target.value})}
          />
          <select 
            className="px-4 py-2.5 border border-border rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
            value={newPrice.trend}
            onChange={e => setNewPrice({...newPrice, trend: e.target.value})}
          >
            <option value="up">Going Up</option>
            <option value="down">Going Down</option>
            <option value="stable">Stable</option>
          </select>
          <button 
            onClick={() => addPrice.mutate(newPrice)}
            disabled={!newPrice.crop || !newPrice.market || !newPrice.price || addPrice.isPending}
            className="bg-primary text-primary-foreground rounded-xl flex items-center justify-center gap-2 hover:bg-primary/90 disabled:opacity-50 font-bold transition-all"
          >
            <Plus size={18} /> Add Price
          </button>
        </div>
      </div>

      <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-muted border-b border-border">
              <th className="p-4 font-semibold text-muted-foreground text-sm">Crop</th>
              <th className="p-4 font-semibold text-muted-foreground text-sm">Market</th>
              <th className="p-4 font-semibold text-muted-foreground text-sm">Price (ETB)</th>
              <th className="p-4 font-semibold text-muted-foreground text-sm">Trend</th>
              <th className="p-4 font-semibold text-muted-foreground text-sm">Updated</th>
              <th className="p-4 font-semibold text-muted-foreground text-sm w-16">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loadingPrices ? (
              <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">Loading prices...</td></tr>
            ) : prices?.map((p: any) => (
              <tr key={p.id} className="hover:bg-muted/50 transition-colors">
                <td className="p-4 font-medium text-foreground">{p.crop}</td>
                <td className="p-4 text-muted-foreground">{p.market}</td>
                <td className="p-4 font-bold text-primary">{p.price} / {p.unit}</td>
                <td className="p-4">
                  {p.trend === 'up' ? <TrendingUp className="text-destructive" size={20} /> :
                   p.trend === 'down' ? <TrendingDown className="text-secondary" size={20} /> :
                   <Minus className="text-muted-foreground" size={20} />}
                </td>
                <td className="p-4 text-sm text-muted-foreground">{format(new Date(p.updated_at), 'MMM d, yyyy')}</td>
                <td className="p-4">
                  <button onClick={() => deletePrice.mutate(p.id)} className="text-destructive hover:text-destructive/80 p-2 rounded-xl hover:bg-destructive/10 transition-colors">
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderAnnouncements = () => (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="bg-card p-6 rounded-2xl shadow-sm border border-border">
        <h2 className="text-lg font-bold font-display mb-4">Post Announcement / Alert</h2>
        <div className="space-y-4">
          <input 
            placeholder="Title (e.g. Heavy Rain Expected)" 
            className="w-full px-4 py-3 border border-border rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-lg font-medium"
            value={newAnn.title}
            onChange={e => setNewAnn({...newAnn, title: e.target.value})}
          />
          <textarea 
            placeholder="Write the full announcement description..." 
            className="w-full px-4 py-3 border border-border rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none min-h-[120px] transition-all resize-none"
            value={newAnn.body}
            onChange={e => setNewAnn({...newAnn, body: e.target.value})}
          />
          <div className="flex items-center gap-4">
            <select 
              className="px-4 py-3 border border-border rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all font-medium"
              value={newAnn.type}
              onChange={e => setNewAnn({...newAnn, type: e.target.value})}
            >
              <option value="info">General Info</option>
              <option value="weather">Weather Alert</option>
              <option value="alert">Urgent Alert</option>
            </select>
            <button 
              onClick={() => addAnn.mutate(newAnn)}
              disabled={!newAnn.title || !newAnn.body || addAnn.isPending}
              className="bg-primary text-primary-foreground rounded-xl flex items-center gap-2 hover:bg-primary/90 px-8 py-3 disabled:opacity-50 font-bold transition-all ml-auto"
            >
              <Plus size={20} /> Post to Platform
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {loadingAnns ? (
          <p className="p-8 text-center text-muted-foreground">Loading announcements...</p>
        ) : announcements?.map((a: any) => (
          <div key={a.id} className="bg-card p-6 rounded-2xl shadow-sm border border-border flex gap-5 transition-all hover:shadow-md">
            <div className={`p-4 rounded-2xl h-fit ${
              a.type === 'weather' ? 'bg-blue-100 text-blue-700' :
              a.type === 'alert' ? 'bg-destructive/10 text-destructive' :
              'bg-primary/10 text-primary'
            }`}>
              <Bell size={24} />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <span className={`text-xs font-extrabold px-2.5 py-1 rounded-md uppercase tracking-wider ${
                  a.type === 'weather' ? 'bg-blue-100 text-blue-700' :
                  a.type === 'alert' ? 'bg-destructive/10 text-destructive' :
                  'bg-primary/10 text-primary'
                }`}>{a.type}</span>
                <p className="text-xs text-muted-foreground font-medium">{format(new Date(a.created_at), 'MMM d, yyyy • h:mm a')}</p>
              </div>
              <h3 className="font-bold font-display text-xl text-foreground mt-2">{a.title}</h3>
              <p className="text-foreground/80 mt-2 leading-relaxed">{a.body}</p>
            </div>
            <button onClick={() => deleteAnn.mutate(a.id)} className="text-destructive hover:text-destructive/80 p-3 h-fit rounded-xl hover:bg-destructive/10 transition-colors">
              <Trash2 size={20} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-card border-r border-border shrink-0 flex flex-col h-auto md:h-screen sticky top-0">
        <div className="p-6 flex items-center gap-3 border-b border-border">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white font-bold">A</div>
          <span className="font-display font-bold text-xl text-foreground">AgriBridge Admin</span>
        </div>
        
        <div className="flex-1 p-4 space-y-2 overflow-y-auto">
          <button 
            onClick={() => setActiveTab('overview')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
              activeTab === 'overview' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
          >
            <LayoutDashboard size={20} /> Dashboard
          </button>
          
          <button 
            onClick={() => setActiveTab('users')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
              activeTab === 'users' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
          >
            <Users size={20} /> Users & Verification
            <span className="ml-auto bg-accent text-white text-xs font-bold px-2 py-0.5 rounded-full">42</span>
          </button>

          <button 
            onClick={() => setActiveTab('prices')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
              activeTab === 'prices' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
          >
            <Store size={20} /> Market Prices
          </button>

          <button 
            onClick={() => setActiveTab('announcements')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
              activeTab === 'announcements' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
          >
            <Bell size={20} /> Announcements
          </button>
        </div>
        
        <div className="p-4 border-t border-border">
          <button 
            onClick={() => {
              supabase.auth.signOut().then(() => window.location.href = '/admin-login');
            }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-destructive hover:bg-destructive/10 transition-colors"
          >
            <LogOut size={20} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 lg:p-10 overflow-y-auto max-h-screen">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">
              {activeTab === 'overview' && 'Analytics Overview'}
              {activeTab === 'users' && 'User Management'}
              {activeTab === 'prices' && 'Market Intelligence'}
              {activeTab === 'announcements' && 'Broadcast Center'}
            </h1>
            <p className="text-muted-foreground mt-1">Manage and monitor the AgriBridge platform.</p>
          </div>
          
          <div className="flex items-center gap-4">
            <button className="w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center text-foreground hover:bg-muted transition-colors">
              <Bell size={18} />
            </button>
            <div className="flex items-center gap-3 pl-4 border-l border-border">
              <div className="w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold">AD</div>
              <div className="hidden sm:block text-sm">
                <p className="font-bold text-foreground">System Admin</p>
                <p className="text-muted-foreground">admin@agribridge.com</p>
              </div>
            </div>
          </div>
        </header>

        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'users' && renderUsers()}
        {activeTab === 'prices' && renderPrices()}
        {activeTab === 'announcements' && renderAnnouncements()}
      </main>
    </div>
  );
}
