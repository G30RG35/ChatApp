import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Image,
} from "react-native";
import {
  Bell,
  MessageCircle,
  UserPlus,
  Phone,
  Video,
  MoreVertical,
  Check,
  X,
} from "lucide-react-native";

interface Notification {
  id: string;
  type: "message" | "call" | "contact_request" | "group_invite";
  title: string;
  description: string;
  avatar: string;
  timestamp: string;
  isRead: boolean;
  actionable?: boolean;
}

const mockNotifications: Notification[] = [
  {
    id: "1",
    type: "message",
    title: "Ana García",
    description: "Te ha enviado un mensaje",
    avatar: "/placeholder.svg",
    timestamp: "Hace 5 min",
    isRead: false,
  },
  {
    id: "2",
    type: "call",
    title: "Carlos López",
    description: "Llamada perdida",
    avatar: "/placeholder.svg",
    timestamp: "Hace 15 min",
    isRead: false,
  },
  {
    id: "3",
    type: "contact_request",
    title: "María Rodríguez",
    description: "Quiere agregarte como contacto",
    avatar: "/placeholder.svg",
    timestamp: "Hace 1 hora",
    isRead: false,
    actionable: true,
  },
  {
    id: "4",
    type: "group_invite",
    title: "Equipo Desarrollo",
    description: "Te ha invitado al grupo",
    avatar: "/placeholder.svg",
    timestamp: "Hace 2 horas",
    isRead: true,
    actionable: true,
  },
  {
    id: "5",
    type: "message",
    title: "Laura Sánchez",
    description: "¿Nos vemos mañana?",
    avatar: "/placeholder.svg",
    timestamp: "Ayer",
    isRead: true,
  },
];

export function NotificationsScreen() {
  const [notifications, setNotifications] = useState(mockNotifications);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "message":
        return <MessageCircle size={16} color="#fff" />;
      case "call":
        return <Phone size={16} color="#fff" />;
      case "contact_request":
        return <UserPlus size={16} color="#fff" />;
      case "group_invite":
        return <Video size={16} color="#fff" />;
      default:
        return <Bell size={16} color="#fff" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "message":
        return "#2563eb";
      case "call":
        return "#6b7280";
      case "contact_request":
        return "#f59e0b";
      case "group_invite":
        return "#10b981";
      default:
        return "#9ca3af";
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.bellIcon}>
            <Bell size={20} color="#fff" />
          </View>
          <View>
            <Text style={styles.headerTitle}>Notificaciones</Text>
            {unreadCount > 0 && (
              <Text style={styles.unreadText}>{unreadCount} sin leer</Text>
            )}
          </View>
        </View>
        <View style={styles.headerRight}>
          {unreadCount > 0 && (
            <TouchableOpacity
              style={styles.headerButton}
              onPress={markAllAsRead}
            >
              <Text style={styles.headerButtonText}>Marcar todas</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.iconButton}>
            <MoreVertical size={20} color="#111" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Notifications List */}
      <ScrollView style={styles.list}>
        {notifications.length === 0 ? (
          <View style={styles.noNotifications}>
            <Bell size={64} color="#9ca3af" />
            <Text style={styles.noNotificationsTitle}>
              No hay notificaciones
            </Text>
            <Text style={styles.noNotificationsText}>
              Te notificaremos cuando tengas mensajes nuevos
            </Text>
          </View>
        ) : (
          notifications.map((n) => (
            <TouchableOpacity
              key={n.id}
              style={[
                styles.notificationCard,
                !n.isRead && { backgroundColor: "#e0f2fe" },
              ]}
              onPress={() => markAsRead(n.id)}
            >
              <View style={styles.avatarWrapper}>
                <Image source={{ uri: n.avatar }} style={styles.avatar} />
                <View
                  style={[
                    styles.iconBadge,
                    { backgroundColor: getNotificationColor(n.type) },
                  ]}
                >
                  {getNotificationIcon(n.type)}
                </View>
              </View>
              <View style={styles.notificationContent}>
                <View style={styles.notificationHeader}>
                  <Text style={styles.notificationTitle}>{n.title}</Text>
                  {!n.isRead && <View style={styles.unreadDot} />}
                  <Text style={styles.timestamp}>{n.timestamp}</Text>
                </View>
                <Text style={styles.notificationDescription}>
                  {n.description}
                </Text>
                {n.actionable && (
                  <View style={styles.actions}>
                    <TouchableOpacity style={styles.acceptButton}>
                      <Check size={12} color="#fff" />
                      <Text style={styles.actionText}>Aceptar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.rejectButton}>
                      <X size={12} color="#fff" />
                      <Text style={styles.actionText}>Rechazar</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
              <TouchableOpacity
                onPress={() => removeNotification(n.id)}
                style={styles.removeButton}
              >
                <X size={16} color="#111" />
              </TouchableOpacity>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
 container: {marginTop: 20, flex: 1, backgroundColor: "#f9fafb" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 8 },
  bellIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "#2563eb",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: { fontSize: 18, fontWeight: "600", color: "#111" },
  unreadText: { fontSize: 12, color: "#6b7280" },
  headerRight: { flexDirection: "row", alignItems: "center", gap: 8 },
  headerButton: { padding: 8, backgroundColor: "#e5e7eb", borderRadius: 6 },
  headerButtonText: { fontSize: 12, color: "#111" },
  iconButton: { padding: 8 },
  list: { flex: 1 },
  noNotifications: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  noNotificationsTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 8,
    marginBottom: 4,
    color: "#111",
  },
  noNotificationsText: { fontSize: 14, color: "#6b7280", textAlign: "center" },
  notificationCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    backgroundColor: "#fff",
  },
  avatarWrapper: { position: "relative", marginRight: 12 },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#d1d5db",
  },
  iconBadge: {
    position: "absolute",
    bottom: -4,
    right: -4,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  notificationContent: { flex: 1, minWidth: 0 },
  notificationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  notificationTitle: { fontSize: 16, fontWeight: "500", color: "#111" },
  unreadDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#2563eb",
    marginLeft: 4,
  },
  timestamp: { fontSize: 12, color: "#6b7280" },
  notificationDescription: { fontSize: 14, color: "#6b7280", marginBottom: 6 },
  actions: { flexDirection: "row", gap: 8 },
  acceptButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#10b981",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  rejectButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ef4444",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  actionText: { fontSize: 12, color: "#fff", marginLeft: 4 },
  removeButton: { padding: 8 },
});
