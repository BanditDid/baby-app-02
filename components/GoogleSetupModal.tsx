
import React from 'react';
import { X, Copy, ExternalLink, AlertTriangle, CheckCircle } from 'lucide-react';
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
              To save photos to Drive & Sheets, you must configure your own Google Project.
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
              Get your Origin URL
            </h3>
            <p className="text-sm text-slate-500">You must add this URL to "Authorized JavaScript origins" in Google Cloud Console.</p>
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
              Create Project & Keys
            </h3>
            <ol className="list-decimal list-inside space-y-2 text-sm ml-2">
              <li>Go to <a href="https://console.cloud.google.com/" target="_blank" rel="noreferrer" className="text-blue-600 hover:underline inline-flex items-center">Google Cloud Console <ExternalLink size={12} className="ml-1"/></a>.</li>
              <li>Create a <strong>New Project</strong>.</li>
              <li>Go to <strong>APIs & Services &gt; Library</strong> and enable:
                <ul className="list-disc list-inside ml-4 text-slate-500 mt-1">
                  <li>Google Drive API</li>
                  <li>Google Sheets API</li>
                </ul>
              </li>
              <li>Go to <strong>Credentials</strong>:
                <ul className="list-disc list-inside ml-4 text-slate-500 mt-1">
                  <li>Create <strong>API Key</strong>.</li>
                  <li>Create <strong>OAuth Client ID</strong> (Application type: Web application).</li>
                  <li>Paste your Origin URL (from Step 1) into <strong>Authorized JavaScript origins</strong>.</li>
                </ul>
              </li>
              <li><strong>IMPORTANT:</strong> Go to <strong>OAuth consent screen</strong> and add your email as a <strong>Test User</strong>.</li>
            </ol>
          </div>

          {/* Step 3 */}
          <div className="space-y-2">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <span className="bg-rose-100 text-rose-600 w-6 h-6 rounded-full flex items-center justify-center text-sm">3</span>
              Update Code
            </h3>
            <p className="text-sm">
              Open <code>services/googleCloudService.ts</code> and replace the variables at the top with your new keys.
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
