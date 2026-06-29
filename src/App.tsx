import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Admin Pages
import AdminDashboard from './pages/Dashboard';
import AdminLogin from './pages/Login';