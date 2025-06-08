
import React, { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Minus, Plus } from 'lucide-react';
import { toast } from 'sonner';

interface QuantityInputProps {
  value: number;
  onChange: (value: number) => void;
  max?: number;
  min?: number;
  allowDecimal?: boolean;
  step?: number;
  disabled?: boolean;
  onEnterPress?: () => void;
}

const QuantityInput: React.FC<QuantityInputProps> = ({
  value,
  onChange,
  max = 999999,
  min = 0.01,
  allowDecimal = false,
  step = 1,
  disabled = false,
  onEnterPress
}) => {
  const [inputValue, setInputValue] = useState(value.toString());
  const [isEditing, setIsEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isEditing) {
      setInputValue(value.toString());
    }
  }, [value, isEditing]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    
    // Permitir números enteros o decimales según configuración
    const regex = allowDecimal ? /^\d*\.?\d*$/ : /^\d*$/;
    
    if (regex.test(newValue) || newValue === '') {
      setInputValue(newValue);
    }
  };

  const handleInputBlur = () => {
    setIsEditing(false);
    validateAndUpdate(inputValue);
  };

  const handleInputFocus = () => {
    setIsEditing(true);
    inputRef.current?.select();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      validateAndUpdate(inputValue);
      setIsEditing(false);
      inputRef.current?.blur();
      onEnterPress?.();
    } else if (e.key === '+') {
      e.preventDefault();
      handleIncrement();
    } else if (e.key === '-') {
      e.preventDefault();
      handleDecrement();
    }
  };

  const validateAndUpdate = (stringValue: string) => {
    const numValue = parseFloat(stringValue);
    
    if (isNaN(numValue) || stringValue === '') {
      setInputValue(value.toString());
      return;
    }

    let finalValue = numValue;

    if (finalValue < min) {
      finalValue = min;
      toast.error(`Cantidad mínima: ${min}`);
    } else if (finalValue > max) {
      finalValue = max;
      toast.error(`Cantidad máxima: ${max}`);
    }

    // Si no permite decimales, redondear
    if (!allowDecimal) {
      finalValue = Math.round(finalValue);
    }

    onChange(finalValue);
    setInputValue(finalValue.toString());
  };

  const handleIncrement = () => {
    const newValue = value + step;
    if (newValue <= max) {
      onChange(newValue);
    } else {
      toast.error(`Cantidad máxima: ${max}`);
    }
  };

  const handleDecrement = () => {
    const newValue = value - step;
    if (newValue >= min) {
      onChange(newValue);
    } else {
      toast.error(`Cantidad mínima: ${min}`);
    }
  };

  return (
    <div className="flex items-center gap-1">
      <Button
        variant="outline"
        size="sm"
        onClick={handleDecrement}
        disabled={disabled || value <= min}
        className="h-8 w-8 p-0"
      >
        <Minus className="h-3 w-3" />
      </Button>
      
      <Input
        ref={inputRef}
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onBlur={handleInputBlur}
        onFocus={handleInputFocus}
        onKeyDown={handleKeyPress}
        disabled={disabled}
        className="w-20 h-8 text-center text-sm"
        placeholder={allowDecimal ? "0.0" : "0"}
      />
      
      <Button
        variant="outline"
        size="sm"
        onClick={handleIncrement}
        disabled={disabled || value >= max}
        className="h-8 w-8 p-0"
      >
        <Plus className="h-3 w-3" />
      </Button>
    </div>
  );
};

export default QuantityInput;
