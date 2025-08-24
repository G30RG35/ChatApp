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
import { useTranslation } from "react-i18next";

interface UserProfileScreenProps {
  userId: string;
  onBack: () => void;
}

interface ProfileData {
  id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  avatar_url?: string;
  phone_number?: string;
  bio?: string;
}

interface FormErrors {
  username?: string;
  email?: string;
  general?: string;
}

export function UserProfileScreen({ userId, onBack }: UserProfileScreenProps) {
  const { t } = useTranslation();
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
      console.log("Cargando perfil...");
      const data = await api.get(`/usuarios/${userId}`);
      console.log("Perfil ", data)
      setProfile(data);
    } catch {
      setErrors({ general: t("profile.loadError", "No se pudo cargar el perfil") });
    } finally {
      setIsLoading(false);
    }
  };

  // Aquí puedes implementar la actualización del perfil si lo deseas
  const handleSubmit = async () => {
    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      onBack();
    }, 2000);
  };

  const AvatarComponent = () => {
    const initials = `${profile?.first_name?.[0] || ""}${profile?.last_name?.[0] || ""}`;
    return (
      <View style={styles.avatar}>
        {profile?.avatar_url ? (
          <Image
            source={{ uri: profile.avatar_url }}
            style={styles.avatarImage}
          />
        ) : (
          <View style={styles.avatarFallback}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
        )}
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
          <Text style={styles.headerTitle}>{t("profile.title", "Perfil")}</Text>
        </View>
        <View style={styles.successContainer}>
          <View style={styles.successIcon}>
            <Ionicons name="checkmark-circle" size={64} color="#34C759" />
          </View>
          <Text style={styles.successTitle}>{t("profile.updated", "¡Perfil actualizado!")}</Text>
          <Text style={styles.successMessage}>
            {t("profile.successMessage", "Tu información de perfil ha sido guardada exitosamente.")}
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
        <Text style={styles.errorText}>{errors.general || t("profile.notFound", "Perfil no encontrado")}</Text>
        <TouchableOpacity onPress={onBack} style={styles.backButtonContainer}>
          <Text style={styles.backButtonText}>{t("button.back", "Volver")}</Text>
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
        <Text style={styles.headerTitle}>{t("profile.title", "Perfil")}</Text>
        <TouchableOpacity
          style={[styles.saveButton, isLoading && styles.saveButtonDisabled]}
          onPress={handleSubmit}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.saveButtonText}>{t("button.save", "Guardar")}</Text>
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
          <Text style={styles.cardTitle}>{t("profile.photo", "Foto de perfil")}</Text>
          <View style={styles.avatarSection}>
            <AvatarComponent />
            <TouchableOpacity style={styles.changePhotoButton}>
              <Ionicons name="camera" size={18} color="#007AFF" />
              <Text style={styles.changePhotoText}>{t("profile.changePhoto", "Cambiar foto")}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Personal Information */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t("profile.personalInfo", "Información personal")}</Text>
          <Text style={styles.cardDescription}>
            {t("profile.personalInfoDesc", "Esta información será visible para tus contactos")}
          </Text>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>{t("profile.name", "Nombre")}</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="person" size={20} color="#8E8E93" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={profile.first_name}
                editable={false}
                placeholder={t("profile.namePlaceholder", "Nombre")}
              />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>{t("profile.lastname", "Apellido")}</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="person" size={20} color="#8E8E93" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={profile.last_name}
                editable={false}
                placeholder={t("profile.lastnamePlaceholder", "Apellido")}
              />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Username</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="person-circle" size={20} color="#8E8E93" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={profile.username}
                editable={false}
                placeholder="Username"
              />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="mail" size={20} color="#8E8E93" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={profile.email}
                editable={false}
                placeholder="Email"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>{t("profile.bio", "Biografía")}</Text>
            <TextInput
              style={[styles.textArea, styles.input]}
              value={profile.bio || ""}
              editable={false}
              placeholder={t("profile.bioPlaceholder", "Cuéntanos algo sobre ti...")}
              multiline
              numberOfLines={3}
            />
          </View>
        </View>

        {/* Contact Information */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t("profile.contactInfo", "Información de contacto")}</Text>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>{t("profile.phone", "Teléfono")}</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="call" size={20} color="#8E8E93" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={profile.phone_number || ""}
                editable={false}
                placeholder={t("profile.phonePlaceholder", "Teléfono")}
                keyboardType="phone-pad"
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