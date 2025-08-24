import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../utils/utils';
import { useTranslation } from 'react-i18next';

interface EmailVerificationScreenProps {
  email: string;
  onBackToSignUp: () => void;
  onVerificationSuccess: () => void;
}

export function EmailVerificationScreen({
  email,
  onBackToSignUp,
  onVerificationSuccess,
}: EmailVerificationScreenProps) {
  const { t } = useTranslation();
  const [verificationCode, setVerificationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isResending, setIsResending] = useState(false);

  // Llama al endpoint para verificar el código
  const handleVerification = async () => {
    setIsLoading(true);
    setError('');
    try {
      const res = await api.post('/verificar-email', {
        email,
        code: verificationCode,
      });
      if (res.success) {
        onVerificationSuccess();
      } else {
        setError(res.error || t('emailVerification.invalidCode', 'Código incorrecto. Intenta de nuevo.'));
      }
    } catch {
      setError(t('emailVerification.networkError', 'Error de red. Intenta de nuevo.'));
    }
    setIsLoading(false);
  };

  // Llama al endpoint para reenviar el código
  const handleResendCode = async () => {
    setIsResending(true);
    setError('');
    try {
      const res = await api.post('/reenviar-codigo', { email });
      if (!res.success) {
        setError(res.error || t('emailVerification.resendError', 'No se pudo reenviar el código.'));
      }
    } catch {
      setError(t('emailVerification.resendNetworkError', 'Error de red al reenviar el código.'));
    }
    setIsResending(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Ionicons name="mail" size={24} color="#34C759" />
            </View>
            <Text style={styles.title}>{t('emailVerification.title', 'Verifica tu email')}</Text>
            <Text style={styles.description}>
              {t('emailVerification.sent', 'Hemos enviado un código de verificación a')}
            </Text>
            <Text style={styles.emailText}>{email}</Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <TextInput
                style={[styles.input, verificationCode.length === 6 && styles.inputValid]}
                placeholder={t('emailVerification.codePlaceholder', 'Ingresa el código de 6 dígitos')}
                placeholderTextColor="#8E8E93"
                value={verificationCode}
                onChangeText={setVerificationCode}
                maxLength={6}
                keyboardType="number-pad"
                autoCapitalize="none"
                textAlign="center"
              />
              {error ? (
                <Text style={styles.errorText}>{error}</Text>
              ) : (
                <Text style={styles.hintText}>{t('emailVerification.codeHint', 'Ingresa el código de 6 dígitos')}</Text>
              )}
            </View>

            <TouchableOpacity
              style={[
                styles.verifyButton,
                (isLoading || verificationCode.length !== 6) && styles.buttonDisabled,
              ]}
              onPress={handleVerification}
              disabled={isLoading || verificationCode.length !== 6}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.verifyButtonText}>{t('emailVerification.verify', 'Verificar código')}</Text>
              )}
            </TouchableOpacity>

            {/* Resend Code */}
            <View style={styles.resendContainer}>
              <Text style={styles.resendText}>{t('emailVerification.notReceived', '¿No recibiste el código?')}</Text>
              <TouchableOpacity
                onPress={handleResendCode}
                disabled={isResending}
                style={styles.resendButton}
              >
                <Text style={styles.resendButtonText}>
                  {isResending ? t('emailVerification.resending', 'Reenviando...') : t('emailVerification.resend', 'Reenviar código')}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Back Button */}
            <TouchableOpacity
              style={styles.backButton}
              onPress={onBackToSignUp}
            >
              <Ionicons name="arrow-back" size={18} color="#007AFF" />
              <Text style={styles.backButtonText}>{t('button.back', 'Volver al registro')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
 container: {marginTop: 20,
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#DDFFE6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 8,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    marginBottom: 4,
  },
  emailText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    textAlign: 'center',
    marginBottom: 16,
  },
  form: {
    gap: 16,
  },
  inputContainer: {
    gap: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 8,
    padding: 16,
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 8,
    backgroundColor: '#F9F9F9',
  },
  inputValid: {
    borderColor: '#34C759',
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 14,
    textAlign: 'center',
  },
  hintText: {
    color: '#8E8E93',
    fontSize: 14,
    textAlign: 'center',
  },
  verifyButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  verifyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  resendContainer: {
    alignItems: 'center',
    gap: 8,
  },
  resendText: {
    color: '#8E8E93',
    fontSize: 14,
  },
  resendButton: {
    padding: 8,
  },
  resendButtonText: {
    color: '#34C759',
    fontSize: 14,
    fontWeight: '600',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    gap: 8,
  },
  backButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '500',
  },
});