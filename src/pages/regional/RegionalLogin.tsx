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