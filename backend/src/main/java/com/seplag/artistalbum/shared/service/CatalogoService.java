package com.seplag.artistalbum.shared.service;

import com.seplag.artistalbum.domain.album.service.AlbumService;
import com.seplag.artistalbum.domain.artista.service.ArtistaService;
import com.seplag.artistalbum.domain.banda.service.BandaService;
import com.seplag.artistalbum.shared.dto.CatalogoResponseDTO;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CatalogoService {

    private final ArtistaService artistaService;
    private final AlbumService albumService;
    private final BandaService bandaService;

    public CatalogoService(ArtistaService artistaService, AlbumService albumService, BandaService bandaService) {
        this.artistaService = artistaService;
        this.albumService = albumService;
        this.bandaService = bandaService;
    }

    @Transactional(readOnly = true)
    public CatalogoResponseDTO obterCatalogoCompleto() {
        return new CatalogoResponseDTO(
                artistaService.listarTodos(),
                albumService.listarTodosAlbunsNovo(),
                bandaService.listarTodas()
        );
    }
}
