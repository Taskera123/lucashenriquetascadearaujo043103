package com.seplag.artistalbum.domain.artista.dto;

import java.time.LocalDateTime;

public class ArtistaResponseDTO {

    private Long idArtista;
    private String nomeArtista;
    private String urlFoto;
    private LocalDateTime dataCriacao;
    private LocalDateTime dataAtualizacao;

    public ArtistaResponseDTO() {
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

    public String getUrlFoto() { return urlFoto; }

    public void setUrlFoto(String urlFoto) { this.urlFoto = urlFoto; }

    public LocalDateTime getDataCriacao() {
        return dataCriacao;
    }

    public void setDataCriacao(LocalDateTime dataCriacao) {
        this.dataCriacao = dataCriacao;
    }

    public LocalDateTime getDataAtualizacao() {
        return dataAtualizacao;
    }

    public void setDataAtualizacao(LocalDateTime dataAtualizacao) {
        this.dataAtualizacao = dataAtualizacao;
    }
}
