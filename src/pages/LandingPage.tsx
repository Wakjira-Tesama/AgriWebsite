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
      <main className="flex-1 flex flex-col items-center justify-center text-center px-6 pt-20 pb-16">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10 text-primary font-bold text-sm mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <Leaf size={16} /> Empowering Ethiopian Agriculture • ኢትዮጵያ ግብርና
        </div>

        <h1 className="text-5xl lg:text-7xl font-display font-extrabold text-foreground max-w-4xl leading-tight tracking-tight mb-6 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100">
          The Smart Agriculture Ecosystem for <span className="text-primary">Everyone.</span>
        </h1>

        <p className="text-lg lg:text-xl text-muted-foreground max-w-2xl mb-10 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
          Connect directly with verified farmers, access expert advisory in your language, and monitor the agricultural market in real-time — across all Ethiopian regions.
        </p>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="w-full max-w-lg relative animate-in fade-in slide-in-from-bottom-10 duration-700 delay-300 shadow-xl rounded-2xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={22} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search: 'buyer', 'expert', 'regional'..."
            className="w-full pl-12 pr-28 py-5 text-base border-2 border-border rounded-2xl focus:border-primary focus:ring-4 focus:ring-primary/20 outline-none transition-all bg-card font-medium"
          />
          <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 bg-primary text-primary-foreground font-bold px-5 py-3 rounded-xl hover:bg-primary/90 transition-all flex items-center gap-2 text-sm">
            Go <ArrowRight size={16} />
          </button>
        </form>

        <p className="text-sm text-muted-foreground mt-4 animate-in fade-in duration-700 delay-500">
          Try: <strong className="text-foreground">"buyer"</strong>, <strong className="text-foreground">"expert"</strong>, <strong className="text-foreground">"regional"</strong>, or <strong className="text-foreground">"admin"</strong>
        </p>

        {/* Quick access badges */}
        <div className="flex gap-3 mt-8 flex-wrap justify-center animate-in fade-in duration-700 delay-700">
          <button onClick={() => navigate('/login')} className="flex items-center gap-2 px-4 py-2 bg-accent/10 text-accent font-bold rounded-full text-sm hover:bg-accent/20 transition-colors">
            <Store size={15} /> Buyer Portal
          </button>
          <button onClick={() => navigate('/expert-login')} className="flex items-center gap-2 px-4 py-2 bg-secondary/10 text-secondary font-bold rounded-full text-sm hover:bg-secondary/20 transition-colors">
            <Users size={15} /> Expert Portal
          </button>
          <button onClick={() => navigate('/regional-login')} className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 font-bold rounded-full text-sm hover:bg-blue-200 transition-colors">
            <Shield size={15} /> Regional Manager
          </button>
          <button onClick={() => navigate('/admin-login')} className="flex items-center gap-2 px-4 py-2 bg-muted text-muted-foreground font-bold rounded-full text-sm hover:bg-muted/80 transition-colors">
            <MapPin size={15} /> Admin
          </button>
        </div>
      </main>

      {/* ── Portal Cards ── */}
      <section className="bg-card py-20 px-6 lg:px-12 border-t border-border">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-display font-bold text-foreground mb-3">Choose Your Portal</h2>
            <p className="text-muted-foreground text-lg">Select the portal that matches your role in the agricultural ecosystem</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            {portals.map((portal, i) => (
              <div
                key={i}
                onClick={() => portal.path && navigate(portal.path)}
                className={`p-8 rounded-3xl bg-background border border-border hover:shadow-xl transition-all duration-300 text-center group ${portal.path ? 'cursor-pointer hover:-translate-y-1' : 'opacity-75'}`}
              >
                <div className={`w-16 h-16 rounded-2xl ${portal.color} flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform duration-300`}>
                  <portal.icon size={30} />
                </div>
                <span className="inline-block text-xs font-bold uppercase tracking-wider text-muted-foreground bg-muted px-2.5 py-1 rounded-full mb-3">{portal.badge}</span>
                <h3 className="text-xl font-display font-bold mb-3">{portal.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{portal.desc}</p>
                {portal.path && (
                  <div className="mt-5 flex items-center justify-center gap-1 text-primary font-bold text-sm group-hover:gap-2 transition-all">
                    Access Portal <ChevronRight size={16} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
