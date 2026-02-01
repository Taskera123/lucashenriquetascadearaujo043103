package com.seplag.artistalbum.domain.banda.dto;

import com.seplag.artistalbum.domain.artista.dto.ArtistaResumoDTO;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class BandaResponseDTO {

    private Long idBanda;
    private String nomeBanda;
    private LocalDateTime dataCriacao;
    private LocalDateTime dataAtualizacao;

    private List<ArtistaResumoDTO> artistas = new ArrayList<>();

    public BandaResponseDTO() {
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

    public List<ArtistaResumoDTO> getArtistas() {
        return artistas;
    }

    public void setArtistas(List<ArtistaResumoDTO> artistas) {
        this.artistas = artistas;
    }
}
