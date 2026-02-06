package artistalbum.domain.regional.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.seplag.artistalbum.domain.regional.dto.RegionalCreateRequest;
import com.seplag.artistalbum.domain.regional.dto.RegionalUpdateRequest;
import com.seplag.artistalbum.domain.regional.model.Regional;
import com.seplag.artistalbum.domain.regional.repository.RegionalRepository;
import com.seplag.artistalbum.domain.regional.service.RegionalSyncService;
import org.junit.jupiter.api.Test;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class RegionalSyncServiceCrudTest {

    @Test
    void shouldListActiveRegionals() {
        RegionalRepository regionalRepository = mock(RegionalRepository.class);
        WebClient.Builder webClientBuilder = mock(WebClient.Builder.class);
        ObjectMapper objectMapper = mock(ObjectMapper.class);

        RegionalSyncService service = new RegionalSyncService(webClientBuilder, regionalRepository, objectMapper);

        Regional regional = new Regional("Centro", true);
        when(regionalRepository.findActiveOrderByNome()).thenReturn(List.of(regional));

        List<Regional> resultado = service.getActiveRegionals();

        assertEquals(1, resultado.size());
        assertEquals("Centro", resultado.get(0).getNome());
        verify(regionalRepository).findActiveOrderByNome();
    }

    @Test
    void shouldCreateRegional() {
        RegionalRepository regionalRepository = mock(RegionalRepository.class);
        WebClient.Builder webClientBuilder = mock(WebClient.Builder.class);
        ObjectMapper objectMapper = mock(ObjectMapper.class);

        RegionalSyncService service = new RegionalSyncService(webClientBuilder, regionalRepository, objectMapper);

        RegionalCreateRequest request = new RegionalCreateRequest("Sul", true, 10);
        Regional salvo = new Regional("Sul", true);
        salvo.setCodigoExterno(10);

        when(regionalRepository.save(any(Regional.class))).thenReturn(salvo);

        Regional response = service.createRegional(request);

        assertEquals("Sul", response.getNome());
        assertEquals(10, response.getCodigoExterno());
    }

    @Test
    void shouldUpdateRegional() {
        RegionalRepository regionalRepository = mock(RegionalRepository.class);
        WebClient.Builder webClientBuilder = mock(WebClient.Builder.class);
        ObjectMapper objectMapper = mock(ObjectMapper.class);

        RegionalSyncService service = new RegionalSyncService(webClientBuilder, regionalRepository, objectMapper);

        Regional existing = new Regional("Leste", true);
        existing.setId(5L);
        existing.setCodigoExterno(20);

        RegionalUpdateRequest request = new RegionalUpdateRequest("Leste", false);

        when(regionalRepository.findById(5L)).thenReturn(Optional.of(existing));
        when(regionalRepository.save(existing)).thenReturn(existing);

        Regional response = service.updateRegional(5L, request);

        assertEquals("Leste", response.getNome());
        assertEquals(false, response.getAtivo());
        verify(regionalRepository).save(existing);
    }
}