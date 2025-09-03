import React, { useState, useRef, useEffect } from "react";
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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { api } from "../utils/utils";
import { GroupInfoModal } from "./GroupInfoModal";

interface GroupMessage {
  id: string;
  text: string;
  sender: {
    id: string;
    name: string;
    avatar?: string;
  };
  timestamp: string;
  status?: "sent" | "delivered" | "read";
}

interface GroupMember {
  id: string;
  name: string;
  avatar?: string;
  role: "admin" | "member";
  isOnline: boolean;
}

interface GroupChatScreenProps {
  idGroup: string;
  groupName: string;
  groupAvatar?: string;
  members: GroupMember[];
  onBack: () => void;
  onVideoCall?: () => void;
  onVoiceCall?: () => void;
  onGroupInfo?: () => void;
}

const mensajesFake = [
  {
    id: "m1",
    conversation_id: "aaaa1111-aaaa-1111-aaaa-111111111111",
    sender_id: "11111111-1111-1111-1111-111111111111", // Pedro
    sender_name: "Pedro",
    sender_avatar: "",
    content: "¡Hola a todos, soy Pedro!",
    tipo: "text",
    created_at: new Date(),
    status: "sent",
  },
  {
    id: "m2",
    conversation_id: "aaaa1111-aaaa-1111-aaaa-111111111111",
    sender_id: "22222222-2222-2222-2222-222222222222", // Bob
    sender_name: "Bob",
    sender_avatar: "",
    content: "¡Hola Pedro! Soy Bob.",
    tipo: "text",
    created_at: new Date(),
    status: "sent",
  }
];

