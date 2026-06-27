import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../integrations/supabase/client';
import { Plus, Trash2, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { format } from 'date-fns';

export default function Dashboard() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'prices' | 'announcements'>('prices');
  
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-800">Admin Dashboard</h1>
      </div>

      <div className="flex space-x-4 border-b border-slate-200">
        <button 
          className={`pb-4 px-4 font-medium transition-colors ${activeTab === 'prices' ? 'border-b-2 border-green-600 text-green-700' : 'text-slate-500 hover:text-slate-700'}`}
          onClick={() => setActiveTab('prices')}
        >
          Market Prices
        </button>
        <button 
          className={`pb-4 px-4 font-medium transition-colors ${activeTab === 'announcements' ? 'border-b-2 border-green-600 text-green-700' : 'text-slate-500 hover:text-slate-700'}`}
          onClick={() => setActiveTab('announcements')}
        >
          Announcements & Alerts
        </button>
      </div>

      {activeTab === 'prices' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <h2 className="text-lg font-bold mb-4">Add New Market Price</h2>
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
              <input 
                placeholder="Crop (e.g. Teff)" 
                className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none md:col-span-2"
                value={newPrice.crop}
                onChange={e => setNewPrice({...newPrice, crop: e.target.value})}
              />
              <input 
                placeholder="Market (e.g. Addis)" 
                className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                value={newPrice.market}
                onChange={e => setNewPrice({...newPrice, market: e.target.value})}
              />
              <input 
                placeholder="Price (ETB)" 
                type="number"
                className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                value={newPrice.price}
                onChange={e => setNewPrice({...newPrice, price: e.target.value})}
              />
              <select 
                className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
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
                className="bg-green-600 text-white rounded-lg flex items-center justify-center gap-2 hover:bg-green-700 disabled:opacity-50"
              >
                <Plus size={18} /> Add
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="p-4 font-semibold text-slate-600 text-sm">Crop</th>
                  <th className="p-4 font-semibold text-slate-600 text-sm">Market</th>
                  <th className="p-4 font-semibold text-slate-600 text-sm">Price (ETB)</th>
                  <th className="p-4 font-semibold text-slate-600 text-sm">Trend</th>
                  <th className="p-4 font-semibold text-slate-600 text-sm">Updated</th>
                  <th className="p-4 font-semibold text-slate-600 text-sm w-16">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loadingPrices ? (
                  <tr><td colSpan={6} className="p-8 text-center text-slate-500">Loading...</td></tr>
                ) : prices?.map((p: any) => (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="p-4 font-medium text-slate-800">{p.crop}</td>
                    <td className="p-4 text-slate-600">{p.market}</td>
                    <td className="p-4 font-medium text-green-700">{p.price} / {p.unit}</td>
                    <td className="p-4">
                      {p.trend === 'up' ? <TrendingUp className="text-red-500" size={20} /> :
                       p.trend === 'down' ? <TrendingDown className="text-green-500" size={20} /> :
                       <Minus className="text-slate-400" size={20} />}
                    </td>
                    <td className="p-4 text-sm text-slate-500">{format(new Date(p.updated_at), 'MMM d, yyyy')}</td>
                    <td className="p-4">
                      <button onClick={() => deletePrice.mutate(p.id)} className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-50">
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'announcements' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <h2 className="text-lg font-bold mb-4">Add Announcement / Alert</h2>
            <div className="space-y-4">
              <input 
                placeholder="Title (e.g. Heavy Rain Expected)" 
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                value={newAnn.title}
                onChange={e => setNewAnn({...newAnn, title: e.target.value})}
              />
              <textarea 
                placeholder="Description..." 
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none min-h-[100px]"
                value={newAnn.body}
                onChange={e => setNewAnn({...newAnn, body: e.target.value})}
              />
              <div className="flex items-center gap-4">
                <select 
                  className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
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
                  className="bg-green-600 text-white rounded-lg flex items-center gap-2 hover:bg-green-700 px-6 py-2 disabled:opacity-50 ml-auto"
                >
                  <Plus size={18} /> Post Announcement
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {loadingAnns ? (
              <p className="p-8 text-center text-slate-500">Loading...</p>
            ) : announcements?.map((a: any) => (
              <div key={a.id} className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 flex gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded uppercase ${
                      a.type === 'weather' ? 'bg-blue-100 text-blue-700' :
                      a.type === 'alert' ? 'bg-red-100 text-red-700' :
                      'bg-slate-100 text-slate-700'
                    }`}>{a.type}</span>
                    <h3 className="font-bold text-lg text-slate-800">{a.title}</h3>
                  </div>
                  <p className="text-slate-600 mt-2">{a.body}</p>
                  <p className="text-xs text-slate-400 mt-3">{format(new Date(a.created_at), 'PPpp')}</p>
                </div>
                <button onClick={() => deleteAnn.mutate(a.id)} className="text-red-500 hover:text-red-700 p-2 h-fit rounded-full hover:bg-red-50">
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
