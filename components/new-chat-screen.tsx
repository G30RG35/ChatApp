import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { ArrowLeft, Search, Users, UserPlus } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { api } from "../utils/utils";

interface Contact {
  id: string;
  name: string;
  avatar?: string;
  status: "online" | "offline";
  lastSeen?: string;
}

interface NewChatScreenProps {
  onBack: () => void;
  onStartChat: (contact: Contact) => void;
  onCreateGroup: () => void;
  userId: string; // <-- Asegúrate de pasar el userId como prop
}

export function NewChatScreen({
  onBack,
  onStartChat,
  onCreateGroup,
  userId,
}: NewChatScreenProps) {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [contacts, setContacts] = useState<Contact[]>([]);

  useEffect(() => {
    // Carga los contactos usando el endpoint real
    const fetchContacts = async () => {
      try {
        const data = await api.get(`/contactos/${userId}`);
        // Mapea los datos del backend a la interfaz Contact
        const mapped = data.map((c: any) => ({
          id: c.contact_id,
          name: c.name || c.username,
          avatar: c.avatar || c.avatar_url || "/placeholder.svg",
          status: c.status === "online" ? "online" : "offline",
          lastSeen: c.lastSeen || "",
        }));
        setContacts(mapped);
      } catch {
        setContacts([]);
      }
    };
    fetchContacts();
  }, [userId]);

  const filteredContacts = contacts.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const onlineContacts = filteredContacts.filter((c) => c.status === "online");
  const offlineContacts = filteredContacts.filter(
    (c) => c.status === "offline"
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <ArrowLeft size={20} color="#111" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {t("newChat.title", "Nuevo Chat")}
        </Text>
      </View>

      {/* Search */}
      <View style={styles.searchWrapper}>
        <Search size={16} color="#9ca3af" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder={t("newChat.searchPlaceholder", "Buscar contactos...")}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity style={styles.actionButton} onPress={onCreateGroup}>
          <View style={styles.actionIconWrap}>
            <Users size={20} color="#2563eb" />
          </View>
          <Text style={styles.actionText}>
            {t("newChat.createGroup", "Crear grupo")}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton}>
          <View style={styles.actionIconWrap}>
            <UserPlus size={20} color="#2563eb" />
          </View>
          <Text style={styles.actionText}>
            {t("newChat.addContact", "Agregar contacto")}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Contacts List */}
      <ScrollView style={styles.contactsList}>
        {onlineContacts.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {t("newChat.online", "En línea")}
            </Text>
            {onlineContacts.map((c) => (
              <TouchableOpacity
                key={c.id}
                style={styles.contactItem}
                onPress={() => onStartChat(c)}
              >
                <View style={styles.avatarOnline} />
                <View>
                  <Text style={styles.contactName}>{c.name}</Text>
                  <Text style={styles.contactStatus}>
                    {t("group.online", "En línea")}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {offlineContacts.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {t("newChat.contacts", "Contactos")}
            </Text>
            {offlineContacts.map((c) => (
              <TouchableOpacity
                key={c.id}
                style={styles.contactItem}
                onPress={() => onStartChat(c)}
              >
                <View style={styles.avatarOffline} />
                <View>
                  <Text style={styles.contactName}>{c.name}</Text>
                  <Text style={styles.contactStatus}>{c.lastSeen}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {filteredContacts.length === 0 && searchQuery ? (
          <View style={styles.noResults}>
            <Search size={48} color="#9ca3af" />
            <Text style={styles.noResultsText}>
              {t("newChat.noResults", "No se encontraron contactos con")} "
              {searchQuery}"
            </Text>
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: 20, flex: 1, backgroundColor: "#f9fafb" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  backButton: { padding: 8 },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginLeft: 8,
    color: "#111",
  },
  searchWrapper: {
    flexDirection: "row",
    alignItems: "center",
    margin: 16,
    position: "relative",
  },
  searchIcon: { position: "absolute", left: 12 },
  searchInput: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 36,
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
  },
  quickActions: { paddingHorizontal: 16, marginBottom: 16 },
  actionButton: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  actionIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#dbeafe",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  actionText: { fontSize: 16, color: "#111" },
  contactsList: { flex: 1, paddingHorizontal: 16 },
  section: { marginBottom: 16 },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6b7280",
    marginBottom: 8,
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },
  avatarOnline: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#22c55e",
    marginRight: 12,
  },
  avatarOffline: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#9ca3af",
    marginRight: 12,
  },
  contactName: { fontSize: 16, fontWeight: "500", color: "#111" },
  contactStatus: { fontSize: 12, color: "#6b7280" },
  noResults: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 32,
  },
  noResultsText: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
    marginTop: 8,
  },
});
