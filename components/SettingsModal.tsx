import React, { useState } from 'react';
import { ChildProfile } from '../types';
import { Button } from './Button';
import { X, Save, Baby } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: ChildProfile | null;
  onSave: (profile: ChildProfile) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, profile, onSave }) => {
  const [name, setName] = useState(profile?.name || '');
  const [birthday, setBirthday] = useState(profile?.birthday || '');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ name, birthday });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="bg-rose-50 p-4 flex justify-between items-center border-b border-rose-100">
          <h2 className="text-lg font-bold text-rose-800 flex items-center gap-2">
            <Baby size={20} />
            Setup Profile
          </h2>
          <button onClick={onClose} className="text-rose-400 hover:text-rose-600">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Child's Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border-slate-200 focus:border-rose-500 focus:ring-rose-500"
              placeholder="e.g. Oliver"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Birthday</label>
            <input
              type="date"
              required
              value={birthday}
              onChange={(e) => setBirthday(e.target.value)}
              className="w-full rounded-xl border-slate-200 focus:border-rose-500 focus:ring-rose-500"
            />
          </div>

          <div className="pt-2">
            <Button type="submit" className="w-full" icon={Save}>
              Save Profile
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};