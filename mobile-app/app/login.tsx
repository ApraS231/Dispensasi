import { useState } from 'react';
import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import api from '../src/utils/api';
import { useAuthStore } from '../src/stores/authStore';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { setUser, setToken } = useAuthStore();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Perhatian', 'Email dan password harus diisi.');
      return;
    }
    setLoading(true);
    try {
      const response = await api.post('/login', { email, password });

      // Simpan Token di SecureStore
      await SecureStore.setItemAsync('userToken', response.data.token);

      // Update State Global
      setToken(response.data.token);
      setUser(response.data.user);

      // Redirect berdasarkan role
      const role = response.data.user.role;
      if (role === 'siswa') router.replace('/(siswa)/dashboard');
      else if (role === 'guru_piket') router.replace('/(piket)/dashboard');
      else if (role === 'wali_kelas') router.replace('/(wali)/dashboard');
      else if (role === 'orang_tua') router.replace('/(ortu)/dashboard');

    } catch (error: any) {
      const msg = error.response?.data?.message || 'Login Gagal. Periksa kembali email dan password.';
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={styles.card}>
        <Text style={styles.title}>SiDispen</Text>
        <Text style={styles.subtitle}>Sistem Dispensasi Digital</Text>

        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity style={[styles.button, loading && styles.buttonDisabled]} onPress={handleLogin} disabled={loading}>
          <Text style={styles.buttonText}>{loading ? 'Memproses...' : 'Masuk'}</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F3F4F6', padding: 20 },
  card: { width: '100%', maxWidth: 400, backgroundColor: '#fff', borderRadius: 16, padding: 32, elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8 },
  title: { fontSize: 32, fontWeight: '800', color: '#F59E0B', textAlign: 'center', marginBottom: 4 },
  subtitle: { fontSize: 14, color: '#9CA3AF', textAlign: 'center', marginBottom: 32 },
  input: { borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 16, marginBottom: 16, backgroundColor: '#F9FAFB' },
  button: { backgroundColor: '#F59E0B', borderRadius: 12, paddingVertical: 16, alignItems: 'center' },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: '700' },
});
