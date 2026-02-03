
import React from 'react';
import { COLORS } from '../src/constants';

const Logo: React.FC = () => {
  return (
    <div className="flex items-center gap-2 select-none">
      <span className="font-extrabold text-[22px] tracking-tighter" style={{ color: COLORS.white }}>
        DAKA
      </span>
      <div 
        className="px-1.5 py-0.5 rounded text-xs font-bold leading-none" 
        style={{ backgroundColor: COLORS.accentYellow1, color: COLORS.dark2 }}
      >
        NEWS
      </div>
    </div>
  );
};

export default Logo;
