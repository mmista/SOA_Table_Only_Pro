import React from 'react';
import { MessageSquare } from 'lucide-react';

interface CommentIconProps {
  hasComment: boolean;
  onClick: (e: React.MouseEvent) => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const CommentIcon: React.FC<CommentIconProps> = ({
  hasComment,
  onClick,
  className = '',
  size = 'sm'
}) => {
  const getSizeClasses = () => {
    switch (size) {
      case 'sm': return 'w-3 h-3';
      case 'md': return 'w-4 h-4';
      case 'lg': return 'w-5 h-5';
      default: return 'w-3 h-3';
    }
  };

  const getColorClasses = () => {
    if (hasComment) {
      return 'text-blue-600 hover:text-blue-700';
    }
    return 'text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100';
  };

  return (
    <button
      onClick={onClick}
      className={`
        transition-all duration-200 p-0.5 rounded hover:bg-white hover:bg-opacity-50
        ${getColorClasses()}
        ${className}
      `}
      title={hasComment ? 'View/edit comment' : 'Add comment'}
    >
      <MessageSquare 
        className={getSizeClasses()} 
        strokeWidth={hasComment ? 2 : 1.5}
        fill={hasComment ? 'currentColor' : 'none'}
      />
    </button>
  );
};