export function GroupChatScreen({
  idGroup,
  groupName,
  groupAvatar,
  members,
  onBack,
  onVideoCall,
  onVoiceCall,
  onGroupInfo,
}: GroupChatScreenProps) {
  const { t, i18n } = useTranslation();
  const [messages, setMessages] = useState<GroupMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState<string[]>([]);
  const [showInfo, setShowInfo] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  // Cargar mensajes al montar el componente o cuando cambia el idGroup
  useEffect(() => {
    // Simula la carga de mensajes usando mensajesFake
    const mapped = mensajesFake.map((msg: any) => ({
      id: msg.id,
      text: msg.content || msg.text,
      sender: {
        id: msg.sender_id || msg.remitente_id,
        name: msg.sender_name || msg.remitente_name || "Desconocido",
        avatar: msg.sender_avatar || "",
      },
      timestamp: msg.created_at
        ? new Date(msg.created_at).toLocaleTimeString(
            i18n.language === "en" ? "en-US" : "es-ES",
            { hour: "2-digit", minute: "2-digit" }
          )
        : "",
      status: msg.status || "sent",
    }));
    setMessages(mapped);
  }, [idGroup, i18n.language]);

  const scrollToBottom = () => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const message: GroupMessage = {
        id: Date.now().toString(),
        text: newMessage,
        sender: {
          id: "me",
          name: t("groupChat.you", "Tú"),
        },
        timestamp: new Date().toLocaleTimeString(
          i18n.language === "en" ? "en-US" : "es-ES",
          { hour: "2-digit", minute: "2-digit" }
        ),
        status: "sent",
      };
      setMessages([...messages, message]);
      setNewMessage("");
    }
  };

  const StatusIndicator = ({
    status,
  }: {
    status: "sent" | "delivered" | "read";
  }) => {
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

  const AvatarComponent = ({
    name,
    avatar,
    size = 40,
  }: {
    name: string;
    avatar?: string;
    size?: number;
  }) => {
    const initials = name.charAt(0).toUpperCase();
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

  const GroupAvatarComponent = () => {
    return (
      <View style={styles.groupAvatarContainer}>
        <AvatarComponent name={groupName} avatar={groupAvatar} size={40} />
        <View style={styles.memberCountBadge}>
          <Text style={styles.memberCountText}>{members.length}</Text>
        </View>
      </View>
    );
  };

  const onlineMembers = members.filter((member) => member.isOnline);
  const typingText =
    isTyping.length > 0
      ? `${isTyping.join(", ")} ${t("groupChat.typing", "escribiendo...")}`
      : `${onlineMembers.length} ${t("groupChat.online", "en línea")}`;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#007AFF" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setShowInfo(true)}
            style={styles.groupInfoButton}
          >
            <GroupAvatarComponent />
            <View style={styles.groupInfo}>
              <Text style={styles.groupName} numberOfLines={1}>
                {groupName}
              </Text>
              <Text style={styles.groupStatus} numberOfLines={1}>
                {typingText}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity onPress={onVoiceCall} style={styles.headerButton}>
            <Ionicons name="call" size={24} color="#007AFF" />
          </TouchableOpacity>
          <TouchableOpacity onPress={onVideoCall} style={styles.headerButton}>
            <Ionicons name="videocam" size={24} color="#007AFF" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setShowInfo(true)}
            style={styles.headerButton}
          >
            <Ionicons name="ellipsis-vertical" size={24} color="#007AFF" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Messages */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
      >
        {messages.map((message) => {
          const isMine = message.sender.id === "me";
          return (
            <View
              key={message.id}
              style={[
                styles.messageContainer,
                isMine ? styles.myMessageContainer : styles.otherMessageContainer,
              ]}
            >
              <View
                style={[
                  styles.messageContent,
                  isMine
                    ? { marginLeft: 0, marginRight: 8, alignSelf: "flex-end" }
                    : { marginLeft: 8, marginRight: 0, alignSelf: "flex-start" },
                ]}
              >
                {!isMine && (
                  <Text style={styles.senderName}>{message.sender.name}</Text>
                )}
                <View
                  style={[
                    styles.messageBubble,
                    isMine ? styles.myMessage : styles.otherMessage,
                  ]}
                >
                  <Text
                    style={[
                      styles.messageText,
                      isMine ? styles.myMessageText : styles.otherMessageText,
                    ]}
                  >
                    {message.text}
                  </Text>
                  <View style={styles.messageFooter}>
                    <Text
                      style={[
                        styles.timestamp,
                        isMine ? styles.myTimestamp : styles.otherTimestamp,
                      ]}
                    >
                      {message.timestamp}
                    </Text>
                    {isMine && message.status && (
                      <StatusIndicator status={message.status} />
                    )}
                  </View>
                </View>
              </View>
            </View>
          );
        })}
      </ScrollView>

      {/* Input */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.inputContainer}
      >
        <View style={styles.inputRow}>
          <TouchableOpacity style={styles.inputButton}>
            <Ionicons name="attach" size={24} color="#8E8E93" />
          </TouchableOpacity>
          <TextInput
            style={styles.textInput}
            value={newMessage}
            onChangeText={setNewMessage}
            placeholder={t(
              "groupChat.inputPlaceholder",
              "Escribe un mensaje..."
            )}
            multiline
            maxLength={500}
          />
          <TouchableOpacity style={styles.inputButton}>
            <Ionicons name="happy" size={24} color="#8E8E93" />
          </TouchableOpacity>
          {newMessage.trim() ? (
            <TouchableOpacity
              onPress={handleSendMessage}
              style={styles.sendButton}
            >
              <Ionicons name="send" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.inputButton}>
              <Ionicons name="mic" size={24} color="#8E8E93" />
            </TouchableOpacity>
          )}
        </View>
      </KeyboardAvoidingView>

      {/* Group Info Modal */}
      <GroupInfoModal
        visible={showInfo}
        onClose={() => setShowInfo(false)}
        groupName={groupName}
        groupAvatar={groupAvatar}
        members={members}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: 20, flex: 1, backgroundColor: "#F2F2F7" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5EA",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  backButton: {
    marginRight: 16,
  },
  groupInfoButton: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  groupAvatarContainer: {
    position: "relative",
    marginRight: 12,
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
  memberCountBadge: {
    position: "absolute",
    bottom: -4,
    right: -4,
    backgroundColor: "#007AFF",
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  memberCountText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  groupInfo: {
    flex: 1,
  },
  groupName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000000",
  },
  groupStatus: {
    fontSize: 14,
    color: "#8E8E93",
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerButton: {
    padding: 8,
    marginLeft: 8,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
  },
  messageContainer: {
    flexDirection: "row",
    marginBottom: 16,
    width: "100%", // <-- NUEVO
  },
  myMessageContainer: {
    flexDirection: "row-reverse",
    marginBottom: 16,
    justifyContent: "flex-end",
    alignItems: "flex-end", // <-- NUEVO
  },
  otherMessageContainer: {
    flexDirection: "row",
    marginBottom: 16,
    justifyContent: "flex-start",
    alignItems: "flex-start", // <-- NUEVO
  },
  messageContent: {
    maxWidth: "80%",
  },
  senderName: {
    fontSize: 12,
    color: "#8E8E93",
    marginBottom: 4,
    marginLeft: 8,
  },
  messageBubble: {
    padding: 12,
    borderRadius: 18,
  },
  myMessage: {
    backgroundColor: "#007AFF",
    borderBottomRightRadius: 4,
  },
  otherMessage: {
    backgroundColor: "#E5E5EA",
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  myMessageText: {
    color: "#FFFFFF",
  },
  otherMessageText: {
    color: "#000000",
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
