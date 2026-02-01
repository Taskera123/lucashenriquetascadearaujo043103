package artistalbum.domain.banda.service;

import com.seplag.artistalbum.domain.artista.model.ArtistaModel;
import com.seplag.artistalbum.domain.artista.repository.ArtistaRepository;
import com.seplag.artistalbum.domain.banda.dto.BandaResponseDTO;
import com.seplag.artistalbum.domain.banda.model.BandaArtistaId;
import com.seplag.artistalbum.domain.banda.model.BandaArtistaModel;
import com.seplag.artistalbum.domain.banda.model.BandaModel;
import com.seplag.artistalbum.domain.banda.repository.BandaArtistaRepository;
import com.seplag.artistalbum.domain.banda.repository.BandaRepository;
import com.seplag.artistalbum.domain.banda.service.BandaService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class BandaServiceTest {

    @Mock
    private BandaRepository bandaRepository;

    @Mock
    private ArtistaRepository artistaRepository;

    @Mock
    private BandaArtistaRepository bandaArtistaRepository;

    @Mock
    private SimpMessagingTemplate messagingTemplate;

    @InjectMocks
    private BandaService bandaService;

    @Test
    void obterBandaPorIdRetornaArtistasVinculados() {
        BandaModel banda = buildBanda(1L, "Banda A");
        ArtistaModel artista = buildArtista(10L, "Artista X");
        BandaArtistaModel vinculo = buildVinculo(banda, artista);
        banda.getArtistas().add(vinculo);

        when(bandaRepository.findByIdWithArtistasDetalhados(1L)).thenReturn(Optional.of(banda));

        BandaResponseDTO dto = bandaService.obterBandaPorId(1L);

        assertThat(dto.getIdBanda()).isEqualTo(1L);
        assertThat(dto.getArtistas()).hasSize(1);
        assertThat(dto.getArtistas().get(0).getNomeArtista()).isEqualTo("Artista X");
    }

    private BandaModel buildBanda(Long id, String nome) {
        BandaModel banda = new BandaModel();
        banda.setIdBanda(id);
        banda.setNomeBanda(nome);
        banda.setDataCriacao(LocalDateTime.now());
        banda.setDataAtualizacao(LocalDateTime.now());
        return banda;
    }

    private ArtistaModel buildArtista(Long id, String nome) {
        ArtistaModel artista = new ArtistaModel();
        artista.setIdArtista(id);
        artista.setNomeArtista(nome);
        return artista;
    }

    private BandaArtistaModel buildVinculo(BandaModel banda, ArtistaModel artista) {
        BandaArtistaModel vinculo = new BandaArtistaModel();
        vinculo.setId(new BandaArtistaId(banda.getIdBanda(), artista.getIdArtista()));
        vinculo.setBanda(banda);
        vinculo.setArtista(artista);
        return vinculo;
    }
}
