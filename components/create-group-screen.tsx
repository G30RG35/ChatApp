import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  FlatList,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";

interface Contact {
  id: string;
  name: string;
  avatar?: string;
  status: "online" | "offline";
  lastSeen?: string;
}

interface CreateGroupScreenProps {
  onBack: () => void;
  onCreateGroup: (groupName: string, selectedContacts: Contact[]) => void;
}

export function CreateGroupScreen({
  onBack,
  onCreateGroup,
}: CreateGroupScreenProps) {
  const { t } = useTranslation();
  const [groupName, setGroupName] = useState("");
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [contacts] = useState<Contact[]>([
    {
      id: "1",
      name: "Ana García",
      avatar: "https://placehold.co/100x100",
      status: "online",
    },
    {
      id: "2",
      name: "Carlos López",
      avatar: "https://placehold.co/100x100",
      status: "offline",
      lastSeen: t("group.lastSeenHours", "Hace 2 horas", { hours: 2 }),
    },
    {
      id: "3",
      name: "María Rodríguez",
      avatar: "https://placehold.co/100x100",
      status: "online",
    },
    {
      id: "4",
      name: "David Martín",
      avatar: "https://placehold.co/100x100",
      status: "offline",
      lastSeen: t("group.lastSeenYesterday", "Ayer"),
    },
    {
      id: "5",
      name: "Laura Sánchez",
      avatar: "https://placehold.co/100x100",
      status: "online",
    },
  ]);

  const handleContactToggle = (contactId: string) => {
    setSelectedContacts((prev) =>
      prev.includes(contactId)
        ? prev.filter((id) => id !== contactId)
        : [...prev, contactId]
    );
  };

  const handleCreateGroup = () => {
    if (groupName.trim() && selectedContacts.length > 0) {
      const selectedContactsData = contacts.filter((c) =>
        selectedContacts.includes(c.id)
      );
      onCreateGroup(groupName, selectedContactsData);
    }
  };

  const canCreate = groupName.trim() && selectedContacts.length > 0;

  const renderContact = ({ item }: { item: Contact }) => {
    const checked = selectedContacts.includes(item.id);
    return (
      <TouchableOpacity
        style={styles.contactRow}
        onPress={() => handleContactToggle(item.id)}
      >
        {/* Checkbox */}
        <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
          {checked && <Ionicons name="checkmark" size={16} color="#fff" />}
        </View>

        {/* Avatar */}
        <View style={styles.avatarContainer}>
          <Image
            source={{ uri: item.avatar || "https://placehold.co/100x100" }}
            style={styles.avatar}
          />
          {item.status === "online" && <View style={styles.onlineDot} />}
        </View>

        {/* Info */}
        <View style={{ flex: 1 }}>
          <Text style={styles.contactName}>{item.name}</Text>
          <Text style={styles.contactStatus}>
            {item.status === "online"
              ? t("group.online", "En línea")
              : item.lastSeen}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.headerBtn}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t("group.newGroup", "Nuevo Grupo")}</Text>
        <TouchableOpacity
          onPress={handleCreateGroup}
          disabled={!canCreate}
          style={[styles.headerBtn, !canCreate && { opacity: 0.5 }]}
        >
          <Ionicons name="checkmark" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Group Info */}
      <View style={styles.groupInfo}>
        <View style={styles.groupAvatar}>
          <Ionicons name="camera" size={28} color="#888" />
          <TouchableOpacity style={styles.cameraBtn}>
            <Ionicons name="camera" size={16} color="#fff" />
          </TouchableOpacity>
        </View>
        <View style={{ flex: 1 }}>
          <TextInput
            placeholder={t("group.namePlaceholder", "Nombre del grupo")}
            value={groupName}
            onChangeText={setGroupName}
            style={styles.groupInput}
          />
          <Text style={styles.participantsText}>
            {selectedContacts.length}{" "}
            {t("group.participant", {
              count: selectedContacts.length,
              defaultValue:
                selectedContacts.length === 1
                  ? "participante seleccionado"
                  : "participantes seleccionados",
            })}
          </Text>
        </View>
      </View>

      {/* Selected Contacts */}
      {selectedContacts.length > 0 && (
        <View style={styles.selectedContainer}>
          <Text style={styles.sectionTitle}>
            {t("group.selectedParticipants", "Participantes seleccionados")}
          </Text>
          <View style={styles.selectedList}>
            {selectedContacts.map((id) => {
              const contact = contacts.find((c) => c.id === id);
              if (!contact) return null;
              return (
                <View key={id} style={styles.selectedChip}>
                  <Image
                    source={{ uri: contact.avatar }}
                    style={styles.selectedAvatar}
                  />
                  <Text style={styles.selectedName}>{contact.name}</Text>
                  <TouchableOpacity onPress={() => handleContactToggle(id)}>
                    <Text style={styles.removeBtn}>×</Text>
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        </View>
      )}

      {/* Contact List */}
      <View style={{ flex: 1 }}>
        <Text style={styles.sectionTitle}>{t("group.contacts", "Contactos")}</Text>
        <FlatList
          data={contacts}
          keyExtractor={(item) => item.id}
          renderItem={renderContact}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
 container: {marginTop: 20, flex: 1, backgroundColor: "#fff" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#4F46E5",
    padding: 12,
    justifyContent: "space-between",
  },
  headerBtn: { padding: 6 },
  headerTitle: { fontSize: 18, fontWeight: "600", color: "#fff" },
  groupInfo: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  groupAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#f2f2f2",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
    position: "relative",
  },
  cameraBtn: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#4F46E5",
    borderRadius: 12,
    padding: 4,
  },
  groupInput: {
    fontSize: 16,
    borderBottomWidth: 1,
    borderColor: "#ddd",
    paddingVertical: 4,
  },
  participantsText: { fontSize: 12, color: "#666", marginTop: 4 },
  selectedContainer: {
    padding: 12,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
    color: "#555",
  },
  selectedList: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  selectedChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f2f2f2",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
    margin: 4,
  },
  selectedAvatar: { width: 20, height: 20, borderRadius: 10, marginRight: 6 },
  selectedName: { fontSize: 12, marginRight: 4 },
  removeBtn: { fontSize: 14, color: "red", fontWeight: "bold" },
  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: "#aaa",
    borderRadius: 4,
    marginRight: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxChecked: {
    backgroundColor: "#4F46E5",
    borderColor: "#4F46E5",
  },
  avatarContainer: { marginRight: 12, position: "relative" },
  avatar: { width: 48, height: 48, borderRadius: 24 },
  onlineDot: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "green",
    borderWidth: 2,
    borderColor: "#fff",
  },
  contactName: { fontSize: 16, fontWeight: "500" },
  contactStatus: { fontSize: 12, color: "#888" },
});
