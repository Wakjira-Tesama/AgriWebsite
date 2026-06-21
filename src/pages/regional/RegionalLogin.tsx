import { useNavigate } from 'react-router-dom';
import { MapPin, Shield } from 'lucide-react';
import { useState } from 'react';

const regions = [
  { value: 'oromia', label: 'Oromia', lang: 'Afaan Oromoo' },
  { value: 'amhara', label: 'Amhara', lang: 'Amharic' },
  { value: 'snnpr', label: 'SNNPR', lang: 'Multiple' },