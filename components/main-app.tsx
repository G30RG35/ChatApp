import React, { useState, useEffect } from "react";
import { useCall } from "../context/CallContext";
import type { CallContextType } from "../context/CallContext";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { HomeScreen } from "./home-screen";
import { SettingsScreen } from "./settings-screen";
import { ChangePasswordScreen } from "./change-password-screen";
import { UserProfileScreen } from "./user-profile-screen";
import { LanguageSelectionScreen } from "./language-selection-screen";
import { LanguageModal } from "./language-modal";
import { SessionModal } from "./session-modal";
import { ChatScreen } from "./chat-screen";
import { NewChatScreen } from "./new-chat-screen";
import { GroupChatScreen } from "./group-chat-screen";
import { CreateGroupScreen } from "./create-group-screen";
import { VideoCallScreen } from "./video-call-screen";
import { IncomingCallScreen } from "./incoming-call-screen";
import { ContactsScreen } from "./contacts-screen";
import { useUser } from "../context/UserContext";
import { api } from "../utils/utils";

type Screen =
  | "home"
  | "contacts"
  | "settings"
  | "changePassword"
  | "profile"
  | "language"
  | "chat"
  | "newChat"
  | "groupChat"
  | "createGroup"
  | "videoCall"
  | "incomingCall";

interface Contact {
  id: string;
  name: string;
  avatar?: string;
  status: "online" | "offline";
  lastSeen?: string;
}

interface GroupMember {
  id: string;
  name: string;
  avatar?: string;
  role: "admin" | "member";
  isOnline: boolean;
}

interface MainAppProps {
  onLogout?: () => void;
}

