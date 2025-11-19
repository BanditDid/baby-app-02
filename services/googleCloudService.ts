
import { Memory } from "../types";

// ==================================================================================
// พื้นที่สำหรับตั้งค่า (CONFIGURATION AREA)
// คุณต้องสร้าง Project ใน Google Cloud Console และเปิดใช้งาน Drive API และ Sheets API
// ==================================================================================

// 1. ใส่ Client ID ของคุณที่ได้จาก Google Cloud Console (OAuth 2.0 Client IDs)
// ตัวอย่าง: '123456789-abcdefg.apps.googleusercontent.com'
const CLIENT_ID: string = 'Input_CLIENT_ID'; 

// 2. ใส่ API Key ของคุณที่ได้จาก Google Cloud Console (API Keys)
// ตัวอย่าง: 'AIzaSyD...'
const API_KEY: string = 'Input_API_KEY'; 

// 3. ใส่ ID ของ Google Sheet ที่ต้องการบันทึกข้อมูล (ดูจาก URL ของ Sheet: /spreadsheets/d/ID_ตรงนี้/edit)
// ตัวอย่าง: '1lazAXTiO8JHt81dZGq1xSNOs2gODqgH9JpDCcCjNrmk'
const SPREADSHEET_ID: string = 'Input_SPREADSHEET_ID';

// 4. (ตัวเลือก) ใส่ ID ของโฟลเดอร์ใน Google Drive ที่ต้องการเก็บรูป (ถ้าไม่ใส่จะเก็บที่ root)
// ตัวอย่าง: '18ZbzarqyVEesE82sheKorB5E-qwY4pDW'
const DRIVE_FOLDER_ID: string = 'Input_DRIVE_FOLDER_ID'; 

// Scope สิทธิ์ที่เราต้องการขอจากผู้ใช้ (Drive สำหรับรูป, Spreadsheets สำหรับข้อมูล)
const SCOPES = 'https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/spreadsheets';

// ==================================================================================

let tokenClient: any;
let gapiInited = false;
let gisInited = false;

export const isGoogleConfigured = () => {
    // Check if variables are not empty and don't contain placeholder text like "YOUR_"
    return CLIENT_ID && CLIENT_ID.length > 10 && !CLIENT_ID.includes('YOUR_') &&
           API_KEY && API_KEY.length > 10 && !API_KEY.includes('YOUR_') &&
           SPREADSHEET_ID && SPREADSHEET_ID.length > 5 && !SPREADSHEET_ID.includes('YOUR_');
};

