package artistalbum.domain.artista.service;

import com.seplag.artistalbum.domain.album.repository.AlbumRepository;
import com.seplag.artistalbum.domain.artista.dto.ArtistaRequestDTO;
import com.seplag.artistalbum.domain.artista.dto.ArtistaResponseDTO;
import com.seplag.artistalbum.domain.artista.model.ArtistaModel;
import com.seplag.artistalbum.domain.artista.repository.ArtistaRepository;
import com.seplag.artistalbum.domain.artista.service.ArtistaService;
import com.seplag.artistalbum.domain.banda.repository.BandaArtistaRepository;
import com.seplag.artistalbum.shared.service.MinioService;
import org.junit.jupiter.api.Test;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class ArtistaServiceCrudTest {

    @Test
    void shouldCreateArtist() {
        ArtistaRepository artistaRepository = mock(ArtistaRepository.class);
        AlbumRepository albumRepository = mock(AlbumRepository.class);
        BandaArtistaRepository bandaArtistaRepository = mock(BandaArtistaRepository.class);
        MinioService minioService = mock(MinioService.class);
        SimpMessagingTemplate messagingTemplate = mock(SimpMessagingTemplate.class);

        ArtistaService service = new ArtistaService(
                artistaRepository,
                albumRepository,
                bandaArtistaRepository,
                minioService,
                messagingTemplate
        );

        ArtistaRequestDTO request = new ArtistaRequestDTO();
        request.setNomeArtista("Elis Regina");

        ArtistaModel salvo = new ArtistaModel("Elis Regina");
        salvo.setIdArtista(5L);

        when(artistaRepository.existsByNomeArtistaIgnoreCase("Elis Regina")).thenReturn(false);
        when(artistaRepository.save(any(ArtistaModel.class))).thenReturn(salvo);

        ArtistaResponseDTO response = service.criarArtista(request);

        assertEquals(5L, response.getIdArtista());
        assertEquals("Elis Regina", response.getNomeArtista());
    }

    @Test
    void shouldUpdateArtist() {
        ArtistaRepository artistaRepository = mock(ArtistaRepository.class);
        AlbumRepository albumRepository = mock(AlbumRepository.class);
        BandaArtistaRepository bandaArtistaRepository = mock(BandaArtistaRepository.class);
        MinioService minioService = mock(MinioService.class);
        SimpMessagingTemplate messagingTemplate = mock(SimpMessagingTemplate.class);

        ArtistaService service = new ArtistaService(
                artistaRepository,
                albumRepository,
                bandaArtistaRepository,
                minioService,
                messagingTemplate
        );

        ArtistaModel existente = new ArtistaModel("Antigo");
        existente.setIdArtista(5L);

        ArtistaRequestDTO request = new ArtistaRequestDTO();
        request.setNomeArtista("Novo");

        when(artistaRepository.findById(5L)).thenReturn(Optional.of(existente));
        when(artistaRepository.existsByNomeArtistaIgnoreCase("Novo")).thenReturn(false);
        when(artistaRepository.save(existente)).thenReturn(existente);

        ArtistaResponseDTO response = service.atualizarArtista(5L, request);

        assertEquals("Novo", response.getNomeArtista());
        verify(artistaRepository).save(existente);
    }

    @Test
    void shouldDeleteArtist() {
        ArtistaRepository artistaRepository = mock(ArtistaRepository.class);
        AlbumRepository albumRepository = mock(AlbumRepository.class);
        BandaArtistaRepository bandaArtistaRepository = mock(BandaArtistaRepository.class);
        MinioService minioService = mock(MinioService.class);
        SimpMessagingTemplate messagingTemplate = mock(SimpMessagingTemplate.class);

        ArtistaService service = new ArtistaService(
                artistaRepository,
                albumRepository,
                bandaArtistaRepository,
                minioService,
                messagingTemplate
        );

        when(artistaRepository.existsById(5L)).thenReturn(true);

        service.deletarArtista(5L);

        verify(artistaRepository).deleteById(5L);
    }
}