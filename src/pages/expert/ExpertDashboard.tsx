import { LogOut, CheckCircle, Clock, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ExpertDashboard() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-64 bg-card border-r border-border shrink-0 flex flex-col sticky top-0 h-screen">
        <div className="p-6 border-b border-border text-center">
          <div className="w-12 h-12 rounded-full bg-primary mx-auto flex items-center justify-center text-white font-bold text-xl mb-3">E</div>
          <h2 className="font-display font-bold text-foreground">Dr. Yonas Alemu</h2>
          <p className="text-sm text-muted-foreground">Crop Specialist (Amhara)</p>
        </div>
        
        <div className="flex-1 p-4 space-y-2">
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium bg-primary text-primary-foreground shadow-sm">
            <FileText size={20} /> Advisory Tickets
          </button>
        </div>
        
        <div className="p-4 border-t border-border">
          <button 
            onClick={() => navigate('/employers')}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-destructive hover:bg-destructive/10 transition-colors"
          >
            <LogOut size={20} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-display font-bold text-foreground">Assigned Tickets</h1>
          <p className="text-muted-foreground mt-1">Review and respond to farmer inquiries.</p>
        </header>

        <div className="grid gap-4">
          {[
            { status: 'pending', farmer: 'Abebe Kebede', time: '2 hrs ago', title: 'Maize leaves turning yellow', desc: '"My maize field has started showing yellowing on the lower leaves. I used fertilizer two weeks ago, but it hasn\'t improved. What should I do?"' },
            { status: 'pending', farmer: 'Kebede Alemu', time: '5 hrs ago', title: 'Coffee berry disease spotted', desc: '"I noticed dark spots on my coffee berries. Is this CBD? How should I treat it before harvest?"' },
            { status: 'resolved', farmer: 'Tigist Bekele', time: '1 day ago', title: 'Best time to plant Teff?', desc: '"When is the optimal time to plant teff in this rainy season?"' },
          ].map((ticket, i) => (
            <div key={i} className={`bg-card p-6 rounded-2xl shadow-sm border border-border flex flex-col md:flex-row gap-6 hover:shadow-md transition-all ${ticket.status === 'resolved' ? 'opacity-60' : ''}`}>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`px-3 py-1 text-xs font-bold rounded-full flex items-center gap-1 ${
                    ticket.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-secondary/20 text-secondary'
                  }`}>
                    {ticket.status === 'pending' ? <Clock size={12} /> : <CheckCircle size={12} />}
                    {ticket.status === 'pending' ? 'Pending Review' : 'Resolved'}
                  </span>
                  <span className="text-sm text-muted-foreground">From: {ticket.farmer} • {ticket.time}</span>
                </div>
                <h3 className="font-bold text-lg">{ticket.title}</h3>
                <p className="text-muted-foreground mt-2 line-clamp-2">{ticket.desc}</p>
              </div>
              <div className="flex items-center">
                {ticket.status === 'pending' ? (
                  <button className="px-6 py-2 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90">
                    Respond
                  </button>
                ) : (
                  <button className="px-6 py-2 border border-border text-foreground font-bold rounded-xl hover:bg-muted">
                    View Thread
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
