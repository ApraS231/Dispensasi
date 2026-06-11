import { useState } from 'react';
import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { View, Text, StyleSheet, Alert, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../src/utils/api';
import { useAuthStore } from '../src/stores/authStore';
import { useTheme } from '../src/hooks/useTheme';
import BouncyButton from '../src/components/BouncyButton';
import SkeuCard from '../src/components/SkeuCard';
import AnimatedEntrance from '../src/components/AnimatedEntrance';
import FormInput from '../src/components/FormInput';
import SuccessOverlay from '../src/components/SuccessOverlay';
import BrandHeader from '../src/components/BrandHeader';
import { validateEmail, validatePassword, parseValidationErrors } from '../src/utils/validation';

export default function LoginScreen() {
  const { colors, isDark, SIZES, SPACING, FONTS, shadows } = useTheme();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successVisible, setSuccessVisible] = useState(false);
  const { setUser, setToken } = useAuthStore();

  const handleEmailChange = (val: string) => {
    setEmail(val);
    if (errors.email || errors.general) {
      setErrors(prev => ({ ...prev, email: '', general: '' }));
    }
  };

  const handlePasswordChange = (val: string) => {
    setPassword(val);
    if (errors.password || errors.general) {
      setErrors(prev => ({ ...prev, password: '', general: '' }));
    }
  };

  const handleForgotPassword = () => {
    Alert.alert(
      'Lupa Password',
      'Fitur pemulihan password belum tersedia secara mandiri. Silakan hubungi Administrator atau Wali Kelas Anda untuk mengatur ulang password.'
    );
  };

  const handleLogin = async () => {
    const emailVal = validateEmail(email);
    const passwordVal = validatePassword(password);

    if (!emailVal.isValid || !passwordVal.isValid) {
      setErrors({
        email: emailVal.error || '',
        password: passwordVal.error || '',
      });
      return;
    }

    setLoading(true);
    setErrors({});
    
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

      await SecureStore.setItemAsync('userToken', response.data.token);
      setSuccessVisible(true);

      setTimeout(async () => {
        setToken(response.data.token);
        setUser(response.data.user);

        const role = response.data.user.role;
        if (role === 'siswa') router.replace('/(siswa)/dashboard');
        else if (role === 'guru_piket' || role === 'piket') router.replace('/(piket)/dashboard');
        else if (role === 'wali_kelas') router.replace('/(wali)/dashboard');
        else if (role === 'orang_tua') router.replace('/(ortu)/dashboard');
        else {
          setSuccessVisible(false);
          Alert.alert('Akses Ditolak', 'Akun admin atau role tidak valid hanya dapat diakses melalui web panel.');
          setToken(null);
          setUser(null);
          await SecureStore.deleteItemAsync('userToken');
        }
      }, 1800);

    } catch (error: any) {
      const backendErrors = parseValidationErrors(error);
      setErrors(backendErrors);
      if (backendErrors.general) {
        Alert.alert('Gagal Masuk', backendErrors.general);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={[colors.bgPrimary, colors.bgSecondary]}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea} edges={['bottom', 'left', 'right']}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          <ScrollView 
            contentContainerStyle={[styles.scrollContent, { padding: SPACING.lg, paddingBottom: SPACING.xl }]} 
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <BrandHeader showLogo={true} subtitle="Masuk ke gerbang digital SMAN 3" />
 
            <AnimatedEntrance delay={300} offset={30}>
              <SkeuCard style={styles.card} isGlass>
                <FormInput
                  label="Email Sekolah"
                  icon="email-outline"
                  placeholder="Masukkan email Anda"
                  value={email}
                  onChangeText={handleEmailChange}
                  error={errors.email}
                  isValid={email.length > 0 && !errors.email}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
 
                <FormInput
                  label="Password"
                  icon="lock-outline"
                  placeholder="Masukkan password Anda"
                  value={password}
                  onChangeText={handlePasswordChange}
                  error={errors.password}
                  isValid={password.length >= 8 && !errors.password}
                  isPassword
                />
 
                <View style={[styles.forgotPasswordRow, { marginBottom: SPACING.md }]}>
                  <TouchableOpacity activeOpacity={0.6} onPress={handleForgotPassword}>
                    <Text style={[styles.forgotPasswordText, { fontFamily: FONTS.headingSemi, color: colors.primary }]}>Lupa Password?</Text>
                  </TouchableOpacity>
                </View>
 
                <BouncyButton 
                  title={loading ? 'Memvalidasi...' : 'Masuk Sekarang'} 
                  onPress={handleLogin} 
                  loading={loading}
                  icon="login-variant"
                  style={{ marginTop: SPACING.xs }}
                />
              </SkeuCard>
              
              <View style={[styles.footerContainer, { marginTop: SPACING.lg }]}>
                <TouchableOpacity onPress={() => router.push('/register')}>
                  <Text style={[styles.signupText, { fontFamily: FONTS.body, color: colors.textSecondary }]}>
                    Belum punya akun? <Text style={{ color: colors.primary, fontFamily: FONTS.headingSemi }}>Daftar</Text>
                  </Text>
                </TouchableOpacity>

                <Text style={[styles.footerText, { fontFamily: FONTS.labelCaps, color: colors.textMuted, marginTop: SPACING.xl }]}>
                  Sistem Perizinan Siswa v2.0 • SMAN 3 Digital Team
                </Text>
              </View>
            </AnimatedEntrance>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
 
      <SuccessOverlay 
        visible={successVisible} 
        title="Masuk Berhasil" 
        message="Selamat datang kembali di Sistem Perizinan Siswa SMAN 3" 
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: { 
    flexGrow: 1, 
    justifyContent: 'center', 
  },
  card: { 
  },
  forgotPasswordRow: {
    alignItems: 'flex-end',
  },
  forgotPasswordText: {
    fontSize: 13,
  },
  signupText: {
    fontSize: 14,
    textAlign: 'center',
  },
  footerContainer: {
    alignItems: 'center',
    width: '100%',
  },
  footerText: {
    fontSize: 10,
    letterSpacing: 0.5,
  },
});
