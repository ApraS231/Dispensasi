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
    
    // Cek apakah file sudah JPEG/JPG
    const isJpeg = uri.toLowerCase().endsWith('.jpg') || uri.toLowerCase().endsWith('.jpeg');
    
    // Jika file sudah JPEG dan ukurannya di bawah 1MB, tidak perlu diproses ulang
    if (isJpeg && fileInfo.exists && fileInfo.size < 1000000) {
      return uri;
    }

    // 2. Lakukan Manipulasi: Resize jika ukuran >= 1MB, dan selalu simpan ke JPEG
    const actions: any[] = [];
    if (fileInfo.exists && fileInfo.size >= 1000000) {
      actions.push({ resize: { width: 1200 } });
    }

    const result = await ImageManipulator.manipulateAsync(
      uri,
      actions,
      { 
        compress: 0.8, // Kualitas 80%
        format: ImageManipulator.SaveFormat.JPEG 
      }
    );

    return result.uri;
  } catch (error) {
    console.error("Gagal kompresi gambar:", error);
    return uri; // Kembalikan ke URI original jika terjadi kegagalan
  }
};
