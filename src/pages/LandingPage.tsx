import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, Tractor, Store, Users, Leaf, ArrowRight,
  Shield, ChevronRight, MapPin, Star, Wheat
} from 'lucide-react';

export default function LandingPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.toLowerCase().trim();
    if (query === 'admin') {
      navigate('/admin-login');
    } else if (query === 'employers' || query === 'employer' || query === 'expert') {
      navigate('/expert-login');
    } else if (query === 'buyer' || query === 'buyers') {
      navigate('/login');
    } else if (query === 'regional' || query === 'manager' || query === 'region') {
      navigate('/regional-login');
    } else {
      alert("Portal not found. Try: 'admin', 'buyer', 'expert', or 'regional'.");
    }
  };

  const portals = [
    {
      title: 'Wholesale Buyers',
      desc: 'Access the marketplace to buy crops directly from verified smallholder farmers across Ethiopia.',
      icon: Store,
      color: 'bg-accent/10 text-accent',
      path: '/login',
      badge: 'Open Market',
    },
    {
      title: 'Agricultural Experts',
      desc: 'Join as an extension worker or crop specialist to answer farmer inquiries in your language.',
      icon: Users,
      color: 'bg-secondary/10 text-secondary',
      path: '/expert-login',
      badge: 'Advisory',
    },
    {
      title: 'Regional Managers',
      desc: 'Manage farmers, experts, and regional agriculture programs across Ethiopian regions.',
      icon: Shield,
      color: 'bg-blue-100 text-blue-600',
      path: '/regional-login',
      badge: 'Government',
    },
    {
      title: 'Farmers App',
      desc: 'Download our mobile app to manage your farm, check weather, and sell produce.',
      icon: Tractor,
      color: 'bg-primary/10 text-primary',
      path: null,
      badge: 'Mobile App',
    },
  ];

  const regions = [
    { name: 'Oromia', lang: 'Afaan Oromoo', flag: '🟢', farmers: '1.2M' },
    { name: 'Amhara', lang: 'Amharic', flag: '🔵', farmers: '980K' },
    { name: 'SNNPR', lang: 'Multiple', flag: '🟡', farmers: '760K' },
    { name: 'Tigray', lang: 'Tigrinya', flag: '🔴', farmers: '420K' },
    { name: 'Sidama', lang: 'Sidaamu Afoo', flag: '🟠', farmers: '310K' },
    { name: 'Somali', lang: 'Somali', flag: '🔵', farmers: '250K' },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      {/* ── Navbar ── */}
      <nav className="flex justify-between items-center px-6 lg:px-12 py-4 bg-card border-b border-border sticky top-0 z-20 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white font-bold text-sm">AB</div>
          <span className="font-display font-bold text-2xl text-foreground">AgriBridge</span>
        </div>
        <div className="hidden md:flex items-center gap-6">
          <button onClick={() => navigate('/login')} className="font-semibold text-muted-foreground hover:text-primary transition-colors">Buyer Portal</button>
          <button onClick={() => navigate('/expert-login')} className="font-semibold text-muted-foreground hover:text-primary transition-colors">Expert Portal</button>
          <button onClick={() => navigate('/regional-login')} className="font-semibold text-muted-foreground hover:text-primary transition-colors">Regional Manager</button>
          <button onClick={() => navigate('/admin-login')} className="px-4 py-2 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-all text-sm">Admin Login</button>
        </div>
        {/* Mobile menu */}
        <button onClick={() => navigate('/login')} className="md:hidden font-bold text-sm text-primary">Login</button>
      </nav>

      {/* ── Hero ── */}