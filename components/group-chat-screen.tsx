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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

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
  groupName: string;
  groupAvatar?: string;
  members: GroupMember[];
  onBack: () => void;
  onVideoCall?: () => void;
  onVoiceCall?: () => void;
  onGroupInfo?: () => void;
}

export function GroupChatScreen({
  groupName,
  groupAvatar,
  members,
  onBack,
  onVideoCall,
  onVoiceCall,
  onGroupInfo,
}: GroupChatScreenProps) {
  const [messages, setMessages] = useState<GroupMessage[]>([
    {
      id: "1",
      text: "¡Hola equipo! ¿Cómo van con el proyecto?",
      sender: {
        id: "1",
        name: "Ana García",
        avatar: "https://placekitten.com/32/32",
      },
      timestamp: "10:30",
    },
    {
      id: "2",
      text: "Todo bien por aquí, ya terminé mi parte",
      sender: {
        id: "2",
        name: "Carlos López",
        avatar: "https://placekitten.com/32/32",
      },
      timestamp: "10:32",
    },
    {
      id: "3",
      text: "Perfecto, yo también estoy casi listo",
      sender: {
        id: "me",
        name: "Tú",
      },
      timestamp: "10:35",
      status: "read",
    },
    {
      id: "4",
      text: "Genial, entonces podemos hacer la reunión mañana",
      sender: {
        id: "3",
        name: "María Rodríguez",
        avatar: "https://placekitten.com/32/32",
      },
      timestamp: "10:36",
    },
  ]);
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState<string[]>([]);
  const scrollViewRef = useRef<ScrollView>(null);

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
          name: "Tú",
        },
        timestamp: new Date().toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" }),
        status: "sent",
      };
      setMessages([...messages, message]);
      setNewMessage("");
    }
  };

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

  const AvatarComponent = ({ name, avatar, size = 40 }: { name: string, avatar?: string, size?: number }) => {
    const initials = name.charAt(0).toUpperCase();
    
    return (
      <View style={[styles.avatar, { width: size, height: size, borderRadius: size / 2 }]}>
        {avatar ? (
          <Image source={{ uri: avatar }} style={[styles.avatarImage, { width: size, height: size, borderRadius: size / 2 }]} />
        ) : (
          <Text style={[styles.avatarFallback, { fontSize: size * 0.4 }]}>{initials}</Text>
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
  const typingText = isTyping.length > 0 ? `${isTyping.join(", ")} escribiendo...` : `${onlineMembers.length} en línea`;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#007AFF" />
          </TouchableOpacity>
          <TouchableOpacity onPress={onGroupInfo} style={styles.groupInfoButton}>
            <GroupAvatarComponent />
            <View style={styles.groupInfo}>
              <Text style={styles.groupName} numberOfLines={1}>{groupName}</Text>
              <Text style={styles.groupStatus} numberOfLines={1}>{typingText}</Text>
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
          <TouchableOpacity onPress={onGroupInfo} style={styles.headerButton}>
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
        {messages.map((message) => (
          <View
            key={message.id}
            style={[
              styles.messageContainer,
              message.sender.id === "me" ? styles.myMessageContainer : styles.otherMessageContainer,
            ]}
          >
            {message.sender.id !== "me" && (
              <AvatarComponent 
                name={message.sender.name} 
                avatar={message.sender.avatar} 
                size={32} 
              />
            )}
            <View style={styles.messageContent}>
              {message.sender.id !== "me" && (
                <Text style={styles.senderName}>{message.sender.name}</Text>
              )}
              <View
                style={[
                  styles.messageBubble,
                  message.sender.id === "me" ? styles.myMessage : styles.otherMessage,
                ]}
              >
                <Text
                  style={[
                    styles.messageText,
                    message.sender.id === "me" ? styles.myMessageText : styles.otherMessageText,
                  ]}
                >
                  {message.text}
                </Text>
                <View style={styles.messageFooter}>
                  <Text
                    style={[
                      styles.timestamp,
                      message.sender.id === "me" ? styles.myTimestamp : styles.otherTimestamp,
                    ]}
                  >
                    {message.timestamp}
                  </Text>
                  {message.sender.id === "me" && message.status && (
                    <StatusIndicator status={message.status} />
                  )}
                </View>
              </View>
            </View>
          </View>
        ))}
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
            placeholder="Escribe un mensaje..."
            multiline
            maxLength={500}
          />
          <TouchableOpacity style={styles.inputButton}>
            <Ionicons name="happy" size={24} color="#8E8E93" />
          </TouchableOpacity>
          {newMessage.trim() ? (
            <TouchableOpacity onPress={handleSendMessage} style={styles.sendButton}>
              <Ionicons name="send" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.inputButton}>
              <Ionicons name="mic" size={24} color="#8E8E93" />
            </TouchableOpacity>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
 container: {marginTop: 20,
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  backButton: {
    marginRight: 16,
  },
  groupInfoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  groupAvatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    backgroundColor: '#E1E1E6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarImage: {
    resizeMode: 'cover',
  },
  avatarFallback: {
    color: '#007AFF',
    fontWeight: '600',
  },
  memberCountBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    backgroundColor: '#007AFF',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  memberCountText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  groupInfo: {
    flex: 1,
  },
  groupName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  groupStatus: {
    fontSize: 14,
    color: '#8E8E93',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
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
    flexDirection: 'row',
    marginBottom: 16,
  },
  myMessageContainer: {
    justifyContent: 'flex-end',
  },
  otherMessageContainer: {
    justifyContent: 'flex-start',
  },
  messageContent: {
    maxWidth: '80%',
    marginLeft: 8,
  },
  senderName: {
    fontSize: 12,
    color: '#8E8E93',
    marginBottom: 4,
    marginLeft: 8,
  },
  messageBubble: {
    padding: 12,
    borderRadius: 18,
  },
  myMessage: {
    backgroundColor: '#007AFF',
    borderBottomRightRadius: 4,
  },
  otherMessage: {
    backgroundColor: '#E5E5EA',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  myMessageText: {
    color: '#FFFFFF',
  },
  otherMessageText: {
    color: '#000000',
  },
  messageFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 4,
  },
  timestamp: {
    fontSize: 12,
    marginRight: 4,
  },
  myTimestamp: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  otherTimestamp: {
    color: 'rgba(0, 0, 0, 0.5)',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginLeft: 1,
  },
  statusSent: {
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  statusDelivered: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
  },
  statusRead: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  statusHidden: {
    backgroundColor: 'transparent',
  },
  inputContainer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputButton: {
    padding: 8,
  },
  textInput: {
    flex: 1,
    backgroundColor: '#F2F2F7',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 8,
    maxHeight: 100,
    fontSize: 16,
  },
  sendButton: {
    backgroundColor: '#007AFF',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
});