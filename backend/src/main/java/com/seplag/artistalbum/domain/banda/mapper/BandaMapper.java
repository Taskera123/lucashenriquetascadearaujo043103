package com.seplag.artistalbum.domain.banda.mapper;

import com.seplag.artistalbum.domain.artista.dto.ArtistaResumoDTO;
import com.seplag.artistalbum.domain.banda.dto.BandaResponseDTO;
import com.seplag.artistalbum.domain.banda.model.BandaArtistaModel;
import com.seplag.artistalbum.domain.banda.model.BandaModel;

public class BandaMapper {

    private BandaMapper() {
    }

    public static BandaResponseDTO toResponseDTO(BandaModel banda) {
        BandaResponseDTO dto = new BandaResponseDTO();
        dto.setIdBanda(banda.getIdBanda());
        dto.setNomeBanda(banda.getNomeBanda());
        dto.setDataCriacao(banda.getDataCriacao());
        dto.setDataAtualizacao(banda.getDataAtualizacao());

        if (banda.getArtistas() != null) {
            for (BandaArtistaModel ba : banda.getArtistas()) {
                if (ba.getArtista() != null) {
                    dto.getArtistas().add(
                            new ArtistaResumoDTO(
                                    ba.getArtista().getIdArtista(),
                                    ba.getArtista().getNomeArtista()
                            )
                    );
                }
            }
        }
        return dto;
    }
}
