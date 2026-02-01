package com.seplag.artistalbum.config.websocket.config;

import com.seplag.artistalbum.domain.auth.service.JwtService;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;


@Configuration
public class WebSocketAuthConfig implements org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer {

    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;

    public WebSocketAuthConfig(JwtService jwtService, UserDetailsService userDetailsService) {
        this.jwtService = jwtService;
        this.userDetailsService = userDetailsService;
    }

    @Override
    public void configureClientInboundChannel(ChannelRegistration registration) {
        registration.interceptors(new ChannelInterceptor() {

            @Override
            public Message<?> preSend(Message<?> message, MessageChannel channel) {
                StompHeaderAccessor accessor =
                        MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);

                if (accessor == null) {
                    return message;
                }

                if (StompCommand.CONNECT.equals(accessor.getCommand())) {

                    String authHeader = accessor.getFirstNativeHeader("Authorization");

                    if (authHeader == null || authHeader.isBlank()) {
                        throw new IllegalArgumentException("Authorization header ausente no CONNECT");
                    }

                    if (!authHeader.startsWith("Bearer ")) {
                        throw new IllegalArgumentException("Authorization deve iniciar com 'Bearer '");
                    }

                    String jwt = authHeader.substring(7).trim();

                    String username;
                    try {
                        username = jwtService.extractUsername(jwt);
                    } catch (Exception e) {
                        throw new IllegalArgumentException("JWT inválido (não foi possível extrair username)");
                    }

                    UserDetails userDetails = userDetailsService.loadUserByUsername(username);

                    if (!jwtService.isTokenValid(jwt, userDetails)) {
                        throw new IllegalArgumentException("JWT inválido ou expirado");
                    }

                    UsernamePasswordAuthenticationToken authentication =
                            new UsernamePasswordAuthenticationToken(
                                    userDetails,
                                    null,
                                    userDetails.getAuthorities()
                            );

                    accessor.setUser(authentication);

                    accessor.getSessionAttributes().put("SPRING_SECURITY_CONTEXT", authentication);
                }

                return message;
            }
        });
    }
}
