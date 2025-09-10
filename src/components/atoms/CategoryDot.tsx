import React from 'react';

interface CategoryDotProps {
  category: string;
}

const getCategoryColor = (category: string) => {
  switch (category) {
    case 'visit': return 'bg-blue-500';
    case 'lab': return 'bg-green-500';
    case 'imaging': return 'bg-purple-500';
    case 'questionnaire': return 'bg-orange-500';
    default: return 'bg-gray-500';
  }
};

export const CategoryDot: React.FC<CategoryDotProps> = ({ category }) => {
  return (
    <div className={`w-3 h-3 rounded-full ${getCategoryColor(category)}`} />
  );
};