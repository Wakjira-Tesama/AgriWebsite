import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Tractor, Store, Users, Leaf, ArrowRight } from 'lucide-react';

export default function LandingPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.toLowerCase().trim();
    
    if (query === 'admin') {
      navigate('/admin');
    } else if (query === 'employers' || query === 'employer' || query === 'expert') {
      navigate('/employers');
    } else if (query === 'buyer' || query === 'buyers') {
      window.location.href = 'http://localhost:5175';
    } else {
      alert("Portal not found. Try searching for 'admin', 'employers', or 'buyer'.");
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      {/* Navbar */}
      <nav className="flex justify-between items-center p-6 lg:px-12 bg-card border-b border-border sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white font-bold">AB</div>
          <span className="font-display font-bold text-2xl text-foreground">AgriBridge</span>
        </div>
        <div className="flex items-center gap-6">
          <button 
            onClick={() => window.location.href = 'http://localhost:5175'} 
            className="font-bold text-foreground hover:text-primary transition-colors"
          >
            Buyer Portal
          </button>
          <button 
            onClick={() => navigate('/employers')} 
            className="font-bold text-foreground hover:text-primary transition-colors"
          >
            Careers / Employers
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center text-center p-6 pt-20">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10 text-primary font-bold text-sm mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <Leaf size={16} /> Empowering Ethiopian Agriculture
        </div>
        
        <h1 className="text-5xl lg:text-7xl font-display font-extrabold text-foreground max-w-4xl leading-tight tracking-tight mb-6 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100">
          The Smart Agriculture Ecosystem for <span className="text-primary">Everyone.</span>
        </h1>
        
        <p className="text-lg lg:text-xl text-muted-foreground max-w-2xl mb-12 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
          Connect directly with verified farmers, access expert advisory, and monitor the agricultural market in real-time.
        </p>

        {/* Search Bar matching user prompt */}
        <form 
          onSubmit={handleSearch} 
          className="w-full max-w-lg relative animate-in fade-in slide-in-from-bottom-10 duration-700 delay-300 shadow-xl rounded-2xl"
        >
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={24} />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for 'admin' or 'employers'..." 
            className="w-full pl-14 pr-32 py-5 text-lg border-2 border-border rounded-2xl focus:border-primary focus:ring-4 focus:ring-primary/20 outline-none transition-all bg-card font-medium"
          />
          <button 
            type="submit" 
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-primary text-primary-foreground font-bold px-6 py-3 rounded-xl hover:bg-primary/90 transition-all flex items-center gap-2"
          >
            Go <ArrowRight size={18} />
          </button>
        </form>
        
        <p className="text-sm text-muted-foreground mt-4 animate-in fade-in duration-700 delay-500">
          Hint: Try searching <strong className="text-foreground">"admin"</strong>, <strong className="text-foreground">"employers"</strong>, or <strong className="text-foreground">"buyer"</strong>
        </p>
      </main>

      {/* Feature Cards */}
      <section className="bg-card py-20 px-6 lg:px-12 border-t border-border">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-8 rounded-3xl bg-background border border-border hover:shadow-lg transition-all text-center group cursor-pointer" onClick={() => window.location.href = 'http://localhost:5175'}>
            <div className="w-16 h-16 rounded-2xl bg-accent/10 text-accent flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
              <Store size={32} />
            </div>
            <h3 className="text-2xl font-display font-bold mb-3">Wholesale Buyers</h3>
            <p className="text-muted-foreground">Access the marketplace to buy crops directly from verified smallholder farmers.</p>
          </div>
          
          <div className="p-8 rounded-3xl bg-background border border-border hover:shadow-lg transition-all text-center group cursor-pointer" onClick={() => navigate('/employers')}>
            <div className="w-16 h-16 rounded-2xl bg-secondary/10 text-secondary flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
              <Users size={32} />
            </div>
            <h3 className="text-2xl font-display font-bold mb-3">Agricultural Experts</h3>
            <p className="text-muted-foreground">Join as an extension worker or crop specialist to answer farmer inquiries.</p>
          </div>
          
          <div className="p-8 rounded-3xl bg-background border border-border hover:shadow-lg transition-all text-center group">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
              <Tractor size={32} />
            </div>
            <h3 className="text-2xl font-display font-bold mb-3">Farmers App</h3>
            <p className="text-muted-foreground">Download our mobile app to manage your farm, check weather, and sell produce.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
