package artistalbum.domain.album.service;

import com.seplag.artistalbum.domain.album.dto.AlbumDTO;
import com.seplag.artistalbum.domain.album.model.AlbumCapaModel;
import com.seplag.artistalbum.domain.album.model.AlbumModel;
import com.seplag.artistalbum.domain.album.repository.AlbumCapaRepository;
import com.seplag.artistalbum.domain.album.repository.AlbumRepository;
import com.seplag.artistalbum.domain.album.service.AlbumService;
import com.seplag.artistalbum.domain.artista.model.ArtistaModel;
import com.seplag.artistalbum.shared.service.MinioService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
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
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AlbumServiceTest {

    @Mock
    private AlbumRepository albumRepository;

    @Mock
    private AlbumCapaRepository albumCapaRepository;

    @Mock
    private MinioService minioService;

    @Mock
    private SimpMessagingTemplate messagingTemplate;

    @InjectMocks
    private AlbumService albumService;

    @Test
    void listarTodosAlbunsOrdenaAscendente() throws Exception {
        AlbumModel album = buildAlbum(1L, "Album A", "album-covers/1/capa.png");
        when(albumRepository.findAll(any(Pageable.class))).thenReturn(new PageImpl<>(List.of(album)));
        when(minioService.generatePresignedUrl30Min("album-covers/1/capa.png")).thenReturn("signed-url");

        Page<AlbumDTO> resultado = albumService.listarTodosAlbuns(PageRequest.of(0, 10), "asc");

        ArgumentCaptor<Pageable> captor = ArgumentCaptor.forClass(Pageable.class);
        verify(albumRepository).findAll(captor.capture());
        Pageable pageable = captor.getValue();

        assertThat(pageable.getSort().getOrderFor("tituloAlbum")).isNotNull();
        assertThat(pageable.getSort().getOrderFor("tituloAlbum").isAscending()).isTrue();
        assertThat(resultado.getContent()).hasSize(1);
        assertThat(resultado.getContent().get(0).getUrlImagemCapa()).isEqualTo("/v1/albums/1/capa");
        assertThat(resultado.getContent().get(0).getUrlImagemCapaAssinada()).isEqualTo("signed-url");
    }

    @Test
    void listarTodosAlbunsOrdenaDescendente() {
        AlbumModel album = buildAlbum(2L, "Album Z", null);
        when(albumRepository.findAll(any(Pageable.class))).thenReturn(new PageImpl<>(List.of(album)));

        Page<AlbumDTO> resultado = albumService.listarTodosAlbuns(PageRequest.of(1, 5), "desc");

        ArgumentCaptor<Pageable> captor = ArgumentCaptor.forClass(Pageable.class);
        verify(albumRepository).findAll(captor.capture());
        Pageable pageable = captor.getValue();

        assertThat(pageable.getPageNumber()).isEqualTo(1);
        assertThat(pageable.getPageSize()).isEqualTo(5);
        assertThat(pageable.getSort().getOrderFor("tituloAlbum")).isNotNull();
        assertThat(pageable.getSort().getOrderFor("tituloAlbum").isDescending()).isTrue();
        assertThat(resultado.getContent()).extracting(AlbumDTO::getTitulo).containsExactly("Album Z");
    }

    private AlbumModel buildAlbum(Long id, String titulo, String capa) {
        ArtistaModel artista = new ArtistaModel();
        artista.setIdArtista(10L);
        artista.setNomeArtista("Artista X");

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
}
