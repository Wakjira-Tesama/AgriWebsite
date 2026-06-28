import { useNavigate, useSearchParams } from 'react-router-dom';

export default function ExpertLogin() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const role = params.get('role') || 'Expert';

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="bg-card p-8 rounded-2xl shadow-lg w-full max-w-md border border-border">
        <div className="flex items-center gap-3 justify-center mb-2">
          <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-white font-bold">E</div>
          <h1 className="text-3xl font-display font-bold text-secondary">Expert Portal</h1>
        </div>
        <p className="text-center text-muted-foreground mb-2">Sign in as <strong className="text-foreground">{role}</strong></p>
        <p className="text-center text-sm text-muted-foreground mb-8">to manage advisory tickets from farmers</p>
        
        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); navigate('/expert'); }}>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Email / Phone</label>
            <input type="text" className="w-full px-4 py-3 border border-border rounded-xl focus:border-secondary focus:ring-1 focus:ring-secondary outline-none transition-all" placeholder="expert@agribridge.com" />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Password</label>
            <input type="password" className="w-full px-4 py-3 border border-border rounded-xl focus:border-secondary focus:ring-1 focus:ring-secondary outline-none transition-all" placeholder="••••••••" />
          </div>
          
          <button type="submit" className="w-full bg-secondary text-secondary-foreground font-bold py-3 rounded-xl hover:bg-secondary/90 transition-all mt-4">
            Sign In as {role}
          </button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-6">
          <button onClick={() => navigate('/employers')} className="font-semibold text-primary hover:underline">← Back to Role Selection</button>
        </p>
      </div>
    </div>
  );
}
