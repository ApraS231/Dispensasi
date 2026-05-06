import { useState, useEffect } from 'react';
import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { View, Text, TextInput, StyleSheet, Alert, KeyboardAvoidingView, Platform, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import api from '../src/utils/api';
import { useAuthStore } from '../src/stores/authStore';
import { COLORS, FONTS, SIZES, SPACING, SHADOWS } from '../src/utils/theme';
import { commonStyles } from '../src/utils/commonStyles';
import BouncyButton from '../src/components/BouncyButton';
import SkeuCard from '../src/components/SkeuCard';
import LiquidBackground from '../src/components/LiquidBackground';
import AnimatedEntrance from '../src/components/AnimatedEntrance';
import { MaterialCommunityIcons } from '@expo/vector-icons';

function TypewriterText({ text, delay = 50 }: { text: string; delay?: number }) {
  const [displayedText, setDisplayedText] = useState('');
  
  useEffect(() => {
    let index = 0;
    setDisplayedText(''); // Reset on text change
    const interval = setInterval(() => {
      setDisplayedText(text.substring(0, index + 1));
      index++;
      if (index >= text.length) clearInterval(interval);
    }, delay);
    return () => clearInterval(interval);
  }, [text]);

  return <Text style={styles.title}>{displayedText}</Text>;
}

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
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

      await SecureStore.setItemAsync('userToken', response.data.token);
      setToken(response.data.token);
      setUser(response.data.user);

      const role = response.data.user.role;
      if (role === 'siswa') router.replace('/(siswa)/dashboard');
      else if (role === 'guru_piket' || role === 'piket') router.replace('/(piket)/dashboard');
      else if (role === 'wali_kelas') router.replace('/(wali)/dashboard');
      else if (role === 'orang_tua') router.replace('/(ortu)/dashboard');
      else {
        Alert.alert('Akses Ditolak', 'Akun admin atau role tidak valid hanya dapat diakses melalui web panel.');
        setToken(null);
        setUser(null);
        await SecureStore.deleteItemAsync('userToken');
      }

    } catch (error: any) {
      const msg = error.response?.data?.message || 'Login Gagal. Periksa kembali email dan password.';
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={commonStyles.container}>
      <LiquidBackground />

      <SafeAreaView style={commonStyles.safeArea}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          <ScrollView 
            contentContainerStyle={styles.scrollContent} 
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.headerContainer}>
              <View style={styles.titleContainer}>
                <TypewriterText text="Selamat Datang!" />
                <AnimatedEntrance delay={600}>
                  <Text style={styles.subtitle}>Masuk ke gerbang digital SMA Negeri 3 untuk mengelola perizinanmu.</Text>
                </AnimatedEntrance>
              </View>
            </View>

            <AnimatedEntrance delay={1000} offset={40}>
              <SkeuCard style={styles.card} isGlass>
                <View style={styles.formLabelRow}>
                  <Text style={styles.formLabel}>Informasi Akun</Text>
                </View>

                <View style={[
                  styles.inputWrapper, 
                  focusedInput === 'email' && styles.inputWrapperFocused,
                  SHADOWS.inset
                ]}>
                  <View style={styles.inputIconContainer}>
                    <MaterialCommunityIcons 
                      name="email-outline" 
                      size={18} 
                      color={focusedInput === 'email' ? COLORS.primary : COLORS.textMuted} 
                    />
                  </View>
                  <TextInput
                    style={styles.input}
                    placeholder="Email Sekolah / Username"
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
                  focusedInput === 'password' && styles.inputWrapperFocused,
                  SHADOWS.inset
                ]}>
                  <View style={styles.inputIconContainer}>
                    <MaterialCommunityIcons 
                      name="lock-outline" 
                      size={18} 
                      color={focusedInput === 'password' ? COLORS.primary : COLORS.textMuted} 
                    />
                  </View>
                  <TextInput
                    style={styles.input}
                    placeholder="Password"
                    placeholderTextColor={COLORS.textMuted}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    onFocus={() => setFocusedInput('password')}
                    onBlur={() => setFocusedInput(null)}
                  />
                  <TouchableOpacity 
                    onPress={() => setShowPassword(!showPassword)} 
                    style={styles.eyeButton}
                    activeOpacity={0.6}
                  >
                    <MaterialCommunityIcons 
                      name={showPassword ? "eye-off-outline" : "eye-outline"} 
                      size={20} 
                      color={COLORS.textMuted} 
                    />
                  </TouchableOpacity>
                </View>

                <View style={styles.forgotPasswordRow}>
                  <TouchableOpacity activeOpacity={0.6}>
                    <Text style={styles.forgotPasswordText}>Lupa Password?</Text>
                  </TouchableOpacity>
                </View>

                <BouncyButton 
                  title={loading ? 'Memvalidasi...' : 'Masuk Sekarang'} 
                  onPress={handleLogin} 
                  loading={loading}
                  icon="login-variant"
                  style={{ marginTop: SPACING.md }}
                />
              </SkeuCard>
              
              <View style={styles.footerContainer}>
                <Text style={styles.footerText}>SiDispen v2.0 • SMAN 3 Digital Team</Text>
                
                <TouchableOpacity 
                  onPress={() => router.push('/register')} 
                  style={{ marginTop: SPACING.md }}
                >
                  <Text style={styles.footerLinkText}>Belum punya akun? <Text style={{ color: COLORS.primary, fontFamily: FONTS.headingSemi }}>Daftar di sini</Text></Text>
                </TouchableOpacity>
              </View>
            </AnimatedEntrance>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  scrollContent: { 
    flexGrow: 1, 
    justifyContent: 'center', 
    padding: SPACING.lg,
    paddingBottom: SPACING.xxl 
  },
  headerContainer: { 
    marginBottom: SPACING.xl, 
    alignItems: 'center' 
  },
  titleContainer: {
    alignItems: 'center',
    width: '100%',
    marginTop: SPACING.xxl, // Add space since logo is gone
  },
  title: { 
    fontFamily: FONTS.heading, 
    fontSize: 32, 
    color: COLORS.textPrimary, 
    marginBottom: SPACING.xs,
    textAlign: 'center',
  },
  subtitle: { 
    fontFamily: FONTS.body, 
    fontSize: 15, 
    color: COLORS.textSecondary, 
    lineHeight: 22, 
    textAlign: 'center',
    paddingHorizontal: SPACING.lg,
  },
  card: { 
    padding: SPACING.lg,
    borderRadius: SIZES.radiusXl,
  },
  formLabelRow: {
    marginBottom: SPACING.md,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
    paddingLeft: SPACING.sm,
  },
  formLabel: {
    fontFamily: FONTS.headingSemi,
    fontSize: 14,
    color: COLORS.textPrimary,
    letterSpacing: 0.2,
  },
  inputWrapper: {
    flexDirection: 'row', 
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.4)',
    borderRadius: SIZES.radiusMd,
    paddingHorizontal: SPACING.sm,
    height: 60,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.6)',
  },
  inputWrapperFocused: {
    borderColor: COLORS.primaryLight,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
  },
  inputIconContainer: {
    width: 36,
    height: 36,
    borderRadius: SIZES.radiusSm,
    backgroundColor: 'rgba(0,0,0,0.03)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  input: { 
    flex: 1, 
    fontFamily: FONTS.bodyMedium, 
    fontSize: 15, 
    color: COLORS.textPrimary,
    height: '100%',
  },
  eyeButton: {
    padding: SPACING.sm,
  },
  forgotPasswordRow: {
    alignItems: 'flex-end',
    marginBottom: SPACING.lg,
  },
  forgotPasswordText: {
    fontFamily: FONTS.headingSemi,
    fontSize: 13,
    color: COLORS.primary,
  },
  footerContainer: {
    marginTop: SPACING.xl,
    alignItems: 'center',
  },
  footerText: {
    fontFamily: FONTS.labelCaps,
    fontSize: 10,
    color: COLORS.textMuted,
    letterSpacing: 0.5,
  },
  footerLinkText: {
    fontFamily: FONTS.body,
    fontSize: 13,
    color: COLORS.textSecondary,
  }
});