export function MainApp({ onLogout }: MainAppProps) {
  const { user } = useUser();
  console.log("[main-app] userId actual:", user?.id);
  const callContext = useCall() as CallContextType | null;
  const incomingCall = callContext?.incomingCall;
  const setIncomingCall = callContext?.setIncomingCall;
  useEffect(() => {
    if (incomingCall && setIncomingCall) {
      // fallback para tipos antiguos: incomingCall.from o incomingCall.callerName
      const from = (incomingCall as any).from || (incomingCall as any).callerName || "";
      const participants = [
        {
          id: "me",
          name: "Tú",
          isMuted: false,
          isVideoOn: true,
          isMe: true,
        },
        {
          id: from,
          name: from,
          isMuted: false,
          isVideoOn: true,
        },
      ];
      console.log("[main-app] incomingCall de:", from);
      setActiveCall({ participants, isGroupCall: false });
      setCurrentScreen("videoCall");
      setIncomingCall(null);
    }
  }, [incomingCall, setIncomingCall]);
  const [currentScreen, setCurrentScreen] = useState<Screen>("home");
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState("es");
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<{
    id?: string;
    name: string;
    members: GroupMember[];
    messages: Array<any>;
  } | null>(null);
  // Elimina el estado local de incomingCall y setIncomingCall, usa solo el contexto global
  const [activeCall, setActiveCall] = useState<{
    participants: Array<{
      id: string;
      name: string;
      avatar?: string;
      isMuted: boolean;
      isVideoOn: boolean;
      isMe?: boolean;
    }>;
    isGroupCall?: boolean;
  } | null>(null);

  const handleLogout = () => {
    setShowSessionModal(true);
  };

  const confirmLogout = () => {
    if (onLogout) {
      onLogout();
    }
  };

  const handleOpenProfile = () => {
    setCurrentScreen("profile");
  };

  const handleOpenChangePassword = () => {
    setCurrentScreen("changePassword");
  };

  const handleOpenLanguage = () => {
    setCurrentScreen("language");
  };

  const handleOpenLanguageModal = () => {
    setShowLanguageModal(true);
  };

  const handleLanguageChange = (languageCode: string) => {
    setCurrentLanguage(languageCode);
    console.log("Language changed to:", languageCode);
  };

  const handleBackToSettings = () => {
    setCurrentScreen("settings");
  };

  const handleStartChat = (contact: Contact) => {
    setSelectedContact(contact);
    setCurrentScreen("chat");
  };

  const handleNewChat = () => {
    setCurrentScreen("newChat");
  };

  const handleCreateGroup = () => {
    setCurrentScreen("createGroup");
  };

const handleStartGroupChat = async (conversation: any) => {
  // Carga los mensajes del grupo
  let groupMessages = [];
  try {
    groupMessages = await api.get(`/mensajes/grupo/${conversation.id}`);
  } catch {
    groupMessages = [];
  }

  // Mapea los miembros si tienes esa info, si no, puedes dejarlo vacío
  setSelectedGroup({
    name: conversation.name,
    members: [],
    id: conversation.id,
    messages: groupMessages,
  });
  setCurrentScreen("groupChat");
};

  const handleBackToHome = () => {
    setCurrentScreen("home");
    setSelectedContact(null);
    setSelectedGroup(null);
  };

  const handleVideoCall = (contactName: string, contactAvatar?: string, contactId?: string) => {
    const { user } = useUser();
    const participants = [
      {
        id: user?.id || "", // userId real del usuario actual
        name: "Tú",
        isMuted: false,
        isVideoOn: true,
        isMe: true,
      },
      {
        id: contactId || "", // userId real del contacto
        name: contactName,
        avatar: contactAvatar,
        isMuted: false,
        isVideoOn: true,
      },
    ];
    setActiveCall({ participants, isGroupCall: false });
    setCurrentScreen("videoCall");
  };

  const handleGroupVideoCall = () => {
    if (selectedGroup) {
      const participants = selectedGroup.members.map((member) => ({
        id: member.id,
        name: member.name,
        avatar: member.avatar,
        isMuted: false,
        isVideoOn: true,
        isMe: member.id === "me",
      }));
      console.log("[main-app] ids de miembros del grupo:", selectedGroup.members.map(m => m.id));
      setActiveCall({ participants, isGroupCall: true });
      if (setIncomingCall) setIncomingCall(null);
      setCurrentScreen("videoCall");
    }
  };

  const handleEndCall = () => {
    setActiveCall(null);
    setCurrentScreen("home");
  };

  // handleAcceptIncomingCall y handleDeclineIncomingCall ya no son necesarios, la lógica se maneja en el efecto global

  const simulateIncomingCall = () => {
    if (setIncomingCall) {
      setIncomingCall({
        from: "Ana García",
        roomId: "simulada-123"
      });
    }
    setCurrentScreen("incomingCall");
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case "home":
        return (
          <View style={styles.homeContainer}>
            <HomeScreen
  userId={user?.id}
  onNewChat={handleNewChat}
  onStartChat={handleStartChat}
  onStartGroupChat={handleStartGroupChat}
/>
            {/* <TouchableOpacity
              onPress={simulateIncomingCall}
              style={styles.simulateCallButton}
            >
              <Text style={styles.simulateCallButtonText}>
                📞 Simular llamada
              </Text>
            </TouchableOpacity> */}
          </View>
        );
      case "contacts":
  return (
    <ContactsScreen
      onStartChat={handleStartChat}
      onVoiceCall={(contact) =>
        handleVideoCall(contact.name, contact.avatar)
      }
      userId={user?.id}
    />
  );
      case "settings":
        return (
          <SettingsScreen
            onLogout={handleLogout}
            onOpenProfile={handleOpenProfile}
            onOpenChangePassword={handleOpenChangePassword}
            onOpenLanguage={handleOpenLanguage}
            currentLanguage={currentLanguage}
            onOpenLanguageModal={handleOpenLanguageModal}
            userId={user?.id}
          />
        );
      case "changePassword":
        return <ChangePasswordScreen onBack={handleBackToSettings} userEmail={user?.email} />;
      case "profile":
        return <UserProfileScreen userId={user?.id} onBack={handleBackToSettings} />;
      case "language":
        return (
          <LanguageSelectionScreen
            onBack={handleBackToSettings}
            currentLanguage={currentLanguage}
            onLanguageChange={handleLanguageChange}
          />
        );
      case "chat":
        return selectedContact ? (
          <ChatScreen
            contactName={selectedContact.name}
            contactAvatar={selectedContact.avatar}
            onBack={handleBackToHome}
            onVideoCall={() =>
              handleVideoCall(selectedContact.name, selectedContact.avatar, selectedContact.id)
            }
            onVoiceCall={() =>
              console.log("Voice call with", selectedContact.name)
            }
            conversacionId={`conv-${selectedContact.id}`}
            userId={user?.id}
            contactId={selectedContact.id}
          />
        ) : (
          <HomeScreen userId={user?.id} onNewChat={handleNewChat} onStartChat={handleStartChat} />
        );
      case "newChat":
        return (
          <NewChatScreen
            userId={user?.id}
            onBack={handleBackToHome}
            onStartChat={handleStartChat}
            onCreateGroup={handleCreateGroup}
          />
        );
      case "createGroup":
        return (
          <CreateGroupScreen
            userId={user?.id}
            onBack={handleBackToHome}
            onCreateGroup={handleStartGroupChat}
          />
        );
      case "groupChat":
        return selectedGroup ? (
          <GroupChatScreen
            idGroup={selectedGroup.id || ""}
            groupName={selectedGroup.name}
            members={selectedGroup.members}
            onBack={handleBackToHome}
            onVideoCall={handleGroupVideoCall}
            onVoiceCall={() => console.log("Group voice call")}
            onGroupInfo={() => console.log("Group info")}
          />
        ) : (
          <HomeScreen userId={user?.id} onNewChat={handleNewChat} onStartChat={handleStartChat} />
        );
      case "videoCall":
        return activeCall ? (
          <VideoCallScreen
            participants={activeCall.participants}
            isGroupCall={activeCall.isGroupCall}
            onEndCall={handleEndCall}
            onToggleMute={() => console.log("Toggle mute")}
            onToggleVideo={() => console.log("Toggle video")}
            onOpenChat={() => console.log("Open chat")}
          />
        ) : (
          <HomeScreen userId={user?.id} onNewChat={handleNewChat} onStartChat={handleStartChat} />
        );
      // Elimina la pantalla "incomingCall", ahora el aviso es global
      default:
        return (
          <HomeScreen userId={user?.id} onNewChat={handleNewChat} onStartChat={handleStartChat} />
        );
    }
  };

  const showBottomNav = ![
    "changePassword",
    "profile",
    "language",
    "chat",
    "newChat",
    "groupChat",
    "createGroup",
    "videoCall",
    "incomingCall",
  ].includes(currentScreen);

  return (
    <SafeAreaView style={styles.container}>
      {/* Main Content */}
      <View style={styles.content}>{renderScreen()}</View>

      {/* Bottom Navigation */}
      {showBottomNav && (
        <View style={styles.bottomNav}>
          <TouchableOpacity
            style={[
              styles.navButton,
              currentScreen === "home" && styles.navButtonActive,
            ]}
            onPress={() => setCurrentScreen("home")}
          >
            <Ionicons
              name="chatbubble-outline"
              size={24}
              color={currentScreen === "home" ? "#007AFF" : "#8E8E93"}
            />
            <Text
              style={[
                styles.navText,
                currentScreen === "home" && styles.navTextActive,
              ]}
            >
              Chats
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.navButton,
              currentScreen === "contacts" && styles.navButtonActive,
            ]}
            onPress={() => setCurrentScreen("contacts")}
          >
            <Ionicons
              name="people-outline"
              size={24}
              color={currentScreen === "contacts" ? "#007AFF" : "#8E8E93"}
            />
            <Text
              style={[
                styles.navText,
                currentScreen === "contacts" && styles.navTextActive,
              ]}
            >
              Contactos
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.navButton,
              currentScreen === "settings" && styles.navButtonActive,
            ]}
            onPress={() => setCurrentScreen("settings")}
          >
            <Ionicons
              name="settings-outline"
              size={24}
              color={currentScreen === "settings" ? "#007AFF" : "#8E8E93"}
            />
            <Text
              style={[
                styles.navText,
                currentScreen === "settings" && styles.navTextActive,
              ]}
            >
              Ajustes
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <SessionModal
        isOpen={showSessionModal}
        onClose={() => setShowSessionModal(false)}
        onLogout={confirmLogout}
      />

      <LanguageModal
        isOpen={showLanguageModal}
        onClose={() => setShowLanguageModal(false)}
        currentLanguage={currentLanguage}
        onLanguageChange={handleLanguageChange}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
 container: {marginTop: 20,
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  content: {
    flex: 1,
  },
  homeContainer: {
    flex: 1,
  },
  bottomNav: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: "#E5E5EA",
    backgroundColor: "#FFFFFF",
  },
  navButton: {
    alignItems: "center",
    padding: 8,
    flex: 1,
  },
  navButtonActive: {
    // Active state styling
  },
  navText: {
    fontSize: 12,
    color: "#8E8E93",
    marginTop: 4,
  },
  navTextActive: {
    color: "#007AFF",
    fontWeight: "600",
  },
  simulateCallButton: {
    position: "absolute",
    right: 16,
    bottom: 80,
    backgroundColor: "#007AFF",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 25,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 1000,
  },
  simulateCallButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
});