import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
  Image,
  SafeAreaView,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { api } from "../utils/utils";

interface UserProfileScreenProps {
  userId: string;
  onBack: () => void;
}

interface ProfileData {
  id: string;
  username: string;
  email: string;
  avatar?: string;
}

interface FormErrors {
  username?: string;
  email?: string;
  general?: string;
}

export function UserProfileScreen({ userId, onBack }: UserProfileScreenProps) {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setIsLoading(true);
    try {
      const data = await api.get(`/usuarios/${userId}`);
      setProfile(data);
    } catch {
      setErrors({ general: "No se pudo cargar el perfil" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!profile?.username?.trim() || !profile?.email?.trim()) {
      setErrors({ general: "El nombre de usuario y el email son requeridos" });
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      // Simular llamada a API
      await new Promise((resolve) => setTimeout(resolve, 2000));

      console.log("Perfil actualizado:", profile);
      setIsSuccess(true);

      // Volver automáticamente después de 2 segundos
      setTimeout(() => {
        setIsSuccess(false);
        onBack();
      }, 2000);
    } catch (error) {
      setErrors({ general: "Error al actualizar el perfil. Inténtalo de nuevo." });
    } finally {
      setIsLoading(false);
    }
  };

  const AvatarComponent = () => {
    const initials = `${profile?.username[0]}`;
    
    return (
      <View style={styles.avatar}>
        <Image 
          source={{ uri: profile?.avatar || "https://placekitten.com/80/80" }} 
          style={styles.avatarImage} 
        />
        <View style={styles.avatarFallback}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
      </View>
    );
  };

  if (isSuccess) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#007AFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Perfil</Text>
        </View>

        <View style={styles.successContainer}>
          <View style={styles.successIcon}>
            <Ionicons name="checkmark-circle" size={64} color="#34C759" />
          </View>
          <Text style={styles.successTitle}>¡Perfil actualizado!</Text>
          <Text style={styles.successMessage}>
            Tu información de perfil ha sido guardada exitosamente.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{errors.general || "Perfil no encontrado"}</Text>
        <TouchableOpacity onPress={onBack} style={styles.backButtonContainer}>
          <Text style={styles.backButtonText}>Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Perfil</Text>
        <TouchableOpacity 
          style={[styles.saveButton, isLoading && styles.saveButtonDisabled]} 
          onPress={handleSubmit}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.saveButtonText}>Guardar</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView style={styles.content}>
        {errors.general && (
          <View style={styles.errorAlert}>
            <Ionicons name="warning" size={20} color="#FF3B30" />
            <Text style={styles.errorText}>{errors.general}</Text>
          </View>
        )}

        {/* Avatar Section */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Foto de perfil</Text>
          <View style={styles.avatarSection}>
            <AvatarComponent />
            <TouchableOpacity style={styles.changePhotoButton}>
              <Ionicons name="camera" size={18} color="#007AFF" />
              <Text style={styles.changePhotoText}>Cambiar foto</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Personal Information */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Información personal</Text>
          <Text style={styles.cardDescription}>
            Esta información será visible para tus contactos
          </Text>
          
          <View style={styles.row}>
            <View style={[styles.inputContainer, styles.halfInput]}>
              <Text style={styles.label}>Nombre</Text>
              <View style={[styles.inputWrapper, errors.username && styles.inputError]}>
                <Ionicons name="person" size={20} color="#8E8E93" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={profile.username}
                  onChangeText={(value) =>
                    setProfile((prev) =>
                      prev
                        ? { ...prev, username: value }
                        : { id: "", username: value, email: "" }
                    )
                  }
                  placeholder="Nombre de usuario"
                  editable={false}
                />
              </View>
              {errors.username && <Text style={styles.errorText}>{errors.username}</Text>}
            </View>

            <View style={[styles.inputContainer, styles.halfInput]}>
              <Text style={styles.label}>Apellido</Text>
              <View style={[styles.inputWrapper, errors.username && styles.inputError]}>
                <Ionicons name="person" size={20} color="#8E8E93" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={profile.username}
                  onChangeText={(value) =>
                    setProfile((prev) =>
                      prev
                        ? { ...prev, email: value }
                        : { id: "", username: "", email: value }
                    )
                  }
                  placeholder="Apellido"
                  editable={false}
                />
              </View>
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email</Text>
            <View style={[styles.inputWrapper, errors.email && styles.inputError]}>
              <Ionicons name="mail" size={20} color="#8E8E93" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={profile.email}
                onChangeText={(value) =>
                  setProfile((prev) =>
                    prev
                      ? { ...prev, email: value }
                      : { id: "", username: "", email: value }
                  )
                }
                placeholder="Email"
                keyboardType="email-address"
                autoCapitalize="none"
                editable={false}
              />
            </View>
            {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Biografía</Text>
            <TextInput
              style={[styles.textArea, styles.input]}
              value={profile.username}
              onChangeText={(value) =>
                setProfile((prev) =>
                  prev
                    ? { ...prev, email: value }
                    : { id: "", username: "", email: value }
                )
              }
              placeholder="Cuéntanos algo sobre ti..."
              multiline
              numberOfLines={3}
              editable={false}
            />
          </View>
        </View>

        {/* Contact Information */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Información de contacto</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Teléfono</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="call" size={20} color="#8E8E93" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={profile.username}
                onChangeText={(value) =>
                  setProfile((prev) =>
                    prev
                      ? { ...prev, email: value }
                      : { id: "", username: "", email: value }
                  )
                }
                placeholder="Teléfono"
                keyboardType="phone-pad"
                editable={false}
              />
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  backButton: {
    padding: 8,
  },
  backButtonContainer: { backgroundColor: "#007AFF", padding: 14, borderRadius: 8, alignItems: "center" },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
  },
  saveButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  errorAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFECEB',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorTextInline: {
    color: '#FF3B30',
    marginLeft: 8,
    fontSize: 14,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 16,
  },
  avatarSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 16,
    position: 'relative',
  },
  avatarImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  avatarFallback: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E1E1E6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#007AFF',
    fontSize: 24,
    fontWeight: '600',
  },
  changePhotoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 8,
  },
  changePhotoText: {
    color: '#007AFF',
    marginLeft: 6,
    fontWeight: '500',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfInput: {
    width: '48%',
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000000',
    marginBottom: 8,
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
  textArea: {
    height: 100,
    textAlignVertical: 'top',
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
  },
  centered: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#fff" },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 24, textAlign: "center" },
  profileCard: { backgroundColor: "#f2f2f7", borderRadius: 12, padding: 20, marginBottom: 24 },
  errorText: { color: "#FF3B30", fontSize: 16, marginBottom: 16 },
  backButtonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});