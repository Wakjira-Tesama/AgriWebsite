import { LogOut, ShoppingCart, Search, Store } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function BuyerDashboard() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-64 bg-card border-r border-border shrink-0 flex flex-col sticky top-0 h-screen">
        <div className="p-6 border-b border-border text-center">
          <div className="w-12 h-12 rounded-full bg-accent mx-auto flex items-center justify-center text-white font-bold text-xl mb-3">ST</div>
          <h2 className="font-display font-bold text-foreground">Selam Trading PLC</h2>
          <p className="text-sm text-muted-foreground">Wholesale Buyer</p>
        </div>
        
        <div className="flex-1 p-4 space-y-2">
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium bg-primary text-primary-foreground shadow-sm">
            <Store size={20} /> Marketplace
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-muted-foreground hover:bg-muted transition-colors">
            <ShoppingCart size={20} /> My Orders
          </button>
        </div>
        
        <div className="p-4 border-t border-border">
          <button 
            onClick={() => navigate('/login')}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-destructive hover:bg-destructive/10 transition-colors"
          >
            <LogOut size={20} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        <header className="mb-8 flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">Wholesale Marketplace</h1>
            <p className="text-muted-foreground mt-1">Browse and purchase produce directly from verified farmers.</p>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <input type="text" placeholder="Search crops..." className="pl-10 pr-4 py-2 border border-border rounded-xl focus:border-primary outline-none" />
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { crop: 'White Teff (Export Grade)', price: '6,200', seller: 'Hawassa Co-op', region: 'SNNPR', stock: '50 Tonnes' },
            { crop: 'Red Teff (Premium)', price: '5,800', seller: 'Adama Farmers Union', region: 'Oromia', stock: '30 Tonnes' },
            { crop: 'Arabica Coffee (Washed)', price: '18,500', seller: 'Jimma Co-op', region: 'Oromia', stock: '20 Tonnes' },
            { crop: 'White Maize', price: '3,200', seller: 'Bahir Dar Coop', region: 'Amhara', stock: '100 Tonnes' },
            { crop: 'Sesame Seeds', price: '12,000', seller: 'Humera Traders', region: 'Tigray', stock: '15 Tonnes' },
            { crop: 'Wheat (Bread)', price: '4,100', seller: 'Arsi Union', region: 'Oromia', stock: '45 Tonnes' },
          ].map((item, i) => (
            <div key={i} className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden hover:shadow-md transition-all">
              <div className="h-40 bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
                <span className="text-5xl">🌾</span>
              </div>
              <div className="p-5">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-lg">{item.crop}</h3>
                </div>
                <p className="font-bold text-primary text-xl mb-1">{item.price} ETB <span className="text-sm text-muted-foreground font-normal">/ 100kg</span></p>
                <p className="text-sm text-muted-foreground mb-4">Seller: {item.seller} • {item.region}</p>
                <div className="flex justify-between items-center text-sm">
                  <span className="bg-secondary/20 text-secondary px-3 py-1 rounded-full font-bold">In Stock: {item.stock}</span>
                  <button className="px-4 py-2 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90">Order</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
