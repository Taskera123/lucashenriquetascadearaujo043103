package artistalbum.domain.artista.service;

import com.seplag.artistalbum.domain.album.repository.AlbumRepository;
import com.seplag.artistalbum.domain.artista.dto.ArtistaResponseDTO;
import com.seplag.artistalbum.domain.artista.model.ArtistaModel;
import com.seplag.artistalbum.domain.artista.repository.ArtistaRepository;
import com.seplag.artistalbum.domain.artista.service.ArtistaService;
import com.seplag.artistalbum.domain.banda.repository.BandaArtistaRepository;
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

class ArtistaServiceFindAllTest {

    @Test
    void shouldListAllArtistsUsingFindAll() {
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

        ArtistaModel artista = new ArtistaModel("Elis Regina");
        artista.setIdArtista(5L);

        when(artistaRepository.findAll(any(Sort.class))).thenReturn(List.of(artista));

        List<ArtistaResponseDTO> resultado = service.listarTodos();

        assertEquals(1, resultado.size());
        assertEquals("Elis Regina", resultado.get(0).getNomeArtista());
        verify(artistaRepository).findAll(Sort.by("nomeArtista").ascending());
    }
}