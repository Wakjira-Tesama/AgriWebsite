import { useNavigate } from 'react-router-dom';

export default function BuyerLogin() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="bg-card p-8 rounded-2xl shadow-lg w-full max-w-md border border-border">
        <div className="flex items-center gap-3 justify-center mb-2">
          <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center text-white font-bold">B</div>
          <h1 className="text-3xl font-display font-bold text-accent">Buyer Portal</h1>
        </div>
        <p className="text-center text-muted-foreground mb-8">Sign in to access the wholesale marketplace</p>
        
        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); navigate('/buyer'); }}>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Email / Phone</label>
            <input type="text" className="w-full px-4 py-3 border border-border rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" placeholder="buyer@company.com" />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Password</label>
            <input type="password" className="w-full px-4 py-3 border border-border rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" placeholder="••••••••" />
          </div>
          
          <button type="submit" className="w-full bg-accent text-accent-foreground font-bold py-3 rounded-xl hover:bg-accent/90 transition-all mt-4">
            Sign In as Buyer
          </button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-6">
          <button onClick={() => navigate('/')} className="font-semibold text-primary hover:underline">← Back to Home</button>
        </p>
      </div>
    </div>
  );
}
