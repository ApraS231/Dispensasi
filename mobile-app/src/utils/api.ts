import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Alert } from 'react-native';

console.log('AXIOS_API_BASE_URL:', process.env.EXPO_PUBLIC_API_URL);

const getRefererFromUrl = (url?: string) => {
  if (!url) return 'https://sidispen-api.osk.dom.my.id/';
  try {
    const match = url.match(/^(https?:\/\/[^\/]+)/);
    return match ? `${match[1]}/` : url;
  } catch (e) {
    return url;
  }
};

const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
  timeout: 30000, // 30 seconds timeout
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Referer': getRefererFromUrl(process.env.EXPO_PUBLIC_API_URL)
  }
});

const checkForDomCloudWarning = (data: any, headers: any): boolean => {
  const contentType = String(headers?.['content-type'] || '');
  if (typeof data === 'string') {
    const trimmed = data.trim();
    if (contentType.includes('text/html') || trimmed.startsWith('<!DOCTYPE') || trimmed.includes('<html')) {
      if (data.includes('DOM Cloud') || data.includes('trust') || data.includes('Verification Required')) {
        return true;
      }
    }
  }
  return false;
};

const triggerDomCloudAlert = () => {
  Alert.alert(
    'API Terblokir (DOM Cloud)',
    'Permintaan API diblokir oleh sistem keamanan DOM Cloud. Harap buka tautan berikut di browser HP/emulator Anda terlebih dahulu, tekan tombol "I understand, I trust this site", lalu buka kembali aplikasi ini:\n\nhttps://sidispen-api.osk.dom.my.id/',
    [{ text: 'OK' }]
  );
};

// Interceptor: sematkan Token Sanctum otomatis ke setiap request
api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('userToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  // Deteksi FormData dan atur Content-Type ke multipart/form-data agar Axios 
  // tidak melakukan fallback ke application/x-www-form-urlencoded.
  if (config.data instanceof FormData) {
    if (config.headers) {
      if (typeof config.headers.set === 'function') {
        config.headers.set('Content-Type', 'multipart/form-data');
      } else {
        config.headers['Content-Type'] = 'multipart/form-data';
      }
    }
    console.log('--- FormData Details ---');
    const parts = (config.data as any)._parts || [];
    parts.forEach(([key, value]: any) => {
      console.log(`  [${key}]:`, typeof value === 'object' ? JSON.stringify(value, null, 2) : value);
    });
    console.log('------------------------');
  }

  console.log(`API Request: [${config.method?.toUpperCase()}] ${config.url}`);
  return config;
});

// Interceptor: cek respon HTML (intersepsi DOM Cloud) dan log error
api.interceptors.response.use(
  (response) => {
    console.log(`API Response: [${response.config.method?.toUpperCase()}] ${response.config.url} - Status: ${response.status}`, response.data);
    if (checkForDomCloudWarning(response.data, response.headers)) {
      console.warn('DOM Cloud warning page detected in success response!');
      triggerDomCloudAlert();
      return Promise.reject(new Error('API returned HTML warning page.'));
    }
    return response;
  },
  (error) => {
    console.error('API Response Error:', error?.message, error?.response?.status);
    if (error.config) {
      console.log('Axios config headers at failure:', JSON.stringify(error.config.headers, null, 2));
    }
    if (error.response) {
      if (checkForDomCloudWarning(error.response.data, error.response.headers)) {
        console.warn('DOM Cloud warning page detected in error response!');
        triggerDomCloudAlert();
        return Promise.reject(new Error('API returned HTML warning page.'));
      }
    } else if (error.message === 'Network Error') {
      const enrichedError = new Error(
        'Koneksi gagal (Network Error).\n\nIni biasanya disebabkan karena halaman verifikasi keamanan DOM Cloud terblokir. Harap buka https://sidispen-api.osk.dom.my.id/ di browser HP Anda terlebih dahulu, tekan tombol "I understand, I trust this site", lalu coba lagi.'
      );
      Object.assign(enrichedError, error);
      return Promise.reject(enrichedError);
    }
    return Promise.reject(error);
  }
);

export default api;

