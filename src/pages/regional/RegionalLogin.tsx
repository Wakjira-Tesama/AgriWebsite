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