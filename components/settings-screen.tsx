import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { api } from "../utils/utils";
import { useTranslation } from "react-i18next";
import { useUser } from "../context/UserContext";

interface SettingsScreenProps {
  onLogout: () => void;
  onOpenProfile: () => void;
  onOpenChangePassword: () => void;
  onOpenLanguage: () => void;
  currentLanguage?: string;
  onOpenLanguageModal: () => void;
  userId: string;
}

interface UserProfile {
  username: string;
  email: string;
  avatar?: string;
  status?: string;
}

export function SettingsScreen({
  onLogout,
  onOpenProfile,
  onOpenChangePassword,
  onOpenLanguage,
  currentLanguage = "es",
  onOpenLanguageModal,
  userId,
}: SettingsScreenProps) {
  const { t, i18n } = useTranslation();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useUser();

  // Obtener datos del usuario al montar
  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const data = await api.get(`/usuarios/${user.id}`);
      setProfile(data);
    } catch {
      Alert.alert(
        t("settings.error", "Error"),
        t("settings.profileLoadError", "No se pudo cargar el perfil.")
      );
    } finally {
      setLoading(false);
    }
  };

  const getLanguageDisplay = (code: string) => {
    const languages = {
      es: { flag: "🇪🇸", name: t("language.spanish", "Español") },
      en: { flag: "🇺🇸", name: t("language.english", "English") },
      fr: { flag: "🇫🇷", name: "Français" },
      de: { flag: "🇩🇪", name: "Deutsch" },
      it: { flag: "🇮🇹", name: "Italiano" },
      pt: { flag: "🇵🇹", name: "Português" },
    };
    const lang = languages[code as keyof typeof languages] || languages.es;
    return `${lang.flag} ${lang.name}`;
  };

  type IoniconName = React.ComponentProps<typeof Ionicons>["name"];

  const settingsItems: {
    category: string;
    items: {
      icon: IoniconName;
      title: string;
      description: string;
      action: () => void;
    }[];
  }[] = [
    {
      category: t("settings.account", "Cuenta"),
      items: [
        {
          icon: "person",
          title: t("settings.profile", "Perfil"),
          description: t(
            "settings.editProfile",
            "Edita tu información personal"
          ),
          action: onOpenProfile,
        },
        {
          icon: "lock-closed",
          title: t("settings.changePassword", "Cambiar contraseña"),
          description: t(
            "settings.updatePassword",
            "Actualiza tu contraseña de acceso"
          ),
          action: onOpenChangePassword,
        },
      ],
    },
    {
      category: t("settings.appearance", "Apariencia"),
      items: [
        {
          icon: "globe",
          title: t("settings.language", "Idioma"),
          description: getLanguageDisplay(currentLanguage),
          action: onOpenLanguage,
        },
      ],
    },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          {t("settings.title", "Configuración")}
        </Text>
        <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
          <Ionicons name="log-out-outline" size={16} color="#dc2626" />
          <Text style={styles.logoutText}>
            {t("settings.logout", "Cerrar sesión")}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Profile Section */}
      <View style={styles.profileSection}>
        <View style={styles.avatar}>
          {loading ? (
            <ActivityIndicator color="#007AFF" />
          ) : (
            <Text style={styles.avatarFallback}>
              {profile?.username
                ? profile.username
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()
                : "?"}
            </Text>
          )}
        </View>
        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>
            {loading
              ? t("settings.loading", "Cargando...")
              : profile?.username || t("settings.user", "Usuario")}
          </Text>
          <Text style={styles.profileEmail}>
            {loading ? "" : profile?.email || ""}
          </Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {profile?.status === "online"
                ? t("settings.online", "En línea")
                : t("settings.offline", "Desconectado")}
            </Text>
          </View>
        </View>
      </View>

      {/* Settings Content */}
      <ScrollView contentContainerStyle={styles.settingsContainer}>
        {settingsItems.map((category) => (
          <View key={category.category} style={styles.card}>
            <Text style={styles.cardTitle}>{category.category}</Text>
            {category.items.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={styles.item}
                onPress={item.action}
              >
                <View style={styles.itemLeft}>
                  <View style={styles.iconContainer}>
                    <Ionicons name={item.icon} size={16} color="#2563eb" />
                  </View>
                  <View>
                    <Text style={styles.itemTitle}>{item.title}</Text>
                    <Text style={styles.itemDescription}>
                      {item.description}
                    </Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={16} color="#6b7280" />
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: 20, flex: 1, backgroundColor: "#fff" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  headerTitle: { fontSize: 20, fontWeight: "bold", color: "#111827" },
  logoutButton: { flexDirection: "row", alignItems: "center", gap: 4 },
  logoutText: { color: "#dc2626", fontWeight: "600", marginLeft: 4 },
  profileSection: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#f3f4f6",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  avatarFallback: { fontSize: 18, fontWeight: "bold", color: "#111827" },
  profileInfo: { flex: 1 },
  profileName: { fontSize: 16, fontWeight: "bold", color: "#111827" },
  profileEmail: { fontSize: 14, color: "#6b7280", marginBottom: 4 },
  badge: {
    backgroundColor: "#e0f2fe",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  badgeText: { fontSize: 12, color: "#0369a1", fontWeight: "600" },
  settingsContainer: { padding: 16 },
  card: {
    marginBottom: 16,
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    padding: 12,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
    color: "#374151",
  },
  item: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  itemLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "#e0f2fe",
    justifyContent: "center",
    alignItems: "center",
  },
  itemTitle: { fontSize: 14, fontWeight: "600", color: "#111827" },
  itemDescription: { fontSize: 12, color: "#6b7280" },
});
