package com.seplag.artistalbum.domain.banda.dto;

import jakarta.validation.constraints.NotNull;

public class VincularArtistaRequestDTO {

    @NotNull
    private Long idArtista;

    public VincularArtistaRequestDTO() {
    }

    public Long getIdArtista() {
        return idArtista;
    }

    public void setIdArtista(Long idArtista) {
        this.idArtista = idArtista;
    }
}
