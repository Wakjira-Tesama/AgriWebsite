import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LayoutDashboard, LogOut } from 'lucide-react';

// Pages
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import ProtectedRoute from './components/ProtectedRoute';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route index element={<Dashboard />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

function Layout() {
  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-green-400">AgriBridge Admin</h1>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-2">
          <Link to="/" className="flex items-center gap-3 px-4 py-3 bg-slate-800 rounded-lg text-green-400">
            <LayoutDashboard size={20} />
            <span className="font-medium">Dashboard</span>
          </Link>
        </nav>
        <div className="p-4 border-t border-slate-700">
          <button className="flex items-center gap-3 px-4 py-2 w-full text-left text-slate-300 hover:text-white transition-colors" onClick={() => {
            import('./integrations/supabase/client').then(({ supabase }) => {
              supabase.auth.signOut().then(() => window.location.href = '/login');
            });
          }}>
            <LogOut size={20} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        <Dashboard />
      </main>
    </div>
  );
}

export default App;
