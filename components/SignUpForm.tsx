import React, { useState } from "react"
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native"
import { Eye, EyeOff, User, Mail, Lock, MessageCircle } from "lucide-react-native"

interface FormData {
  username: string
  email: string
  password: string
  confirmPassword: string
}

interface FormErrors {
  username?: string
  email?: string
  password?: string
  confirmPassword?: string
  general?: string
}

interface SignUpFormProps {
  onSwitchToSignIn: () => void
}

export function SignUpForm({ onSwitchToSignIn }: SignUpFormProps) {
  const [formData, setFormData] = useState<FormData>({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.username.trim()) {
      newErrors.username = "El nombre de usuario es requerido"
    } else if (formData.username.length < 3) {
      newErrors.username = "El nombre de usuario debe tener al menos 3 caracteres"
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      newErrors.username = "Solo se permiten letras, números y guiones bajos"
    }

    if (!formData.email.trim()) {
      newErrors.email = "El email es requerido"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Ingresa un email válido"
    }

    if (!formData.password) {
      newErrors.password = "La contraseña es requerida"
    } else if (formData.password.length < 6) {
      newErrors.password = "La contraseña debe tener al menos 6 caracteres"
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Confirma tu contraseña"
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Las contraseñas no coinciden"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  const handleSubmit = async () => {
    if (!validateForm()) return
    setIsLoading(true)
    setErrors({})
    try {
      // Simulación de API
      await new Promise((r) => setTimeout(r, 1500))
      console.log("Datos del usuario:", formData)
      setIsSuccess(true)
    } catch (e) {
      setErrors({ general: "Error al crear la cuenta. Inténtalo de nuevo." })
    } finally {
      setIsLoading(false)
    }
  }

  if (isSuccess) {
    return (
      <View style={styles.card}>
        <View style={styles.successIcon}>
          <MessageCircle size={28} color="green" />
        </View>
        <Text style={styles.successTitle}>¡Cuenta creada exitosamente!</Text>
        <Text style={styles.successText}>Bienvenido a ChatApp, {formData.username}</Text>
        <TouchableOpacity style={styles.button} onPress={onSwitchToSignIn}>
          <Text style={styles.buttonText}>Ir a iniciar sesión</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Crear Cuenta</Text>
      <Text style={styles.subtitle}>Completa los datos para unirte a ChatApp</Text>

      {errors.general ? <Text style={styles.error}>{errors.general}</Text> : null}

      {/* Username */}
      <Text style={styles.label}>Nombre de usuario</Text>
      <View style={styles.inputContainer}>
        <User size={18} color="#888" style={styles.icon} />
        <TextInput
          placeholder="tu_usuario"
          value={formData.username}
          onChangeText={(t) => handleChange("username", t)}
          style={[styles.input, errors.username && styles.inputError]}
          autoCapitalize="none"
        />
      </View>
      {errors.username ? <Text style={styles.error}>{errors.username}</Text> : null}

      {/* Email */}
      <Text style={styles.label}>Email</Text>
      <View style={styles.inputContainer}>
        <Mail size={18} color="#888" style={styles.icon} />
        <TextInput
          placeholder="tu@email.com"
          value={formData.email}
          onChangeText={(t) => handleChange("email", t)}
          style={[styles.input, errors.email && styles.inputError]}
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>
      {errors.email ? <Text style={styles.error}>{errors.email}</Text> : null}

      {/* Password */}
      <Text style={styles.label}>Contraseña</Text>
      <View style={styles.inputContainer}>
        <Lock size={18} color="#888" style={styles.icon} />
        <TextInput
          placeholder="••••••••"
          value={formData.password}
          onChangeText={(t) => handleChange("password", t)}
          secureTextEntry={!showPassword}
          style={[styles.input, errors.password && styles.inputError]}
        />
        <TouchableOpacity style={styles.eyeIcon} onPress={() => setShowPassword((s) => !s)}>
          {showPassword ? <EyeOff size={20} color="#888" /> : <Eye size={20} color="#888" />}
        </TouchableOpacity>
      </View>
      {errors.password ? <Text style={styles.error}>{errors.password}</Text> : null}

      {/* Confirm Password */}
      <Text style={styles.label}>Confirmar contraseña</Text>
      <View style={styles.inputContainer}>
        <Lock size={18} color="#888" style={styles.icon} />
        <TextInput
          placeholder="••••••••"
          value={formData.confirmPassword}
          onChangeText={(t) => handleChange("confirmPassword", t)}
          secureTextEntry={!showConfirmPassword}
          style={[styles.input, errors.confirmPassword && styles.inputError]}
        />
        <TouchableOpacity style={styles.eyeIcon} onPress={() => setShowConfirmPassword((s) => !s)}>
          {showConfirmPassword ? <EyeOff size={20} color="#888" /> : <Eye size={20} color="#888" />}
        </TouchableOpacity>
      </View>
      {errors.confirmPassword ? <Text style={styles.error}>{errors.confirmPassword}</Text> : null}

      {/* Botón */}
      <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={isLoading}>
        {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Crear cuenta</Text>}
      </TouchableOpacity>

      {/* Link login */}
      <Text style={styles.registerText}>
        ¿Ya tienes cuenta?{" "}
        <Text style={styles.link} onPress={onSwitchToSignIn}>
          Inicia sesión
        </Text>
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    padding: 20,
    borderRadius: 12,
    backgroundColor: "#fff",
    elevation: 2,
    margin: 16,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 4,
    color: "#111",
  },
  subtitle: {
    textAlign: "center",
    color: "#666",
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
    marginTop: 8,
  },
  inputContainer: {
    position: "relative",
    marginBottom: 8,
    justifyContent: "center",
  },
  icon: {
    position: "absolute",
    left: 10,
    zIndex: 1,
  },
  eyeIcon: {
    position: "absolute",
    right: 10,
    zIndex: 1,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 36,
    fontSize: 16,
  },
  inputError: {
    borderColor: "red",
  },
  error: {
    color: "red",
    fontSize: 13,
    marginBottom: 8,
  },
  button: {
    backgroundColor: "#111",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  link: {
    color: "#2563eb",
    fontWeight: "500",
  },
  registerText: {
    textAlign: "center",
    marginTop: 12,
    color: "#444",
  },
  successIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#d1fae5",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginBottom: 12,
  },
  successTitle: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
  successText: {
    textAlign: "center",
    marginBottom: 16,
    color: "#666",
  },
})
