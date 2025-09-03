import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  StyleSheet,
  SafeAreaView,
  FlatList,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { api } from "../utils/utils";
import { useUser } from "../context/UserContext";

interface Conversation {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
  isOnline: boolean;
  isGroup: boolean;
}

interface Contact {
  id: string;
  name: string;
  avatar?: string;
  status: "online" | "offline";
  lastSeen?: string;
}

interface HomeScreenProps {
  userId: string | undefined;
  onNewChat?: () => void;
  onStartChat?: (contact: Contact) => void;
  onStartGroupChat?: (conversation: any) => void;
}

export function HomeScreen({
  onNewChat,
  onStartChat,
  userId,
  onStartGroupChat,
}: HomeScreenProps) {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [chats, setChats] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchChats();
  }, []);

  const fetchChats = async () => {
    setLoading(true);
    try {
      const data = await api.get(`/conversaciones/${userId}`);
      const mappedChats = data.map((item: any) => ({
        id: item.conversation_id,
        name: item.is_group
          ? item.name || "Grupo"
          : item.contact_username || "Chat",
        avatar: item.is_group ? "" : item.contact_avatar || "",
        lastMessage: item.last_message || "",
        timestamp: item.last_message_time
          ? new Date(item.last_message_time).toLocaleString()
          : "",
        unreadCount: 0,
        isOnline: false,
        isGroup: !!item.is_group,
      }));
      setChats(mappedChats);
    } catch (e) {
      console.log("Error al obtener chats:", e);
    } finally {
      setLoading(false);
    }
  };

  const filteredConversations = chats.filter((conversation) =>
    conversation?.name?.toLowerCase()?.includes(searchQuery?.toLowerCase())
  );

  const handleConversationClick = (conversation: Conversation) => {
    if (conversation.isGroup) {
      // Abre el chat grupal
      if (onStartGroupChat) {
        onStartGroupChat(conversation);
      }
    } else if (onStartChat) {
      // Abre el chat privado
      const contact: Contact = {
        id: conversation.id,
        name: conversation.name,
        avatar: conversation.avatar,
        status: conversation.isOnline ? "online" : "offline",
      };
      onStartChat(contact);
    }
  }

    const handleRefresh = () => {
      setRefreshing(true);
      setTimeout(() => {
        setRefreshing(false);
      }, 1000);
    };

    const AvatarComponent = ({
      name,
      avatar,
      size = 48,
    }: {
      name: string;
      avatar?: string;
      size?: number;
    }) => {
      const initials = name
        .split(" ")
        .map((n) => n[0])
        .join("");

      return (
        <View
          style={[
            styles.avatar,
            { width: size, height: size, borderRadius: size / 2 },
          ]}
        >
          {avatar ? (
            <Image
              source={{ uri: avatar }}
              style={[
                styles.avatarImage,
                { width: size, height: size, borderRadius: size / 2 },
              ]}
            />
          ) : (
            <Text style={[styles.avatarFallback, { fontSize: size * 0.4 }]}>
              {initials}
            </Text>
          )}
        </View>
      );
    };

    const renderConversationItem = ({ item }: { item: Conversation }) => (
      <TouchableOpacity
        style={styles.conversationItem}
        onPress={() => handleConversationClick(item)}
      >
        <View style={styles.avatarContainer}>
          <AvatarComponent name={item.name} avatar={item.avatar} size={48} />
          {item.isOnline && <View style={styles.onlineIndicator} />}
        </View>

        <View style={styles.conversationContent}>
          <View style={styles.conversationHeader}>
            <Text style={styles.conversationName} numberOfLines={1}>
              {item.name}
            </Text>
            <Text style={styles.timestamp}>{item.timestamp}</Text>
          </View>
          <View style={styles.conversationFooter}>
            <Text style={styles.lastMessage} numberOfLines={1}>
              {item.lastMessage}
            </Text>
            {item.unreadCount > 0 && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadCount}>{item.unreadCount}</Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );

    const renderEmptyState = () => (
      <View style={styles.emptyState}>
        <Ionicons name="chatbubble-outline" size={64} color="#C7C7CC" />
        <Text style={styles.emptyStateTitle}>
          {t("home.emptyTitle", "No hay conversaciones")}
        </Text>
        <Text style={styles.emptyStateText}>
          {t("home.emptyText", "Inicia una nueva conversación para comenzar")}
        </Text>
      </View>
    );

    if (loading) {
      return <ActivityIndicator />;
    }

    return (
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.logo}>
              <Ionicons name="chatbubble" size={24} color="#FFFFFF" />
            </View>
            <Text style={styles.headerTitle}>
              {t("home.title", "Mensajes")}
            </Text>
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Ionicons
              name="search"
              size={20}
              color="#8E8E93"
              style={styles.searchIcon}
            />
            <TextInput
              style={styles.searchInput}
              placeholder={t(
                "home.searchPlaceholder",
                "Buscar conversaciones..."
              )}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#8E8E93"
            />
          </View>
        </View>

        {/* Conversations List */}
        <FlatList
          data={filteredConversations}
          renderItem={renderConversationItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={
            filteredConversations.length === 0
              ? styles.emptyListContainer
              : styles.listContentContainer
          }
          ListEmptyComponent={renderEmptyState}
          style={styles.list}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          showsVerticalScrollIndicator={false}
        />

        {/* Floating Action Button */}
        <TouchableOpacity style={styles.fab} onPress={onNewChat}>
          <Ionicons name="add" size={30} color="#FFFFFF" />
        </TouchableOpacity>
      </SafeAreaView>
    );
  };

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5EA",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  logo: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#000000",
  },
  headerButton: {
    padding: 8,
  },
  searchContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5EA",
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F2F2F7",
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#000000",
  },
  list: {
    flex: 1,
  },
  listContentContainer: {
    paddingBottom: 20,
  },
  emptyListContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    height: Dimensions.get("window").height * 0.6,
  },
  conversationItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F2F2F7",
  },
  avatarContainer: {
    position: "relative",
    marginRight: 16,
  },
  avatar: {
    backgroundColor: "#E1E1E6",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarImage: {
    resizeMode: "cover",
  },
  avatarFallback: {
    color: "#007AFF",
    fontWeight: "600",
  },
  onlineIndicator: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 16,
    height: 16,
    backgroundColor: "#34C759",
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  conversationContent: {
    flex: 1,
  },
  conversationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  conversationName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000000",
    flex: 1,
    marginRight: 8,
  },
  timestamp: {
    fontSize: 14,
    color: "#8E8E93",
  },
  conversationFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  lastMessage: {
    fontSize: 14,
    color: "#8E8E93",
    flex: 1,
    marginRight: 8,
  },
  unreadBadge: {
    backgroundColor: "#007AFF",
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 6,
  },
  unreadCount: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000000",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 16,
    color: "#8E8E93",
    textAlign: "center",
  },
  fab: {
    position: "absolute",
    right: 24,
    bottom: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});
