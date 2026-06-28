import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, Tractor, Store, Users, Leaf, ArrowRight,
  Shield, ChevronRight, MapPin, Star, Wheat
} from 'lucide-react';

export default function LandingPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.toLowerCase().trim();
    if (query === 'admin') {
      navigate('/admin-login');
    } else if (query === 'employers' || query === 'employer' || query === 'expert') {
      navigate('/expert-login');
    } else if (query === 'buyer' || query === 'buyers') {
      navigate('/login');
    } else if (query === 'regional' || query === 'manager' || query === 'region') {
      navigate('/regional-login');
    } else {
      alert("Portal not found. Try: 'admin', 'buyer', 'expert', or 'regional'.");
    }
  };

  const portals = [
    {
      title: 'Wholesale Buyers',
      desc: 'Access the marketplace to buy crops directly from verified smallholder farmers across Ethiopia.',
      icon: Store,
      color: 'bg-accent/10 text-accent',
      path: '/login',
      badge: 'Open Market',
    },
    {
      title: 'Agricultural Experts',
      desc: 'Join as an extension worker or crop specialist to answer farmer inquiries in your language.',
      icon: Users,