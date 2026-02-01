package com.seplag.artistalbum.domain.artista.dto;

import jakarta.validation.constraints.NotBlank;

public class AtualizarArtistaRequest {
    @NotBlank
    private String nome;

    public AtualizarArtistaRequest() {
    }

    public AtualizarArtistaRequest(String nome) {
        this.nome = nome;
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }
}
