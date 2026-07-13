export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export type PasswordStrength = 'weak' | 'fair' | 'good' | 'strong';

export interface PasswordValidationResult extends ValidationResult {
  strength?: PasswordStrength;
  strengthLabel?: string;
}

export const validateEmail = (email: string): ValidationResult => {
  if (!email || email.trim() === '') {
    return { isValid: false, error: 'Email wajib diisi' };
  }
  if (email.length > 255) {
    return { isValid: false, error: 'Email maksimal 255 karakter' };
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, error: 'Format email tidak valid' };
  }
  return { isValid: true };
};

export const validatePassword = (password: string): PasswordValidationResult => {
  if (!password || password.trim() === '') {
    return { isValid: false, error: 'Password wajib diisi' };
  }
  if (password.length < 8) {
    return { isValid: false, error: 'Password minimal 8 karakter' };
  }
  
  // Evaluate strength
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  let strength: PasswordStrength = 'weak';
  let strengthLabel = 'Lemah';

  if (score === 2) {
    strength = 'fair';
    strengthLabel = 'Cukup';
  } else if (score === 3) {
    strength = 'good';
    strengthLabel = 'Baik';
  } else if (score === 4) {
    strength = 'strong';
    strengthLabel = 'Kuat';
  }

  return { isValid: true, strength, strengthLabel };
};

export const validateName = (name: string): ValidationResult => {
  if (!name || name.trim() === '') {
    return { isValid: false, error: 'Nama lengkap wajib diisi' };
  }
  if (name.length < 3) {
    return { isValid: false, error: 'Nama minimal 3 karakter' };
  }
  if (name.length > 255) {
    return { isValid: false, error: 'Nama maksimal 255 karakter' };
  }
  return { isValid: true };
};

export const validateNIS = (nis: string): ValidationResult => {
  if (!nis || nis.trim() === '') {
    return { isValid: false, error: 'NIS wajib diisi' };
  }
  return { isValid: true };
};

export const validateNIDN = (nidn: string): ValidationResult => {
  if (!nidn || nidn.trim() === '') {
    return { isValid: false, error: 'NIDN wajib diisi' };
  }
  return { isValid: true };
};

export const validatePasswordMatch = (password: string, confirm: string): ValidationResult => {
  if (!confirm || confirm.trim() === '') {
    return { isValid: false, error: 'Konfirmasi password wajib diisi' };
  }
  if (password !== confirm) {
    return { isValid: false, error: 'Konfirmasi password tidak cocok' };
  }
  return { isValid: true };
};

export const parseValidationErrors = (error: any): Record<string, string> => {
  const parsedErrors: Record<string, string> = {};
  if (error?.response?.data?.errors) {
    const backendErrors = error.response.data.errors;
    Object.keys(backendErrors).forEach((key) => {
      if (Array.isArray(backendErrors[key]) && backendErrors[key].length > 0) {
        parsedErrors[key] = backendErrors[key][0];
      }
    });
  } else if (error?.response?.data?.message) {
    parsedErrors['general'] = error.response.data.message;
  } else if (error?.message) {
    parsedErrors['general'] = error.message;
  }
  return parsedErrors;
};
