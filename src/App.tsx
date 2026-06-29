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