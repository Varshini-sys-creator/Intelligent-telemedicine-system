package com.telemed.controller;

import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.util.Map;

/**
 * WebRTC Signaling Controller.
 *
 * WebRTC requires a "signaling server" to help two peers find each other
 * before they can establish a direct connection. This controller handles
 * the exchange of:
 * - SDP offer (from the caller — typically the patient joining first)
 * - SDP answer (from the callee — typically the doctor joining)
 * - ICE candidates (network path information from both sides)
 *
 * Once the ICE negotiation is complete, audio/video flows directly
 * between the two browsers without going through this server.
 *
 * Room ID = consultation meeting link (e.g., "telemed-room-12345")
 */
@Controller
public class SignalingController {

    private final SimpMessagingTemplate messagingTemplate;

    public SignalingController(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    // Patient sends an SDP offer → forwarded to everyone in the room
    @MessageMapping("/signal/{roomId}/offer")
    public void handleOffer(@DestinationVariable String roomId, @Payload Map<String, Object> payload) {
        messagingTemplate.convertAndSend("/topic/signal/" + roomId + "/offer", payload);
    }

    // Doctor sends SDP answer → forwarded to everyone in the room
    @MessageMapping("/signal/{roomId}/answer")
    public void handleAnswer(@DestinationVariable String roomId, @Payload Map<String, Object> payload) {
        messagingTemplate.convertAndSend("/topic/signal/" + roomId + "/answer", payload);
    }

    // Both sides send ICE candidates → forwarded to everyone in the room
    @MessageMapping("/signal/{roomId}/ice-candidate")
    public void handleIceCandidate(@DestinationVariable String roomId, @Payload Map<String, Object> payload) {
        messagingTemplate.convertAndSend("/topic/signal/" + roomId + "/ice-candidate", payload);
    }
}
