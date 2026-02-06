package artistalbum.domain.banda.service;

import com.seplag.artistalbum.domain.artista.repository.ArtistaRepository;
import com.seplag.artistalbum.domain.banda.dto.BandaResponseDTO;
import com.seplag.artistalbum.domain.banda.model.BandaModel;
import com.seplag.artistalbum.domain.banda.repository.BandaArtistaRepository;
import com.seplag.artistalbum.domain.banda.repository.BandaRepository;
import com.seplag.artistalbum.domain.banda.service.BandaService;
import org.junit.jupiter.api.Test;
import org.springframework.data.domain.Sort;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class BandaServiceFindAllTest {

    @Test
    void shouldListAllBandsUsingFindAll() {
        BandaRepository bandaRepository = mock(BandaRepository.class);
        ArtistaRepository artistaRepository = mock(ArtistaRepository.class);
        BandaArtistaRepository bandaArtistaRepository = mock(BandaArtistaRepository.class);
        SimpMessagingTemplate messagingTemplate = mock(SimpMessagingTemplate.class);

        BandaService service = new BandaService(
                bandaRepository,
                artistaRepository,
                bandaArtistaRepository,
                messagingTemplate
        );

        BandaModel banda = new BandaModel();
        banda.setIdBanda(3L);
        banda.setNomeBanda("Os Mutantes");

        when(bandaRepository.findAll(any(Sort.class))).thenReturn(List.of(banda));

        List<BandaResponseDTO> resultado = service.listarTodas();

        assertEquals(1, resultado.size());
        assertEquals("Os Mutantes", resultado.get(0).getNomeBanda());
        verify(bandaRepository).findAll(Sort.by("nomeBanda").ascending());
    }
}