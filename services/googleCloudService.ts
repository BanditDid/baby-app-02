import { Memory, GoogleConfig } from "../types";

// Configuration state
let currentConfig: GoogleConfig = {
    clientId: '',
    apiKey: '',
    spreadsheetId: '',
    driveFolderId: ''
};

let tokenClient: any;
let gapiInited = false;
let gisInited = false;

// Initialize configuration from LocalStorage or App
export const setGoogleConfig = (config: GoogleConfig) => {
    currentConfig = config;
};

export const isGoogleConfigured = () => {
    return currentConfig.clientId && currentConfig.clientId.length > 10 && 
           currentConfig.apiKey && currentConfig.apiKey.length > 10 && 
           currentConfig.spreadsheetId && currentConfig.spreadsheetId.length > 5;
};

// Load Google API Client
export const loadGoogleApi = (onLoad: () => void) => {
  const waitForScripts = (attempts = 0) => {
    const gapi = (window as any).gapi;
    const google = (window as any).google;

    if (!gapi || !google) {
        if (attempts < 20) {
            setTimeout(() => waitForScripts(attempts + 1), 500);
        } else {
            console.error("Timeout waiting for Google Scripts to load.");
            onLoad();
        }
        return;
    }

    if (!isGoogleConfigured()) {
        // Even if not configured, we signal we are "ready" (but features won't work)
        gapiInited = true; 
        gisInited = true;
        onLoad(); 
        return;
    }

    if (!gapiInited) {
        gapi.load('client', async () => {
            try {
                await gapi.client.init({
                    apiKey: currentConfig.apiKey,
                });

                await Promise.all([
                    gapi.client.load('https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'),
                    gapi.client.load('https://sheets.googleapis.com/$discovery/rest?version=v4')
                ]);

                gapiInited = true;
                if (gisInited) onLoad();
            } catch (error) {
                console.error("GAPI Client Init Error:", error);
                onLoad();
            }
        });
    } else {
        if (gisInited) onLoad();
    }

    if (!gisInited) {
        try {
            tokenClient = google.accounts.oauth2.initTokenClient({
                client_id: currentConfig.clientId,
                scope: 'https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/spreadsheets',
                callback: (resp: any) => {
                    console.log("Token client initialized", resp);
                },
            });
            gisInited = true;
            if (gapiInited) onLoad();
        } catch (error) {
            console.error("Token Client Init Error:", error);
            onLoad();
        }
    }
  };

  waitForScripts();
};

export const handleGoogleLogin = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (!isGoogleConfigured()) {
        return reject(new Error("Missing Google Configuration. Please go to Settings to enter your API Keys."));
    }
    if (!tokenClient) {
        // Try to re-init if missing
        loadGoogleApi(() => {});
        return reject(new Error("Google API library not ready. Please try again in a few seconds."));
    }

    tokenClient.callback = async (resp: any) => {
      if (resp.error) {
        const errorMessage = typeof resp.error === 'string' ? resp.error : JSON.stringify(resp);
        reject(new Error(`Google Login Failed: ${errorMessage}`));
        return;
      }
      resolve();
    };

    if ((window as any).gapi.client.getToken() === null) {
      tokenClient.requestAccessToken({ prompt: 'consent' });
    } else {
      tokenClient.requestAccessToken({ prompt: '' });
    }
  });
};

const base64ToBlob = (base64: string, mimeType: string) => {
  const byteCharacters = atob(base64.split(',')[1]);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: mimeType });
};

export const uploadImageToDrive = async (base64: string, mimeType: string, fileName: string): Promise<string> => {
  try {
    const gapi = (window as any).gapi;
    const blob = base64ToBlob(base64, mimeType);
    
    const metadata = {
      name: fileName,
      mimeType: mimeType,
      parents: currentConfig.driveFolderId ? [currentConfig.driveFolderId] : undefined
    };

    const form = new FormData();
    form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
    form.append('file', blob);

    const accessToken = gapi.client.getToken()?.access_token;
    if (!accessToken) throw new Error("No Google Access Token found. Please login again.");

    const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,webViewLink', {
      method: 'POST',
      headers: new Headers({ 'Authorization': 'Bearer ' + accessToken }),
      body: form,
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Drive Upload Failed: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    if (!data.webViewLink) {
        throw new Error("Drive Upload successful but webViewLink is missing.");
    }
    return data.webViewLink;

  } catch (error: any) {
    const msg = error instanceof Error ? error.message : (error?.result?.error?.message || JSON.stringify(error));
    throw new Error(`Image Upload Error: ${msg}`);
  }
};

export const appendToSheet = async (memory: Memory, imageUrls: string[]) => {
  const gapi = (window as any).gapi;
  
  const rowData = [
    memory.date,
    memory.calculatedAge,
    memory.mood,
    memory.note,
    ...imageUrls
  ];

  try {
      await gapi.client.sheets.spreadsheets.values.append({
        spreadsheetId: currentConfig.spreadsheetId,
        range: 'Sheet1!A1',
        valueInputOption: 'USER_ENTERED',
        resource: {
          values: [rowData],
        },
      });
  } catch (error: any) {
      const msg = error instanceof Error ? error.message : (error?.result?.error?.message || JSON.stringify(error));
      throw new Error(`Sheets Append Failed: ${msg}`);
  }
};

export const getGapiClient = () => (window as any).gapi;