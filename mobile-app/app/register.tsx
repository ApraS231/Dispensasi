import { useState } from 'react';
import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { View, Text, StyleSheet, Alert, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import api from '../src/utils/api';
import { useAuthStore } from '../src/stores/authStore';
import { useTheme } from '../src/hooks/useTheme';
import { FONTS, SIZES, SPACING } from '../src/utils/theme';
import BouncyButton from '../src/components/BouncyButton';
import SkeuCard from '../src/components/SkeuCard';
import AnimatedEntrance from '../src/components/AnimatedEntrance';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { HapticFeedback } from '../src/utils/haptics';
import Animated, { SlideInRight, SlideInLeft } from 'react-native-reanimated';

// Custom components
import FormInput from '../src/components/FormInput';
import PasswordStrengthBar from '../src/components/PasswordStrengthBar';
import StepIndicator from '../src/components/StepIndicator';
import SuccessOverlay from '../src/components/SuccessOverlay';
import BrandHeader from '../src/components/BrandHeader';

// Validation
import { 
  validateEmail, 
  validatePassword, 
  validateName, 
  validateNIS, 
  validatePasswordMatch, 
  parseValidationErrors 
} from '../src/utils/validation';

export default function RegisterScreen() {
  const { colors, isDark, SIZES, SPACING, FONTS, shadows } = useTheme();

  const [step, setStep] = useState(1);
  const [slideDirection, setSlideDirection] = useState<'forward' | 'backward'>('forward');
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [nis, setNis] = useState('');
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [selectedKelasId, setSelectedKelasId] = useState<string | null>(null);
  const [showKelasPicker, setShowKelasPicker] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successVisible, setSuccessVisible] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  
  const { setUser, setToken } = useAuthStore();

  // Fetch Kelas list
  const { data: kelasList = [], isLoading: isLoadingKelas } = useQuery({
    queryKey: ['kelas-public'],
    queryFn: async () => {
      const { data } = await api.get('/kelas');
      return data;
    }
  });

  const handleTextChange = (field: string, value: string, setter: (val: string) => void) => {
    setter(value);
    if (errors[field] || errors.general) {
      setErrors(prev => ({ ...prev, [field]: '', general: '' }));
    }
  };

  const handleNextStep = () => {
    const nameVal = validateName(name);
    const emailVal = validateEmail(email);
    const nisVal = validateNIS(nis);

    if (!nameVal.isValid || !emailVal.isValid || !nisVal.isValid) {
      setErrors({
        name: nameVal.error || '',
        email: emailVal.error || '',
        nis: nisVal.error || '',
      });
      HapticFeedback.error();
      return;
    }

    setErrors({});
    HapticFeedback.light();
    setSlideDirection('forward');
    setStep(2);
  };

  const handlePrevStep = () => {
    HapticFeedback.light();
    setSlideDirection('backward');
    setStep(1);
  };

  const handleRegister = async () => {
    const passwordVal = validatePassword(password);
    const confirmVal = validatePasswordMatch(password, confirmPassword);
    
    if (!passwordVal.isValid || !confirmVal.isValid || !selectedKelasId) {
      setErrors({
        password: passwordVal.error || '',
        confirmPassword: confirmVal.error || '',
        kelas: !selectedKelasId ? 'Kelas wajib dipilih' : '',
      });
      HapticFeedback.error();
      return;
    }

    setLoading(true);
    setErrors({});
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
      setSuccessMessage(response.data.message || 'Registrasi berhasil. Silakan tunggu persetujuan dari Wali Kelas.');
      setSuccessVisible(true);

      setTimeout(async () => {
        setToken(response.data.token);
        setUser(response.data.user);
        router.replace('/(siswa)/dashboard');
      }, 3500);

    } catch (error: any) {
      const backendErrors = parseValidationErrors(error);
      setErrors(backendErrors);
      
      if (backendErrors.name || backendErrors.email || backendErrors.nis) {
        setSlideDirection('backward');
        setStep(1);
      }
      
      if (backendErrors.general) {
        Alert.alert('Gagal Daftar', backendErrors.general);
      }
    } finally {
      setLoading(false);
    }
  };

  const enteringAnimation = slideDirection === 'forward' ? SlideInRight : SlideInLeft;

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
            <BrandHeader showLogo={true} subtitle="Bergabunglah dengan ekosistem perizinan SMAN 3" />

            <AnimatedEntrance delay={300} offset={30}>
              <SkeuCard style={styles.card} isGlass>
                
                <StepIndicator currentStep={step} />

                {step === 1 ? (
                  <Animated.View entering={enteringAnimation.duration(250)} key="step1">
                    <FormInput
                      label="Nama Lengkap"
                      icon="account-outline"
                      placeholder="Masukkan nama lengkap Anda"
                      value={name}
                      onChangeText={(val) => handleTextChange('name', val, setName)}
                      error={errors.name}
                      isValid={name.length >= 3 && !errors.name}
                    />

                    <FormInput
                      label="Email"
                      icon="email-outline"
                      placeholder="Masukkan email aktif Anda"
                      value={email}
                      onChangeText={(val) => handleTextChange('email', val, setEmail)}
                      error={errors.email}
                      isValid={email.length > 0 && !errors.email}
                      autoCapitalize="none"
                      keyboardType="email-address"
                    />

                    <FormInput
                      label="NIS (Nomor Induk Siswa)"
                      icon="card-account-details-outline"
                      placeholder="Masukkan NIS Anda"
                      value={nis}
                      onChangeText={(val) => handleTextChange('nis', val, setNis)}
                      error={errors.nis}
                      isValid={nis.length > 0 && !errors.nis}
                      keyboardType="numeric"
                    />

                    <BouncyButton 
                      title="Lanjutkan" 
                      onPress={handleNextStep} 
                      icon="arrow-right"
                      style={{ marginTop: SPACING.md }}
                    />
                    
                    <TouchableOpacity 
                      onPress={() => router.back()} 
                      style={[styles.backToLogin, { marginTop: SPACING.lg }]}
                    >
                      <Text style={[styles.backToLoginText, { fontFamily: FONTS.body, color: colors.textSecondary }]}>
                        Sudah punya akun? <Text style={{ color: colors.primary, fontFamily: FONTS.headingSemi }}>Masuk</Text>
                      </Text>
                    </TouchableOpacity>
                  </Animated.View>
                ) : (
                  <Animated.View entering={enteringAnimation.duration(250)} key="step2">
                    <FormInput
                      label="Password"
                      icon="lock-outline"
                      placeholder="Masukkan password Anda"
                      value={password}
                      onChangeText={(val) => handleTextChange('password', val, setPassword)}
                      error={errors.password}
                      isValid={password.length >= 8 && !errors.password}
                      isPassword
                    />

                    <PasswordStrengthBar password={password} />

                    <FormInput
                      label="Konfirmasi Password"
                      icon="lock-check-outline"
                      placeholder="Ulangi password Anda"
                      value={confirmPassword}
                      onChangeText={(val) => handleTextChange('confirmPassword', val, setConfirmPassword)}
                      error={errors.confirmPassword}
                      isValid={confirmPassword.length > 0 && password === confirmPassword && !errors.confirmPassword}
                      isPassword
                    />

                    <Text style={[styles.formLabelSmall, { fontFamily: FONTS.bodyMedium, color: colors.textPrimary }]}>Pilih Kelas</Text>
                    <TouchableOpacity 
                      style={[
                        styles.pickerTrigger, 
                        shadows.inset,
                        errors.kelas && { borderTopColor: colors.error, borderLeftColor: colors.error, borderBottomColor: colors.error, borderRightColor: colors.error }
                      ]} 
                      onPress={() => {
                        HapticFeedback.light();
                        setShowKelasPicker(!showKelasPicker);
                      }}
                    >
                      <MaterialCommunityIcons 
                        name="google-classroom" 
                        size={20} 
                        color={selectedKelasId ? colors.primary : colors.textMuted} 
                        style={styles.pickerIcon} 
                      />
                      <Text style={[
                        styles.pickerText, 
                        { fontFamily: FONTS.body, color: colors.textPrimary },
                        !selectedKelasId ? { color: colors.textMuted } : null
                      ]}>
                        {selectedKelasId 
                          ? kelasList.find((k: any) => k.id === selectedKelasId)?.nama_kelas 
                          : 'Pilih Kelas Anda'}
                      </Text>
                      <MaterialCommunityIcons 
                        name={showKelasPicker ? "chevron-up" : "chevron-down"} 
                        size={20} 
                        color={colors.textMuted} 
                      />
                    </TouchableOpacity>

                    {errors.kelas ? (
                      <View style={[styles.pickerErrorContainer, { marginBottom: SPACING.md }]}>
                        <MaterialCommunityIcons name="alert-circle-outline" size={14} color={colors.error} style={styles.errorIcon} />
                        <Text style={[styles.pickerErrorText, { fontFamily: FONTS.body, color: colors.error }]}>{errors.kelas}</Text>
                      </View>
                    ) : null}

                    {showKelasPicker && (
                      <Animated.View entering={SlideInRight.duration(200)}>
                        <SkeuCard isGlass style={styles.dropdownCard}>
                          {isLoadingKelas ? (
                            <ActivityIndicator color={colors.primary} style={{ padding: 20 }} />
                          ) : (
                            <ScrollView style={{ maxHeight: 180 }} nestedScrollEnabled>
                              {kelasList.map((kelas: any) => (
                                <TouchableOpacity 
                                  key={kelas.id} 
                                  style={[styles.dropdownItem, { padding: SPACING.md }]}
                                  onPress={() => {
                                    setSelectedKelasId(kelas.id);
                                    setShowKelasPicker(false);
                                    setErrors(prev => ({ ...prev, kelas: '' }));
                                    HapticFeedback.light();
                                  }}
                                >
                                  <Text style={[
                                    styles.dropdownItemText,
                                    { fontFamily: FONTS.body, color: colors.textPrimary },
                                    selectedKelasId === kelas.id && { color: colors.primary, fontFamily: FONTS.headingSemi }
                                  ]}>
                                    {kelas.nama_kelas}
                                  </Text>
                                  {selectedKelasId === kelas.id && (
                                    <MaterialCommunityIcons name="check" size={18} color={colors.primary} />
                                  )}
                                </TouchableOpacity>
                              ))}
                            </ScrollView>
                          )}
                        </SkeuCard>
                      </Animated.View>
                    )}

                    <View style={[styles.stepButtonsRow, { marginTop: SPACING.md }]}>
                      <BouncyButton 
                        title="Kembali" 
                        onPress={handlePrevStep}
                        variant="outlined"
                        icon="arrow-left"
                        style={styles.backButton}
                      />
                      <BouncyButton 
                        title={loading ? 'Memproses...' : 'Daftar Akun'} 
                        onPress={handleRegister} 
                        loading={loading}
                        icon="account-plus-outline"
                        style={styles.submitButton}
                      />
                    </View>
                  </Animated.View>
                )}

              </SkeuCard>
            </AnimatedEntrance>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
      <SuccessOverlay 
        visible={successVisible} 
        title="Registrasi Berhasil" 
        message={successMessage} 
        isRegister
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
  formLabelSmall: {
    fontSize: 13,
    marginBottom: 6,
    paddingLeft: 4,
  },
  pickerTrigger: {
    flexDirection: 'row', 
    alignItems: 'center',
    height: 55,
    borderRadius: SIZES.radiusInput,
    paddingHorizontal: SPACING.md,
  },
  pickerIcon: {
    marginRight: 10,
  },
  pickerText: {
    flex: 1,
    fontSize: 14,
  },
  pickerErrorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: -8,
    paddingLeft: 4,
  },
  errorIcon: {
    marginRight: 4,
  },
  pickerErrorText: {
    fontSize: 12,
  },
  dropdownCard: {
    marginTop: -8,
    marginBottom: SPACING.md,
  },
  dropdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(10, 65, 116, 0.08)',
  },
  dropdownItemText: {
    fontSize: 13,
  },
  stepButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  backButton: {
    flex: 1,
    marginRight: 13, // SPACING.sm
  },
  submitButton: {
    flex: 2,
  },
  backToLogin: {
    alignItems: 'center',
  },
  backToLoginText: {
    fontSize: 13,
  },
});
