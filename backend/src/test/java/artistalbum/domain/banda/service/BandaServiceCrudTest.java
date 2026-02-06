package artistalbum.domain.banda.service;

import com.seplag.artistalbum.domain.artista.repository.ArtistaRepository;
import com.seplag.artistalbum.domain.banda.dto.BandaRequestDTO;
import com.seplag.artistalbum.domain.banda.dto.BandaResponseDTO;
import com.seplag.artistalbum.domain.banda.model.BandaModel;
import com.seplag.artistalbum.domain.banda.repository.BandaArtistaRepository;
import com.seplag.artistalbum.domain.banda.repository.BandaRepository;
import com.seplag.artistalbum.domain.banda.service.BandaService;
import org.junit.jupiter.api.Test;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class BandaServiceCrudTest {

    @Test
    void shouldCreateBand() {
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

        BandaRequestDTO request = new BandaRequestDTO();
        request.setNomeBanda("Os Mutantes");

        BandaModel salva = new BandaModel();
        salva.setIdBanda(3L);
        salva.setNomeBanda("Os Mutantes");

        when(bandaRepository.existsByNomeBandaIgnoreCase("Os Mutantes")).thenReturn(false);
        when(bandaRepository.save(any(BandaModel.class))).thenReturn(salva);

        BandaResponseDTO response = service.criarBanda(request);

        assertEquals(3L, response.getIdBanda());
        assertEquals("Os Mutantes", response.getNomeBanda());
    }

    @Test
    void shouldUpdateBand() {
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

        BandaModel existente = new BandaModel();
        existente.setIdBanda(3L);
        existente.setNomeBanda("Antiga");

        BandaRequestDTO request = new BandaRequestDTO();
        request.setNomeBanda("Nova");

        when(bandaRepository.findById(3L)).thenReturn(Optional.of(existente));
        when(bandaRepository.existsByNomeBandaIgnoreCase("Nova")).thenReturn(false);
        when(bandaRepository.save(existente)).thenReturn(existente);

        BandaResponseDTO response = service.atualizarBanda(3L, request);

        assertEquals("Nova", response.getNomeBanda());
        verify(bandaRepository).save(existente);
    }

    @Test
    void shouldDeleteBand() {
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

        when(bandaRepository.existsById(3L)).thenReturn(true);

        service.deletarBanda(3L);

        verify(bandaRepository).deleteById(3L);
    }
}