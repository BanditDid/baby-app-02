import React from 'react';
import { Memory } from '../types';
import { MOOD_CONFIG } from '../constants';
import { Calendar, Baby, Trash2, Edit2 } from 'lucide-react';
import { formatDate } from '../utils/dateUtils';

interface MemoryListItemProps {
  memory: Memory;
  onDelete: (id: string) => void;
  onEdit: (memory: Memory) => void;
}

export const MemoryListItem: React.FC<MemoryListItemProps> = ({ memory, onDelete, onEdit }) => {
  const MoodIcon = MOOD_CONFIG[memory.mood].icon;
  const moodConfig = MOOD_CONFIG[memory.mood];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-3 mb-3 flex gap-3 items-center hover:bg-slate-50 transition-colors">
       {/* Thumbnail */}
       <div className="w-16 h-16 shrink-0 rounded-lg overflow-hidden bg-slate-100 border border-slate-100">
         {memory.images.length > 0 ? (
            <img src={memory.images[0].base64} alt="Thumbnail" className="w-full h-full object-cover" />
         ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-300">
                <Baby size={20} />
            </div>
         )}
       </div>

       {/* Content */}
       <div className="flex-1 min-w-0 self-stretch flex flex-col justify-center">
          <div className="flex items-center gap-2 mb-1.5">
             <span className="text-xs font-bold text-rose-500 flex items-center gap-1 bg-rose-50 px-1.5 py-0.5 rounded-md">
               <Baby size={12} /> {memory.calculatedAge}
             </span>
             <span className="text-xs text-slate-400 flex items-center gap-1">
               <Calendar size={10} /> {formatDate(memory.date)}
             </span>
          </div>
          
          <div className="flex items-center gap-2">
            <div className={`shrink-0 p-1 rounded-full ${moodConfig.color} bg-opacity-50`}>
                <MoodIcon size={12} />
            </div>
             <p className="text-sm text-slate-600 truncate font-medium">
               {memory.note || <span className="italic text-slate-400">No note added</span>}
             </p>
          </div>
       </div>

       {/* Actions */}
       <div className="flex gap-1 pl-2 border-l border-slate-100">
          <button 
            onClick={() => onEdit(memory)} 
            className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-full transition-colors"
            title="Edit"
          >
            <Edit2 size={16} />
          </button>
           <button 
            onClick={() => onDelete(memory.id)} 
            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
            title="Delete"
          >
            <Trash2 size={16} />
          </button>
       </div>
    </div>
  );
};