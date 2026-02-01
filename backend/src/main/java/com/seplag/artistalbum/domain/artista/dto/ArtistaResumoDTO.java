package com.seplag.artistalbum.domain.artista.dto;

public class ArtistaResumoDTO {


    private Long idArtista;
    private String nomeArtista;

    public ArtistaResumoDTO() {
    }

    public ArtistaResumoDTO(Long idArtista, String nomeArtista) {
        this.idArtista = idArtista;
        this.nomeArtista = nomeArtista;
    }

    public Long getIdArtista() {
        return idArtista;
    }

    public void setIdArtista(Long idArtista) {
        this.idArtista = idArtista;
    }

    public String getNomeArtista() {
        return nomeArtista;
    }

    public void setNomeArtista(String nomeArtista) {
        this.nomeArtista = nomeArtista;
    }
}
