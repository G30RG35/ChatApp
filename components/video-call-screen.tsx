import React, { useState, useEffect } from "react";
import { Modal } from "react-native";
import { RTCView } from "react-native-webrtc";
import { useWebRTC } from "../utils/useWebRTC";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
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

  // Suponiendo que el usuario actual es el primero con isMe
  const me = participants.find((p: Participant) => p.isMe) || participants[0];
  const others = participants.filter((p: Participant) => !p.isMe);
  console.log("[video-call-screen] userId actual:", me?.id);
  console.log("[video-call-screen] ids de otros participantes:", others.map(p => p.id));

  // WebRTC hook
  // roomId y userId deben ser pasados como props reales en integración final
  const roomId = me?.id || "room-demo";
  const userId = me?.id || "user-demo";
  // Determinar los destinatarios: para llamadas grupales, todos menos yo; para 1:1, solo el peer
  let callTargets: string | string[] | undefined = undefined;
  if (isGroupCall) {
    callTargets = others.map((p) => p.id);
  } else {
    callTargets = others[0]?.id;
  }
  // Explicitly type localStream and remoteStream as MediaStream | null
  const {
    localStream,
    remoteStream,
    connected,
    incomingCall,
    startCall,
    endCall,
    acceptCall,
    rejectCall,
  } = useWebRTC(roomId, userId, callTargets) as any;

  // Iniciar llamada automáticamente al entrar a la vista si soy el iniciador
  useEffect(() => {
    // Lógica: si no hay llamada conectada ni entrante, inicia la llamada
    if (!connected && !incomingCall) {
      startCall();
    }
    // Solo se ejecuta una vez al montar
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [callTargets]);

  useEffect(() => {
    const timer = setInterval(
      () => setCallDuration((prev: number) => prev + 1),
      1000
    );
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    if (showControls) {
      timeout = setTimeout(() => setShowControls(false), 3000);
    }
    return () => clearTimeout(timeout);
  }, [showControls]);

  // Mute y video controlados localmente y en el stream
  const handleToggleMute = () => {
    if (localStream && typeof localStream.getAudioTracks === "function") {
      localStream.getAudioTracks().forEach((track: any) => {
        track.enabled = isMuted;
      });
    }
    setIsMuted((prev: boolean) => !prev);
    onToggleMute?.();
  };

  const handleToggleVideo = () => {
    if (localStream) {
      localStream.getVideoTracks().forEach((track: any) => {
        track.enabled = !isVideoOn;
      });
    }
    setIsVideoOn((prev: boolean) => !prev);
    onToggleVideo?.();
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    // @ts-ignore
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const handleScreenClick = () => setShowControls(true);

  return (
    <View style={styles.container} onTouchStart={handleScreenClick}>
      {/* Modal de llamada entrante */}
      <Modal
        visible={!!incomingCall}
        transparent
        animationType="fade"
        onRequestClose={rejectCall}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {t("videoCall.incoming", "Llamada entrante")}
            </Text>
            <Text style={styles.modalFrom}>
              {incomingCall?.from
                ? `${t("videoCall.from", "De")} ${incomingCall.from}`
                : ""}
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.controlButton, styles.controlActive]}
                onPress={rejectCall}
              >
                <PhoneOff size={24} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.controlButton, { backgroundColor: "#059669" }]}
                onPress={acceptCall}
              >
                <Video size={24} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      {/* Main Video Area */}
      <View style={styles.videoArea}>
        {/* Video remoto */}
        {remoteStream ? (
          <RTCView
            streamURL={(remoteStream as any).toURL()}
            style={{ flex: 1, backgroundColor: "#222" }}
            objectFit="cover"
          />
        ) : (
          <View style={styles.videoPlaceholder}>
            <Text style={styles.avatarFallback}>
              {others[0]?.name?.charAt(0).toUpperCase() || "U"}
            </Text>
            <Text style={styles.videoName}>
              {others[0]?.name || t("videoCall.user", "Usuario")}
            </Text>
          </View>
        )}

        {/* Group Call Participants (solo UI, no video real aún) */}
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

        {/* Self Video siempre visible, incluso antes de conectar */}
        <View style={styles.selfVideoCard} pointerEvents="none">
          {localStream ? (
            <RTCView
              streamURL={(localStream as any).toURL()}
              style={styles.selfVideo}
              objectFit="cover"
            />
          ) : (
            <Text style={styles.avatarFallback}>
              {me?.name?.charAt(0).toUpperCase() || "M"}
            </Text>
          )}
          {isMuted && (
            <MicOff size={12} color="#f87171" style={styles.selfMutedIcon} />
          )}
        </View>

        {/* Top Bar */}
        {showControls && (
          <View style={styles.topBar}>
            <Text style={styles.durationBadge}>
              {formatDuration(callDuration)}
            </Text>
            {isGroupCall && (
              <Text style={styles.participantsBadge}>
                {participants.length}{" "}
                {t("videoCall.participants", "participantes")}
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
            {/* Botón de mute */}
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

            {/* Botón de video on/off */}
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

            {/* Botón de colgar: termina la llamada y ejecuta onEndCall */}
            <TouchableOpacity
              style={[styles.controlButtonEnd]}
              onPress={() => {
                endCall();
                onEndCall();
              }}
            >
              <PhoneOff size={24} color="#fff" />
            </TouchableOpacity>

            {/* Botón para abrir chat */}
            <TouchableOpacity style={styles.controlButton} onPress={onOpenChat}>
              <MessageCircle size={20} color="#fff" />
            </TouchableOpacity>

            {/* Botón para iniciar llamada eliminado: ahora la llamada inicia automáticamente al entrar a la vista */}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#1f2937",
    borderRadius: 16,
    padding: 32,
    alignItems: "center",
    width: 300,
  },
  modalTitle: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 12,
  },
  modalFrom: {
    color: "#fff",
    fontSize: 16,
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: "row",
    gap: 32,
  },
  container: { marginTop: 20, flex: 1, backgroundColor: "#000" },
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
    width: 100,
    height: 140,
    backgroundColor: "#1f2937",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
    overflow: "hidden",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  selfVideo: {
    width: "100%",
    height: "100%",
    borderRadius: 12,
    backgroundColor: "#222",
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
