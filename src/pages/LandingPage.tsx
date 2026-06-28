import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, Tractor, Store, Users, Leaf, ArrowRight,
  Shield, ChevronRight, MapPin, Star, Wheat
} from 'lucide-react';

export default function LandingPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();