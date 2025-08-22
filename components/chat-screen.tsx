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
  Animated
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

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
}

export function ChatScreen({ contactName, contactAvatar, onBack, onVideoCall, onVoiceCall }: ChatScreenProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "¡Hola! ¿Cómo estás?",
      sender: "other",
      timestamp: "10:30",
    },
    {
      id: "2",
      text: "¡Hola! Todo bien, gracias. ¿Y tú qué tal?",
      sender: "me",
      timestamp: "10:32",
      status: "read",
    },
    {
      id: "3",
      text: "Muy bien también. ¿Nos vemos esta tarde?",
      sender: "other",
      timestamp: "10:35",
    },
    {
      id: "4",
      text: "Perfecto, nos vemos a las 5 PM",
      sender: "me",
      timestamp: "10:36",
      status: "delivered",
    },
  ]);
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const scrollToBottom = () => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const message: Message = {
        id: Date.now().toString(),
        text: newMessage,
        sender: "me",
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
              {isTyping ? "Escribiendo..." : "En línea"}
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
              styles.messageBubble,
              message.sender === "me" ? styles.myMessage : styles.otherMessage,
            ]}
          >
            <Text
              style={[
                styles.messageText,
                message.sender === "me" ? styles.myMessageText : styles.otherMessageText,
              ]}
            >
              {message.text}
            </Text>
            <View style={styles.messageFooter}>
              <Text
                style={[
                  styles.timestamp,
                  message.sender === "me" ? styles.myTimestamp : styles.otherTimestamp,
                ]}
              >
                {message.timestamp}
              </Text>
              {message.sender === "me" && message.status && (
                <StatusIndicator status={message.status} />
              )}
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
         
          <TextInput
            style={styles.textInput}
            value={newMessage}
            onChangeText={setNewMessage}
            placeholder="Escribe un mensaje..."
            multiline
            maxLength={500}
          />
            <TouchableOpacity
            style={styles.sendButton}
            onPress={handleSendMessage}
            disabled={!newMessage.trim()}
            >
            <Ionicons name="send" size={20} color="#fff" />
            </TouchableOpacity>
          
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
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E1E1E6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  avatarFallback: {
    color: '#007AFF',
    fontWeight: '600',
    fontSize: 16,
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  contactStatus: {
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
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 18,
    marginBottom: 8,
  },
  myMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#007AFF',
    borderBottomRightRadius: 4,
  },
  otherMessage: {
    alignSelf: 'flex-start',
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