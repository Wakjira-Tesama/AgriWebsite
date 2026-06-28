import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LayoutDashboard, LogOut } from 'lucide-react';

// Pages
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import LandingPage from './pages/LandingPage';
import EmployersPage from './pages/EmployersPage';
import ProtectedRoute from './components/ProtectedRoute';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/employers" element={<EmployersPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route index element={<Dashboard />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

import { Outlet } from 'react-router-dom';

function Layout() {
  return (
    <div className="min-h-screen bg-background">
      <Outlet />
    </div>
  );
}

export default App;
