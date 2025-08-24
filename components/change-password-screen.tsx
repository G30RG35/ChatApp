import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  SafeAreaView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../utils/utils';
import { useTranslation } from 'react-i18next';

interface ChangePasswordScreenProps {
  onBack: () => void;
  userEmail: string;
}

interface FormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface FormErrors {
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
  general?: string;
}

export function ChangePasswordScreen({ onBack, userEmail }: ChangePasswordScreenProps) {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<FormData>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.currentPassword) {
      newErrors.currentPassword = t("changePassword.currentRequired", "Ingresa tu contraseña actual");
    }

    if (!formData.newPassword) {
      newErrors.newPassword = t("changePassword.newRequired", "Ingresa una nueva contraseña");
    } else if (formData.newPassword.length < 6) {
      newErrors.newPassword = t("changePassword.minLength", "La contraseña debe tener al menos 6 caracteres");
    } else if (formData.newPassword === formData.currentPassword) {
      newErrors.newPassword = t("changePassword.different", "La nueva contraseña debe ser diferente a la actual");
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = t("changePassword.confirmRequired", "Confirma tu nueva contraseña");
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = t("changePassword.noMatch", "Las contraseñas no coinciden");
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
      const res = await api.post("/cambiar-password", {
        email: userEmail,
        oldPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      });

      if (res && res.message) {
        setIsSuccess(true);
      } else {
        setErrors({
          general: res.error || t("changePassword.error", "Error al cambiar la contraseña. Inténtalo de nuevo."),
        });
      }
    } catch (error) {
      setErrors({ general: t("changePassword.networkError", "Error de red. Inténtalo de nuevo.") });
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = (field: "current" | "new" | "confirm") => {
    setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  if (isSuccess) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#007AFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t("changePassword.title", "Cambiar contraseña")}</Text>
        </View>

        <View style={styles.successContainer}>
          <View style={styles.successIcon}>
            <Ionicons name="checkmark-circle" size={64} color="#34C759" />
          </View>
          <Text style={styles.successTitle}>{t("changePassword.updated", "¡Contraseña actualizada!")}</Text>
          <Text style={styles.successMessage}>
            {t("changePassword.successMessage", "Tu contraseña ha sido cambiada exitosamente. Usa tu nueva contraseña la próxima vez que inicies sesión.")}
          </Text>
          <TouchableOpacity style={styles.button} onPress={onBack}>
            <Text style={styles.buttonText}>{t("button.back", "Volver a configuración")}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t("changePassword.title", "Cambiar contraseña")}</Text>
      </View>

      {/* Content */}
      <ScrollView style={styles.content}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t("changePassword.update", "Actualizar contraseña")}</Text>
          <Text style={styles.cardDescription}>
            {t("changePassword.description", "Ingresa tu contraseña actual y elige una nueva contraseña segura")}
          </Text>

          {errors.general && (
            <View style={styles.alert}>
              <Text style={styles.alertText}>{errors.general}</Text>
            </View>
          )}

          <View style={styles.inputContainer}>
            <Text style={styles.label}>{t("changePassword.current", "Contraseña actual")}</Text>
            <View style={[styles.inputWrapper, errors.currentPassword && styles.inputError]}>
              <Ionicons name="lock-closed" size={20} color="#8E8E93" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                secureTextEntry={!showPasswords.current}
                placeholder="••••••••"
                value={formData.currentPassword}
                onChangeText={(value) => handleInputChange("currentPassword", value)}
              />
              <TouchableOpacity
                onPress={() => togglePasswordVisibility("current")}
                style={styles.eyeButton}
              >
                <Ionicons
                  name={showPasswords.current ? "eye-off" : "eye"}
                  size={20}
                  color="#8E8E93"
                />
              </TouchableOpacity>
            </View>
            {errors.currentPassword && (
              <Text style={styles.errorText}>{errors.currentPassword}</Text>
            )}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>{t("changePassword.new", "Nueva contraseña")}</Text>
            <View style={[styles.inputWrapper, errors.newPassword && styles.inputError]}>
              <Ionicons name="lock-closed" size={20} color="#8E8E93" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                secureTextEntry={!showPasswords.new}
                placeholder="••••••••"
                value={formData.newPassword}
                onChangeText={(value) => handleInputChange("newPassword", value)}
              />
              <TouchableOpacity
                onPress={() => togglePasswordVisibility("new")}
                style={styles.eyeButton}
              >
                <Ionicons
                  name={showPasswords.new ? "eye-off" : "eye"}
                  size={20}
                  color="#8E8E93"
                />
              </TouchableOpacity>
            </View>
            {errors.newPassword && (
              <Text style={styles.errorText}>{errors.newPassword}</Text>
            )}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>{t("changePassword.confirm", "Confirmar nueva contraseña")}</Text>
            <View style={[styles.inputWrapper, errors.confirmPassword && styles.inputError]}>
              <Ionicons name="lock-closed" size={20} color="#8E8E93" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                secureTextEntry={!showPasswords.confirm}
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChangeText={(value) => handleInputChange("confirmPassword", value)}
              />
              <TouchableOpacity
                onPress={() => togglePasswordVisibility("confirm")}
                style={styles.eyeButton}
              >
                <Ionicons
                  name={showPasswords.confirm ? "eye-off" : "eye"}
                  size={20}
                  color="#8E8E93"
                />
              </TouchableOpacity>
            </View>
            {errors.confirmPassword && (
              <Text style={styles.errorText}>{errors.confirmPassword}</Text>
            )}
          </View>

          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>{t("changePassword.title", "Cambiar contraseña")}</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
 container: {marginTop: 20,
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
    backgroundColor: '#fff',
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E5E5',
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
  eyeButton: {
    padding: 12,
  },
  inputError: {
    borderColor: '#FF3B30',
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 14,
    marginTop: 4,
  },
  alert: {
    backgroundColor: '#FFECEB',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  alertText: {
    color: '#FF3B30',
    fontSize: 14,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  successIcon: {
    backgroundColor: '#DDFFE6',
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#34C759',
    marginBottom: 12,
    textAlign: 'center',
  },
  successMessage: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
});