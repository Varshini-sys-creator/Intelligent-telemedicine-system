package com.telemed.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

/**
 * WebSocket configuration for WebRTC signaling.
 *
 * The signaling server helps two browsers (patient + doctor) exchange
 * WebRTC connection info (SDP offer/answer and ICE candidates) before
 * the direct peer-to-peer video connection is established.
 *
 * Uses STOMP over WebSocket (Spring's built-in support — no external broker needed).
 */
@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        // Messages from the server to clients go through /topic
        registry.enableSimpleBroker("/topic");
        // Messages from clients to the server start with /app
        registry.setApplicationDestinationPrefixes("/app");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // The frontend connects to this endpoint via SockJS
        registry.addEndpoint("/api/ws/signaling")
                .setAllowedOriginPatterns("http://localhost:5173", "http://localhost:3000")
                .withSockJS();
    }
}
