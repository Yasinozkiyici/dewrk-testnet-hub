'use client';

import { useState, KeyboardEvent } from 'react';
import { Plus, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface MultiFieldProps {
  label: string;
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  error?: string;
  id?: string;
}

export function MultiField({ 
  label, 
  value, 
  onChange, 
  placeholder = "Enter item", 
  error,
  id 
}: MultiFieldProps) {
  const [inputValue, setInputValue] = useState('');

  const addItem = () => {
    const trimmedValue = inputValue.trim();
    if (trimmedValue && !value.includes(trimmedValue)) {
      onChange([...value, trimmedValue]);
      setInputValue('');
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addItem();
    }
  };

  const removeItem = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  return (
    <div>
      <Label htmlFor={id} className="text-sm font-medium text-gray-700">
        {label}
      </Label>
      <div className="mt-1">
        <div className="flex gap-2 mb-2">
          <Input
            id={id}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className={cn(
              "flex-1",
              error && "border-red-500 focus:border-red-500"
            )}
            aria-describedby={error ? `${id}-error` : undefined}
          />
          <Button
            type="button"
            onClick={addItem}
            variant="outline"
            size="sm"
            disabled={!inputValue.trim()}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        
        {value.length > 0 && (
          <div className="space-y-1">
            {value.map((item, index) => (
              <div 
                key={index} 
                className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-md"
              >
                <span className="text-sm">{item}</span>
                <button
                  type="button"
                  onClick={() => removeItem(index)}
                  className="text-gray-400 hover:text-red-600"
                  aria-label={`Remove ${item}`}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
        
        {error && (
          <p id={`${id}-error`} className="mt-1 text-sm text-red-600">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
