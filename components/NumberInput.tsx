import React, { useState, useEffect, KeyboardEvent } from 'react';
import { Input } from "@/components/ui/input"

interface NumberInputProps {
  id: string;
  value: number;
  onChange: (value: number) => void;
  placeholder?: string;
  label?: string;
  isInteger?: boolean;
}

const formatNumber = (value: number, isInteger: boolean): string => {
  return new Intl.NumberFormat('de-DE', {
    minimumFractionDigits: isInteger ? 0 : 2,
    maximumFractionDigits: isInteger ? 0 : 2,
  }).format(value);
};

const parseNumber = (value: string, isInteger: boolean): number | null => {
  // Remove all dots (thousand separators) and replace comma with dot
  const cleanedValue = value.replace(/\./g, '').replace(',', '.');
  
  // Check if the cleaned value matches the expected format
  const regex = isInteger ? /^\d+$/ : /^\d+(\.\d{1,2})?$/;
  if (!regex.test(cleanedValue)) {
    return null;
  }

  const parsed = parseFloat(cleanedValue);
  return isNaN(parsed) ? null : parsed;
};

export function NumberInput({ id, value, onChange, placeholder, label, isInteger = false }: NumberInputProps) {
  const [inputValue, setInputValue] = useState(formatNumber(value, isInteger));

  useEffect(() => {
    setInputValue(formatNumber(value, isInteger));
  }, [value, isInteger]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
  };

  const handleBlurOrEnter = () => {
    const numericValue = parseNumber(inputValue, isInteger);
    if (numericValue !== null) {
      onChange(numericValue);
      setInputValue(formatNumber(numericValue, isInteger));
    } else {
      // If the input is not a valid number, revert to the last valid value
      setInputValue(formatNumber(value, isInteger));
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleBlurOrEnter();
    }
  };

  return (
    <Input
      id={id}
      value={inputValue}
      onChange={handleChange}
      onBlur={handleBlurOrEnter}
      onKeyDown={handleKeyDown}
      placeholder={placeholder}
      aria-label={label}
    />
  );
}