import React, { useState } from "react";
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
  const [currentScreen, setCurrentScreen] = useState<Screen>("home");
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState("es");
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<{
    name: string;
    avatar?: string;
    members: GroupMember[];
  } | null>(null);
  const [incomingCall, setIncomingCall] = useState<{
    callerName: string;
    callerAvatar?: string;
    isGroupCall?: boolean;
    groupName?: string;
    participantCount?: number;
  } | null>(null);
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

  const handleStartGroupChat = (groupName: string, members: Contact[]) => {
    const groupMembers: GroupMember[] = members.map((member) => ({
      id: member.id,
      name: member.name,
      avatar: member.avatar,
      role: "member" as const,
      isOnline: member.status === "online",
    }));

    groupMembers.unshift({
      id: "me",
      name: "Tú",
      role: "admin",
      isOnline: true,
    });

    setSelectedGroup({
      name: groupName,
      members: groupMembers,
    });
    setCurrentScreen("groupChat");
  };

  const handleBackToHome = () => {
    setCurrentScreen("home");
    setSelectedContact(null);
    setSelectedGroup(null);
  };

  const handleVideoCall = (contactName: string, contactAvatar?: string) => {
    const participants = [
      {
        id: "me",
        name: "Tú",
        isMuted: false,
        isVideoOn: true,
        isMe: true,
      },
      {
        id: "other",
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
      setActiveCall({ participants, isGroupCall: true });
      setIncomingCall(null);
      setCurrentScreen("videoCall");
    }
  };

  const handleEndCall = () => {
    setActiveCall(null);
    setCurrentScreen("home");
  };

  const handleAcceptIncomingCall = () => {
    console.log("Accepting incoming call");
    if (incomingCall) {
      const participants = [
        {
          id: "me",
          name: "Tú",
          isMuted: false,
          isVideoOn: true,
          isMe: true,
        },
        {
          id: "caller",
          name: incomingCall.callerName,
          avatar: incomingCall.callerAvatar,
          isMuted: false,
          isVideoOn: true,
        },
      ];
      setActiveCall({ participants, isGroupCall: incomingCall.isGroupCall });
      setIncomingCall(null);
      setCurrentScreen("videoCall");
    }
  };

  const handleDeclineIncomingCall = () => {
    console.log("Declining incoming call");
    setIncomingCall(null);
    setCurrentScreen("home");
  };

  const simulateIncomingCall = () => {
    setIncomingCall({
      callerName: "Ana García",
      callerAvatar: "https://placekitten.com/40/40",
      isGroupCall: false,
    });
    setCurrentScreen("incomingCall");
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case "home":
        return (
          <View style={styles.homeContainer}>
            <HomeScreen
              onNewChat={handleNewChat}
              onStartChat={handleStartChat}
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
          />
        );
      case "changePassword":
        return <ChangePasswordScreen onBack={handleBackToSettings} />;
      case "profile":
        return <UserProfileScreen onBack={handleBackToSettings} />;
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
              handleVideoCall(selectedContact.name, selectedContact.avatar)
            }
            onVoiceCall={() =>
              console.log("Voice call with", selectedContact.name)
            }
          />
        ) : (
          <HomeScreen onNewChat={handleNewChat} onStartChat={handleStartChat} />
        );
      case "newChat":
        return (
          <NewChatScreen
            onBack={handleBackToHome}
            onStartChat={handleStartChat}
            onCreateGroup={handleCreateGroup}
          />
        );
      case "createGroup":
        return (
          <CreateGroupScreen
            onBack={handleBackToHome}
            onCreateGroup={handleStartGroupChat}
          />
        );
      case "groupChat":
        return selectedGroup ? (
          <GroupChatScreen
            groupName={selectedGroup.name}
            groupAvatar={selectedGroup.avatar}
            members={selectedGroup.members}
            onBack={handleBackToHome}
            onVideoCall={handleGroupVideoCall}
            onVoiceCall={() => console.log("Group voice call")}
            onGroupInfo={() => console.log("Group info")}
          />
        ) : (
          <HomeScreen onNewChat={handleNewChat} onStartChat={handleStartChat} />
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
          <HomeScreen onNewChat={handleNewChat} onStartChat={handleStartChat} />
        );
      case "incomingCall":
        return incomingCall ? (
          <IncomingCallScreen
            callerName={incomingCall.callerName}
            callerAvatar={incomingCall.callerAvatar}
            isGroupCall={incomingCall.isGroupCall}
            groupName={incomingCall.groupName}
            participantCount={incomingCall.participantCount}
            onAccept={handleAcceptIncomingCall}
            onDecline={handleDeclineIncomingCall}
            onMessage={() => console.log("Send message")}
          />
        ) : (
          <HomeScreen onNewChat={handleNewChat} onStartChat={handleStartChat} />
        );
      default:
        return (
          <HomeScreen onNewChat={handleNewChat} onStartChat={handleStartChat} />
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