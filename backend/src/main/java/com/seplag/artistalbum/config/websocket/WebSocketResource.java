package com.seplag.artistalbum.config.websocket;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;

@RestController
public class WebSocketResource {

    @MessageMapping("/ping")
    @SendTo("/topic/artist-updates")
    public String ping(String payload, Principal principal) {
        String user = (principal != null) ? principal.getName() : "anon";
        return "Usuário " + user + " disse: " + payload;
    }
}
