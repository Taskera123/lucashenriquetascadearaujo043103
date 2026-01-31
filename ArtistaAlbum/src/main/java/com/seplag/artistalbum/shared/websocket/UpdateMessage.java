package com.seplag.artistalbum.shared.websocket;

public record UpdateMessage(String entity, String action, Long id) {
}
