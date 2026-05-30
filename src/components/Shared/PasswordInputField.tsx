'use client';
import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useThemePalette } from '@/lib/theme';

interface PasswordInputFieldProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function PasswordInputField({ value, onChange, placeholder }: PasswordInputFieldProps) {
  const C = useThemePalette();
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div style={{ position: 'relative' }}>
      <input
        type={showPassword ? 'text' : 'password'}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        style={{
          width: '100%',
          padding: '10px 40px 10px 12px',
          border: `1.5px solid ${C.border}`,
          borderRadius: 10,
          fontSize: 13,
          outline: 'none',
          background: C.surface,
          color: C.text,
          boxSizing: 'border-box',
        }}
      />
      <button
        type="button"
        onClick={() => setShowPassword((visible) => !visible)}
        aria-label={showPassword ? 'Hide password' : 'Show password'}
        style={{
          position: 'absolute',
          right: 12,
          top: '50%',
          transform: 'translateY(-50%)',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: C.muted,
          padding: 4,
          display: 'flex',
          alignItems: 'center',
        }}
      >
        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    </div>
  );
}
