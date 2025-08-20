import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import { Mail, ArrowLeft, CheckCircle } from "lucide-react-native";

interface FormData {
  email: string;
}

interface FormErrors {
  email?: string;
  general?: string;
}

interface ForgotPasswordFormProps {
  onBackToSignIn: () => void;
}

export function ForgotPasswordForm({ onBackToSignIn }: ForgotPasswordFormProps) {
  const [formData, setFormData] = useState<FormData>({ email: "" });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = "El email es requerido";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Ingresa un email válido";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (value: string) => {
    setFormData({ email: value });
    if (errors.email) {
      setErrors((prev) => ({ ...prev, email: undefined }));
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setIsLoading(true);
    setErrors({});
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      console.log("Solicitud de recuperación para:", formData.email);
      setIsSuccess(true);
    } catch {
      setErrors({ general: "Hubo un error al enviar el email. Inténtalo de nuevo." });
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <View style={styles.container}>
        <Text style={styles.appTitle}>ChatApp</Text>
        <View style={styles.card}>
          <View style={styles.successIcon}>
            <CheckCircle size={28} color="green" />
          </View>
          <Text style={styles.successTitle}>¡Email enviado!</Text>
          <Text style={styles.successText}>
            Hemos enviado un enlace de recuperación a <Text style={{fontWeight: 'bold'}}>{formData.email}</Text>
          </Text>
          <Text style={styles.successSubText}>
            Revisa tu bandeja de entrada y sigue las instrucciones para restablecer tu contraseña.
          </Text>
          <TouchableOpacity style={styles.buttonOutline} onPress={onBackToSignIn}>
            <ArrowLeft size={18} color="#2563eb" style={{marginRight: 6}} />
            <Text style={styles.buttonOutlineText}>Volver al inicio de sesión</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.appTitle}>ChatApp</Text>
      <Text style={styles.pageSubtitle}>Recupera el acceso a tu cuenta</Text>
      
      <View style={styles.card}>
        <Text style={styles.title}>Recuperar Contraseña</Text>
        <Text style={styles.subtitle}>
          Ingresa tu email y te enviaremos un enlace para restablecer tu contraseña
        </Text>
        
        {errors.general && <Text style={styles.error}>{errors.general}</Text>}

        <Text style={styles.label}>Email</Text>
        <View style={[styles.inputContainer, errors.email && styles.inputError]}>
          <Mail size={18} color="#888" style={styles.icon} />
          <TextInput
            placeholder="tuemail@hotmail.com"
            value={formData.email}
            onChangeText={handleInputChange}
            style={styles.input}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>
        {errors.email && <Text style={styles.error}>{errors.email}</Text>}

        <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={isLoading}>
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Enviar enlace de recuperacion</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.buttonOutline} onPress={onBackToSignIn}>
          <ArrowLeft size={18} color="#2563eb" style={{marginRight: 6}} />
          <Text style={styles.buttonOutlineText}>Volver al inicio de sesion</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  appTitle: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    color: "#000000ff",
    marginBottom: 8,
  },
  pageSubtitle: {
    fontSize: 16,
    textAlign: "center",
    color: "#666",
    marginBottom: 24,
  },
  card: {
    padding: 24,
    borderRadius: 12,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
    color: "#111",
  },
  subtitle: {
    fontSize: 14,
    textAlign: "center",
    color: "#666",
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
    color: "#333",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 8,
    height: 48,
  },
  inputError: {
    borderColor: "red",
  },
  icon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    height: "100%",
  },
  error: {
    color: "red",
    fontSize: 13,
    marginBottom: 8,
  },
  button: {
    backgroundColor: "#000000ff",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 16,
    marginBottom: 12,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  buttonOutline: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
  },
  buttonOutlineText: {
    color: "#000000ff",
    fontSize: 14,
  },
  successIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#d1fae5",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
  },
  successText: {
    textAlign: "center",
    marginBottom: 8,
    color: "#666",
  },
  successSubText: {
    textAlign: "center",
    marginBottom: 24,
    color: "#888",
    fontSize: 13,
  },
});