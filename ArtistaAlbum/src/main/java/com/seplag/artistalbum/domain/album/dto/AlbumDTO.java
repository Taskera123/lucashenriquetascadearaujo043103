package com.seplag.artistalbum.domain.album.dto;

import java.time.LocalDateTime;

public class AlbumDTO {

    private Long id;

    private String titulo;

    private Long idArtista;

    private String nomeArtista;

    private String urlImagemCapa;

    private String urlImagemCapaAssinada;

    private LocalDateTime dataCriacao;

    private LocalDateTime dataAtualizacao;

    public AlbumDTO() {}

    public AlbumDTO(Long id, String titulo, Long idArtista, String nomeArtista,
                   String urlImagemCapa, LocalDateTime dataCriacao, LocalDateTime dataAtualizacao) {
        this.id = id;
        this.titulo = titulo;
        this.idArtista = idArtista;
        this.nomeArtista = nomeArtista;
        this.urlImagemCapa = urlImagemCapa;
        this.dataCriacao = dataCriacao;
        this.dataAtualizacao = dataAtualizacao;
    }

    public AlbumDTO(Long id, String titulo, String urlImagemCapa, String urlImagemCapaAssinada) {
        this.id = id;
        this.titulo = titulo;
        this.urlImagemCapa = urlImagemCapa;
        this.urlImagemCapaAssinada = urlImagemCapaAssinada;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitulo() {
        return titulo;
    }

    public void setTitulo(String titulo) {
        this.titulo = titulo;
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

    public String getUrlImagemCapa() {
        return urlImagemCapa;
    }

    public void setUrlImagemCapa(String urlImagemCapa) {
        this.urlImagemCapa = urlImagemCapa;
    }

    public String getUrlImagemCapaAssinada() {
        return urlImagemCapaAssinada;
    }

    public void setUrlImagemCapaAssinada(String urlImagemCapaAssinada) {
        this.urlImagemCapaAssinada = urlImagemCapaAssinada;
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
