import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export interface Contact {
  id: string;
  name: string;
  avatar: string;
  phone: string;
  status: "online" | "offline";
  lastSeen?: string;
  isOnline?: boolean;
}

const mockContacts: Contact[] = [
  {
    id: "1",
    name: "Ana García",
    avatar: "https://placehold.co/100x100",
    phone: "+34 612 345 678",
    status: "online",
  },
  {
    id: "2",
    name: "Carlos López",
    avatar: "https://placehold.co/100x100",
    phone: "+34 687 654 321",
    status: "offline",
    lastSeen: "Hace 2 horas",
  },
  {
    id: "3",
    name: "María Rodríguez",
    avatar: "https://placehold.co/100x100",
    phone: "+34 698 123 456",
    status: "online",
  },
];

export function ContactsScreen({
  onStartChat,
  onVoiceCall,
}: {
  onStartChat: (contact: Contact) => void;
  onVoiceCall: (contact: Contact) => void;
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [contacts, setContacts] = useState<Contact[]>(mockContacts);
  const [modalVisible, setModalVisible] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [error, setError] = useState("");

  const filteredContacts = contacts.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery)
  );

  const handleCall = (contact: Contact) => {
    onVoiceCall(contact);
  };

  const handleChat = (contact: Contact) => {
    onStartChat(contact);
  };

  const handleAddContact = () => {
    if (!newName.trim() || !newPhone.trim()) {
      setError("Nombre y número son requeridos");
      return;
    }
    const exists = contacts.some(
      (c) => c.phone.trim() === newPhone.trim() || c.name.trim().toLowerCase() === newName.trim().toLowerCase()
    );
    if (exists) {
      setError("El contacto ya existe");
      return;
    }
    const newContact: Contact = {
      id: (contacts.length + 1).toString(),
      name: newName.trim(),
      avatar: "https://placehold.co/100x100",
      phone: newPhone.trim(),
      status: "offline",
    };
    setContacts([newContact, ...contacts]);
    setNewName("");
    setNewPhone("");
    setError("");
    setModalVisible(false);
  };

  const renderContact = ({ item }: { item: Contact }) => (
    <View style={styles.contactCard}>
      <View style={styles.avatarContainer}>
        <Image source={{ uri: item.avatar }} style={styles.avatar} />
        {item.status === "online" && <View style={styles.onlineDot} />}
      </View>
      <View style={{ flex: 1 }}>
        <View style={styles.contactHeader}>
          <Text style={styles.contactName}>{item.name}</Text>
        </View>
        <Text style={styles.phone}>{item.phone}</Text>
        {item.status === "offline" && item.lastSeen && (
          <Text style={styles.lastSeen}>{item.lastSeen}</Text>
        )}
      </View>
      <View style={styles.actions}>
        <TouchableOpacity style={styles.iconBtn} onPress={() => handleCall(item)}>
          <Ionicons name="call-outline" size={20} color="#555" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconBtn} onPress={() => handleChat(item)}>
          <Ionicons name="chatbubble-ellipses-outline" size={20} color="#555" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.logo}>
            <Ionicons name="people" size={24} color="#FFFFFF" />
          </View>
          <Text style={styles.headerTitle}>Contactos</Text>
        </View>
        <TouchableOpacity onPress={() => setModalVisible(true)}>
          <Ionicons name="person-add" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchBar}>
        <Ionicons name="search" size={18} color="#888" style={{ marginRight: 8 }} />
        <TextInput
          style={{ flex: 1 }}
          placeholder="Buscar contactos..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Lista */}
      {filteredContacts.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="people-outline" size={64} color="#aaa" />
          <Text style={styles.emptyTitle}>No hay contactos</Text>
          <Text style={styles.emptyDesc}>Agrega contactos para comenzar a chatear</Text>
          <TouchableOpacity style={styles.addBtn} onPress={() => setModalVisible(true)}>
            <Ionicons name="person-add" size={20} color="#fff" />
            <Text style={styles.addBtnText}> Agregar contacto</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredContacts}
          keyExtractor={(item) => item.id}
          renderItem={renderContact}
        />
      )}

      {/* Floating Action Button */}
      <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)}>
        <Ionicons name="person-add" size={28} color="#fff" />
      </TouchableOpacity>

      {/* Modal para agregar contacto */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.modalContainer}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Agregar contacto</Text>
            <TextInput
              style={styles.input}
              placeholder="Nombre"
              value={newName}
              onChangeText={setNewName}
            />
            <TextInput
              style={styles.input}
              placeholder="Número"
              value={newPhone}
              onChangeText={setNewPhone}
              keyboardType="phone-pad"
            />
            {error ? <Text style={styles.error}>{error}</Text> : null}
            <View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
              <TouchableOpacity
                style={[styles.addBtn, { marginRight: 8, backgroundColor: "#eee" }]}
                onPress={() => {
                  setModalVisible(false);
                  setError("");
                  setNewName("");
                  setNewPhone("");
                }}
              >
                <Text style={[styles.addBtnText, { color: "#007AFF" }]}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.addBtn} onPress={handleAddContact}>
                <Text style={styles.addBtnText}>Agregar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
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
    borderBottomColor: "#E5E5EA",
    backgroundColor: "#fff",
  },
  headerLeft: { flexDirection: "row", alignItems: "center" },
  logo: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  headerTitle: { fontSize: 20, fontWeight: "600", color: "#000", marginLeft: 0 },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f2f2f2",
    margin: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  contactCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  avatarContainer: { position: "relative", marginRight: 12 },
  avatar: { width: 48, height: 48, borderRadius: 24 },
  onlineDot: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#4CAF50",
    borderWidth: 2,
    borderColor: "#fff",
  },
  contactHeader: { flexDirection: "row", alignItems: "center" },
  contactName: { fontSize: 16, fontWeight: "500" },
  phone: { fontSize: 14, color: "#555" },
  lastSeen: { fontSize: 12, color: "#999" },
  actions: { flexDirection: "row", marginLeft: 8 },
  iconBtn: { padding: 6 },
  empty: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  emptyTitle: { fontSize: 18, fontWeight: "600", marginTop: 12 },
  emptyDesc: { color: "#777", marginBottom: 12 },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#007AFF",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  addBtnText: { color: "#fff", fontWeight: "600" },
  fab: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: "#007AFF",
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "90%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 16,
    color: "#007AFF",
  },
  input: {
    borderWidth: 1,
    borderColor: "#E5E5EA",
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
    fontSize: 16,
    backgroundColor: "#f9f9f9",
  },
  error: {
    color: "#d32f2f",
    marginBottom: 8,
    fontSize: 14,
  },
});
