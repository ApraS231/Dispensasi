import * as ImageManipulator from 'expo-image-manipulator';
import { getInfoAsync } from 'expo-file-system/legacy';

/**
 * Kompresi gambar sebelum diunggah ke server.
 * Mengurangi resolusi ke lebar 1200px dan kualitas ke 70%.
 */
export const compressImage = async (uri: string) => {
  try {
    // 1. Dapatkan info ukuran awal file
    const fileInfo: any = await getInfoAsync(uri);
    
    // Jika ukuran sudah di bawah 1MB (~1.048.576 bytes), tidak perlu kompresi berat
    if (fileInfo.exists && fileInfo.size < 1000000) {
      return uri;
    }

    // 2. Lakukan Manipulasi: Resize & Compress
    const result = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: 1200 } }], // Kecilkan lebar ke 1200px (tinggi menyesuaikan otomatis)
      { 
        compress: 0.7, // Kualitas 70%, ukuran turun drastis tapi tetap tajam
        format: ImageManipulator.SaveFormat.JPEG 
      }
    );

    return result.uri;
  } catch (error) {
    console.error("Gagal kompresi gambar:", error);
    return uri; // Kembalikan ke URI original jika terjadi kegagalan
  }
};
