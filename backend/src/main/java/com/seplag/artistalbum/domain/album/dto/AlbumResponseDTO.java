package com.seplag.artistalbum.domain.album.dto;

import java.time.LocalDateTime;

public class AlbumResponseDTO {

    private Long idAlbum;
    private String tituloAlbum;
    private String capaAlbum;

    private Long idArtista;
    private String nomeArtista;

    private LocalDateTime dataCriacao;
    private LocalDateTime dataAtualizacao;

    public AlbumResponseDTO() {
    }

    public Long getIdAlbum() {
        return idAlbum;
    }

    public void setIdAlbum(Long idAlbum) {
        this.idAlbum = idAlbum;
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

    public String getNomeArtista() {
        return nomeArtista;
    }

    public void setNomeArtista(String nomeArtista) {
        this.nomeArtista = nomeArtista;
    }

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
