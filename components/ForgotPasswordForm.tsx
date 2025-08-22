import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { Mail, ArrowLeft, CheckCircle } from "lucide-react-native";

interface ForgotPasswordFormProps {
  onBackToSignIn: () => void;
}

export function ForgotPasswordForm({
  onBackToSignIn,
}: ForgotPasswordFormProps) {
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState<{ email?: string; general?: string }>(
    {}
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};
    if (!email.trim()) newErrors.email = "El email es requerido";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      newErrors.email = "Ingresa un email válido";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setIsLoading(true);
    setErrors({});
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000)); // Simula API
      setIsSuccess(true);
    } catch {
      setErrors({
        general: "Hubo un error al enviar el email. Inténtalo de nuevo.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.successCard}>
          <View style={styles.iconCircle}>
            <CheckCircle size={32} color="#16a34a" />
          </View>
          <Text style={styles.successTitle}>¡Email enviado!</Text>
          <Text style={styles.successMessage}>
            Hemos enviado un enlace de recuperación a{" "}
            <Text style={{ fontWeight: "bold" }}>{email}</Text>
          </Text>
          <Text style={styles.successInfo}>
            Revisa tu bandeja de entrada y sigue las instrucciones para
            restablecer tu contraseña.
          </Text>
          <TouchableOpacity style={styles.backButton} onPress={onBackToSignIn}>
            <ArrowLeft size={16} color="#000" style={{ marginRight: 8 }} />
            <Text style={styles.backButtonText}>
              Volver al inicio de sesión
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Recuperar Contraseña</Text>
        <Text style={styles.description}>
          Ingresa tu email y te enviaremos un enlace para restablecer tu
          contraseña
        </Text>

        {errors.general && (
          <Text style={styles.generalError}>{errors.general}</Text>
        )}

        <View style={styles.inputContainer}>
          <Mail size={16} color="#9ca3af" style={styles.inputIcon} />
          <TextInput
            style={[styles.input, errors.email && { borderColor: "#ef4444" }]}
            placeholder="tu@email.com"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              if (errors.email)
                setErrors((prev) => ({ ...prev, email: undefined }));
            }}
          />
        </View>
        {errors.email && <Text style={styles.fieldError}>{errors.email}</Text>}

        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleSubmit}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>
              Enviar enlace de recuperación
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.backButton} onPress={onBackToSignIn}>
          <ArrowLeft size={16} color="#000" style={{ marginRight: 8 }} />
          <Text style={styles.backButtonText}>Volver al inicio de sesión</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
 container: {marginTop: 20,
    flexGrow: 1,
    justifyContent: "center",
    padding: 16,
    backgroundColor: "#f9fafb",
  },
  card: { backgroundColor: "#fff", padding: 16, borderRadius: 8, elevation: 2 },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 4,
  },
  description: { textAlign: "center", color: "#6b7280", marginBottom: 16 },
  generalError: { color: "#ef4444", marginBottom: 8, textAlign: "center" },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    paddingHorizontal: 8,
  },
  inputIcon: { marginRight: 8 },
  input: { flex: 1, height: 40 },
  fieldError: { color: "#ef4444", fontSize: 12, marginTop: 4 },
  submitButton: {
    backgroundColor: "#2563eb",
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
    alignItems: "center",
  },
  submitButtonText: { color: "#fff", fontWeight: "bold" },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
  },
  backButtonText: { fontSize: 14, color: "#000" },
  successCard: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 8,
    elevation: 2,
    alignItems: "center",
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#dcfce7",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  successTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 8 },
  successMessage: { textAlign: "center", color: "#374151", marginBottom: 8 },
  successInfo: {
    textAlign: "center",
    color: "#6b7280",
    fontSize: 12,
    marginBottom: 16,
  },
});
