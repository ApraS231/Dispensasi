import { useState, useEffect } from 'react';
import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { View, Text, TextInput, StyleSheet, Alert, KeyboardAvoidingView, Platform, SafeAreaView, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import api from '../src/utils/api';
import { useAuthStore } from '../src/stores/authStore';
import { COLORS, FONTS, SIZES, SPACING, SHADOWS } from '../src/utils/theme';
import { commonStyles } from '../src/utils/commonStyles';
import BouncyButton from '../src/components/BouncyButton';
import SkeuCard from '../src/components/SkeuCard';
import LiquidBackground from '../src/components/LiquidBackground';
import AnimatedEntrance from '../src/components/AnimatedEntrance';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { HapticFeedback } from '../src/utils/haptics';

function TypewriterText({ text, delay = 50 }: { text: string; delay?: number }) {
  const [displayedText, setDisplayedText] = useState('');
  
  useEffect(() => {
    let index = 0;
    setDisplayedText(''); 
    const interval = setInterval(() => {
      setDisplayedText(text.substring(0, index + 1));
      index++;
      if (index >= text.length) clearInterval(interval);
    }, delay);
    return () => clearInterval(interval);
  }, [text]);

  return <Text style={styles.title}>{displayedText}</Text>;
}

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nis, setNis] = useState('');
  const [selectedKelasId, setSelectedKelasId] = useState<string | null>(null);
  const [showKelasPicker, setShowKelasPicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const { setUser, setToken } = useAuthStore();

  // Fetch Kelas list
  const { data: kelasList = [], isLoading: isLoadingKelas } = useQuery({
    queryKey: ['kelas-public'],
    queryFn: async () => {
      const { data } = await api.get('/kelas');
      return data;
    }
  });

  const handleRegister = async () => {
    if (!name || !email || !password || !nis || !selectedKelasId) {
      Alert.alert('Perhatian', 'Semua data harus diisi.');
      return;
    }
    
    setLoading(true);
    HapticFeedback.medium();
    
    try {
      const response = await api.post('/register', {
        name,
        email,
        password,
        nis,
        kelas_id: selectedKelasId
      });

      await SecureStore.setItemAsync('userToken', response.data.token);
      setToken(response.data.token);
      setUser(response.data.user);

      Alert.alert('Sukses', response.data.message);
      router.replace('/(siswa)/dashboard');

    } catch (error: any) {
      const msg = error.response?.data?.message || 'Registrasi Gagal. Silakan coba lagi.';
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
                <TypewriterText text="Daftar Akun Baru" />
                <AnimatedEntrance delay={600}>
                  <Text style={styles.subtitle}>Bergabunglah dengan ekosistem digital perizinan SMA Negeri 3.</Text>
                </AnimatedEntrance>
              </View>
            </View>

            <AnimatedEntrance delay={800} offset={40}>
              <SkeuCard style={styles.card} isGlass>
                <View style={styles.formLabelRow}>
                  <Text style={styles.formLabel}>Data Siswa</Text>
                </View>

                {/* Name */}
                <View style={[
                  styles.inputWrapper, 
                  focusedInput === 'name' && styles.inputWrapperFocused,
                  SHADOWS.inset
                ]}>
                  <View style={styles.inputIconContainer}>
                    <MaterialCommunityIcons 
                      name="account-outline" 
                      size={18} 
                      color={focusedInput === 'name' ? COLORS.primary : COLORS.textMuted} 
                    />
                  </View>
                  <TextInput
                    style={styles.input}
                    placeholder="Nama Lengkap"
                    placeholderTextColor={COLORS.textMuted}
                    value={name}
                    onChangeText={setName}
                    onFocus={() => setFocusedInput('name')}
                    onBlur={() => setFocusedInput(null)}
                  />
                </View>

                {/* Email */}
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

                {/* NIS */}
                <View style={[
                  styles.inputWrapper, 
                  focusedInput === 'nis' && styles.inputWrapperFocused,
                  SHADOWS.inset
                ]}>
                  <View style={styles.inputIconContainer}>
                    <MaterialCommunityIcons 
                      name="card-account-details-outline" 
                      size={18} 
                      color={focusedInput === 'nis' ? COLORS.primary : COLORS.textMuted} 
                    />
                  </View>
                  <TextInput
                    style={styles.input}
                    placeholder="NIS (Nomor Induk Siswa)"
                    placeholderTextColor={COLORS.textMuted}
                    value={nis}
                    onChangeText={setNis}
                    keyboardType="numeric"
                    onFocus={() => setFocusedInput('nis')}
                    onBlur={() => setFocusedInput(null)}
                  />
                </View>

                {/* Password */}
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
                    placeholder="Password (Min 8 Karakter)"
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
                  >
                    <MaterialCommunityIcons 
                      name={showPassword ? "eye-off-outline" : "eye-outline"} 
                      size={20} 
                      color={COLORS.textMuted} 
                    />
                  </TouchableOpacity>
                </View>

                {/* Kelas Picker */}
                <TouchableOpacity 
                  style={[styles.inputWrapper, SHADOWS.inset]} 
                  onPress={() => setShowKelasPicker(!showKelasPicker)}
                >
                  <View style={styles.inputIconContainer}>
                    <MaterialCommunityIcons name="google-classroom" size={18} color={COLORS.textMuted} />
                  </View>
                  <Text style={[styles.input, { textAlignVertical: 'center', paddingTop: 18 }]}>
                    {selectedKelasId 
                      ? kelasList.find((k: any) => k.id === selectedKelasId)?.nama_kelas 
                      : 'Pilih Kelas'}
                  </Text>
                  <MaterialCommunityIcons name={showKelasPicker ? "chevron-up" : "chevron-down"} size={20} color={COLORS.textMuted} />
                </TouchableOpacity>

                {showKelasPicker && (
                  <SkeuCard isGlass style={styles.dropdownCard}>
                    {isLoadingKelas ? (
                      <ActivityIndicator color={COLORS.primary} style={{ padding: 20 }} />
                    ) : (
                      <ScrollView style={{ maxHeight: 180 }}>
                        {kelasList.map((kelas: any) => (
                          <TouchableOpacity 
                            key={kelas.id} 
                            style={styles.dropdownItem}
                            onPress={() => {
                              setSelectedKelasId(kelas.id);
                              setShowKelasPicker(false);
                              HapticFeedback.light();
                            }}
                          >
                            <Text style={[
                              styles.dropdownItemText,
                              selectedKelasId === kelas.id && { color: COLORS.primary, fontFamily: FONTS.headingSemi }
                            ]}>
                              {kelas.nama_kelas}
                            </Text>
                            {selectedKelasId === kelas.id && (
                              <MaterialCommunityIcons name="check" size={18} color={COLORS.primary} />
                            )}
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    )}
                  </SkeuCard>
                )}

                <BouncyButton 
                  title={loading ? 'Memproses...' : 'Daftar Akun'} 
                  onPress={handleRegister} 
                  loading={loading}
                  icon="account-plus-outline"
                  style={{ marginTop: SPACING.lg }}
                />

                <TouchableOpacity 
                  onPress={() => router.back()} 
                  style={styles.backToLogin}
                >
                  <Text style={styles.backToLoginText}>Sudah punya akun? <Text style={{ color: COLORS.primary }}>Masuk</Text></Text>
                </TouchableOpacity>
              </SkeuCard>
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
    marginBottom: SPACING.lg, 
    alignItems: 'center' 
  },
  titleContainer: {
    alignItems: 'center',
    width: '100%',
    marginTop: SPACING.xl,
  },
  title: { 
    fontFamily: FONTS.heading, 
    fontSize: 28, 
    color: COLORS.textPrimary, 
    marginBottom: SPACING.xs,
    textAlign: 'center',
  },
  subtitle: { 
    fontFamily: FONTS.body, 
    fontSize: 14, 
    color: COLORS.textSecondary, 
    lineHeight: 20, 
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
  },
  inputWrapper: {
    flexDirection: 'row', 
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.4)',
    borderRadius: SIZES.radiusMd,
    paddingHorizontal: SPACING.sm,
    height: 56,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.6)',
  },
  inputWrapperFocused: {
    borderColor: COLORS.primaryLight,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
  },
  inputIconContainer: {
    width: 32,
    height: 32,
    borderRadius: SIZES.radiusSm,
    backgroundColor: 'rgba(0,0,0,0.03)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  input: { 
    flex: 1, 
    fontFamily: FONTS.bodyMedium, 
    fontSize: 14, 
    color: COLORS.textPrimary,
    height: '100%',
  },
  eyeButton: {
    padding: SPACING.sm,
  },
  dropdownCard: {
    marginTop: -SPACING.sm,
    marginBottom: SPACING.md,
    padding: SPACING.xs,
    borderRadius: SIZES.radiusMd,
    borderWidth: 1,
    borderColor: COLORS.glassHighlight,
  },
  dropdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.glassHighlight,
  },
  dropdownItemText: {
    fontFamily: FONTS.body,
    fontSize: 13,
    color: COLORS.textPrimary,
  },
  backToLogin: {
    marginTop: SPACING.lg,
    alignItems: 'center',
  },
  backToLoginText: {
    fontFamily: FONTS.bodyMedium,
    fontSize: 13,
    color: COLORS.textSecondary,
  }
});
