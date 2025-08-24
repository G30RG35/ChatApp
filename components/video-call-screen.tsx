import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
import {
  PhoneOff,
  Mic,
  MicOff,
  Video,
  VideoOff,
  Users,
  Maximize2,
  Minimize2,
  MessageCircle,
} from "lucide-react-native";
import { useTranslation } from "react-i18next";

interface Participant {
  id: string;
  name: string;
  avatar?: string;
  isMuted: boolean;
  isVideoOn: boolean;
  isMe?: boolean;
}

interface VideoCallScreenProps {
  participants: Participant[];
  isGroupCall?: boolean;
  onEndCall: () => void;
  onToggleMute?: () => void;
  onToggleVideo?: () => void;
  onOpenChat?: () => void;
}

export function VideoCallScreen({
  participants,
  isGroupCall = false,
  onEndCall,
  onToggleMute,
  onToggleVideo,
  onOpenChat,
}: VideoCallScreenProps) {
  const { t } = useTranslation();
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [showControls, setShowControls] = useState(true);

  const me = participants.find((p) => p.isMe) || participants[0];
  const others = participants.filter((p) => !p.isMe);

  useEffect(() => {
    const timer = setInterval(() => setCallDuration((prev) => prev + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (showControls) {
      timeout = setTimeout(() => setShowControls(false), 3000);
    }
    return () => clearTimeout(timeout);
  }, [showControls]);

  const handleToggleMute = () => {
    setIsMuted(!isMuted);
    onToggleMute?.();
  };

  const handleToggleVideo = () => {
    setIsVideoOn(!isVideoOn);
    onToggleVideo?.();
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const handleScreenClick = () => setShowControls(true);

  return (
    <View style={styles.container} onTouchStart={handleScreenClick}>
      {/* Main Video Area */}
      <View style={styles.videoArea}>
        {isVideoOn ? (
          <View style={styles.videoPlaceholder}>
            <Text style={styles.avatarFallback}>
              {others[0]?.name?.charAt(0).toUpperCase() || "U"}
            </Text>
            <Text style={styles.videoName}>{others[0]?.name || t("videoCall.user", "Usuario")}</Text>
          </View>
        ) : (
          <View style={styles.videoOff}>
            <VideoOff size={32} color="#9ca3af" />
            <Text style={styles.videoOffText}>{t("videoCall.cameraOff", "Cámara desactivada")}</Text>
          </View>
        )}

        {/* Group Call Participants */}
        {isGroupCall && others.length > 1 && (
          <View style={styles.groupParticipants}>
            {others.slice(1, 4).map((p) => (
              <View key={p.id} style={styles.participantCard}>
                {p.isVideoOn ? (
                  <View style={styles.participantVideo}>
                    <Text style={styles.avatarFallback}>
                      {p.name.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                ) : (
                  <View style={styles.participantVideoOff}>
                    <VideoOff size={16} color="#9ca3af" />
                  </View>
                )}
                <Text style={styles.participantName} numberOfLines={1}>
                  {p.name}
                </Text>
                {p.isMuted && (
                  <MicOff size={12} color="#f87171" style={styles.mutedIcon} />
                )}
              </View>
            ))}
            {others.length > 4 && (
              <View style={styles.participantCard}>
                <Users size={16} color="#fff" />
                <Text style={styles.participantName}>+{others.length - 3}</Text>
              </View>
            )}
          </View>
        )}

        {/* Self Video */}
        <View style={styles.selfVideoCard}>
          {isVideoOn ? (
            <Text style={styles.avatarFallback}>
              {me?.name?.charAt(0).toUpperCase() || "M"}
            </Text>
          ) : (
            <VideoOff size={16} color="#9ca3af" />
          )}
          {isMuted && (
            <MicOff size={12} color="#f87171" style={styles.selfMutedIcon} />
          )}
        </View>
      </View>

      {/* Top Bar */}
      {showControls && (
        <View style={styles.topBar}>
          <Text style={styles.durationBadge}>
            {formatDuration(callDuration)}
          </Text>
          {isGroupCall && (
            <Text style={styles.participantsBadge}>
              {participants.length} {t("videoCall.participants", "participantes")}
            </Text>
          )}
          <View style={styles.topButtons}>
            <TouchableOpacity onPress={() => setIsFullscreen(!isFullscreen)}>
              {isFullscreen ? (
                <Minimize2 size={16} color="#fff" />
              ) : (
                <Maximize2 size={16} color="#fff" />
              )}
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Bottom Controls */}
      {showControls && (
        <View style={styles.bottomBar}>
          <TouchableOpacity
            style={[styles.controlButton, isMuted && styles.controlActive]}
            onPress={handleToggleMute}
          >
            {isMuted ? (
              <MicOff size={20} color="#fff" />
            ) : (
              <Mic size={20} color="#fff" />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.controlButton, !isVideoOn && styles.controlActive]}
            onPress={handleToggleVideo}
          >
            {isVideoOn ? (
              <Video size={20} color="#fff" />
            ) : (
              <VideoOff size={20} color="#fff" />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.controlButtonEnd]}
            onPress={onEndCall}
          >
            <PhoneOff size={24} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.controlButton} onPress={onOpenChat}>
            <MessageCircle size={20} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.controlButton}>
            <Users size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
 container: {marginTop: 20, flex: 1, backgroundColor: "#000" },
  videoArea: { flex: 1, position: "relative" },
  videoPlaceholder: { flex: 1, justifyContent: "center", alignItems: "center" },
  avatarFallback: { fontSize: 32, fontWeight: "bold", color: "#fff" },
  videoName: { color: "#fff", fontSize: 18, marginTop: 8 },
  videoOff: { flex: 1, justifyContent: "center", alignItems: "center" },
  videoOffText: { color: "#9ca3af", marginTop: 8 },
  groupParticipants: {
    position: "absolute",
    top: 16,
    right: 16,
    flexDirection: "column",
    gap: 8,
  },
  participantCard: {
    width: 60,
    height: 80,
    backgroundColor: "#1f2937",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  participantVideo: { flex: 1, justifyContent: "center", alignItems: "center" },
  participantVideoOff: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#374151",
  },
  participantName: { fontSize: 10, color: "#fff", marginTop: 2 },
  mutedIcon: { position: "absolute", top: 2, right: 2 },
  selfVideoCard: {
    position: "absolute",
    bottom: 16,
    right: 16,
    width: 80,
    height: 100,
    backgroundColor: "#1f2937",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  selfMutedIcon: { position: "absolute", top: 2, right: 2 },
  topBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    padding: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  durationBadge: {
    color: "#fff",
    backgroundColor: "#059669",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    fontSize: 12,
  },
  participantsBadge: {
    color: "#fff",
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    fontSize: 12,
  },
  topButtons: { flexDirection: "row", gap: 8 },
  bottomBar: {
    position: "absolute",
    bottom: 16,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    gap: 16,
  },
  controlButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#4b5563",
    justifyContent: "center",
    alignItems: "center",
  },
  controlActive: { backgroundColor: "#dc2626" },
  controlButtonEnd: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#dc2626",
    justifyContent: "center",
    alignItems: "center",
  },
});
