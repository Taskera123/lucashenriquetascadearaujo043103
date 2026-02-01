package com.seplag.artistalbum.domain.artista.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
public class ArtistaRequestDTO {

    @NotBlank
    @Size(max = 255)
    private String nomeArtista;

    public ArtistaRequestDTO() {
    }

    public String getNomeArtista() {
        return nomeArtista;
    }

    public void setNomeArtista(String nomeArtista) {
        this.nomeArtista = nomeArtista;
    }
}
