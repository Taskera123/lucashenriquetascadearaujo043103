package com.seplag.artistalbum.shared.dto;

import com.seplag.artistalbum.domain.album.dto.AlbumDTO;
import com.seplag.artistalbum.domain.artista.dto.ArtistaResponseDTO;
import com.seplag.artistalbum.domain.banda.dto.BandaResponseDTO;

import java.util.List;

public class CatalogoResponseDTO {

    private List<ArtistaResponseDTO> artistas;
    private List<AlbumDTO> albuns;
    private List<BandaResponseDTO> bandas;

    public CatalogoResponseDTO() {
    }

    public CatalogoResponseDTO(List<ArtistaResponseDTO> artistas, List<AlbumDTO> albuns, List<BandaResponseDTO> bandas) {
        this.artistas = artistas;
        this.albuns = albuns;
        this.bandas = bandas;
    }

    public List<ArtistaResponseDTO> getArtistas() {
        return artistas;
    }

    public void setArtistas(List<ArtistaResponseDTO> artistas) {
        this.artistas = artistas;
    }

    public List<AlbumDTO> getAlbuns() {
        return albuns;
    }

    public void setAlbuns(List<AlbumDTO> albuns) {
        this.albuns = albuns;
    }

    public List<BandaResponseDTO> getBandas() {
        return bandas;
    }

    public void setBandas(List<BandaResponseDTO> bandas) {
        this.bandas = bandas;
    }
}
