import { 
  validateEmail, 
  validatePassword, 
  validateName, 
  validateNIS, 
  validatePasswordMatch, 
  parseValidationErrors 
} from './validation';

describe('Validation Utility Tests', () => {
  describe('validateEmail', () => {
    it('should fail if email is empty', () => {
      const result = validateEmail('');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Email wajib diisi');
    });

    it('should fail if email format is invalid', () => {
      const result = validateEmail('invalidemail');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Format email tidak valid');
    });

    it('should fail if email is too long', () => {
      const longEmail = 'a'.repeat(250) + '@example.com';
      const result = validateEmail(longEmail);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Email maksimal 255 karakter');
    });

    it('should pass on valid email', () => {
      const result = validateEmail('student@perizinansiswa.com');
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });
  });

  describe('validatePassword', () => {
    it('should fail if password is empty', () => {
      const result = validatePassword('');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Password wajib diisi');
    });

    it('should fail if password is too short', () => {
      const result = validatePassword('short');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Password minimal 8 karakter');
    });

    it('should identify weak password', () => {
      const result = validatePassword('password');
      expect(result.isValid).toBe(true);
      expect(result.strength).toBe('weak');
      expect(result.strengthLabel).toBe('Lemah');
    });

    it('should identify fair password', () => {
      const result = validatePassword('Password'); // Capital letter
      expect(result.isValid).toBe(true);
      expect(result.strength).toBe('fair');
      expect(result.strengthLabel).toBe('Cukup');
    });

    it('should identify good password', () => {
      const result = validatePassword('Password123'); // Capital + number
      expect(result.isValid).toBe(true);
      expect(result.strength).toBe('good');
      expect(result.strengthLabel).toBe('Baik');
    });

    it('should identify strong password', () => {
      const result = validatePassword('Password123!'); // Capital + number + symbol
      expect(result.isValid).toBe(true);
      expect(result.strength).toBe('strong');
      expect(result.strengthLabel).toBe('Kuat');
    });
  });

  describe('validateName', () => {
    it('should fail if name is empty', () => {
      const result = validateName('');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Nama lengkap wajib diisi');
    });

    it('should fail if name is too short', () => {
      const result = validateName('Ab');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Nama minimal 3 karakter');
    });

    it('should pass if name is valid', () => {
      const result = validateName('Budi Santoso');
      expect(result.isValid).toBe(true);
    });
  });

  describe('validateNIS', () => {
    it('should fail if NIS is empty', () => {
      const result = validateNIS('');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('NIS wajib diisi');
    });

    it('should pass if NIS is valid', () => {
      const result = validateNIS('12345');
      expect(result.isValid).toBe(true);
    });
  });

  describe('validatePasswordMatch', () => {
    it('should fail if confirm password is empty', () => {
      const result = validatePasswordMatch('password123', '');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Konfirmasi password wajib diisi');
    });

    it('should fail if passwords do not match', () => {
      const result = validatePasswordMatch('password123', 'different');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Konfirmasi password tidak cocok');
    });

    it('should pass if passwords match', () => {
      const result = validatePasswordMatch('password123', 'password123');
      expect(result.isValid).toBe(true);
    });
  });

  describe('parseValidationErrors', () => {
    it('should parse Laravel 422 validation errors format', () => {
      const mockError = {
        response: {
          data: {
            errors: {
              email: ['The email has already been taken.'],
              nis: ['The nis has already been taken.']
            }
          }
        }
      };

      const result = parseValidationErrors(mockError);
      expect(result.email).toBe('The email has already been taken.');
      expect(result.nis).toBe('The nis has already been taken.');
    });

    it('should parse general API message', () => {
      const mockError = {
        response: {
          data: {
            message: 'Kredensial salah'
          }
        }
      };

      const result = parseValidationErrors(mockError);
      expect(result.general).toBe('Kredensial salah');
    });

    it('should return system error message as general error', () => {
      const mockError = {
        message: 'Network Error'
      };

      const result = parseValidationErrors(mockError);
      expect(result.general).toBe('Network Error');
    });
  });
});
