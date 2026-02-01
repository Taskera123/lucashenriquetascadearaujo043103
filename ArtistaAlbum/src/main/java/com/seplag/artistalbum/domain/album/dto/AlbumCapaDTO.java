package com.seplag.artistalbum.domain.album.dto;

public class AlbumCapaDTO {
    private Long idCapa;
    private String chaveObjeto;
    private String urlAssinada;
    private boolean principal;

    public AlbumCapaDTO() {}

    public AlbumCapaDTO(Long idCapa, String chaveObjeto, String urlAssinada, boolean principal) {
        this.idCapa = idCapa;
        this.chaveObjeto = chaveObjeto;
        this.urlAssinada = urlAssinada;
        this.principal = principal;
    }

    public Long getIdCapa() {
        return idCapa;
    }

    public void setIdCapa(Long idCapa) {
        this.idCapa = idCapa;
    }

    public String getChaveObjeto() {
        return chaveObjeto;
    }

    public void setChaveObjeto(String chaveObjeto) {
        this.chaveObjeto = chaveObjeto;
    }

    public String getUrlAssinada() {
        return urlAssinada;
    }

    public void setUrlAssinada(String urlAssinada) {
        this.urlAssinada = urlAssinada;
    }

    public boolean isPrincipal() {
        return principal;
    }

    public void setPrincipal(boolean principal) {
        this.principal = principal;
    }
}
