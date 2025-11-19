import React, { useState } from 'react';
import { Memory } from '../types';
import { MOOD_CONFIG } from '../constants';
import { Calendar, Baby, Trash2, Edit2, Download } from 'lucide-react';
import { formatDate } from '../utils/dateUtils';

interface MemoryCardProps {
  memory: Memory;
  onDelete: (id: string) => void;
  onEdit: (memory: Memory) => void;
}

export const MemoryCard: React.FC<MemoryCardProps> = ({ memory, onDelete, onEdit }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const MoodIcon = MOOD_CONFIG[memory.mood].icon;
  const moodStyle = MOOD_CONFIG[memory.mood].color;

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % memory.images.length);
  };

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    const image = memory.images[currentImageIndex];
    const link = document.createElement('a');
    link.href = image.base64;
    link.download = `babysteps-${memory.date}-${currentImageIndex + 1}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mb-6">
      {/* Image Carousel */}
      <div className="relative aspect-square bg-slate-100 group">
        {memory.images.length > 0 && (
          <img 
            src={memory.images[currentImageIndex].base64} 
            alt="Memory" 
            className="w-full h-full object-cover"
          />
        )}
        
        {/* Download Button */}
        <button
            onClick={handleDownload}
            className="absolute top-3 right-3 bg-black/50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70 z-10"
            title="Download Photo"
        >
            <Download size={16} />
        </button>

        {memory.images.length > 1 && (
          <div className="absolute bottom-3 right-3 bg-black/50 text-white text-xs px-2 py-1 rounded-full z-10">
            {currentImageIndex + 1} / {memory.images.length}
          </div>
        )}
        
        {memory.images.length > 1 && (
           <button 
             onClick={(e) => { e.stopPropagation(); nextImage(); }}
             className="absolute inset-0 w-full h-full bg-transparent cursor-pointer"
             aria-label="Next image"
           />
        )}
      </div>

      <div className="p-4">
        {/* Header: Date and Age */}
        <div className="flex justify-between items-start mb-3">
          <div>
            <div className="flex items-center text-slate-400 text-xs font-medium mb-1">
              <Calendar size={12} className="mr-1" />
              {formatDate(memory.date)}
            </div>
            <div className="flex items-center text-rose-500 text-sm font-bold">
              <Baby size={14} className="mr-1" />
              {memory.calculatedAge}
            </div>
          </div>
          
          <div className={`px-2 py-1 rounded-lg flex items-center gap-1 text-xs font-medium border ${moodStyle}`}>
            <MoodIcon size={12} />
            {MOOD_CONFIG[memory.mood].label}
          </div>
        </div>

        {/* Note */}
        {memory.note && (
          <p className="text-slate-700 text-sm leading-relaxed bg-slate-50 p-3 rounded-xl">
            "{memory.note}"
          </p>
        )}

        {/* Actions */}
        <div className="mt-4 flex justify-end border-t border-slate-100 pt-3 gap-2">
          <button 
            onClick={() => onEdit(memory)}
            className="text-slate-400 hover:text-blue-500 transition-colors p-2"
            title="Edit"
          >
            <Edit2 size={16} />
          </button>
          <button 
            onClick={() => onDelete(memory.id)}
            className="text-slate-400 hover:text-red-500 transition-colors p-2"
            title="Delete"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};