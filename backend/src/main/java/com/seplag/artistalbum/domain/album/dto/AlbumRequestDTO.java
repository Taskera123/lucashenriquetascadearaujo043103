package com.seplag.artistalbum.domain.album.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class AlbumRequestDTO {

    @NotBlank
    @Size(max = 255)
    private String tituloAlbum;

    @Size(max = 500)
    private String capaAlbum;

    @NotNull
    private Long idArtista;

    public AlbumRequestDTO() {
    }

    public String getTituloAlbum() {
        return tituloAlbum;
    }

    public void setTituloAlbum(String tituloAlbum) {
        this.tituloAlbum = tituloAlbum;
    }

    public String getCapaAlbum() {
        return capaAlbum;
    }

    public void setCapaAlbum(String capaAlbum) {
        this.capaAlbum = capaAlbum;
    }

    public Long getIdArtista() {
        return idArtista;
    }

    public void setIdArtista(Long idArtista) {
        this.idArtista = idArtista;
    }
}
