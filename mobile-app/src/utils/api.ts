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
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Referer': getRefererFromUrl(process.env.EXPO_PUBLIC_API_URL)
  }
});

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
    const contentType = String(response.headers['content-type'] || '');
    // Jika respon berupa HTML dan bukan JSON (misal halaman peringatan DOM Cloud)
    if (
      typeof response.data === 'string' &&
      (contentType.includes('text/html') || response.data.trim().startsWith('<!DOCTYPE'))
    ) {
      console.warn('DOM Cloud User Generated Content Warning page detected!');
      if (response.data.includes('DOM Cloud') || response.data.includes('trust')) {
        Alert.alert(
          'API Terblokir (DOM Cloud)',
          'Permintaan API diblokir oleh sistem keamanan DOM Cloud. Harap buka tautan berikut di browser HP/emulator Anda terlebih dahulu, tekan tombol "I understand, I trust this site", lalu buka kembali aplikasi ini:\n\nhttps://sidispen-api.osk.dom.my.id/',
          [{ text: 'OK' }]
        );
      }
      return Promise.reject(new Error('API returned HTML warning page.'));
    }
    return response;
  },
  (error) => {
    console.error('API Response Error:', error?.message, error?.response?.status);
    return Promise.reject(error);
  }
);

export default api;

