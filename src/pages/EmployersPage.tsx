import { ArrowLeft, User, Stethoscope, Droplets, ShieldAlert, Sprout } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const roles = [
  { name: 'Crop Expert', icon: Sprout, desc: 'Provide advice on crop health and disease management.' },
  { name: 'Livestock Expert', icon: User, desc: 'Consult on livestock rearing and nutrition.' },
  { name: 'Veterinarian', icon: Stethoscope, desc: 'Diagnose and treat livestock diseases.' },
  { name: 'Irrigation Expert', icon: Droplets, desc: 'Advise on water management and irrigation systems.' },
  { name: 'Plant Protection', icon: ShieldAlert, desc: 'Monitor and advise on pest outbreaks.' },
  { name: 'Extension Worker', icon: User, desc: 'General field support and farmer education.' },
];

export default function EmployersPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans p-6 lg:p-12">
      <nav className="mb-12">
        <button 
          onClick={() => navigate('/')} 
          className="flex items-center gap-2 font-bold text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft size={20} /> Back to Home
        </button>
      </nav>

      <main className="max-w-4xl mx-auto w-full">
        <h1 className="text-4xl lg:text-5xl font-display font-extrabold text-foreground mb-4">
          Select Your Role
        </h1>
        <p className="text-lg text-muted-foreground mb-10">
          Choose your specialization to enter the Expert Advisory Portal and start assisting farmers.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {roles.map((role) => (
            <button 
              key={role.name}
              onClick={() => window.location.href = 'http://localhost:5174'}
              className="bg-card p-6 rounded-2xl border border-border hover:border-primary hover:shadow-lg transition-all text-left group"
            >
              <div className="w-12 h-12 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                <role.icon size={24} />
              </div>
              <h3 className="text-xl font-bold font-display text-foreground mb-2">{role.name}</h3>
              <p className="text-sm text-muted-foreground">{role.desc}</p>
            </button>
          ))}
        </div>
      </main>
    </div>
  );
}
