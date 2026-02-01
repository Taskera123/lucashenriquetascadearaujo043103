package com.seplag.artistalbum.domain.banda.dto;

public class BandaResumoDTO {

    private Long idBanda;
    private String nomeBanda;

    public BandaResumoDTO() {
    }

    public BandaResumoDTO(Long idBanda, String nomeBanda) {
        this.idBanda = idBanda;
        this.nomeBanda = nomeBanda;
    }

    public Long getIdBanda() {
        return idBanda;
    }

    public void setIdBanda(Long idBanda) {
        this.idBanda = idBanda;
    }

    public String getNomeBanda() {
        return nomeBanda;
    }

    public void setNomeBanda(String nomeBanda) {
        this.nomeBanda = nomeBanda;
    }
}
