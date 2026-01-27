
import React from 'react';
import { NewsItem } from '../types-old';
import { COLORS } from '../constants';

interface NewsCardProps {
  item: NewsItem;
  onClick: (item: NewsItem) => void;
}

const NewsCard: React.FC<NewsCardProps> = ({ item, onClick }) => {
  return (
    <div 
      onClick={() => onClick(item)}
      className="group p-3.5 border-b border-white/5 hover:bg-white/5 cursor-pointer transition-colors"
    >
      <div className="flex justify-between items-start mb-1.5">
        <span className="text-[11px] font-mono text-white/40">{item.time}</span>
        <span className="text-[10px] font-bold text-white/30 uppercase tracking-tighter">{item.source}</span>
      </div>
      
      <h3 className="text-sm font-bold leading-tight text-white">
        {item.title}
      </h3>
    </div>
  );
};

export default NewsCard;
