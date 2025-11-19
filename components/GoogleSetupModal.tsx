import React from 'react';
import { X, Copy, ExternalLink, AlertTriangle } from 'lucide-react';
import { Button } from './Button';

interface GoogleSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GoogleSetupModal: React.FC<GoogleSetupModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const currentOrigin = window.location.origin;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-slate-800 p-6 flex justify-between items-start shrink-0">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <AlertTriangle className="text-yellow-400" />
              Google Cloud Setup Required
            </h2>
            <p className="text-slate-300 text-sm mt-1">
              Follow these steps to connect your Google Drive & Sheets.
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-slate-700">
          
          {/* Step 1 */}
          <div className="space-y-2">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <span className="bg-rose-100 text-rose-600 w-6 h-6 rounded-full flex items-center justify-center text-sm">1</span>
              Copy Origin URL
            </h3>
            <p className="text-sm text-slate-500">Add this to "Authorized JavaScript origins" in Google Cloud Console.</p>
            <div className="flex gap-2">
              <code className="flex-1 bg-slate-100 p-3 rounded-lg border border-slate-200 font-mono text-sm">
                {currentOrigin}
              </code>
              <Button variant="secondary" onClick={() => copyToClipboard(currentOrigin)} icon={Copy}>
                Copy
              </Button>
            </div>
          </div>

          {/* Step 2 */}
          <div className="space-y-2">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <span className="bg-rose-100 text-rose-600 w-6 h-6 rounded-full flex items-center justify-center text-sm">2</span>
              Google Cloud Console
            </h3>
            <ol className="list-decimal list-inside space-y-2 text-sm ml-2">
              <li>Create a <strong>New Project</strong> at <a href="https://console.cloud.google.com/" target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">Google Cloud Console</a>.</li>
              <li>Enable <strong>Google Drive API</strong> and <strong>Google Sheets API</strong>.</li>
              <li>Create <strong>OAuth Client ID</strong> (Web application).</li>
              <li>Paste your URL from Step 1 into <strong>Authorized JavaScript origins</strong>.</li>
              <li>Add your email as a <strong>Test User</strong> in OAuth consent screen.</li>
            </ol>
          </div>

          {/* Step 3 - Login Sheet */}
          <div className="space-y-2">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <span className="bg-rose-100 text-rose-600 w-6 h-6 rounded-full flex items-center justify-center text-sm">3</span>
              Create 'Login' Sheet (Whitelist)
            </h3>
            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-xl text-sm text-yellow-800">
                <p className="font-bold mb-2">Mandatory for Access Control:</p>
                <ol className="list-decimal list-inside space-y-1">
                    <li>Open your Google Sheet.</li>
                    <li>Create a new tab (sheet) named exactly <strong>Login</strong>.</li>
                    <li>In cell <strong>A1</strong>, type: <code>admin@admin.com</code></li>
                    <li>In cell <strong>A2</strong>, type: <code>your-email@gmail.com</code></li>
                </ol>
                <p className="mt-2 text-xs text-yellow-700">Only emails listed in Column A of this sheet can log in.</p>
            </div>
          </div>

           {/* Step 4 */}
           <div className="space-y-2">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <span className="bg-rose-100 text-rose-600 w-6 h-6 rounded-full flex items-center justify-center text-sm">4</span>
              Connect App
            </h3>
            <p className="text-sm">
              Click the <strong>Settings (Gear Icon)</strong> in this app and paste your Client ID, API Key, and Sheet ID.
            </p>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end shrink-0">
          <Button onClick={onClose}>Got it</Button>
        </div>
      </div>
    </div>
  );
};