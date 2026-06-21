import { useNavigate } from 'react-router-dom';
import { MapPin, Shield } from 'lucide-react';
import { useState } from 'react';

const regions = [
  { value: 'oromia', label: 'Oromia', lang: 'Afaan Oromoo' },
  { value: 'amhara', label: 'Amhara', lang: 'Amharic' },
  { value: 'snnpr', label: 'SNNPR', lang: 'Multiple' },
  { value: 'tigray', label: 'Tigray', lang: 'Tigrinya' },
  { value: 'sidama', label: 'Sidama', lang: 'Sidaamu Afoo' },
  { value: 'somali', label: 'Somali', lang: 'Somali' },
  { value: 'afar', label: 'Afar', lang: 'Afaraf' },
  { value: 'benishangul', label: 'Benishangul-Gumuz', lang: 'Multiple' },
  { value: 'gambela', label: 'Gambela', lang: 'Multiple' },
  { value: 'harari', label: 'Harari', lang: 'Harari' },
  { value: 'addis', label: 'Addis Ababa', lang: 'Amharic' },
  { value: 'dire', label: 'Dire Dawa', lang: 'Multiple' },
];

export default function RegionalLogin() {
  const navigate = useNavigate();
  const [selectedRegion, setSelectedRegion] = useState('oromia');

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a3a2a] via-[#1B5E20] to-[#0d2818] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-20 w-72 h-72 rounded-full bg-white blur-3xl" />
        <div className="absolute bottom-20 right-20 w-96 h-96 rounded-full bg-accent blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo Area */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 mb-4">
            <Shield size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-display font-bold text-white">Regional Manager</h1>
          <p className="text-white/60 mt-2">Agriculture Administration Portal</p>
        </div>

        {/* Login Card */}
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 p-8 shadow-2xl">
          <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); navigate(`/regional?region=${selectedRegion}`); }}>
            <div>
              <label className="block text-sm font-medium text-white/80 mb-1.5">Region</label>
              <div className="relative">
                <MapPin size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/50" />