'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Phone } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Country {
  code: string;
  name: string;
  dialCode: string;
  flag: string;
  maxLength: number;
}

const countries: Country[] = [
  { code: 'IN', name: 'India', dialCode: '+91', flag: '🇮🇳', maxLength: 10 },
  { code: 'US', name: 'United States', dialCode: '+1', flag: '🇺🇸', maxLength: 10 },
  { code: 'GB', name: 'United Kingdom', dialCode: '+44', flag: '🇬🇧', maxLength: 10 },
  { code: 'CA', name: 'Canada', dialCode: '+1', flag: '🇨🇦', maxLength: 10 },
  { code: 'AU', name: 'Australia', dialCode: '+61', flag: '🇦🇺', maxLength: 9 },
  { code: 'DE', name: 'Germany', dialCode: '+49', flag: '🇩🇪', maxLength: 11 },
  { code: 'FR', name: 'France', dialCode: '+33', flag: '🇫🇷', maxLength: 9 },
  { code: 'JP', name: 'Japan', dialCode: '+81', flag: '🇯🇵', maxLength: 10 },
  { code: 'CN', name: 'China', dialCode: '+86', flag: '🇨🇳', maxLength: 11 },
  { code: 'BR', name: 'Brazil', dialCode: '+55', flag: '🇧🇷', maxLength: 11 },
  { code: 'AE', name: 'UAE', dialCode: '+971', flag: '🇦🇪', maxLength: 9 },
  { code: 'SG', name: 'Singapore', dialCode: '+65', flag: '🇸🇬', maxLength: 8 },
];

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  error?: string;
  className?: string;
  defaultCountry?: string;
}

export function PhoneInput({
  value,
  onChange,
  onBlur,
  placeholder = 'Enter phone number',
  error,
  className,
  defaultCountry = 'IN',
}: PhoneInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<Country>(
    countries.find((c) => c.code === defaultCountry) || countries[0]
  );
  const [phoneNumber, setPhoneNumber] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Parse initial value
  useEffect(() => {
    if (value) {
      // Try to extract country code and number from the value
      for (const country of countries) {
        if (value.startsWith(country.dialCode)) {
          setSelectedCountry(country);
          setPhoneNumber(value.slice(country.dialCode.length));
          return;
        }
      }
      // If no country code found, just set the number
      setPhoneNumber(value.replace(/\D/g, ''));
    }
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCountrySelect = (country: Country) => {
    setSelectedCountry(country);
    setIsOpen(false);
    // Update the full value with new country code
    if (phoneNumber) {
      onChange(`${country.dialCode}${phoneNumber}`);
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value.replace(/\D/g, '');
    const limitedValue = inputValue.slice(0, selectedCountry.maxLength);
    setPhoneNumber(limitedValue);
    onChange(`${selectedCountry.dialCode}${limitedValue}`);
  };

  const isValidLength = phoneNumber.length === selectedCountry.maxLength;

  return (
    <div className={cn('relative', className)} ref={dropdownRef}>
      <div className="relative flex">
        {/* Country Selector */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            'flex items-center gap-1.5 px-3 py-3 rounded-l-xl bg-input border border-r-0 border-border',
            'hover:bg-glass transition-colors',
            'focus:outline-none focus:ring-2 focus:ring-primary/50',
            error && 'border-destructive'
          )}
        >
          <span className="text-lg">{selectedCountry.flag}</span>
          <span className="text-sm font-medium text-foreground">{selectedCountry.dialCode}</span>
          <ChevronDown
            className={cn(
              'w-4 h-4 text-muted-foreground transition-transform',
              isOpen && 'rotate-180'
            )}
          />
        </button>

        {/* Phone Input */}
        <div className="relative flex-1">
          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="tel"
            value={phoneNumber}
            onChange={handlePhoneChange}
            onBlur={onBlur}
            placeholder={placeholder}
            className={cn(
              'w-full pl-10 pr-4 py-3 rounded-r-xl bg-input border border-border text-foreground',
              'placeholder:text-muted-foreground',
              'focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all',
              error && 'border-destructive focus:ring-destructive/50'
            )}
          />
          {/* Length indicator */}
          {phoneNumber && (
            <span
              className={cn(
                'absolute right-3 top-1/2 -translate-y-1/2 text-xs',
                isValidLength ? 'text-success' : 'text-muted-foreground'
              )}
            >
              {phoneNumber.length}/{selectedCountry.maxLength}
            </span>
          )}
        </div>
      </div>

      {/* Country Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 left-0 mt-2 w-64 max-h-60 overflow-y-auto rounded-xl bg-card border border-border shadow-xl"
          >
            {countries.map((country) => (
              <button
                key={country.code}
                type="button"
                onClick={() => handleCountrySelect(country)}
                className={cn(
                  'w-full flex items-center gap-3 px-4 py-2.5 hover:bg-glass transition-colors',
                  selectedCountry.code === country.code && 'bg-primary/10 text-primary'
                )}
              >
                <span className="text-lg">{country.flag}</span>
                <span className="flex-1 text-left text-sm font-medium">{country.name}</span>
                <span className="text-sm text-muted-foreground">{country.dialCode}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Message */}
      <AnimatePresence mode="wait">
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-sm text-destructive mt-2"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
