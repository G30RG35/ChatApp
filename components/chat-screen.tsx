import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Animated,
  FlatList
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../utils/utils';
import { useTranslation } from 'react-i18next';

interface Message {
  id: string;
  text: string;
  sender: "me" | "other";
  timestamp: string;
  status?: "sent" | "delivered" | "read";
}

interface ChatScreenProps {
  contactName: string;
  contactAvatar?: string;
  onBack: () => void;
  onVideoCall?: () => void;
  onVoiceCall?: () => void;
  conversacionId: string;
  userId: string;
  contactId: string;
}

export function ChatScreen({
  contactName,
  contactAvatar,
  onBack,
  onVideoCall,
  onVoiceCall,
  conversacionId,
  userId,
  contactId,
}: ChatScreenProps) {
  const { t, i18n } = useTranslation();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  // Obtener mensajes al montar
  useEffect(() => {
    fetchMessages();
    // Opcional: puedes usar un intervalo o sockets para actualizar en tiempo real
    // eslint-disable-next-line
  }, [conversacionId]);

  const fetchMessages = async () => {
    try {
      const data = await api.get(`/mensajes/${conversacionId}`);
      setMessages(
        data.map((msg: any) => ({
          id: msg.id.toString(),
          text: msg.contenido,
          sender: msg.remitente_id === userId ? "me" : "other",
          timestamp: new Date(msg.created_at).toLocaleTimeString(i18n.language === "en" ? "en-US" : "es-ES", { hour: "2-digit", minute: "2-digit" }),
          status: msg.estado || "sent",
        }))
      );
    } catch {
      // Puedes mostrar un error si lo deseas
    }
  };

  const handleSendMessage = async () => {
    if (newMessage.trim()) {
      // Envía el mensaje al backend
      const body = {
        conversacion_id: conversacionId,
        remitente_id: userId,
        contenido: newMessage,
        tipo: "texto",
      };
      try {
        const res = await api.post("/mensajes", body);
        if (res && res.id) {
          setNewMessage("");
          fetchMessages();
        }
      } catch {
        // Puedes mostrar un error si lo deseas
      }
    }
  };

  const scrollToBottom = () => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const StatusIndicator = ({ status }: { status: "sent" | "delivered" | "read" }) => {
    return (
      <View style={styles.statusContainer}>
        <View
          style={[
            styles.statusDot,
            status === "sent" && styles.statusSent,
            status === "delivered" && styles.statusDelivered,
            status === "read" && styles.statusRead,
          ]}
        />
        <View
          style={[
            styles.statusDot,
            status === "delivered" && styles.statusDelivered,
            status === "read" && styles.statusRead,
            (status === "sent" || status === undefined) && styles.statusHidden,
          ]}
        />
      </View>
    );
  };

  const AvatarComponent = () => {
    const initials = contactName.charAt(0).toUpperCase();
    return (
      <View style={styles.avatar}>
        {contactAvatar ? (
          <Image source={{ uri: contactAvatar }} style={styles.avatarImage} />
        ) : (
          <Text style={styles.avatarFallback}>{initials}</Text>
        )}
      </View>
    );
  };
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#007AFF" />
          </TouchableOpacity>
          <AvatarComponent />
          <View style={styles.contactInfo}>
            <Text style={styles.contactName}>{contactName}</Text>
            <Text style={styles.contactStatus}>
              {isTyping
                ? t("chat.typing", "Escribiendo...")
                : t("chat.online", "En línea")}
            </Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity onPress={onVoiceCall} style={styles.headerButton}>
            <Ionicons name="call" size={24} color="#007AFF" />
          </TouchableOpacity>
          <TouchableOpacity onPress={onVideoCall} style={styles.headerButton}>
            <Ionicons name="videocam" size={24} color="#007AFF" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.messageContainer}>
        <FlatList<Message>
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }: { item: Message }) => (
            <View style={item.sender === "me" ? styles.myMessage : styles.otherMessage}>
              <Text style={item.sender === "me" ? styles.myMessageText : styles.otherMessageText}>
                {item.text}
              </Text>
              <StatusIndicator status={item.status ?? "sent"} />
            </View>
          )}
        />
      </View>

      <View style={styles.inputContainer}>
        <View style={styles.inputRow}>
          <TextInput
            style={styles.textInput}
            placeholder={t("chat.inputPlaceholder", "Escribe un mensaje...")}
            value={newMessage}
            onChangeText={setNewMessage}
            onSubmitEditing={handleSendMessage}
          />
          <TouchableOpacity style={styles.sendButton} onPress={handleSendMessage}>
            <Ionicons name="send" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F2F2F7",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5EA",
    justifyContent: "space-between",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  backButton: {
    marginRight: 8,
    padding: 4,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#E5E5EA",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  avatarImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  avatarFallback: {
    fontSize: 20,
    color: "#007AFF",
    fontWeight: "bold",
  },
  contactInfo: {
    flex: 1,
    justifyContent: "center",
  },
  contactName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#222",
  },
  contactStatus: {
    fontSize: 13,
    color: "#888",
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerButton: {
    marginLeft: 12,
    padding: 4,
  },
  messageContainer: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  myMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#007AFF",
    borderRadius: 16,
    padding: 10,
    marginVertical: 4,
    maxWidth: "80%",
  },
  otherMessage: {
    alignSelf: "flex-start",
    backgroundColor: "#E5E5EA",
    borderRadius: 16,
    padding: 10,
    marginVertical: 4,
    maxWidth: "80%",
  },
  myMessageText: {
    color: "#fff",
    fontSize: 16,
  },
  otherMessageText: {
    color: "#222",
    fontSize: 16,
  },
  messageFooter: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    marginTop: 4,
  },
  timestamp: {
    fontSize: 12,
    marginRight: 4,
  },
  myTimestamp: {
    color: "rgba(255, 255, 255, 0.7)",
  },
  otherTimestamp: {
    color: "rgba(0, 0, 0, 0.5)",
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 4,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginLeft: 1,
  },
  statusSent: {
    backgroundColor: "rgba(255, 255, 255, 0.5)",
  },
  statusDelivered: {
    backgroundColor: "rgba(255, 255, 255, 0.7)",
  },
  statusRead: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
  },
  statusHidden: {
    backgroundColor: "transparent",
  },
  inputContainer: {
    padding: 16,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E5E5EA",
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  inputButton: {
    padding: 8,
  },
  textInput: {
    flex: 1,
    backgroundColor: "#F2F2F7",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 8,
    maxHeight: 100,
    fontSize: 16,
  },
  sendButton: {
    backgroundColor: "#007AFF",
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
});