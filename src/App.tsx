import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Admin Pages
import AdminDashboard from './pages/Dashboard';
import AdminLogin from './pages/Login';
import ProtectedRoute from './components/ProtectedRoute';

// Buyer Pages
import BuyerLogin from './pages/buyer/BuyerLogin';
import BuyerDashboard from './pages/buyer/BuyerDashboard';

// Expert Pages
import ExpertLogin from './pages/expert/ExpertLogin';
import ExpertDashboard from './pages/expert/ExpertDashboard';

// Regional Manager Pages
import RegionalLogin from './pages/regional/RegionalLogin';
import RegionalDashboard from './pages/regional/RegionalDashboard';

// Public Pages
import LandingPage from './pages/LandingPage';
import EmployersPage from './pages/EmployersPage';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/employers" element={<EmployersPage />} />

          {/* Buyer Portal */}
          <Route path="/login" element={<BuyerLogin />} />
          <Route path="/buyer" element={<BuyerDashboard />} />

          {/* Expert Portal */}
          <Route path="/expert-login" element={<ExpertLogin />} />
          <Route path="/expert" element={<ExpertDashboard />} />

          {/* Regional Manager Portal */}
          <Route path="/regional-login" element={<RegionalLogin />} />
          <Route path="/regional" element={<RegionalDashboard />} />

          {/* Admin Portal */}
          <Route path="/admin-login" element={<AdminLogin />} />
          <Route path="/admin" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route index element={<AdminDashboard />} />