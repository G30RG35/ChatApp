import React, { JSX, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { User, Mail, Lock, Eye, EyeOff } from "lucide-react-native";
import { api } from "../utils/utils"; // Usa tu helper de API

interface SignUpFormProps {
  onSwitchToSignIn: () => void;
  onAuthSuccess: (email: string) => void;
}

export function SignUpForm({
  onSwitchToSignIn,
  onAuthSuccess,
}: SignUpFormProps) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    const newErrors: typeof errors = {};

    if (!username.trim())
      newErrors.username = "El nombre de usuario es requerido";
    else if (username.length < 3)
      newErrors.username =
        "El nombre de usuario debe tener al menos 3 caracteres";
    else if (!/^[a-zA-Z0-9_]+$/.test(username))
      newErrors.username = "Solo se permiten letras, números y guiones bajos";

    if (!email.trim()) newErrors.email = "El email es requerido";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      newErrors.email = "Ingresa un email válido";

    if (!password) newErrors.password = "La contraseña es requerida";
    else if (password.length < 6)
      newErrors.password = "La contraseña debe tener al menos 6 caracteres";

    if (!confirmPassword) newErrors.confirmPassword = "Confirma tu contraseña";
    else if (password !== confirmPassword)
      newErrors.confirmPassword = "Las contraseñas no coinciden";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});

    try {
    //   // Llama al endpoint de registro de usuario
    //   const data = await api.post("/usuarios", {
    //     username,
    //     email,
    //     password,
    //   });

    //   if (data && data.id) {
    //     onAuthSuccess(email);
    //   } else {
    //     setErrors({ general: data.error || "Error al crear la cuenta. Inténtalo de nuevo." });
    //   }
    onAuthSuccess(email);

    } catch {
      setErrors({ general: "Error de red. Inténtalo de nuevo." });
    } finally {
      setIsLoading(false);
    }
  };

  const renderInput = (
    label: string,
    icon: JSX.Element,
    value: string,
    setValue: (text: string) => void,
    error?: string,
    secureTextEntry?: boolean,
    toggleSecure?: () => void
  ) => (
    <View style={{ marginBottom: 16 }}>
      <Text style={styles.label}>{label}</Text>
      <View
        style={[styles.inputContainer, error && { borderColor: "#ef4444" }]}
      >
        {icon}
        <TextInput
          style={[styles.input, secureTextEntry ? { paddingRight: 40 } : {}]}
          placeholder={label}
          secureTextEntry={secureTextEntry}
          autoCapitalize="none"
          value={value}
          onChangeText={setValue}
        />
        {toggleSecure && (
          <TouchableOpacity style={styles.eyeButton} onPress={toggleSecure}>
            {secureTextEntry ? (
              <EyeOff size={20} color="#9ca3af" />
            ) : (
              <Eye size={20} color="#9ca3af" />
            )}
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Crear Cuenta</Text>
      <Text style={styles.description}>
        Completa los datos para unirte a ChatApp
      </Text>

      {errors.general && (
        <Text style={styles.generalError}>{errors.general}</Text>
      )}

      {renderInput(
        "Nombre de usuario",
        <User size={20} color="#9ca3af" style={styles.icon} />,
        username,
        setUsername,
        errors.username
      )}
      {renderInput(
        "Email",
        <Mail size={20} color="#9ca3af" style={styles.icon} />,
        email,
        setEmail,
        errors.email
      )}
      {renderInput(
        "Contraseña",
        <Lock size={20} color="#9ca3af" style={styles.icon} />,
        password,
        setPassword,
        errors.password,
        !showPassword,
        () => setShowPassword((prev) => !prev)
      )}
      {renderInput(
        "Confirmar contraseña",
        <Lock size={20} color="#9ca3af" style={styles.icon} />,
        confirmPassword,
        setConfirmPassword,
        errors.confirmPassword,
        !showConfirmPassword,
        () => setShowConfirmPassword((prev) => !prev)
      )}

      <TouchableOpacity
        style={styles.submitButton}
        onPress={handleSubmit}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.submitButtonText}>Crear cuenta</Text>
        )}
      </TouchableOpacity>

      <View style={styles.switchContainer}>
        <Text style={styles.switchText}>¿Ya tienes cuenta? </Text>
        <TouchableOpacity onPress={onSwitchToSignIn}>
          <Text style={styles.switchButton}>Inicia sesión</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
 container: {marginTop: 20,
    flexGrow: 1,
    padding: 16,
    justifyContent: "center",
    backgroundColor: "#f9fafb",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 4,
  },
  description: { textAlign: "center", color: "#6b7280", marginBottom: 16 },
  generalError: { color: "#ef4444", textAlign: "center", marginBottom: 12 },
  label: { marginBottom: 4, fontWeight: "500", color: "#374151" },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    paddingHorizontal: 8,
  },
  icon: { marginRight: 8 },
  input: { flex: 1, height: 40 },
  eyeButton: { position: "absolute", right: 8, top: 10 },
  errorText: { color: "#ef4444", fontSize: 12, marginTop: 4 },
  submitButton: {
    backgroundColor: "#2563eb",
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 8,
    alignItems: "center",
  },
  submitButtonText: { color: "#fff", fontWeight: "bold" },
  switchContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 12,
  },
  switchText: { color: "#6b7280" },
  switchButton: { color: "#2563eb", fontWeight: "bold" },
});
