import React, { useState } from "react";
import { View, Text, Modal, TouchableOpacity, Image, FlatList, StyleSheet, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";

// Data falsa de miembros
const fakeMembers: GroupMember[] = [
  {
    id: "11111111-1111-1111-1111-111111111111",
    name: "Pedro",
    avatar: "",
    role: "member",
    isOnline: true,
  },
  {
    id: "22222222-2222-2222-2222-222222222222",
    name: "Bob (Tú)",
    avatar: "",
    role: "member",
    isOnline: false,
  },
  {
    id: "3374e106-6ec3-4c7e-b127-5eb7be480a71",
    name: "Jorge",
    avatar: "",
    role: "admin",
    isOnline: true,
  },
];

interface GroupMember {
  id: string;
  name: string;
  avatar?: string;
  role: "admin" | "member";
  isOnline: boolean;
}

interface GroupInfoModalProps {
  visible: boolean;
  onClose: () => void;
  groupName: string;
  groupAvatar?: string;
  members?: GroupMember[]; // <-- ahora es opcional
}

export function GroupInfoModal({
  visible,
  onClose,
  groupName,
  groupAvatar,
  members,
}: GroupInfoModalProps) {
  const initialMembers = members && members.length > 0 ? members : fakeMembers;
  const [localMembers, setLocalMembers] = useState<GroupMember[]>(initialMembers);

  React.useEffect(() => {
    setLocalMembers(members && members.length > 0 ? members : fakeMembers);
  }, [members]);

  const handleRemoveMember = (id: string) => {
    Alert.alert(
      "Eliminar miembro",
      "¿Seguro que deseas eliminar a este miembro del grupo?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: () => {
            setLocalMembers((prev) => prev.filter((m) => m.id !== id));
          },
        },
      ]
    );
  };

  // Botón para agregar miembro (solo simula agregar un miembro de prueba)
  const handleAddMember = () => {
    const newMember: GroupMember = {
      id: Math.random().toString(36).slice(2),
      name: "Nuevo Miembro",
      avatar: "",
      role: "member",
      isOnline: false,
    };
    setLocalMembers((prev) => [...prev, newMember]);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <Text style={styles.title}>Información del grupo</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>
          <View style={styles.groupInfo}>
            <Image
              source={{ uri: groupAvatar || "https://placehold.co/100x100" }}
              style={styles.groupAvatar}
            />
            <Text style={styles.groupName}>{groupName}</Text>
            <Text style={styles.memberCount}>
              {localMembers.length} {localMembers.length === 1 ? "miembro" : "miembros"}
            </Text>
          </View>
          {/* Botón para agregar miembro */}
          {/* <TouchableOpacity style={styles.addButton} onPress={handleAddMember}>
            <Ionicons name="person-add" size={18} color="#fff" />
            <Text style={styles.addButtonText}>Agregar miembro</Text>
          </TouchableOpacity> */}
          <Text style={styles.sectionTitle}>Miembros</Text>
          <FlatList
            data={localMembers}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.memberRow}>
                <Image
                  source={{ uri: item.avatar || "https://placehold.co/100x100" }}
                  style={styles.memberAvatar}
                />
                <View style={{ flex: 1 }}>
                  <Text style={styles.memberName}>{item.name}</Text>
                  <Text style={styles.memberRole}>
                    {item.role === "admin" ? "Administrador" : "Miembro"}
                  </Text>
                </View>
                {item.isOnline && <View style={styles.onlineDot} />}
                
              </View>
            )}
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.25)",
    justifyContent: "center",
    alignItems: "center",
  },
  modal: {
    width: "90%",
    maxHeight: "80%",
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 18,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
  },
  groupInfo: {
    alignItems: "center",
    marginBottom: 16,
  },
  groupAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginBottom: 8,
    backgroundColor: "#eee",
  },
  groupName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#222",
    marginBottom: 2,
  },
  memberCount: {
    fontSize: 13,
    color: "#666",
    marginBottom: 2,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 8,
    color: "#444",
  },
  memberRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  memberAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 10,
    backgroundColor: "#eee",
  },
  memberName: {
    fontSize: 15,
    fontWeight: "500",
    color: "#222",
  },
  memberRole: {
    fontSize: 12,
    color: "#888",
  },
  onlineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#22c55e",
    marginLeft: 8,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2563eb",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: "center",
    marginBottom: 10,
    marginTop: 2,
  },
  addButtonText: {
    color: "#fff",
    fontWeight: "600",
    marginLeft: 8,
    fontSize: 15,
  },
});