// โหลด Google API Client
export const loadGoogleApi = (onLoad: () => void) => {
  const waitForScripts = (attempts = 0) => {
    const gapi = (window as any).gapi;
    const google = (window as any).google;

    // ถ้ายังไม่เจอ gapi หรือ google ให้รอ 500ms แล้วเช็คใหม่ (ทำซ้ำสูงสุด 20 ครั้ง = 10 วินาที)
    if (!gapi || !google) {
        if (attempts < 20) {
            setTimeout(() => waitForScripts(attempts + 1), 500);
        } else {
            console.error("Timeout waiting for Google Scripts to load.");
            // เรียก onLoad เพื่อให้แอพไม่ค้าง แม้โหลดไม่สำเร็จ
            onLoad();
        }
        return;
    }

    // ถ้า Config ไม่ครบ ไม่ต้องพยายาม Init ให้เสียเวลา (และป้องกัน Error)
    if (!isGoogleConfigured()) {
        console.warn("Google API keys are missing or placeholders. Skipping initialization.");
        gapiInited = true; 
        gisInited = true;
        onLoad(); 
        return;
    }

    // ถ้าเจอแล้ว เริ่ม Init gapi
    if (!gapiInited) {
        gapi.load('client', async () => {
            try {
                // 1. Init GAPI Client (Key Only)
                await gapi.client.init({
                    apiKey: API_KEY,
                    // discoveryDocs: [...] // REMOVED: สาเหตุของ Error "missing required fields"
                });

                // 2. Load APIs Explicitly (เสถียรกว่า)
                await Promise.all([
                    gapi.client.load('https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'),
                    gapi.client.load('https://sheets.googleapis.com/$discovery/rest?version=v4')
                ]);

                gapiInited = true;
                if (gisInited) onLoad();
            } catch (error) {
                console.error("GAPI Client Init Error:", error);
                // แม้ Error ก็เรียก onLoad เพื่อให้ปุ่มทำงาน (จะได้กดแล้วแจ้งเตือน user ได้)
                onLoad();
            }
        });
    } else {
        // กรณีที่โหลดเสร็จอยู่แล้ว (เช่น hot reload)
        if (gisInited) onLoad();
    }

    // เริ่ม Init GIS (Google Identity Services)
    if (!gisInited) {
        try {
            tokenClient = google.accounts.oauth2.initTokenClient({
                client_id: CLIENT_ID,
                scope: SCOPES,
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

// ฟังก์ชัน Login
export const handleGoogleLogin = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (!isGoogleConfigured()) {
        return reject(new Error("กรุณาตั้งค่า CLIENT_ID, API_KEY และ SPREADSHEET_ID ในไฟล์ services/googleCloudService.ts ให้ถูกต้องก่อนใช้งาน"));
    }
    if (!tokenClient) return reject(new Error("Google API library not loaded properly. Check console for errors."));

    // Override callback for login flow
    tokenClient.callback = async (resp: any) => {
      if (resp.error) {
        const errorMessage = typeof resp.error === 'string' ? resp.error : JSON.stringify(resp);
        reject(new Error(`Google Login Failed: ${errorMessage}`));
        return;
      }
      resolve();
    };

    // ขอสิทธิ์การเข้าถึง หรือขอสิทธิ์เพิ่มถ้ายังไม่มี
    if ((window as any).gapi.client.getToken() === null) {
      tokenClient.requestAccessToken({ prompt: 'consent' });
    } else {
      tokenClient.requestAccessToken({ prompt: '' });
    }
  });
};

// แปลง Base64 เป็น Blob สำหรับอัพโหลด
const base64ToBlob = (base64: string, mimeType: string) => {
  const byteCharacters = atob(base64.split(',')[1]);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: mimeType });
};

// ฟังก์ชันอัพโหลดรูปไปยัง Google Drive
export const uploadImageToDrive = async (base64: string, mimeType: string, fileName: string): Promise<string> => {
  try {
    const gapi = (window as any).gapi;
    const blob = base64ToBlob(base64, mimeType);
    
    const metadata = {
      name: fileName,
      mimeType: mimeType,
      parents: DRIVE_FOLDER_ID && !DRIVE_FOLDER_ID.includes('YOUR_') ? [DRIVE_FOLDER_ID] : undefined
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
    return data.webViewLink; // ส่งคืน Link สำหรับดูรูปภาพ

  } catch (error: any) {
    // Extract meaningful message
    const msg = error instanceof Error ? error.message : (error?.result?.error?.message || JSON.stringify(error));
    throw new Error(`Image Upload Error: ${msg}`);
  }
};

// ฟังก์ชันบันทึกข้อมูลลง Google Sheet
export const appendToSheet = async (memory: Memory, imageUrls: string[]) => {
  const gapi = (window as any).gapi;
  
  // จัดเตรียมข้อมูลที่จะลงตาราง [วันที่, อายุ, อารมณ์, ข้อความ, ลิงก์รูป1, ลิงก์รูป2...]
  const rowData = [
    memory.date,
    memory.calculatedAge,
    memory.mood,
    memory.note,
    ...imageUrls
  ];

  try {
      await gapi.client.sheets.spreadsheets.values.append({
        spreadsheetId: SPREADSHEET_ID,
        range: 'Sheet1!A1', // ชื่อ Sheet ต้องตรงกับใน Google Sheet ของคุณ
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
