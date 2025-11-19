import React, { useState, useEffect } from 'react';
import { ChildProfile, GoogleConfig } from '../types';
import { Button } from './Button';
import { X, Save, Baby, Cloud } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: ChildProfile | null;
  onSave: (profile: ChildProfile, config: GoogleConfig) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, profile, onSave }) => {
  const [name, setName] = useState(profile?.name || '');
  const [birthday, setBirthday] = useState(profile?.birthday || '');
  
  // Google Config State
  const [clientId, setClientId] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [spreadsheetId, setSpreadsheetId] = useState('');
  const [driveFolderId, setDriveFolderId] = useState('');

  useEffect(() => {
      if (isOpen) {
          const savedConfig = localStorage.getItem('google_config');
          if (savedConfig) {
              const config = JSON.parse(savedConfig);
              setClientId(config.clientId || '');
              setApiKey(config.apiKey || '');
              setSpreadsheetId(config.spreadsheetId || '');
              setDriveFolderId(config.driveFolderId || '');
          }
      }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const config: GoogleConfig = {
        clientId,
        apiKey,
        spreadsheetId,
        driveFolderId
    };
    onSave({ name, birthday }, config);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        <div className="bg-rose-50 p-4 flex justify-between items-center border-b border-rose-100 shrink-0">
          <h2 className="text-lg font-bold text-rose-800 flex items-center gap-2">
            <Baby size={20} />
            Settings
          </h2>
          <button onClick={onClose} className="text-rose-400 hover:text-rose-600">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto">
          {/* Child Profile Section */}
          <div className="space-y-4">
            <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider">Child Profile</h3>
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
          </div>

          <hr className="border-slate-100" />

          {/* Google Cloud Section */}
          <div className="space-y-4">
             <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider flex items-center gap-2">
                <Cloud size={16} /> Google Cloud Config
             </h3>
             <div className="bg-blue-50 p-3 rounded-lg text-xs text-blue-700 mb-2">
                 Required to save photos to Google Drive.
             </div>

             <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Client ID</label>
                <input
                type="text"
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                className="w-full rounded-xl border-slate-200 focus:border-rose-500 focus:ring-rose-500 text-xs font-mono"
                placeholder="...apps.googleusercontent.com"
                />
             </div>

             <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">API Key</label>
                <input
                type="text"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="w-full rounded-xl border-slate-200 focus:border-rose-500 focus:ring-rose-500 text-xs font-mono"
                placeholder="AIzaSy..."
                />
             </div>

             <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Sheet ID</label>
                <input
                type="text"
                value={spreadsheetId}
                onChange={(e) => setSpreadsheetId(e.target.value)}
                className="w-full rounded-xl border-slate-200 focus:border-rose-500 focus:ring-rose-500 text-xs font-mono"
                placeholder="ID from Sheet URL"
                />
             </div>

             <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Drive Folder ID (Optional)</label>
                <input
                type="text"
                value={driveFolderId}
                onChange={(e) => setDriveFolderId(e.target.value)}
                className="w-full rounded-xl border-slate-200 focus:border-rose-500 focus:ring-rose-500 text-xs font-mono"
                placeholder="Folder ID"
                />
             </div>
          </div>

          <div className="pt-2">
            <Button type="submit" className="w-full" icon={Save}>
              Save Settings
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};