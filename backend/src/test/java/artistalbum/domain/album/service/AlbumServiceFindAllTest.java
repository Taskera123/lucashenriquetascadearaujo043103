package artistalbum.domain.album.service;


import com.seplag.artistalbum.domain.album.dto.AlbumDTO;
import com.seplag.artistalbum.domain.album.model.AlbumModel;
import com.seplag.artistalbum.domain.album.repository.AlbumCapaRepository;
import com.seplag.artistalbum.domain.album.repository.AlbumRepository;
import com.seplag.artistalbum.domain.album.service.AlbumService;
import com.seplag.artistalbum.domain.artista.model.ArtistaModel;
import com.seplag.artistalbum.domain.artista.repository.ArtistaRepository;
import com.seplag.artistalbum.shared.service.MinioService;
import org.junit.jupiter.api.Test;
import org.springframework.data.domain.Sort;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class AlbumServiceFindAllTest {

    @Test
    void shouldListAllAlbumsUsingFindAll() {
        AlbumRepository albumRepository = mock(AlbumRepository.class);
        AlbumCapaRepository albumCapaRepository = mock(AlbumCapaRepository.class);
        ArtistaRepository artistaRepository = mock(ArtistaRepository.class);
        MinioService minioService = mock(MinioService.class);
        SimpMessagingTemplate messagingTemplate = mock(SimpMessagingTemplate.class);

        AlbumService service = new AlbumService(
                albumRepository,
                albumCapaRepository,
                artistaRepository,
                minioService,
                messagingTemplate
        );

        ArtistaModel artista = new ArtistaModel("Djavan");
        artista.setIdArtista(1L);
        AlbumModel album = new AlbumModel("Luz", artista);
        album.setIdAlbum(10L);

        when(albumRepository.findAll(any(Sort.class))).thenReturn(List.of(album));

        List<AlbumDTO> resultado = service.listarTodosAlbunsNovo();

        assertEquals(1, resultado.size());
        assertEquals("Luz", resultado.get(0).getTitulo());
        verify(albumRepository).findAll(Sort.by("tituloAlbum").ascending());
    }
}