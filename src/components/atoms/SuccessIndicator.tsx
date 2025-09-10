import React from 'react';
import { CheckCircle } from 'lucide-react';

interface SuccessIndicatorProps {
  show: boolean;
  message: string;
}

export const SuccessIndicator: React.FC<SuccessIndicatorProps> = ({ show, message }) => {
  if (!show) return null;

  return (
    <span className="ml-2 text-green-300 flex items-center space-x-1">
      <CheckCircle className="w-4 h-4" />
      <span>• {message}</span>
    </span>
  );
};