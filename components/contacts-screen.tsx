import React, { useEffect, useState } from "react";
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
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { api } from "../utils/utils"; // Importa tu helper de API

export interface Contact {
  id: string;
  name: string;
  avatar: string;
  phone: string;
  status: "online" | "offline";
  lastSeen?: string;
  isOnline?: boolean;
}

export function ContactsScreen({
  onStartChat,
  onVoiceCall,
  userId, // <-- Asegúrate de pasar el userId del usuario autenticado
}: {
  onStartChat: (contact: Contact) => void;
  onVoiceCall: (contact: Contact) => void;
  userId: string;
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  // Obtener contactos desde el backend
  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    setLoading(true);
    try {
      const data = await api.get(`/contactos/${userId}`);
      // El backend devuelve: id, contact_id, name, email, avatar, nickname, created_at
      setContacts(
        data.map((c: any) => ({
          id: c.contact_id,
          name: c.name,
          avatar: c.avatar || "https://placehold.co/100x100",
          phone: c.email, // O usa otro campo si tienes el teléfono
          status: "offline", // Puedes ajustar esto si tienes el estado real
        }))
      );
    } catch {
      Alert.alert("Error", "No se pudieron cargar los contactos.");
    } finally {
      setLoading(false);
    }
  };

  // Agregar contacto usando el endpoint del backend
  const handleAddContact = async () => {
    if (!newName.trim() || !newPhone.trim()) {
      setError("Nombre y número son requeridos");
      return;
    }
    try {
      // Buscar el usuario por email o teléfono (deberías tener un endpoint para esto)
      const users = await api.get(`/usuarios`);
      const found = users.find(
        (u: any) =>
          u.username.toLowerCase() === newName.trim().toLowerCase() ||
          u.email === newPhone.trim() // O compara con el campo correcto
      );
      if (!found) {
        setError("No existe un usuario con ese nombre o número/email");
        return;
      }
      // Llama al endpoint para agregar contacto
      const res = await api.post("/contactos", {
        user_id: userId,
        contact_id: found.id,
        nickname: newName.trim(),
      });
      if (res.error) {
        setError(res.error);
        return;
      }
      setModalVisible(false);
      setNewName("");
      setNewPhone("");
      setError("");
      fetchContacts();
    } catch {
      setError("Error de red o usuario no encontrado");
    }
  };

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
      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color="#007AFF" />
      ) : filteredContacts.length === 0 ? (
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
              placeholder="Nombre de usuario o email"
              value={newName}
              onChangeText={setNewName}
            />
            <TextInput
              style={styles.input}
              placeholder="Número o email"
              value={newPhone}
              onChangeText={setNewPhone}
              keyboardType="default"
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
