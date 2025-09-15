
import { useEffect, useRef, useState } from "react";
import { Platform } from "react-native";
import io, { Socket } from "socket.io-client";
import {
  RTCPeerConnection,
  RTCSessionDescription,
  RTCIceCandidate,
  mediaDevices,
  MediaStream,
} from "react-native-webrtc";
import { Camera } from "expo-camera";

// Usa la IP local de tu PC para que los dispositivos móviles puedan conectarse
const SIGNALING_SERVER_URL = "http://192.168.1.98:3000"; // Cambia por tu IP local real

  // Define your hook to accept roomId, userId, peerId, and onIncomingCall as parameters
  export function useWebRTC(
    roomId: string,
    userId: string,
    peerId?: string | string[],
    onIncomingCall?: (from: string) => void
  ) {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [connected, setConnected] = useState(false);
  // Controla si este peer es el offerer
  const [isOfferer, setIsOfferer] = useState(false);
  // Estado para llamada entrante
  const [incomingCall, setIncomingCall] = useState<{ from: string } | null>(null);

    // DEBUG: Log roomId y userId al iniciar
    useEffect(() => {
      console.log('[WebRTC] useWebRTC iniciado con roomId:', roomId, 'userId:', userId);
    }, [roomId, userId]);
    const socketRef = useRef<Socket | null>(null);
    const peerRef = useRef<RTCPeerConnection | null>(null);
    const pendingOfferRef = useRef<any>(null);
    // Buffer para ICE candidates recibidos antes de tener remoteDescription
    const pendingCandidatesRef = useRef<any[]>([]);
  useEffect(() => {
    socketRef.current = io(SIGNALING_SERVER_URL);
    console.log("[WebRTC] Conectando a señalización:", SIGNALING_SERVER_URL);
  socketRef.current.emit("join", roomId, userId);
  console.log("[WebRTC] Unido a sala:", roomId, 'userId:', userId);

    // Solicitar permisos antes de acceder a la cámara/micrófono
    async function requestPermissionsAndStream() {
      try {
        if (Platform.OS === "android" || Platform.OS === "ios") {
          const { status: cameraStatus } = await Camera.requestCameraPermissionsAsync();
          const { status: micStatus } = await Camera.requestMicrophonePermissionsAsync();
          if (cameraStatus !== "granted" || micStatus !== "granted") {
            throw new Error("Permisos de cámara o micrófono denegados");
          }
        }
      } catch (err) {
        console.error("[WebRTC] Error solicitando permisos:", err);
        return;
      }

      // Obtener stream local solo si los permisos fueron concedidos
      mediaDevices
        .getUserMedia({ audio: true, video: true })
        .then((stream: MediaStream) => {
          setLocalStream(stream);
          console.log("[WebRTC] Stream local obtenido", stream);
          // DEBUG: Log tracks
          console.log('[WebRTC] Tracks de stream local:', stream.getTracks().map((t: any) => t.kind + ':' + t.id));
        })
        .catch((err) => {
          console.error("[WebRTC] Error obteniendo stream local:", err);
        });
    }

    requestPermissionsAndStream();

    // --- LISTENERS ÚNICOS Y ROBUSTOS ---
    if (socketRef.current) {
      // Aviso de llamada entrante
      socketRef.current.on("incoming-call", ({ from }: { from: string }) => {
        console.log("[WebRTC] Llamada entrante de:", from);
        setIncomingCall({ from });
        if (onIncomingCall) onIncomingCall(from);
      });

      // Oferta recibida
      socketRef.current.on("webrtc-offer", async ({ offer, from }: { offer: any; from: string }) => {
        console.log("[WebRTC] Recibida oferta de:", from);
        setIsOfferer(false); // Este peer será answerer
        if (!localStream) {
          pendingOfferRef.current = { offer, from };
          return;
        }
        handleReceivedOffer({ offer, from });
      });

      // Respuesta recibida
      socketRef.current.on("webrtc-answer", async ({ answer }: { answer: any }) => {
        console.log("[WebRTC] Recibida respuesta", answer);
        if (peerRef.current) {
          await peerRef.current.setRemoteDescription(new RTCSessionDescription(answer));
          console.log('[WebRTC] setRemoteDescription(answer) OK');
          // Procesar ICE candidates pendientes
          if (pendingCandidatesRef.current.length > 0) {
            for (const c of pendingCandidatesRef.current) {
              try {
                await peerRef.current.addIceCandidate(new RTCIceCandidate(c));
                console.log('[WebRTC] ICE candidate del buffer agregado');
              } catch (e) {
                console.error("[WebRTC] Error agregando ICE candidate (buffer):", e);
              }
            }
            pendingCandidatesRef.current = [];
          }
        } else {
          console.warn('[WebRTC] peerRef.current no existe al recibir answer');
        }
      });

      // ICE candidate recibido
      socketRef.current.on("webrtc-ice-candidate", async ({ candidate }: { candidate: any }) => {
        console.log("[WebRTC] Recibido ICE candidate");
        if (peerRef.current && peerRef.current.remoteDescription) {
          try {
            await peerRef.current.addIceCandidate(new RTCIceCandidate(candidate));
          } catch (e) {
            console.error("[WebRTC] Error agregando ICE candidate:", e);
          }
        } else {
          pendingCandidatesRef.current.push(candidate);
          console.log("[WebRTC] ICE candidate bufferizado");
        }
      });
    }

    return () => {
      socketRef.current?.disconnect();
      if (peerRef.current) peerRef.current.close();
    };
    // eslint-disable-next-line
  }, [roomId, userId]);

  // Función para manejar ofertas recibidas
  // Lógica anti-colisión de ofertas (glare):
  // Si recibo una oferta mientras soy offerer, comparo userId y solo el de menor id responde
  // Solo responde a la oferta, nunca crea una nueva oferta aquí
  async function handleReceivedOffer({ offer, from }: { offer: any; from: string }) {
    if (peerRef.current) {
      (peerRef.current as RTCPeerConnection).close();
      peerRef.current = null;
    }
    createPeer(false); // answerer
    const peer = peerRef.current as RTCPeerConnection | null;
    if (peer) {
      await peer.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await peer.createAnswer();
      await peer.setLocalDescription(answer);
      socketRef.current?.emit("webrtc-answer", {
        roomId,
        answer,
        to: from,
        from: userId,
      });
      setConnected(true);
    }
  }

  // Procesar oferta pendiente cuando localStream esté listo
  // Si hay una oferta pendiente y ya tengo localStream, respóndela automáticamente
  useEffect(() => {
    if (localStream && pendingOfferRef.current) {
      handleReceivedOffer(pendingOfferRef.current);
      pendingOfferRef.current = null;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localStream]);

  // (Removed duplicate effect and handlers that referenced roomId out of scope)

  function createPeer(isInitiator: boolean) {
    peerRef.current = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });
    // ICE candidates
    (peerRef.current as any).onicecandidate = (event: any) => {
      if (event.candidate) {
        socketRef.current?.emit("webrtc-ice-candidate", {
          roomId,
          candidate: event.candidate,
          from: userId,
        });
      }
    };
    // Remote track
    (peerRef.current as any).ontrack = (event: any) => {
      if (event.streams && event.streams[0]) {
        setRemoteStream(event.streams[0] as any);
        console.log("[WebRTC] Stream remoto recibido", event.streams[0]);
        // DEBUG: Log tracks del stream remoto
        console.log('[WebRTC] Tracks de stream remoto:', event.streams[0].getTracks().map((t: any) => t.kind + ':' + t.id));
      } else {
        console.log("[WebRTC] Evento ontrack sin streams", event);
      }
    };
    // Add local tracks SOLO si localStream está disponible
    if (localStream) {
      localStream.getTracks().forEach((track) => {
        peerRef.current?.addTrack(track, localStream);
        console.log('[WebRTC] addTrack:', track.kind, track.id);
      });
    } else {
      // Si no hay localStream, espera a que esté disponible antes de negociar
      console.warn("[WebRTC] No se puede crear peer: localStream no disponible");
      return;
    }
    if (isInitiator && peerRef.current) {
      setIsOfferer(true);
      // Emitir aviso de llamada antes de la oferta
      if (!peerId) {
        console.warn("[WebRTC] No se especificó el userId destino (peerId/callTargets) para la llamada");
      }
      socketRef.current?.emit("start-call", { roomId, from: userId, to: peerId });
      peerRef.current.createOffer().then((offer: any) => {
        peerRef.current?.setLocalDescription(offer);
        console.log('[WebRTC] Oferta creada y setLocalDescription OK', offer);
        socketRef.current?.emit("webrtc-offer", {
          roomId,
          offer,
          from: userId,
        });
      });
    }
    setConnected(true);
  }

  return {
    localStream,
    remoteStream,
    connected,
    incomingCall,
    // Solo permite iniciar llamada si no eres answerer
    startCall: () => {
      if (!isOfferer && !connected) {
        console.log('[WebRTC] startCall presionado');
        createPeer(true);
      } else {
        console.log('[WebRTC] Este peer ya es offerer o está conectado, no inicia otra llamada');
      }
    },
    // Llamar cuando el usuario acepte la llamada entrante
    acceptCall: () => {
      if (pendingOfferRef.current) {
        handleReceivedOffer(pendingOfferRef.current);
        pendingOfferRef.current = null;
        setIncomingCall(null);
      }
    },
    // Llamar cuando el usuario rechace la llamada entrante
    rejectCall: () => {
      pendingOfferRef.current = null;
      setIncomingCall(null);
    },
    endCall: () => {
      if (peerRef.current) peerRef.current.close();
      setConnected(false);
      setRemoteStream(null);
      setIsOfferer(false);
    },
  };
}
