import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Animated,
  Easing,
} from "react-native";
import { Phone, PhoneOff, MessageCircle, Users } from "lucide-react-native";

interface IncomingCallScreenProps {
  callerName: string;
  callerAvatar?: string;
  isGroupCall?: boolean;
  groupName?: string;
  participantCount?: number;
  onAccept: () => void;
  onDecline: () => void;
  onMessage?: () => void;
}

export function IncomingCallScreen({
  callerName,
  callerAvatar,
  isGroupCall = false,
  groupName,
  participantCount = 1,
  onAccept,
  onDecline,
  onMessage,
}: IncomingCallScreenProps) {
  const [isRinging, setIsRinging] = useState(true);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(0.2)).current;

  useEffect(() => {
    const interval = setInterval(() => {
      setIsRinging((prev) => !prev);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ])
    ).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacityAnim, {
          toValue: 0.4,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0.2,
          duration: 500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const displayName = isGroupCall ? groupName || "Grupo" : callerName;
  const callType = isGroupCall
    ? "Videollamada grupal"
    : "Videollamada entrante";

  return (
    <View style={styles.container}>
      <View style={styles.topSection}>
        <Text style={styles.callType}>{callType}</Text>
        <Text style={styles.displayName}>{displayName}</Text>
        {isGroupCall && participantCount > 1 && (
          <View style={styles.badge}>
            <Users size={16} color="#fff" />
            <Text style={styles.badgeText}>
              {participantCount} participantes
            </Text>
          </View>
        )}

        <View style={styles.avatarWrapper}>
          <Animated.View
            style={[
              styles.ringingBackground,
              { transform: [{ scale: scaleAnim }], opacity: opacityAnim },
            ]}
          />
          {callerAvatar ? (
            <Image source={{ uri: callerAvatar }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarFallback}>
              {isGroupCall ? (
                <Users size={48} color="#fff" />
              ) : (
                <Text style={styles.avatarInitial}>
                  {displayName.charAt(0).toUpperCase()}
                </Text>
              )}
            </View>
          )}
        </View>

        <View style={styles.ringingDots}>
          {[0, 150, 300].map((delay, idx) => (
            <Animated.View
              key={idx}
              style={[
                styles.dot,
                {
                  opacity: isRinging ? 1 : 0.3,
                  transform: [{ scale: isRinging ? 1 : 0.8 }],
                },
              ]}
            />
          ))}
        </View>

        <Text style={styles.infoText}>
          {isGroupCall
            ? "Te están invitando a unirte al grupo"
            : "Te está llamando"}
        </Text>
      </View>

      <View style={styles.bottomSection}>
        {onMessage && (
          <TouchableOpacity style={styles.messageButton} onPress={onMessage}>
            <MessageCircle size={28} color="#fff" />
          </TouchableOpacity>
        )}

        <View style={styles.actions}>
          <TouchableOpacity style={styles.declineButton} onPress={onDecline}>
            <PhoneOff size={32} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.acceptButton} onPress={onAccept}>
            <Phone size={32} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.labels}>
          <Text style={styles.label}>Rechazar</Text>
          <Text style={styles.label}>Aceptar</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
 container: {marginTop: 20,
    flex: 1,
    backgroundColor: "#4f46e5",
    justifyContent: "space-between",
    padding: 24,
  },
  topSection: { alignItems: "center", marginTop: 40 },
  callType: { color: "#e5e7eb", fontSize: 16, marginBottom: 4 },
  displayName: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 8,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 16,
  },
  badgeText: { color: "#fff", marginLeft: 4, fontSize: 14 },
  avatarWrapper: {
    marginBottom: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  ringingBackground: {
    position: "absolute",
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: "#fff",
  },
  avatar: {
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 4,
    borderColor: "rgba(255,255,255,0.3)",
  },
  avatarFallback: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarInitial: { color: "#fff", fontSize: 48, fontWeight: "bold" },
  ringingDots: { flexDirection: "row", gap: 8, marginVertical: 16 },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#fff",
    marginHorizontal: 4,
  },
  infoText: {
    color: "rgba(255,255,255,0.7)",
    textAlign: "center",
    fontSize: 16,
  },
  bottomSection: { alignItems: "center" },
  messageButton: {
    marginBottom: 16,
    backgroundColor: "rgba(255,255,255,0.2)",
    padding: 12,
    borderRadius: 40,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "60%",
    marginBottom: 16,
  },
  declineButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#dc2626",
    justifyContent: "center",
    alignItems: "center",
  },
  acceptButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#16a34a",
    justifyContent: "center",
    alignItems: "center",
  },
  labels: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "60%",
  },
  label: { color: "rgba(255,255,255,0.6)", fontSize: 14 },
});
