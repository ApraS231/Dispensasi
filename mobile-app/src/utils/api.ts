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
  
  // Deteksi FormData dan hapus default Content-Type agar Axios/React Native 
  // dapat secara otomatis menyusun boundary multipart/form-data.
  if (config.data instanceof FormData) {
    if (config.headers) {
      delete config.headers['Content-Type'];
      delete config.headers['content-type'];
      if (typeof config.headers.delete === 'function') {
        config.headers.delete('Content-Type');
        config.headers.delete('content-type');
      }
    }
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
    if (error.response) {
      if (checkForDomCloudWarning(error.response.data, error.response.headers)) {
        console.warn('DOM Cloud warning page detected in error response!');
        triggerDomCloudAlert();
        return Promise.reject(new Error('API returned HTML warning page.'));
      }
    }
    return Promise.reject(error);
  }
);

export default api;

