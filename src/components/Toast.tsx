import React from 'react';
import { Sparkles } from 'lucide-react';

interface ToastProps {
  message: string | null;
}

export const Toast: React.FC<ToastProps> = ({ message }) => {
  if (!message) return null;
  return (
    <div className="omni-toast animate-in fade-in slide-in-from-top-2 duration-150">
      <Sparkles className="w-3.5 h-3.5 text-[#0071E3] shrink-0" />
      <span>{message}</span>
    </div>
  );
};
