import React from 'react';
import { LightColor } from '../types';

interface LightProps {
  color: LightColor;
}

const Light: React.FC<LightProps> = ({ color }) => {
  const baseClasses = "w-16 h-16 md:w-24 md:h-24 rounded-full border-4 transition-all duration-200";

  const colorClasses = {
    [LightColor.Off]: 'bg-gray-800 border-gray-700',
    [LightColor.Red]: 'bg-red-500 border-red-400 shadow-[0_0_25px_8px_rgba(239,68,68,0.7)]',
  };

  return <div className={`${baseClasses} ${colorClasses[color]}`}></div>;
};

export default Light;