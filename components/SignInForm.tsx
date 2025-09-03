import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../utils/utils';
import { useTranslation } from 'react-i18next';
import { useUser } from '../context/UserContext';


interface FormData {
  email: string;
  password: string;
}

interface FormErrors {
  email?: string;
  password?: string;
  general?: string;
}

interface SignInFormProps {
  onSwitchToSignUp: () => void;
  onSwitchToForgotPassword: () => void;
  onAuthSuccess: (user?: any) => void;
}

export function SignInForm({ onSwitchToSignUp, onSwitchToForgotPassword, onAuthSuccess }: SignInFormProps) {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
  });

    const { setUser } = useUser();


  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = t("signIn.emailRequired", "El email es requerido");
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t("signIn.emailInvalid", "Ingresa un email válido");
    }

    if (!formData.password) {
      newErrors.password = t("signIn.passwordRequired", "La contraseña es requerida");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});
    try {
      // Llama al endpoint de login
      const data = await api.post("/login", {
        email: formData.email,
        password: formData.password,
      });
    console.log("Respuesta login:", data); // <-- Agrega esto

      if (data && data.id) {
        setIsSuccess(true);
        setTimeout(() => {
          setUser(data);
          onAuthSuccess(data); // <-- Esto está bien
        }, 800);
      } else {
        setErrors({ general: data.error || t("signIn.invalid", "Email o contraseña incorrectos. Inténtalo de nuevo.") });
      }
    } catch (error) {
      setErrors({ general: t("signIn.networkError", "Error de red. Intenta de nuevo.") });
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.successCard}>
          <View style={styles.successIcon}>
            <Ionicons name="chatbubble" size={32} color="#34C759" />
          </View>
          <Text style={styles.successTitle}>{t("signIn.welcomeBack", "¡Bienvenido de vuelta!")}</Text>
          <Text style={styles.successMessage}>{t("signIn.success", "Has iniciado sesión exitosamente")}</Text>
          <TouchableOpacity style={styles.successButton} onPress={() => onAuthSuccess()}>
            <Text style={styles.successButtonText}>{t("signIn.goToMessages", "Ir a mensajes")}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>{t("signIn.title", "Iniciar Sesión")}</Text>
            <Text style={styles.subtitle}>{t("signIn.subtitle", "Ingresa tus datos para acceder a ChatApp")}</Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {errors.general && (
              <View style={styles.errorAlert}>
                <Ionicons name="warning" size={20} color="#FF3B30" />
                <Text style={styles.errorText}>{errors.general}</Text>
              </View>
            )}

            {/* Email Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>{t("signIn.email", "Email")}</Text>
              <View style={[styles.inputWrapper, errors.email && styles.inputError]}>
                <Ionicons name="mail" size={20} color="#8E8E93" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder={t("signIn.emailPlaceholder", "tu@email.com")}
                  value={formData.email}
                  onChangeText={(value) => handleInputChange("email", value)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                />
              </View>
              {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
            </View>

            {/* Password Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>{t("signIn.password", "Contraseña")}</Text>
              <View style={[styles.inputWrapper, errors.password && styles.inputError]}>
                <Ionicons name="lock-closed" size={20} color="#8E8E93" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder={t("signIn.passwordPlaceholder", "••••••••")}
                  value={formData.password}
                  onChangeText={(value) => handleInputChange("password", value)}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoComplete="password"
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeButton}
                >
                  <Ionicons
                    name={showPassword ? "eye-off" : "eye"}
                    size={20}
                    color="#8E8E93"
                  />
                </TouchableOpacity>
              </View>
              {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.submitButtonText}>{t("signIn.signInButton", "Iniciar sesión")}</Text>
              )}
            </TouchableOpacity>

            {/* Links */}
            <View style={styles.linksContainer}>
              <TouchableOpacity onPress={onSwitchToForgotPassword}>
                <Text style={styles.linkText}>{t("signIn.forgotPassword", "¿Olvidaste tu contraseña?")}</Text>
              </TouchableOpacity>

              <View style={styles.signupContainer}>
                <Text style={styles.signupText}>{t("signIn.noAccount", "¿No tienes cuenta? ")} </Text>
                <TouchableOpacity onPress={onSwitchToSignUp}>
                  <Text style={styles.signupLink}>{t("signIn.signUp", "Regístrate")}</Text>
                </TouchableOpacity>
              </View>
            </View>
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
    padding: 16,
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
  },
  form: {
    gap: 16,
  },
  errorAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFECEB',
    padding: 12,
    borderRadius: 8,
  },
  errorText: {
    color: '#FF3B30',
    marginLeft: 8,
    fontSize: 14,
  },
  inputContainer: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000000',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 8,
    backgroundColor: '#F9F9F9',
  },
  input: {
    flex: 1,
    padding: 12,
    fontSize: 16,
  },
  inputIcon: {
    marginLeft: 12,
  },
  inputError: {
    borderColor: '#FF3B30',
  },
  eyeButton: {
    padding: 12,
  },
  submitButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  linksContainer: {
    alignItems: 'center',
    gap: 12,
  },
  linkText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '500',
  },
  signupContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  signupText: {
    color: '#8E8E93',
    fontSize: 14,
  },
  signupLink: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '500',
  },
  successCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    margin: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  successIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#DDFFE6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#34C759',
    marginBottom: 8,
    textAlign: 'center',
  },
  successMessage: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    marginBottom: 24,
  },
  successButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    width: '100%',
  },
  successButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});