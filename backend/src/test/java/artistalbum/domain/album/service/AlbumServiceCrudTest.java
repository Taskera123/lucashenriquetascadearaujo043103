package artistalbum.domain.album.service;


import com.seplag.artistalbum.domain.album.dto.AlbumRequestDTO;
import com.seplag.artistalbum.domain.album.dto.AlbumResponseDTO;
import com.seplag.artistalbum.domain.album.model.AlbumModel;
import com.seplag.artistalbum.domain.album.repository.AlbumCapaRepository;
import com.seplag.artistalbum.domain.album.repository.AlbumRepository;
import com.seplag.artistalbum.domain.album.service.AlbumService;
import com.seplag.artistalbum.domain.artista.model.ArtistaModel;
import com.seplag.artistalbum.domain.artista.repository.ArtistaRepository;
import com.seplag.artistalbum.shared.service.MinioService;
import org.junit.jupiter.api.Test;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class AlbumServiceCrudTest {

    @Test
    void shouldCreateAlbum() {
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

        AlbumModel albumSalvo = new AlbumModel("Luz", artista);
        albumSalvo.setIdAlbum(10L);

        AlbumRequestDTO request = new AlbumRequestDTO();
        request.setIdArtista(1L);
        request.setTituloAlbum("Luz");

        when(artistaRepository.findById(1L)).thenReturn(Optional.of(artista));
        when(albumRepository.existsByArtista_IdArtistaAndTituloAlbumIgnoreCase(1L, "Luz")).thenReturn(false);
        when(albumRepository.save(any(AlbumModel.class))).thenReturn(albumSalvo);

        AlbumResponseDTO response = service.criarAlbum(request);

        assertEquals(10L, response.getIdAlbum());
        assertEquals("Luz", response.getTituloAlbum());
    }

    @Test
    void shouldUpdateAlbum() {
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

        ArtistaModel artistaAtual = new ArtistaModel("Djavan");
        artistaAtual.setIdArtista(1L);
        AlbumModel albumAtual = new AlbumModel("Velho", artistaAtual);
        albumAtual.setIdAlbum(10L);

        ArtistaModel artistaNovo = new ArtistaModel("Djavan");
        artistaNovo.setIdArtista(1L);

        AlbumRequestDTO request = new AlbumRequestDTO();
        request.setIdArtista(1L);
        request.setTituloAlbum("Novo");

        when(albumRepository.findById(10L)).thenReturn(Optional.of(albumAtual));
        when(artistaRepository.findById(1L)).thenReturn(Optional.of(artistaNovo));
        when(albumRepository.existsByArtista_IdArtistaAndTituloAlbumIgnoreCase(1L, "Novo")).thenReturn(false);
        when(albumRepository.save(albumAtual)).thenReturn(albumAtual);

        AlbumResponseDTO response = service.atualizarAlbum(10L, request);

        assertEquals("Novo", response.getTituloAlbum());
        verify(albumRepository).save(albumAtual);
    }

    @Test
    void shouldDeleteAlbum() {
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

        when(albumRepository.existsById(10L)).thenReturn(true);

        service.deletarAlbum(10L);

        verify(albumRepository).deleteById(10L);
    }
}