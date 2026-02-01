package com.seplag.artistalbum.domain.artista.mapper;

import com.seplag.artistalbum.domain.artista.dto.ArtistaResponseDTO;
import com.seplag.artistalbum.domain.artista.model.ArtistaModel;

public class ArtistaMapper {

    private ArtistaMapper() {
    }

    public static ArtistaResponseDTO toResponseDTO(ArtistaModel artista) {
        ArtistaResponseDTO dto = new ArtistaResponseDTO();
        dto.setIdArtista(artista.getIdArtista());
        dto.setNomeArtista(artista.getNomeArtista());
        dto.setDataCriacao(artista.getDataCriacao());
        dto.setDataAtualizacao(artista.getDataAtualizacao());
        return dto;
    }
}
