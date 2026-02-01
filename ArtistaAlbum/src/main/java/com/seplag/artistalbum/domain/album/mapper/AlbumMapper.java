package com.seplag.artistalbum.domain.album.mapper;

import com.seplag.artistalbum.domain.album.dto.AlbumResponseDTO;
import com.seplag.artistalbum.domain.album.model.AlbumModel;

public class AlbumMapper {

    private AlbumMapper() {
    }

    public static AlbumResponseDTO toResponseDTO(AlbumModel album) {
        AlbumResponseDTO dto = new AlbumResponseDTO();
        dto.setIdAlbum(album.getIdAlbum());
        dto.setTituloAlbum(album.getTituloAlbum());
        if (album.getCapas() != null && !album.getCapas().isEmpty()) {
            dto.setCapaAlbum(album.getCapas().get(0).getChaveObjeto());
        }
        dto.setDataCriacao(album.getDataCriacao());
        dto.setDataAtualizacao(album.getDataAtualizacao());

        if (album.getArtista() != null) {
            dto.setIdArtista(album.getArtista().getIdArtista());
            dto.setNomeArtista(album.getArtista().getNomeArtista());
        }
        return dto;
    }
}
