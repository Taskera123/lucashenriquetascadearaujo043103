package artistalbum.domain.artista.service;

import com.seplag.artistalbum.domain.album.model.AlbumCapaModel;
import com.seplag.artistalbum.domain.album.model.AlbumModel;
import com.seplag.artistalbum.domain.album.repository.AlbumRepository;
import com.seplag.artistalbum.domain.artista.dto.ArtistaDTO;
import com.seplag.artistalbum.domain.artista.model.ArtistaModel;
import com.seplag.artistalbum.domain.artista.repository.ArtistaRepository;
import com.seplag.artistalbum.domain.artista.service.ArtistaService;
import com.seplag.artistalbum.domain.banda.model.BandaArtistaId;
import com.seplag.artistalbum.domain.banda.model.BandaArtistaModel;
import com.seplag.artistalbum.domain.banda.model.BandaModel;
import com.seplag.artistalbum.domain.banda.repository.BandaArtistaRepository;
import com.seplag.artistalbum.shared.service.MinioService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ArtistaServiceTest {

    @Mock
    private ArtistaRepository artistaRepository;

    @Mock
    private AlbumRepository albumRepository;

    @Mock
    private BandaArtistaRepository bandaArtistaRepository;

    @Mock
    private MinioService minioService;

    @Mock
    private SimpMessagingTemplate messagingTemplate;

    @InjectMocks
    private ArtistaService artistaService;

    @Test
    void obterTodosArtistasIncluiAlbunsEBandas() throws Exception {
        ArtistaModel artista = buildArtista(1L, "Artista A");
        AlbumModel album = buildAlbum(11L, "Album A", artista, "album-covers/11/capa.png");
        BandaModel banda = buildBanda(21L, "Banda X");
        BandaArtistaModel vinculo = buildVinculo(banda, artista);

        when(artistaRepository.findAllOrderByNomeAsc(any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(artista)));
        when(albumRepository.findByArtista_IdArtistaOrderByTituloAlbumAsc(artista.getIdArtista()))
                .thenReturn(List.of(album));
        when(bandaArtistaRepository.findByArtistaIdWithBanda(artista.getIdArtista()))
                .thenReturn(List.of(vinculo));
        when(minioService.generatePresignedUrl30Min("album-covers/11/capa.png"))
                .thenReturn("signed-url");

        Page<ArtistaDTO> resultado = artistaService.obterTodosArtistas(PageRequest.of(0, 10), "asc");

        assertThat(resultado.getContent()).hasSize(1);
        ArtistaDTO dto = resultado.getContent().get(0);
        assertThat(dto.getNome()).isEqualTo("Artista A");
        assertThat(dto.getAlbuns()).hasSize(1);
        assertThat(dto.getAlbuns().get(0).getUrlImagemCapa()).isEqualTo("/v1/albums/11/capa");
        assertThat(dto.getAlbuns().get(0).getUrlImagemCapaAssinada()).isEqualTo("signed-url");
        assertThat(dto.getBandas()).hasSize(1);
        assertThat(dto.getBandas().get(0).getNomeBanda()).isEqualTo("Banda X");
    }

    private ArtistaModel buildArtista(Long id, String nome) {
        ArtistaModel artista = new ArtistaModel();
        artista.setIdArtista(id);
        artista.setNomeArtista(nome);
        artista.setDataCriacao(LocalDateTime.now());
        artista.setDataAtualizacao(LocalDateTime.now());
        return artista;
    }

    private AlbumModel buildAlbum(Long id, String titulo, ArtistaModel artista, String capa) {
        AlbumModel album = new AlbumModel();
        album.setIdAlbum(id);
        album.setTituloAlbum(titulo);
        album.setArtista(artista);
        if (capa != null) {
            album.getCapas().add(new AlbumCapaModel(album, capa));
        }
        album.setDataCriacao(LocalDateTime.now());
        album.setDataAtualizacao(LocalDateTime.now());
        return album;
    }

    private BandaModel buildBanda(Long id, String nome) {
        BandaModel banda = new BandaModel();
        banda.setIdBanda(id);
        banda.setNomeBanda(nome);
        banda.setDataCriacao(LocalDateTime.now());
        banda.setDataAtualizacao(LocalDateTime.now());
        return banda;
    }

    private BandaArtistaModel buildVinculo(BandaModel banda, ArtistaModel artista) {
        BandaArtistaModel vinculo = new BandaArtistaModel();
        vinculo.setId(new BandaArtistaId(banda.getIdBanda(), artista.getIdArtista()));
        vinculo.setBanda(banda);
        vinculo.setArtista(artista);
        return vinculo;
    }
}
