import { useState } from 'react';
import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { View, Text, TextInput, StyleSheet, Alert, KeyboardAvoidingView, Platform, SafeAreaView } from 'react-native';
import { Image } from 'expo-image';
import api from '../src/utils/api';
import { useAuthStore } from '../src/stores/authStore';
import { COLORS, FONTS, SIZES, SPACING, SHADOWS } from '../src/utils/theme';
import BouncyButton from '../src/components/BouncyButton';
import SoftCard from '../src/components/SoftCard';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  const { setUser, setToken } = useAuthStore();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Perhatian', 'Email dan password harus diisi.');
      return;
    }
    setLoading(true);
    try {

      let deviceToken: string | undefined;
      try {
        const projectId = Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
        if (projectId) {
            const { data } = await Notifications.getExpoPushTokenAsync({ projectId });
            deviceToken = data;
        }
      } catch (e) {
        console.log('Error getting push token during login', e);
      }

      const response = await api.post('/login', {
        email,
        password,
        device_token: deviceToken
      });

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
    <View style={styles.container}>
      {/* Background Logo */}
      <Image
        source={require('../assets/images/logo.png')}
        style={styles.backgroundImage}
        contentFit="contain"
      />

      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardView}>
          
          <View style={styles.headerContainer}>
            <View style={styles.badgeContainer}>
              <Text style={styles.badgeText}>SiDispen</Text>
            </View>
            <Text style={styles.title}>Selamat Datang!</Text>
            <Text style={styles.subtitle}>Silakan masuk ke akunmu untuk melanjutkan.</Text>
          </View>

          <SoftCard style={styles.card}>
            <View style={[
              styles.inputWrapper, 
              focusedInput === 'email' && styles.inputWrapperFocused
            ]}>
              <Text style={styles.inputIcon}>@</Text>
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor={COLORS.textMuted}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                onFocus={() => setFocusedInput('email')}
                onBlur={() => setFocusedInput(null)}
              />
            </View>

            <View style={[
              styles.inputWrapper, 
              focusedInput === 'password' && styles.inputWrapperFocused
            ]}>
              <Text style={styles.inputIcon}>*</Text>
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor={COLORS.textMuted}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                onFocus={() => setFocusedInput('password')}
                onBlur={() => setFocusedInput(null)}
              />
            </View>

            <BouncyButton 
              title={loading ? 'Tunggu Sebentar...' : 'Ayo Mulai!'} 
              onPress={handleLogin} 
              loading={loading}
              style={{ marginTop: SPACING.md }}
              variant="primary"
            />
            
            <Text style={styles.helpText}>Lupa Password?</Text>
          </SoftCard>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent' },
  safeArea: { flex: 1 },
  keyboardView: { flex: 1, justifyContent: 'center', padding: SPACING.xl },
  backgroundImage: {
    position: 'absolute',
    width: '150%',
    height: '150%',
    opacity: 0.05,
    top: '-20%',
    left: '-25%',
    transform: [{ rotate: '-15deg' as any }]
  },
  headerContainer: { marginBottom: SPACING.xxl, alignItems: 'flex-start' },
  badgeContainer: {
    backgroundColor: COLORS.primaryContainer,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: SIZES.radiusButton,
    borderWidth: 2,
    borderColor: 'transparent',
    marginBottom: SPACING.md,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
  },
  badgeText: {
    fontFamily: FONTS.headingSemi,
    fontSize: 16,
    color: COLORS.textPrimary,
  },
  title: { fontFamily: FONTS.heading, fontSize: 36, color: COLORS.textPrimary, marginBottom: SPACING.sm },
  subtitle: { fontFamily: FONTS.bodyMedium, fontSize: 16, color: COLORS.textSecondary, lineHeight: 24 },
  card: { padding: SPACING.lg },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.surfaceContainerLowest,
    borderRadius: SIZES.radiusMd,
    paddingHorizontal: SPACING.md,
    height: 56,
    borderWidth: 2,
    borderColor: 'transparent', // Brutalist thick border
    marginBottom: SPACING.md,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
  },
  inputWrapperFocused: {
    backgroundColor: COLORS.surfaceContainerLow,
    shadowOffset: { width: 5, height: 5 },
    transform: [{ translateX: -2 }, { translateY: -2 }],
  },
  inputIcon: { fontSize: 18, marginRight: SPACING.sm, opacity: 0.5, color: COLORS.textPrimary, fontFamily: FONTS.headingSemi },
  input: { flex: 1, fontFamily: FONTS.bodyMedium, fontSize: 16, color: COLORS.textPrimary },
  helpText: { fontFamily: FONTS.headingSemi, fontSize: 14, color: COLORS.primary, textAlign: 'center', marginTop: SPACING.xl }
});
